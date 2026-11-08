import {
  S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command
} from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const BUCKET = process.env.S3_BUCKET;
const PRODUCTS_KEY = "pricepulse/bronze/app-data/products.json";
const HEADERS = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
};

const response = (statusCode, data) => ({
  statusCode, headers: HEADERS, body: JSON.stringify(data)
});
const bodyOf = (event) => {
  try { return JSON.parse(event.body || "{}"); }
  catch { throw new Error("Request body must be valid JSON"); }
};
const getPath = (event) => event.rawPath || "/";
const methodOf = (event) => event.requestContext?.http?.method || "GET";
const nowIso = () => new Date().toISOString();
const safeSegment = (s) => String(s).replace(/[^a-zA-Z0-9._-]/g, "_");

async function readJson(key, fallback = []) {
  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return JSON.parse(await obj.Body.transformToString());
  } catch (e) {
    if (e.name === "NoSuchKey" || e.name === "NotFound") return fallback;
    throw e;
  }
}
async function writeJson(key, data) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: JSON.stringify(data, null, 2),
    ContentType: "application/json"
  }));
}
async function appendRecord(type, record) {
  const day = nowIso().slice(0, 10);
  const key = `pricepulse/bronze/${type}/${day}/${safeSegment(record.id || record.eventId || Date.now())}.json`;
  await writeJson(key, record);
  return key;
}
async function listRecords(type, limit = 1000) {
  const prefix = `pricepulse/bronze/${type}/`;
  const keys = [];
  let token;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET, Prefix: prefix, ContinuationToken: token
    }));
    for (const o of (res.Contents || [])) if (o.Key?.endsWith(".json")) keys.push(o.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token && keys.length < limit);
  const rows = [];
  for (const key of keys.slice(-limit)) {
    const row = await readJson(key, null);
    if (row) rows.push(row);
  }
  return rows.sort((a,b) => String(b.createdAt || b.date || b.eventTime || "").localeCompare(String(a.createdAt || a.date || a.eventTime || "")));
}
async function readProducts() { return readJson(PRODUCTS_KEY, []); }
async function saveProducts(rows) { await writeJson(PRODUCTS_KEY, rows); }
const getId = (event) => event.pathParameters?.id || decodeURIComponent(getPath(event).split("/").filter(Boolean).at(-1) || "");
const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

export const handler = async (event) => {
  const method = methodOf(event), path = getPath(event);
  try {
    if (method === "OPTIONS") return response(200, {});
    if (method === "GET" && path.endsWith("/health")) {
      return response(200, { status:"healthy", service:"PricePulse API", storage:"Amazon S3", timestamp:nowIso() });
    }

    // Product catalog: mutable current-state snapshot in S3.
    if (path.endsWith("/products") && method === "GET") return response(200, await readProducts());
    if (path.endsWith("/products") && method === "POST") {
      const payload = bodyOf(event), rows = await readProducts();
      if (!payload.name) return response(400, { error:"Product name is required" });
      const product = { ...payload, id:payload.id || newId("prod"), createdAt:nowIso() };
      rows.push(product); await saveProducts(rows); return response(201, product);
    }
    const productMatch = path.match(/\/products\/([^/]+)$/);
    if (productMatch && method === "PUT") {
      const id = decodeURIComponent(productMatch[1]), payload = bodyOf(event), rows = await readProducts();
      const i = rows.findIndex(p => p.id === id);
      if (i < 0) return response(404, { error:"Product not found", id });
      rows[i] = { ...rows[i], ...payload, id, updatedAt:nowIso() };
      await saveProducts(rows); return response(200, rows[i]);
    }
    if (productMatch && method === "DELETE") {
      const id = decodeURIComponent(productMatch[1]), rows = await readProducts();
      const next = rows.filter(p => p.id !== id);
      if (next.length === rows.length) return response(404, { error:"Product not found", id });
      await saveProducts(next); return response(200, { deleted:id });
    }
    const priceMatch = path.match(/\/products\/([^/]+)\/price$/);
    if (priceMatch && method === "POST") {
      const id = decodeURIComponent(priceMatch[1]), payload = bodyOf(event);
      const price = Number(payload.price ?? payload.newPrice);
      if (!Number.isFinite(price) || price < 0) return response(400, { error:"Valid non-negative price required" });
      const rows = await readProducts(), product = rows.find(p => p.id === id);
      if (!product) return response(404, { error:"Product not found", id });
      const oldPrice = Number(product.price);
      product.price = price; product.updatedAt = nowIso();
      const evt = { eventId:newId("price"), productId:id, productName:product.name, oldPrice, newPrice:price, priceDifference:price-oldPrice, reason:payload.reason || "Manual price update", eventType:"PRICE_CHANGE", eventTime:nowIso() };
      await saveProducts(rows);
      const historyKey = await appendRecord("price-history", evt);
      return response(200, { message:"Price updated", product, priceEvent:evt, historyKey });
    }

    // Transactions: append-only event objects.
    if (path.endsWith("/transactions") && method === "GET") return response(200, { transactions:await listRecords("transactions") });
    if (path.endsWith("/transactions") && method === "POST") {
      const payload = bodyOf(event), record = { ...payload, id:payload.id || newId("TX"), transactionId:payload.transactionId || payload.id || newId("TX"), createdAt:nowIso() };
      const key = await appendRecord("transactions", record);
      // Inventory deduction is reflected in current products snapshot.
      const products = await readProducts();
      for (const line of (record.items || [])) {
        const p = products.find(x => x.id === line.productId);
        if (p) p.stock = Math.max(0, Number(p.stock || 0) - Number(line.qty || 0));
      }
      await saveProducts(products);
      return response(201, { ...record, storageKey:key });
    }

    // Bulk product CSV/JSON ingestion from the app.
    if (path.endsWith("/ingestion/products") && method === "POST") {
      const payload = bodyOf(event), incoming = Array.isArray(payload.products) ? payload.products : [];
      const existing = await readProducts();
      const byId = new Map(existing.map(p => [p.id, p]));
      let added = 0, updated = 0;
      for (const p of incoming) {
        if (!p.name) continue;
        const id = p.id || newId("import");
        if (byId.has(id)) updated++; else added++;
        byId.set(id, { ...byId.get(id), ...p, id, updatedAt:nowIso() });
      }
      const products = [...byId.values()]; await saveProducts(products);
      const audit = { id:newId("ingest"), filename:payload.filename || "upload", recordCount:incoming.length, added, updated, timestamp:nowIso() };
      const key = await appendRecord("ingestion-events", audit);
      return response(200, { ...audit, storageKey:key });
    }

    // Generic append-only resource APIs. Return individual S3 JSON files.
    const resources = ["customers","suppliers","promotions","returns","inventory-events","app-events","competitor-prices"];
    const resource = resources.find(r => path.endsWith(`/${r}`));
    if (resource && method === "GET") return response(200, { [resource.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]: await listRecords(resource) });
    if (resource && method === "POST") {
      const payload = bodyOf(event);
      const record = { ...payload, id:payload.id || newId(resource), createdAt:nowIso() };
      const key = await appendRecord(resource, record);
      if (resource === "inventory-events") {
        const products = await readProducts(), p = products.find(x => x.id === record.productId);
        if (p) { p.stock = Math.max(0, Number(p.stock || 0) + Number(record.quantityChange || record.adjustment || 0)); p.updatedAt=nowIso(); await saveProducts(products); }
      }
      return response(201, { ...record, storageKey:key });
    }

    // Minimal data-driven summary for dashboard.
    if (path.endsWith("/analytics/summary") && method === "GET") {
      const [products, transactions] = await Promise.all([readProducts(), listRecords("transactions")]);
      const revenue = transactions.reduce((s,t)=>s+Number(t.total||0),0);
      const units = transactions.reduce((s,t)=>s+(t.items||[]).reduce((n,i)=>n+Number(i.qty||0),0),0);
      return response(200, { productCount:products.length, transactionCount:transactions.length, revenue, unitsSold:units, lowStock:products.filter(p=>Number(p.stock||0)<=Number(p.reorder||0)).length, generatedAt:nowIso() });
    }

    // AI and predictive services need separate model/service setup; don't fake success.
    if (path.endsWith("/assistant/query") || path.endsWith("/forecast")) {
      return response(501, { error:"Not configured", message:"Bedrock/SageMaker integration is not configured yet." });
    }

    return response(404, { error:"Route not found", method, path });
  } catch (error) {
    console.error("PricePulse API error", error);
    return response(500, { error:"Internal server error", message:error.message });
  }
};
