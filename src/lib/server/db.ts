import "server-only";

const endpoint = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function configured() {
  return Boolean(endpoint && key);
}

export async function db<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!endpoint || !key) throw new Error("Base de datos no configurada");
  const res = await fetch(`${endpoint}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Database request failed:", res.status, path.split("?")[0]);
    throw new Error("La operación de base de datos no se pudo completar");
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
