import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Gavel } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/judges")({ component: AdminJudges });

type Ev = { id: string; name: string };
type Row = { id: string; event_id: string | null; name: string; expertise: string };

function AdminJudges() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [expertise, setExpertise] = useState("");
  const [eventId, setEventId] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: ev }, { data: jd }] = await Promise.all([
      supabase.from("events").select("id,name").order("name"),
      supabase.from("judges").select("*").order("created_at", { ascending: false }),
    ]);
    setEvents((ev ?? []) as Ev[]);
    setRows((jd ?? []) as Row[]);
    if (!eventId && ev && ev.length) setEventId(ev[0].id);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("judges").insert({ name, expertise, event_id: eventId || null });
    if (error) { setErr(error.message); return; }
    setName(""); setExpertise(""); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this judge?")) return;
    const { error } = await supabase.from("judges").delete().eq("id", id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <>
      <AdminPageHeader title="Judges" subtitle="Add and remove judges assigned to events." />
      {err && <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/60 bg-card shadow-elevated">
          {loading && <div className="p-6 text-center"><Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" /></div>}
          {!loading && rows.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No judges yet.</div>}
          {rows.map((j) => {
            const ev = events.find((e) => e.id === j.event_id);
            return (
              <div key={j.id} className="flex items-center gap-3 border-b border-border/60 p-4 last:border-0">
                <div className="grid size-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground"><Gavel className="size-4" /></div>
                <div className="flex-1">
                  <div className="font-display font-semibold">{j.name}</div>
                  <div className="text-xs text-muted-foreground">{j.expertise || "—"} · {ev?.name ?? "no event"}</div>
                </div>
                <button onClick={() => void remove(j.id)} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
              </div>
            );
          })}
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
          <div className="mb-3 font-display font-semibold">Add judge</div>
          <label className="mb-2 block text-xs">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-2 block text-xs">Expertise<input value={expertise} onChange={(e) => setExpertise(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-3 block text-xs">Event
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm">
              <option value="">— none —</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
          <button onClick={add} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /> Add</button>
        </div>
      </div>
    </>
  );
}
