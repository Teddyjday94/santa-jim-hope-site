import type { SantaBookingInterval } from "./santa-scheduler.mjs";

export type CalendarBusyPeriod = {
  startTime: string;
  endTime: string;
};

export function mergeCalendarBusyIntervals(
  date: string,
  bookings: SantaBookingInterval[],
  busyPeriods: CalendarBusyPeriod[],
): SantaBookingInterval[];
