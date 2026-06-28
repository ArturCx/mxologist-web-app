<p align="center">
  <img src="apps/web/public/mxologist-wordmark-white-cream.svg" alt="Mxologist" width="340" />
</p>

<p align="center">
  <em>Discover the drinks you can make with the bottles you already have — and let the app learn your palate with every rating.</em>
</p>

<p align="center">
  <a href="https://mxologist-web.vercel.app/"><strong>🍸 Live app → mxologist-web.vercel.app</strong></a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
</p>

---

## 📖 About

**Mxologist** is a web cocktail app that cross-references the user's **home bar inventory** (the bottles and ingredients they own) with a recipe catalog, surfacing **what they can pour right now**, what's **almost there** (missing 1–2 ingredients), and **personalized recommendations** that evolve as the user rates drinks.

### 🎓 Academic context

This is a **graduate (postgraduate) project** whose research goal is to **train a neural network for recommendations**. The application acts as the **data-collection platform and baseline** for that training:

- Every interaction produces **palate signals** — ratings (1–10 scale), inventory, favorites, and the **flavor profile** (flavor tags) of the rated recipes.
- These signals form the **dataset** the neural network is trained on.
- The current version already ships a **baseline recommender** (content-based / flavor-tag similarity weighted by ratings), which serves as the **comparison baseline** and as the pipeline that generates the labeled data.

> In short: the app is both the product and the **research instrument** — it captures user behavior in a format ready to feed the neural model.

---

## ✨ Features

| Screen | What it does |
|---|---|
| **My Bar** | Manages the user's inventory from a catalog of ~293 ingredients (search, add/remove, pre-rendered "Explore options"). |
| **What Can I Make** | _Matching_ engine: splits recipes into **ready to pour** and **almost there** (missing a few ingredients), comparing by `ingredientId`. |
| **Recommended** | Palate-based recommendations + **flavor-profile** bars; favorites; horizontal _rails_. |
| **Recipe detail** | Ingredients, method, glass type, **convertible measures (mL/oz)**, rating (5 stars or 1–10), favorite, and the drink's **real photo**. |
| **Settings** | Theme (with live _preview_), language **EN/PT**, measurement unit, score type, age/sex. |

Other product details: **authentication** via Clerk, **EN/PT i18n** (both UI _and_ database content), animated loading **skeletons**, and a **responsive mobile** layout.

---

## 🏗️ Tech stack

| Layer | Technology |
|---|---|
| **Monorepo** | npm **workspaces** (`apps/*` + `packages/*`) |
| **Frontend** | **Next.js 16** (App Router, Turbopack) · **React 19** · **Clerk** (auth) · custom EN/PT i18n · inline design system ("Midnight Ink + brass") · `next/image` |
| **Backend** | **NestJS 11** · **@clerk/backend** (JWT verification) · `/api` global prefix · `ValidationPipe` |
| **Database / ORM** | **PostgreSQL** (Neon) · **Prisma 6** (`directUrl` for migrations + pooled connection at runtime) |
| **Language** | **TypeScript** end to end |
| **Data** | [TheCocktailDB](https://www.thecocktaildb.com/) dataset (~425 recipes, ~293 ingredients, hosted photos) |
| **Deploy** | **Vercel** (web) · **Railway** (API) · **Neon** (Postgres) |

---

## 🌐 Extra technical details

- **EN/PT i18n** — custom provider (`useT` → `{ t, lang, setLang }`); language persisted in the database (`UserSettings.language`) and mirrored in `localStorage`. Translates **both UI and database content** (ingredient names, instructions, drink names, glass types).
- **Measure conversion** — `1 oz = 30 mL`, `1 shot = 40 mL`, `1 cl = 10 mL`; mixed numbers become BR decimals (`1 1/2 → 1,5`) and textual units are translated/pluralized in the active language.
- **Skeletons** — shimmer placeholders (CSS keyframe) in place of "Loading…".
- **Responsiveness** — `useIsMobile` hook, `clamp()` on titles/spacing, and fluid grids for small screens.
- **Images** — drink photos via `next/image` with optimization/lazy loading.

---

## 🚀 Running locally

**Prerequisites:** Node ≥ 20, a Postgres database (local or Neon), and a [Clerk](https://clerk.com/) application.

```bash
# 1. Install dependencies (all workspaces)
npm install

# 2. Set up the .env files (Clerk keys + Postgres connection)

# 3. Database: generate the client + apply migrations
npm run db:generate
npm run db:migrate

# 4. Start the API and the web app (in separate terminals)
npm run dev:api      # NestJS  → http://localhost:4000/api
npm run dev:web      # Next.js → http://localhost:3000
```

---

## ☁️ Deploy

| Component | Platform | Notes |
|---|---|---|
| **Frontend** | **Vercel** | Root Directory = `apps/web` (the Next.js preset is auto-detected). |
| **Backend** | **Railway** | Uses `railway.json` at the root: build runs `prisma generate` + `nest build`; start runs `prisma migrate deploy` + `node dist/main`. |
| **Database** | **Neon** | Managed Postgres. |

---

<p align="center"><sub>Made with ☕ by ArturCx</sub></p>
