# Weaviate Shop

Fake e-commerce app to demo Weaviate's hybrid search on natural language product queries, with a RAG chat assistant. Built for my Weaviate SE application.

## What it does

Search `Blue iPhone below $500`. In **Standard Search**, the whole string goes into hybrid search as-is. "below $500" is text, not a filter, so you get $999 iPhones back.

**Smart Search** parses the query first: extracts the price constraint, sends `"Blue iPhone"` as the semantic query, and passes `price < 500` as a metadata filter. Only relevant results show up.

There's also a **chat assistant**. Ask "what's a good gift for a runner?" and it searches the catalog via Weaviate then generates an answer with Llama 3.2. RAG, fully local.

## Why these choices

I wanted everything to run locally. No OpenAI key, no cloud calls, no cost per request.

### Weaviate

Hybrid search (BM25 + vector) built in, and the module system handles embedding and LLM calls internally. One GraphQL query can search + vectorize + generate. Less glue code to write. Single binary, no Redis/Postgres dependency, easy to Dockerize.

### MiniLM-L6-v2 (vectorizer)

Microsoft's sentence-transformers model via `text2vec-transformers`. 80MB, runs on CPU, 384-dim vectors. Good enough for semantic search on 23 products. Picked it over OpenAI ada-002 so people can clone and run without setting up accounts.

### Ollama + Llama 3.2 (3B)

Needed a generative model for the chat. 3B params fits in ~2GB RAM, runs on a laptop or a small EC2. Ollama handles the model download and serves the API. Weaviate calls it through `generative-ollama` so the chat endpoint is just one GraphQL query with `_additional { generate(groupedResult: ...) }`.

Could swap to GPT-4 via `generative-openai` (same API, config change only) but the point was to keep it 100% local.

### Next.js 14

Frontend + API routes in one framework. API routes call Weaviate's GraphQL endpoint, frontend renders results. No separate backend. Quickest way to get a working demo.

### Docker Compose

`docker compose up` and you're done. 4 services (Next.js, Weaviate, transformer model, Ollama) + a one-shot container that pulls Llama on first start.

## Features

- Search with standard/smart mode toggle
- Product cards with prices, colors, relevance scores
- RAG chat (generative-ollama)
- Cart, checkout, order confirmation (fake)
- GraphQL query viewer ("behind the scenes" sidebar)

## Run

```bash
docker compose up -d
```

First run pulls Llama 3.2 (~2GB) and loads the transformer model, takes a few minutes. Then go to `http://localhost:3000`.

### Seed

Button in the UI or:

```bash
curl -X POST http://localhost:3000/api/seed
```

Creates the `Product` collection (text2vec-transformers + generative-ollama) and inserts 23 products.

### Stop

```bash
docker compose down        # keeps data
docker compose down -v     # wipes everything
```

## Going to prod

Config change, not a rewrite:

- `text2vec-transformers` -> `text2vec-openai` (ada-002)
- `generative-ollama` -> `generative-openai` (GPT-4)
- Same queries, same app code

## Structure

```
docker-compose.yml
next-app/
  src/
    app/
      page.tsx              -> UI (search, cart, checkout, chat)
      api/search/route.ts   -> hybrid search
      api/seed/route.ts     -> seed DB (schema + products)
      api/chat/route.ts     -> RAG chat (generative-ollama)
      api/meta/route.ts     -> weaviate meta
    lib/
      weaviate.ts           -> graphql client
      products.ts           -> seed data (23 products)
```
