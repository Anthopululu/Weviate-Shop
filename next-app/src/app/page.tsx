"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────
interface ProductResult {
  name: string;
  brand: string;
  color: string;
  category: string;
  price: number;
  description: string;
  _additional?: { score?: string; distance?: string };
}

interface CartItem {
  product: ProductResult;
  qty: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  smartphone: "\u{1F4F1}",
  phone: "\u{1F4F1}",
  laptop: "\u{1F4BB}",
  tablet: "\u{1F4F1}",
  headphones: "\u{1F3A7}",
  speaker: "\u{1F50A}",
  smartwatch: "\u231A",
  shoes: "\u{1F45F}",
  watch: "\u231A",
};

function getEmoji(category: string | undefined) {
  if (!category) return "\u{1F4E6}";
  const lower = category.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "\u{1F4E6}";
}

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", white: "#f5f5f5", silver: "#c0c0c0", gray: "#808080",
  grey: "#808080", red: "#ef4444", blue: "#3b82f6", green: "#22c55e",
  yellow: "#eab308", orange: "#f97316", purple: "#a855f7", pink: "#ec4899",
  gold: "#d4a017", "rose gold": "#b76e79", brown: "#92400e", navy: "#1e3a5f",
  teal: "#14b8a6", midnight: "#191970", "space gray": "#4a4a4a",
  starlight: "#f5e6d3", graphite: "#41424c", "sky blue": "#87ceeb",
  "bay blue": "#4682b4", titanium: "#878681",
};

function getColorHex(colorName: string | undefined) {
  if (!colorName) return "#808080";
  const lower = colorName.toLowerCase();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return "#808080";
}

const PRICE_RE = /\s*(?:below|under|less than|<|sous|moins de)\s*\$?(\d+)/i;
const KNOWN_COLORS = ["black","white","silver","gray","grey","red","blue","green","yellow","orange","purple","pink","gold","rose gold","brown","navy","teal","midnight","space gray","starlight","graphite","sky blue","bay blue","titanium"];
const COLOR_RE = new RegExp(`\\b(${KNOWN_COLORS.join("|")})\\b`, "i");

function parseQuery(raw: string) {
  const priceMatch = raw.match(PRICE_RE);
  const price = priceMatch ? parseInt(priceMatch[1]) : null;
  let cleaned = raw.replace(PRICE_RE, "").trim();
  const colorMatch = cleaned.match(COLOR_RE);
  const color = colorMatch ? colorMatch[1].charAt(0).toUpperCase() + colorMatch[1].slice(1).toLowerCase() : null;
  if (color) cleaned = cleaned.replace(COLOR_RE, "").replace(/\s+/g, " ").trim();
  return { clean: cleaned, price, color };
}

// ─── Background Canvas ──────────────────────────────────────────────
function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    interface Point { x: number; y: number; vx: number; vy: number; r: number }
    let pts: Point[] = [];
    let animId: number;

    function resize() {
      c!.width = window.innerWidth;
      c!.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < 35; i++) {
      pts.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, c!.width, c!.height);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c!.width) p.vx *= -1;
        if (p.y < 0 || p.y > c!.height) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.strokeStyle = `rgba(0,212,138,${0.05 * (1 - d / 110)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(0,212,138,0.12)";
        ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
}

// ─── Weaviate Logo SVG ──────────────────────────────────────────────
function WeaviateLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 74.07 44.76" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wg1" x1="39.84" y1="-2385.28" x2="34.01" y2="-2442.48" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#75be2c"/><stop offset=".86" stopColor="#9dc03b"/></linearGradient>
        <linearGradient id="wg2" x1="37.06" y1="-2409.12" x2="37.06" y2="-2390.37" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#238d37"/><stop offset=".94" stopColor="#35537f"/></linearGradient>
        <linearGradient id="wg3" x1="35.07" y1="-2418.83" x2="37.98" y2="-2399.75" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#67d84d"/><stop offset="1" stopColor="#348522"/></linearGradient>
        <linearGradient id="wg4" x1="64.03" y1="-2433.87" x2="64.03" y2="-2400.61" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#e4d00a"/><stop offset=".56" stopColor="#c4d132"/></linearGradient>
        <linearGradient id="wg5" x1="10.04" y1="-2433.87" x2="10.04" y2="-2400.61" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#e4d00a"/><stop offset=".56" stopColor="#c4d132"/></linearGradient>
        <linearGradient id="wg6" x1="56.43" y1="-2400.25" x2="56.43" y2="-2389.16" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8ab11b"/><stop offset="1" stopColor="#6eaf02"/></linearGradient>
        <linearGradient id="wg7" x1="64.51" y1="-2413.64" x2="62.18" y2="-2394.97" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#75be2c"/><stop offset=".86" stopColor="#9dc03b"/></linearGradient>
        <linearGradient id="wg8" x1="17.64" y1="-2400.21" x2="17.64" y2="-2389.17" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8ab11b"/><stop offset="1" stopColor="#6eaf02"/></linearGradient>
        <linearGradient id="wg9" x1="11.82" y1="-2413.55" x2="9.53" y2="-2391.1" gradientTransform="translate(0 2433.92)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#75be2c"/><stop offset=".86" stopColor="#9dc03b"/></linearGradient>
      </defs>
      <path fill="url(#wg1)" d="M71.67,7.95L58.85.5c-2.15-1.25-4.85.31-4.85,2.79v18.84l-9.1-5.24c-4.88-2.81-10.88-2.8-15.74.02l-9.06,5.24V3.28c0-2.49-2.69-4.04-4.85-2.79L2.4,7.94c-1.49.86-2.4,2.46-2.4,4.18v17.71c0,1.24.31,2.42.88,3.46h0c.58,1.07,1.42,1.98,2.48,2.66l6.61,4.22,5.06,3.22c3.04,1.93,6.95,1.78,9.83-.39l.38-.3s.07-.06.11-.08l7.63-5.82c2.23-1.71,5.88-1.71,8.12,0l7.61,5.8s.03.02.04.03l.47.37c2.87,2.17,6.79,2.32,9.83.39l5.06-3.23,6.63-4.22c1.04-.67,1.88-1.59,2.46-2.64s.89-2.23.89-3.47V12.13h0c0-1.72-.91-3.32-2.4-4.18h.01Z"/>
      <path fill="url(#wg2)" d="M54.1,33.62v6.36c0,1.96-1.41,3.56-3.11,3.56-.67,0-1.51-.34-2.29-.93l-7.61-5.8c-2.23-1.71-5.88-1.71-8.12,0l-7.63,5.82c-.76.57-1.25.74-1.97.74-1.77.02-3.35-1.31-3.35-3.39v-6.34l10.9-7.04c3.74-2.41,8.52-2.41,12.25,0l10.92,6.88v.13h0Z"/>
      <path fill="url(#wg3)" d="M54,22.13l.03,11.59-10.84-6.93c-3.73-2.39-8.51-2.39-12.25,0l-10.87,6.94.02-11.58,9.07-5.25c4.86-2.82,10.86-2.82,15.74-.02l9.1,5.24h0Z"/>
      <path fill="url(#wg4)" d="M74.07,12.13v17.7c0,1.25-.31,2.42-.89,3.47l-19.19-11.17V3.28c0-2.49,2.7-4.04,4.85-2.79l12.82,7.46c1.49.86,2.4,2.46,2.4,4.18h0Z"/>
      <path fill="url(#wg5)" d="M20.08,3.28v18.87L.88,33.31C.31,32.26,0,31.08,0,29.84V12.13C0,10.41.91,8.81,2.4,7.95L15.23.49c2.15-1.25,4.85.31,4.85,2.79h0Z"/>
      <path fill="url(#wg6)" d="M50.72,43.32c1.7,0,3.3-1.34,3.3-3.28v-6.36s10.13,6.47,10.13,6.47l-5.12,3.26c-3.04,1.93-6.95,1.79-9.83-.39l-.48-.38c.72.49,1.33.68,2,.68h0Z"/>
      <path fill="url(#wg7)" d="M73.18,33.31c-.58,1.05-1.42,1.97-2.46,2.64l-6.63,4.22-10.08-6.45-.03-11.59,19.19,11.18h0Z"/>
      <path fill="url(#wg8)" d="M20.08,40.03c0,1.94,1.61,3.47,3.3,3.28.75-.09,1.34-.2,1.94-.66l-.46.36c-2.87,2.16-6.79,2.32-9.83.39l-5.06-3.23h0s10.11-6.46,10.11-6.46v6.31h0Z"/>
      <path fill="url(#wg9)" d="M20.08,22.15v11.57l-10.11,6.45h0s-6.61-4.2-6.61-4.2c-1.05-.67-1.9-1.59-2.48-2.66l19.19-11.16h0Z"/>
    </svg>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function Home() {
  const [smartMode, setSmartMode] = useState(false);
  const [query, setQuery] = useState("Blue iPhone below $500");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [graphql, setGraphql] = useState("");
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"wait" | "ok" | "err">("wait");
  const [statusText, setStatusText] = useState("Connecting...");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<ProductResult | null>(null);
  const [page, setPage] = useState<"shop" | "checkout" | "confirmation">("shop");
  const [orderNumber, setOrderNumber] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [seedMsg, setSeedMsg] = useState("");
  const hasSearched = useRef(false);

  // Connect to Weaviate on mount
  useEffect(() => {
    fetch("/api/meta")
      .then((r) => r.json())
      .then((meta) => {
        if (meta.error) throw new Error(meta.error);
        setStatus("ok");
        setStatusText(`Weaviate v${meta.version}`);
      })
      .catch(() => {
        setStatus("err");
        setStatusText("Disconnected");
      });
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalProduct(null);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { clean, price, color } = parseQuery(query);

  const runSearch = useCallback(async () => {
    hasSearched.current = true;
    setLoading(true);
    setError("");
    const { clean: q, price: p, color: c } = parseQuery(query);
    const mode = smartMode ? "hybrid_filtered" : "hybrid";
    const filters: Record<string, unknown> = {};
    const searchQuery = smartMode ? q : query;
    if (smartMode && p) filters.price = p;
    if (smartMode && c) filters.color = c;

    const start = performance.now();
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, mode, filters, limit: 12 }),
      });
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setGraphql(data.graphql || "");
      if (data.results?.errors) { setError(data.results.errors[0].message); return; }
      setProducts(data.results?.data?.Get?.Product || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [query, smartMode]);

  // Re-run search when toggling Smart mode (if a search was already done)
  useEffect(() => {
    setShowHidden(false);
    if (hasSearched.current) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartMode]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setSeedMsg(data.error ? `Error: ${data.error}` : data.message);
    } catch (e: unknown) {
      setSeedMsg(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  // Cart helpers
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);

  const addToCart = (product: ProductResult) => {
    setCart((prev) => {
      const key = product.name + "|" + product.color;
      const idx = prev.findIndex((c) => c.product.name + "|" + c.product.color === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], qty: next[index].qty + delta };
      if (next[index].qty <= 0) next.splice(index, 1);
      return next;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const placeOrder = () => {
    setOrderNumber(String(Math.floor(100000 + Math.random() * 900000)));
    setPage("confirmation");
    setCart([]);
  };

  // Chat helpers
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: chatMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Failed to connect." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const priceThreshold = price || 500;
  const RELEVANCE_THRESHOLD = 0.7;
  const displayProducts = smartMode
    ? products.filter((p) => {
        const s = parseFloat(p._additional?.score || "0");
        return s >= RELEVANCE_THRESHOLD;
      })
    : products;
  const filteredOutCount = products.length - displayProducts.length;

  return (
    <>
      <BackgroundCanvas />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ─── HEADER ─── */}
        <header className="border-b border-wv-border bg-wv-surface/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div
                className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer"
                onClick={() => setPage("shop")}
              >
                <WeaviateLogo />
                <div>
                  <div className="text-white font-extrabold text-lg leading-tight">Weaviate Shop</div>
                  <div className="text-[10px] text-wv-muted">Hybrid Search E-Commerce Demo</div>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { runSearch(); setPage("shop"); } }}
                    placeholder='Search products... (e.g. Blue iPhone below $500)'
                    className="search-input w-full px-5 py-3 bg-wv-dark border border-wv-border rounded-xl text-sm text-gray-200 focus:border-wv-green/50 focus:outline-none pr-24"
                  />
                  <button
                    onClick={() => { runSearch(); setPage("shop"); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-wv-green text-wv-dark text-xs font-bold rounded-lg hover:bg-wv-gl transition cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Cart + Status */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={() => setCartOpen(!cartOpen)} className="relative cursor-pointer group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-wv-green transition">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="cart-badge absolute -top-2 -right-2 bg-wv-green text-wv-dark text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <div className="w-px h-5 bg-wv-border" />
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${status}`} />
                  <span className={`text-xs ${status === "ok" ? "text-wv-green" : "text-wv-muted"}`}>{statusText}</span>
                </div>
              </div>
            </div>

            {/* Sub-header */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-wv-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium" style={{ color: smartMode ? "#6b7194" : "#ef4444" }}>Standard Search</span>
                  <div
                    className={`toggle-track ${smartMode ? "active" : ""}`}
                    onClick={() => setSmartMode(!smartMode)}
                  >
                    <div className="toggle-thumb" />
                  </div>
                  <span className="text-xs font-medium" style={{ color: smartMode ? "#00d48a" : "#6b7194" }}>Smart Search</span>
                </div>
                <div className="w-px h-5 bg-wv-border" />
                <div className="text-[11px] text-wv-muted">
                  {smartMode ? "Query parsed: price/color constraints extracted as Weaviate filters" : "Raw query sent as-is, price constraints ignored"}
                </div>
              </div>
              <div className="font-mono text-[11px]">
                <span className="text-gray-500">Searching for </span>
                {smartMode ? (
                  <>
                    <span className="text-wv-green">&quot;{clean}&quot;</span>
                    {(price || color) && (<span className="text-gray-500"> | Filter: </span>)}
                    {color && (<span className="text-wv-green">color = {color}</span>)}
                    {color && price && (<span className="text-gray-500">, </span>)}
                    {price && (<span className="text-wv-green">price &lt; ${price}</span>)}
                  </>
                ) : (
                  <span className="text-red-400">&quot;{query}&quot;</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ─── CART DRAWER ─── */}
        {cartOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setCartOpen(false)}>
            <div className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-wv-dark border-l border-wv-border z-41 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-wv-border flex items-center justify-between">
                <div className="text-white font-bold text-base">Your Cart ({cartCount})</div>
                <button onClick={() => setCartOpen(false)} className="text-wv-muted hover:text-white text-lg cursor-pointer">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {cart.length === 0 ? (
                  <div className="text-sm text-wv-muted text-center py-12">Your cart is empty</div>
                ) : (
                  cart.map((c, i) => (
                    <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-wv-border/50" : ""}`}>
                      <div className="text-2xl">{getEmoji(c.product.category)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{c.product.name}</div>
                        <div className="text-[11px] text-wv-muted flex items-center gap-1.5">
                          <span className="color-dot" style={{ background: getColorHex(c.product.color), width: 10, height: 10 }} />
                          {c.product.color} &middot; {c.product.brand}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(i, -1)} className="w-6 h-6 rounded bg-wv-surface text-gray-400 hover:text-white flex items-center justify-center text-sm cursor-pointer">-</button>
                        <span className="text-sm text-white w-5 text-center">{c.qty}</span>
                        <button onClick={() => updateQty(i, 1)} className="w-6 h-6 rounded bg-wv-surface text-gray-400 hover:text-white flex items-center justify-center text-sm cursor-pointer">+</button>
                      </div>
                      <div className="text-sm font-bold text-white w-16 text-right">${(c.product.price * c.qty).toFixed(0)}</div>
                      <button onClick={() => removeFromCart(i)} className="text-wv-muted hover:text-red-400 cursor-pointer text-sm">&times;</button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t border-wv-border px-5 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-wv-muted">Total</span>
                    <span className="text-xl font-bold text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => { setCartOpen(false); setPage("checkout"); }}
                    className="w-full py-3 bg-wv-green text-wv-dark font-bold rounded-xl hover:bg-wv-gl transition cursor-pointer"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PRODUCT MODAL ─── */}
        {modalProduct && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setModalProduct(null)}>
            <div className="bg-wv-card border border-wv-border rounded-2xl max-w-[480px] w-[90%] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-end mb-2">
                  <button onClick={() => setModalProduct(null)} className="text-wv-muted hover:text-white transition text-lg cursor-pointer">&times;</button>
                </div>
                <div className="text-center mb-5">
                  <div className="text-6xl mb-3">{getEmoji(modalProduct.category)}</div>
                  <div className="text-xs text-wv-muted uppercase tracking-wider">{modalProduct.category}</div>
                </div>
                <div className="text-center mb-5">
                  <div className="text-xl font-bold text-white mb-1">{modalProduct.name}</div>
                  <div className="text-sm text-wv-muted">{modalProduct.brand}</div>
                </div>
                <div className="text-center mb-6">
                  <span className={`text-3xl font-extrabold ${modalProduct.price < 500 ? "text-wv-green" : "text-red-400"}`}>
                    ${modalProduct.price?.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between py-2 border-b border-wv-border/50">
                    <span className="text-xs text-wv-muted">Color</span>
                    <div className="flex items-center gap-2">
                      <span className="color-dot" style={{ background: getColorHex(modalProduct.color) }} />
                      <span className="text-sm text-white">{modalProduct.color}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-wv-border/50">
                    <span className="text-xs text-wv-muted">Category</span>
                    <span className="text-sm text-white">{modalProduct.category}</span>
                  </div>
                  {(modalProduct._additional?.score || modalProduct._additional?.distance) && (
                    <div className="flex items-center justify-between py-2 border-b border-wv-border/50">
                      <span className="text-xs text-wv-muted">{modalProduct._additional?.score ? "Relevance score" : "Distance"}</span>
                      <span className="text-sm font-mono text-wv-green">
                        {parseFloat(modalProduct._additional?.score || modalProduct._additional?.distance || "0").toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
                {modalProduct.description && (
                  <div className="bg-wv-dark rounded-lg p-4 mb-5">
                    <div className="text-[10px] font-semibold text-wv-muted uppercase tracking-wider mb-2">Description</div>
                    <div className="text-sm text-gray-300 leading-relaxed">{modalProduct.description}</div>
                  </div>
                )}
                <button
                  onClick={() => { addToCart(modalProduct); setModalProduct(null); }}
                  className="w-full py-3 bg-wv-green text-wv-dark font-bold rounded-xl hover:bg-wv-gl transition cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SHOP PAGE ─── */}
        {page === "shop" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex gap-6">
                {/* Main content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm font-semibold text-white">
                        {smartMode ? "Smart Search results" : "Search results"}
                      </span>
                      {latency !== null && displayProducts.length > 0 && (
                        <span className="text-[11px] font-mono text-wv-muted ml-3">
                          {latency}ms &middot; {displayProducts.length} results
                          {smartMode && filteredOutCount > 0 && (
                            <span className="text-gray-600"> ({filteredOutCount} low-relevance hidden)</span>
                          )}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSeed}
                      disabled={seeding}
                      className="px-3 py-1.5 text-xs bg-wv-card border border-wv-border rounded-lg text-wv-muted hover:text-white hover:border-wv-green/50 transition cursor-pointer disabled:opacity-50"
                    >
                      {seeding ? "Seeding..." : "Seed Products"}
                    </button>
                  </div>

                  {seedMsg && (
                    <div className={`mb-4 px-4 py-2 rounded-lg text-xs ${seedMsg.startsWith("Error") ? "bg-red-500/10 text-red-400" : "bg-wv-green/10 text-wv-green"}`}>
                      {seedMsg}
                    </div>
                  )}

                  {error ? (
                    <div className="text-xs text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>
                  ) : loading ? (
                    <div className="text-sm text-wv-muted text-center py-12" style={{ animation: "pulse 1s infinite" }}>Searching...</div>
                  ) : displayProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayProducts.map((p, i) => {
                          const score = p._additional?.score || p._additional?.distance || "";
                          const scoreLabel = p._additional?.score ? "relevance" : p._additional?.distance ? "distance" : "";
                          const scoreValue = score ? parseFloat(score).toFixed(4) : "";
                          const isRelevant = p.price < priceThreshold;
                          const borderClass = smartMode ? "relevant" : isRelevant ? "" : "irrelevant";

                          return (
                            <div
                              key={i}
                              className={`product-card bg-wv-card rounded-xl p-4 border border-wv-border ${borderClass} fade-in cursor-pointer`}
                              style={{ animationDelay: `${i * 50}ms` }}
                              onClick={() => setModalProduct(p)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="text-3xl">{getEmoji(p.category)}</div>
                                {scoreValue && (
                                  <div className="px-2 py-0.5 bg-wv-dark rounded-full text-[10px] font-mono text-wv-muted">
                                    {scoreLabel}: {scoreValue}
                                  </div>
                                )}
                              </div>
                              <div className="text-sm font-semibold text-white mb-1 leading-snug">{p.name}</div>
                              <div className="text-[11px] text-wv-muted mb-3">{p.brand}</div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="color-dot" style={{ background: getColorHex(p.color) }} />
                                  <span className="text-[11px] text-gray-400">{p.color}</span>
                                </div>
                                <div className={`text-base font-bold ${isRelevant ? "text-wv-green" : "text-red-400"}`}>
                                  ${p.price?.toFixed(0)}
                                </div>
                              </div>
                              {p.description && (
                                <div className="text-[11px] text-wv-muted mt-3 leading-relaxed line-clamp-2">
                                  {p.description.length > 100 ? p.description.substring(0, 100) + "..." : p.description}
                                </div>
                              )}
                              {smartMode && scoreValue && (
                                <div className="mt-3 pt-2 border-t border-wv-border/30">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-wv-muted">Relevance</span>
                                    <span className="text-[10px] font-mono text-wv-green">{(parseFloat(score) * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-wv-dark rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${Math.min(parseFloat(score) * 100, 100)}%`,
                                        background: parseFloat(score) > 0.7 ? "#00d48a" : parseFloat(score) > 0.4 ? "#eab308" : "#f97316",
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              {!smartMode && !isRelevant && (
                                <div className="mt-2 text-[10px] text-red-400/70 flex items-center gap-1">
                                  <span>&#x26A0;</span> Over budget
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {smartMode && filteredOutCount > 0 && (
                        <>
                          <button
                            onClick={() => setShowHidden(!showHidden)}
                            className="mt-4 w-full py-2.5 px-4 rounded-xl border border-dashed border-wv-border text-xs text-wv-muted hover:text-white hover:border-wv-green/40 transition cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span style={{ transform: showHidden ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>&#x25BC;</span>
                            {showHidden ? "Hide" : "Show"} {filteredOutCount} low-relevance result{filteredOutCount > 1 ? "s" : ""} (below {(RELEVANCE_THRESHOLD * 100).toFixed(0)}%)
                          </button>
                          {showHidden && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                              {products
                                .filter((p) => parseFloat(p._additional?.score || "0") < RELEVANCE_THRESHOLD)
                                .map((p, i) => {
                                  const score = p._additional?.score || p._additional?.distance || "";
                                  const scoreLabel = p._additional?.score ? "relevance" : p._additional?.distance ? "distance" : "";
                                  const scoreValue = score ? parseFloat(score).toFixed(4) : "";
                                  return (
                                    <div
                                      key={`hidden-${i}`}
                                      className="product-card bg-wv-card rounded-xl p-4 border border-red-500/30 fade-in cursor-pointer"
                                      style={{ animationDelay: `${i * 50}ms` }}
                                      onClick={() => setModalProduct(p)}
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="text-3xl">{getEmoji(p.category)}</div>
                                        {scoreValue && (
                                          <div className="px-2 py-0.5 bg-wv-dark rounded-full text-[10px] font-mono text-red-400/70">
                                            {scoreLabel}: {scoreValue}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-sm font-semibold text-white mb-1 leading-snug">{p.name}</div>
                                      <div className="text-[11px] text-wv-muted mb-3">{p.brand}</div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="color-dot" style={{ background: getColorHex(p.color) }} />
                                          <span className="text-[11px] text-gray-400">{p.color}</span>
                                        </div>
                                        <div className="text-base font-bold text-red-400">
                                          ${p.price?.toFixed(0)}
                                        </div>
                                      </div>
                                      {scoreValue && (
                                        <div className="mt-3 pt-2 border-t border-wv-border/30">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-wv-muted">Relevance</span>
                                            <span className="text-[10px] font-mono text-red-400">{(parseFloat(score) * 100).toFixed(0)}%</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-wv-dark rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full"
                                              style={{
                                                width: `${Math.min(parseFloat(score) * 100, 100)}%`,
                                                background: "#f97316",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-wv-muted text-center py-16">
                      {hasSearched.current
                        ? smartMode && products.length > 0 && displayProducts.length === 0
                          ? `All ${products.length} results were below the relevance threshold (${RELEVANCE_THRESHOLD})`
                          : "No results found"
                        : <>Press <kbd className="px-2 py-0.5 bg-wv-card rounded text-xs border border-wv-border">Enter</kbd> or click <strong>Search</strong> to find products</>}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="w-80 flex-shrink-0 hidden lg:block">
                  <div className="sticky top-28 space-y-4">
                    <div className="bg-wv-card rounded-xl border border-wv-border overflow-hidden">
                      <div className="px-4 py-3 border-b border-wv-border bg-wv-surface/50">
                        <div className="text-xs font-semibold text-white">Behind the scenes</div>
                      </div>
                      <div className="px-4 py-3 border-b border-wv-border/50">
                        <div className="text-[10px] font-semibold text-wv-muted uppercase tracking-wider mb-2">Query parsing</div>
                        <div className="space-y-1.5">
                          <div className="font-mono text-[11px]">
                            <span className="text-gray-500">mode = </span>
                            <span className={smartMode ? "text-wv-green" : "text-red-400"}>
                              {smartMode ? "Smart" : "Standard"}
                            </span>
                          </div>
                          <div className="font-mono text-[11px]">
                            <span className="text-gray-500">query = </span>
                            <span className="text-gray-300">&quot;{smartMode ? clean : query}&quot;</span>
                          </div>
                          <div className="font-mono text-[11px]">
                            <span className="text-gray-500">filters = </span>
                            <span className={smartMode && (price || color) ? "text-wv-green" : "text-gray-500"}>
                              {smartMode && (price || color) ? [color && `color = "${color}"`, price && `price < ${price}`].filter(Boolean).join(", ") : "none"}
                            </span>
                          </div>
                          <div className="font-mono text-[11px]">
                            <span className="text-gray-500">min_relevance = </span>
                            <span className={smartMode ? "text-wv-green" : "text-gray-500"}>
                              {smartMode ? RELEVANCE_THRESHOLD : "none"}
                            </span>
                          </div>
                          {smartMode && filteredOutCount > 0 && (
                            <div className="font-mono text-[11px]">
                              <span className="text-gray-500">hidden = </span>
                              <span className="text-amber-400">{filteredOutCount} below threshold</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 border-b border-wv-border/50">
                        <div className="text-[10px] font-semibold text-wv-muted uppercase tracking-wider mb-2">Response time</div>
                        <div className={`font-mono text-lg font-bold ${latency === null ? "text-wv-muted" : latency < 300 ? "text-wv-green" : latency < 600 ? "text-amber-400" : "text-red-400"}`}>
                          {latency !== null ? `${latency}ms` : "-"}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-semibold text-wv-muted uppercase tracking-wider mb-2">Generated GraphQL</div>
                        <div className="code-block p-3 text-[11px] max-h-72 overflow-y-auto">
                          <pre className="text-gray-400 whitespace-pre-wrap">
                            {graphql || "Run a search to see the query"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CHECKOUT PAGE ─── */}
        {page === "checkout" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-8">
              <button onClick={() => setPage("shop")} className="text-wv-muted hover:text-white text-sm mb-6 flex items-center gap-2 cursor-pointer">
                <span>&larr;</span> Back to shop
              </button>
              <div className="text-2xl font-bold text-white mb-8">Checkout</div>
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-3 space-y-6">
                  <div className="bg-wv-card rounded-xl p-5 border border-wv-border">
                    <div className="text-sm font-semibold text-white mb-4">Shipping information</div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" className="checkout-input" placeholder="First name" defaultValue="John" />
                      <input type="text" className="checkout-input" placeholder="Last name" defaultValue="Doe" />
                      <input type="email" className="checkout-input col-span-2" placeholder="Email" defaultValue="john@example.com" />
                      <input type="text" className="checkout-input col-span-2" placeholder="Address" defaultValue="123 Weaviate Lane" />
                      <input type="text" className="checkout-input" placeholder="City" defaultValue="Amsterdam" />
                      <input type="text" className="checkout-input" placeholder="Zip code" defaultValue="1012 AB" />
                    </div>
                  </div>
                  <div className="bg-wv-card rounded-xl p-5 border border-wv-border">
                    <div className="text-sm font-semibold text-white mb-4">Payment method</div>
                    <div className="space-y-3">
                      <input type="text" className="checkout-input" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" className="checkout-input" placeholder="MM / YY" defaultValue="12 / 28" />
                        <input type="text" className="checkout-input" placeholder="CVC" defaultValue="123" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-wv-muted">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Demo only, no real payment processed
                    </div>
                  </div>
                  <button onClick={placeOrder} className="w-full py-3.5 bg-wv-green text-wv-dark font-bold rounded-xl hover:bg-wv-gl transition cursor-pointer text-sm">
                    Place Order
                  </button>
                </div>
                <div className="col-span-2">
                  <div className="bg-wv-card rounded-xl border border-wv-border overflow-hidden sticky top-28">
                    <div className="px-5 py-4 border-b border-wv-border">
                      <div className="text-sm font-semibold text-white">Order summary</div>
                    </div>
                    <div className="px-5 py-4 space-y-3 max-h-80 overflow-y-auto">
                      {cart.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="text-xl">{getEmoji(c.product.category)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">{c.product.name}</div>
                            <div className="text-[10px] text-wv-muted">{c.product.brand} &middot; Qty: {c.qty}</div>
                          </div>
                          <div className="text-xs font-bold text-white">${(c.product.price * c.qty).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-4 border-t border-wv-border space-y-2">
                      <div className="flex justify-between text-xs text-wv-muted">
                        <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-wv-muted">
                        <span>Shipping</span><span className="text-wv-green">Free</span>
                      </div>
                      <div className="flex justify-between text-xs text-wv-muted">
                        <span>Tax</span><span>${(cartTotal * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-wv-border/50">
                        <span>Total</span><span>${(cartTotal * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CONFIRMATION PAGE ─── */}
        {page === "confirmation" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-6 py-16 text-center">
              <div className="text-6xl mb-6">&#10003;</div>
              <div className="text-2xl font-bold text-white mb-2">Order Confirmed!</div>
              <div className="text-sm text-wv-muted mb-2">Order #WV-{orderNumber}</div>
              <div className="text-sm text-wv-muted mb-8">This is a demo, no actual order was placed.</div>
              <button
                onClick={() => setPage("shop")}
                className="px-8 py-3 bg-wv-green text-wv-dark font-bold rounded-xl hover:bg-wv-gl transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── CHAT FAB ─── */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-wv-green text-wv-dark flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer"
        title="RAG Chat Assistant"
      >
        {chatOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {/* ─── CHAT POPUP ─── */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-wv-dark border border-wv-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "500px" }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-wv-border bg-wv-surface/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-wv-green/20 flex items-center justify-center">
              <WeaviateLogo />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">RAG Assistant</div>
              <div className="text-[10px] text-wv-muted">Powered by Weaviate + Groq</div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-wv-muted hover:text-white cursor-pointer text-lg">&times;</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">&#x1F916;</div>
                <div className="text-sm text-wv-muted mb-1">Hi! Ask me about our products.</div>
                <div className="text-[11px] text-gray-600">I use vector search to find relevant products, then generate answers with AI.</div>
                <div className="mt-4 space-y-2">
                  {["What blue phones do you have?", "Best headphones under $400?", "Compare iPhone 14 vs 15"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="block w-full text-left px-3 py-2 rounded-lg bg-wv-surface/50 border border-wv-border/50 text-[11px] text-gray-400 hover:text-white hover:border-wv-green/30 transition cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-wv-green text-wv-dark rounded-br-md"
                      : "bg-wv-surface border border-wv-border text-gray-300 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-wv-surface border border-wv-border px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-wv-muted rounded-full" style={{ animation: "pulse 1s infinite" }} />
                    <span className="w-2 h-2 bg-wv-muted rounded-full" style={{ animation: "pulse 1s infinite 0.2s" }} />
                    <span className="w-2 h-2 bg-wv-muted rounded-full" style={{ animation: "pulse 1s infinite 0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-wv-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                placeholder="Ask about products..."
                className="flex-1 px-3.5 py-2.5 bg-wv-surface border border-wv-border rounded-xl text-[13px] text-gray-200 focus:border-wv-green/50 focus:outline-none"
              />
              <button
                onClick={sendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="px-3.5 py-2.5 bg-wv-green text-wv-dark rounded-xl font-bold text-xs hover:bg-wv-gl transition cursor-pointer disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
