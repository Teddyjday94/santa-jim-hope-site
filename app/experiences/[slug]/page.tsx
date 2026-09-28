import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { experiencePhotos } from "@/components/santa/experience-photos";
import { experienceDetails, getExperienceBySlug } from "@/components/santa/experience-seo";
import { SiteShell } from "@/components/santa/site-shell";
import { StructuredData } from "@/components/santa/structured-data";
import { experiences } from "@/components/santa/site-content";
import { buildPublicMetadata, getSeoConfig } from "@/lib/seo";
import { buildBreadcrumbSchema, buildServiceSchema, buildWebPageSchema } from "@/lib/seo-schema";

type ExperiencePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return experienceDetails.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getExperienceBySlug(slug);
  if (!detail) return {};

  return buildPublicMetadata({
    title: detail.seoTitle,
    description: detail.seoDescription,
    path: `/experiences/${detail.slug}`,
  });
}

export default async function ExperienceDetailPage({ params }: ExperiencePageProps) {
  const { slug } = await params;
  const detail = getExperienceBySlug(slug);
  if (!detail) notFound();

  const experience = experiences.find((item) => item.title === detail.title);
  const photo = experiencePhotos[detail.title];
  if (!experience || !photo) notFound();

  const path = `/experiences/${detail.slug}`;
  const config = getSeoConfig();
  const related = detail.relatedSlugs
    .map((relatedSlug) => getExperienceBySlug(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <SiteShell className="experience-detail-page">
      <StructuredData data={buildWebPageSchema({ path, name: detail.seoTitle, description: detail.seoDescription }, config)} />
      <StructuredData data={buildServiceSchema({ path, name: detail.title, description: detail.seoDescription }, config)} />
      <StructuredData
        data={buildBreadcrumbSchema([
          ["Home", "/"],
          ["Experiences", "/experiences"],
          [detail.title, path],
        ], config)}
      />

      <section className="page-hero page-hero--split paper-section">
        <div className="page-hero__copy">
          <p className="eyebrow eyebrow--dark">{experience.kicker} · Baton Rouge</p>
          <h1>{detail.detailHeading}</h1>
          <p>{detail.detailIntro}</p>
          <div className="hero-actions">
            <Link className="button button--red" href="/invite">
              Ask about availability <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="button button--paper" href="/experiences">
              <ArrowLeft size={16} aria-hidden="true" /> All experiences
            </Link>
          </div>
        </div>
        <div className="page-hero__image">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="(max-width: 820px) 92vw, 46vw"
            style={{
              objectFit: photo.fit ?? "cover",
              objectPosition: photo.position ?? "center center",
            }}
          />
        </div>
      </section>

      <section className="editorial-story dark-section">
        <div className="editorial-story__lead">
          <p className="eyebrow">Plan the appearance</p>
          <h2>Share the details that make the visit yours.</h2>
        </div>
        <div className="editorial-story__body">
          <p>{experience.description}</p>
          <p>
            Santa Jim uses the information in your inquiry to understand the setting, timing,
            guest needs, and the kind of Christmas moment you are planning before confirming availability.
          </p>
        </div>
      </section>

      <section className="values-section paper-section experience-planning">
        <div className="section-title-row section-title-row--dark">
          <div>
            <p className="eyebrow eyebrow--dark">Helpful planning details</p>
            <h2>What to include with your inquiry.</h2>
          </div>
          <p>Good details make it easier to confirm the right timing and shape the visit around your event.</p>
        </div>
        <div className="values-grid planning-grid">
          {detail.planningTips.map((tip, index) => (
            <article className="planning-card" key={tip.title}>
              <div className="planning-card__topline">
                <span className="planning-card__step" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="planning-card__icon" aria-hidden="true">
                  {index === 0 ? <CalendarDays /> : index === 1 ? <Sparkles /> : <MapPin />}
                </span>
              </div>
              <h3>{tip.title}</h3>
              <p>{tip.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dark-section related-experiences">
        <div className="section-title-row related-experiences__heading">
          <div>
            <p className="eyebrow">Related ways to celebrate</p>
            <h2>More ways Santa Jim can be part of the season.</h2>
          </div>
          <p>Keep exploring appearances that can fit a different setting, guest list, or kind of Christmas moment.</p>
        </div>
        <div className="related-experiences__grid">
          {related.map((item) => {
            const relatedPhoto = experiencePhotos[item.title];

            return (
              <article className="related-experience-card" key={item.slug}>
                {relatedPhoto ? (
                  <div className="related-experience-card__media">
                    <Image
                      src={relatedPhoto.src}
                      alt={relatedPhoto.alt}
                      fill
                      sizes="(max-width: 720px) 92vw, 44vw"
                      style={{
                        objectFit: relatedPhoto.fit ?? "cover",
                        objectPosition: relatedPhoto.position ?? "center center",
                      }}
                    />
                  </div>
                ) : null}
                <div className="related-experience-card__body">
                  <span>Santa Jim of Baton Rouge</span>
                  <h3>{item.title}</h3>
                  <p>{item.seoDescription}</p>
                  <Link className="text-link text-link--light related-experience-card__link" href={`/experiences/${item.slug}`}>
                    View this experience <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="related-experiences__footer">
          <Link className="button button--paper" href="/experiences">
            Explore all experiences <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="page-cta paper-section">
        <div>
          <p className="eyebrow eyebrow--dark">Invite Santa Jim</p>
          <h2>Have a date and idea in mind?</h2>
          <p>Send the event details and Santa Jim can follow up about availability and next steps.</p>
        </div>
        <Link className="button button--red" href="/invite">
          Start an inquiry <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </SiteShell>
  );
}
