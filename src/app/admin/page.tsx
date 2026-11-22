"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/pricing";

type RecordRow = Record<string, any>;

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<{ catalog: RecordRow[]; inventory: RecordRow[]; orders: RecordRow[] } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"orders" | "stock">("orders");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.error || "No se pudo cargar"); return; }
    setData(payload); setError("");
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" }).then((res) => res.json()).then((res) => {
      if (res.authenticated) { setLoggedIn(true); void load(); }
    }).catch(() => setError("Sin conexión con el servidor"));
  }, [load]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!res.ok) throw new Error("Contraseña incorrecta o acceso no configurado");
      setPassword(""); setLoggedIn(true); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Error al entrar"); }
    setBusy(false);
  }

  async function update(kind: string, id: string, field: string, value: unknown, color?: string, size?: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      const res = await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, field, value, color, size }) });
      const response = await res.json();
      if (!res.ok) throw new Error(response.error || "No se pudo guardar");
      await load();
      // Notificar la página de tienda abierta en otra pestaña (mismo origen).
      window.localStorage.setItem("offgrid:catalog:refresh", String(Date.now()));
      window.dispatchEvent(new Event("offgrid:catalog-changed"));
      setNotice("Cambio guardado. El catálogo de esta versión de pruebas se actualiza automáticamente.");
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    setBusy(false);
  }

  async function seed() {
    if (!window.confirm("¿Inicializar los productos y stock de la BETA? Solo se permite con catálogo vacío.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    setBusy(false);
  }

  const input = "border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900";
  const btn = "border border-stone-800 px-4 py-2 text-sm disabled:opacity-50";

  if (!loggedIn) return (
    <main className="min-h-screen bg-[#f5f1e9] px-5 py-24 text-[#211f1c]">
      <form onSubmit={login} className="mx-auto max-w-sm space-y-5 border border-stone-300 p-8">
        <p className="text-xs tracking-[.3em]">OFFGRID / PRIVADO</p>
        <h1 className="font-serif text-3xl">Administración</h1>
        <label className="block text-sm">Contraseña
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input + " mt-2 w-full"} />
        </label>
        <button className="w-full bg-stone-900 px-4 py-3 text-sm text-white" disabled={busy}>INGRESAR</button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f5f1e9] px-4 py-12 text-[#211f1c] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-300 pb-6">
          <div><p className="text-xs tracking-[.25em]">OFFGRID / CONTROL</p><h1 className="mt-2 font-serif text-4xl">Panel administrativo</h1></div>
          <div className="flex flex-wrap gap-3">
            <a className={btn} href="/" target="_blank" rel="noopener noreferrer">Ver tienda BETA</a>
            <button className={btn} onClick={() => void load()}>Actualizar</button>
            <button className={btn} onClick={async () => { await fetch("/api/admin/session", { method: "DELETE" }); setLoggedIn(false); setData(null); }}>Salir</button>
          </div>
        </header>
        {error && <p role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="border border-stone-300 bg-white p-4 text-sm">{notice}</p>}
        {data && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="border border-stone-300 p-4"><p className="text-xs">PEDIDOS</p><p className="mt-2 text-3xl">{data.orders.length}</p></div>
          <div className="border border-stone-300 p-4"><p className="text-xs">PRODUCTOS</p><p className="mt-2 text-3xl">{data.catalog.length}</p></div>
          <div className="border border-stone-300 p-4"><p className="text-xs">STOCK TOTAL</p><p className="mt-2 text-3xl">{data.inventory.reduce((a, x) => a + x.quantity, 0)}</p></div>
        </div>}
        {data && data.catalog.length === 0 && <div className="border border-amber-400 p-5">
          <p className="mb-3 text-sm">La base de datos está vacía. Inicializá el catálogo una sola vez.</p>
          <button disabled={busy} className={btn} onClick={seed}>Inicializar productos y stock</button>
        </div>}
        <div className="flex gap-3">
          <button onClick={() => setTab("orders")} className={btn + (tab === "orders" ? " bg-stone-900 text-white" : "")}>Pedidos</button>
          <button onClick={() => setTab("stock")} className={btn + (tab === "stock" ? " bg-stone-900 text-white" : "")}>Productos y stock</button>
        </div>
        {tab === "orders" ? <section className="space-y-4">
          {data?.orders.length === 0 && <p>Sin pedidos todavía.</p>}
          {data?.orders.map((order) => <article key={order.id} className="space-y-3 border border-stone-300 p-5">
            <div className="flex flex-wrap justify-between gap-2"><strong>{order.code}</strong><span className="text-sm">{new Date(order.created_at).toLocaleString("es-PY")}</span></div>
            <p className="text-sm">{order.customer.name} · +{order.customer.phone} · {order.customer.address}</p>
            <p className="text-sm">{order.items.map((item: any) => `${item.name} (${item.color}/${item.size}) ×${item.quantity}`).join("; ")}</p>
            <p className="font-semibold">{formatPrice(Number(order.total))} · {order.payment_method}</p>
            <div className="flex flex-wrap gap-3">
              <label className="text-xs">Estado
                <select disabled={busy} className={input + " ml-2"} value={order.status} onChange={(e) => void update("order", order.id, "status", e.target.value)}>
                  {["pending","confirmed","preparing","shipped","delivered","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-xs">Pago
                <select disabled={busy} className={input + " ml-2"} value={order.payment_status} onChange={(e) => void update("order", order.id, "payment_status", e.target.value)}>
                  {["pending","paid","failed"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://wa.me/${order.customer.phone}?text=${encodeURIComponent(`Hola ${order.customer.name}, te escribimos de OFFGRID por tu pedido ${order.code}.`)}`}>Contactar cliente</a>
            </div>
          </article>)}
        </section> : <section className="space-y-4">
          {data?.catalog.map((product) => <article key={product.id} className="border border-stone-300 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium">{product.data.name}</h2>
              <label className="flex gap-2 text-sm"><input type="checkbox" disabled={busy} checked={product.active} onChange={(e) => void update("product", product.id, "active", e.target.checked)} />Activo</label>
            </div>
            <form className="my-4 flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); const value = Number(new FormData(e.currentTarget).get("price")); void update("product", product.id, "price", value); }}>
              <span className="text-sm">Precio (Gs.)</span><input name="price" type="number" min="0" required defaultValue={product.price} key={product.price} className={input + " w-40"} />
              <button className={btn} disabled={busy}>Guardar precio</button>
            </form>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.inventory.filter((stock) => stock.product_id === product.id).map((stock) =>
                <form key={stock.color + stock.size} className="flex flex-wrap items-center gap-2 border border-stone-200 p-3 text-sm" onSubmit={(e) => { e.preventDefault(); const val = Number(new FormData(e.currentTarget).get("qty")); void update("stock", product.id, "quantity", val, stock.color, stock.size); }}>
                  <span className="flex-1">{stock.color} · {stock.size}</span>
                  <input type="number" name="qty" min="0" required defaultValue={stock.quantity} key={stock.quantity} className={input + " w-20"} aria-label="Cantidad en stock" />
                  <button className={btn} disabled={busy}>Guardar</button>
                </form>)}
            </div>
          </article>)}
        </section>}
      </div>
    </main>
  );
}
