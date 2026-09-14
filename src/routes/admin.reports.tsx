import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Users, CalendarDays, Ticket, IndianRupee, Trophy, ClipboardCheck } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPage });

type Stats = {
  users: number; events: number; regs: number; regsConfirmed: number;
  revenue: number; pending: number; attendance: number; contestants: number; totalVotes: number;
};

function ReportsPage() {
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [u, e, r, rc, pay, att, cn, vt] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("payments").select("amount,status"),
        supabase.from("attendance").select("id", { count: "exact", head: true }).eq("status", "present"),
        supabase.from("contestants").select("id", { count: "exact", head: true }),
        supabase.from("votes").select("id", { count: "exact", head: true }),
      ]);
      const payRows = (pay.data ?? []) as any[];
      const revenue = payRows.filter((x) => x.status === "paid").reduce((s, x) => s + Number(x.amount || 0), 0);
      const pending = payRows.filter((x) => x.status === "pending").reduce((s, x) => s + Number(x.amount || 0), 0);
      setS({
        users: u.count ?? 0, events: e.count ?? 0, regs: r.count ?? 0, regsConfirmed: rc.count ?? 0,
        revenue, pending, attendance: att.count ?? 0,
        contestants: cn.count ?? 0, totalVotes: vt.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <AdminPageHeader title="Reports" subtitle="Real-time snapshot across your dashboards." />
      {loading || !s ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Crunching numbers…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card icon={Users} label="Registered users" value={s.users.toLocaleString()} />
          <Card icon={CalendarDays} label="Total events" value={s.events.toLocaleString()} />
          <Card icon={Ticket} label="Registrations" value={`${s.regs} (${s.regsConfirmed} confirmed)`} />
          <Card icon={IndianRupee} label="Revenue collected" value={`₹ ${s.revenue.toLocaleString()}`} tone="primary" />
          <Card icon={IndianRupee} label="Pending dues" value={`₹ ${s.pending.toLocaleString()}`} />
          <Card icon={ClipboardCheck} label="Attendance marked" value={s.attendance.toLocaleString()} />
          <Card icon={Trophy} label="Contestants" value={s.contestants.toLocaleString()} />
          <Card icon={Trophy} label="Total votes cast" value={s.totalVotes.toLocaleString()} tone="primary" />
        </div>
      )}
    </>
  );
}

function Card({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone?: "primary" }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-elevated ${tone === "primary" ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
