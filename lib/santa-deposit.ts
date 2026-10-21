import { invokeSupabaseFunction } from "./santa-supabase";

export type DepositState = "awaiting" | "expired" | "paid" | "confirmed" | "closed";

export type DepositSummary = {
  state: DepositState;
  serviceName: string;
  customerName: string;
  eventLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  amountCents: number | null;
  holdExpiresAt: string | null;
};

export const DEPOSIT_TOKEN_PATTERN = /^[a-f0-9]{48,96}$/;

export async function lookupDeposit(token: string): Promise<DepositSummary | null> {
  if (!DEPOSIT_TOKEN_PATTERN.test(token)) return null;
  const response = await invokeSupabaseFunction("santa-deposit", { action: "lookup", token }).catch(() => null);
  if (!response?.ok) return null;
  return response.json() as Promise<DepositSummary>;
}

export async function startDepositCheckout(token: string, origin: string) {
  if (!DEPOSIT_TOKEN_PATTERN.test(token)) return { url: null, error: "This deposit link was not found." };
  const response = await invokeSupabaseFunction("santa-deposit", { action: "checkout", token, origin }).catch(() => null);
  const result = response ? await response.json().catch(() => ({})) as { url?: string; error?: string } : {};
  if (!response?.ok || !result.url) return { url: null, error: result.error || "The payment page could not be opened. Please try again." };
  return { url: result.url, error: null };
}

export function moneyLabel(cents: number | null) {
  if (!cents) return "";
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}
