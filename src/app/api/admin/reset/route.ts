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
  } catch (error) {
    // PostgreSQL revierte toda la operación si la función falla. No
    // revelamos detalles internos de la base de datos al visitante.
    console.error("OFFGRID demo reset error:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({
      error: "No se pudo restablecer la DEMO. No se confirmó el restablecimiento. El administrador debe revisar la función SQL."
    }, { status: 503 });
  }
}
