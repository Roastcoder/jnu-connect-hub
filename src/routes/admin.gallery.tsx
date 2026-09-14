import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/gallery")({ component: GalleryPage });

type Ev = { id: string; name: string };
type Row = { id: string; title: string; caption: string; image_url: string; event_id: string | null; created_at: string };
const empty: Row = { id: "", title: "", caption: "", image_url: "", event_id: null, created_at: "" };

function GalleryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: g, error }, { data: e }] = await Promise.all([
      supabase.from("gallery").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("id,name").order("name"),
    ]);
    if (error) setErr(error.message); else { setRows((g ?? []) as Row[]); setErr(null); }
    setEvents((e ?? []) as Ev[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save(r: Row) {
    if (!r.image_url.trim()) { setErr("Image URL required"); return; }
    const payload: any = { title: r.title, caption: r.caption, image_url: r.image_url, event_id: r.event_id };
    const q = r.id ? supabase.from("gallery").update(payload).eq("id", r.id) : supabase.from("gallery").insert(payload);
    const { error } = await q;
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("gallery").delete().eq("id", id);
    await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        subtitle={`${rows.length} photos`}
        action={
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> Upload URL
          </button>
        }
      />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No photos yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.id} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
              <img src={r.image_url} alt={r.title} className="h-48 w-full object-cover" />
              <div className="p-3">
                <div className="truncate text-sm font-medium">{r.title || "Untitled"}</div>
                {r.caption && <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.caption}</div>}
              </div>
              <button onClick={() => remove(r.id)} className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Add photo</h3><button onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-muted"><X className="size-4" /></button></div>
            <div className="grid gap-3">
              <Field label="Image URL"><input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="input" placeholder="https://..." /></Field>
              <Field label="Title"><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input" /></Field>
              <Field label="Event">
                <select value={editing.event_id ?? ""} onChange={(e) => setEditing({ ...editing, event_id: e.target.value || null })} className="input">
                  <option value="">—</option>
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </Field>
              <Field label="Caption"><textarea value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className="input min-h-20" /></Field>
            </div>
            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button><button onClick={() => save(editing)} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Save</button></div>
          </div>
          <style>{`.input{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
        </div>
      )}
    </>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}
