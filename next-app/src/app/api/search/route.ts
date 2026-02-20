import { NextRequest, NextResponse } from "next/server";
import { teiEmbed, weaviateGraphQL, buildSearchQuery } from "@/lib/weaviate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const queryText: string = body.query || "";
    const mode: string = body.mode || "hybrid";
    const filters = body.filters || {};
    const limit: number = body.limit || 10;

    let vector: number[] | null = null;
    if (mode !== "bm25") {
      vector = await teiEmbed(queryText);
    }

    const graphql = buildSearchQuery(queryText, mode, vector, filters, limit);

    const data = await weaviateGraphQL(graphql);
    return NextResponse.json({ results: data, graphql, mode });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
