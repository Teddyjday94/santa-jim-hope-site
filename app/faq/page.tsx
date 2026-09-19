import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { FaqList } from "@/components/santa/faq-list";
import { SiteShell } from "@/components/santa/site-shell";
import { faqs } from "@/components/santa/site-content";

export const metadata: Metadata = {
  title: "FAQ | Santa Jim Hope",
  description: "Answers about booking timing, personalization, event types, travel, and planning a Santa Jim Hope holiday appearance.",
};

export default function FaqPage() {
  return (
    <SiteShell className="faq-page">
      <section className="page-banner paper-section page-banner--paper">
        <p className="eyebrow eyebrow--dark">Good to know</p>
        <h1>Questions before the sleigh is packed.</h1>
        <p>Everything you need to know before sending your holiday appearance inquiry.</p>
      </section>

      <section className="faq-page__body dark-section">
        <div className="faq-page__intro">
          <p className="eyebrow">Planning the visit</p>
          <h2>Start with the basics. Personalize from there.</h2>
          <div className="faq-page__tips">
            <span><CalendarDays size={18} /> Share your preferred date and timing.</span>
            <span><MapPin size={18} /> Include the event location with your inquiry.</span>
            <span><Sparkles size={18} /> Add any traditions, surprises, or special moments.</span>
          </div>
        </div>
        <FaqList items={faqs} />
      </section>

      <section className="page-cta paper-section">
        <div><p className="eyebrow eyebrow--dark">Still planning?</p><h2>Send the details you know so far.</h2><p>Santa Jim can follow up about availability and next steps.</p></div>
        <Link className="button button--red" href="/invite">Start an inquiry <ArrowRight size={16} /></Link>
      </section>
    </SiteShell>
  );
}
