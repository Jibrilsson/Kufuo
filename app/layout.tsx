import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Kufuo | كفو — Find someone worthy of building with",
    description: "A Saudi-first community for finding compatible cofounders, joining credible startup ideas, and testing how you work together.",
    applicationName: "Kufuo | كفو",
    keywords: ["cofounder", "Saudi Arabia", "startups", "founders", "Arabic"],
    icons: {
      icon: "/kufuo-mark-256.png",
      apple: "/kufuo-mark-256.png",
    },
    openGraph: {
      title: "Find someone worthy of building with.",
      description: "Meet serious builders, explore credible ideas, and test how you work together before making the commitment.",
      type: "website",
      siteName: "Kufuo | كفو",
      images: [{ url: `${origin}/og-kufuo-mark.png`, width: 1200, height: 630, alt: "Kufuo — Find someone worthy of building with" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Find someone worthy of building with.",
      description: "A Saudi-first community for people ready to build together.",
      images: [`${origin}/og-kufuo-mark.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geist.variable}>{children}</body></html>;
}
