import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, HeartHandshake, Sparkles, Users } from "lucide-react";
import { SiteShell } from "@/components/santa/site-shell";

export const metadata: Metadata = {
  title: "Meet Santa Jim | Santa Jim Hope",
  description: "Meet Jim Hope and learn about the warm, personal approach behind his Santa visits and holiday appearances.",
};

export default function MeetPage() {
  return (
    <SiteShell className="meet-page">
      <section className="page-hero page-hero--split paper-section">
        <div className="page-hero__copy">
          <p className="eyebrow eyebrow--dark">Meet Santa Jim</p>
          <h1>A warm face in the middle of the magic.</h1>
          <p>
            Jim Hope brings a calm, welcoming presence to Christmas moments of every
            size — from a quiet story at home to a room full of families.
          </p>
          <Link className="button button--red" href="/invite">
            Invite Santa Jim <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="page-hero__image">
          <Image src="/images/santa-jim-hope-red-suit-portrait.jpg" alt="Santa Jim Hope in his red holiday suit" fill priority sizes="(max-width: 820px) 92vw, 46vw" />
        </div>
      </section>

      <section className="editorial-story dark-section">
        <div className="editorial-story__lead">
          <p className="eyebrow">The person behind the beard</p>
          <h2>The goal is simple: make people feel welcome.</h2>
        </div>
        <div className="editorial-story__body">
          <p>
            The best Santa visits do not feel rehearsed. They feel like the room
            suddenly became a little warmer, a little brighter, and a lot more memorable.
          </p>
          <p>
            Santa Jim shapes each appearance around the people in front of him. That can
            mean slowing down for a first Christmas photo, making space for a child who
            needs a gentler introduction, sharing a story, greeting a pet, or bringing
            energy to a large community celebration.
          </p>
        </div>
      </section>

      <section className="meet-collage paper-section">
        <figure className="meet-collage__large">
          <Image src="/images/jim-hope-storytime.webp" alt="Santa Jim Hope sharing a Christmas story" fill sizes="(max-width: 760px) 92vw, 52vw" />
        </figure>
        <figure>
          <Image src="/images/jim-hope-dog.webp" alt="Santa Jim Hope smiling with a small dog" fill sizes="(max-width: 760px) 44vw, 22vw" />
        </figure>
        <figure>
          <Image src="/images/jim-hope-inclusive-visit.webp" alt="Santa Jim Hope during a welcoming holiday visit" fill sizes="(max-width: 760px) 44vw, 22vw" />
        </figure>
      </section>

      <section className="values-section dark-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">What shapes the visit</p>
            <h2>Kindness before spectacle.</h2>
          </div>
          <p>Christmas magic works best when the people in the room come first.</p>
        </div>
        <div className="values-grid">
          <article><HeartHandshake /><h3>Welcoming</h3><p>Each visit starts with the people, comfort level, and energy of the gathering.</p></article>
          <article><BookOpen /><h3>Personal</h3><p>Stories, traditions, names, surprises, and special moments can all help shape the appearance.</p></article>
          <article><Users /><h3>Flexible</h3><p>From quiet family visits to large events, the tone can match the occasion.</p></article>
          <article><Sparkles /><h3>Memorable</h3><p>The aim is a genuine Christmas moment people will still talk about after the decorations come down.</p></article>
        </div>
      </section>

      <section className="page-cta paper-section">
        <div>
          <p className="eyebrow eyebrow--dark">Plan a visit</p>
          <h2>Have something special in mind?</h2>
          <p>Share the occasion, date, location, and the kind of moment you hope to create.</p>
        </div>
        <Link className="button button--red" href="/invite">Start an inquiry <ArrowRight size={16} /></Link>
      </section>
    </SiteShell>
  );
}
