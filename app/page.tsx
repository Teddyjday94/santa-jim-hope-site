import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Camera, HeartHandshake, Sparkles } from "lucide-react";
import { FaqList } from "@/components/santa/faq-list";
import { SiteShell } from "@/components/santa/site-shell";
import { experiencePhotos } from "@/components/santa/experience-photos";
import { experiences, faqs, galleryItems, santaProfile, visitSteps } from "@/components/santa/site-content";

export const metadata: Metadata = {
  title: "Santa Jim of Baton Rouge | Holiday Visits & Event Appearances",
  description: "Invite Santa Jim of Baton Rouge to family celebrations, schools, businesses, community events, and holiday photo sessions.",
};

const featuredExperiences = experiences.filter((item) =>
  ["Home visits", "Community celebrations", "Photo sessions"].includes(item.title),
);

export default function Home() {
  return (
    <SiteShell className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">Holiday appearances · 2026</p>
          <h1>Christmas feels closer when <em>Santa walks in.</em></h1>
          <p className="home-hero__lead">
            Invite Santa Jim of Baton Rouge to home celebrations, birthdays, schools,
            community gatherings, corporate events, photo sessions, and more.
          </p>
          <div className="hero-actions">
            <Link className="button button--red" href="/invite">
              Invite Santa Jim <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button--paper" href="/meet">
              Meet Jim <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <p className="home-hero__status">
            <Sparkles size={15} aria-hidden="true" />
            Booking inquiries are open for the holiday season.
          </p>
        </div>

        <div className="home-hero__portrait">
          <Image
            src="/images/jim-hope-dog.webp"
            alt="Santa Jim of Baton Rouge smiling with a festive dog"
            fill
            priority
            sizes="(max-width: 820px) 100vw, 52vw"
          />
          <div className="home-hero__portrait-note">
            <strong>{santaProfile.displayName}</strong>
            <span>Spreading joy, one visit at a time.</span>
          </div>
        </div>
      </section>

      <section className="home-story paper-section">
        <div className="home-story__photo">
          <Image
            src="/images/jim-hope-storytime.webp"
            alt="Santa Jim of Baton Rouge reading a Christmas story with a baby"
            fill
            sizes="(max-width: 760px) 92vw, 38vw"
          />
        </div>
        <div className="home-story__copy">
          <p className="eyebrow eyebrow--dark">Meet Santa Jim</p>
          <h2>More than a costume. A calling.</h2>
          <p>
            Santa Jim of Baton Rouge brings a calm, welcoming Santa presence to the moments that
            families and communities look forward to all season.
          </p>
          <div className="home-story__signals">
            <span><BookOpen size={18} aria-hidden="true" /> Storytime moments</span>
            <span><HeartHandshake size={18} aria-hidden="true" /> Welcoming visits</span>
          </div>
          <Link className="text-link" href="/meet">
            Meet Santa Jim <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <blockquote className="home-story__quote">
          The best Christmas moments feel warm, personal, and wonderfully real.
          <span>Real people. Brighter holidays.</span>
        </blockquote>
      </section>

      <section className="home-experiences dark-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Ways to celebrate</p>
            <h2>Joy for every occasion.</h2>
          </div>
          <p>
            Start with the kind of gathering you are planning, then shape the visit
            around the people and traditions that make it yours.
          </p>
        </div>

        <div className="home-experience-grid">
          {featuredExperiences.map((experience) => {
            const photo = experiencePhotos[experience.title];
            return (
              <article className="home-experience-card" key={experience.title}>
                {photo ? (
                  <div className="home-experience-card__image">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 720px) 92vw, 30vw"
                      style={{
                        objectFit: photo.fit ?? "cover",
                        objectPosition: photo.position ?? "center center",
                      }}
                    />
                  </div>
                ) : null}
                <span>{experience.kicker}</span>
                <h3>{experience.title}</h3>
                <p>{experience.description}</p>
              </article>
            );
          })}
        </div>

        <Link className="button button--outline-light" href="/experiences">
          Explore every experience <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className="visit-path paper-section">
        <div className="section-title-row section-title-row--dark">
          <div>
            <p className="eyebrow eyebrow--dark">Thoughtful from the first hello</p>
            <h2>A simple path to Christmas magic.</h2>
          </div>
          <p>Easy, personal, and designed to make the day feel special.</p>
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

      <section className="home-gallery dark-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Moments that matter</p>
            <h2>Real smiles. Lasting memories.</h2>
          </div>
          <Link className="text-link text-link--light" href="/gallery">
            View full gallery <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-gallery__grid">
          {galleryItems.slice(0, 6).map((item, index) => (
            <figure className={index === 0 ? "home-gallery__item home-gallery__item--wide" : "home-gallery__item"} key={item.src}>
              <Image
                className="home-gallery__backdrop"
                src={item.src}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 720px) 92vw, 25vw"
              />
              <Image
                className="home-gallery__photo"
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 720px) 92vw, 25vw"
              />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="home-faq paper-section">
        <div>
          <p className="eyebrow eyebrow--dark">Frequently asked</p>
          <h2>Quick answers for a smoother season.</h2>
          <p>
            From timing to personalization, here are a few things families and event
            planners usually want to know first.
          </p>
          <Link className="text-link" href="/faq">
            See every question <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <FaqList items={faqs.slice(0, 3)} />
      </section>

      <section className="home-invite">
        <div>
          <p className="eyebrow">Invite Santa Jim</p>
          <h2>Make this season one to remember.</h2>
          <p>Share the details of your celebration and Santa Jim will follow up about availability.</p>
        </div>
        <div className="home-invite__actions">
          <Link className="button button--red" href="/invite">
            Start an inquiry <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <span><Camera size={16} aria-hidden="true" /> Home visits · events · photos</span>
        </div>
      </section>
    </SiteShell>
  );
}
