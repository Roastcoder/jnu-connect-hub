import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { DeptPageHeader } from "./dept-admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/dept-admin/registrations")({ component: DeptRegs });

type Row = { id: string; full_name: string; event_id: string | null; email: string; phone: string; department: string; status: string; created_at: string };
type Ev = { id: string; name: string };

function DeptRegs() {
  const [rows, setRows] = useState<Row[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: r, error }, { data: e }] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("id,name"),
    ]);
    if (error) setErr(error.message); else { setRows((r ?? []) as Row[]); setErr(null); }
    setEvents((e ?? []) as Ev[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => filter === "all" ? rows : rows.filter((r) => r.status === filter), [rows, filter]);
  const evName = (id: string | null) => events.find((e) => e.id === id)?.name ?? "—";

  return (
    <>
      <DeptPageHeader title="Registrations" subtitle={`${rows.length} registrations from your students.`} />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${filter === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{s}</button>
        ))}
      </div>
      {loading ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div> : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No registrations.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Student</th><th className="p-3">Event</th><th className="p-3">Contact</th><th className="p-3">Department</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.full_name}</td>
                  <td className="p-3 text-muted-foreground">{evName(r.event_id)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{r.email}<br />{r.phone}</td>
                  <td className="p-3 text-muted-foreground">{r.department || "—"}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "confirmed" ? "bg-primary/10 text-primary" : r.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
