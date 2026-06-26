# @mxologist/database

Shared Prisma schema and generated client for the Mxologist monorepo.

- Schema: `prisma/schema.prisma`
- Generated client output: `./generated/client` (this package's `main`)
- Consumed by `apps/api` via `import { PrismaClient, FlavorTag } from '@mxologist/database'`

## Scripts

Run from the repo root:

```bash
npm run db:generate   # prisma generate
npm run db:migrate    # prisma migrate dev  (prompts for a name; "init" for the first)
```

`DATABASE_URL` is read from `packages/database/.env` (and `apps/api/.env` at runtime).

## ⚠️ Prisma version: pinned to 6.x (do not upgrade to 7 yet)

This package is intentionally on **Prisma 6.19.3** (CLI + `@prisma/client`).

### Why not Prisma 7

Prisma 7 requires **Node.js `^20.19 || ^22.12 || >=24.0`**. This environment runs
**Node v22.10.0**, and the `prisma@7` CLI has a `preinstall` guard that hard-fails
on unsupported Node — so `prisma@7` cannot be installed here. (`@prisma/client@7`
installs with only a warning, which can silently leave CLI/client mismatched —
avoid that.)

### The editor squiggle in `schema.prisma`

The Prisma **VS Code extension** may be on a 7.x build and validate with v7 rules,
flagging:

> The datasource property `url` is no longer supported in schema files…

This is a **false positive against our v6 toolchain** — the CLI (`db:generate`,
`db:migrate`) and the API build are unaffected. There is **no inline/per-line way**
to suppress a Prisma schema diagnostic. To clear it, align the extension:

- Extensions panel → **Prisma** (`Prisma.prisma`) → gear → **Install Specific
  Version…** → pick a **6.x** (e.g. `6.19.x`) → Reload.

Or just ignore it — it's cosmetic.

### When you DO move to Prisma 7 (after Node ≥ 22.12 / 24)

The v7 migration changes three things:

1. `url` is **removed** from the `datasource` block in `schema.prisma`.
2. The connection moves to a new **`prisma.config.ts`** (for Migrate).
3. `PrismaClient` takes a **driver adapter** in its constructor. For Neon (Postgres)
   on a long-running Nest server, use **`@prisma/adapter-pg`** + `pg`:

   ```ts
   import { PrismaClient } from '@mxologist/database';
   import { PrismaPg } from '@prisma/adapter-pg';

   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   const prisma = new PrismaClient({ adapter });
   ```

   (Driver adapters are GA in v7 — no `previewFeatures = ["driverAdapters"]` needed.)

Docs: https://pris.ly/d/config-datasource · https://pris.ly/d/prisma7-client-config
