import { NextResponse } from "next/server";
import { teiEmbed, weaviateREST } from "@/lib/weaviate";
import { PRODUCTS } from "@/lib/products";

export async function POST() {
  try {
    // Delete existing collection if it exists
    try {
      await weaviateREST("/v1/schema/Product", { method: "DELETE" });
    } catch {
      // Collection might not exist, that's fine
    }

    // Create Product collection
    await weaviateREST("/v1/schema", {
      method: "POST",
      body: JSON.stringify({
        class: "Product",
        vectorizer: "none",
        vectorIndexConfig: {
          distance: "cosine",
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
          },
          { name: "description", dataType: ["text"] },
        ],
      }),
    });

    // Generate embeddings and insert products
    let inserted = 0;
    for (const product of PRODUCTS) {
      const text = `${product.name} ${product.brand} ${product.color} ${product.category} ${product.description}`;
      const vector = await teiEmbed(text);

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
          vector,
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
