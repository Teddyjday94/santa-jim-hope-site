import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Santa Jim Hope | Holiday Visits & Event Appearances",
  description:
    "Invite Santa Jim Hope to family celebrations, birthdays, schools, businesses, community events, and holiday photo sessions.",
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
