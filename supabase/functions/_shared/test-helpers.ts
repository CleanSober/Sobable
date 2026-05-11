import "https://deno.land/std@0.224.0/dotenv/load.ts";

export const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
export const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

export function fnUrl(name: string, path = "") {
  return `${SUPABASE_URL}/functions/v1/${name}${path}`;
}

export const baseHeaders = {
  apikey: ANON_KEY,
  "Content-Type": "application/json",
};

export async function call(
  name: string,
  init: RequestInit = {},
  path = "",
): Promise<Response> {
  const res = await fetch(fnUrl(name, path), {
    ...init,
    headers: { ...baseHeaders, ...(init.headers ?? {}) },
  });
  return res;
}

export async function drain(res: Response) {
  try { await res.text(); } catch { /* noop */ }
}
