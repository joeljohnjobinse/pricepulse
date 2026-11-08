# PricePulse Frontend — AWS-ready

A responsive Next.js 15 / React 19 / TypeScript retail intelligence frontend.

## Features
- Premium responsive retail SaaS UI (sidebar, workspace pages, dashboard metrics/charts).
- Overview dashboard, POS checkout and receipt, product management, pricing & competitor comparisons, activity timeline, data ingestion, data lake/pipeline, analytics, forecast UI, AI assistant UI, settings.
- Preserves the original seeded product catalog (`p1`–`p12`) and seed transaction records.
- Demo mode persists product and transaction changes in browser localStorage.
- AWS mode uses an API Gateway base URL and **does not fall back to demo/local data** on API failures.
- AWS checkout waits for backend confirmation before displaying checkout success.
- CSV import/export and demo simulation tools.
- Currency and store/tax preferences.
- No AWS credentials or direct AWS SDK access in the browser.

## Requirements
- Node.js 20.9+ (Node 22 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Build
```bash
npm run build
```

## Deploy frontend
Deploy to Vercel (recommended) or another Next.js host:
1. Push the project to GitHub.
2. Import repository in Vercel.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Set `NEXT_PUBLIC_API_BASE_URL` to your API Gateway base URL when backend routes exist.
6. Redeploy after changing environment variables.

You may also use AWS Amplify Hosting for the Next.js frontend. This app is a standard Next.js App Router app.

## AWS connection setup
In Settings:
- Enter API Gateway base URL (e.g. `https://<api-id>.execute-api.<region>.amazonaws.com/prod`).
- Click **Test connection**; frontend expects `GET /health`.
- Switch to AWS mode after API is available.

The app also reads `NEXT_PUBLIC_API_BASE_URL` at runtime/build-time via environment. Settings overrides the base URL for the current browser.

### Planned API contract
These endpoints are intentionally not assumed to exist yet. Lambda/API Gateway will need to implement them.

| Method | Path | Purpose | Request / response |
|---|---|---|---|
| GET | `/health` | Health check | `{ "status": "ok" }` |
| GET | `/products` | Fetch product catalog | `{ "products": [...] }` |
| POST | `/products` | Create product | Product JSON |
| PUT | `/products/{id}` | Update product | Product JSON |
| DELETE | `/products/{id}` | Deactivate/delete product | — |
| POST | `/products/{id}/price` | Update price / append price event | `{ "price": number, "reason": string }` |
| POST | `/transactions` | Create simulated transaction | `{ id, date, items, subtotal, discount, tax, total, payment, storeName, currency }` |
| GET | `/transactions` | Fetch transaction history | `{ "transactions": [...] }` |
| POST | `/inventory/adjustments` | Inventory adjustment event | `{ productId, quantityDelta, reason }` |
| POST | `/ingestion/products` | CSV/product ingestion | `{ products: [...], filename }` |
| GET | `/analytics/overview` | Dashboard metrics | Metrics and series |
| GET | `/analytics` | Gold/Athena analytics | Analytics payload |
| GET | `/forecast?days=7` | SageMaker forecast | Forecast response |
| POST | `/assistant/query` | Bedrock assistant | `{ question }` → grounded answer + sources |
| GET | `/pipeline/status` | Glue / S3 pipeline status | Pipeline/job status |

### Important implementation notes
- Use S3 event records for simulated transactions, inventory changes, price changes, and product events. Suggested object layout:
  `pricepulse/simulation/<event_type>/date=YYYY-MM-DD/<event_id>.json`
- Do not overwrite one large JSON file on every action; append new objects/events.
- For data consistency, Lambda should validate payloads and generate server-side event IDs/timestamps.
- In AWS mode, an API error is surfaced to the user. No fake success is shown.
- At this stage, AWS data fetching (initial list hydration, analytics, AI, forecast) is a planned integration. The API client and environment settings are ready, but backend routes must be implemented before AWS mode is fully functional. Product write/checkout actions are guarded and do not mutate local demo state when AWS mode is selected.
- The browser must never receive database credentials, AWS access keys, or call RDS directly.
- Bedrock responses should be grounded in allowed Athena/Gold results, not unrestricted database access.
- Forecast numbers must come from SageMaker, not static placeholder data.
- Competitor price records are simulated and must be labeled accordingly.

## Seed data note
Seed product data and the original demo transactions remain in the frontend source. Dashboard numbers are computed from whichever transaction records are loaded in demo mode.
