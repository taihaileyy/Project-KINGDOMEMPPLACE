import { requireParadiseStaff } from "@/lib/auth";

// Everything under /admin/paradise is for Paradise staff only.
export default async function ParadiseAdminLayout({ children }: { children: React.ReactNode }) {
  await requireParadiseStaff();
  return children;
}
