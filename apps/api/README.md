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

**Vercel** (project `mxologist-api`), with **Root Directory = `apps/api`**. The NestJS preset turns `src/main.ts` into a single Vercel Function, so there is no `nest build` step and no start command in production.

Configuration lives in **[`vercel.json`](./vercel.json)**. Its `buildCommand` runs from the repo root and does the two things the serverless runtime can't:

- `prisma generate` — on every build, because `packages/database/generated/` is gitignored.
- `prisma migrate deploy` — **only when `VERCEL_ENV=production`**. Preview deployments share the single Neon database, so they must never migrate it.

`PORT` is injected by Vercel; don't set it as a project environment variable. The other variables (`DATABASE_URL`, `DIRECT_URL`, `CLERK_SECRET_KEY`, `WEB_APP_URL`) are configured on the Vercel project.
