# Weaviate Shop

A fake e-commerce app that demonstrates how Weaviate's hybrid search handles natural language product queries. Built as a hands-on demo for my Weaviate Solution Engineer application.

## What it does

Try searching `Blue iPhone below $500`. In **Standard Search** mode, the whole string gets dumped into Weaviate's hybrid search as-is. "below $500" is treated as text, not a filter, so you get $999 iPhones, $1399 Pro Max models — basically anything that vaguely matches.

Switch to **Smart Search** and the app parses the query first: it extracts the price constraint, sends only `"Blue iPhone"` as the semantic query, and passes `price < 500` as a Weaviate metadata filter. You only see relevant results.

That's the whole point: showing that hybrid search alone isn't enough when users express constraints in natural language. You need to combine it with structured filters.

## The app

- Search bar with live query parsing
- Toggle to switch between standard/smart search and see the difference in real time
- Product cards with category emojis, color dots, prices, relevance scores
- Full (fake) shopping flow: cart, checkout, order confirmation
- "Behind the scenes" sidebar that shows the actual GraphQL query sent to Weaviate

## Tech

Everything runs in Docker Compose with three services:

**Next.js** — single codebase for both the frontend (React, Tailwind) and the API layer. The API routes build GraphQL queries and call Weaviate's `/v1/graphql` endpoint. Having frontend and backend in the same project keeps things simple — one language, one deploy, no CORS headaches.

**Weaviate** — vector database with API key auth and the `text2vec-transformers` module enabled. Vectorization happens automatically at ingestion and query time — no manual embedding calls needed. Stores 23 products with 384-dim embeddings.

**t2v-transformers** — Weaviate's official transformer inference container running `all-MiniLM-L6-v2`. Weaviate delegates vectorization to this service transparently via the `text2vec-transformers` module.

## Running it

You need Docker and Docker Compose.

```bash
docker compose up --build -d
```

Wait for the transformer model to load on first run, then open `http://localhost:3000`.

### Seeding the database

Hit the "Seed Products" button in the UI, or:

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates the `Product` collection in Weaviate and inserts 23 products. Weaviate vectorizes them automatically using text2vec-transformers.

### Stopping

```bash
docker compose down        # keeps data
docker compose down -v     # wipes everything
```

## Project structure

```
docker-compose.yml
next-app/
  src/
    app/
      page.tsx              → main UI (search, cart, checkout)
      api/search/route.ts   → hybrid search endpoint
      api/seed/route.ts     → DB seeding
      api/chat/route.ts     → RAG chat (Groq + Weaviate)
      api/meta/route.ts     → Weaviate metadata
    lib/
      weaviate.ts           → GraphQL query builder + Weaviate helpers
      products.ts           → seed data (23 products)
```
