import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Loader2, X } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/events")({ component: AdminEvents });

type Row = {
  id: string; name: string; tagline: string; category: string; image: string;
  start_date: string | null; end_date: string | null; venue: string;
  price: number; seats_left: number; description: string; rules: string[];
};

const empty: Row = {
  id: "", name: "", tagline: "", category: "Tech", image: "",
  start_date: null, end_date: null, venue: "", price: 0, seats_left: 100, description: "", rules: [],
};

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "event";
}

function AdminEvents() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else { setRows((data ?? []) as Row[]); setErr(null); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save(r: Row) {
    setErr(null);
    const id = r.id || slug(r.name) + "-" + Math.random().toString(36).slice(2, 6);
    const payload = { ...r, id };
    const { error } = await supabase.from("events").upsert(payload);
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Events"
        subtitle="Create, edit and delete campus events."
        action={
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> Create Event
          </button>
        }
      />
      {err && <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Venue</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Seats</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground"><Loader2 className="mx-auto size-4 animate-spin" /></td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No events yet. Click <b>Create Event</b>.</td></tr>
              )}
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-border/60">
                  <td className="flex items-center gap-3 px-5 py-3">
                    {e.image
                      ? <img src={e.image} alt="" className="size-10 rounded-lg object-cover" />
                      : <div className="grid size-10 place-items-center rounded-lg bg-secondary text-xs text-muted-foreground">—</div>}
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-[11px] text-muted-foreground">{e.id}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{e.category}</td>
                  <td className="px-5 py-3">{e.venue || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{e.start_date || "—"} → {e.end_date || "—"}</td>
                  <td className="px-5 py-3">{e.seats_left}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setEditing({ ...e })} className="mr-1 inline-grid size-8 place-items-center rounded-full bg-secondary hover:bg-secondary/70"><Edit3 className="size-3.5" /></button>
                    <button onClick={() => void remove(e.id)} className="inline-grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="size-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <EditModal row={editing} onClose={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function EditModal({ row, onClose, onSave }: { row: Row; onClose: () => void; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(row);
  const [saving, setSaving] = useState(false);
  function up<K extends keyof Row>(k: K, v: Row[K]) { setR((s) => ({ ...s, [k]: v })); }
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="font-display font-bold">{row.id ? "Edit event" : "Create event"}</div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-secondary"><X className="size-4" /></button>
        </div>
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-5 text-sm">
          <label className="grid gap-1">Name<input value={r.name} onChange={(e) => up("name", e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
          <label className="grid gap-1">Tagline<input value={r.tagline} onChange={(e) => up("tagline", e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">Category<input value={r.category} onChange={(e) => up("category", e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
            <label className="grid gap-1">Venue<input value={r.venue} onChange={(e) => up("venue", e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">Start date<input type="date" value={r.start_date ?? ""} onChange={(e) => up("start_date", e.target.value || null)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
            <label className="grid gap-1">End date<input type="date" value={r.end_date ?? ""} onChange={(e) => up("end_date", e.target.value || null)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">Price (₹)<input type="number" value={r.price} onChange={(e) => up("price", Number(e.target.value))} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
            <label className="grid gap-1">Seats left<input type="number" value={r.seats_left} onChange={(e) => up("seats_left", Number(e.target.value))} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
          </div>
          <label className="grid gap-1">Image URL<input value={r.image} onChange={(e) => up("image", e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
          <label className="grid gap-1">Description<textarea rows={3} value={r.description} onChange={(e) => up("description", e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2" /></label>
          <label className="grid gap-1">Rules (one per line)
            <textarea rows={3} value={r.rules.join("\n")} onChange={(e) => up("rules", e.target.value.split("\n").filter(Boolean))} className="rounded-xl border border-border bg-background px-3 py-2" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border/60 bg-secondary/30 px-5 py-3">
          <button onClick={onClose} className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold">Cancel</button>
          <button
            disabled={saving || !r.name.trim()}
            onClick={async () => { setSaving(true); await onSave(r); setSaving(false); }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}
