import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScanLine, ClipboardCheck, Ticket, ArrowRight, Loader2, CalendarDays } from "lucide-react";
import { StaffPageHeader } from "./staff";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/staff/")({
  component: StaffHome,
});

function StaffHome() {
  const [stats, setStats] = useState<{ regs: number; present: number; confirmed: number } | null>(null);
  useEffect(() => {
    (async () => {
      const [r, p, c] = await Promise.all([
        supabase.from("registrations").select("id", { count: "exact", head: true }),
        supabase.from("attendance").select("id", { count: "exact", head: true }).eq("status", "present"),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
      ]);
      setStats({ regs: r.count ?? 0, present: p.count ?? 0, confirmed: c.count ?? 0 });
    })();
  }, []);

  return (
    <>
      <StaffPageHeader title="Your daily desk" subtitle="Scan passes, verify entries and keep events flowing." />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Stat icon={Ticket} label="Total registrations" value={stats?.regs} />
        <Stat icon={ClipboardCheck} label="Attendance marked" value={stats?.present} tone="primary" />
        <Stat icon={Ticket} label="Confirmed" value={stats?.confirmed} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ActionCard to="/staff/scan" Icon={ScanLine} title="Scan QR passes" desc="Open the camera scanner and mark attendees present in real time." cta="Start scanning" />
        <ActionCard to="/staff/registrations" Icon={Ticket} title="Registrations" desc="Look up a registration by ID, name or event." cta="Open registrations" />
        <ActionCard to="/staff/attendance" Icon={ClipboardCheck} title="Attendance log" desc="Review who's been marked present today across sub-events." cta="View log" />
        <ActionCard to="/events" Icon={CalendarDays} title="Browse events" desc="See today's schedule, venues and sub-events assigned to your desk." cta="View events" />
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number | undefined; tone?: "primary" }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-elevated ${tone === "primary" ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value === undefined ? <Loader2 className="size-5 animate-spin" /> : value.toLocaleString()}</div>
    </div>
  );
}

function ActionCard({ to, Icon, title, desc, cta }: { to: string; Icon: any; title: string; desc: string; cta: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-border/60 bg-card p-6 shadow-elevated transition-transform hover:-translate-y-0.5">
      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"><Icon className="size-5" /></div>
      <div className="font-display text-lg font-bold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        {cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
