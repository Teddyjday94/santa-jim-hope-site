export type InquiryValues = {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  preferredDate: string;
  location: string;
  guestCount: string;
  notes: string;
  _honey: string;
};

export const FORM_ENDPOINT: string;
export function buildInquiryPayload(values: InquiryValues): Record<string, string>;
export function submitInquiry(
  values: InquiryValues,
  fetchImpl?: typeof fetch,
): Promise<unknown>;
