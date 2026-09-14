import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, Image as ImageIcon, User, Sparkles, Bell, Radio, Trophy, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { JnuLogo } from "@/components/Logo";
import { signOut, useAuth, useRoles, type AppRole } from "@/lib/auth";

type NavItem = { to: string; label: string; Icon: ComponentType<{ className?: string }>; roles?: AppRole[]; publicOnly?: boolean };

// Public nav only — no dashboard links here. Signed-in dashboard entry point
// is added dynamically via `dashboardLink()` based on the user's highest role.
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

// Highest-privilege dashboard for the current user.
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
    <div
      className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 pt-4 md:pt-6">{children}</main>
      <BottomNav pathname={pathname} />
    </div>
  );
}

export function TopBar() {
  const { user } = useAuth();
  const { roles } = useRoles();
  const dash = user ? dashboardLink(roles) : null;
  const items: NavItem[] = [...nav];
  if (user) items.push({ to: "/profile", label: "Profile", Icon: User });

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-200">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/80 dark:bg-zinc-950/80 px-4 py-2 backdrop-blur-2xl shadow-apple transition-all">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="transition-transform duration-200 group-hover:scale-105">
              <JnuLogo />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                JNU <span className="text-primary font-extrabold">Connect</span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <div className="text-[9px] tracking-wider text-muted-foreground uppercase font-medium">Jaipur National University</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex bg-slate-100/60 dark:bg-zinc-900/60 p-1 rounded-full border border-black/[0.04] dark:border-white/[0.05]">
            {items.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-white/80 dark:hover:bg-zinc-800/80 data-[active]:bg-white dark:data-[active]:bg-zinc-800 data-[active]:text-foreground data-[active]:shadow-sm"
                activeProps={{ "data-active": "true" } as any}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {dash && (
              <Link
                to={dash.to}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                activeProps={{ "data-active": "true" } as any}
              >
                <LayoutDashboard className="size-3.5" />
                <span className="hidden sm:inline">{dash.label}</span> Console
              </Link>
            )}

            {user && (
              <Link
                to="/notifications"
                className="relative grid size-8 place-items-center rounded-full bg-slate-100 dark:bg-zinc-900 text-foreground transition-all duration-200 hover:bg-slate-200 dark:hover:bg-zinc-800"
                aria-label="Notifications"
              >
                <Bell className="size-3.5" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary ring-2 ring-background" />
              </Link>
            )}

            <AuthButton />
          </div>
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
        className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        Sign in
      </Link>
    );
  }
  return (
    <button
      onClick={() => void signOut()}
      className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all duration-200 active:scale-[0.98]"
      title={user.email ?? ""}
    >
      <LogOut className="size-3.5" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}

export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-4 pb-1 pt-1.5 md:px-6">
        {bottomNav.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex min-w-14 flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-medium transition-colors"
            >
              <span
                className={
                  "grid size-10 place-items-center rounded-2xl transition-all " +
                  (active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground")
                }
              >
                <Icon className="size-5" />
              </span>
              <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
            </Link>
          );
        })}
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
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
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

// 2x2 quick-actions grid — mobile app-style dashboard cards.
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
    muted: "bg-secondary text-foreground",
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ to, label, hint, Icon, tone = "muted" }) => (
        <Link
          key={to}
          to={to}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-elevated transition-transform active:scale-[0.98]"
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
