import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2, X, IndianRupee, Check } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/payments")({ component: AdminPayments });

type Reg = { id: string; full_name: string };
type Row = { id: string; registration_id: string | null; amount: number; method: string; status: string; reference: string; created_at: string };
const empty: Row = { id: "", registration_id: null, amount: 0, method: "upi", status: "pending", reference: "", created_at: "" };
const METHODS = ["upi", "card", "netbanking", "cash"];
const STATUSES = ["pending", "paid", "refunded", "failed"];

function AdminPayments() {
  const [rows, setRows] = useState<Row[]>([]);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: p, error }, { data: r }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("registrations").select("id, full_name").order("created_at", { ascending: false }),
    ]);
    if (error) setErr(error.message); else { setRows((p ?? []) as Row[]); setErr(null); }
    setRegs((r ?? []) as Reg[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const regName = (id: string | null) => regs.find((r) => r.id === id)?.full_name ?? "—";
  const totals = useMemo(() => {
    const paid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.amount || 0), 0);
    const pending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + Number(r.amount || 0), 0);
    return { paid, pending };
  }, [rows]);

  async function save(r: Row) {
    setErr(null);
    const payload: any = { registration_id: r.registration_id, amount: Number(r.amount) || 0, method: r.method, status: r.status, reference: r.reference };
    const q = r.id ? supabase.from("payments").update(payload).eq("id", r.id) : supabase.from("payments").insert(payload);
    const { error } = await q;
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function markPaid(id: string) { await supabase.from("payments").update({ status: "paid" }).eq("id", id); await load(); }
  async function remove(id: string) {
    if (!confirm("Delete this payment?")) return;
    await supabase.from("payments").delete().eq("id", id);
    await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Payments"
        subtitle="Track and manage collected fees."
        action={
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> Record Payment
          </button>
        }
      />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Stat label="Collected" value={`₹ ${totals.paid.toLocaleString()}`} tone="primary" />
        <Stat label="Pending" value={`₹ ${totals.pending.toLocaleString()}`} tone="muted" />
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No payments yet.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Registration</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Reference</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{regName(r.registration_id)}</td>
                  <td className="p-3"><span className="inline-flex items-center gap-1"><IndianRupee className="size-3" />{Number(r.amount).toLocaleString()}</span></td>
                  <td className="p-3 uppercase text-xs text-muted-foreground">{r.method}</td>
                  <td className="p-3 text-muted-foreground">{r.reference || "—"}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "paid" ? "bg-primary/10 text-primary" : r.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.status}</span></td>
                  <td className="p-3 text-right">
                    {r.status !== "paid" && <button onClick={() => markPaid(r.id)} className="rounded-lg p-2 text-primary hover:bg-primary/10" title="Mark paid"><Check className="size-4" /></button>}
                    <button onClick={() => remove(r.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <EditModal row={editing} regs={regs} onCancel={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "muted" }) {
  return (
    <div className={`rounded-2xl border p-5 ${tone === "primary" ? "border-primary/30 bg-primary/5" : "border-border bg-card"} shadow-elevated`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function EditModal({ row, regs, onCancel, onSave }: { row: Row; regs: Reg[]; onCancel: () => void; onSave: (r: Row) => void }) {
  const [r, setR] = useState<Row>(row);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">{row.id ? "Edit" : "New"} payment</h3><button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button></div>
        <div className="grid gap-3">
          <Field label="Registration">
            <select value={r.registration_id ?? ""} onChange={(e) => setR({ ...r, registration_id: e.target.value || null })} className="input">
              <option value="">—</option>
              {regs.map((x) => <option key={x.id} value={x.id}>{x.full_name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)"><input type="number" value={r.amount} onChange={(e) => setR({ ...r, amount: Number(e.target.value) })} className="input" /></Field>
            <Field label="Method"><select value={r.method} onChange={(e) => setR({ ...r, method: e.target.value })} className="input">{METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status"><select value={r.status} onChange={(e) => setR({ ...r, status: e.target.value })} className="input">{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label="Reference"><input value={r.reference} onChange={(e) => setR({ ...r, reference: e.target.value })} className="input" /></Field>
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
