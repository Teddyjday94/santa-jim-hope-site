import {
  SANTA_SITE_ID,
  SANTA_SUPABASE_PUBLISHABLE_KEY,
  SANTA_SUPABASE_URL,
} from "./santa-config";

export async function supabaseRest(path: string, init: RequestInit = {}, accessToken?: string) {
  const headers = new Headers(init.headers);
  headers.set("apikey", SANTA_SUPABASE_PUBLISHABLE_KEY);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetch(`${SANTA_SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function supabaseRpc(name: string, body: unknown, accessToken?: string) {
  return supabaseRest(`rpc/${name}`, {
    method: "POST",
    body: JSON.stringify(body),
  }, accessToken);
}

export async function invokeSupabaseFunction(name: string, body: unknown, accessToken?: string) {
  const headers = new Headers({
    apikey: SANTA_SUPABASE_PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(`${SANTA_SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export function bearerToken(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

export async function getSupabaseUser(accessToken: string) {
  if (!accessToken) return null;
  const response = await fetch(`${SANTA_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SANTA_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ id: string; email?: string }>;
}

export async function assertSantaAdmin(accessToken: string) {
  const user = await getSupabaseUser(accessToken);
  if (!user) return { authorized: false as const, user: null };

  const [profileResponse, membershipResponse] = await Promise.all([
    supabaseRest(`profiles?user_id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`, {}, accessToken),
    supabaseRest(`site_members?user_id=eq.${encodeURIComponent(user.id)}&site_id=eq.${SANTA_SITE_ID}&select=site_id&limit=1`, {}, accessToken),
  ]);

  const profiles = profileResponse.ok ? await profileResponse.json() as Array<{ role: string }> : [];
  const memberships = membershipResponse.ok ? await membershipResponse.json() as Array<{ site_id: string }> : [];
  const authorized = profiles[0]?.role === "admin" || memberships.length > 0;
  return { authorized, user };
}
