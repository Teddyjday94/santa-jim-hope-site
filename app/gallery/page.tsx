import type { Metadata } from "next";
import { GalleryLightbox } from "@/components/santa/gallery-lightbox";
import { SiteShell } from "@/components/santa/site-shell";
import { StructuredData } from "@/components/santa/structured-data";
import { galleryItems, socialReels } from "@/components/santa/site-content";
import { buildPublicMetadata, getSeoConfig } from "@/lib/seo";
import { buildWebPageSchema } from "@/lib/seo-schema";

const config = getSeoConfig();
const title = "Santa Jim Photo Gallery | Baton Rouge Holiday Appearances";
const description = "See real Santa Jim of Baton Rouge moments from family visits, holiday portraits, pets, photo sessions, community celebrations, and appearances with Mrs. Claus.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/gallery",
}, config);

export default function GalleryPage() {
  return (
    <SiteShell className="gallery-page">
      <StructuredData data={buildWebPageSchema({ path: "/gallery", name: title, description }, config)} />
      <section className="page-banner dark-section">
        <p className="eyebrow">Real visits. Real smiles.</p>
        <h1>A little Christmas wonder, caught in the moment.</h1>
        <p>Browse family visits, portraits, pets, community celebrations, and moments with Santa and Mrs. Claus.</p>
      </section>

      <section className="gallery-page__content dark-section">
        <GalleryLightbox items={galleryItems} />
      </section>

      <section className="reel-page paper-section">
        <div className="reel-page__copy">
          <p className="eyebrow eyebrow--dark">See Santa Jim in action</p>
          <h2>Christmas moments, caught in motion.</h2>
          <p>Watch a recent highlight from one of Santa Jim&apos;s community appearances.</p>
        </div>
        <div className="reel-page__video">
          {socialReels.map((reel) => {
            const reelUrl = `https://www.facebook.com/reel/${reel.reelId}/`;
            const embedUrl = `https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(reelUrl)}&show_text=false&width=267&t=0`;
            return (
              <figure key={reel.reelId}>
                <iframe
                  src={embedUrl}
                  title={reel.title}
                  loading="lazy"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
                <figcaption>{reel.caption}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
