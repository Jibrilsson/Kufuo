import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your founder account — Cofounders",
  description: "Manage your founder identity, complete your Founder Passport, and start meeting compatible cofounders.",
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
