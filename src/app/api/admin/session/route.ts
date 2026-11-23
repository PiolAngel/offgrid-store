import { NextResponse } from "next/server";
import { adminConfigured, createAdminSession, endAdminSession, isAdmin, validPassword } from "@/lib/server/admin-auth";

function isSameOrigin(request: Request): boolean {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!host || !origin) return false;
  try {
    const parsed = new URL(origin);
    return parsed.host === host &&
      (parsed.protocol === "https:" || (process.env.NODE_ENV !== "production" && parsed.protocol === "http:"));
  } catch {
    return false;
  }
}

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin(), configured: adminConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 2048) return NextResponse.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  try {
    const body = await request.json();
    if (!validPassword(body?.password)) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  await endAdminSession();
  return NextResponse.json({ ok: true });
}
