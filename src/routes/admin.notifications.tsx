import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, X, Bell } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotifications });

type Row = { id: string; title: string; body: string; audience: string; created_at: string };
const empty: Row = { id: "", title: "", body: "", audience: "all", created_at: "" };
const AUDIENCES = ["all", "students", "staff", "coordinators", "admins"];

function AdminNotifications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else { setRows((data ?? []) as Row[]); setErr(null); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save(r: Row) {
    setErr(null);
    const payload: any = { title: r.title, body: r.body, audience: r.audience };
    const q = r.id ? supabase.from("notifications").update(payload).eq("id", r.id) : supabase.from("notifications").insert(payload);
    const { error } = await q;
    if (error) { setErr(error.message); return; }
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this notification?")) return;
    await supabase.from("notifications").delete().eq("id", id);
    await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Notifications"
        subtitle="Broadcast announcements to your users."
        action={
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="size-4" /> New Notification
          </button>
        }
      />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No notifications yet.</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((n) => (
            <div key={n.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="size-5" /></div>
                  <div>
                    <div className="font-semibold">{n.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">To: {n.audience} · {new Date(n.created_at).toLocaleString()}</div>
                    {n.body && <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>}
                  </div>
                </div>
                <button onClick={() => remove(n.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">New notification</h3><button onClick={() => setEditing(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button></div>
            <div className="grid gap-3">
              <label className="grid gap-1.5 text-sm"><span className="text-muted-foreground">Title</span><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input" /></label>
              <label className="grid gap-1.5 text-sm"><span className="text-muted-foreground">Audience</span>
                <select value={editing.audience} onChange={(e) => setEditing({ ...editing, audience: e.target.value })} className="input">
                  {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm"><span className="text-muted-foreground">Message</span><textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="input min-h-28" /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button><button onClick={() => save(editing)} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Send</button></div>
          </div>
          <style>{`.input{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
        </div>
      )}
    </>
  );
}
