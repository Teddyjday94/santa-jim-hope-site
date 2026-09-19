import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { experiencePhotos } from "@/components/santa/experience-photos";
import { SiteShell } from "@/components/santa/site-shell";
import { experiences, visitSteps } from "@/components/santa/site-content";

export const metadata: Metadata = {
  title: "Experiences | Santa Jim Hope",
  description: "Explore Santa Jim Hope home visits, birthdays, business events, schools, community celebrations, and photo sessions.",
};

export default function ExperiencesPage() {
  return (
    <SiteShell className="experiences-page">
      <section className="page-banner dark-section">
        <p className="eyebrow">Ways to celebrate</p>
        <h1>Every gathering deserves its own kind of Christmas magic.</h1>
        <p>Choose the occasion, then shape the visit around your people, traditions, timing, and setting.</p>
      </section>

      <section className="experience-stories paper-section">
        {experiences.map((experience, index) => {
          const photo = experiencePhotos[experience.title];
          return (
            <article className={index % 2 ? "experience-story experience-story--reverse" : "experience-story"} key={experience.title}>
              <div
                className={photo?.fit === "contain" ? "experience-story__photo experience-story__photo--contain" : "experience-story__photo"}
                style={photo ? {
                  "--photo-fit": photo.fit ?? "cover",
                  "--photo-mobile-fit": photo.mobileFit ?? photo.fit ?? "cover",
                  "--photo-position": photo.position ?? "center center",
                  "--photo-mobile-position": photo.mobilePosition ?? photo.position ?? "center center",
                } as CSSProperties : undefined}
              >
                {photo ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 820px) 92vw, 48vw"
                    className="experience-story__image"
                  />
                ) : null}
              </div>
              <div className="experience-story__copy">
                <span>{experience.kicker}</span>
                <h2>{experience.title}</h2>
                <p>{experience.description}</p>
                <p className="experience-story__note">
                  Share your preferred date, timing, location, and any details that will help Santa Jim understand the feel of your gathering.
                </p>
                <Link className="text-link" href="/invite">
                  Ask about this experience <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="visit-path dark-section visit-path--dark">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">From inquiry to arrival</p>
            <h2>Simple planning. Personal details.</h2>
          </div>
          <p>Your event details shape the final visit so it can feel natural rather than rehearsed.</p>
        </div>
        <div className="visit-path__steps">
          {visitSteps.map((step, index) => (
            <article key={step.label}>
              <span className="visit-path__number">{index + 1}</span>
              <div>
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-cta paper-section">
        <div><p className="eyebrow eyebrow--dark">Ready when you are</p><h2>Tell Santa Jim what you are planning.</h2></div>
        <Link className="button button--red" href="/invite">Start an inquiry <ArrowRight size={16} /></Link>
      </section>
    </SiteShell>
  );
}
