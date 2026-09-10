import Image from "next/image";
import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  BellRing,
  BookOpen,
  Building2,
  CakeSlice,
  CalendarDays,
  Camera,
  Gift,
  HeartHandshake,
  House,
  MapPinned,
  School,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/santa/site-header";
import { InquiryForm } from "@/components/santa/inquiry-form";
import { FaqList } from "@/components/santa/faq-list";
import {
  ambientOrbs,
  experiences,
  faqs,
  galleryItems,
  heroMedia,
  santaProfile,
  snowflakes,
  visitSteps,
} from "@/components/santa/site-content";

const experienceIcons: Record<string, LucideIcon> = {
  House,
  CakeSlice,
  Building2,
  School,
  MapPinned,
  Camera,
};

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
            Dates, service area, and booking details are coming soon.
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
            The moments captured so far show Jim Hope sharing Christmas stories,
            welcoming children and families, greeting pets, and joining community
            celebrations.
          </p>
          <p>
            More about Jim&apos;s background, traditions, service area, and booking
            policies will be added once those details are confirmed.
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
            <h2>A Santa experience for every gathering.</h2>
          </div>
          <p>
            From a quiet family surprise to a room full of guests, start with the
            occasion you are creating.
          </p>
        </div>
        <div className="experience-grid">
          {experiences.map((experience) => {
            const Icon = experienceIcons[experience.icon];
            return (
              <article className="experience-card" key={experience.title}>
                <span className="icon-frame"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                <h3>{experience.title}</h3>
                <p>{experience.description}</p>
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
            <article className="visit-step" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="gallery" className="section gallery-preview">
        <div className="gallery-preview__copy">
          <p className="eyebrow">Santa Jim in the moment</p>
          <h2>Real visits. Real smiles. A little Christmas wonder.</h2>
          <p>
            A first look at Jim&apos;s appearances with families, friends, pets,
            and community guests.
          </p>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <figure
              className={`gallery-card gallery-card--${(index % 5) + 1}`}
              key={item.src}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 620px) 88vw, (max-width: 980px) 45vw, 30vw"
              />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
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
            Tell us the shape of your celebration. This first version lets you
            preview the booking flow without sending any information.
          </p>
          <div className="booking-note">
            <CalendarDays size={20} aria-hidden="true" />
            <span>
              Dates and availability will be confirmed directly once Jim&apos;s
              booking details are connected.
            </span>
          </div>
        </div>
        <InquiryForm />
      </section>

      <footer className="footer-preview">
        <span className="wordmark">{santaProfile.displayName}</span>
        <span>Contact and booking details coming soon.</span>
      </footer>
    </main>
  );
}
