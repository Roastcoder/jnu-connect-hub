import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  BarChart3, CalendarDays, Image as ImageIcon, LayoutDashboard, Radio, Ticket, Trophy, Users,
  Award, Building2, UserCog, Layers, Star, GraduationCap, Gavel, Handshake, IndianRupee,
  ClipboardCheck, Bell, Settings, LogOut, MoreHorizontal,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { JnuLogo } from "@/components/Logo";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardBottomNav } from "@/components/DashboardBottomNav";
import { DashboardMobileHeader } from "@/components/DashboardMobileHeader";
import { signOut, useProfile } from "@/lib/auth";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · JNU Connect" }, { name: "description", content: "JNU Connect Super Admin dashboard." }],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <AuthGuard role="admin">
      <AdminLayout />
    </AuthGuard>
  );
}

type NavItem = { to: string; label: string; Icon: ComponentType<{ className?: string }> };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
      { to: "/admin/reports", label: "Reports", Icon: BarChart3 },
      { to: "/admin/notifications", label: "Notifications", Icon: Bell },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/admin/users", label: "Users", Icon: Users },
      { to: "/admin/departments", label: "Departments", Icon: Building2 },
      { to: "/admin/staff", label: "Staff", Icon: UserCog },
    ],
  },
  {
    label: "Events",
    items: [
      { to: "/admin/events", label: "Events", Icon: CalendarDays },
      { to: "/admin/sub-events", label: "Sub Events", Icon: Layers },
      { to: "/admin/special-guests", label: "Special Guests", Icon: Star },
      { to: "/admin/contestants", label: "Contestants", Icon: GraduationCap },
      { to: "/admin/judges", label: "Judges", Icon: Gavel },
      { to: "/admin/sponsors", label: "Sponsors", Icon: Handshake },
    ],
  },
  {
    label: "Engagement",
    items: [
      { to: "/admin/live", label: "Live Streams", Icon: Radio },
      { to: "/admin/voting", label: "Voting", Icon: Trophy },
      { to: "/admin/gallery", label: "Gallery", Icon: ImageIcon },
      { to: "/admin/certificates", label: "Certificates", Icon: Award },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/registrations", label: "Registrations", Icon: Ticket },
      { to: "/admin/payments", label: "Payments", Icon: IndianRupee },
      { to: "/admin/attendance", label: "Attendance", Icon: ClipboardCheck },
      { to: "/admin/settings", label: "Settings", Icon: Settings },
    ],
  },
];

const mobileNav = [
  { to: "/admin", label: "Home", Icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", Icon: CalendarDays },
  { to: "/admin/registrations", label: "Regs", Icon: Ticket },
  { to: "/admin/users", label: "Users", Icon: Users },
];


function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-muted/30 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <DashboardMobileHeader
        title="JNU Admin"
        subtitle="Super Admin"
        rootPath="/admin"
        groups={groups}
        pathname={pathname}
      />
      <div className="grid md:grid-cols-[260px_1fr] pt-14 md:pt-0">

        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border/60 bg-card p-4 md:block">
          <Link to="/admin" className="mb-6 flex items-center gap-2">
            <JnuLogo />
            <div>
              <div className="font-display font-semibold">JNU Admin</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Super Admin</div>
            </div>
          </Link>
          <nav className="grid gap-4">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  {g.label}
                </div>
                <div className="grid gap-0.5">
                  {g.items.map(({ to, label, Icon }) => {
                    const active = to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        className={
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors " +
                          (active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                        }
                      >
                        <Icon className="size-4" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-6 space-y-2 border-t border-border/60 pt-4">
            <AdminUserBadge />
            <button onClick={() => void signOut()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20">
              <LogOut className="size-3.5" /> Logout
            </button>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Back to app</Link>
          </div>
        </aside>
        <main className="min-h-screen p-4 md:p-10">
          <Outlet />
        </main>
      </div>
      <DashboardBottomNav items={mobileNav} pathname={pathname} rootPath="/admin" groups={groups} title="JNU Admin" subtitle="Super Admin" />
    </div>
  );
}

function AdminUserBadge() {
  const profile = useProfile();
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2 text-xs">
      <div className="font-semibold">{profile?.full_name ?? "Signed in"}</div>
      <div className="text-[10px] text-muted-foreground">{profile?.college ?? "JNU"}</div>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminStub({ title, subtitle, note }: { title: string; subtitle?: string; note?: string }) {
  return (
    <>
      <AdminPageHeader title={title} subtitle={subtitle} />
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        {note ?? `${title} management UI appears here.`}
      </div>
    </>
  );
}
