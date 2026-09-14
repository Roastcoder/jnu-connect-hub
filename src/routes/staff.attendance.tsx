import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Loader2, Search, XCircle } from "lucide-react";
import { StaffPageHeader } from "./staff";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/staff/attendance")({
  component: StaffAttendance,
});

type Row = {
  id: string;
  full_name: string;
  department: string | null;
  event_id: string | null;
  status: string;
  marked_at: string;
};

function StaffAttendance() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [events, setEvents] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [{ data }, ev] = await Promise.all([
        supabase.from("attendance").select("id, full_name, department, event_id, status, marked_at").order("marked_at", { ascending: false }).limit(200),
        supabase.from("events").select("id, name"),
      ]);
      setRows((data as Row[]) ?? []);
      const map: Record<string, string> = {};
      (ev.data ?? []).forEach((e: any) => { map[e.id] = e.name; });
      setEvents(map);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return null;
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return [r.full_name, r.department, events[r.event_id ?? ""]].some((v) => (v ?? "").toString().toLowerCase().includes(s));
    });
  }, [rows, q, status, events]);

  const totals = useMemo(() => {
    const r = rows ?? [];
    return {
      present: r.filter((x) => x.status === "present").length,
      absent: r.filter((x) => x.status === "absent").length,
      late: r.filter((x) => x.status === "late").length,
    };
  }, [rows]);

  return (
    <>
      <StaffPageHeader title="Attendance log" subtitle="Review who's been marked present today across sub-events." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat icon={CheckCircle2} label="Present" value={totals.present} tone="success" />
        <Stat icon={Clock} label="Late" value={totals.late} tone="accent" />
        <Stat icon={XCircle} label="Absent" value={totals.absent} tone="destructive" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, department, event…" className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-2.5 text-sm" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-border bg-background px-4 py-2.5 text-sm">
          <option value="all">All statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card shadow-elevated">
        {filtered === null ? (
          <div className="p-10 text-center text-muted-foreground"><Loader2 className="mx-auto size-5 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No attendance records match.</div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                {r.status === "present" && <CheckCircle2 className="size-5 text-success" />}
                {r.status === "late" && <Clock className="size-5 text-accent" />}
                {r.status === "absent" && <XCircle className="size-5 text-destructive" />}
                <div className="flex-1">
                  <div className="font-semibold">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{events[r.event_id ?? ""] ?? "—"}{r.department ? ` · ${r.department}` : ""}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {new Date(r.marked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "success" | "accent" | "destructive" }) {
  const bg = tone === "success" ? "bg-success/10 text-success" : tone === "accent" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
      <div className={`mb-3 grid size-10 place-items-center rounded-xl ${bg}`}><Icon className="size-5" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
