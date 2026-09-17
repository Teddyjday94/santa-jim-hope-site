"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Check, Clock, MapPin, Sparkles } from "lucide-react";
import { validateInquiry } from "@/lib/booking-validation.mjs";
import { submitInquiry, type InquiryValues } from "@/lib/inquiry-delivery.mjs";

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

function serviceDurationLabel(service: SchedulerService) {
  if (service.durationMinutes < 60) return `${service.durationMinutes} min`;
  if (service.durationMinutes === 60) return "1 hour";
  if (service.durationMinutes % 60 === 0) return `${service.durationMinutes / 60} hours`;
  return `${Math.floor(service.durationMinutes / 60)} hr ${service.durationMinutes % 60} min`;
}

export function InquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [scheduler, setScheduler] = useState<SchedulerConfig | null>(null);
  const [schedulerError, setSchedulerError] = useState("");
  const [loadingScheduler, setLoadingScheduler] = useState(true);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<SchedulerSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SchedulerSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const successRef = useRef<HTMLDivElement>(null);
  const serviceGroupRef = useRef<HTMLDivElement>(null);
  const timeGroupRef = useRef<HTMLDivElement>(null);

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

  const selectedServiceDetails = useMemo(
    () => scheduler?.services.find((service) => service.slug === selectedService) ?? null,
    [scheduler, selectedService],
  );

  const selectedRule = useMemo(
    () => scheduler?.dayRules.find((rule) => rule.date === selectedDate) ?? null,
    [scheduler, selectedDate],
  );

  const dateAllowsService = useMemo(() => {
    if (!selectedDate || !selectedService || !scheduler) return false;
    if (selectedDate < scheduler.settings.seasonStart || selectedDate > scheduler.settings.seasonEnd) return false;
    if (!selectedRule || selectedRule.mode === "normal") return true;
    if (selectedRule.mode === "blocked") return false;
    if (selectedRule.mode === "photos_only") return selectedService === "photo-session";
    return selectedRule.allowedServiceSlugs?.includes(selectedService) ?? false;
  }, [scheduler, selectedDate, selectedRule, selectedService]);

  useEffect(() => {
    if (!selectedDate || !selectedService || !scheduler) {
      setSlots([]);
      setSelectedSlot(null);
      setAvailabilityMessage("");
      return;
    }

    if (!dateAllowsService) {
      setSlots([]);
      setSelectedSlot(null);
      if (selectedRule?.mode === "photos_only") {
        setAvailabilityMessage("This is a Pictures with Santa day. Only photo sessions can be requested.");
      } else if (selectedRule?.mode === "blocked") {
        setAvailabilityMessage("Santa Jim has blocked this date from booking requests.");
      } else {
        setAvailabilityMessage("That experience is not available on this date. Please choose another date.");
      }
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
          setAvailabilityMessage(result.slots.length ? "" : "No times remain for this experience on that date.");
        }
      } catch (error) {
        if (!cancelled) {
          setSlots([]);
          setAvailabilityMessage(error instanceof Error ? error.message : "Available times could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => { cancelled = true; };
  }, [scheduler, selectedDate, selectedService, selectedRule, dateAllowsService, availabilityVersion]);

  function chooseService(slug: string) {
    setSelectedService(slug);
    setSelectedDate("");
    setSlots([]);
    setSelectedSlot(null);
    setAvailabilityMessage("");
    setErrors((current) => ({ ...current, eventType: "", preferredDate: "", startTime: "" }));
  }

  function chooseDate(value: string) {
    setSelectedDate(value);
    setSlots([]);
    setSelectedSlot(null);
    setErrors((current) => ({ ...current, preferredDate: "", startTime: "" }));
  }

  function chooseSlot(slot: SchedulerSlot) {
    setSelectedSlot(slot);
    setErrors((current) => ({ ...current, startTime: "", endTime: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nextErrors = validateInquiry(values);
    setErrors(nextErrors);
    setDeliveryError("");

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      if (firstInvalid === "eventType") serviceGroupRef.current?.focus();
      else if (firstInvalid === "startTime") timeGroupRef.current?.focus();
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
      if (/time|available|requested|conflict/i.test(message)) {
        setSelectedSlot(null);
        setAvailabilityVersion((version) => version + 1);
        timeGroupRef.current?.focus();
      }
    } finally {
      setSending(false);
    }
  }

  function resetRequest() {
    setSubmitted(false);
    setSelectedService("");
    setSelectedDate("");
    setSlots([]);
    setSelectedSlot(null);
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
        <p>The requested time is being held while Santa Jim reviews the details. This is not a confirmed booking until the request is approved.</p>
        <button className="button button--quiet" type="button" onClick={resetRequest}>Send another request</button>
      </div>
    );
  }

  const errorFor = (name: string) => errors[name]
    ? <span className="field-error" id={`${name}-error`} role="alert">{errors[name]}</span>
    : null;

  return (
    <form className="inquiry-form" noValidate onSubmit={handleSubmit}>
      <input name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
      <input type="hidden" name="eventType" value={selectedService} />
      <input type="hidden" name="startTime" value={selectedSlot?.startTime ?? ""} />
      <input type="hidden" name="endTime" value={selectedSlot?.endTime ?? ""} />

      <div className="scheduler-panel">
        <div className="scheduler-heading">
          <div>
            <p className="eyebrow">Request a date</p>
            <h3>Find a time that works</h3>
          </div>
          <span className="scheduler-heading__icon" aria-hidden="true"><Sparkles size={20} /></span>
        </div>

        <div className="scheduler-step">
          <div className="scheduler-step__title">
            <span className="scheduler-step__number">1</span>
            <div>
              <strong>Choose an experience</strong>
              <span>Dates and times adjust to the kind of visit you choose.</span>
            </div>
          </div>
          <div
            className="scheduler-services"
            id="scheduler-service"
            ref={serviceGroupRef}
            tabIndex={-1}
            aria-describedby={errors.eventType ? "eventType-error" : undefined}
          >
            {loadingScheduler ? <p className="scheduler-status">Loading Santa Jim&apos;s experiences…</p> : null}
            {schedulerError ? <p className="scheduler-status scheduler-status--warning" role="alert">{schedulerError}</p> : null}
            {scheduler?.services.map((service) => {
              const active = selectedService === service.slug;
              return (
                <button
                  className={`scheduler-service${active ? " scheduler-service--selected" : ""}`}
                  type="button"
                  key={service.slug}
                  onClick={() => chooseService(service.slug)}
                  aria-pressed={active}
                >
                  <span>{service.name}</span>
                  <small>{serviceDurationLabel(service)}</small>
                </button>
              );
            })}
          </div>
          {errorFor("eventType")}
        </div>

        <div className="scheduler-step">
          <div className="scheduler-step__title">
            <span className="scheduler-step__number">2</span>
            <div>
              <strong>Choose a date</strong>
              <span>Special photo-only and blocked days are enforced automatically.</span>
            </div>
          </div>
          <label className="field scheduler-date-field">
            <span><CalendarDays size={16} aria-hidden="true" /> Preferred date *</span>
            <input
              name="preferredDate"
              type="date"
              value={selectedDate}
              min={scheduler?.settings.seasonStart}
              max={scheduler?.settings.seasonEnd}
              disabled={!selectedService || loadingScheduler || Boolean(schedulerError)}
              onChange={(event) => chooseDate(event.target.value)}
              aria-invalid={Boolean(errors.preferredDate)}
              aria-describedby={errors.preferredDate ? "preferredDate-error" : undefined}
            />
            {errorFor("preferredDate")}
          </label>
          {selectedDate ? (
            <p className="scheduler-date-caption">
              {dateLabel(selectedDate)}
              {selectedRule?.mode === "photos_only" ? " · Pictures with Santa only" : ""}
              {selectedRule?.mode === "custom" ? " · Special availability" : ""}
            </p>
          ) : null}
        </div>

        <div className="scheduler-step scheduler-step--last">
          <div className="scheduler-step__title">
            <span className="scheduler-step__number">3</span>
            <div>
              <strong>Choose an available time</strong>
              <span>{selectedServiceDetails ? `${selectedServiceDetails.name} · ${serviceDurationLabel(selectedServiceDetails)}` : "Choose an experience and date first."}</span>
            </div>
          </div>
          <div
            className="scheduler-times"
            id="scheduler-times"
            ref={timeGroupRef}
            tabIndex={-1}
            aria-describedby={errors.startTime ? "startTime-error" : undefined}
          >
            {loadingSlots ? <p className="scheduler-status"><Clock size={16} aria-hidden="true" /> Checking available times…</p> : null}
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
          {errorFor("startTime")}
          {selectedSlot && selectedServiceDetails ? (
            <div className="scheduler-summary" role="status">
              <Check size={17} aria-hidden="true" />
              <span>
                Requesting <strong>{selectedServiceDetails.name}</strong> on <strong>{dateLabel(selectedDate)}</strong> from <strong>{timeLabel(selectedSlot.startTime)}</strong> to <strong>{timeLabel(selectedSlot.endTime)}</strong>.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="scheduler-details-heading">
        <p className="eyebrow">Your details</p>
        <h3>Tell Santa Jim where the magic is happening</h3>
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
        <label className="field">
          <span><MapPin size={16} aria-hidden="true" /> Event location *</span>
          <input name="location" autoComplete="address-level2" placeholder="City and state" aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "location-error" : undefined} />
          {errorFor("location")}
        </label>
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
        <p>Submitting holds this time as a pending request until Santa Jim accepts or declines it.</p>
        <button className="button button--gold" type="submit" disabled={sending || loadingScheduler || Boolean(schedulerError)}>
          {sending ? "Sending request…" : "Request this time"} <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
      {deliveryError ? <p className="field-error form-delivery-error" role="alert">{deliveryError}</p> : null}
    </form>
  );
}