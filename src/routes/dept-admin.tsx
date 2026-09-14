import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, GraduationCap, CalendarDays, Ticket, ClipboardCheck,
  Award, Image as ImageIcon, BarChart3, Settings, LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { JnuLogo } from "@/components/Logo";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardBottomNav } from "@/components/DashboardBottomNav";
import { DashboardMobileHeader, type DashboardNavGroup } from "@/components/DashboardMobileHeader";
import { signOut } from "@/lib/auth";

export const Route = createFileRoute("/dept-admin")({
  head: () => ({
    meta: [
      { title: "Department Admin · JNU Connect" },
      { name: "description", content: "Department admin dashboard for JNU Connect." },
    ],
  }),
  component: DeptAdminRoute,
});

function DeptAdminRoute() {
  return (
    <AuthGuard role={["dept_admin", "admin"]}>
      <DeptAdminLayout />
    </AuthGuard>
  );
}

const groups: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/dept-admin", label: "Dashboard", Icon: LayoutDashboard },
      { to: "/dept-admin/reports", label: "Reports", Icon: BarChart3 },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/dept-admin/students", label: "Students", Icon: GraduationCap },
      { to: "/dept-admin/faculty", label: "Faculty", Icon: Users },
    ],
  },
  {
    label: "Events",
    items: [
      { to: "/dept-admin/events", label: "Department Events", Icon: CalendarDays },
      { to: "/dept-admin/registrations", label: "Registrations", Icon: Ticket },
      { to: "/dept-admin/attendance", label: "Attendance", Icon: ClipboardCheck },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/dept-admin/certificates", label: "Certificates", Icon: Award },
      { to: "/dept-admin/gallery", label: "Gallery", Icon: ImageIcon },
      { to: "/dept-admin/settings", label: "Settings", Icon: Settings },
    ],
  },
];

const mobileNav = [
  { to: "/dept-admin", label: "Home", Icon: LayoutDashboard },
  { to: "/dept-admin/students", label: "Students", Icon: GraduationCap },
  { to: "/dept-admin/events", label: "Events", Icon: CalendarDays },
  { to: "/dept-admin/registrations", label: "Regs", Icon: Ticket },
];

function DeptAdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-muted/30 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <DashboardMobileHeader
        title="Department"
        subtitle="Dept Admin"
        rootPath="/dept-admin"
        groups={groups}
        pathname={pathname}
      />
      <div className="grid md:grid-cols-[260px_1fr] pt-14 md:pt-0">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border/60 bg-card p-4 md:block">
          <Link to="/dept-admin" className="mb-6 flex items-center gap-2">
            <JnuLogo />
            <div>
              <div className="font-display font-semibold">BCA Department</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dept Admin</div>
            </div>
          </Link>
          <nav className="grid gap-4">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{g.label}</div>
                <div className="grid gap-0.5">
                  {g.items.map(({ to, label, Icon }) => {
                    const active = to === "/dept-admin" ? pathname === "/dept-admin" : pathname.startsWith(to);
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
            <button onClick={() => void signOut()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20">
              <LogOut className="size-3.5" /> Logout
            </button>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Back to app</Link>
          </div>
        </aside>
        <main className="min-h-screen p-4 md:p-10"><Outlet /></main>
      </div>
      <DashboardBottomNav
        items={mobileNav}
        pathname={pathname}
        rootPath="/dept-admin"
        groups={groups}
        title="Department"
        subtitle="Dept Admin"
      />
    </div>
  );
}


export function DeptPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
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

export function DeptStub({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <DeptPageHeader title={title} subtitle={subtitle} />
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        {title} view appears here.
      </div>
    </>
  );
}
