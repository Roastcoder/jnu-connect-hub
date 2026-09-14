import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import {
  LayoutDashboard, ScanLine, Ticket, ClipboardCheck, CalendarDays,
  LogOut, ArrowLeft, MoreHorizontal,
} from "lucide-react";
import { JnuLogo } from "@/components/Logo";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardBottomNav } from "@/components/DashboardBottomNav";
import { DashboardMobileHeader } from "@/components/DashboardMobileHeader";

import { signOut, useProfile } from "@/lib/auth";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Console · JNU Connect" },
      { name: "description", content: "Scan attendee QR passes and track registrations across events." },
    ],
  }),
  component: () => (
    <AuthGuard role={["staff", "admin", "coordinator"]}>
      <StaffLayout />
    </AuthGuard>
  ),
});

type NavItem = { to: string; label: string; Icon: ComponentType<{ className?: string }> };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Desk",
    items: [
      { to: "/staff", label: "Dashboard", Icon: LayoutDashboard },
      { to: "/staff/scan", label: "QR Scanner", Icon: ScanLine },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/staff/registrations", label: "Registrations", Icon: Ticket },
      { to: "/staff/attendance", label: "Attendance", Icon: ClipboardCheck },
      { to: "/events", label: "Events", Icon: CalendarDays },
    ],
  },
];

const mobileNav = [
  { to: "/staff", label: "Home", Icon: LayoutDashboard },
  { to: "/staff/scan", label: "Scan", Icon: ScanLine },
  { to: "/staff/registrations", label: "Regs", Icon: Ticket },
  { to: "/staff/attendance", label: "Attend", Icon: ClipboardCheck },
];

function StaffLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-muted/30 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <DashboardMobileHeader
        title="Staff"
        subtitle="Console"
        rootPath="/staff"
        groups={groups}
        pathname={pathname}
      />
      <div className="grid md:grid-cols-[260px_1fr] pt-14 md:pt-0">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border/60 bg-card p-4 md:block">

          <Link to="/staff" className="mb-6 flex items-center gap-2">
            <JnuLogo />
            <div>
              <div className="font-display font-semibold">Staff</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Console</div>
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
                    const active = to === "/staff" ? pathname === "/staff" : pathname.startsWith(to);
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
            <StaffUserBadge />
            <button onClick={() => void signOut()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20">
              <LogOut className="size-3.5" /> Logout
            </button>
            <Link to="/" className="inline-flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3" /> Back to app
            </Link>
          </div>
        </aside>
        <main className="min-h-screen p-4 md:p-10">
          <Outlet />
        </main>
      </div>
      <DashboardBottomNav items={mobileNav} pathname={pathname} rootPath="/staff" groups={groups} title="Staff" subtitle="Console" />
    </div>
  );
}

function StaffUserBadge() {
  const profile = useProfile();
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2 text-xs">
      <div className="font-semibold">{profile?.full_name ?? "Signed in"}</div>
      <div className="text-[10px] text-muted-foreground">{profile?.college ?? "JNU"}</div>
    </div>
  );
}

export function StaffPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Staff Console</div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
