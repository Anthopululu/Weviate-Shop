const WEAVIATE_URL = process.env.WEAVIATE_URL || "http://localhost:8080";
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || "my-secret-weaviate-key-2024";

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function weaviateGraphQL(query: string) {
  const res = await fetch(`${WEAVIATE_URL}/v1/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEAVIATE_API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Weaviate error: ${res.status}`);
  return res.json();
}

export async function weaviateMeta() {
  const res = await fetch(`${WEAVIATE_URL}/v1/meta`, {
    headers: { Authorization: `Bearer ${WEAVIATE_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Weaviate error: ${res.status}`);
  return res.json();
}

export async function weaviateREST(path: string, options?: RequestInit) {
  const res = await fetch(`${WEAVIATE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEAVIATE_API_KEY}`,
      ...options?.headers,
    },
  });
  if (!res.ok && res.status !== 422) {
    throw new Error(`Weaviate REST error: ${res.status} ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

interface SearchFilters {
  price?: number;
  color?: string;
  category?: string;
}

export function buildSearchQuery(
  queryText: string,
  mode: string,
  filters: SearchFilters,
  limit: number
): string {
  let searchClause = "";
  let whereClause = "";

  if (mode === "bm25") {
    searchClause = `bm25: { query: "${esc(queryText)}" }`;
  } else if (mode === "vector") {
    searchClause = `nearText: { concepts: ["${esc(queryText)}"] }`;
  } else {
    // hybrid or hybrid_filtered
    searchClause = `hybrid: { query: "${esc(queryText)}" }`;
  }

  if (mode === "hybrid_filtered" && filters) {
    const conditions: string[] = [];
    if (filters.price) {
      conditions.push(
        `{ path: ["price"], operator: LessThan, valueNumber: ${filters.price} }`
      );
    }
    if (filters.color) {
      conditions.push(
        `{ path: ["color"], operator: Equal, valueText: "${esc(filters.color)}" }`
      );
    }
    if (filters.category) {
      conditions.push(
        `{ path: ["category"], operator: Equal, valueText: "${esc(filters.category)}" }`
      );
    }
    if (conditions.length === 1) {
      whereClause = `, where: ${conditions[0]}`;
    } else if (conditions.length > 1) {
      whereClause = `, where: { operator: And, operands: [${conditions.join(", ")}] }`;
    }
  }

  return `{
  Get {
    Product(
      ${searchClause}${whereClause}
      limit: ${limit}
    ) {
      name brand color category price description
      _additional { score distance }
    }
  }
}`;
}
