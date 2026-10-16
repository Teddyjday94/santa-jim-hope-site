"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Building2, Camera, Check, ChevronLeft, ChevronRight, Clock, Gift, House, MapPin, Sparkles, Star, UsersRound, Video } from "lucide-react";
import { validateInquiry } from "@/lib/booking-validation.mjs";
import { submitInquiry, type InquiryValues } from "@/lib/inquiry-delivery.mjs";
import { PHOTO_SERVICE_SLUG, usesTimeSlots } from "@/lib/santa-scheduler.mjs";

type SchedulerService = {
  slug: string;
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  active?: boolean;
};

type SchedulerSettings = {
  seasonStart: string;
  seasonEnd: string;
  defaultStartTime: string;
  defaultEndTime: string;
  slotStepMinutes: number;
  pendingHoldMinutes: number;
  timezone: string;
};

type SchedulerDayRule = {
  date: string;
  mode: "normal" | "photos_only" | "blocked" | "custom";
  allowedServiceSlugs?: string[];
  windows?: Array<{ start: string; end: string }>;
};

type SchedulerSlot = { startTime: string; endTime: string };

type SchedulerConfig = {
  settings: SchedulerSettings;
  services: SchedulerService[];
  dayRules: SchedulerDayRule[];
};

type SchedulerConfigResponse = Partial<SchedulerConfig> & { error?: string };
type SchedulerSlotsResponse = { slots?: SchedulerSlot[]; error?: string };

const ZOOM_SERVICE_SLUG = "zoom-call";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function timeLabel(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText} ${suffix}`;
}

function dateLabel(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day, 12));
}

function serviceDetailLabel(service: SchedulerService) {
  if (!usesTimeSlots(service.slug)) return "You choose the start and end time";
  return `${service.durationMinutes} minute time slots`;
}

function serviceIcon(slug: string) {
  const props = { size: 20, strokeWidth: 1.8, "aria-hidden": true as const };
  switch (slug) {
    case "home-visit":
      return <House {...props} />;
    case "birthday-surprise":
      return <Gift {...props} />;
    case "corporate-event":
      return <Building2 {...props} />;
    case "school-or-group":
      return <UsersRound {...props} />;
    case "community-celebration":
      return <Star {...props} />;
    case PHOTO_SERVICE_SLUG:
      return <Camera {...props} />;
    case ZOOM_SERVICE_SLUG:
      return <Video {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

function isoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayIso() {
  const now = new Date();
  return isoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function monthKey(value: string) {
  return value.slice(0, 7);
}

function shiftMonth(key: string, delta: number) {
  const [year, month] = key.split("-").map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

function servicesForDay(services: SchedulerService[], rule: SchedulerDayRule | null) {
  const active = services.filter((service) => service.active !== false);
  if (!rule || rule.mode === "normal") return active;
  if (rule.mode === "blocked") return [];
  if (rule.mode === "photos_only") return active.filter((service) => service.slug === PHOTO_SERVICE_SLUG);
  const allowed = new Set(rule.allowedServiceSlugs ?? []);
  return active.filter((service) => allowed.has(service.slug));
}

function scrollToStep(element: HTMLElement | null) {
  if (!element) return;
  window.requestAnimationFrame(() => {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    element.focus({ preventScroll: true });
  });
}

function BookingCalendar({
  settings,
  dayRules,
  selectedDate,
  onSelect,
}: {
  settings: SchedulerSettings;
  dayRules: SchedulerDayRule[];
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const firstOpenDate = todayIso() > settings.seasonStart ? todayIso() : settings.seasonStart;
  const lastDate = settings.seasonEnd;
  const [visibleMonth, setVisibleMonth] = useState(() => monthKey(selectedDate || firstOpenDate));
  const shownMonth = visibleMonth < monthKey(firstOpenDate) ? monthKey(firstOpenDate) : visibleMonth;
  const rulesByDate = useMemo(() => new Map(dayRules.map((rule) => [rule.date, rule])), [dayRules]);

  const [year, month] = shownMonth.split("-").map(Number);
  const leadingBlanks = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthTitle = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
  const canGoBack = shownMonth > monthKey(firstOpenDate);
  const canGoForward = shownMonth < monthKey(lastDate);

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__header">
        <button type="button" className="booking-calendar__nav" onClick={() => setVisibleMonth(shiftMonth(shownMonth, -1))} disabled={!canGoBack}>
          <ChevronLeft size={20} aria-hidden="true" /> <span>Previous</span>
        </button>
        <h4 aria-live="polite">{monthTitle}</h4>
        <button type="button" className="booking-calendar__nav" onClick={() => setVisibleMonth(shiftMonth(shownMonth, 1))} disabled={!canGoForward}>
          <span>Next</span> <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="booking-calendar__grid" role="group" aria-label={`Days in ${monthTitle}`}>
        {WEEKDAYS.map((weekday) => <span className="booking-calendar__weekday" key={weekday} aria-hidden="true">{weekday}</span>)}
        {Array.from({ length: leadingBlanks }, (_, index) => <span className="booking-calendar__blank" key={`blank-${index}`} aria-hidden="true" />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = isoDate(year, month - 1, day);
          const rule = rulesByDate.get(date);
          const outOfRange = date < firstOpenDate || date > lastDate;
          const blocked = rule?.mode === "blocked";
          const photoOnly = rule?.mode === "photos_only";
          const selected = date === selectedDate;
          const classes = [
            "booking-calendar__day",
            photoOnly && !outOfRange ? "booking-calendar__day--photo" : "",
            selected ? "booking-calendar__day--selected" : "",
          ].filter(Boolean).join(" ");
          const note = outOfRange ? "" : blocked ? "Unavailable" : photoOnly ? "Photos only" : "";
          return (
            <button
              type="button"
              key={date}
              className={classes}
              disabled={outOfRange || blocked}
              aria-pressed={selected}
              aria-label={`${dateLabel(date)}${note ? `, ${note}` : ""}`}
              onClick={() => onSelect(date)}
            >
              <span className="booking-calendar__number">{day}</span>
              {note ? (
                <span className="booking-calendar__tag">
                  {photoOnly ? <Camera size={12} aria-hidden="true" /> : null}
                  {note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="booking-calendar__legend">
        <span><span className="booking-calendar__swatch booking-calendar__swatch--photo" aria-hidden="true" /> Pictures with Santa day: only photo sessions</span>
        <span><span className="booking-calendar__swatch booking-calendar__swatch--open" aria-hidden="true" /> Open for any visit</span>
      </div>
    </div>
  );
}

export function InquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [scheduler, setScheduler] = useState<SchedulerConfig | null>(null);
  const [schedulerError, setSchedulerError] = useState("");
  const [loadingScheduler, setLoadingScheduler] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [slots, setSlots] = useState<SchedulerSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SchedulerSlot | null>(null);
  const [openStartTime, setOpenStartTime] = useState("");
  const [openEndTime, setOpenEndTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const successRef = useRef<HTMLDivElement>(null);
  const dateStepRef = useRef<HTMLDivElement>(null);
  const serviceStepRef = useRef<HTMLDivElement>(null);
  const timeStepRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  useEffect(() => {
    let cancelled = false;
    async function loadScheduler() {
      setLoadingScheduler(true);
      setSchedulerError("");
      try {
        const response = await fetch("/api/santa/availability", { cache: "no-store" });
        const result = await response.json().catch(() => ({})) as SchedulerConfigResponse;
        if (!response.ok || !result.settings || !Array.isArray(result.services) || !Array.isArray(result.dayRules)) {
          throw new Error(result.error || "Santa Jim's schedule could not be loaded.");
        }
        if (!cancelled) setScheduler(result as SchedulerConfig);
      } catch (error) {
        if (!cancelled) {
          setSchedulerError(error instanceof Error ? error.message : "Santa Jim's schedule could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoadingScheduler(false);
      }
    }
    loadScheduler();
    return () => { cancelled = true; };
  }, []);

  const selectedRule = useMemo(
    () => scheduler?.dayRules.find((rule) => rule.date === selectedDate) ?? null,
    [scheduler, selectedDate],
  );

  const dayServices = useMemo(
    () => (scheduler && selectedDate ? servicesForDay(scheduler.services, selectedRule) : []),
    [scheduler, selectedDate, selectedRule],
  );

  const selectedServiceDetails = dayServices.find((service) => service.slug === selectedService) ?? null;
  const slotMode = usesTimeSlots(selectedService);
  const isZoom = selectedService === ZOOM_SERVICE_SLUG;

  useEffect(() => {
    if (!selectedDate || !selectedServiceDetails || !slotMode) {
      setSlots([]);
      setAvailabilityMessage("");
      return;
    }

    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setAvailabilityMessage("");
      try {
        const params = new URLSearchParams({ date: selectedDate, service: selectedService });
        const response = await fetch(`/api/santa/availability?${params.toString()}`, { cache: "no-store" });
        const result = await response.json().catch(() => ({})) as SchedulerSlotsResponse;
        if (!response.ok || !Array.isArray(result.slots)) {
          throw new Error(result.error || "Available times could not be loaded.");
        }
        if (!cancelled) {
          setSlots(result.slots);
          setAvailabilityMessage(result.slots.length ? "" : "All photo times on this day are taken. Please pick another day.");
        }
      } catch {
        if (!cancelled) {
          setSlots([]);
          setAvailabilityMessage("Photo times could not be loaded right now. Please try again in a few minutes.");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => { cancelled = true; };
  }, [selectedDate, selectedService, selectedServiceDetails, slotMode, availabilityVersion]);

  function chooseDate(value: string) {
    setSelectedDate(value);
    setSelectedService("");
    setSelectedSlot(null);
    setOpenStartTime("");
    setOpenEndTime("");
    setErrors({});
    setDeliveryError("");
    scrollToStep(serviceStepRef.current);
  }

  function chooseService(slug: string) {
    setSelectedService(slug);
    setSelectedSlot(null);
    setOpenStartTime("");
    setOpenEndTime("");
    setErrors((current) => ({ ...current, eventType: "", startTime: "", endTime: "" }));
    scrollToStep(timeStepRef.current);
  }

  function chooseSlot(slot: SchedulerSlot) {
    setSelectedSlot(slot);
    setErrors((current) => ({ ...current, startTime: "", endTime: "" }));
    scrollToStep(detailsRef.current);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nextErrors = validateInquiry(values);
    if (!slotMode && values.startTime && !values.endTime) nextErrors.endTime = "Choose an end time.";
    setErrors(nextErrors);
    setDeliveryError("");

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      if (firstInvalid === "preferredDate") scrollToStep(dateStepRef.current);
      else if (firstInvalid === "eventType") scrollToStep(serviceStepRef.current);
      else if (firstInvalid === "startTime" || firstInvalid === "endTime") scrollToStep(timeStepRef.current);
      else form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSending(true);
    try {
      await submitInquiry(values as InquiryValues);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not send your request. Please try again.";
      setDeliveryError(message);
      if (slotMode && /time|available|requested|conflict/i.test(message)) {
        setSelectedSlot(null);
        setAvailabilityVersion((version) => version + 1);
        scrollToStep(timeStepRef.current);
      }
    } finally {
      setSending(false);
    }
  }

  function resetRequest() {
    setSubmitted(false);
    setSelectedDate("");
    setSelectedService("");
    setSlots([]);
    setSelectedSlot(null);
    setOpenStartTime("");
    setOpenEndTime("");
    setErrors({});
    setDeliveryError("");
    setAvailabilityMessage("");
  }

  if (submitted) {
    return (
      <div className="form-success" role="status" tabIndex={-1} ref={successRef}>
        <span className="success-icon" aria-hidden="true"><Check size={24} /></span>
        <p className="eyebrow">Request received</p>
        <h3>Your request is pending Santa Jim&apos;s approval.</h3>
        <p>Santa Jim will review the details and follow up. This is not a confirmed booking until the request is approved.</p>
        <button className="button button--quiet" type="button" onClick={resetRequest}>Send another request</button>
      </div>
    );
  }

  const errorFor = (name: string) => errors[name]
    ? <span className="field-error" id={`${name}-error`} role="alert">{errors[name]}</span>
    : null;

  const startTimeValue = slotMode ? selectedSlot?.startTime ?? "" : openStartTime;
  const endTimeValue = slotMode ? selectedSlot?.endTime ?? "" : openEndTime;
  const timeChosen = Boolean(startTimeValue && endTimeValue && endTimeValue > startTimeValue);

  return (
    <form className="inquiry-form" noValidate onSubmit={handleSubmit}>
      <input name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
      <input type="hidden" name="preferredDate" value={selectedDate} />
      <input type="hidden" name="eventType" value={selectedService} />
      <input type="hidden" name="startTime" value={startTimeValue} />
      <input type="hidden" name="endTime" value={endTimeValue} />

      <div className="scheduler-panel">
        <div className="scheduler-heading">
          <div>
            <p className="eyebrow">Request a visit</p>
            <h3>Pick a day on Santa&apos;s calendar</h3>
          </div>
          <span className="scheduler-heading__icon" aria-hidden="true"><Sparkles size={20} /></span>
        </div>

        <div className="scheduler-step" ref={dateStepRef} tabIndex={-1}>
          <div className="scheduler-step__title">
            <span className="scheduler-step__number">1</span>
            <div>
              <strong>Choose a day</strong>
              <span>Tap any open day. Gold days are Pictures with Santa days.</span>
            </div>
          </div>
          {loadingScheduler ? <p className="scheduler-status">Loading Santa Jim&apos;s calendar…</p> : null}
          {schedulerError ? <p className="scheduler-status scheduler-status--warning" role="alert">{schedulerError}</p> : null}
          {scheduler ? (
            <BookingCalendar
              settings={scheduler.settings}
              dayRules={scheduler.dayRules}
              selectedDate={selectedDate}
              onSelect={chooseDate}
            />
          ) : null}
          {errorFor("preferredDate")}
        </div>

        <div className={`scheduler-step${selectedDate ? "" : " scheduler-step--waiting"}`} ref={serviceStepRef} tabIndex={-1}>
          <div className="scheduler-step__title">
            <span className="scheduler-step__number">2</span>
            <div>
              <strong>What would you like to schedule?</strong>
              <span>{selectedDate ? dateLabel(selectedDate) : "Pick a day on the calendar first."}</span>
            </div>
          </div>
          {selectedDate && selectedRule?.mode === "photos_only" ? (
            <p className="scheduler-photo-day"><Camera size={18} aria-hidden="true" /> This is a Pictures with Santa day. Only photo sessions can be booked.</p>
          ) : null}
          {selectedDate ? (
            <div className="scheduler-services">
              {dayServices.length === 0 ? <p className="scheduler-status scheduler-status--warning">Nothing can be booked on this day. Please pick another day.</p> : null}
              {dayServices.map((service) => {
                const active = selectedService === service.slug;
                return (
                  <button
                    className={`scheduler-service${active ? " scheduler-service--selected" : ""}`}
                    type="button"
                    key={service.slug}
                    onClick={() => chooseService(service.slug)}
                    aria-pressed={active}
                  >
                    <span className="scheduler-service__icon">{serviceIcon(service.slug)}</span>
                    <span className="scheduler-service__copy">
                      <span>{service.name}</span>
                      <small>{serviceDetailLabel(service)}</small>
                    </span>
                    <ChevronRight className="scheduler-service__chevron" size={18} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ) : null}
          {errorFor("eventType")}
        </div>

        <div className={`scheduler-step scheduler-step--last${selectedServiceDetails ? "" : " scheduler-step--waiting"}`} ref={timeStepRef} tabIndex={-1}>
          <div className="scheduler-step__title">
            <span className="scheduler-step__number">3</span>
            <div>
              <strong>{!selectedServiceDetails ? "Choose a time" : slotMode ? "Pick a photo time" : "Choose your start and end time"}</strong>
              <span>
                {!selectedServiceDetails
                  ? "Choose what you would like to schedule first."
                  : slotMode
                    ? `${selectedServiceDetails.name} · ${selectedServiceDetails.durationMinutes} minutes`
                    : `${selectedServiceDetails.name} · Pick the times that fit your celebration.`}
              </span>
            </div>
          </div>
          {selectedServiceDetails && slotMode ? (
            <div className="scheduler-times">
              {loadingSlots ? <p className="scheduler-status"><Clock size={16} aria-hidden="true" /> Checking photo times…</p> : null}
              {!loadingSlots && availabilityMessage ? <p className="scheduler-status scheduler-status--warning">{availabilityMessage}</p> : null}
              {!loadingSlots && slots.map((slot) => {
                const active = selectedSlot?.startTime === slot.startTime;
                return (
                  <button
                    className={`scheduler-time${active ? " scheduler-time--selected" : ""}`}
                    type="button"
                    key={slot.startTime}
                    onClick={() => chooseSlot(slot)}
                    aria-pressed={active}
                  >
                    <Clock size={15} aria-hidden="true" />
                    <span>{timeLabel(slot.startTime)}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
          {selectedServiceDetails && !slotMode ? (
            <div className="scheduler-open-times">
              <label className="field">
                <span><Clock size={16} aria-hidden="true" /> Start time *</span>
                <input
                  type="time"
                  value={openStartTime}
                  onChange={(event) => { setOpenStartTime(event.target.value); setErrors((current) => ({ ...current, startTime: "", endTime: "" })); }}
                  aria-invalid={Boolean(errors.startTime)}
                  aria-describedby={errors.startTime ? "startTime-error" : undefined}
                />
              </label>
              <label className="field">
                <span><Clock size={16} aria-hidden="true" /> End time *</span>
                <input
                  type="time"
                  value={openEndTime}
                  onChange={(event) => { setOpenEndTime(event.target.value); setErrors((current) => ({ ...current, endTime: "" })); }}
                  aria-invalid={Boolean(errors.endTime)}
                  aria-describedby={errors.endTime ? "endTime-error" : undefined}
                />
              </label>
            </div>
          ) : null}
          {errorFor("startTime")}
          {errorFor("endTime")}
          {selectedServiceDetails && timeChosen ? (
            <div className="scheduler-summary" role="status">
              <Check size={17} aria-hidden="true" />
              <span>
                Requesting <strong>{selectedServiceDetails.name}</strong> on <strong>{dateLabel(selectedDate)}</strong> from <strong>{timeLabel(startTimeValue)}</strong> to <strong>{timeLabel(endTimeValue)}</strong>.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="scheduler-details-heading" ref={detailsRef} tabIndex={-1}>
        <p className="eyebrow">Your details</p>
        <h3>{isZoom ? "Tell Santa Jim about your Zoom call" : "Tell Santa Jim where the magic is happening"}</h3>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Your name *</span>
          <input name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
          {errorFor("name")}
        </label>
        <label className="field">
          <span>Email address *</span>
          <input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
          {errorFor("email")}
        </label>
        <label className="field">
          <span>Phone number</span>
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        {isZoom ? (
          <input type="hidden" name="location" value="Zoom (online)" />
        ) : (
          <label className="field">
            <span><MapPin size={16} aria-hidden="true" /> Event location *</span>
            <input name="location" autoComplete="address-level2" placeholder="City and state" aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "location-error" : undefined} />
            {errorFor("location")}
          </label>
        )}
        <label className="field">
          <span>Estimated guest count</span>
          <input name="guestCount" type="number" min="1" inputMode="numeric" aria-invalid={Boolean(errors.guestCount)} aria-describedby={errors.guestCount ? "guestCount-error" : undefined} />
          {errorFor("guestCount")}
        </label>
        <label className="field field--wide">
          <span>Tell Santa about the celebration</span>
          <textarea name="notes" rows={5} placeholder="Share the occasion, the age range, and any moments you hope to include." />
        </label>
      </div>
      <div className="form-footer">
        <p>Submitting sends a pending request until Santa Jim accepts or declines it.</p>
        <button className="button button--gold" type="submit" disabled={sending || loadingScheduler || Boolean(schedulerError)}>
          {sending ? "Sending request…" : "Send my request"} <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
      {deliveryError ? <p className="field-error form-delivery-error" role="alert">{deliveryError}</p> : null}
    </form>
  );
}
