import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { configured, db } from "@/lib/server/db";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  try {
    if (!origin || !host || new URL(origin).host !== host) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }
  if (!configured()) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 503 });

  try {
    const body = (await request.json()) as { confirmation?: unknown };
    if (body.confirmation !== "RESTABLECER DEMO") {
      return NextResponse.json({ error: "Confirmación inválida" }, { status: 400 });
    }
    const result = await db<{ orders_deleted: number; variants_reset: number }>("rpc/reset_offgrid_demo", {
      method: "POST",
      body: "{}",
    });
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No fue posible restablecer el catálogo" }, { status: 503 });
  }
}
