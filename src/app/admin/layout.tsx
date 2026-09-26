import { AppShell, type NavItem } from "@/components/app-shell";
import { displayName, requireStaff } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  // Each module adds its section here, filtered by the viewer's roles.
  const nav: NavItem[] = [{ href: "/admin", label: "Dashboard", line: "Live numbers across KEP.", icon: "dashboard" }];

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
