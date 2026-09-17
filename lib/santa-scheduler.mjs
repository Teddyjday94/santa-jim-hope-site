const ACTIVE_BLOCKING_STATUSES = new Set(["pending", "confirmed"]);

function toMinutes(value) {
  const [hours, minutes] = String(value).split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return NaN;
  return hours * 60 + minutes;
}

function toTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function inSeason(date, settings) {
  return Boolean(
    date &&
    settings?.seasonStart &&
    settings?.seasonEnd &&
    date >= settings.seasonStart &&
    date <= settings.seasonEnd
  );
}

function normalizedRule(rule) {
  if (!rule) return { mode: "normal" };
  return rule;
}

export function intervalsOverlap(startA, endA, startB, endB) {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);
  if ([aStart, aEnd, bStart, bEnd].some(Number.isNaN)) return false;
  return aStart < bEnd && bStart < aEnd;
}

export function getAllowedServicesForDate({ date, services = [], settings, rule }) {
  if (!inSeason(date, settings)) return [];
  const currentRule = normalizedRule(rule);
  const activeServices = services.filter((service) => service.active !== false);

  if (currentRule.mode === "blocked") return [];
  if (currentRule.mode === "photos_only") {
    return activeServices.filter((service) => service.slug === "photo-session");
  }
  if (currentRule.mode === "custom") {
    const allowed = new Set(currentRule.allowedServiceSlugs ?? []);
    return activeServices.filter((service) => allowed.has(service.slug));
  }
  return activeServices;
}

function windowsForRule(settings, rule) {
  const currentRule = normalizedRule(rule);
  if (currentRule.mode === "blocked") return [];
  if (currentRule.mode === "custom") return Array.isArray(currentRule.windows) ? currentRule.windows : [];
  if (!settings?.defaultStartTime || !settings?.defaultEndTime) return [];
  return [{ start: settings.defaultStartTime, end: settings.defaultEndTime }];
}

function bookingBlocksSlot(booking, date, slotStart, occupiedEnd) {
  if (!booking || booking.date !== date || !ACTIVE_BLOCKING_STATUSES.has(booking.status)) return false;
  return intervalsOverlap(slotStart, occupiedEnd, booking.startTime, booking.endTime);
}

export function buildAvailableSlots({
  date,
  serviceSlug,
  services = [],
  settings,
  rule,
  bookings = [],
}) {
  const allowedServices = getAllowedServicesForDate({ date, services, settings, rule });
  const service = allowedServices.find((candidate) => candidate.slug === serviceSlug);
  if (!service) return [];

  const duration = Number(service.durationMinutes ?? 0);
  const buffer = Number(service.bufferMinutes ?? 0);
  const step = Math.max(1, Number(settings?.slotStepMinutes ?? 15));
  if (duration <= 0 || buffer < 0) return [];

  const slots = [];
  for (const window of windowsForRule(settings, rule)) {
    const windowStart = toMinutes(window.start);
    const windowEnd = toMinutes(window.end);
    if (!Number.isFinite(windowStart) || !Number.isFinite(windowEnd) || windowEnd <= windowStart) continue;

    for (let start = windowStart; start + duration + buffer <= windowEnd; start += step) {
      const startTime = toTime(start);
      const endTime = toTime(start + duration);
      const occupiedEnd = toTime(start + duration + buffer);
      const conflict = bookings.some((booking) => bookingBlocksSlot(booking, date, startTime, occupiedEnd));
      if (!conflict) slots.push({ startTime, endTime });
    }
  }
  return slots;
}

export function validateRequestedSlot(args) {
  const allowedServices = getAllowedServicesForDate(args);
  if (!allowedServices.some((service) => service.slug === args.serviceSlug)) {
    return { valid: false, reason: "service_unavailable" };
  }

  const slots = buildAvailableSlots(args);
  const selected = slots.find((slot) => slot.startTime === args.startTime);
  if (!selected) return { valid: false, reason: "slot_unavailable" };
  return { valid: true, endTime: selected.endTime };
}
