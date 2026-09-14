import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Loader2, X } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/staff")({ component: AdminStaff });

type Dept = { id: string; name: string; code: string };
type Row = { id: string; name: string; role: string; department_id: string | null; email: string; phone: string };
const empty: Row = { id: "", name: "", role: "Faculty", department_id: null, email: "", phone: "" };
const ROLES = ["Faculty", "HOD", "Coordinator", "Registrar", "Support"];

function AdminStaff() {
  const [rows, setRows] = useState<Row[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: s, error }, { data: d }] = await Promise.all([
      supabase.from("staff").select("*").order("name"),
      supabase.from("departments").select("id,name,code").order("code"),
    ]);
    if (error) setErr(error.message); else { setRows((s ?? []) as Row[]); setErr(null); }
    setDepts((d ?? []) as Dept[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save(r: Row) {
    setErr(null);
    const payload: any = { name: r.name, role: r.role, department_id: r.department_id || null, email: r.email, phone: r.phone };
    const q = r.id
      ? supabase.from("staff").update(payload).eq("id", r.id)
      : supabase.from("staff").insert(payload);
    const { error } = await q;
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this staff member?")) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) setErr(error.message); else await load();
  }

  const deptName = (id: string | null) => depts.find((x) => x.id === id)?.code ?? "—";

  return (
    <>
      <AdminPageHeader
        title="Staff"
        subtitle={`${rows.length} staff members`}
        action={
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> Add Staff
          </button>
        }
      />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No staff yet.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Department</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{r.role}</span></td>
                  <td className="p-3 text-muted-foreground">{deptName(r.department_id)}</td>
                  <td className="p-3 text-muted-foreground">{r.email || "—"}</td>
                  <td className="p-3 text-muted-foreground">{r.phone || "—"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(r)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Edit3 className="size-4" /></button>
                    <button onClick={() => remove(r.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <EditModal row={editing} depts={depts} onCancel={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function EditModal({ row, depts, onCancel, onSave }: { row: Row; depts: Dept[]; onCancel: () => void; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(row);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{row.id ? "Edit staff" : "New staff"}</h3>
          <button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
        </div>
        <div className="grid gap-3">
          <Field label="Name"><input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select value={r.role} onChange={(e) => setR({ ...r, role: e.target.value })} className="input">
                {ROLES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Department">
              <select value={r.department_id ?? ""} onChange={(e) => setR({ ...r, department_id: e.target.value || null })} className="input">
                <option value="">—</option>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.code} · {d.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Email"><input value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} className="input" /></Field>
          <Field label="Phone"><input value={r.phone} onChange={(e) => setR({ ...r, phone: e.target.value })} className="input" /></Field>
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
