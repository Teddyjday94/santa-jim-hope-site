import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { InquiryForm } from "@/components/santa/inquiry-form";
import { SiteShell } from "@/components/santa/site-shell";

export const metadata: Metadata = {
  title: "Invite Santa Jim | Santa Jim Hope",
  description: "Send Santa Jim Hope the details of your holiday celebration, preferred date, location, and event type.",
};

export default function InvitePage() {
  return (
    <SiteShell className="invite-page">
      <section className="invite-intro paper-section">
        <div>
          <p className="eyebrow eyebrow--dark">Invite Santa Jim</p>
          <h1>Begin with the details that matter.</h1>
          <p>
            Tell Santa Jim about the celebration you are planning. He will follow up
            directly to confirm availability and the next steps for your visit.
          </p>
        </div>
        <div className="invite-intro__photo">
          <Image src="/images/jim-hope-community.webp" alt="Santa Jim Hope at a holiday event" fill priority sizes="(max-width: 820px) 92vw, 38vw" />
        </div>
      </section>

      <section className="invite-form-section dark-section">
        <aside className="booking-intro">
          <p className="eyebrow">Plan the visit</p>
          <h2>Pick an experience, date, and available time.</h2>
          <p>The scheduler shows Santa Jim&apos;s current availability. Your requested time is held pending review after you submit.</p>
          <div className="booking-availability">
            <span className="booking-availability__pulse" aria-hidden="true" />
            <div>
              <strong>Holiday request calendar is open</strong>
              <span>Available times reflect Santa Jim&apos;s current schedule and special event-day rules.</span>
            </div>
          </div>
          <div className="booking-note">
            <CalendarDays size={20} aria-hidden="true" />
            <span>Choose an available time, then share the people and celebration details Santa Jim should know.</span>
          </div>
        </aside>
        <div className="north-pole-letter">
          <span className="north-pole-letter__postmark" aria-hidden="true">North Pole · Priority</span>
          <span className="north-pole-letter__seal" aria-hidden="true">SJH</span>
          <InquiryForm />
        </div>
      </section>
    </SiteShell>
  );
}
