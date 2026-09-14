import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, Image as ImageIcon, User, Sparkles, Bell, Radio, Trophy, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { JnuLogo } from "@/components/Logo";
import { signOut, useAuth, useRoles, type AppRole } from "@/lib/auth";

type NavItem = { to: string; label: string; Icon: ComponentType<{ className?: string }>; roles?: AppRole[]; publicOnly?: boolean };

const nav: NavItem[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/events", label: "Events", Icon: Sparkles },
  { to: "/live", label: "Live", Icon: Radio },
  { to: "/voting", label: "Vote", Icon: Trophy },
  { to: "/leaderboard", label: "Ranks", Icon: Trophy },
  { to: "/gallery", label: "Gallery", Icon: ImageIcon },
  { to: "/calendar", label: "Calendar", Icon: CalendarDays },
  { to: "/certificates/verify", label: "Verify", Icon: ShieldCheck },
];

const bottomNav: NavItem[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/events", label: "Events", Icon: Sparkles },
  { to: "/live", label: "Live", Icon: Radio },
  { to: "/voting", label: "Vote", Icon: Trophy },
  { to: "/profile", label: "Me", Icon: User },
];

function dashboardLink(roles: AppRole[]): { to: string; label: string } | null {
  if (roles.includes("admin")) return { to: "/admin", label: "Admin" };
  if (roles.includes("dept_admin")) return { to: "/dept-admin", label: "Department" };
  if (roles.includes("coordinator")) return { to: "/coordinator", label: "Coordinator" };
  if (roles.includes("staff")) return { to: "/staff", label: "Staff" };
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="relative min-h-screen bg-slate-50/50 text-foreground antialiased selection:bg-primary/20 selection:text-primary pb-24">
      {/* Background Soft Warm Light Glows (JNU Theme) */}
      <div className="ambient-glow-orb -top-24 -left-24 size-80 bg-red-600/5 animate-float-slow" />
      <div className="ambient-glow-orb top-1/3 -right-24 size-96 bg-amber-500/5 animate-float-slow [animation-delay:3s]" />
      <div className="ambient-glow-orb bottom-10 left-1/4 size-80 bg-rose-500/5 animate-float-slow [animation-delay:5s]" />

      {/* Permanently Fixed TopBar */}
      <TopBar />

      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col justify-between pt-[calc(max(env(safe-area-inset-top),0.65rem)+3.1rem)]">
        <main className="px-3.5 sm:px-4 pt-1.5">{children}</main>
        <BottomNav pathname={pathname} />
      </div>
    </div>
  );
}

export function TopBar() {
  const { user } = useAuth();
  const { roles } = useRoles();
  const dash = user ? dashboardLink(roles) : null;

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 w-full bg-white/95 backdrop-blur-2xl border-b border-rose-100/90 shadow-[0_2px_12px_rgba(153,0,0,0.04)] transition-all"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.65rem)" }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-3.5 sm:px-4 pb-2.5">
        <Link to="/" className="flex items-center gap-2.5 group active:scale-95 transition-transform">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <JnuLogo />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
              JNU <span className="text-primary font-extrabold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">Connect</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[8px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="text-[8.5px] tracking-wider text-muted-foreground uppercase font-semibold">Technorazz 2026</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {dash && (
            <Link
              to={dash.to}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary active:scale-95 transition-all"
            >
              <LayoutDashboard className="size-3" />
              <span>{dash.label}</span>
            </Link>
          )}

          {user && (
            <Link
              to="/notifications"
              className="relative grid size-8 place-items-center rounded-full bg-slate-100 text-foreground active:scale-90 transition-all"
              aria-label="Notifications"
            >
              <Bell className="size-3.5 text-slate-700" />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-primary ring-2 ring-white" />
            </Link>
          )}

          <AuthButton />
        </div>
      </div>
    </header>
  );
}

function AuthButton() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return (
      <Link
        to="/auth/login"
        search={{ next: "/profile" }}
        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-700 to-red-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-95 transition-all"
      >
        Sign in
      </Link>
    );
  }
  return (
    <Link
      to="/profile"
      className="grid size-8 place-items-center rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold active:scale-95 transition-all shadow-sm"
      title={user.email ?? ""}
    >
      {(user.full_name || user.email || "U").slice(0, 1).toUpperCase()}
    </Link>
  );
}

export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="mx-auto max-w-md px-3.5 py-1.5">
        <div className="pointer-events-auto flex items-center justify-around rounded-3xl border border-rose-100/80 bg-white/95 backdrop-blur-2xl px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {bottomNav.map(({ to, label, Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-1 flex-col items-center gap-0.5 py-0.5 text-[10px] font-semibold transition-all active:scale-90"
              >
                <span
                  className={
                    "grid size-9 place-items-center rounded-2xl transition-all duration-200 " +
                    (active
                      ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-glow scale-105"
                      : "text-slate-500 hover:text-slate-900")
                  }
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={
                    active
                      ? "font-extrabold text-red-700"
                      : "text-slate-500"
                  }
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full liquid-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function QuickActionGrid({
  actions,
}: {
  actions: {
    to: string;
    label: string;
    hint?: string;
    Icon: ComponentType<{ className?: string }>;
    tone?: "primary" | "accent" | "success" | "muted";
  }[];
}) {
  const tones: Record<string, string> = {
    primary: "bg-gradient-primary text-primary-foreground shadow-glow",
    accent: "bg-gradient-to-br from-accent to-primary text-accent-foreground shadow-glow",
    success: "bg-gradient-to-br from-success to-primary text-white shadow-glow",
    muted: "liquid-pill text-foreground",
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ to, label, hint, Icon, tone = "muted" }) => (
        <Link
          key={to}
          to={to}
          className="liquid-glass group relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 shadow-elevated transition-transform active:scale-[0.98]"
        >
          <div className={`inline-grid size-11 place-items-center rounded-2xl ${tones[tone]}`}>
            <Icon className="size-5" />
          </div>
          <div className="mt-6">
            <div className="font-display text-sm font-bold">{label}</div>
            {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
          </div>
        </Link>
      ))}
    </div>
  );
}
