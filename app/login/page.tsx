import type { Metadata } from "next";
import { LoginView } from "./LoginView";

export const metadata: Metadata = {
  title: "Sign in — Kufuo | كفو",
  description: "Sign in to Kufuo to apply as an expert or hire vetted Arab experts.",
};

export default function LoginPage() {
  return <LoginView />;
}
