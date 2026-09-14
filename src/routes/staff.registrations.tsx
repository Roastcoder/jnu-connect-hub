import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Ticket } from "lucide-react";
import { StaffPageHeader } from "./staff";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/staff/registrations")({
  component: StaffRegistrations,
});

type Row = {
  id: string;
  full_name: string;
  email: string | null;
  department: string | null;
  event_id: string | null;
  sub_event_id: string | null;
  status: string;
  created_at: string;
};

function StaffRegistrations() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [events, setEvents] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [{ data }, ev] = await Promise.all([
        supabase
          .from("registrations")
          .select("id, full_name, email, department, event_id, sub_event_id, status, created_at")
          .order("created_at", { ascending: false })
          .limit(200),
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
      return [r.id, r.full_name, r.email, r.department, events[r.event_id ?? ""]].some((v) => (v ?? "").toString().toLowerCase().includes(s));
    });
  }, [rows, q, status, events]);


  return (
    <>
      <StaffPageHeader title="Registrations" subtitle="Look up any registration by ID, name or event." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reg ID, name, event…" className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-2.5 text-sm" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-border bg-background px-4 py-2.5 text-sm">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card shadow-elevated">
        {filtered === null ? (
          <div className="p-10 text-center text-muted-foreground"><Loader2 className="mx-auto size-5 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No registrations match.</div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><Ticket className="size-4" /></div>
                <div className="flex-1">
                  <div className="font-semibold">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{events[r.event_id ?? ""] ?? "—"}{r.department ? ` · ${r.department}` : ""}</div>

                </div>
                <div className="text-xs text-muted-foreground font-mono">{r.id.slice(0, 8)}</div>
                <span className={"rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase " + (r.status === "confirmed" ? "bg-success/15 text-success" : r.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-secondary text-muted-foreground")}>
                  {r.status ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
