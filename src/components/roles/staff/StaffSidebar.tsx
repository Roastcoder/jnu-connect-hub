import { ComponentType } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, QrCode, ClipboardCheck, Ticket, LogOut, ShieldAlert
} from "lucide-react";
import { signOut, useProfile } from "@/lib/auth";

export const STAFF_NAV_ITEMS: { to: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { to: "/staff", label: "Overview", Icon: LayoutDashboard },
  { to: "/staff/scan", label: "Gate QR Scanner", Icon: QrCode },
  { to: "/staff/attendance", label: "Live Attendance", Icon: ClipboardCheck },
  { to: "/staff/registrations", label: "Pass Verification", Icon: Ticket },
];

export function StaffSidebar() {
  const { pathname } = useLocation();
  const profile = useProfile();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-card p-4 md:flex">
      <Link to="/staff" className="mb-6 flex items-center gap-3 px-2">
        <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <div className="font-display text-base font-bold text-foreground">Gate Staff</div>
          <div className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase">Check-In Desk</div>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto space-y-1">
        {STAFF_NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = to === "/staff" ? pathname === "/staff" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all " +
                (active
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
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
          <div className="font-semibold text-foreground truncate">{profile?.full_name || "Event Gatekeeper"}</div>
          <div className="text-[11px] text-muted-foreground truncate">Main Entry Gate</div>
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
