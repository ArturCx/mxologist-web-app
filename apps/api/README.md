# Mxologist — API (backend)

The Mxologist **NestJS 11** API. Authentication via **Clerk** (JWT verification), data in **PostgreSQL** through **Prisma**. All routes live under the `/api` prefix.

> 📖 Full project documentation (what it is, academic context, architecture, stack, and deploy) lives in the **[root README](../../README.md)**.

## Modules

`auth` · `recipes` · `ingredients` · `ratings` · `favorites` · `recommendations` · `settings` · `prisma`

## Running locally

```bash
npm install            # at the monorepo root
npm run db:generate    # generate the Prisma Client
npm run db:migrate     # apply migrations
npm run dev:api        # → http://localhost:4000/api
```

## Environment variables (`.env`)

```env
DATABASE_URL=postgresql://...        # Neon (pooled, with -pooler) — runtime
DIRECT_URL=postgresql://...          # Neon (direct) — migrations
CLERK_SECRET_KEY=sk_test_...         # same Clerk instance as the frontend
WEB_APP_URL=http://localhost:3000    # frontend origin(s) for CORS (comma-separated list)
PORT=4000
```

## Deploy

**Railway** — configuration lives in **[`railway.json`](../../railway.json)** at the root: the build runs `prisma generate` + `nest build`; the start runs `prisma migrate deploy` + `node dist/main`.
