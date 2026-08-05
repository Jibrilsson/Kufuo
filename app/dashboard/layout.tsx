import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founder dashboard — Kufuo | كفو",
  description: "Your personalized founder feed, matches, introductions, and community activity.",
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
