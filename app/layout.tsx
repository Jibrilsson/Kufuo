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
    title: "Cofounders — Find the right person to build with",
    description: "A Saudi-first community for finding compatible cofounders, joining credible startup ideas, and testing how you work together.",
    applicationName: "Cofounders",
    keywords: ["cofounder", "Saudi Arabia", "startups", "founders", "Arabic"],
    openGraph: {
      title: "The right company starts with the right cofounder.",
      description: "Meet serious builders, explore credible ideas, and test how you work together before making the commitment.",
      type: "website",
      siteName: "Cofounders",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Cofounders social preview" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "The right company starts with the right cofounder.",
      description: "A Saudi-first community for people ready to build together.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geist.variable}>{children}</body></html>;
}
