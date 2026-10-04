import { AppShell, type NavItem } from "@/components/app-shell";
import { canManageParadise, displayName, hasRole, requireStaff } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  // Each module adds its section here, filtered by the viewer's roles.
  const nav: NavItem[] = [{ href: "/admin", label: "Dashboard", line: "Live numbers across KEP.", icon: "dashboard" }];

  if (hasRole(session, "church_staff")) nav.push({ href: "/admin/schedule", label: "Schedule", line: "Service and Bible Study times.", icon: "events" });
  if (canManageParadise(session)) nav.push({ href: "/admin/paradise", label: "Create Your World", line: "Questions, levels and lessons.", icon: "paradise" });

  return (
    <AppShell
      area="Staff"
      name={displayName(session.person)}
      nav={nav}
      switchLink={{ href: "/portal", label: "My KEP" }}
    >
      {children}
    </AppShell>
  );
}
