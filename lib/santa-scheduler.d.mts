export type SantaService = {
  slug: string;
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  active?: boolean;
};

export type SantaScheduleSettings = {
  seasonStart: string;
  seasonEnd: string;
  defaultStartTime: string;
  defaultEndTime: string;
  slotStepMinutes?: number;
};

export type SantaDayRule = {
  mode: "normal" | "photos_only" | "blocked" | "custom";
  allowedServiceSlugs?: string[];
  windows?: Array<{ start: string; end: string }>;
} | null;

export type SantaBookingInterval = {
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "declined" | "cancelled" | "expired";
};

export type SantaSlot = { startTime: string; endTime: string };

type SchedulerArgs = {
  date: string;
  services: SantaService[];
  settings: SantaScheduleSettings;
  rule: SantaDayRule;
};

export function intervalsOverlap(startA: string, endA: string, startB: string, endB: string): boolean;
export function getAllowedServicesForDate(args: SchedulerArgs): SantaService[];
export function buildAvailableSlots(args: SchedulerArgs & {
  serviceSlug: string;
  bookings?: SantaBookingInterval[];
}): SantaSlot[];
export function validateRequestedSlot(args: SchedulerArgs & {
  serviceSlug: string;
  startTime: string;
  bookings?: SantaBookingInterval[];
}): { valid: true; endTime: string } | { valid: false; reason: "service_unavailable" | "slot_unavailable" };
