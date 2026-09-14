import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/sub-events")({ component: AdminSubEvents });

type Ev = { id: string; name: string };
type Sub = { id: string; event_id: string; name: string; description: string; fee: number };

function AdminSubEvents() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [name, setName] = useState("");
  const [fee, setFee] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: ev }, { data: sb }] = await Promise.all([
      supabase.from("events").select("id,name").order("name"),
      supabase.from("sub_events").select("*").order("created_at", { ascending: false }),
    ]);
    setEvents((ev ?? []) as Ev[]);
    setSubs((sb ?? []) as Sub[]);
    if (!eventId && ev && ev.length) setEventId(ev[0].id);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => subs.filter((s) => !eventId || s.event_id === eventId), [subs, eventId]);

  async function add() {
    if (!eventId || !name.trim()) return;
    const { error } = await supabase.from("sub_events").insert({ event_id: eventId, name, description, fee });
    if (error) { setErr(error.message); return; }
    setName(""); setFee(0); setDescription(""); await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this sub-event?")) return;
    const { error } = await supabase.from("sub_events").delete().eq("id", id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <>
      <AdminPageHeader title="Sub Events" subtitle="Manage sub-events, rules and fees under each event." />
      {err && <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}
      {events.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Create an event first, then add sub-events.
        </div>
      )}
      {events.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="mb-4 w-full rounded-full border border-border bg-background px-4 py-2 text-sm">
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {loading ? <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" /> : (
              <ul className="space-y-2">
                {visible.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-3">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">Fee ₹{s.fee}{s.description ? ` · ${s.description}` : ""}</div>
                    </div>
                    <button onClick={() => void remove(s.id)} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
                  </li>
                ))}
                {visible.length === 0 && <li className="text-sm text-muted-foreground">No sub-events for this event yet.</li>}
              </ul>
            )}
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
            <div className="mb-3 font-display font-semibold">Add sub-event</div>
            <label className="mb-2 block text-xs">Name
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="mb-2 block text-xs">Description
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="mb-3 block text-xs">Fee (₹)
              <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <button onClick={add} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              <Plus className="size-4" /> Add
            </button>
          </div>
        </div>
      )}
    </>
  );
}
