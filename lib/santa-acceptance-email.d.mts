export type AcceptanceDeliveryMode = "test" | "live";
export type AcceptanceBookingRecord = {
  id?: unknown;
  customer_name?: unknown;
  customer_email?: unknown;
  [key: string]: unknown;
};
export type AcceptanceEmail = { from: string; to: string[]; subject: string; text: string; html: string };
export type AcceptanceEmailResult = {
  sent: boolean;
  mode: AcceptanceDeliveryMode;
  recipient: string;
  provider?: "resend" | "formsubmit";
  id?: string | null;
  error: string | null;
};
export function buildAcceptanceEmail(args: {
  booking: AcceptanceBookingRecord;
  deliveryMode?: string;
  testRecipient: string;
  from: string;
}): AcceptanceEmail;
export function sendAcceptanceEmail(args: {
  booking: AcceptanceBookingRecord;
  apiKey?: string;
  deliveryMode?: string;
  testRecipient: string;
  from?: string;
  fetchImpl?: typeof fetch;
}): Promise<AcceptanceEmailResult>;
