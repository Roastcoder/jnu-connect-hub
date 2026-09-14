import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import {
  LayoutDashboard, CalendarDays, Layers, Users, Gavel, Trophy,
  LogOut, MoreHorizontal, ArrowLeft,
} from "lucide-react";
import { JnuLogo } from "@/components/Logo";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardBottomNav } from "@/components/DashboardBottomNav";
import { DashboardMobileHeader } from "@/components/DashboardMobileHeader";
import { signOut, useProfile } from "@/lib/auth";


export const Route = createFileRoute("/coordinator")({
  head: () => ({
    meta: [
      { title: "Coordinator Console · JNU Connect" },
      { name: "description", content: "Create and manage events, sub-events, contestants and judges. Start and stop voting live." },
    ],
  }),
  component: CoordinatorRoute,
});

function CoordinatorRoute() {
  return (
    <AuthGuard role={["coordinator", "admin"]}>
      <CoordinatorLayout />
    </AuthGuard>
  );
}

type NavItem = { to: string; label: string; Icon: ComponentType<{ className?: string }> };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/coordinator", label: "Dashboard", Icon: LayoutDashboard },
    ],
  },
  {
    label: "Programme",
    items: [
      { to: "/coordinator/events", label: "Events", Icon: CalendarDays },
      { to: "/coordinator/sub-events", label: "Sub-events", Icon: Layers },
    ],
  },
  {
    label: "Participants",
    items: [
      { to: "/coordinator/contestants", label: "Contestants", Icon: Users },
      { to: "/coordinator/judges", label: "Judges", Icon: Gavel },
    ],
  },
  {
    label: "Live",
    items: [
      { to: "/coordinator/voting", label: "Voting control", Icon: Trophy },
    ],
  },
];

const mobileNav = [
  { to: "/coordinator", label: "Home", Icon: LayoutDashboard },
  { to: "/coordinator/events", label: "Events", Icon: CalendarDays },
  { to: "/coordinator/contestants", label: "People", Icon: Users },
  { to: "/coordinator/voting", label: "Voting", Icon: Trophy },
];

function CoordinatorLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-muted/30 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <DashboardMobileHeader
        title="Coordinator"
        subtitle="Console"
        rootPath="/coordinator"
        groups={groups}
        pathname={pathname}
      />
      <div className="grid md:grid-cols-[260px_1fr] pt-14 md:pt-0">

        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border/60 bg-card p-4 md:block">
          <Link to="/coordinator" className="mb-6 flex items-center gap-2">
            <JnuLogo />
            <div>
              <div className="font-display font-semibold">Coordinator</div>
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
                    const active = to === "/coordinator" ? pathname === "/coordinator" : pathname.startsWith(to);
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
            <CoordinatorUserBadge />
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
      <DashboardBottomNav items={mobileNav} pathname={pathname} rootPath="/coordinator" groups={groups} title="Coordinator" subtitle="Console" />
    </div>
  );
}

function CoordinatorUserBadge() {
  const profile = useProfile();
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2 text-xs">
      <div className="font-semibold">{profile?.full_name ?? "Signed in"}</div>
      <div className="text-[10px] text-muted-foreground">{profile?.college ?? "JNU"}</div>
    </div>
  );
}

export function CoordinatorPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Coordinator Console</div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
