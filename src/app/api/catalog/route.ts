import { NextResponse } from "next/server";
import { products as baseProducts } from "@/data/products";
import { configured, db } from "@/lib/server/db";
import type { Product } from "@/types";

type CatalogRow = { id: string; data: Product; price: number; active: boolean };
type InventoryRow = { product_id: string; color: string; size: string; quantity: number };

export async function GET() {
  if (!configured()) return NextResponse.json({ products: baseProducts, configured: false }, { headers: { "Cache-Control": "no-store" } });
  try {
    const [catalog, inventory] = await Promise.all([
      db<CatalogRow[]>("catalog?select=id,data,price,active&order=id"),
      db<InventoryRow[]>("inventory?select=product_id,color,size,quantity"),
    ]);
    const displayOrder = new Map(baseProducts.map((product, index) => [product.id, index]));
    const products = catalog.filter((entry) => entry.active)
      .sort((first, second) => (displayOrder.get(first.id) ?? 9999) - (displayOrder.get(second.id) ?? 9999))
      .map((entry) => ({
      ...entry.data,
      price: Number(entry.price),
      variants: entry.data.variants?.map((variant) => ({
        ...variant,
        stock: Object.fromEntries(
          Object.keys(variant.stock ?? {}).map((size) => [
            size,
            inventory.find((row) => row.product_id === entry.id && row.color === variant.color && row.size === size)?.quantity ?? 0,
          ]),
        ),
      })),
    }));
    return NextResponse.json({ products, configured: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Catálogo temporalmente no disponible" }, { status: 503 });
  }
}
