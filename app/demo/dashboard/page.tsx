import type { Metadata } from "next";
import { DashboardView } from "../../dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard preview | Kufuo",
  robots: { index: false, follow: false },
};

export default function DashboardPreviewPage() {
  return (
    <DashboardView
      user={{ displayName: "Salah Jibril", email: "jibrilsson@gmail.com" }}
      signOutHref="/login"
    />
  );
}
