import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Bell,
  Briefcase,
  Building2,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  IdCard,
  LayoutDashboard,
  LogOut,
  Mail,
  QrCode,
  Settings,
  ShieldCheck,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { getEvent } from "@/lib/mock-data";
import { signOut, useAuth, useProfile, useRoles, type AppRole } from "@/lib/auth";
import { api as supabase } from "@/lib/api";

type DashInfo = {
  to: string;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
};

function dashboardsFor(roles: AppRole[]): DashInfo[] {
  const list: DashInfo[] = [];
  if (roles.includes("admin"))
    list.push({ to: "/admin", label: "Super Admin", hint: "Full platform control", Icon: ShieldCheck, tone: "from-primary to-accent" });
  if (roles.includes("dept_admin"))
    list.push({ to: "/dept-admin", label: "Department", hint: "Manage your department", Icon: Building2, tone: "from-accent to-primary" });
  if (roles.includes("coordinator"))
    list.push({ to: "/coordinator", label: "Coordinator", hint: "Events & contestants", Icon: Users, tone: "from-success to-primary" });
  if (roles.includes("staff"))
    list.push({ to: "/staff", label: "Staff", hint: "Scan & attendance", Icon: Briefcase, tone: "from-primary to-success" });
  return list;
}

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Super Admin",
  dept_admin: "Dept Admin",
  coordinator: "Coordinator",
  staff: "Staff",
  student: "Student",
};

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · JNU Connect" },
      { name: "description", content: "Your JNU Connect profile, registrations and QR passes." },
    ],
  }),
  component: () => (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  ),
});

interface Registration {
  id: string;
  event_id: string;
  sub_event: string | null;
  reg_id: string;
  status: string;
}

function initialsOf(name: string | null | undefined, email: string | null | undefined) {
  const src = (name || email || "U").trim();
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  const chars = (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
  return chars.toUpperCase();
}

function ProfilePage() {
  const { user } = useAuth();
  const profile = useProfile();
  const { roles } = useRoles();
  const [regs, setRegs] = useState<Registration[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("registrations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRegs((data as Registration[]) ?? []);
      });
  }, [user?.id]);

  const displayName = profile?.full_name ?? user?.full_name ?? user?.email?.split("@")[0] ?? "Student";
  const dashes = dashboardsFor(roles);
  const primaryRole = (roles.find((r) => r !== "student") ?? roles[0] ?? "student") as AppRole;
  const confirmed = regs.filter((r) => r.status === "Confirmed").length;

  return (
    <AppShell>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
        <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-52 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="size-20 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-2xl border-2 border-white/30 bg-white/15 font-display text-2xl font-bold backdrop-blur">
                {initialsOf(displayName, user?.email)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-white/60 bg-success px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
              Live
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              <ShieldCheck className="size-3" /> {ROLE_LABEL[primaryRole]}
            </div>
            <h1 className="truncate font-display text-xl font-bold leading-tight">{displayName}</h1>
            <div className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-white/80">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Meta pills */}
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <MetaPill Icon={IdCard} label="Enrollment" value={profile?.enrollment ?? "—"} />
          <MetaPill Icon={GraduationCap} label="Course" value={profile?.course ?? "—"} />
          <MetaPill Icon={Building2} label="College" value={profile?.college ?? "JNU"} />
        </div>

        {/* Extra roles */}
        {roles.length > 1 && (
          <div className="relative mt-3 flex flex-wrap gap-1.5">
            {roles
              .filter((r) => r !== primaryRole)
              .map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                >
                  {ROLE_LABEL[r]}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Stat strip */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatCard Icon={Ticket} value={regs.length} label="Registered" />
        <StatCard Icon={Award} value={confirmed} label="Confirmed" tone="success" />
        <Link
          to="/qr-pass"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-3 text-primary shadow-elevated transition-transform active:scale-[0.98]"
        >
          <QrCode className="size-5" />
          <div className="text-left">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pass</div>
            <div className="text-xs font-bold">Open</div>
          </div>
        </Link>
      </div>

      {/* Dashboards */}
      {dashes.length > 0 && (
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              My Dashboards
            </h2>
            <span className="text-[10px] text-muted-foreground">{dashes.length} available</span>
          </div>
          <div className="grid gap-2.5">
            {dashes.map(({ to, label, hint, Icon, tone }) => (
              <Link
                key={to}
                to={to}
                className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-br ${tone} p-3.5 text-primary-foreground shadow-glow transition-transform active:scale-[0.98]`}
              >
                <div className="grid size-11 place-items-center rounded-xl bg-white/25 backdrop-blur">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-bold">{label}</span>
                    <LayoutDashboard className="size-3.5 text-white/70" />
                  </div>
                  <div className="truncate text-[11px] text-white/85">{hint}</div>
                </div>
                <ChevronRight className="size-5 text-white/80 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Registrations */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            My Registrations
          </h2>
          <Link to="/events" className="text-[11px] font-semibold text-primary hover:underline">
            Browse →
          </Link>
        </div>
        {regs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-6 text-center">
            <Ticket className="mx-auto mb-2 size-6 text-muted-foreground" />
            <div className="text-sm font-semibold">No registrations yet</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Sign up for events to see your passes here.
            </div>
            <Link
              to="/events"
              className="mt-3 inline-flex rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Explore events
            </Link>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {regs.map((r) => {
              const event = getEvent(r.event_id);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-elevated"
                >
                  {event ? (
                    <img src={event.image} alt={event.name} className="size-14 rounded-xl object-cover" />
                  ) : (
                    <div className="grid size-14 place-items-center rounded-xl bg-secondary">
                      <Ticket className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-bold">{event?.name ?? r.event_id}</div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {r.sub_event ?? "General"} · ID {r.reg_id}
                    </div>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                      (r.status === "Confirmed"
                        ? "bg-success/15 text-success"
                        : "bg-accent/20 text-accent")
                    }
                  >
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Menu */}
      <section className="mt-6">
        <div className="mb-2 px-1">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Account
          </h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          <MenuRow to="/qr-pass" Icon={QrCode} label="My QR Passes" hint="Entry & event codes" />
          <MenuRow to="/certificates" Icon={Award} label="My Certificates" hint="Verified achievements" />
          <MenuRow to="/notifications" Icon={Bell} label="Notifications" hint="Alerts & updates" />
          <MenuRow to="/settings" Icon={Settings} label="Settings" hint="Preferences & privacy" />
          <MenuRow to="/help" Icon={HelpCircle} label="Help & Support" hint="FAQ and contact" last />
        </div>
      </section>

      <button
        onClick={() => {
          void signOut();
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="size-4" /> Sign out
      </button>

      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        JNU Connect · Signed in as {user?.email}
      </p>
    </AppShell>
  );
}

function MetaPill({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur">
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-white/70">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-0.5 truncate text-[11px] font-bold">{value}</div>
    </div>
  );
}

function StatCard({
  Icon,
  value,
  label,
  tone,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  tone?: "success";
}) {
  const color = tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-elevated">
      <div className={`flex items-center gap-1.5 ${color}`}>
        <Icon className="size-4" />
        <span className="font-display text-lg font-bold leading-none">{value}</span>
      </div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function MenuRow({
  to,
  Icon,
  label,
  hint,
  last,
}: {
  to: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  last?: boolean;
}) {
  return (
    <Link
      to={to}
      className={
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/60 " +
        (last ? "" : "border-b border-border/60")
      }
    >
      <div className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        {hint && <div className="truncate text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
