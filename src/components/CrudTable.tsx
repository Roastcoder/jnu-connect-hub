import { useEffect, useState, type ReactNode } from "react";
import { Plus, Edit3, Trash2, Loader2, X } from "lucide-react";
import { api as supabase } from "@/lib/api";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "url";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type ColumnDef<Row> = { key: string; label: string; render?: (r: Row) => ReactNode };

export function CrudTable<Row extends { id: string }>({
  table,
  title,
  subtitle,
  addLabel = "Add",
  fields,
  columns,
  emptyRow,
  orderBy = "created_at",
  ascending = false,
  select = "*",
  transformSave,
  headerAction,
}: {
  table: string;
  title: string;
  subtitle?: string;
  addLabel?: string;
  fields: FieldDef[];
  columns: ColumnDef<Row>[];
  emptyRow: Row;
  orderBy?: string;
  ascending?: boolean;
  select?: string;
  transformSave?: (r: Row) => Record<string, any>;
  headerAction?: ReactNode;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from(table as any).select(select).order(orderBy, { ascending });
    if (error) setErr(error.message); else { setRows(((data ?? []) as unknown) as Row[]); setErr(null); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, [table]);

  async function save(r: Row) {
    setErr(null);
    const payload = transformSave ? transformSave(r) : Object.fromEntries(fields.map((f) => [f.key, (r as any)[f.key]]));
    const q = r.id
      ? supabase.from(table as any).update(payload).eq("id", r.id)
      : supabase.from(table as any).insert(payload);
    const { error } = await q;
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          <button onClick={() => setEditing({ ...emptyRow })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> {addLabel}
          </button>
        </div>
      </div>

      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No records yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                {columns.map((c) => <th key={c.key} className="p-3">{c.label}</th>)}
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  {columns.map((c) => <td key={c.key} className="p-3">{c.render ? c.render(r) : (r as any)[c.key] ?? "—"}</td>)}
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(r)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Edit3 className="size-4" /></button>
                    <button onClick={() => remove(r.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <EditModal fields={fields} row={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function EditModal<Row extends { id: string }>({ row, fields, onCancel, onSave }: { row: Row; fields: FieldDef[]; onCancel: () => void; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(row);
  const set = (k: string, v: any) => setR({ ...r, [k]: v } as Row);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{row.id ? "Edit" : "New"} record</h3>
          <button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
        </div>
        <div className="grid gap-3">
          {fields.map((f) => {
            const v = (r as any)[f.key] ?? "";
            return (
              <label key={f.key} className="grid gap-1.5 text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                {f.type === "textarea" ? (
                  <textarea value={v} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                ) : f.type === "select" ? (
                  <select value={v ?? ""} onChange={(e) => set(f.key, e.target.value || null)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="">—</option>
                    {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                    value={v}
                    onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                )}
              </label>
            );
          })}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(r)} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Save</button>
        </div>
      </div>
    </div>
  );
}

export function useOptions(table: string, valueKey = "id", labelKey = "name", extra = "") {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    (async () => {
      const cols = `${valueKey},${labelKey}${extra ? "," + extra : ""}`;
      const { data } = await supabase.from(table as any).select(cols).order(labelKey);
      setOpts(((data ?? []) as any[]).map((r) => ({ value: r[valueKey], label: r[labelKey] })));
    })();
  }, [table]);
  return opts;
}
