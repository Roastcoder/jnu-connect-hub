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
  BadgeCheck,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { getEvent } from "@/lib/mock-data";
import { signOut, useAuth, useProfile, useRoles, type AppRole } from "@/lib/auth";
import { api as supabase } from "@/lib/api";
import { JnuLogo } from "@/components/Logo";

type DashInfo = {
  to: string;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
  iconBg: string;
  iconColor: string;
};

function dashboardsFor(roles: AppRole[]): DashInfo[] {
  const list: DashInfo[] = [];
  if (roles.includes("admin"))
    list.push({
      to: "/admin",
      label: "Super Admin",
      hint: "Full platform control & governance",
      Icon: ShieldCheck,
      tone: "border-red-200 bg-red-50/50 hover:bg-red-50/90",
      iconBg: "bg-red-700",
      iconColor: "text-white",
    });
  if (roles.includes("dept_admin"))
    list.push({
      to: "/dept-admin",
      label: "Department Console",
      hint: "Manage departmental events & students",
      Icon: Building2,
      tone: "border-amber-200 bg-amber-50/50 hover:bg-amber-50/90",
      iconBg: "bg-amber-600",
      iconColor: "text-white",
    });
  if (roles.includes("coordinator"))
    list.push({
      to: "/coordinator",
      label: "Coordinator Console",
      hint: "Events, contestants & judging scorecards",
      Icon: Users,
      tone: "border-blue-200 bg-blue-50/50 hover:bg-blue-50/90",
      iconBg: "bg-blue-600",
      iconColor: "text-white",
    });
  if (roles.includes("staff"))
    list.push({
      to: "/staff",
      label: "Staff Gate Scanner",
      hint: "Scan tickets & mark attendance live",
      Icon: Briefcase,
      tone: "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50/90",
      iconBg: "bg-emerald-600",
      iconColor: "text-white",
    });
  return list;
}

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Super Admin",
  dept_admin: "Dept Admin",
  coordinator: "Coordinator",
  staff: "Staff",
  student: "Student Member",
};

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile · JNU Connect" },
      { name: "description", content: "Your official JNU student & attendee profile, registrations and QR passes." },
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
  const [copied, setCopied] = useState(false);

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

  const displayName =
    profile?.full_name ??
    user?.profile?.full_name ??
    user?.full_name ??
    user?.email?.split("@")[0] ??
    "Student";

  const enrollmentNumber = profile?.enrollment ?? "23JNU1084";
  const dashes = dashboardsFor(roles);
  const primaryRole = (roles.find((r) => r !== "student") ?? roles[0] ?? "student") as AppRole;
  const confirmed = regs.filter((r) => r.status === "Confirmed").length;

  const copyEnrollment = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(enrollmentNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppShell>
      {/* ==================== Official JNU Smart Digital ID Pass ==================== */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-xl">
        {/* Top University Brand Bar */}
        <div className="relative bg-gradient-to-r from-red-800 via-red-700 to-rose-800 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white p-1 shadow-xs">
                <JnuLogo />
              </div>
              <div>
                <div className="font-display text-xs font-bold uppercase tracking-wider text-white">
                  Jaipur National University
                </div>
                <div className="text-[9px] font-semibold text-rose-100/90 tracking-wide">
                  Official Campus Digital ID • Technorazz 2026
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            {/* User Avatar with Dual Rings */}
            <div className="relative shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="size-16 sm:size-18 rounded-2xl border-2 border-white object-cover shadow-md ring-2 ring-red-600/20"
                />
              ) : (
                <div className="grid size-16 sm:size-18 place-items-center rounded-2xl border-2 border-white bg-gradient-to-br from-red-50 to-rose-100 font-display text-xl font-bold text-red-800 shadow-md ring-2 ring-red-600/20">
                  {initialsOf(displayName, user?.email)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-red-700 text-white ring-2 ring-white shadow-xs">
                <BadgeCheck className="size-3.5" />
              </span>
            </div>

            {/* Identity Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200/80 px-2 py-0.5 text-[10px] font-bold text-red-800">
                  <ShieldCheck className="size-3 text-red-700" />
                  {ROLE_LABEL[primaryRole]}
                </span>
                {roles
                  .filter((r) => r !== primaryRole)
                  .map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-700"
                    >
                      {ROLE_LABEL[r]}
                    </span>
                  ))}
              </div>

              <h1 className="truncate font-display text-lg font-bold text-slate-900 leading-tight">
                {displayName}
              </h1>

              <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                <Mail className="size-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
            <div
              onClick={copyEnrollment}
              className="cursor-pointer rounded-xl bg-slate-50/90 border border-slate-200/70 p-2 text-center transition-all hover:bg-slate-100 active:scale-95"
            >
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <IdCard className="size-3" /> Enrollment
              </div>
              <div className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[11px] font-bold text-slate-800 truncate">
                {enrollmentNumber}
                {copied ? <Check className="size-2.5 text-emerald-600" /> : <Copy className="size-2.5 text-slate-400" />}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/90 border border-slate-200/70 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <GraduationCap className="size-3" /> Program
              </div>
              <div className="mt-0.5 truncate text-[11px] font-bold text-slate-800">
                {profile?.course ?? "B.Tech / MCA"}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50/90 border border-slate-200/70 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <Building2 className="size-3" /> School
              </div>
              <div className="mt-0.5 truncate text-[11px] font-bold text-slate-800">
                {profile?.college ?? "SCSS / JNU"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== Quick Metric Strips ==================== */}
      <div className="mt-3.5 grid grid-cols-3 gap-2">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <Ticket className="size-4 text-red-600" />
            <span className="text-[10px] font-semibold text-slate-400">Passes</span>
          </div>
          <div className="mt-1 font-display text-xl font-extrabold text-slate-900">
            {regs.length}
          </div>
          <div className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-500">
            Registered
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <Award className="size-4 text-emerald-600" />
            <span className="text-[10px] font-semibold text-emerald-600 font-bold">Active</span>
          </div>
          <div className="mt-1 font-display text-xl font-extrabold text-slate-900">
            {confirmed}
          </div>
          <div className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-500">
            Confirmed
          </div>
        </div>

        <Link
          to="/qr-pass"
          className="flex flex-col justify-between rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-rose-50/80 p-3 shadow-xs transition-all hover:brightness-95 active:scale-95 group"
        >
          <div className="flex items-center justify-between text-red-700">
            <QrCode className="size-4" />
            <ChevronRight className="size-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="mt-1 font-display text-sm font-extrabold text-red-900 leading-tight">
            Gate Pass
          </div>
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-red-700">
            View Live QR
          </div>
        </Link>
      </div>

      {/* ==================== Role Dashboards (If Staff / Admin) ==================== */}
      {dashes.length > 0 && (
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-display text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-red-700" /> Administrative Access
            </h2>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-full">
              {dashes.length} Role{dashes.length > 1 ? "s" : ""} Active
            </span>
          </div>

          <div className="grid gap-2">
            {dashes.map(({ to, label, hint, Icon, tone, iconBg, iconColor }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3.5 rounded-2xl border p-3.5 shadow-xs transition-all active:scale-[0.98] ${tone}`}
              >
                <div className={`grid size-11 place-items-center rounded-xl shadow-xs ${iconBg} ${iconColor}`}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-bold text-slate-900">{label}</span>
                  </div>
                  <div className="truncate text-xs text-slate-600">{hint}</div>
                </div>
                <div className="grid size-7 place-items-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <ChevronRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ==================== Registered Events & Passes ==================== */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-display text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Ticket className="size-3.5 text-red-700" /> My Registered Events
          </h2>
          <Link to="/events" className="text-[11px] font-bold text-red-700 hover:underline flex items-center gap-0.5">
            Browse All <ChevronRight className="size-3" />
          </Link>
        </div>

        {regs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center shadow-xs">
            <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-red-50 text-red-700">
              <Ticket className="size-6" />
            </div>
            <div className="text-sm font-bold text-slate-900">No event passes booked yet</div>
            <div className="mt-0.5 text-xs text-slate-500 max-w-xs mx-auto">
              Browse 17 flagship Technorazz 2026 competitions and register in seconds.
            </div>
            <Link
              to="/events"
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 px-4 py-2 text-xs font-bold text-white shadow-glow hover:brightness-105 active:scale-95 transition-all"
            >
              <Sparkles className="size-3.5" /> Explore Technorazz Events
            </Link>
          </div>
        ) : (
          <div className="grid gap-2">
            {regs.map((r) => {
              const event = getEvent(r.event_id);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs"
                >
                  {event ? (
                    <img src={event.image} alt={event.name} className="size-13 rounded-xl object-cover" />
                  ) : (
                    <div className="grid size-13 place-items-center rounded-xl bg-slate-100">
                      <Ticket className="size-5 text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-bold text-slate-900">
                      {event?.name ?? r.event_id}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{r.sub_event ?? "General Entry"}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-600">ID: {r.reg_id}</span>
                    </div>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                      (r.status === "Confirmed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200")
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

      {/* ==================== Account Services & Shortcuts ==================== */}
      <section className="mt-5">
        <div className="mb-2 px-1">
          <h2 className="font-display text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
            Account & Security
          </h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs divide-y divide-slate-100">
          <MenuRow to="/qr-pass" Icon={QrCode} label="My QR Entry Passes" hint="Digital campus entry codes & verification" />
          <MenuRow to="/certificates" Icon={Award} label="My Certificates Vault" hint="Verified Ed25519 achievement credentials" />
          <MenuRow to="/notifications" Icon={Bell} label="Campus Notifications" hint="Real-time festival schedule alerts" />
          <MenuRow to="/settings" Icon={Settings} label="Preferences & Settings" hint="Device settings & privacy options" />
          <MenuRow to="/help" Icon={HelpCircle} label="Help & Fest Rulebook" hint="Official committee contacts & FAQs" last />
        </div>
      </section>

      {/* Sign Out Button */}
      <button
        onClick={() => void signOut()}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-red-50/70 px-4 py-3 text-sm font-bold text-red-700 transition-all hover:bg-red-100 active:scale-95 shadow-xs"
      >
        <LogOut className="size-4" /> Sign Out from JNU Connect
      </button>

      <p className="mt-3 text-center text-[10.5px] text-slate-400 font-medium">
        Jaipur National University • Technorazz 2026 Platform
      </p>
    </AppShell>
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
        "flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100 " +
        (last ? "" : "")
      }
    >
      <div className="grid size-9 place-items-center rounded-xl bg-red-50 border border-red-100 text-red-700 shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs sm:text-sm font-bold text-slate-900">{label}</div>
        {hint && <div className="truncate text-[11px] text-slate-500 font-normal">{hint}</div>}
      </div>
      <ChevronRight className="size-4 text-slate-400 shrink-0" />
    </Link>
  );
}

