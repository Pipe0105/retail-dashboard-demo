# Lumen Market · Retail Sales Dashboard (demo)

A sales and inventory dashboard for a fictional six-store grocery chain. Built as a portfolio piece to show the kind of internal tool I build for clients: KPIs, charts, filters, role-based access and Excel/PDF export on top of PostgreSQL.

**All data is synthetic.** Lumen Market is not a real company.

**Live demo:** https://lumen-market-demo.netlify.app
Demo accounts (password `demo1234`):

| Account                    | Role          | Sees                         |
| -------------------------- | ------------- | ---------------------------- |
| `admin@lumenmarket.demo`   | Admin         | All stores, store comparison |
| `manager@lumenmarket.demo` | Store manager | Downtown store only          |

## Features

- **KPIs with period-over-period change:** revenue, gross margin, average ticket, units sold, compared with the previous period of the same length.
- **Filters** by date range (presets or custom), store and category, kept in the URL so any view can be shared or bookmarked.
- **Charts:** revenue trend (daily, or weekly for ranges over 90 days) and revenue by category and store with margin.
- **Top products** and **low-stock alerts** ranked by days of cover (stock on hand ÷ average daily sales over the last 28 days).
- **Role-based access:** store managers are locked to their own store. The rule is enforced on the server when the filters are resolved, so editing the URL (`?store=2`) does not expose other stores.
- **Export** of the current view to Excel (one sheet per table, with number formats) and PDF.
- Responsive layout and dark mode.

## Stack

Next.js 15 (App Router, Server Components, Server Actions) · TypeScript · Tailwind CSS · PostgreSQL (Netlify Database) · Recharts · ExcelJS · jsPDF · JWT sessions with `jose` and `bcryptjs`.

## How it is organized

```
netlify/database/migrations/   SQL schema and deterministic seed data (applied on deploy)
src/middleware.ts              Blocks /dashboard for visitors without a valid session
src/lib/auth.ts                Signed HttpOnly session cookie (JWT, 8 h)
src/lib/queries.ts             All SQL; resolves filters and enforces the store scope
src/app/login/                 Login page and server actions (login / logout)
src/app/dashboard/page.tsx     Server component that loads data and lays out the page
src/components/                Filter bar, KPI cards, charts, tables, export buttons
```

Data model: `stores`, `categories`, `products`, `daily_sales` (one row per store, product and day), `store_daily_tickets`, `inventory`, `users`. All queries are parameterized.

## Running locally

Requirements: Node 20+ and PostgreSQL.

```bash
npm install
createdb retail
for f in netlify/database/migrations/*.sql; do psql -d retail -f "$f"; done

cat > .env.local <<EOF
LOCAL_DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/retail
AUTH_SECRET=$(openssl rand -hex 32)
EOF

npm run dev
```

## Deploying to Netlify

1. Connect the repository to a Netlify project.
2. Set the `AUTH_SECRET` environment variable (at least 32 random characters).
3. Deploy. Netlify provisions the database and applies the migrations automatically.

---

Built by Juan Felipe Gómez — full-stack developer (Next.js, TypeScript, PostgreSQL).
