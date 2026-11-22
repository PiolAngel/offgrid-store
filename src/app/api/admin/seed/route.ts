import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { configured, db } from "@/lib/server/db";
import { products } from "@/data/products";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!(await isAdmin()) || !origin || new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!configured()) return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  try {
    const existing = await db<{ id: string }[]>("catalog?select=id&limit=1");
    if (existing.length) return NextResponse.json({ error: "El catálogo ya está inicializado; no se modificará el stock" }, { status: 409 });
    await db("catalog", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(products.map((product) => ({
        id: product.id, data: product, price: product.price, active: true,
      }))),
    });
    const rows = products.flatMap((product) =>
      (product.variants ?? []).flatMap((variant) =>
        Object.entries(variant.stock ?? {}).map(([size, quantity]) => ({
          product_id: product.id, color: variant.color, size, quantity,
        })),
      ),
    );
    await db("inventory", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });
    return NextResponse.json({ ok: true, products: products.length, variants: rows.length });
  } catch {
    return NextResponse.json({ error: "No se pudo inicializar el catálogo. Revisá la base de datos." }, { status: 503 });
  }
}
