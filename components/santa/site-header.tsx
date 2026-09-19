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
      <Link className="wordmark" href="/" aria-label="Santa Jim Hope home">
        <span className="wordmark__mark" aria-hidden="true">SJH</span>
        <span className="wordmark__copy">
          <strong>Santa Jim Hope</strong>
          <small>Real people. Brighter holidays.</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </nav>
      <Link className="button button--small header-cta" href="/invite">Invite Santa Jim</Link>
    </header>
  );
}
