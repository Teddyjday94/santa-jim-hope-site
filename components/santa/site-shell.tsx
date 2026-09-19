import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/santa/site-header";
import { ScrollEffects } from "@/components/santa/scroll-effects";
import { ambientOrbs, santaProfile, snowflakes } from "@/components/santa/site-content";

export function SiteShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main id="top" className={`site-page ${className}`.trim()}>
      <link rel="stylesheet" href="/multipage.css" />
      <ScrollEffects />
      <div className="ambient-backdrop" aria-hidden="true">
        {ambientOrbs.map((orb) => (
          <span className={`ambient-orb ambient-orb--${orb}`} key={orb} />
        ))}
        <span className="ambient-evergreen" />
      </div>

      <div className="seasonal-trim seasonal-trim--left" aria-hidden="true">
        <span className="seasonal-ornament seasonal-ornament--one" />
        <span className="seasonal-ornament seasonal-ornament--two" />
      </div>
      <div className="seasonal-trim seasonal-trim--right" aria-hidden="true">
        <span className="seasonal-ornament seasonal-ornament--one" />
        <span className="seasonal-ornament seasonal-ornament--two" />
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
      {children}

      <footer className="site-footer">
        <div>
          <span className="site-footer__mark">SJH</span>
          <div>
            <strong>{santaProfile.displayName}</strong>
            <span>Real people. Brighter holidays.</span>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/meet">Meet Jim</Link>
          <Link href="/experiences">Experiences</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <Link className="site-footer__invite" href="/invite">
          Invite Santa Jim <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </footer>

      <Link className="mobile-booking-cta" href="/invite">
        Check Santa&apos;s availability <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </main>
  );
}
