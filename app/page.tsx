import Image from "next/image";
import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  BellRing,
  BookOpen,
  CalendarDays,
  Gift,
  HeartHandshake,
  Sparkles,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/santa/site-header";
import { InquiryForm } from "@/components/santa/inquiry-form";
import { FaqList } from "@/components/santa/faq-list";
import { GalleryLightbox } from "@/components/santa/gallery-lightbox";
import { experiencePhotos } from "@/components/santa/experience-photos";
import {
  ambientOrbs,
  experiences,
  faqs,
  galleryItems,
  heroMedia,
  santaProfile,
  snowflakes,
  socialReels,
  visitSteps,
} from "@/components/santa/site-content";

export default function Home() {
  return (
    <main id="top">
      <div className="ambient-backdrop" aria-hidden="true">
        {ambientOrbs.map((orb) => (
          <span className={`ambient-orb ambient-orb--${orb}`} key={orb} />
        ))}
        <span className="ambient-evergreen" />
      </div>

      <div className="snowfield" aria-hidden="true">
        {snowflakes.map((flake) => (
          <span
            className="snowflake"
            key={flake.id}
            style={{
              "--flake-left": `${flake.left}%`,
              "--flake-size": `${flake.size}rem`,
              "--flake-duration": `${flake.duration}s`,
              "--flake-delay": `-${flake.delay}s`,
              "--flake-drift": `${flake.drift}vw`,
            } as CSSProperties}
          >
            {flake.symbol}
          </span>
        ))}
      </div>

      <div className="journey-thread" aria-hidden="true">
        <span className="journey-thread__line" />
        <span className="journey-thread__star journey-thread__star--one" />
        <span className="journey-thread__star journey-thread__star--two" />
        <span className="journey-thread__star journey-thread__star--three" />
      </div>

      <SiteHeader />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <p className="eyebrow">{santaProfile.displayName} · Holiday appearances</p>
          <h1 id="hero-title">Christmas feels closer when Santa walks in.</h1>
          <p className="hero__lead">
            Invite Santa Jim to home celebrations, birthdays, community gatherings,
            school events, photo sessions, and more.
          </p>
          <div className="hero__actions">
            <a className="button button--gold" href="#booking">
              Invite Santa Jim <ArrowUpRight size={17} />
            </a>
            <a className="button button--quiet" href="#meet-jim">Meet Jim</a>
          </div>
          <p className="hero__aside">
            <Sparkles size={16} aria-hidden="true" />
            Booking inquiries are open for holiday visits and events.
          </p>
        </div>

        <div className="hero__media">
          <Image
            className="hero__poster"
            src={heroMedia.posterSrc}
            alt={heroMedia.alt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 42vw"
          />
          <video
            className="hero__film"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroMedia.posterSrc}
            aria-hidden="true"
          >
            <source src={heroMedia.videoSrc} type="video/mp4" />
          </video>
          <span className="hero__bokeh hero__bokeh--one" aria-hidden="true" />
          <span className="hero__bokeh hero__bokeh--two" aria-hidden="true" />
          <span className="hero__bokeh hero__bokeh--three" aria-hidden="true" />
          <div className="hero__shade" aria-hidden="true" />
          <div className="hero__note">
            <Star size={16} aria-hidden="true" />
            <span>Real moments with Santa Jim Hope</span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Visit qualities">
        <span><Sparkles size={18} aria-hidden="true" /> Personal celebrations</span>
        <span><Gift size={18} aria-hidden="true" /> Events large and small</span>
        <span><BellRing size={18} aria-hidden="true" /> Photo-ready holiday moments</span>
      </section>

      <section id="meet-jim" className="section section--cream meet-jim">
        <div className="meet-jim__photos" aria-label="Santa Jim at past holiday visits">
          <figure className="meet-photo meet-photo--story">
            <Image
              src="/images/jim-hope-storytime.webp"
              alt="Santa Jim Hope reading a Christmas story with a baby"
              fill
              sizes="(max-width: 760px) 72vw, 28vw"
            />
          </figure>
          <figure className="meet-photo meet-photo--dog">
            <Image
              src="/images/jim-hope-dog.webp"
              alt="Santa Jim Hope smiling while holding a small dog"
              fill
              sizes="(max-width: 760px) 58vw, 22vw"
            />
          </figure>
        </div>
        <div className="meet-jim__copy">
          <p className="eyebrow eyebrow--dark">Meet Santa Jim</p>
          <h2>A warm face in the middle of the magic.</h2>
          <p>
            Jim Hope brings a calm, welcoming Santa presence to the moments that
            families and communities look forward to all season.
          </p>
          <p>
            From Christmas stories and first holiday photos to pets, group celebrations,
            and quiet one-on-one moments, each visit starts with the people in the room.
          </p>
          <div className="meet-jim__signals">
            <span><BookOpen size={18} aria-hidden="true" /> Storytime moments</span>
            <span><HeartHandshake size={18} aria-hidden="true" /> Welcoming visits</span>
          </div>
        </div>
      </section>

      <section id="experiences" className="section section--cream experiences-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow eyebrow--dark">Ways to celebrate</p>
            <h2>Choose the kind of Christmas moment you want to create.</h2>
          </div>
          <p>
            Every gathering has a different rhythm. Start with the occasion, then
            shape the visit around the people and traditions that make it yours.
          </p>
        </div>
        <div className="experience-grid experience-grid--keepsakes">
          {experiences.map((experience) => {
            const photo = experiencePhotos[experience.title];

            return (
              <article className="experience-card experience-card--keepsake" key={experience.title}>
                <span className="experience-card__hanger" aria-hidden="true" />
                <span className="experience-card__keepsake" aria-hidden="true">
                  <Image
                    src={experience.iconSrc}
                    alt=""
                    width={112}
                    height={112}
                    sizes="(max-width: 620px) 76px, 112px"
                  />
                </span>
                <div className="experience-card__copy">
                  <span className="experience-card__kicker">{experience.kicker}</span>
                  <h3>{experience.title}</h3>
                  <p>{experience.description}</p>
                </div>
                {photo ? (
                  <div className="experience-card__photo">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 620px) 92vw, (max-width: 1100px) 16vw, 10vw"
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section id="visit" className="section visit-section">
        <div className="section-heading section-heading--light">
          <div>
            <p className="eyebrow">A simple path to Christmas magic</p>
            <h2>Thoughtful from the first hello.</h2>
          </div>
          <p>
            Your event details shape the visit, so the final experience can feel
            personal rather than rehearsed.
          </p>
        </div>
        <div className="visit-steps">
          {visitSteps.map((step) => (
            <article className="visit-step" key={step.label}>
              <div className="visit-step__marker">
                <span className="visit-step__keepsake" aria-hidden="true">
                  <Image
                    src={step.iconSrc}
                    alt=""
                    width={120}
                    height={120}
                    sizes="(max-width: 620px) 72px, 120px"
                  />
                </span>
                <span className="visit-step__number">{step.label}</span>
              </div>
              <div className="visit-step__copy">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="gallery" className="section gallery-preview">
        <div className="gallery-preview__copy">
          <p className="eyebrow">Santa Jim in the moment</p>
          <h2>Real visits. Real smiles. A little Christmas wonder.</h2>
          <p>
            Explore moments from family visits, community celebrations, portraits,
            pets, and time with Santa and Mrs. Claus. Select any photo to see it larger.
          </p>
        </div>

        <GalleryLightbox items={galleryItems} />

        <div className="social-reels">
          <div className="social-reels__heading">
            <p className="eyebrow">See Santa Jim in action</p>
            <h3>Christmas moments, caught in motion.</h3>
            <p>Watch a recent highlight from one of Santa Jim&apos;s community appearances.</p>
          </div>
          <div className="social-reels__grid">
            {socialReels.map((reel) => {
              const reelUrl = `https://www.facebook.com/reel/${reel.reelId}/`;
              const embedUrl = `https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(reelUrl)}&show_text=false&width=267&t=0`;

              return (
                <figure className="social-reel" key={reel.reelId}>
                  <div className="social-reel__frame">
                    <iframe
                      src={embedUrl}
                      title={reel.title}
                      loading="lazy"
                      scrolling="no"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <figcaption>{reel.caption}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="section faq-preview">
        <div>
          <p className="eyebrow">Good to know</p>
          <h2>Questions before the sleigh is packed.</h2>
        </div>
        <FaqList items={faqs} />
      </section>

      <section id="booking" className="section booking-section">
        <div className="booking-intro">
          <p className="eyebrow">Plan the visit</p>
          <h2>Begin with the details that matter.</h2>
          <p>
            Tell Santa Jim about the celebration you are planning. He will follow up
            directly to confirm availability and the next steps for your visit.
          </p>
          <div className="booking-availability">
            <span className="booking-availability__pulse" aria-hidden="true" />
            <div>
              <strong>Holiday inquiries are open</strong>
              <span>Send your preferred date and location to check availability.</span>
            </div>
          </div>
          <div className="booking-note">
            <CalendarDays size={20} aria-hidden="true" />
            <span>
              Dates and timing are confirmed directly after your inquiry is reviewed.
            </span>
          </div>
        </div>
        <InquiryForm />
      </section>

      <footer className="footer-preview">
        <span className="wordmark">{santaProfile.displayName}</span>
        <span>Booking inquiries are open for holiday visits and events.</span>
      </footer>

      <a className="mobile-booking-cta" href="#booking">
        Check Santa&apos;s availability <ArrowUpRight size={17} aria-hidden="true" />
      </a>
    </main>
  );
}
