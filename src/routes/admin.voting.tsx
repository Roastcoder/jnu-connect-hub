import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Trophy, Search, Trash2 } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/voting")({ component: VotingPage });

type C = { id: string; name: string; event_id: string | null; photo: string };
type V = { contestant_id: string };
type Ev = { id: string; name: string };

function VotingPage() {
  const [contestants, setContestants] = useState<C[]>([]);
  const [votes, setVotes] = useState<V[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [eventId, setEventId] = useState<string>("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: c, error }, { data: v }, { data: e }] = await Promise.all([
      supabase.from("contestants").select("id,name,event_id,photo"),
      supabase.from("votes").select("contestant_id"),
      supabase.from("events").select("id,name").order("name"),
    ]);
    if (error) setErr(error.message); else { setContestants(((c ?? []) as unknown) as C[]); setErr(null); }
    setVotes(((v ?? []) as unknown) as V[]);
    setEvents(((e ?? []) as unknown) as Ev[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const tallies = useMemo(() => {
    const m = new Map<string, number>();
    votes.forEach((x) => m.set(x.contestant_id, (m.get(x.contestant_id) ?? 0) + 1));
    return m;
  }, [votes]);

  const ranked = useMemo(() => {
    const arr = contestants
      .filter((r) => (eventId === "all" || r.event_id === eventId) && (!q || r.name.toLowerCase().includes(q.toLowerCase())))
      .map((r) => ({ ...r, votes: tallies.get(r.id) ?? 0 }));
    arr.sort((a, b) => b.votes - a.votes);
    return arr;
  }, [contestants, tallies, eventId, q]);

  const totalVotes = ranked.reduce((s, r) => s + r.votes, 0);
  const evName = (id: string | null) => events.find((e) => e.id === id)?.name ?? "—";

  async function resetAll() {
    if (!confirm("Delete ALL votes? This cannot be undone.")) return;
    await supabase.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Voting"
        subtitle={`${ranked.length} contestants · ${totalVotes.toLocaleString()} total votes`}
        action={<button onClick={resetAll} className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /> Reset votes</button>}
      />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
          <option value="all">All events</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contestants" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>
      {loading ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div> : (
        <div className="grid gap-3">
          {ranked.map((r, i) => (
            <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
              <div className={`grid size-10 place-items-center rounded-full font-bold ${i === 0 ? "bg-yellow-400/20 text-yellow-500" : i === 1 ? "bg-slate-400/20 text-slate-500" : i === 2 ? "bg-orange-400/20 text-orange-500" : "bg-muted text-muted-foreground"}`}>
                {i === 0 ? <Trophy className="size-5" /> : i + 1}
              </div>
              {r.photo ? <img src={r.photo} className="size-12 rounded-full object-cover" alt="" /> : <div className="size-12 rounded-full bg-primary/10" />}
              <div className="flex-1">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{evName(r.event_id)}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{r.votes.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">votes</div>
              </div>
            </div>
          ))}
          {ranked.length === 0 && <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No contestants match.</div>}
        </div>
      )}
    </>
  );
}
