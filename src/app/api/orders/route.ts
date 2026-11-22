import { NextResponse } from "next/server";
import { configured, db, DatabaseError } from "@/lib/server/db";

export async function POST(request: Request) {
  if (!configured()) return NextResponse.json({ error: "La tienda aún no está habilitada para pedidos reales" }, { status: 503 });
  try {
    const input = await request.json();
    if (!input || typeof input !== "object") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    const customer = input.customer;
    const items = input.items;
    if (
      !customer || typeof customer.name !== "string" || customer.name.trim().length < 3 || customer.name.length > 120 ||
      !/^5959\d{8}$/.test(customer.phone ?? "") || typeof customer.address !== "string" ||
      customer.address.length < 5 || customer.address.length > 500 ||
      (customer.notes !== undefined && (typeof customer.notes !== "string" || customer.notes.length > 500)) ||
      !Array.isArray(items) || items.length === 0 || items.length > 30 ||
      !items.every((item: any) => item && typeof item.productId === "string" && item.productId.length < 100 &&
        typeof item.color === "string" && item.color.length < 100 && typeof item.size === "string" && item.size.length < 50 &&
        Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 10) ||
      typeof input.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId) ||
      !Number.isSafeInteger(input.expectedSubtotal) || input.expectedSubtotal < 0 ||
      !Number.isSafeInteger(input.expectedDeliveryCost) || input.expectedDeliveryCost < 0 ||
      !["delivery", "pickup"].includes(input.deliveryMethod) ||
      !["transfer", "cash"].includes(input.paymentMethod)
    ) return NextResponse.json({ error: "Verificá los datos del pedido" }, { status: 400 });
    const orders = await db<{ id: string; code: string; created_at: string; customer: any; items: any; subtotal: number; delivery_cost: number; total: number; delivery_method: string; payment_method: string; status: string; payment_status: string }[]>(
      "rpc/place_order", { method: "POST", body: JSON.stringify({ payload: {
        requestId: input.requestId, customer, items: items.map(({ productId, color, size, quantity }: any) => ({ productId, color, size, quantity })),
        deliveryMethod: input.deliveryMethod, paymentMethod: input.paymentMethod,
        expectedSubtotal: input.expectedSubtotal, expectedDeliveryCost: input.expectedDeliveryCost,
      } }) },
    );
    const row = orders?.[0];
    if (!row) throw new Error("No se pudo registrar el pedido");
    return NextResponse.json({ order: {
      id: row.id, code: row.code, createdAt: row.created_at, customer: row.customer, items: row.items,
      subtotal: Number(row.subtotal), deliveryCost: Number(row.delivery_cost), total: Number(row.total),
      deliveryMethod: row.delivery_method, paymentMethod: row.payment_method, status: row.status, paymentStatus: row.payment_status,
    } }, { status: 201 });
  } catch (error) {
    if (error instanceof DatabaseError && error.status >= 500) {
      return NextResponse.json({ error: "El servidor de pedidos no está disponible. Probá nuevamente más tarde." }, { status: 503 });
    }
    return NextResponse.json({ error: "El stock o precio cambió. Revisá tu carrito e intentá nuevamente." }, { status: 409 });
  }
}
