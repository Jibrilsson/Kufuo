import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "./product.css";

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
    title: "Kufuo | كفو — Vetted Arab experts, by the hour",
    description: "Kufuo vets Arab professionals with an AI interview and human review, and companies book their expertise by the hour.",
    applicationName: "Kufuo | كفو",
    keywords: ["Arab experts", "expert network", "Arabic AI evaluation", "hourly experts", "كفو"],
    icons: {
      icon: "/kufuo-mark-256.png",
      apple: "/kufuo-mark-256.png",
    },
    openGraph: {
      title: "Vetted Arab expertise, by the hour.",
      description: "Kufuo vets Arab professionals and companies book their time by the hour.",
      type: "website",
      siteName: "Kufuo | كفو",
      images: [{ url: `${origin}/og-kufuo-mark.png`, width: 1200, height: 630, alt: "Kufuo — Vetted Arab experts, by the hour" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Vetted Arab expertise, by the hour.",
      description: "Vetted Arab experts, booked by the hour.",
      images: [`${origin}/og-kufuo-mark.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geist.variable}>{children}</body></html>;
}
