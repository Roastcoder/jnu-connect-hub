import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/attendance")({ component: AdminAttendance });

type Ev = { id: string; name: string };
type Row = { id: string; event_id: string | null; full_name: string; department: string; status: string; marked_at: string };
const STATUSES = ["present", "absent", "late"];

function AdminAttendance() {
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
      supabase.from("attendance").select("*").order("marked_at", { ascending: false }).limit(500),
      supabase.from("events").select("id,name").order("name"),
    ]);
    if (error) setErr(error.message); else { setRows((a ?? []) as Row[]); setErr(null); }
    setEvents((e ?? []) as Ev[]);
    if (!eventId && e && e.length) setEventId(e[0].id);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const eventName = (id: string | null) => events.find((e) => e.id === id)?.name ?? "—";
  const visible = useMemo(() => eventId ? rows.filter((r) => r.event_id === eventId) : rows, [rows, eventId]);
  const counts = useMemo(() => ({
    present: visible.filter((r) => r.status === "present").length,
    absent: visible.filter((r) => r.status === "absent").length,
    late: visible.filter((r) => r.status === "late").length,
  }), [visible]);

  async function add() {
    if (!name.trim() || !eventId) return;
    const { error } = await supabase.from("attendance").insert({ event_id: eventId, full_name: name, department: dept, status });
    if (error) { setErr(error.message); return; }
    setName(""); setDept(""); await load();
  }
  async function remove(id: string) {
    await supabase.from("attendance").delete().eq("id", id);
    await load();
  }

  return (
    <>
      <AdminPageHeader title="Attendance" subtitle="Mark attendees per event." />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}

      <div className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-elevated">
        <div className="mb-3 text-sm font-semibold">Mark attendance</div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input md:col-span-2">
            <option value="">Select event</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input" />
          <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Department" className="input" />
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input flex-1">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={add} className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /></button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Present" value={counts.present} tone="primary" />
        <Stat label="Absent" value={counts.absent} tone="destructive" />
        <Stat label="Late" value={counts.late} tone="muted" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No attendance records yet.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Event</th><th className="p-3">Department</th><th className="p-3">Status</th><th className="p-3">Time</th><th className="p-3 text-right"></th></tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.full_name}</td>
                  <td className="p-3 text-muted-foreground">{eventName(r.event_id)}</td>
                  <td className="p-3 text-muted-foreground">{r.department || "—"}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "present" ? "bg-primary/10 text-primary" : r.status === "absent" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.status}</span></td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(r.marked_at).toLocaleString()}</td>
                  <td className="p-3 text-right"><button onClick={() => remove(r.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`.input{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "primary" | "muted" | "destructive" }) {
  const cls = tone === "primary" ? "border-primary/30 bg-primary/5" : tone === "destructive" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card";
  return (
    <div className={`rounded-2xl border p-5 ${cls} shadow-elevated`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
