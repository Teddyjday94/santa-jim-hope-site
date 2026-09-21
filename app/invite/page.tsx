import type { Metadata } from "next";
import { InquiryForm } from "@/components/santa/inquiry-form";
import { SiteShell } from "@/components/santa/site-shell";

export const metadata: Metadata = {
  title: "Invite Santa Jim | Santa Jim of Baton Rouge",
  description: "Send Santa Jim of Baton Rouge the details of your holiday celebration, preferred date, location, and event type.",
};

export default function InvitePage() {
  return (
    <SiteShell className="invite-page invite-page--stationery">
      <section className="invite-form-section invite-form-section--stationery">
        <div className="north-pole-letter">
          <span className="north-pole-letter__postmark" aria-hidden="true">North Pole · Priority</span>
          <span className="north-pole-letter__seal" aria-hidden="true">SJB</span>
          <InquiryForm />
        </div>
      </section>
    </SiteShell>
  );
}
