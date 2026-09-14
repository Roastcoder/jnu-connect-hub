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
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          <button
            onClick={() => setEditing({ ...emptyRow })}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="size-3.5" /> {addLabel}
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
          {err}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
          <Loader2 className="size-4 animate-spin text-red-700" /> Loading records...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center text-xs text-slate-400">
          No records found in this view.
        </div>
      ) : (
        <>
          {/* Mobile Card List View (Visible on Small Screens) */}
          <div className="grid gap-2.5 md:hidden">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-rose-100/90 bg-white p-3.5 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  {columns.map((c) => (
                    <div key={c.key} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {c.label}:
                      </span>
                      <span className="font-semibold text-slate-900 text-right">
                        {c.render ? c.render(r) : (r as any)[c.key] ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2.5 border-t border-rose-50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditing(r)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    <Edit3 className="size-3" /> Edit
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100"
                  >
                    <Trash2 className="size-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-rose-100 bg-white shadow-xs">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-rose-100">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="p-3.5">
                      {c.label}
                    </th>
                  ))}
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {columns.map((c) => (
                      <td key={c.key} className="p-3.5 text-slate-800">
                        {c.render ? c.render(r) : (r as any)[c.key] ?? "—"}
                      </td>
                    ))}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditing(r)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 mr-1"
                        title="Edit record"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                        title="Delete record"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && <EditModal fields={fields} row={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function EditModal<Row extends { id: string }>({
  row,
  fields,
  onCancel,
  onSave,
}: {
  row: Row;
  fields: FieldDef[];
  onCancel: () => void;
  onSave: (r: Row) => void;
}) {
  const [r, setR] = useState<Row>(row);
  const set = (k: string, v: any) => setR({ ...r, [k]: v } as Row);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl border border-rose-100 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-rose-100">
          <h3 className="font-display text-base font-bold text-slate-900">
            {row.id ? "Edit Record" : "New Record"}
          </h3>
          <button
            onClick={onCancel}
            className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-3">
          {fields.map((f) => {
            const v = (r as any)[f.key] ?? "";
            return (
              <label key={f.key} className="grid gap-1 text-xs">
                <span className="font-bold text-slate-700">{f.label}</span>
                {f.type === "textarea" ? (
                  <textarea
                    value={v}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="min-h-20 w-full rounded-xl border border-rose-100 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-red-600 transition-colors"
                  />
                ) : f.type === "select" ? (
                  <select
                    value={v ?? ""}
                    onChange={(e) => set(f.key, e.target.value || null)}
                    className="w-full rounded-xl border border-rose-100 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-red-600 transition-colors"
                  >
                    <option value="">Select option...</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                    value={v}
                    onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-rose-100 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-red-600 transition-colors"
                  />
                )}
              </label>
            );
          })}
        </div>
        <div className="mt-5 pt-3 border-t border-rose-100 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-rose-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(r)}
            className="rounded-full bg-gradient-to-r from-red-700 to-red-800 px-5 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 active:scale-95"
          >
            Save Changes
          </button>
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
