# Mxologist — Web (frontend)

The Mxologist **Next.js 16** (App Router) application. Talks to the NestJS API over HTTP and uses **Clerk** for authentication.

> 📖 Full project documentation (what it is, academic context, architecture, stack, and deploy) lives in the **[root README](../../README.md)**.

## Running locally

```bash
npm install            # at the monorepo root
npm run dev:web        # → http://localhost:3000
```

## Environment variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

In production, `NEXT_PUBLIC_API_URL` points to the API on Railway (`https://…/api`).

## Deploy

**Vercel**, with **Root Directory = `apps/web`** (the Next.js preset is auto-detected).
