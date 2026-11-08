# PricePulse — AWS integration package

This package contains:
- Your original Next.js frontend (UI preserved)
- A frontend compatibility fix for the AWS products response
- A consolidated Node.js Lambda handler at `aws-lambda/index.mjs`
- Setup and verification instructions

## Current architecture

`Browser → API Gateway HTTP API → Lambda (pricepulse-api) → S3`

**S3 is the application persistence layer.** This Lambda does not connect to RDS or require a VPC.

Current S3 object locations:
- Current product catalog: `pricepulse/bronze/app-data/products.json`
- Transaction records: `pricepulse/bronze/transactions/YYYY-MM-DD/<transaction-id>.json`
- Price changes: `pricepulse/bronze/price-history/YYYY-MM-DD/<event-id>.json`
- Inventory adjustments: `pricepulse/bronze/inventory-events/YYYY-MM-DD/<event-id>.json`
- Other event records: `pricepulse/bronze/<resource>/YYYY-MM-DD/<record-id>.json`

## Important: this is not a claim that every UI module is fully wired

The package supplies backend routes for the data entities and fixes AWS product/transaction loading. The existing interface has some demo-only controls and some planned service integrations. Bedrock and SageMaker routes intentionally return HTTP 501 until those AWS services are configured; they do not return fabricated AI/forecast results. Before presenting this as a fully production-ready system, the remaining UI actions must be individually connected and tested against these endpoints.

## Deploy the Lambda handler

1. Open AWS Lambda → `pricepulse-api`.
2. Choose **Code** → open `index.mjs`.
3. Replace the contents with `aws-lambda/index.mjs`.
4. Click **Deploy**.
5. Confirm the existing environment variable `S3_BUCKET=businessanalytics-pricepulse` is set.
6. Keep the existing S3 permissions on the Lambda execution role. It needs `s3:GetObject`, `s3:PutObject`, and `s3:ListBucket` for the PricePulse prefixes.
7. Do **not** attach the Lambda to a VPC for this S3-only application.

The Lambda uses the AWS SDK v3 package available in the Node.js Lambda runtime. If you get `Cannot find package @aws-sdk/client-s3`, package the SDK with the Lambda deployment instead of assuming it is present.

## API routes supported by the handler

| Method | Route | Behavior |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/products` | Reads the current S3 product catalog (raw array) |
| POST | `/products` | Creates a product |
| PUT | `/products/{id}` | Updates product details |
| DELETE | `/products/{id}` | Deletes a product |
| POST | `/products/{id}/price` | Updates price and writes a separate history event |
| GET | `/transactions` | Lists transaction JSON records |
| POST | `/transactions` | Persists a transaction and deducts its item quantities from product stock |
| POST | `/ingestion/products` | Bulk upserts products and writes an ingestion audit event |
| GET/POST | `/customers` | Read/write customer event records |
| GET/POST | `/suppliers` | Read/write supplier event records |
| GET/POST | `/promotions` | Read/write promotion event records |
| GET/POST | `/returns` | Read/write return event records |
| GET/POST | `/inventory-events` | Read/write inventory adjustment events; POST also updates product stock |
| GET/POST | `/app-events` | Read/write app event records |
| GET/POST | `/competitor-prices` | Read/write competitor price records |
| GET | `/analytics/summary` | Basic summary derived from S3 products and transactions |
| POST | `/assistant/query` | Returns 501 until Bedrock is configured |
| POST | `/forecast` | Returns 501 until SageMaker/forecasting is configured |

Routes must exist in API Gateway and point to `pricepulse-api`. For HTTP API with a `$default` route, requests can be routed directly to the Lambda. If you have explicit routes, add the methods/paths above or use a `$default` route.

## Frontend configuration

In PricePulse Settings:
- Set mode to **AWS**
- Set API base URL to the API Gateway invoke URL, with no trailing slash
- Click the API connection test

Or use `.env.example` as a reference for `NEXT_PUBLIC_API_BASE_URL`, then restart Next.js after changing environment variables.

## Run the frontend locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run start
```

## Verification checklist

1. `GET <API_BASE>/health` returns `status: healthy`.
2. `GET <API_BASE>/products` returns the product catalog.
3. Add a product in AWS mode; confirm it appears in `pricepulse/bronze/app-data/products.json`.
4. Change its price; confirm the catalog price changes and a new object appears under `pricepulse/bronze/price-history/`.
5. Complete POS checkout; confirm a transaction object appears under `pricepulse/bronze/transactions/` and stock decreases in `products.json`.
6. Refresh the frontend while in AWS mode; products and transactions should reload from API.

## Prototype limitations and data notes

- Current products are stored in a single JSON catalog object. This is simple for a capstone demo but is not safe for high-concurrency production writes: simultaneous edits can overwrite one another.
- Transaction, price history, and other event records are stored as individual JSON objects, which is friendlier for Glue/Athena ingestion.
- The handler scans event prefixes for GET list routes. This is suitable for a small prototype; for large datasets, use Athena/query APIs or a pagination/indexing design.
- CORS `*` is development-only. For a deployed public frontend, restrict allowed origins to your frontend domain.
- This is a demo API, not production-hardened authentication/authorization. Add Cognito or another auth provider and API Gateway authorization before exposing it publicly.
- CSV import currently uses a simple split-based parser; CSV values containing embedded commas/quotes need a robust parser before production use.
