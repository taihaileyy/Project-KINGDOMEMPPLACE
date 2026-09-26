import { AppShell, type NavItem } from "@/components/app-shell";
import { displayName, requireUser } from "@/lib/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();

  // Sections are added here as each module lands. Each one appears only when
  // the person has a matching record (membership, enrollment, housing stay...).
  const nav: NavItem[] = [
    { href: "/portal", label: "Home" },
    { href: "/portal/profile", label: "My Profile" },
  ];

  return (
    <AppShell
      area="My KEP"
      name={displayName(session.person)}
      nav={nav}
      switchLink={session.roles.length > 0 ? { href: "/admin", label: "Staff dashboard" } : undefined}
    >
      {children}
    </AppShell>
  );
}
