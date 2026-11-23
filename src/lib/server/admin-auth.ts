import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const NAME = "offgrid_admin_session";
const TTL = 60 * 60 * 8;

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32
    ? process.env.ADMIN_SESSION_SECRET
    : null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

function signature(payload: string): string {
  return createHmac("sha256", secret()!).update(payload).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(NAME)?.value;
  if (!token) return false;
  const [expiry, nonce, mac, ...extra] = token.split(".");
  if (!expiry || !nonce || !mac || extra.length) return false;
  const deadline = Number(expiry);
  if (!Number.isSafeInteger(deadline) || deadline < Date.now() || deadline > Date.now() + TTL * 1000) return false;
  const expected = Buffer.from(signature(`${expiry}.${nonce}`), "hex");
  const received = Buffer.from(mac, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function validPassword(candidate: unknown): boolean {
  if (!adminConfigured() || typeof candidate !== "string") return false;
  const expected = createHmac("sha256", secret()!).update(process.env.ADMIN_PASSWORD!).digest();
  const received = createHmac("sha256", secret()!).update(candidate).digest();
  return timingSafeEqual(expected, received);
}

export async function createAdminSession(): Promise<void> {
  const expiry = String(Date.now() + TTL * 1000);
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expiry}.${nonce}`;
  (await cookies()).set(NAME, `${payload}.${signature(payload)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: TTL,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(NAME);
}
