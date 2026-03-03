import { NextRequest, NextResponse } from "next/server";
import { weaviateGraphQL } from "@/lib/weaviate";

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    // Build chat history context for the prompt
    const historyContext = (history || [])
      .slice(-6)
      .map((h: { role: string; content: string }) => `${h.role}: ${h.content}`)
      .join("\\n");

    const prompt = esc(
      `You are a helpful shopping assistant for Weaviate Shop. Answer using ONLY the product data below. Be concise and friendly (2-4 sentences). Mention product names and prices with $ symbol.${
        historyContext ? `\n\nChat history:\n${historyContext}` : ""
      }\n\nCustomer question: ${message}\n\nAnswer based on the products found:`
    );

    // Single Weaviate query: search + generate via generative-ollama module
    const graphql = `{
      Get {
        Product(
          nearText: { concepts: ["${esc(message)}"] }
          limit: 5
        ) {
          name brand color category price description
          _additional { distance }
          _additional {
            generate(
              groupedResult: {
                task: "${prompt}"
              }
            ) {
              groupedResult
              error
            }
          }
        }
      }
    }`;

    const weaviateResult = await weaviateGraphQL(graphql);
    const products = weaviateResult?.data?.Get?.Product || [];

    // Extract the generated response
    const generateResult = products[0]?._additional?.generate;
    const reply = generateResult?.groupedResult
      || generateResult?.error
      || "Sorry, I couldn't generate a response.";

    // Clean products for response (remove _additional.generate)
    const cleanProducts = products.map((p: Record<string, unknown>) => {
      const additional = p._additional as Record<string, unknown> | undefined;
      return {
        ...p,
        _additional: { distance: additional?.distance },
      };
    });

    return NextResponse.json({ reply, products: cleanProducts });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
