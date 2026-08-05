import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your founder profile — Kufuo | كفو",
  description: "Manage your founder identity, skills, interests, availability, and cofounder preferences.",
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
