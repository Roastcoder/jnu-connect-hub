import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2, X, Check, Clock } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/registrations")({ component: AdminRegistrations });

type Ev = { id: string; name: string };
type Row = {
  id: string; event_id: string | null; full_name: string; email: string;
  phone: string; department: string; status: string; created_at: string;
};
const empty: Row = { id: "", event_id: null, full_name: "", email: "", phone: "", department: "", status: "pending", created_at: "" };
const STATUSES = ["pending", "confirmed", "cancelled"];

function AdminRegistrations() {
  const [rows, setRows] = useState<Row[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    const [{ data: r, error }, { data: e }] = await Promise.all([
      supabase.from("registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("id,name").order("name"),
    ]);
    if (error) setErr(error.message); else { setRows((r ?? []) as Row[]); setErr(null); }
    setEvents((e ?? []) as Ev[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => filter === "all" ? rows : rows.filter((r) => r.status === filter), [rows, filter]);
  const eventName = (id: string | null) => events.find((e) => e.id === id)?.name ?? "—";

  async function save(r: Row) {
    setErr(null);
    const payload: any = { event_id: r.event_id, full_name: r.full_name, email: r.email, phone: r.phone, department: r.department, status: r.status };
    const q = r.id ? supabase.from("registrations").update(payload).eq("id", r.id) : supabase.from("registrations").insert(payload);
    const { error } = await q;
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function setStatus(id: string, status: string) {
    await supabase.from("registrations").update({ status }).eq("id", id);
    await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this registration?")) return;
    await supabase.from("registrations").delete().eq("id", id);
    await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Registrations"
        subtitle={`${rows.length} total · ${rows.filter((r) => r.status === "pending").length} pending`}
        action={
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> Add Registration
          </button>
        }
      />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${filter === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{s}</button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No registrations.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Event</th><th className="p-3">Contact</th><th className="p-3">Department</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.full_name}</td>
                  <td className="p-3 text-muted-foreground">{eventName(r.event_id)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{r.email}<br />{r.phone}</td>
                  <td className="p-3 text-muted-foreground">{r.department || "—"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "confirmed" ? "bg-primary/10 text-primary" : r.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status !== "confirmed" && <button onClick={() => setStatus(r.id, "confirmed")} className="rounded-lg p-2 text-primary hover:bg-primary/10" title="Confirm"><Check className="size-4" /></button>}
                    {r.status !== "pending" && <button onClick={() => setStatus(r.id, "pending")} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Set pending"><Clock className="size-4" /></button>}
                    <button onClick={() => remove(r.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <EditModal row={editing} events={events} onCancel={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function EditModal({ row, events, onCancel, onSave }: { row: Row; events: Ev[]; onCancel: () => void; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(row);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">{row.id ? "Edit" : "New"} registration</h3><button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button></div>
        <div className="grid gap-3">
          <Field label="Full name"><input value={r.full_name} onChange={(e) => setR({ ...r, full_name: e.target.value })} className="input" /></Field>
          <Field label="Event">
            <select value={r.event_id ?? ""} onChange={(e) => setR({ ...r, event_id: e.target.value || null })} className="input">
              <option value="">—</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><input value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} className="input" /></Field>
            <Field label="Phone"><input value={r.phone} onChange={(e) => setR({ ...r, phone: e.target.value })} className="input" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department"><input value={r.department} onChange={(e) => setR({ ...r, department: e.target.value })} className="input" /></Field>
            <Field label="Status">
              <select value={r.status} onChange={(e) => setR({ ...r, status: e.target.value })} className="input">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2"><button onClick={onCancel} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button><button onClick={() => onSave(r)} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Save</button></div>
      </div>
      <style>{`.input{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}
