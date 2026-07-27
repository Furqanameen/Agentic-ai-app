# Supplier AI Agent - Development Rules

## Architecture

- Next.js App Router is located in /app.
- Reusable React components belong in /src/components.
- AI and Agent logic belongs in /src/lib/ai.
- Agent tools belong in /src/lib/tools.
- Database access belongs in /src/lib/db.ts.
- Prisma schema belongs in /prisma.
- Do not create duplicate app directories.
- Do not put business logic inside React components.
- Keep AI provider integrations isolated from business logic.

## AI

The local development model is:

Ollama
Model: llama3.2:3b

Do not call external AI APIs unless explicitly requested.

## Agent

The Agent should use tools for:

1. Searching cars
2. Searching spare parts
3. Searching suppliers
4. Searching supplier prices
5. Comparing prices
6. Generating customer estimates