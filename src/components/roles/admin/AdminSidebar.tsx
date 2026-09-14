import { ComponentType } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3, CalendarDays, Image as ImageIcon, LayoutDashboard, Radio, Ticket, Trophy, Users,
  Award, Building2, UserCog, Layers, Star, GraduationCap, Gavel, Handshake, IndianRupee,
  ClipboardCheck, Bell, Settings, LogOut,
} from "lucide-react";
import { JnuLogo } from "@/components/Logo";
import { signOut, useProfile } from "@/lib/auth";

export type AdminNavGroup = {
  label: string;
  items: { to: string; label: string; Icon: ComponentType<{ className?: string }> }[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
      { to: "/admin/reports", label: "Analytics & Reports", Icon: BarChart3 },
      { to: "/admin/notifications", label: "Announcements", Icon: Bell },
    ],
  },
  {
    label: "People & Org",
    items: [
      { to: "/admin/users", label: "User Accounts", Icon: Users },
      { to: "/admin/departments", label: "Departments", Icon: Building2 },
      { to: "/admin/staff", label: "Staff Roster", Icon: UserCog },
    ],
  },
  {
    label: "Fest & Events",
    items: [
      { to: "/admin/events", label: "Events Directory", Icon: CalendarDays },
      { to: "/admin/sub-events", label: "Sub-Events", Icon: Layers },
      { to: "/admin/special-guests", label: "Special Guests", Icon: Star },
      { to: "/admin/contestants", label: "Contestants", Icon: GraduationCap },
      { to: "/admin/judges", label: "Judges Panel", Icon: Gavel },
      { to: "/admin/sponsors", label: "Sponsors & Partners", Icon: Handshake },
    ],
  },
  {
    label: "Engagement",
    items: [
      { to: "/admin/live", label: "Live Broadcasts", Icon: Radio },
      { to: "/admin/voting", label: "Live Voting", Icon: Trophy },
      { to: "/admin/gallery", label: "Photo Gallery", Icon: ImageIcon },
      { to: "/admin/certificates", label: "Certificates", Icon: Award },
    ],
  },
  {
    label: "Gate & Finance",
    items: [
      { to: "/admin/registrations", label: "Registrations", Icon: Ticket },
      { to: "/admin/payments", label: "Payments", Icon: IndianRupee },
      { to: "/admin/attendance", label: "Attendance", Icon: ClipboardCheck },
      { to: "/admin/settings", label: "Platform Settings", Icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const profile = useProfile();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-card p-4 md:flex">
      <Link to="/admin" className="mb-6 flex items-center gap-3 px-2">
        <JnuLogo className="size-9" />
        <div>
          <div className="font-display text-base font-bold text-foreground">JNU Portal</div>
          <div className="text-[10px] font-semibold tracking-wider text-primary uppercase">Super Admin</div>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {ADMIN_NAV_GROUPS.map((g) => (
          <div key={g.label}>
            <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
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
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all " +
                      (active
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border/60 pt-4 space-y-2">
        <div className="rounded-xl bg-secondary/60 p-3 text-xs">
          <div className="font-semibold text-foreground truncate">{profile?.full_name || "Administrator"}</div>
          <div className="text-[11px] text-muted-foreground truncate">{profile?.college || "Jaipur National University"}</div>
        </div>
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="size-3.5" /> Log out
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
          ← Public Portal
        </Link>
      </div>
    </aside>
  );
}
