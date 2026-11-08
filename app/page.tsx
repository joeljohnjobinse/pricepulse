"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Boxes,
  BrainCircuit, Check, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign,
  Clock3, Cloud, CloudUpload, Database, Download, FileText, Filter, Gauge,
  LayoutDashboard, LifeBuoy, Menu, Package, Plus, RefreshCw, Search, Settings,
  ShoppingBag, ShoppingCart, Sparkles, Tags, TrendingDown, TrendingUp, Truck,
  Upload, Wallet, X, Zap, Bot, CalendarDays, MoreHorizontal, Eye, Edit3,
  Trash2, Minus, Printer, RotateCcw, Send, Server, CheckCircle2, CircleAlert,
  LoaderCircle, ExternalLink, ArrowRight, ShieldCheck, Store, Layers3
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorder: number;
  competitor?: number;
};
type Tx = {
  id: string;
  date: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: string;
};
type Mode = "demo" | "aws";
type Page =
  | "Overview"
  | "POS & Billing"
  | "Transactions"
  | "Products & Inventory"
  | "Pricing & Competitors"
  | "Live Events"
  | "Data Ingestion"
  | "Data Lake & Pipeline"
  | "Analytics"
  | "SageMaker Forecasting"
  | "Bedrock Assistant"
  | "Settings";

const seedProducts: Product[] = [
  { id: "p1", name: "Organic Bananas", sku: "GRC-001", category: "Grocery", price: 2.49, cost: 1.15, stock: 124, reorder: 30, competitor: 2.59 },
  { id: "p2", name: "Whole Milk 1L", sku: "GRC-002", category: "Grocery", price: 3.29, cost: 1.8, stock: 48, reorder: 20, competitor: 3.19 },
  { id: "p3", name: "Sourdough Bread", sku: "BAK-014", category: "Bakery", price: 4.99, cost: 2.2, stock: 16, reorder: 18, competitor: 5.49 },
  { id: "p4", name: "Arabica Coffee 250g", sku: "BEV-032", category: "Beverages", price: 8.99, cost: 4.1, stock: 35, reorder: 12, competitor: 9.49 },
  { id: "p5", name: "Olive Oil 500ml", sku: "PAN-008", category: "Pantry", price: 12.49, cost: 7.25, stock: 22, reorder: 10, competitor: 11.99 },
  { id: "p6", name: "Dark Chocolate 70%", sku: "SNK-021", category: "Snacks", price: 3.79, cost: 1.4, stock: 89, reorder: 25, competitor: 3.99 },
  { id: "p7", name: "Greek Yogurt 400g", sku: "DAI-011", category: "Dairy", price: 5.49, cost: 2.7, stock: 9, reorder: 15, competitor: 5.29 },
  { id: "p8", name: "Free-range Eggs (12)", sku: "DAI-015", category: "Dairy", price: 6.99, cost: 3.4, stock: 41, reorder: 15, competitor: 7.19 },
  { id: "p9", name: "Sparkling Water 6-pack", sku: "BEV-044", category: "Beverages", price: 4.49, cost: 2.0, stock: 60, reorder: 18, competitor: 4.29 },
  { id: "p10", name: "Granola 500g", sku: "BRK-007", category: "Grocery", price: 7.99, cost: 3.6, stock: 27, reorder: 10, competitor: 8.49 },
  { id: "p11", name: "Dish Soap 750ml", sku: "HOM-031", category: "Household", price: 4.25, cost: 1.9, stock: 13, reorder: 12, competitor: 4.39 },
  { id: "p12", name: "Paper Towels 6-roll", sku: "HOM-037", category: "Household", price: 9.99, cost: 5.1, stock: 7, reorder: 10, competitor: 10.49 }
];

const seedTx: Tx[] = [
  { id: "TX-1048", date: new Date(Date.now() - 1000 * 60 * 12).toISOString(), items: [{ productId: "p1", name: "Organic Bananas", qty: 2, price: 2.49 }, { productId: "p4", name: "Arabica Coffee 250g", qty: 1, price: 8.99 }], subtotal: 13.97, discount: 0, tax: 1.12, total: 15.09, payment: "Card" },
  { id: "TX-1047", date: new Date(Date.now() - 1000 * 60 * 38).toISOString(), items: [{ productId: "p6", name: "Dark Chocolate 70%", qty: 3, price: 3.79 }], subtotal: 11.37, discount: 1, tax: 0.83, total: 11.2, payment: "Cash" },
  { id: "TX-1046", date: new Date(Date.now() - 1000 * 60 * 85).toISOString(), items: [{ productId: "p2", name: "Whole Milk 1L", qty: 2, price: 3.29 }, { productId: "p8", name: "Free-range Eggs (12)", qty: 1, price: 6.99 }], subtotal: 13.57, discount: 0, tax: 1.09, total: 14.66, payment: "Card" },
  { id: "TX-1045", date: new Date(Date.now() - 1000 * 60 * 120).toISOString(), items: [{ productId: "p5", name: "Olive Oil 500ml", qty: 1, price: 12.49 }], subtotal: 12.49, discount: 0, tax: 1, total: 13.49, payment: "Card" }
];

const navGroups = [
  { label: "Workspace", items: [["Overview", LayoutDashboard], ["POS & Billing", ShoppingCart], ["Transactions", FileText], ["Products & Inventory", Package], ["Pricing & Competitors", Tags], ["Live Events", Activity]] },
  { label: "Intelligence", items: [["Analytics", BarChart3], ["SageMaker Forecasting", BrainCircuit], ["Bedrock Assistant", Bot]] },
  { label: "Data platform", items: [["Data Ingestion", CloudUpload], ["Data Lake & Pipeline", Database]] },
  { label: "Administration", items: [["Settings", Settings]] }
] as const;

const currency = (n: number) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const cls = (...s: string[]) => s.filter(Boolean).join(" ");
const categoryColors = ["#0f766e", "#60a5fa", "#f59e0b", "#a78bfa", "#f472b6", "#94a3b8"];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={cls("card", className)}>{children}</section>; }
function Badge({ children, tone = "gray", className = "" }: { children: React.ReactNode; tone?: string; className?: string }) { return <span className={cls(`badge badge-${tone}`, className)}>{children}</span>; }
function Button({ children, onClick, variant = "secondary", disabled = false, className = "" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger"; disabled?: boolean; className?: string }) { return <button disabled={disabled} onClick={onClick} className={cls("btn", `btn-${variant}`, className)}>{children}</button>; }
function Metric({ label, value, change, icon: Icon, note, positive = true }: { label: string; value: string; change?: string; icon: any; note: string; positive?: boolean }) { return <Card className="metric"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={18} /></span></div><div className="metric-value">{value}</div><div className="metric-bottom">{change && <span className={positive ? "trend-up" : "trend-down"}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}</span>}<span className="muted">{note}</span></div></Card>; }
function TableEmpty({ text }: { text: string }) { return <div className="empty-state">{text}</div>; }

export default function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [tx, setTx] = useState<Tx[]>(seedTx);
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [toast, setToast] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("Card");
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("Grocery");
  const [newPrice, setNewPrice] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newStock, setNewStock] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("demo");
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "");
  const [apiStatus, setApiStatus] = useState<"idle" | "checking" | "connected" | "error">("idle");
  const [apiError, setApiError] = useState("");
  const [awsBusy, setAwsBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [period, setPeriod] = useState("Last 7 days");
  const [storeName, setStoreName] = useState("PricePulse Demo Market");
  const [taxRate, setTaxRate] = useState(8);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [showReceipt, setShowReceipt] = useState<Tx | null>(null);
  const [eventLog, setEventLog] = useState<{ id: string; type: string; detail: string; time: string; status: string }[]>([]);
  const [forecastHorizon, setForecastHorizon] = useState("30 days");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [ingestFile, setIngestFile] = useState<File | null>(null);

  // Modal state for reviewing and editing price manually
  const [priceModal, setPriceModal] = useState<{
    product: Product;
    price: string;
    reason: string;
    suggested: number;
    compPrice: number;
  } | null>(null);

  // Helper to ensure competitor prices are always available and safely benchmarked
  const getCompetitorPrice = (p: Product): number => {
    if (typeof p.competitor === "number" && !isNaN(p.competitor) && p.competitor > 0) {
      return p.competitor;
    }
    return Number((p.price * 1.04).toFixed(2));
  };

  useEffect(() => {
    try {
      const p = localStorage.getItem("pp-products"),
        t = localStorage.getItem("pp-tx"),
        m = localStorage.getItem("pp-mode"),
        a = localStorage.getItem("pp-api-base"),
        st = localStorage.getItem("pp-store-name"),
        cr = localStorage.getItem("pp-currency"),
        tr = localStorage.getItem("pp-tax");
      if (m === "aws") {
        setMode("aws");
      } else {
        if (p) setProducts(JSON.parse(p));
        if (t) setTx(JSON.parse(t));
      }
      if (a) setApiBase(a);
      if (st) setStoreName(st);
      if (cr) setCurrencyCode(cr);
      if (tr) setTaxRate(Number(tr));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      if (mode === "demo") {
        localStorage.setItem("pp-products", JSON.stringify(products));
        localStorage.setItem("pp-tx", JSON.stringify(tx));
      }
      localStorage.setItem("pp-mode", mode);
      localStorage.setItem("pp-api-base", apiBase);
      localStorage.setItem("pp-store-name", storeName);
      localStorage.setItem("pp-currency", currencyCode);
      localStorage.setItem("pp-tax", String(taxRate));
    }
  }, [products, tx, loaded, mode, apiBase, storeName, currencyCode, taxRate]);

  const apiCall = async <T = any,>(path: string, method = "GET", body?: any, baseOverride?: string): Promise<T> => {
    const base = (baseOverride ?? apiBase).trim();
    if (!base) throw new Error("API base URL is not configured. Set it in Settings.");
    const response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || `API request failed (${response.status})`);
    return data as T;
  };

  // 1. Load products independently from transactions
  const refreshProducts = async (baseOverride?: string): Promise<Product[] | null> => {
    const base = (baseOverride ?? apiBase).trim();
    if (!base) return null;
    try {
      const p = await apiCall<any>("/products", "GET", undefined, base);
      const list: Product[] | null = Array.isArray(p) ? p : Array.isArray(p?.products) ? p.products : null;
      if (list) {
        setProducts(list);
        setApiStatus("connected");
        setApiError("");
        return list;
      }
    } catch (e: any) {
      console.error("Products fetch failed:", e);
      setApiStatus("error");
      setApiError(e.message || "Failed to load products from AWS");
    }
    return null;
  };

  // 2. Load transactions independently — failure must NOT prevent products from displaying
  const refreshTransactions = async (baseOverride?: string): Promise<Tx[] | null> => {
    const base = (baseOverride ?? apiBase).trim();
    if (!base) return null;
    try {
      const t = await apiCall<any>("/transactions", "GET", undefined, base);
      const list: Tx[] | null = Array.isArray(t) ? t : Array.isArray(t?.transactions) ? t.transactions : null;
      if (list) {
        setTx(list);
        return list;
      }
    } catch (e: any) {
      // Expected when /transactions is not yet deployed on current Lambda
      console.warn("Transactions endpoint not yet available on Lambda:", e.message);
    }
    return null;
  };

  const loadAwsData = async (baseOverride?: string) => {
    setAwsBusy(true);
    try {
      const prods = await refreshProducts(baseOverride);
      const txs = await refreshTransactions(baseOverride);
      if (!txs) {
        // In AWS mode, if /transactions is not available yet, clear seed records
        setTx(old => (old === seedTx ? [] : old));
      }
      return { products: prods, transactions: txs };
    } finally {
      setAwsBusy(false);
    }
  };

  // Switch modes cleanly:
  // - In AWS mode: replace seeded products with S3 data
  // - In Demo mode: restore browser localStorage / seed catalog
  const handleSwitchMode = async (targetMode: Mode) => {
    if (targetMode === "aws") {
      setMode("aws");
      setApiStatus("idle");
      notify("Switched to AWS mode — loading data from S3");
      if (apiBase.trim()) {
        await loadAwsData();
      }
    } else {
      setMode("demo");
      setApiStatus("idle");
      try {
        const p = localStorage.getItem("pp-products");
        const t = localStorage.getItem("pp-tx");
        setProducts(p ? JSON.parse(p) : seedProducts);
        setTx(t ? JSON.parse(t) : seedTx);
      } catch {
        setProducts(seedProducts);
        setTx(seedTx);
      }
      notify("Switched to Demo mode — local state restored");
    }
  };

  // Automatic data fetch when in AWS mode:
  // Products and transactions are loaded independently
  useEffect(() => {
    if (!loaded || mode !== "aws" || !apiBase.trim()) return;
    let cancelled = false;
    (async () => {
      // 1. Fetch products independently
      try {
        const p = await apiCall<any>("/products");
        if (cancelled) return;
        const list = Array.isArray(p) ? p : Array.isArray(p?.products) ? p.products : null;
        if (list) {
          setProducts(list);
          setApiStatus("connected");
          setApiError("");
        }
      } catch (e: any) {
        if (cancelled) return;
        setApiStatus("error");
        setApiError(e.message || "Failed to load products from AWS");
      }

      // 2. Fetch transactions independently: failure never blocks products
      try {
        const t = await apiCall<any>("/transactions");
        if (cancelled) return;
        const txList = Array.isArray(t) ? t : Array.isArray(t?.transactions) ? t.transactions : null;
        if (txList) {
          setTx(txList);
        } else {
          setTx(old => (old === seedTx ? [] : old));
        }
      } catch (e: any) {
        if (cancelled) return;
        console.warn("Transactions endpoint not yet available on Lambda:", e);
        setTx(old => (old === seedTx ? [] : old));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaded, mode, apiBase]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (s: string) => setToast(s);
  const fmt = (n: number) =>
    new Intl.NumberFormat(currencyCode === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2
    }).format(n);

  const sales = tx.reduce((a, b) => a + b.total, 0);
  const itemsSold = tx.reduce((a, b) => a + b.items.reduce((x, y) => x + y.qty, 0), 0);
  const low = products.filter(p => p.stock <= p.reorder);
  const filtered = products.filter(
    p =>
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())) &&
      (cat === "All" || p.category === cat)
  );
  const cartLines = cart.map(c => ({ ...c, product: products.find(p => p.id === c.id)! })).filter(c => c.product);
  const subtotal = cartLines.reduce((s, c) => s + c.product.price * c.qty, 0);
  const tax = ((Math.max(0, subtotal - discount) * taxRate) / 100);
  const total = Math.max(0, subtotal - discount) + tax;
  const grossProfit = tx.reduce((sum, t) => sum + t.items.reduce((s, i) => s + (i.price - (products.find(p => p.id === i.productId)?.cost || 0)) * i.qty, 0), 0);
  const topProducts = products
    .map(p => ({
      ...p,
      qty: tx.reduce((sum, t) => sum + t.items.filter(i => i.productId === p.id).reduce((a, i) => a + i.qty, 0), 0)
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const revenueChart = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      revenue: Math.round((tx.reduce((s, t) => s + t.total, 0) / Math.max(tx.length, 1)) * (0.65 + (i % 4) * 0.23) + (i === 5 ? 20 : 0)),
      orders: Math.max(1, Math.round((tx.length / 7) * (1 + (i % 3))))
    }));
  }, [tx]);

  const categoryChart = useMemo(() => {
    const m = new Map<string, number>();
    tx.forEach(t =>
      t.items.forEach(i => {
        const c = products.find(p => p.id === i.productId)?.category || "Other";
        m.set(c, (m.get(c) || 0) + i.price * i.qty);
      })
    );
    return [...m].map(([name, value]) => ({ name, value }));
  }, [tx, products]);

  const appendEvent = (type: string, detail: string, status = "Saved locally") =>
    setEventLog(old => [{ id: "EVT-" + Date.now(), type, detail, time: new Date().toISOString(), status }, ...old].slice(0, 100));

  const checkApi = async () => {
    setApiStatus("checking");
    setApiError("");
    try {
      await apiCall("/health");
      setApiStatus("connected");
      notify("AWS API health check succeeded");
      if (mode === "aws") {
        await loadAwsData();
      }
    } catch (e: any) {
      setApiStatus("error");
      setApiError(e.message);
      notify("AWS API not reachable");
    }
  };

  const runAction = async <T,>(path: string, method: string, payload: T, localAction: () => void): Promise<boolean> => {
    if (mode === "demo") {
      localAction();
      return true;
    }
    setAwsBusy(true);
    try {
      await apiCall(path, method, payload);
      localAction();
      await refreshProducts(); // Refresh S3 product catalog after modifications
      appendEvent("AWS API", `${method} ${path}`, "Confirmed by API");
      notify("Action confirmed by AWS API");
      return true;
    } catch (e: any) {
      setApiError(e.message);
      notify(`AWS request failed: ${e.message}`);
      return false;
    } finally {
      setAwsBusy(false);
    }
  };

  const addCart = (p: Product) => {
    if (p.stock <= 0) {
      notify("This item is out of stock");
      return;
    }
    setCart(old => {
      const found = old.find(x => x.id === p.id);
      if (found) {
        if (found.qty >= p.stock) {
          notify("Not enough stock");
          return old;
        }
        return old.map(x => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...old, { id: p.id, qty: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) =>
    setCart(old =>
      old
        .map(c => (c.id === id ? { ...c, qty: Math.max(0, Math.min(products.find(p => p.id === id)?.stock || 99, c.qty + delta)) } : c))
        .filter(c => c.qty > 0)
    );

  const checkout = async () => {
    if (!cart.length) return;
    const record: Tx = {
      id: "TX-" + (1049 + tx.length - seedTx.length),
      date: new Date().toISOString(),
      items: cartLines.map(c => ({ productId: c.id, name: c.product.name, qty: c.qty, price: c.product.price })),
      subtotal,
      discount,
      tax,
      total,
      payment
    };
    const payload = { ...record, storeName, currency: currencyCode, source: "pricepulse-frontend" };
    if (mode === "aws") {
      setAwsBusy(true);
      try {
        const result = await apiCall<any>("/transactions", "POST", payload);
        const confirmed = { ...record, id: result.transactionId || result.id || record.id };
        setTx(old => [confirmed, ...old]);
        // Refresh products after AWS transaction to reflect stock deduction in S3
        await refreshProducts();
        appendEvent("POS checkout", confirmed.id, "Confirmed by API");
        setShowReceipt(confirmed);
        setCart([]);
        setDiscount(0);
        notify("Checkout confirmed by AWS API");
      } catch (e: any) {
        setApiError(e.message);
        notify("Checkout failed — backend did not confirm it");
      } finally {
        setAwsBusy(false);
      }
      return;
    }
    setTx(old => [record, ...old]);
    setProducts(ps =>
      ps.map(p => {
        const line = cart.find(c => c.id === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      })
    );
    appendEvent("POS checkout", record.id);
    setCart([]);
    setDiscount(0);
    setShowReceipt(record);
    notify("Demo checkout completed · " + record.id);
  };

  const saveProduct = async () => {
    if (!newName.trim() || !newSku.trim() || !newPrice) return notify("Please fill in product name, SKU and price");
    const product: Product = {
      id: editing?.id || "p" + Date.now(),
      name: newName,
      sku: newSku,
      category: newCategory,
      price: Number(newPrice),
      cost: Number(newCost || 0),
      stock: Number(newStock || 0),
      reorder: 10,
      competitor: editing?.competitor || Number(newPrice) * 1.03
    };
    if (mode === "aws") {
      const ok = await runAction(
        editing ? "/products/" + editing.id : "/products",
        editing ? "PUT" : "POST",
        product,
        () => setProducts(old => (editing ? old.map(p => (p.id === editing.id ? product : p)) : [product, ...old]))
      );
      if (ok) {
        await refreshProducts();
        setModal(false);
        setEditing(null);
        clearProductForm();
      }
      return;
    }
    setProducts(old => (editing ? old.map(p => (p.id === editing.id ? product : p)) : [product, ...old]));
    appendEvent(editing ? "Product updated" : "Product created", product.name);
    setModal(false);
    setEditing(null);
    clearProductForm();
    notify(editing ? "Product updated" : "Product added");
  };

  const clearProductForm = () => {
    setNewName("");
    setNewSku("");
    setNewPrice("");
    setNewCost("");
    setNewStock("");
    setNewCategory("Grocery");
  };

  const openProduct = (p?: Product) => {
    setEditing(p || null);
    setNewName(p?.name || "");
    setNewSku(p?.sku || "");
    setNewCategory(p?.category || "Grocery");
    setNewPrice(String(p?.price ?? ""));
    setNewCost(String(p?.cost ?? ""));
    setNewStock(String(p?.stock ?? ""));
    setModal(true);
  };

  const reset = () => {
    if (mode === "aws") {
      notify("Reset demo is disabled in AWS mode");
      return;
    }
    setProducts(seedProducts);
    setTx(seedTx);
    localStorage.removeItem("pp-products");
    localStorage.removeItem("pp-tx");
    setCart([]);
    appendEvent("Demo reset", "Seed data restored");
    notify("Demo data restored");
  };

  const exportCSV = () => {
    const csv = [
      "id,date,total,payment,items",
      ...tx.map(t => `${t.id},${t.date},${t.total},${t.payment},"${t.items.map(i => i.name + " x" + i.qty).join("; ")}"`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "pricepulse-transactions.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportProducts = () => {
    const csv = [
      "id,name,sku,category,price,cost,stock,reorder,competitor",
      ...products.map(p => [p.id, p.name, p.sku, p.category, p.price, p.cost, p.stock, p.reorder, getCompetitorPrice(p)].join(","))
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "pricepulse-products.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Open modal for manual price editing & reviewing pricing recommendations
  const openPriceModal = (p: Product) => {
    const compPrice = getCompetitorPrice(p);
    const suggested = Number(Math.max(p.cost * 1.15, compPrice * 0.98).toFixed(2));
    setPriceModal({
      product: p,
      price: suggested.toFixed(2),
      reason: "Pricing recommendation",
      suggested,
      compPrice
    });
  };

  // Save price update (supports manual typing and suggested values)
  const savePriceModal = async () => {
    if (!priceModal) return;
    const { product, price, reason } = priceModal;
    const numPrice = Number(Number(price).toFixed(2));
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      notify("Please enter a valid positive price");
      return;
    }
    const reasonText = reason.trim() || "Manual price update";

    if (mode === "aws") {
      setAwsBusy(true);
      try {
        await apiCall(`/products/${product.id}/price`, "POST", {
          price: numPrice,
          reason: reasonText
        });
        // 4. Refresh products after price updates!
        const refreshed = await refreshProducts();
        if (!refreshed) {
          setProducts(old => old.map(x => (x.id === product.id ? { ...x, price: numPrice } : x)));
        }
        appendEvent("Price updated (AWS)", `${product.name} → ${fmt(numPrice)} (${reasonText})`, "Confirmed by API");
        notify(`Price updated in AWS S3: ${product.name} → ${fmt(numPrice)}`);
        setPriceModal(null);
      } catch (e: any) {
        setApiError(e.message);
        notify(`AWS price update failed: ${e.message}`);
      } finally {
        setAwsBusy(false);
      }
      return;
    }

    // Demo mode
    setProducts(old => old.map(x => (x.id === product.id ? { ...x, price: numPrice } : x)));
    appendEvent("Price updated", `${product.name} → ${fmt(numPrice)} (${reasonText})`);
    notify(`Price updated in demo: ${product.name} → ${fmt(numPrice)}`);
    setPriceModal(null);
  };

  const applyPrice = (p: Product) => {
    openPriceModal(p);
  };

  const answer = (q: string) => {
    const s = q.toLowerCase();
    let result = "I can answer questions about sales, inventory, product performance, and competitor prices in the current data mode.";
    if (s.includes("revenue") || s.includes("sales"))
      result = `Recorded ${mode === "demo" ? "demo " : ""}revenue is ${fmt(sales)} across ${tx.length} transactions. Average transaction value is ${fmt(tx.length ? sales / tx.length : 0)}.`;
    else if (s.includes("stock"))
      result = low.length
        ? `${low.length} products are at or below reorder level: ${low.map(p => `${p.name} (${p.stock} left)`).join(", ")}.`
        : "No products are below their reorder thresholds.";
    else if (s.includes("top"))
      result = "Top products by units sold: " + topProducts.map(p => `${p.name} (${p.qty})`).join(", ") + ".";

    if (mode === "aws") {
      setChatHistory(old => [
        ...old,
        { role: "user", text: q },
        { role: "assistant", text: "Bedrock endpoint is planned but not configured. Set up POST /assistant/query in API Gateway to enable grounded AI answers." }
      ]);
      return;
    }
    setAssistantAnswer(result);
    setChatHistory(old => [...old, { role: "user", text: q }, { role: "assistant", text: result }]);
  };

  const ask = () => {
    if (assistantInput.trim()) {
      answer(assistantInput);
      setAssistantInput("");
    }
  };

  const simulateFive = () => {
    if (mode === "aws") {
      notify("Use the simulation endpoint after the API Lambda is deployed");
      return;
    }
    const generated: Tx[] = [];
    for (let i = 0; i < 5; i++) {
      const p = products[Math.floor(Math.random() * products.length)];
      if (!p) continue;
      const qty = 1 + Math.floor(Math.random() * 3),
        sub = p.price * qty;
      generated.push({
        id: "SIM-" + Date.now() + "-" + i,
        date: new Date(Date.now() - i * 60000).toISOString(),
        items: [{ productId: p.id, name: p.name, qty, price: p.price }],
        subtotal: sub,
        discount: 0,
        tax: (sub * taxRate) / 100,
        total: sub * (1 + taxRate / 100),
        payment: ["Card", "Cash", "UPI"][i % 3]
      });
    }
    setTx(old => [...generated, ...old]);
    appendEvent("Synthetic generator", `${generated.length} transaction records generated`);
    notify("Generated simulated transaction activity");
  };

  const importProducts = async (file: File) => {
    const text = await file.text(),
      rows = text.split(/\r?\n/).filter(Boolean),
      header = rows.shift()?.split(",").map(x => x.trim().toLowerCase()) || [],
      get = (r: string[], k: string) => r[header.indexOf(k)] || "";
    const imported = rows
      .map((line, i) => {
        const r = line.split(",");
        const pPrice = Number(get(r, "price")) || 0;
        return {
          id: "import-" + Date.now() + i,
          name: get(r, "name"),
          sku: get(r, "sku") || "IMP-" + i,
          category: get(r, "category") || "Other",
          price: pPrice,
          cost: Number(get(r, "cost")) || 0,
          stock: Number(get(r, "stock")) || 0,
          reorder: 10,
          competitor: Number(get(r, "competitor")) || Number((pPrice * 1.04).toFixed(2))
        };
      })
      .filter(p => p.name);
    if (mode === "aws") {
      await runAction("/ingestion/products", "POST", { products: imported, filename: file.name }, () => {});
      return;
    }
    setProducts(old => [...imported, ...old]);
    appendEvent("CSV import", `${imported.length} products imported`);
    notify(`Imported ${imported.length} products locally`);
  };

  const navTo = (p: string) => {
    setPage(p as Page);
    setMobileNav(false);
    setQuery("");
  };

  const pageDescription: Record<Page, string> = {
    Overview: "A clear view of your store’s performance.",
    "POS & Billing": "Create simulated sales and manage checkout.",
    Transactions: "Review checkout history, receipts, and returns.",
    "Products & Inventory": "Manage catalog, stock levels, and replenishment.",
    "Pricing & Competitors": "Monitor price positioning, margins, and manually adjust prices.",
    "Live Events": "A timeline of recent application and simulation activity.",
    "Data Ingestion": "Bring source data into the PricePulse pipeline.",
    "Data Lake & Pipeline": "Explore the planned AWS data lake and processing flow.",
    Analytics: "Explore sales, category, and inventory performance.",
    "SageMaker Forecasting": "Forecasting interface — SageMaker integration planned.",
    "Bedrock Assistant": "Ask business questions using grounded retail data.",
    Settings: "Configure store preferences and AWS connection."
  };

  return (
    <div className="app-shell">
      <aside className={cls("sidebar", mobileNav ? "sidebar-open" : "")}>
        <div className="brand">
          <div className="brand-mark"><TrendingUp size={22} /></div>
          <div><div className="brand-name">PricePulse</div><div className="brand-sub">Retail Intelligence</div></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>
        <div className="store-select">
          <div className="store-avatar"><Store size={16} /></div>
          <div className="store-label"><strong>{storeName}</strong><small>Store workspace</small></div>
          <ChevronDown size={15} />
        </div>
        {navGroups.map(group => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(([label, Icon]) => (
              <button
                key={label}
                className={cls("nav-item", page === label ? "nav-active" : "")}
                onClick={() => navTo(label)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {label === "Products & Inventory" && low.length > 0 && <span className="nav-count">{low.length}</span>}
              </button>
            ))}
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="cloud-mini">
            <div className="cloud-mini-icon"><Cloud size={16} /></div>
            <div><strong>{mode === "demo" ? "Demo workspace" : "AWS workspace"}</strong><small>{mode === "demo" ? "Browser-local data" : "API connection mode"}</small></div>
            <span className={`status-dot ${mode === "aws" && apiStatus !== "connected" ? "dot-warn" : ""}`} />
          </div>
          <button className="nav-item" onClick={() => navTo("Settings")}><LifeBuoy size={17} /><span>Help & settings</span></button>
          <div className="profile">
            <div className="profile-avatar">SM</div>
            <div><strong>Store Manager</strong><small>Administrator</small></div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      {mobileNav && <div className="mobile-overlay" onClick={() => setMobileNav(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu /></button>
            <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{page}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className={`mode-pill ${mode === "aws" ? "mode-aws" : "mode-demo"}`}><span className="status-dot" />{mode === "demo" ? "Demo mode" : "AWS mode"}</div>
            <button className="icon-btn" title="Notifications" onClick={() => navTo("Live Events")}><Bell size={18} /><span className="notification-dot" /></button>
            <div className="user-chip"><div className="profile-avatar">SM</div><div><strong>Store Manager</strong><small>Admin</small></div><ChevronDown size={14} /></div>
          </div>
        </header>

        <div className="page-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{page === "Overview" ? "STORE OVERVIEW" : "PRICEPULSE WORKSPACE"}</div>
              <h1>{page === "Overview" ? "Good morning, Store Manager" : page}</h1>
              <p>{pageDescription[page]}</p>
            </div>
            <div className="heading-actions">
              <select className="select-control" value={period} onChange={e => setPeriod(e.target.value)}>
                <option>Today</option><option>Yesterday</option><option>Last 7 days</option><option>Last 30 days</option><option>This month</option>
              </select>
              {page === "Overview" && <Button variant="primary" onClick={() => navTo("POS & Billing")}><Plus size={16} /> New sale</Button>}
            </div>
          </div>

          {mode === "demo" && (
            <div className="demo-banner">
              <Sparkles size={16} />
              <span><strong>Demo environment</strong> — activity is saved in this browser only. Seed data is illustrative.</span>
              <button onClick={() => navTo("Settings")}>Configure AWS <ArrowRight size={14} /></button>
            </div>
          )}

          {mode === "aws" && apiStatus !== "connected" && (
            <div className="warning-banner">
              <Cloud size={17} />
              <span><strong>AWS mode selected.</strong> API connection is not verified. Actions require a configured backend and will not fall back to local demo data.</span>
              <button onClick={checkApi}>Test connection</button>
            </div>
          )}

          {page === "Overview" && (
            <>
              <div className="metric-grid">
                <Metric label="Revenue" value={fmt(sales)} change="+8.2%" icon={Wallet} note={`${tx.length} transactions recorded`} />
                <Metric label="Orders" value={String(tx.length)} change="+4.6%" icon={ShoppingBag} note="Completed checkouts" />
                <Metric label="Average order value" value={fmt(tx.length ? sales / tx.length : 0)} change="+2.1%" icon={CircleDollarSign} note="Revenue per transaction" />
                <Metric label="Low stock items" value={String(low.length)} icon={Package} note="At or below reorder point" positive={false} />
              </div>
              <div className="dashboard-grid">
                <Card className="chart-card">
                  <div className="card-heading">
                    <div><h3>Revenue overview</h3><p>Revenue trend · {period}</p></div>
                    <div className="chart-legend"><span className="legend-dot teal" />Revenue <span className="legend-dot blue" />Orders</div>
                  </div>
                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChart}>
                        <defs>
                          <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#edf1f5" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8b95a7", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8b95a7", fontSize: 11 }} tickFormatter={v => "$" + v} />
                        <Tooltip formatter={(v: any) => fmt(Number(v))} />
                        <Area type="monotone" dataKey="revenue" stroke="#0f9f91" strokeWidth={2.5} fill="url(#revGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footer"><span><strong>{fmt(sales)}</strong> total recorded revenue</span><Badge tone="teal">{mode === "aws" ? "AWS-connected" : "Demo-derived"}</Badge></div>
                </Card>
                <Card className="category-card">
                  <div className="card-heading"><div><h3>Sales by category</h3><p>Share of recorded sales</p></div><button className="more-btn"><MoreHorizontal /></button></div>
                  {categoryChart.length ? (
                    <>
                      <div className="donut-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={categoryChart} dataKey="value" nameKey="name" innerRadius={63} outerRadius={88} paddingAngle={3}>
                              {categoryChart.map((_, i) => <Cell key={i} fill={categoryColors[i % categoryColors.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: any) => fmt(Number(v))} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center"><strong>{fmt(sales)}</strong><small>Total sales</small></div>
                      </div>
                      <div className="category-legend">
                        {categoryChart.slice(0, 5).map((c, i) => (
                          <div key={c.name}>
                            <span><i style={{ background: categoryColors[i % categoryColors.length] }} />{c.name}</span>
                            <strong>{fmt(c.value)}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <TableEmpty text="Category data will appear after sales." />
                  )}
                </Card>
              </div>
              <div className="dashboard-grid lower-grid">
                <Card>
                  <div className="card-heading"><div><h3>Recent transactions</h3><p>Latest completed checkout activity</p></div><button className="text-link" onClick={() => navTo("Live Events")}>View activity <ArrowRight size={14} /></button></div>
                  <TransactionTable tx={tx.slice(0, 5)} fmt={fmt} onReceipt={setShowReceipt} />
                </Card>
                <Card>
                  <div className="card-heading"><div><h3>Inventory attention</h3><p>Products that may need restocking</p></div><Badge tone="amber">{low.length} alerts</Badge></div>
                  {low.slice(0, 5).map(p => (
                    <div className="stock-alert" key={p.id}>
                      <div className="product-thumb small-thumb">{p.name.slice(0, 1)}</div>
                      <div className="stock-alert-info">
                        <strong>{p.name}</strong>
                        <small>{p.stock} units left · reorder at {p.reorder}</small>
                        <div className="stock-track"><span style={{ width: `${Math.min(100, (p.stock / Math.max(p.reorder, 1)) * 100)}%` }} /></div>
                      </div>
                      <Badge tone={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Out" : "Low"}</Badge>
                    </div>
                  ))}
                  {!low.length && <TableEmpty text="All products are above reorder thresholds." />}
                  <Button className="full-width" onClick={() => navTo("Products & Inventory")}>Review inventory <ArrowRight size={14} /></Button>
                </Card>
              </div>
              <div className="dashboard-grid lower-grid">
                <Card>
                  <div className="card-heading"><div><h3>Top products</h3><p>Based on units sold in recorded transactions</p></div><Badge tone="gray">Top 5</Badge></div>
                  {topProducts.map((p, i) => (
                    <div className="top-product" key={p.id}>
                      <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                      <div className="product-thumb">{p.name.slice(0, 1)}</div>
                      <div className="top-product-info"><strong>{p.name}</strong><small>{p.category} · {p.sku}</small></div>
                      <div className="top-product-sales"><strong>{p.qty} units</strong><small>{fmt(p.price * p.qty)}</small></div>
                    </div>
                  ))}
                </Card>
                <Card>
                  <div className="card-heading"><div><h3>Quick actions</h3><p>Common store operations</p></div></div>
                  <div className="quick-actions">
                    <button onClick={() => navTo("POS & Billing")}><span className="quick-icon q-teal"><ShoppingCart /></span><strong>New checkout</strong><small>Process a sale</small></button>
                    <button onClick={() => openProduct()}><span className="quick-icon q-blue"><Plus /></span><strong>Add product</strong><small>Expand your catalog</small></button>
                    <button onClick={() => navTo("Data Ingestion")}><span className="quick-icon q-purple"><Upload /></span><strong>Import data</strong><small>Upload a CSV file</small></button>
                    <button onClick={exportCSV}><span className="quick-icon q-orange"><Download /></span><strong>Export report</strong><small>Download transactions</small></button>
                  </div>
                </Card>
              </div>
            </>
          )}

          {page === "POS & Billing" && (
            <div className="pos-layout">
              <section>
                <div className="toolbar">
                  <div className="searchbox">
                    <Search size={17} />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product name or SKU…" />
                  </div>
                  <select className="select-control" value={cat} onChange={e => setCat(e.target.value)}>
                    <option>All</option>
                    {Array.from(new Set(products.map(p => p.category))).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="product-grid">
                  {filtered.map(p => (
                    <button key={p.id} disabled={p.stock <= 0} className="pos-product" onClick={() => addCart(p)}>
                      <div className={`product-illustration pi-${products.indexOf(p) % 6}`}><Package size={25} /></div>
                      <div className="pos-product-name">{p.name}</div>
                      <div className="pos-product-meta">{p.sku} · {p.stock} in stock</div>
                      <div className="pos-product-bottom">
                        <strong>{fmt(p.price)}</strong>
                        <span><Plus size={14} /> Add</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
              <Card className="cart-card">
                <div className="cart-head">
                  <div><h3>Current order</h3><p>{cartLines.reduce((s, c) => s + c.qty, 0)} items · {cartLines.length} product types</p></div>
                  <button className="icon-btn" onClick={() => setCart([])} title="Clear cart"><Trash2 size={17} /></button>
                </div>
                {cartLines.length ? (
                  cartLines.map(c => (
                    <div className="cart-line" key={c.id}>
                      <div className="product-thumb small-thumb">{c.product.name.slice(0, 1)}</div>
                      <div className="cart-line-info">
                        <strong>{c.product.name}</strong>
                        <small>{fmt(c.product.price)} each</small>
                        <div className="qty-control">
                          <button onClick={() => changeQty(c.id, -1)}><Minus size={12} /></button>
                          <span>{c.qty}</span>
                          <button onClick={() => changeQty(c.id, 1)}><Plus size={12} /></button>
                        </div>
                      </div>
                      <strong>{fmt(c.qty * c.product.price)}</strong>
                    </div>
                  ))
                ) : (
                  <TableEmpty text="Your cart is empty. Select products to begin a sale." />
                )}
                <div className="cart-summary">
                  <div><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
                  <div><span>Discount</span><input type="number" min="0" max={subtotal} value={discount} onChange={e => setDiscount(Math.min(subtotal, Math.max(0, Number(e.target.value))))} /></div>
                  <div><span>Tax ({taxRate}%)</span><strong>{fmt(tax)}</strong></div>
                  <div className="cart-total"><span>Total</span><strong>{fmt(total)}</strong></div>
                </div>
                <label className="field-label">
                  Payment method
                  <select className="select-control full-width" value={payment} onChange={e => setPayment(e.target.value)}>
                    <option>Card</option><option>Cash</option><option>UPI</option><option>Other</option>
                  </select>
                </label>
                <Button variant="primary" className="full-width checkout-btn" disabled={!cart.length || awsBusy} onClick={checkout}>
                  {awsBusy ? <LoaderCircle className="spin" /> : <Check size={17} />} {mode === "aws" ? "Submit checkout to AWS" : "Complete demo checkout"}
                </Button>
                {mode === "aws" && <small className="muted">Checkout updates S3 transactions and deducts catalog stock.</small>}
              </Card>
            </div>
          )}

          {page === "Transactions" && (
            <>
              <div className="toolbar toolbar-wide">
                <div className="searchbox">
                  <Search size={17} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search transaction ID, payment method…" />
                </div>
                {mode === "aws" && (
                  <Button onClick={() => refreshTransactions()} disabled={awsBusy}>
                    <RefreshCw size={14} className={awsBusy ? "spin" : ""} /> Refresh from AWS
                  </Button>
                )}
                <Button onClick={exportCSV}><Download size={15} /> Export transactions</Button>
              </div>
              <div className="inventory-stats">
                <div><span>Total transactions</span><strong>{tx.length}</strong></div>
                <div><span>Total revenue</span><strong>{fmt(sales)}</strong></div>
                <div><span>Avg. order value</span><strong>{fmt(tx.length ? sales / tx.length : 0)}</strong></div>
                <div><span>Payment methods</span><strong>{new Set(tx.map(t => t.payment)).size}</strong></div>
              </div>
              <Card className="table-card">
                <div className="card-heading">
                  <div>
                    <h3>Transaction history</h3>
                    <p>Original checkout records remain in history. In AWS mode, records are loaded from S3 via /transactions.</p>
                  </div>
                  <Badge tone={mode === "demo" ? "gray" : "teal"}>{mode === "demo" ? "Demo records" : "AWS S3 records"}</Badge>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Transaction</th><th>Date & time</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {tx
                        .filter(t => t.id.toLowerCase().includes(query.toLowerCase()) || t.payment.toLowerCase().includes(query.toLowerCase()))
                        .map(t => (
                          <tr key={t.id}>
                            <td><strong className="mono">{t.id}</strong></td>
                            <td>{new Date(t.date).toLocaleString()}</td>
                            <td>Walk-in customer</td>
                            <td>{t.items.map(i => `${i.name} ×${i.qty}`).join(", ")}</td>
                            <td><Badge tone="gray">{t.payment}</Badge></td>
                            <td><strong>{fmt(t.total)}</strong></td>
                            <td><Badge tone="green">Completed</Badge></td>
                            <td><Button onClick={() => setShowReceipt(t)}><Eye size={14} /> Receipt</Button></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {!tx.length && <TableEmpty text="No transactions recorded yet." />}
              </Card>
              <p className="small-note">Refund/return endpoint planned: POST /transactions/{"{id}"}/returns. Original transactions should never be deleted or silently modified.</p>
            </>
          )}

          {page === "Products & Inventory" && (
            <>
              <div className="toolbar toolbar-wide">
                <div className="searchbox">
                  <Search size={17} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products by name or SKU…" />
                </div>
                <select className="select-control" value={cat} onChange={e => setCat(e.target.value)}>
                  <option>All</option>
                  {Array.from(new Set(products.map(p => p.category))).map(c => <option key={c}>{c}</option>)}
                </select>
                {mode === "aws" && (
                  <Button onClick={() => refreshProducts()} disabled={awsBusy}>
                    <RefreshCw size={14} className={awsBusy ? "spin" : ""} /> Refresh from AWS
                  </Button>
                )}
                <Button onClick={exportProducts}><Download size={15} /> Export CSV</Button>
                <Button variant="primary" onClick={() => openProduct()}><Plus size={16} /> Add product</Button>
              </div>
              <div className="inventory-stats">
                <div><span>Catalog products</span><strong>{products.length}</strong></div>
                <div><span>Inventory units</span><strong>{products.reduce((s, p) => s + p.stock, 0).toLocaleString()}</strong></div>
                <div><span>Low stock</span><strong className="text-amber">{low.length}</strong></div>
                <div><span>Inventory value</span><strong>{fmt(products.reduce((s, p) => s + p.cost * p.stock, 0))}</strong></div>
              </div>
              <Card className="table-card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Product</th><th>SKU</th><th>Category</th><th>Retail price</th><th>Cost</th><th>Stock</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="table-product">
                              <div className="product-thumb small-thumb">{p.name.slice(0, 1)}</div>
                              <div><strong>{p.name}</strong><small>{p.category}</small></div>
                            </div>
                          </td>
                          <td className="mono">{p.sku}</td>
                          <td>{p.category}</td>
                          <td>{fmt(p.price)}</td>
                          <td>{fmt(p.cost)}</td>
                          <td><strong>{p.stock}</strong><small className="table-sub">Reorder at {p.reorder}</small></td>
                          <td><Badge tone={p.stock === 0 ? "red" : p.stock <= p.reorder ? "amber" : "green"}>{p.stock === 0 ? "Out of stock" : p.stock <= p.reorder ? "Low stock" : "In stock"}</Badge></td>
                          <td>
                            <button className="row-action" onClick={() => openProduct(p)} title="Edit catalog item"><Edit3 size={15} /></button>
                            <button
                              className="row-action danger"
                              title="Delete product"
                              onClick={() => {
                                if (mode === "aws") {
                                  runAction(`/products/${p.id}`, "DELETE", {}, () => setProducts(old => old.filter(x => x.id !== p.id)));
                                  return;
                                }
                                setProducts(old => old.filter(x => x.id !== p.id));
                                appendEvent("Product removed", p.name);
                                notify("Product removed from demo catalog");
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!filtered.length && <TableEmpty text="No products found in this category." />}
              </Card>
            </>
          )}

          {page === "Pricing & Competitors" && (
            <>
              <div className="metric-grid three">
                <Metric label="Products monitored" value={String(products.length)} icon={Tags} note={mode === "aws" ? "S3 product catalog" : "Demo product catalog"} />
                <Metric label="Below competitor" value={String(products.filter(p => p.price < getCompetitorPrice(p)).length)} icon={TrendingDown} note="vs. simulated competitor feed" />
                <Metric label="Average gross margin" value={(products.reduce((s, p) => s + (p.price - p.cost) / Math.max(p.price, 0.01), 0) / Math.max(products.length, 1) * 100).toFixed(1) + "%"} icon={Gauge} note="Calculated from catalog prices" />
              </div>
              <div className="toolbar toolbar-wide">
                <div className="searchbox">
                  <Search size={17} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter pricing by product name or SKU…" />
                </div>
                {mode === "aws" && (
                  <Button onClick={() => refreshProducts()} disabled={awsBusy}>
                    <RefreshCw size={14} className={awsBusy ? "spin" : ""} /> Refresh from AWS
                  </Button>
                )}
                <Button onClick={exportProducts}><Download size={15} /> Export CSV</Button>
              </div>
              <Card className="table-card">
                <div className="card-heading">
                  <div>
                    <h3>Pricing opportunities</h3>
                    <p>Click &quot;Review / apply&quot; or the edit icon to manually adjust any product price. Competitor prices are simulated benchmarks.</p>
                  </div>
                  <Badge tone="amber"><Sparkles size={11} style={{ marginRight: 3 }} /> Simulated feed</Badge>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Cost</th>
                        <th>Our price</th>
                        <th>
                          Competitor <span className="badge badge-amber" style={{ marginLeft: "4px", fontSize: "8px", padding: "1px 5px" }}>Simulated</span>
                        </th>
                        <th>Price gap</th>
                        <th>Margin</th>
                        <th>Suggested action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
                        .map(p => {
                          const compPrice = getCompetitorPrice(p);
                          const priceGap = p.price - compPrice;
                          const marginPct = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : "0.0";
                          return (
                            <tr key={p.id}>
                              <td>
                                <strong>{p.name}</strong>
                                <small className="table-sub">{p.sku}</small>
                              </td>
                              <td>{fmt(p.cost)}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <strong className="mono">{fmt(p.price)}</strong>
                                  <button
                                    className="row-action"
                                    title="Edit price manually"
                                    onClick={() => openPriceModal(p)}
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <strong className="mono">{fmt(compPrice)}</strong>
                                  <span className="badge badge-amber" style={{ fontSize: "8px", padding: "1px 4px" }}>Simulated</span>
                                </div>
                              </td>
                              <td className={priceGap > 0 ? "text-amber" : "text-green"}>
                                {priceGap > 0 ? `+${fmt(priceGap)}` : fmt(priceGap)}
                              </td>
                              <td>{marginPct}%</td>
                              <td>
                                <Button onClick={() => openPriceModal(p)}>
                                  <Edit3 size={13} /> Review / apply
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                {!products.length && <TableEmpty text="No products found in catalog." />}
              </Card>
              <p className="small-note">Note: Competitor prices shown are synthetic benchmark values. Live competitor web scraping and marketplace crawlers will be connected in a future update.</p>
            </>
          )}

          {page === "Live Events" && (
            <>
              <div className="metric-grid three">
                <Metric label="Events in session" value={String(eventLog.length + tx.length)} icon={Activity} note="Local activity records" />
                <Metric label="Transactions" value={String(tx.length)} icon={ShoppingBag} note="Recorded checkouts" />
                <Metric label="Data mode" value={mode === "demo" ? "Demo" : "AWS"} icon={Cloud} note={mode === "demo" ? "Browser local" : "API-based"} />
              </div>
              <Card>
                <div className="card-heading">
                  <div><h3>Activity timeline</h3><p>Recent POS, catalog, and data actions</p></div>
                  <Button onClick={() => setEventLog([])}><Trash2 size={14} /> Clear session events</Button>
                </div>
                <div className="event-list">
                  {[
                    ...eventLog,
                    ...tx.map(t => ({
                      id: t.id,
                      type: "POS transaction",
                      detail: `${t.items.map(i => i.name + " ×" + i.qty).join(", ")} · ${fmt(t.total)}`,
                      time: t.date,
                      status: mode === "demo" ? "Demo record" : "API record"
                    }))
                  ]
                    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                    .slice(0, 30)
                    .map(e => (
                      <div className="event-row" key={e.id}>
                        <div className="event-icon"><Activity size={16} /></div>
                        <div className="event-body">
                          <strong>{e.type}</strong>
                          <p>{e.detail}</p>
                          <small>{new Date(e.time).toLocaleString()}</small>
                        </div>
                        <Badge tone={e.status.includes("API") || e.status.includes("Confirmed") ? "green" : "gray"}>{e.status}</Badge>
                      </div>
                    ))}
                </div>
              </Card>
            </>
          )}

          {page === "Data Ingestion" && (
            <>
              <div className="metric-grid three">
                <Metric label="Source datasets" value="6" icon={Layers3} note="Synthetic and simulation sources" />
                <Metric label="Last activity" value={eventLog.length ? "Just now" : "—"} icon={Clock3} note="Current browser session" />
                <Metric label="Ingestion status" value={mode === "demo" ? "Local only" : "API ready"} icon={CloudUpload} note="S3 ingestion endpoint" />
              </div>
              <div className="two-col">
                <Card>
                  <div className="card-heading">
                    <div><h3>Import product CSV</h3><p>Expected fields: name, sku, category, price, cost, stock, competitor.</p></div>
                    <Upload size={19} className="teal-icon" />
                  </div>
                  <div className="upload-drop">
                    <CloudUpload size={30} />
                    <strong>Choose a CSV file</strong>
                    <span>Import product catalog records</span>
                    <input type="file" accept=".csv" onChange={e => setIngestFile(e.target.files?.[0] || null)} />
                    {ingestFile && <p>{ingestFile.name}</p>}
                    <Button variant="primary" disabled={!ingestFile} onClick={() => ingestFile && importProducts(ingestFile)}>
                      <Upload size={15} /> {mode === "aws" ? "Send to ingestion API" : "Import locally"}
                    </Button>
                  </div>
                  <p className="small-note">AWS mode sends POST /ingestion/products. Backend validates and writes accepted data to S3.</p>
                </Card>
                <Card>
                  <div className="card-heading">
                    <div><h3>Simulation data generator</h3><p>Generate synthetic retail transactions for pipeline testing.</p></div>
                    <Sparkles className="purple-icon" />
                  </div>
                  <div className="simulation-box">
                    <div className="sim-big-icon"><Zap /></div>
                    <strong>Retail activity simulator</strong>
                    <p>Generate 5 sample transactions using your current product catalog.</p>
                    <Button variant="primary" onClick={simulateFive}><RefreshCw size={15} /> Generate activity</Button>
                  </div>
                  <p className="small-note">{mode === "demo" ? "Generated records remain in local browser state." : "AWS simulation endpoint can be connected after Lambda is deployed."}</p>
                </Card>
              </div>
              <Card className="mt-card">
                <div className="card-heading"><div><h3>Export data</h3><p>Download local data to inspect or use as source input.</p></div></div>
                <div className="export-row">
                  <div><FileText /><div><strong>Transactions CSV</strong><small>{tx.length} transaction records</small></div></div>
                  <Button onClick={exportCSV}><Download size={15} /> Download</Button>
                </div>
                <div className="export-row">
                  <div><Package /><div><strong>Products CSV</strong><small>{products.length} catalog records</small></div></div>
                  <Button onClick={exportProducts}><Download size={15} /> Download</Button>
                </div>
              </Card>
            </>
          )}

          {page === "Data Lake & Pipeline" && (
            <>
              <div className="pipeline-status">
                <div>
                  <div className="eyebrow">AWS DATA PLATFORM</div>
                  <h2>Retail data lake</h2>
                  <p>S3-first analytics architecture for PricePulse simulation.</p>
                </div>
                <Badge tone={mode === "aws" && apiStatus === "connected" ? "green" : "amber"}>{mode === "aws" && apiStatus === "connected" ? "API connected" : "Pipeline not connected"}</Badge>
              </div>
              <div className="pipeline-flow">
                {[
                  { n: "01", name: "Simulation events", service: "Website / API", desc: "POS transactions, product edits, stock changes", icon: Store },
                  { n: "02", name: "S3 Bronze", service: "Amazon S3", desc: "Append-only JSON/CSV event objects", icon: Database },
                  { n: "03", name: "Silver", service: "AWS Glue", desc: "Clean, validate, normalize and deduplicate", icon: Layers3 },
                  { n: "04", name: "Gold analytics", service: "S3 + Glue", desc: "Curated aggregates and dimensional datasets", icon: BarChart3 },
                  { n: "05", name: "Query & BI", service: "Athena / QuickSight", desc: "Interactive analytics and business reporting", icon: Gauge },
                  { n: "06", name: "AI / forecasting", service: "Bedrock / SageMaker", desc: "Grounded insights and model predictions", icon: BrainCircuit }
                ].map((s, i) => (
                  <React.Fragment key={s.n}>
                    <div className="pipeline-node">
                      <div className="pipeline-node-top"><span>{s.n}</span><s.icon size={21} /></div>
                      <strong>{s.name}</strong>
                      <Badge tone={i === 0 ? "green" : "gray"}>{i === 0 ? "Frontend ready" : "Planned"}</Badge>
                      <div className="pipeline-service">{s.service}</div>
                      <p>{s.desc}</p>
                    </div>
                    {i < 5 && <div className="pipeline-arrow"><ArrowRight size={18} /></div>}
                  </React.Fragment>
                ))}
              </div>
              <div className="two-col">
                <Card>
                  <div className="card-heading">
                    <div><h3>Simulation data object layout</h3><p>Suggested append-only event paths</p></div>
                    <Badge tone="teal">S3 layout</Badge>
                  </div>
                  <pre className="code-block">{`s3://businessanalytics-pricepulse/\n  pricepulse/bronze/app-data/products.json\n  pricepulse/bronze/transactions/YYYY-MM-DD/txn_<id>.json\n  pricepulse/bronze/price-history/YYYY-MM-DD/<event-id>.json\n  pricepulse/bronze/inventory-events/YYYY-MM-DD/<event-id>.json\n  pricepulse/bronze/ingestion-events/YYYY-MM-DD/<event-id>.json\n  pricepulse/silver/\n  pricepulse/gold/`}</pre>
                </Card>
                <Card>
                  <div className="card-heading">
                    <div><h3>Current AWS configuration</h3><p>Frontend deployment and service mapping</p></div>
                    <Cloud />
                  </div>
                  <div className="service-list">
                    {[
                      ["S3", "Object storage / bronze products & events", "Active (businessanalytics-pricepulse)"],
                      ["API Gateway", "HTTP API endpoint", "NEXT_PUBLIC_API_BASE_URL"],
                      ["Lambda", "pricepulse-api: Products & Price update", "Active"],
                      ["Glue", "Catalog and ETL pipelines", "Existing crawlers / next phase"],
                      ["Athena", "SQL analytics query layer", "Planned integration"],
                      ["Bedrock", "Grounded retail AI assistant", "Planned endpoint"],
                      ["SageMaker", "Demand forecasting inference", "Planned endpoint"]
                    ].map(([a, b, c]) => (
                      <div key={a}><strong>{a}</strong><span>{b}</span><small>{c}</small></div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {page === "Analytics" && (
            <>
              <div className="metric-grid">
                <Metric label="Recorded revenue" value={fmt(sales)} icon={CircleDollarSign} note="Current transaction set" />
                <Metric label="Units sold" value={String(itemsSold)} icon={Boxes} note="Across transaction items" />
                <Metric label="Average basket" value={fmt(tx.length ? sales / tx.length : 0)} icon={ShoppingBag} note="Per checkout" />
                <Metric label="Gross profit estimate" value={fmt(grossProfit)} icon={TrendingUp} note="Estimated cost margins" />
              </div>
              <div className="dashboard-grid">
                <Card className="chart-card">
                  <div className="card-heading"><div><h3>Transaction revenue</h3><p>Daily trend calculated from current transactions</p></div></div>
                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChart}>
                        <CartesianGrid stroke="#edf1f5" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: any) => fmt(Number(v))} />
                        <Bar dataKey="revenue" fill="#0f9f91" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card className="category-card">
                  <div className="card-heading"><div><h3>Category mix</h3><p>Sales distribution</p></div></div>
                  {categoryChart.map((c, i) => (
                    <div className="bar-item" key={c.name}>
                      <div><span>{c.name}</span><strong>{fmt(c.value)}</strong></div>
                      <div className="bar-track"><span style={{ width: `${sales ? (c.value / sales) * 100 : 0}%`, background: categoryColors[i % categoryColors.length] }} /></div>
                    </div>
                  ))}
                </Card>
              </div>
              <Card className="mt-card">
                <div className="card-heading">
                  <div><h3>Transaction details</h3><p>Export or inspect transaction records</p></div>
                  <Button onClick={exportCSV}><Download size={15} /> Export CSV</Button>
                </div>
                <TransactionTable tx={tx} fmt={fmt} onReceipt={setShowReceipt} />
              </Card>
              <p className="small-note">Analytics are computed from recorded transactions. Once Gold/Athena endpoints exist, AWS mode will display server-provided analytics aggregates.</p>
            </>
          )}

          {page === "SageMaker Forecasting" && (
            <>
              <div className="forecast-header">
                <div>
                  <Badge tone="purple"><BrainCircuit size={13} /> Forecasting workspace</Badge>
                  <h2>Demand & revenue forecast</h2>
                  <p>Forecast results are estimates and require a deployed SageMaker endpoint to become real model output.</p>
                </div>
                <select className="select-control" value={forecastHorizon} onChange={e => setForecastHorizon(e.target.value)}>
                  <option>7 days</option><option>14 days</option><option>30 days</option><option>90 days</option>
                </select>
              </div>
              <div className="two-col">
                <Card>
                  <div className="card-heading"><div><h3>Forecast preview</h3><p>Illustrative placeholder — not model output</p></div><Badge tone="amber">Not connected</Badge></div>
                  <div className="forecast-chart">
                    <div className="forecast-bars">
                      {[45, 54, 48, 61, 58, 70, 64, 76, 73, 82, 78, 88].map((v, i) => (
                        <div key={i} style={{ height: `${v}%` }} className={i > 7 ? "forecast-bar forecast-future" : "forecast-bar"} />
                      ))}
                    </div>
                    <div className="forecast-labels"><span>Historical</span><span>Forecast →</span></div>
                  </div>
                  <Button variant="primary" onClick={() => (mode === "aws" ? notify("Forecast API is not configured yet") : notify("This is a visual preview only; no model was run."))}>
                    <Sparkles size={15} /> {mode === "aws" ? "Request forecast" : "Preview demo"}
                  </Button>
                </Card>
                <Card>
                  <div className="card-heading"><div><h3>Model connection</h3><p>Integration status</p></div><Server /></div>
                  <div className="model-status"><div><span>Model service</span><strong>SageMaker endpoint</strong></div><Badge tone="amber">Planned</Badge></div>
                  <div className="model-status"><div><span>API route</span><strong>GET /forecast?days={forecastHorizon.split(" ")[0]}</strong></div><Badge tone="gray">Not configured</Badge></div>
                  <div className="model-status"><div><span>Training dataset</span><strong>S3 Gold sales history</strong></div><Badge tone="gray">Planned</Badge></div>
                  <p className="small-note">No forecast numbers are presented as real until the backend returns model inference results.</p>
                </Card>
              </div>
            </>
          )}

          {page === "Bedrock Assistant" && (
            <div className="assistant-layout">
              <Card className="assistant-card">
                <div className="assistant-header">
                  <div className="assistant-avatar"><Bot size={23} /></div>
                  <div><h3>PricePulse AI</h3><p>Retail intelligence assistant</p></div>
                  <Badge tone={mode === "demo" ? "gray" : "amber"}>{mode === "demo" ? "Demo assistant" : "Bedrock pending"}</Badge>
                </div>
                <div className="assistant-messages">
                  <div className="assistant-msg">
                    <div className="assistant-avatar small"><Sparkles size={15} /></div>
                    <div>
                      <strong>PricePulse AI</strong>
                      <p>{mode === "demo" ? "Hi! I can answer simple questions from the current demo dataset. Try asking about revenue, top-selling items, or stock levels." : "Bedrock is planned. The API route will query approved analytics data and return cited metrics."}</p>
                    </div>
                  </div>
                  {chatHistory.map((m, i) => (
                    <div className={`assistant-msg ${m.role === "user" ? "user-msg" : ""}`} key={i}>
                      <div className="assistant-avatar small">{m.role === "user" ? "SM" : <Sparkles size={15} />}</div>
                      <div><strong>{m.role === "user" ? "You" : "PricePulse AI"}</strong><p>{m.text}</p></div>
                    </div>
                  ))}
                </div>
                <div className="suggested-prompts">
                  {["Summarize recorded sales", "Which products are low in stock?", "What are the top-selling products?"].map(q => (
                    <button key={q} onClick={() => answer(q)}>{q}<ArrowRight size={13} /></button>
                  ))}
                </div>
                <div className="assistant-input">
                  <input value={assistantInput} onChange={e => setAssistantInput(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder="Ask a question about your retail data…" />
                  <Button variant="primary" onClick={ask}><Send size={16} /></Button>
                </div>
                <small className="small-note">{mode === "demo" ? "Demo answers are calculated from browser data." : "AWS assistant requires a configured POST /assistant/query endpoint."}</small>
              </Card>
              <Card className="assistant-side">
                <div className="card-heading"><div><h3>What it can help with</h3><p>Business questions, not unrestricted data access</p></div></div>
                {["Sales performance summaries", "Low-stock and restock questions", "Product / category comparisons", "Competitor pricing insights", "Forecast explanations"].map((s, i) => (
                  <div className="assistant-capability" key={s}><span>{i + 1}</span>{s}</div>
                ))}
                <div className="ai-safety">
                  <ShieldCheck size={18} />
                  <div><strong>Data-grounded responses</strong><p>Production AI will query Athena/analytics results and cite the underlying metric.</p></div>
                </div>
              </Card>
            </div>
          )}

          {page === "Settings" && (
            <div className="settings-layout">
              <Card>
                <div className="card-heading"><div><h3>Store preferences</h3><p>Local preferences for this PricePulse workspace</p></div><Store /></div>
                <label className="field-label">Store name<input className="input-control" value={storeName} onChange={e => setStoreName(e.target.value)} /></label>
                <label className="field-label">
                  Currency
                  <select className="select-control full-width" value={currencyCode} onChange={e => setCurrencyCode(e.target.value)}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="AED">AED — UAE Dirham</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — Pound Sterling</option>
                  </select>
                </label>
                <label className="field-label">Tax rate (%)<input type="number" min="0" max="100" className="input-control" value={taxRate} onChange={e => setTaxRate(Math.max(0, Number(e.target.value)))} /></label>
                <Button variant="primary" onClick={() => notify("Store settings saved in browser")}>Save preferences</Button>
              </Card>
              <Card>
                <div className="card-heading"><div><h3>AWS API connection</h3><p>Configure API Gateway base URL. Never enter AWS keys here.</p></div><Cloud /></div>
                <label className="field-label">
                  API Gateway base URL
                  <input className="input-control" placeholder="https://abc123.execute-api.us-east-1.amazonaws.com/prod" value={apiBase} onChange={e => setApiBase(e.target.value)} />
                </label>
                <div className="connection-status">
                  <span className={`status-dot ${apiStatus === "connected" ? "" : "dot-warn"}`} />
                  <div>
                    <strong>{apiStatus === "connected" ? "API reachable" : apiStatus === "checking" ? "Checking connection…" : apiStatus === "error" ? "Connection failed" : "Not tested"}</strong>
                    <small>{apiError || "Expected GET /health endpoint"}</small>
                  </div>
                </div>
                <div className="settings-buttons">
                  <Button variant="primary" onClick={checkApi} disabled={apiStatus === "checking"}>
                    {apiStatus === "checking" ? <LoaderCircle className="spin" /> : <RefreshCw size={15} />} Test connection
                  </Button>
                  <Button onClick={() => handleSwitchMode(mode === "demo" ? "aws" : "demo")}>
                    {mode === "demo" ? "Switch to AWS mode" : "Switch to Demo mode"}
                  </Button>
                </div>
                <p className="small-note">When switching to AWS mode, products are loaded directly from S3. Products load independently even if /transactions is not yet deployed.</p>
              </Card>
              <Card>
                <div className="card-heading"><div><h3>Environment & deployment</h3><p>Frontend configuration</p></div><Settings /></div>
                <div className="settings-detail"><span>Runtime</span><strong>Next.js · React · TypeScript</strong></div>
                <div className="settings-detail"><span>Data mode</span><strong>{mode === "demo" ? "Browser localStorage" : "API Gateway / Lambda"}</strong></div>
                <div className="settings-detail"><span>Persistence</span><strong>{mode === "demo" ? "This browser only" : "AWS S3 backend"}</strong></div>
                <div className="settings-detail"><span>Security</span><strong>Frontend has no AWS credentials</strong></div>
              </Card>
              <Card>
                <div className="card-heading"><div><h3>Demo data</h3><p>Restore original seed catalog and transactions</p></div><RotateCcw /></div>
                <Button variant="danger" onClick={reset} disabled={mode === "aws"}>Restore seeded demo data</Button>
                <p className="small-note">Reset is disabled in AWS mode to avoid deleting real data.</p>
              </Card>
            </div>
          )}
        </div>

        <footer className="app-footer">
          <span>© 2026 PricePulse Retail Intelligence</span>
          <span><span className="status-dot" /> {mode === "demo" ? "Demo data · local only" : "AWS API mode · S3 persistence active"}</span>
        </footer>
      </main>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />{toast}<button onClick={() => setToast("")}><X size={14} /></button>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><h3>{editing ? "Edit product" : "Add product"}</h3><p>Catalog details</p></div>
              <button className="icon-btn" onClick={() => setModal(false)}><X /></button>
            </div>
            <div className="form-grid">
              <label className="field-label">Product name<input className="input-control" value={newName} onChange={e => setNewName(e.target.value)} /></label>
              <label className="field-label">SKU<input className="input-control" value={newSku} onChange={e => setNewSku(e.target.value)} /></label>
              <label className="field-label">
                Category
                <select className="select-control full-width" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                  {["Grocery", "Bakery", "Beverages", "Pantry", "Snacks", "Dairy", "Household", "Other"].map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">Retail price<input type="number" className="input-control" value={newPrice} onChange={e => setNewPrice(e.target.value)} /></label>
              <label className="field-label">Cost price<input type="number" className="input-control" value={newCost} onChange={e => setNewCost(e.target.value)} /></label>
              <label className="field-label">Stock quantity<input type="number" className="input-control" value={newStock} onChange={e => setNewStock(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <Button onClick={() => setModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveProduct}>Save product</Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Price Edit & Review Modal */}
      {priceModal && (
        <div className="modal-backdrop" onClick={() => setPriceModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-head">
              <div>
                <h3>Review & Update Price</h3>
                <p>{priceModal.product.name} · <span className="mono">{priceModal.product.sku}</span></p>
              </div>
              <button className="icon-btn" onClick={() => setPriceModal(null)}><X size={18} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "14px" }}>
              <div style={{ background: "#f8fafc", border: "1px solid #edf0f4", borderRadius: "8px", padding: "9px 11px" }}>
                <span style={{ fontSize: "9px", color: "#8a94a6", display: "block" }}>Current price</span>
                <strong style={{ fontSize: "13px", color: "#1e293b" }}>{fmt(priceModal.product.price)}</strong>
              </div>
              <div style={{ background: "#f8fafc", border: "1px solid #edf0f4", borderRadius: "8px", padding: "9px 11px" }}>
                <span style={{ fontSize: "9px", color: "#8a94a6", display: "block" }}>Cost</span>
                <strong style={{ fontSize: "13px", color: "#1e293b" }}>{fmt(priceModal.product.cost)}</strong>
              </div>
              <div style={{ background: "#fff9ee", border: "1px solid #f9e7c7", borderRadius: "8px", padding: "9px 11px" }}>
                <span style={{ fontSize: "9px", color: "#b7791f", display: "block" }}>Competitor</span>
                <strong style={{ fontSize: "13px", color: "#765217" }}>{fmt(priceModal.compPrice)}</strong>
                <small style={{ fontSize: "8px", color: "#b7791f", display: "block" }}>Simulated</small>
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Quick price presets
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "10px", padding: "5px 8px", background: "#edf7f5", color: "#0f8279" }}
                  onClick={() =>
                    setPriceModal({
                      ...priceModal,
                      price: priceModal.suggested.toFixed(2),
                      reason: "Automated recommendation applied"
                    })
                  }
                >
                  <Sparkles size={12} /> Suggested: {fmt(priceModal.suggested)}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "10px", padding: "5px 8px", background: "#f1f5f9", color: "#475569" }}
                  onClick={() =>
                    setPriceModal({
                      ...priceModal,
                      price: priceModal.compPrice.toFixed(2),
                      reason: "Matched competitor benchmark"
                    })
                  }
                >
                  Match competitor: {fmt(priceModal.compPrice)}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "10px", padding: "5px 8px", background: "#f1f5f9", color: "#475569" }}
                  onClick={() =>
                    setPriceModal({
                      ...priceModal,
                      price: priceModal.product.price.toFixed(2),
                      reason: "Reset to current price"
                    })
                  }
                >
                  Keep current: {fmt(priceModal.product.price)}
                </button>
              </div>
            </div>

            <div>
              <label className="field-label">
                New retail price ({currencyCode})
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-control"
                  style={{ width: "100%", fontSize: "15px", fontWeight: 700, marginTop: "6px" }}
                  value={priceModal.price}
                  onChange={e => setPriceModal({ ...priceModal, price: e.target.value })}
                  placeholder="0.00"
                  autoFocus
                />
              </label>

              <label className="field-label" style={{ marginTop: "12px" }}>
                Reason for price change
                <input
                  className="input-control"
                  style={{ width: "100%", marginTop: "6px" }}
                  value={priceModal.reason}
                  onChange={e => setPriceModal({ ...priceModal, reason: e.target.value })}
                  placeholder="e.g. Competitive adjustment, promo, seasonal repricing"
                />
              </label>

              {(() => {
                const entered = Number(priceModal.price) || 0;
                const cost = priceModal.product.cost || 0;
                const margin = entered > 0 ? (((entered - cost) / entered) * 100).toFixed(1) : "0.0";
                const gap = entered - priceModal.compPrice;
                return (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #edf0f4",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      marginTop: "14px",
                      fontSize: "11px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span className="muted">Projected gross margin:</span>
                      <strong className={Number(margin) >= 30 ? "text-green" : "text-amber"}>
                        {margin}% {Number(margin) < 15 ? "(Low margin alert)" : ""}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="muted">Price gap vs. competitor ({fmt(priceModal.compPrice)}):</span>
                      <strong className={gap < 0 ? "text-green" : gap > 0 ? "text-amber" : ""}>
                        {gap < 0 ? `${fmt(Math.abs(gap))} below` : gap > 0 ? `+${fmt(gap)} above` : "Exact match"}
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <Button onClick={() => setPriceModal(null)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={awsBusy || !priceModal.price || Number(priceModal.price) <= 0}
                onClick={savePriceModal}
              >
                {awsBusy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}
                {mode === "aws" ? "Save price to AWS S3" : "Save price (demo)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POS Receipt Modal */}
      {showReceipt && (
        <div className="modal-backdrop" onClick={() => setShowReceipt(null)}>
          <div className="modal receipt-modal" onClick={e => e.stopPropagation()}>
            <div className="receipt-top">
              <div className="receipt-check"><Check /></div>
              <h2>Checkout complete</h2>
              <p>{mode === "demo" ? "Demo transaction recorded" : "API confirmed transaction"}</p>
              <Badge tone="green">{showReceipt.id}</Badge>
            </div>
            <div className="receipt-body">
              <div className="receipt-meta"><span>{storeName}</span><span>{new Date(showReceipt.date).toLocaleString()}</span></div>
              {showReceipt.items.map((i, n) => (
                <div className="receipt-line" key={n}><span>{i.name} × {i.qty}</span><strong>{fmt(i.qty * i.price)}</strong></div>
              ))}
              <div className="receipt-line"><span>Subtotal</span><span>{fmt(showReceipt.subtotal)}</span></div>
              <div className="receipt-line"><span>Discount</span><span>−{fmt(showReceipt.discount)}</span></div>
              <div className="receipt-line"><span>Tax</span><span>{fmt(showReceipt.tax)}</span></div>
              <div className="receipt-line receipt-total"><strong>Total</strong><strong>{fmt(showReceipt.total)}</strong></div>
              <div className="receipt-meta"><span>Payment method</span><strong>{showReceipt.payment}</strong></div>
            </div>
            <div className="modal-actions">
              <Button onClick={() => window.print()}><Printer size={15} /> Print receipt</Button>
              <Button variant="primary" onClick={() => { setShowReceipt(null); navTo("POS & Billing"); }}>New sale</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionTable({ tx, fmt, onReceipt }: { tx: Tx[]; fmt: (n: number) => string; onReceipt: (t: Tx) => void }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Transaction</th><th>Date & time</th><th>Items</th><th>Payment</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          {tx.map(t => (
            <tr key={t.id}>
              <td><strong className="mono">{t.id}</strong></td>
              <td>{new Date(t.date).toLocaleString()}</td>
              <td>{t.items.reduce((a, i) => a + i.qty, 0)} items</td>
              <td><Badge tone="gray">{t.payment}</Badge></td>
              <td><strong>{fmt(t.total)}</strong></td>
              <td><button className="row-action" onClick={() => onReceipt(t)} title="View receipt"><Eye size={15} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!tx.length && <TableEmpty text="No transactions yet." />}
    </div>
  );
}
