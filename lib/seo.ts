import type { Metadata, MetadataRoute } from "next";

export const DEFAULT_SITE_URL = "https://santa-jim-hope-site.vercel.app";
export const DEFAULT_SOCIAL_IMAGE = "/images/jim-hope-throne.webp";

export const PUBLIC_ROUTES = [
  "/",
  "/meet",
  "/experiences",
  "/experiences/home-visits",
  "/experiences/birthday-surprises",
  "/experiences/corporate-events",
  "/experiences/schools-groups",
  "/experiences/community-celebrations",
  "/experiences/photo-sessions",
  "/gallery",
  "/faq",
  "/invite",
] as const;

export const PRIVATE_ROUTE_PREFIXES = ["/santa-admin", "/api/"] as const;

export type SeoConfig = {
  siteUrl: URL;
  indexingEnabled: boolean;
  businessName: "Santa Jim of Baton Rouge";
  locale: "en_US";
  primaryArea: "Baton Rouge, Louisiana";
};

export type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function getSeoConfig(env: NodeJS.ProcessEnv = process.env): SeoConfig {
  const rawUrl = (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  return {
    siteUrl: new URL(rawUrl),
    indexingEnabled: env.SEO_INDEX === "true",
    businessName: "Santa Jim of Baton Rouge",
    locale: "en_US",
    primaryArea: "Baton Rouge, Louisiana",
  };
}

export function absoluteUrl(path: string, config = getSeoConfig()) {
  return new URL(path, config.siteUrl).toString();
}

export function buildPublicMetadata(input: PublicMetadataInput, config = getSeoConfig()): Metadata {
  const canonical = absoluteUrl(input.path, config);
  const image = absoluteUrl(input.image ?? DEFAULT_SOCIAL_IMAGE, config);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: config.indexingEnabled
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: config.businessName,
      locale: config.locale,
      type: "website",
      images: [
        {
          url: image,
          alt: "Santa Jim of Baton Rouge in a festive holiday setting",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function buildRobots(config = getSeoConfig()): MetadataRoute.Robots {
  if (!config.indexingEnabled) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/santa-admin", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml", config),
    host: config.siteUrl.origin,
  };
}

export function buildSitemap(config = getSeoConfig()): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route, config),
  }));
}
