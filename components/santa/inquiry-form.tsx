"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Check, MapPin } from "lucide-react";
import { validateInquiry } from "@/lib/booking-validation.mjs";
import { submitInquiry, type InquiryValues } from "@/lib/inquiry-delivery.mjs";

const eventTypes = [
  "Home visit",
  "Birthday surprise",
  "Corporate event",
  "School or group",
  "Community celebration",
  "Photo session",
];

export function InquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nextErrors = validateInquiry(values);
    setErrors(nextErrors);
    setDeliveryError("");

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSending(true);
    try {
      await submitInquiry(values as InquiryValues);
      setSubmitted(true);
    } catch (error) {
      setDeliveryError(error instanceof Error
        ? error.message
        : "We could not send your inquiry. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="form-success" role="status" tabIndex={-1} ref={successRef}>
        <span className="success-icon" aria-hidden="true"><Check size={24} /></span>
        <p className="eyebrow">Inquiry sent</p>
        <h3>Your inquiry has been sent.</h3>
        <p>Thank you for sharing your celebration details. Santa Jim will follow up about availability and next steps.</p>
        <button className="button button--quiet" type="button" onClick={() => setSubmitted(false)}>Send another inquiry</button>
      </div>
    );
  }

  const errorFor = (name: string) => errors[name] ? <span className="field-error" id={`${name}-error`} role="alert">{errors[name]}</span> : null;

  return (
    <form className="inquiry-form" action="https://formsubmit.co/thomasdbiz26@gmail.com" method="POST" noValidate onSubmit={handleSubmit}>
      <input name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
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
          <span>Event type *</span>
          <select name="eventType" defaultValue="" aria-invalid={Boolean(errors.eventType)} aria-describedby={errors.eventType ? "eventType-error" : undefined}>
            <option value="" disabled>Choose an experience</option>
            {eventTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
          {errorFor("eventType")}
        </label>
        <label className="field">
          <span><CalendarDays size={16} aria-hidden="true" /> Preferred date *</span>
          <input name="preferredDate" type="date" aria-invalid={Boolean(errors.preferredDate)} aria-describedby={errors.preferredDate ? "preferredDate-error" : undefined} />
          {errorFor("preferredDate")}
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
        <p>Your details will be sent securely so Santa Jim can follow up.</p>
        <button className="button button--gold" type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send inquiry"} <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
      {deliveryError ? <p className="field-error" role="alert">{deliveryError}</p> : null}
    </form>
  );
}
