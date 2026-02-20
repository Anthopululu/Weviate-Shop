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

**Weaviate** — vector database with API key auth, no vectorizer module (BYOV). Stores 23 products with 384-dim embeddings.

**TEI** — HuggingFace's Text Embeddings Inference running `all-MiniLM-L6-v2` on CPU. Handles vectorization as a separate service so the app doesn't need ML dependencies.

## Running it

You need Docker and Docker Compose.

```bash
docker compose up --build -d
```

Wait a minute for TEI to download the model on first run, then open `http://localhost:3000`.

### Seeding the database

Hit the "Seed Products" button in the UI, or:

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates the `Product` collection in Weaviate and inserts 23 products with pre-computed embeddings.

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
      api/meta/route.ts     → Weaviate metadata
    lib/
      weaviate.ts           → GraphQL query builder + TEI client
      products.ts           → seed data (23 products)
```
