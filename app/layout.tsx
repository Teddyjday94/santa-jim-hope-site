import type { Metadata } from "next";
import { buildPublicMetadata, getSeoConfig } from "@/lib/seo";
import "./globals.css";
import "./journey.css";
import "./experience-media.css";
import "./wreath-frames.css";
import "./reel-showcase.css";
import "./scheduler.css";
import "./admin.css";

const config = getSeoConfig();
const rootMetadata = buildPublicMetadata({
  title: "Santa for Hire in Baton Rouge, LA | Santa Jim",
  description: "Invite Santa Jim of Baton Rouge for home visits, photo sessions, schools, businesses, community celebrations, and holiday events.",
  path: "/",
}, config);

export const metadata: Metadata = {
  ...rootMetadata,
  metadataBase: config.siteUrl,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
