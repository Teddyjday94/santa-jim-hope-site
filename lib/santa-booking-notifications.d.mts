export type BookingDecision = "confirmed" | "declined";

export type BookingDecisionRecord = {
  customer_name?: unknown;
  customer_email?: unknown;
  service_slug?: unknown;
  local_date?: unknown;
  local_start_time?: unknown;
  [key: string]: unknown;
};

export function buildBookingDecisionNotification(args: {
  decision: BookingDecision | string;
  booking: BookingDecisionRecord;
  testRecipient: string;
}): {
  recipient: string;
  fields: Record<string, string>;
};

export function sendBookingDecisionNotification(args: {
  decision: BookingDecision;
  booking: BookingDecisionRecord;
  testRecipient: string;
  fetchImpl?: typeof fetch;
}): Promise<boolean>;
