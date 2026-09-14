import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { DeptPageHeader } from "./dept-admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/dept-admin/attendance")({ component: DeptAttendance });

type Ev = { id: string; name: string };
type Row = { id: string; event_id: string | null; full_name: string; department: string; status: string; marked_at: string };
const STATUSES = ["present", "absent", "late"];

function DeptAttendance() {
  const [rows, setRows] = useState<Row[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("present");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: a, error }, { data: e }] = await Promise.all([
      supabase.from("attendance").select("*").order("marked_at", { ascending: false }).limit(200),
      supabase.from("events").select("id,name").order("name"),
    ]);
    if (error) setErr(error.message); else { setRows((a ?? []) as Row[]); setErr(null); }
    setEvents((e ?? []) as Ev[]);
    if (!eventId && e && e.length) setEventId(e[0].id);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const evName = (id: string | null) => events.find((e) => e.id === id)?.name ?? "—";

  async function add() {
    if (!name.trim() || !eventId) return;
    const { error } = await supabase.from("attendance").insert({ event_id: eventId, full_name: name, department: dept, status });
    if (error) { setErr(error.message); return; }
    setName(""); setDept(""); await load();
  }
  async function remove(id: string) { await supabase.from("attendance").delete().eq("id", id); await load(); }

  return (
    <>
      <DeptPageHeader title="Attendance" subtitle="Mark attendance for your department's students." />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      <div className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-elevated">
        <div className="mb-3 text-sm font-semibold">Mark attendance</div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input md:col-span-2">
            <option value="">Select event</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student name" className="input" />
          <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Dept" className="input" />
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input flex-1">{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <button onClick={add} className="rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /></button>
          </div>
        </div>
      </div>
      {loading ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div> : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No records yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Event</th><th className="p-3">Dept</th><th className="p-3">Status</th><th className="p-3">Time</th><th className="p-3"></th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className="border-t border-border/60">
                <td className="p-3 font-medium">{r.full_name}</td>
                <td className="p-3 text-muted-foreground">{evName(r.event_id)}</td>
                <td className="p-3 text-muted-foreground">{r.department || "—"}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "present" ? "bg-primary/10 text-primary" : r.status === "absent" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.status}</span></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.marked_at).toLocaleString()}</td>
                <td className="p-3 text-right"><button onClick={() => remove(r.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <style>{`.input{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </>
  );
}
