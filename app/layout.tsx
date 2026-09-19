import type { Metadata } from "next";
import "./globals.css";
import "./journey.css";
import "./experience-media.css";
import "./wreath-frames.css";
import "./reel-showcase.css";
import "./scheduler.css";
import "./admin.css";\n
const siteTitle = "Santa Jim Hope | Holiday Visits & Event Appearances";
const siteDescription = "Invite Santa Jim Hope to family celebrations, birthdays, schools, businesses, community events, and holiday photo sessions.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    images: [
      {
        url: "/images/jim-hope-throne.webp",
        alt: "Santa Jim Hope seated on an ornate holiday throne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/jim-hope-throne.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/multipage.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
