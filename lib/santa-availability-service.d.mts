export type SantaAvailabilitySlot = {
  startTime: string;
  endTime: string;
};

export type SantaAvailabilityResult = {
  status: number;
  body: {
    error?: string;
    slots?: SantaAvailabilitySlot[];
    [key: string]: unknown;
  };
};

type AvailabilityLoader = (args: {
  date: string;
  serviceSlug: string;
}) => Promise<SantaAvailabilityResult>;

export function validateBookingAvailability(args: {
  date: string;
  serviceSlug: string;
  startTime: string;
  loadAvailability: AvailabilityLoader;
}): Promise<
  | { available: true; endTime: string }
  | { available: false; reason: "slot_unavailable" }
  | { available: false; reason: "availability_error"; error: string }
>;

export function loadSantaAvailability(args: {
  date: string;
  serviceSlug: string;
  siteId: string;
  supabaseRest: (path: string) => Promise<Response>;
  invokeSupabaseFunction: (name: string, body: unknown) => Promise<Response>;
}): Promise<SantaAvailabilityResult>;
