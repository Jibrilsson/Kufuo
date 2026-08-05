import type { Metadata } from "next";
import { LoginView } from "./LoginView";

export const metadata: Metadata = {
  title: "Sign in — Kufuo | كفو",
  description: "Join Kufuo and find someone worthy of building with.",
};

export default function LoginPage() {
  return <LoginView />;
}
