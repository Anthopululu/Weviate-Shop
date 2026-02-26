import { NextResponse } from "next/server";
import { weaviateREST } from "@/lib/weaviate";
import { PRODUCTS } from "@/lib/products";

export async function POST() {
  try {
    // Delete existing collection if it exists
    try {
      await weaviateREST("/v1/schema/Product", { method: "DELETE" });
    } catch {
      // Collection might not exist, that's fine
    }

    // Create Product collection with text2vec-transformers vectorizer
    await weaviateREST("/v1/schema", {
      method: "POST",
      body: JSON.stringify({
        class: "Product",
        vectorizer: "text2vec-transformers",
        vectorIndexConfig: {
          distance: "cosine",
        },
        moduleConfig: {
          "text2vec-transformers": {
            vectorizeClassName: false,
          },
        },
        properties: [
          { name: "name", dataType: ["text"] },
          { name: "brand", dataType: ["text"] },
          { name: "color", dataType: ["text"], indexFilterable: true },
          { name: "category", dataType: ["text"], indexFilterable: true },
          {
            name: "price",
            dataType: ["number"],
            indexFilterable: true,
            indexRangeFilterable: true,
            moduleConfig: {
              "text2vec-transformers": { skip: true },
            },
          },
          { name: "description", dataType: ["text"] },
        ],
      }),
    });

    // Insert products — Weaviate vectorizes automatically at ingestion
    let inserted = 0;
    for (const product of PRODUCTS) {
      await weaviateREST("/v1/objects", {
        method: "POST",
        body: JSON.stringify({
          class: "Product",
          properties: {
            name: product.name,
            brand: product.brand,
            color: product.color,
            category: product.category,
            price: product.price,
            description: product.description,
          },
        }),
      });
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} products`,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
