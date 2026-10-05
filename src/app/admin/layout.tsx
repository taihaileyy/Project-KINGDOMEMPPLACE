import { AppShell, type NavItem } from "@/components/app-shell";
import { canManageEvents, canManageMedia, canManageParadise, canManagePrograms, canManageStudio, displayName, hasRole, requireStaff } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  // Each module adds its section here, filtered by the viewer's roles.
  const nav: NavItem[] = [{ href: "/admin", label: "Dashboard", line: "Live numbers across KEP.", icon: "dashboard" }];

  if (hasRole(session, "housing_staff")) nav.push({ href: "/admin/housing", label: "Housing", line: "Applications, residents and payments.", icon: "housing" });
  if (hasRole(session, "church_staff") || hasRole(session, "finance_admin")) nav.push({ href: "/admin/people", label: "People", line: "Everyone with a KEP record.", icon: "profile" });
  if (canManagePrograms(session)) nav.push({ href: "/admin/programs", label: "Programs", line: "Requests and rosters.", icon: "programs" });
  if (canManageEvents(session)) nav.push({ href: "/admin/events", label: "Events", line: "Events, registrations and check-in.", icon: "events" });
  if (canManageStudio(session)) nav.push({ href: "/admin/studio", label: "Studio", line: "Requests, calendar and blocked times.", icon: "studio" });
  if (hasRole(session, "church_staff")) nav.push({ href: "/admin/schedule", label: "Schedule", line: "Service and Bible Study times.", icon: "events" });
  if (hasRole(session, "finance_admin")) nav.push({ href: "/admin/giving", label: "Giving", line: "Reports and gift records.", icon: "give" });
  if (hasRole(session, "super_admin")) nav.push({ href: "/admin/impact", label: "Public impact", line: "Numbers shown on the website.", icon: "about" });
  if (canManageMedia(session)) nav.push({ href: "/admin/videos", label: "Videos", line: "Videos and audio for the site.", icon: "watch" });
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
