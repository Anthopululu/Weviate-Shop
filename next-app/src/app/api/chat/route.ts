import { NextRequest, NextResponse } from "next/server";
import { weaviateGraphQL } from "@/lib/weaviate";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    // 1. Search Weaviate for relevant products using nearText (auto-vectorized)
    const graphql = `{
      Get {
        Product(
          nearText: { concepts: ["${esc(message)}"] }
          limit: 5
        ) {
          name brand color category price description
          _additional { distance }
        }
      }
    }`;

    const weaviateResult = await weaviateGraphQL(graphql);
    const products = weaviateResult?.data?.Get?.Product || [];

    // 2. Build context from retrieved products
    const context = products
      .map(
        (p: Record<string, unknown>, i: number) =>
          `${i + 1}. ${p.name} — ${p.brand}, ${p.color}, $${p.price}\n   ${p.description}`
      )
      .join("\n");

    // 3. Build messages for Groq
    const systemPrompt = `You are a helpful shopping assistant for Weaviate Shop, an e-commerce demo powered by Weaviate vector search.
Answer customer questions about products using ONLY the product data provided below. Be concise, friendly, and helpful.
If the answer isn't in the data, say so honestly. Always mention specific product names and prices when relevant.
Format prices with $ symbol. Keep responses short (2-4 sentences max).

AVAILABLE PRODUCTS:
${context || "No products found matching this query."}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-6),
      { role: "user", content: message },
    ];

    // 4. Call Groq API
    if (!GROQ_API_KEY) {
      return NextResponse.json({
        reply: `Based on your query, I found these products:\n${context || "No matching products."}`,
        products,
      });
    }

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq error ${groqRes.status}: ${errText}`);
    }

    const groqData = await groqRes.json();
    const reply = groqData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply, products });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
