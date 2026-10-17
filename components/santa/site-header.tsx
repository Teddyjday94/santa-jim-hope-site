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
        <img className="wordmark__logo" src="/images/santa-jim-baton-rouge-logo.webp" alt="" aria-hidden="true" />
        <span className="wordmark__copy">
          <strong>Santa Jim of Baton Rouge</strong>
          <small>Real people. Brighter holidays.</small>
        </span>
      </Link>
      <nav className="site-header__desktop-nav" aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
        <Link className="site-header__portal" href="/santa-admin">Santa Portal</Link>
      </nav>
      <Link className="button button--small header-cta" href="/invite">Invite Santa Jim</Link>
      <details className="site-header__menu">
        <summary aria-label="Open navigation menu">Menu <span aria-hidden="true">+</span></summary>
        <nav aria-label="Mobile navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
          <Link href="/santa-admin">Santa Portal</Link>
          <Link className="site-header__menu-invite" href="/invite">Invite Santa Jim</Link>
        </nav>
      </details>
    </header>
  );
}
