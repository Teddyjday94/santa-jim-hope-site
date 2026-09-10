const links = [
  ["Meet Jim", "#meet-jim"],
  ["Experiences", "#experiences"],
  ["Gallery", "#gallery"],
  ["FAQ", "#faq"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Santa Jim Hope home">
        <span className="wordmark__mark" aria-hidden="true">JH</span>
        <span>Santa Jim Hope</span>
      </a>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <a className="button button--small" href="#booking">Invite Santa Jim</a>
    </header>
  );
}
