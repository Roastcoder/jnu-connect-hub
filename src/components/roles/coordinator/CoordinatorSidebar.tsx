import { ComponentType } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, Layers, GraduationCap, Gavel, Trophy, LogOut, Flame
} from "lucide-react";
import { JnuLogo } from "@/components/Logo";
import { signOut, useProfile } from "@/lib/auth";

export const COORD_NAV_ITEMS: { to: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { to: "/coordinator", label: "Overview", Icon: LayoutDashboard },
  { to: "/coordinator/events", label: "Assigned Events", Icon: CalendarDays },
  { to: "/coordinator/sub-events", label: "Event Rounds", Icon: Layers },
  { to: "/coordinator/contestants", label: "Contestant Roster", Icon: GraduationCap },
  { to: "/coordinator/judges", label: "Judges Panel", Icon: Gavel },
  { to: "/coordinator/voting", label: "Live Voting Board", Icon: Trophy },
];

export function CoordinatorSidebar() {
  const { pathname } = useLocation();
  const profile = useProfile();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-card p-4 md:flex">
      <Link to="/coordinator" className="mb-6 flex items-center gap-3 px-2">
        <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
          <Flame className="size-5" />
        </div>
        <div>
          <div className="font-display text-base font-bold text-foreground">Coordinator</div>
          <div className="text-[10px] font-semibold tracking-wider text-amber-500 uppercase">Event Lead</div>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto space-y-1">
        {COORD_NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = to === "/coordinator" ? pathname === "/coordinator" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all " +
                (active
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
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
          <div className="font-semibold text-foreground truncate">{profile?.full_name || "Event Coordinator"}</div>
          <div className="text-[11px] text-muted-foreground truncate">{profile?.college || "Technorazz Committee"}</div>
        </div>
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="size-3.5" /> Log out
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
          ← Public Fest View
        </Link>
      </div>
    </aside>
  );
}
