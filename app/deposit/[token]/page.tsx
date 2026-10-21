import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check, Clock, CreditCard, MapPin } from "lucide-react";
import { SiteShell } from "@/components/santa/site-shell";
import { lookupDeposit, moneyLabel } from "@/lib/santa-deposit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pay your Santa Jim deposit",
  robots: { index: false, follow: false },
};

function dateLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    .format(new Date(year, month - 1, day, 12));
}

function timeLabel(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minuteText} ${hour >= 12 ? "PM" : "AM"}`;
}

function holdLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  }).format(new Date(value));
}

export default async function DepositPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string; error?: string }>;
}) {
  const { token } = await params;
  const { paid, error } = await searchParams;
  const deposit = await lookupDeposit(token);
  if (!deposit) notFound();

  const amount = moneyLabel(deposit.amountCents);
  const confirmed = deposit.state === "paid" || deposit.state === "confirmed";
  const processing = paid === "1" && deposit.state === "awaiting";

  return (
    <SiteShell className="invite-page invite-page--stationery deposit-page">
      <section className="invite-form-section invite-form-section--stationery">
        <div className="north-pole-letter deposit-card">
          <p className="eyebrow">{confirmed ? "Booking confirmed" : "Booking accepted"}</p>
          <h1>
            {confirmed
              ? "Your date with Santa Jim is confirmed!"
              : processing
                ? "Payment received. Confirming your date…"
                : deposit.state === "awaiting"
                  ? `Pay your ${amount} deposit to lock in your date`
                  : deposit.state === "expired"
                    ? "This date hold has ended"
                    : "This request is no longer active"}
          </h1>

          <dl className="deposit-summary">
            <div><dt>Visit</dt><dd>{deposit.serviceName} for {deposit.customerName}</dd></div>
            <div><dt><CalendarDays size={16} aria-hidden="true" /> Date</dt><dd>{dateLabel(deposit.date)}</dd></div>
            <div><dt><Clock size={16} aria-hidden="true" /> Time</dt><dd>{timeLabel(deposit.startTime)} – {timeLabel(deposit.endTime)}</dd></div>
            {deposit.eventLocation ? <div><dt><MapPin size={16} aria-hidden="true" /> Where</dt><dd>{deposit.eventLocation}</dd></div> : null}
            {amount ? <div><dt><CreditCard size={16} aria-hidden="true" /> Deposit</dt><dd>{amount}{confirmed && deposit.state === "paid" ? " (paid)" : ""}</dd></div> : null}
          </dl>

          {confirmed ? (
            <p className="deposit-message deposit-message--success" role="status">
              <Check size={18} aria-hidden="true" /> Thank you! Your deposit is paid and Santa Jim has you on his calendar. A receipt was emailed to you by Stripe.
            </p>
          ) : null}

          {processing ? (
            <p className="deposit-message" role="status">
              Stripe has your payment. It can take a minute for your booking to show as confirmed. Refresh this page shortly.
            </p>
          ) : null}

          {deposit.state === "awaiting" && !processing ? (
            <>
              {deposit.holdExpiresAt ? <p className="deposit-message">Santa Jim is holding this date for you until <strong>{holdLabel(deposit.holdExpiresAt)}</strong>.</p> : null}
              <p className="deposit-message deposit-message--notice">
                The {amount} deposit is <strong>non-refundable</strong>. It reserves Santa Jim for your event, and the rest is due on the day of the visit.
              </p>
              {error ? <p className="field-error" role="alert">{error}</p> : null}
              <form action="/api/santa/deposit" method="post">
                <input type="hidden" name="token" value={token} />
                <button className="button button--gold deposit-pay" type="submit">
                  <CreditCard size={18} aria-hidden="true" /> Pay {amount} deposit
                </button>
              </form>
              <p className="deposit-fineprint">You will finish paying on Stripe&apos;s secure checkout page.</p>
            </>
          ) : null}

          {deposit.state === "expired" ? (
            <p className="deposit-message">
              The deposit was not paid before the hold ended, so the date was released. If you still want this date, please <Link href="/invite">send a new request</Link> or contact Santa Jim.
            </p>
          ) : null}

          {deposit.state === "closed" ? (
            <p className="deposit-message">This booking request was declined or cancelled. Please <Link href="/invite">send a new request</Link> if you would like to pick another date.</p>
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}
