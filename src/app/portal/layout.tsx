import { AppShell, type NavItem } from "@/components/app-shell";
import { displayName, requireUser } from "@/lib/auth";
import { getPortalAccess } from "@/lib/portal";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const access = await getPortalAccess();

  // Each section appears only when the person has a matching record, and its
  // address is blocked for everyone else (see requireAccess).
  const nav: NavItem[] = [{ href: "/portal", label: "Home", line: "Your KEP at a glance.", icon: "dashboard" }];
  if (access.church) nav.push({ href: "/portal/church", label: "My Church", line: "Your membership.", icon: "church" });
  if (access.programs) nav.push({ href: "/portal/programs", label: "My Programs", line: "Programs you've joined or requested.", icon: "programs" });
  if (access.events) nav.push({ href: "/portal/events", label: "My Events", line: "Events you're registered for.", icon: "events" });
  if (access.housing) nav.push({ href: "/portal/housing", label: "My Housing", line: "Your application and stay.", icon: "housing" });
  if (access.giving) nav.push({ href: "/portal/giving", label: "My Giving", line: "Your gifts and yearly totals.", icon: "give" });
  nav.push({ href: "/portal/profile", label: "My Profile", line: "Your name, contact details and password.", icon: "profile" });

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
