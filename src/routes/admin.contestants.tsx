import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/contestants")({ component: AdminContestants });

type Ev = { id: string; name: string };
type Row = { id: string; event_id: string | null; name: string; photo: string; college: string; department: string; event_category: string; bio: string };

function AdminContestants() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [college, setCollege] = useState("JNU");
  const [department, setDepartment] = useState("");
  const [eventId, setEventId] = useState("");
  const [photo, setPhoto] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: ev }, { data: cs }] = await Promise.all([
      supabase.from("events").select("id,name").order("name"),
      supabase.from("contestants").select("*").order("created_at", { ascending: false }),
    ]);
    setEvents((ev ?? []) as Ev[]);
    setRows((cs ?? []) as Row[]);
    if (!eventId && ev && ev.length) setEventId(ev[0].id);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("contestants").insert({
      name, event_id: eventId || null, event_category: category, college, department,
      photo: photo || `https://i.pravatar.cc/400?u=${encodeURIComponent(name)}`, bio: "",
    });
    if (error) { setErr(error.message); return; }
    setName(""); setCategory(""); setDepartment(""); setPhoto("");
    await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this contestant?")) return;
    const { error } = await supabase.from("contestants").delete().eq("id", id);
    if (error) setErr(error.message); else await load();
  }

  return (
    <>
      <AdminPageHeader title="Contestants" subtitle="Add and remove contestants for each event category." />
      {err && <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-2">
          {loading && <div className="col-span-full text-center text-muted-foreground"><Loader2 className="mx-auto size-4 animate-spin" /></div>}
          {!loading && rows.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No contestants yet.</div>}
          {rows.map((c) => {
            const ev = events.find((e) => e.id === c.event_id);
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-elevated">
                <img src={c.photo} className="size-12 rounded-full object-cover" alt="" />
                <div className="flex-1">
                  <div className="font-display font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.event_category || "—"} · {ev?.name ?? "no event"}</div>
                </div>
                <button onClick={() => void remove(c.id)} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
              </div>
            );
          })}
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
          <div className="mb-3 font-display font-semibold">Add contestant</div>
          <label className="mb-2 block text-xs">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-2 block text-xs">Category<input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Mr Fresher" className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-2 block text-xs">College<input value={college} onChange={(e) => setCollege(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-2 block text-xs">Department<input value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-2 block text-xs">Event
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm">
              <option value="">— none —</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
          <label className="mb-3 block text-xs">Photo URL (optional)<input value={photo} onChange={(e) => setPhoto(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <button onClick={add} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /> Add</button>
        </div>
      </div>
    </>
  );
}
