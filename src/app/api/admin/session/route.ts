import { NextResponse } from "next/server";
import { adminConfigured, createAdminSession, endAdminSession, isAdmin, validPassword } from "@/lib/server/admin-auth";

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin(), configured: adminConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!validPassword(body?.password)) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
}

export async function DELETE() {
  await endAdminSession();
  return NextResponse.json({ ok: true });
}
