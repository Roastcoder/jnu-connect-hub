import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import { DeptPageHeader } from "./dept-admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/dept-admin/gallery")({ component: DeptGallery });

type Row = { id: string; title: string; caption: string; image_url: string; created_at: string };
const empty: Row = { id: "", title: "", caption: "", image_url: "", created_at: "" };

function DeptGallery() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("gallery").select("id,title,caption,image_url,created_at").order("created_at", { ascending: false });
    if (error) setErr(error.message); else { setRows((data ?? []) as Row[]); setErr(null); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save(r: Row) {
    if (!r.image_url.trim()) { setErr("Image URL required"); return; }
    const { error } = await supabase.from("gallery").insert({ title: r.title, caption: r.caption, image_url: r.image_url });
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await supabase.from("gallery").delete().eq("id", id); await load(); }

  return (
    <>
      <DeptPageHeader title="Gallery" subtitle={`${rows.length} photos`} action={
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
          <Plus className="size-4" /> Add Photo
        </button>
      } />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      {loading ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div> : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No photos yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.id} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
              <img src={r.image_url} alt={r.title} className="h-40 w-full object-cover" />
              <div className="p-3"><div className="truncate text-sm font-medium">{r.title || "Untitled"}</div>{r.caption && <div className="line-clamp-2 text-xs text-muted-foreground">{r.caption}</div>}</div>
              <button onClick={() => remove(r.id)} className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Add photo</h3><button onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-muted"><X className="size-4" /></button></div>
            <div className="grid gap-3">
              <input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="Image URL" className="input" />
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Title" className="input" />
              <textarea value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} placeholder="Caption" className="input min-h-20" />
            </div>
            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button><button onClick={() => save(editing)} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Save</button></div>
          </div>
          <style>{`.input{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
        </div>
      )}
    </>
  );
}
