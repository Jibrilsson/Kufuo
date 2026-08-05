import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founder profile — Cofounders",
  description: "Explore founder compatibility, commitment, skills, working preferences, and verified trust signals.",
};

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
