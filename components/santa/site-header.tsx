import Link from "next/link";

const links = [
  ["Meet Jim", "/meet"],
  ["Experiences", "/experiences"],
  ["Gallery", "/gallery"],
  ["FAQ", "/faq"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Santa Jim of Baton Rouge home">
        <img className="wordmark__logo" src="/images/santa-jim-hope-logo-uploaded.webp" alt="" aria-hidden="true" />
        <span className="wordmark__copy">
          <strong>Santa Jim of Baton Rouge</strong>
          <small>Real people. Brighter holidays.</small>
        </span>
      </Link>
      <Link className="site-header__portal-mobile" href="/santa-admin">
        Santa Portal
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
        <Link className="site-header__portal" href="/santa-admin">Santa Portal</Link>
      </nav>
      <Link className="button button--small header-cta" href="/invite">Invite Santa Jim</Link>
    </header>
  );
}
