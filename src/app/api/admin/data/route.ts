import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { configured, db } from "@/lib/server/db";

async function permitted(request: Request): Promise<boolean> {
  if (!(await isAdmin())) return false;
  if (request.method === "GET") return true;
  const origin = request.headers.get("origin");
  return Boolean(origin && new URL(origin).host === request.headers.get("host"));
}

export async function GET(request: Request) {
  if (!(await permitted(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!configured()) return NextResponse.json({ error: "Configurá Supabase primero" }, { status: 503 });
  try {
    const [orders, catalog, inventory] = await Promise.all([
      db<any[]>("orders?select=*&order=created_at.desc&limit=200"),
      db<any[]>("catalog?select=id,data,price,active&order=id"),
      db<any[]>("inventory?select=product_id,color,size,quantity&order=product_id"),
    ]);
    return NextResponse.json({ orders, catalog, inventory }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No se pudieron consultar los datos" }, { status: 503 });
  }
}

async function patchExactlyOne(path: string, patch: Record<string, unknown>): Promise<void> {
  const rows = await db<Record<string, unknown>[]>(path, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error("El registro no existe o no pudo actualizarse");
  }
}

export async function PATCH(request: Request) {
  if (!(await permitted(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!configured()) return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  try {
    const input = await request.json();
    if (!input || typeof input.id !== "string" || input.id.length > 100) throw Error("invalid");
    if (input.kind === "order" && input.field === "status" &&
      ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"].includes(input.value)) {
      await db("rpc/set_order_status", { method: "POST", body: JSON.stringify({ order_uuid: input.id, new_status: input.value }) });
    } else if (input.kind === "order" && input.field === "payment_status" &&
      ["pending", "paid", "failed"].includes(input.value)) {
      await patchExactlyOne(`orders?id=eq.${encodeURIComponent(input.id)}`, { payment_status: input.value });
    } else if (input.kind === "product" && input.field === "price" &&
      Number.isSafeInteger(input.value) && input.value >= 0 && input.value <= 100000000) {
      await patchExactlyOne(`catalog?id=eq.${encodeURIComponent(input.id)}`, { price: input.value });
    } else if (input.kind === "product" && input.field === "active" && typeof input.value === "boolean") {
      await patchExactlyOne(`catalog?id=eq.${encodeURIComponent(input.id)}`, { active: input.value });
    } else if (input.kind === "stock" && typeof input.color === "string" && typeof input.size === "string" &&
      input.color.length <= 100 && input.size.length <= 50 &&
      Number.isSafeInteger(input.value) && input.value >= 0 && input.value <= 1000000) {
      const filter = `inventory?product_id=eq.${encodeURIComponent(input.id)}&color=eq.${encodeURIComponent(input.color)}&size=eq.${encodeURIComponent(input.size)}`;
      await patchExactlyOne(filter, { quantity: input.value });
    } else throw Error("invalid");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el cambio" }, { status: 400 });
  }
}
