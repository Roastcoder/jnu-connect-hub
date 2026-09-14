import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Loader2, X, Building2 } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/departments")({ component: AdminDepartments });

type Row = { id: string; code: string; name: string; description: string; head_name: string };
const empty: Row = { id: "", code: "", name: "", description: "", head_name: "" };

function AdminDepartments() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("departments").select("*").order("code");
    if (error) setErr(error.message); else { setRows((data ?? []) as Row[]); setErr(null); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save(r: Row) {
    setErr(null);
    const payload: any = { code: r.code, name: r.name, description: r.description, head_name: r.head_name };
    const q = r.id
      ? supabase.from("departments").update(payload).eq("id", r.id)
      : supabase.from("departments").insert(payload);
    const { error } = await q;
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this department?")) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Departments"
        subtitle={`${rows.length} department${rows.length === 1 ? "" : "s"}`}
        action={
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> Add Department
          </button>
        }
      />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No departments yet. Add your first one.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="size-5" /></div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">{d.code}</div>
                    <div className="font-semibold">{d.name}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(d)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Edit3 className="size-4" /></button>
                  <button onClick={() => remove(d.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                </div>
              </div>
              {d.head_name && <div className="mt-3 text-sm text-muted-foreground">Head: <span className="text-foreground">{d.head_name}</span></div>}
              {d.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.description}</p>}
            </div>
          ))}
        </div>
      )}
      {editing && <EditModal row={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function EditModal({ row, onCancel, onSave }: { row: Row; onCancel: () => void; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(row);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{row.id ? "Edit department" : "New department"}</h3>
          <button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
        </div>
        <div className="grid gap-3">
          <Field label="Code"><input value={r.code} onChange={(e) => setR({ ...r, code: e.target.value })} className="input" placeholder="BCA" /></Field>
          <Field label="Name"><input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} className="input" placeholder="Bachelor of Computer Applications" /></Field>
          <Field label="Head of department"><input value={r.head_name} onChange={(e) => setR({ ...r, head_name: e.target.value })} className="input" /></Field>
          <Field label="Description"><textarea value={r.description} onChange={(e) => setR({ ...r, description: e.target.value })} className="input min-h-24" /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(r)} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Save</button>
        </div>
      </div>
      <style>{`.input{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}
