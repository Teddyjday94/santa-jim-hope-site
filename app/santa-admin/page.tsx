import type { Metadata } from "next";
import { AdminDashboard } from "@/components/santa/admin-dashboard";

export const metadata: Metadata = {
  title: "Santa Jim Scheduler | Private Admin",
  robots: { index: false, follow: false },
};

export default function SantaAdminPage() {
  return (
    <main className="santa-admin-page">
      <AdminDashboard />
    </main>
  );
}
