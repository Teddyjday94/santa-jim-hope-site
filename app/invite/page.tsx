import type { Metadata } from "next";
import { InquiryForm } from "@/components/santa/inquiry-form";
import { SiteShell } from "@/components/santa/site-shell";
import { StructuredData } from "@/components/santa/structured-data";
import { buildPublicMetadata, getSeoConfig } from "@/lib/seo";
import { buildWebPageSchema } from "@/lib/seo-schema";

const config = getSeoConfig();
const title = "Book Santa Jim in Baton Rouge, LA | Holiday Appearance Inquiry";
const description = "Request Santa Jim of Baton Rouge for a home visit, photo session, school, business event, community celebration, birthday surprise, or other holiday appearance.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/invite",
}, config);

export default function InvitePage() {
  return (
    <SiteShell className="invite-page invite-page--stationery">
      <StructuredData data={buildWebPageSchema({ path: "/invite", name: title, description }, config)} />
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
