import { ComponentType } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, Users, Award, Image as ImageIcon,
  BarChart3, Settings, LogOut, GraduationCap, ClipboardCheck, Ticket, Building2
} from "lucide-react";
import { JnuLogo } from "@/components/Logo";
import { signOut, useProfile } from "@/lib/auth";

export const DEPT_NAV_ITEMS: { to: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { to: "/dept-admin", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/dept-admin/events", label: "Dept Events", Icon: CalendarDays },
  { to: "/dept-admin/faculty", label: "Faculty Roster", Icon: Users },
  { to: "/dept-admin/students", label: "Students Directory", Icon: GraduationCap },
  { to: "/dept-admin/registrations", label: "Registrations", Icon: Ticket },
  { to: "/dept-admin/attendance", label: "Attendance Records", Icon: ClipboardCheck },
  { to: "/dept-admin/certificates", label: "Issue Certificates", Icon: Award },
  { to: "/dept-admin/gallery", label: "Department Gallery", Icon: ImageIcon },
  { to: "/dept-admin/reports", label: "Analytics & Reports", Icon: BarChart3 },
  { to: "/dept-admin/settings", label: "Department Settings", Icon: Settings },
];

export function DeptAdminSidebar() {
  const { pathname } = useLocation();
  const profile = useProfile();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-card p-4 md:flex">
      <Link to="/dept-admin" className="mb-6 flex items-center gap-3 px-2">
        <div className="grid size-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 font-bold">
          <Building2 className="size-5" />
        </div>
        <div>
          <div className="font-display text-base font-bold text-foreground">Dept Admin</div>
          <div className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase">Department Portal</div>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto space-y-1">
        {DEPT_NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = to === "/dept-admin" ? pathname === "/dept-admin" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all " +
                (active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground")
              }
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border/60 pt-4 space-y-2">
        <div className="rounded-xl bg-secondary/60 p-3 text-xs">
          <div className="font-semibold text-foreground truncate">{profile?.full_name || "Department Admin"}</div>
          <div className="text-[11px] text-muted-foreground truncate">{profile?.college || "School of Engineering (SOET)"}</div>
        </div>
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="size-3.5" /> Log out
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
          ← Student Portal
        </Link>
      </div>
    </aside>
  );
}
