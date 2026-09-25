import { absoluteUrl, getSeoConfig, type SeoConfig } from "./seo.ts";

export type SchemaPageInput = {
  path: string;
  name: string;
  description: string;
};

export type BreadcrumbItem = readonly [name: string, path: string];
export type FaqSchemaItem = { question: string; answer: string };

export function buildPersonSchema(config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#santa-jim", config),
    name: "Santa Jim of Baton Rouge",
    jobTitle: "Professional Santa Claus performer",
    url: absoluteUrl("/meet", config),
    image: absoluteUrl("/images/jim-hope-throne.webp", config),
    areaServed: {
      "@type": "City",
      name: "Baton Rouge, Louisiana",
    },
  } as const;
}

export function buildWebsiteSchema(config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website", config),
    url: absoluteUrl("/", config),
    name: config.businessName,
    inLanguage: "en-US",
    publisher: { "@id": absoluteUrl("/#santa-jim", config) },
  } as const;
}

export function buildWebPageSchema(input: SchemaPageInput, config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(input.path, config)}#webpage`,
    url: absoluteUrl(input.path, config),
    name: input.name,
    description: input.description,
    inLanguage: "en-US",
    isPartOf: { "@id": absoluteUrl("/#website", config) },
    about: { "@id": absoluteUrl("/#santa-jim", config) },
  } as const;
}

export function buildServiceSchema(input: SchemaPageInput, config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(input.path, config)}#service`,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, config),
    provider: { "@id": absoluteUrl("/#santa-jim", config) },
    areaServed: {
      "@type": "City",
      name: config.primaryArea,
    },
  } as const;
}

export function buildBreadcrumbSchema(items: readonly BreadcrumbItem[], config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absoluteUrl(path, config),
    })),
  } as const;
}

export function buildFaqSchema(items: readonly FaqSchemaItem[], config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/faq", config)}#faq`,
    url: absoluteUrl("/faq", config),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } as const;
}
