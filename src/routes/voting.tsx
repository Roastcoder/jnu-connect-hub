import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Flame, Heart, History, TrendingUp, Trophy } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncContestantsFromDb, contestants, type Contestant } from "@/lib/mock-data";
import { useChannel, useVotingWindow } from "@/lib/realtime";
import { api } from "@/lib/api";

export const Route = createFileRoute("/voting")({
  head: () => ({
    meta: [
      { title: "Vote · JNU Connect" },
      { name: "description", content: "Vote for your favourite JNU contestants across every competition." },
    ],
  }),
  component: VotingPage,
});

type VoteEvent = { contestantId: string; at: number };

function useCountdown(target: number | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return "";
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function VotingPage() {
  const win = useVotingWindow();
  const active = win.active && (win.endsAt === null || win.endsAt > Date.now());
  const countdown = useCountdown(win.endsAt);
  const [cat, setCat] = useState("All");
  const [contestantList, setContestantList] = useState<Contestant[]>(contestants);
  const [voted, setVoted] = useState<Record<string, boolean>>(() => {
    if (typeof localStorage === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("jnu:voted") ?? "{}"); } catch { return {}; }
  });
  const [history, setHistory] = useState<VoteEvent[]>(() => {
    if (typeof localStorage === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("jnu:vote-history") ?? "[]"); } catch { return []; }
  });
  const [bumps, setBumps] = useState<Record<string, number>>({});

  useEffect(() => {
    syncContestantsFromDb().then((data) => {
      if (data && data.length > 0) setContestantList(data);
    });
  }, []);

  // Live vote counter — mirror updates from leaderboard broadcasts.
  useChannel<{ contestantId: string; delta: number }>("jnu:votes", (m) => {
    setBumps((b) => ({ ...b, [m.contestantId]: (b[m.contestantId] ?? 0) + m.delta }));
  });
  const emitVote = useChannel<{ contestantId: string; delta: number }>("jnu:votes", () => {});

  useEffect(() => { localStorage.setItem("jnu:voted", JSON.stringify(voted)); }, [voted]);
  useEffect(() => { localStorage.setItem("jnu:vote-history", JSON.stringify(history)); }, [history]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(contestantList.map((c) => c.eventCategory)))];
  }, [contestantList]);

  const list = useMemo(
    () => contestantList.filter((c) => cat === "All" || c.eventCategory === cat),
    [cat, contestantList],
  );

  async function vote(c: Contestant) {
    if (!active) return;
    if (voted[c.id]) return;
    setVoted((v) => ({ ...v, [c.id]: true }));
    setHistory((h) => [{ contestantId: c.id, at: Date.now() }, ...h].slice(0, 50));
    setBumps((b) => ({ ...b, [c.id]: (b[c.id] ?? 0) + 1 }));
    emitVote({ contestantId: c.id, delta: 1 });

    try {
      await api.student.castVote(c.id);
    } catch {
      // Fallback direct vote insert
      await api.from("votes").insert({ contestant_id: c.id, points: 1 });
    }
  }

  const myRankMap = useMemo(() => {
    const ranked = [...contestantList]
      .map((c) => ({ ...c, votes: c.votes + (bumps[c.id] ?? 0) }))
      .sort((a, b) => b.votes - a.votes);
    return Object.fromEntries(ranked.map((c, i) => [c.id, i + 1]));
  }, [contestantList, bumps]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Voting"
        title="Vote for your stars"
        subtitle="One vote per contestant. Votes update the leaderboard in real time."
        action={
          <div className={"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold " + (active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
            <Clock className="size-3.5" />
            {active ? `Voting closes in ${countdown || "…"}` : "Voting is closed"}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={"rounded-full px-4 py-1.5 text-xs font-semibold transition-all " + (cat === c ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/70")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const total = c.votes + (bumps[c.id] ?? 0);
          const rank = myRankMap[c.id];
          return (
            <div key={c.id} className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elevated">
              <div className="relative">
                <img src={c.photo} alt={c.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/95 to-transparent" />
                {c.trending && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-foreground shadow-glow">
                    <Flame className="size-3" /> Trending
                  </span>
                )}
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                  <Trophy className="size-3 text-accent" /> #{rank}
                </span>
                <div className="absolute inset-x-3 bottom-3">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-primary-glow">{c.eventCategory}</div>
                  <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
                  <div className="text-xs text-muted-foreground">{c.department} · {c.college}</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Votes</div>
                  <div className="font-display text-xl font-bold text-primary">{total.toLocaleString()}</div>
                </div>
                <button
                  onClick={() => vote(c)}
                  disabled={!!voted[c.id] || !active}
                  className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform " + (voted[c.id] ? "bg-success/15 text-success" : active ? "bg-gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5" : "cursor-not-allowed bg-secondary text-muted-foreground")}
                >
                  <Heart className="size-4" fill={voted[c.id] ? "currentColor" : "none"} />
                  {voted[c.id] ? "Voted" : active ? "Vote" : "Closed"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-[1fr_320px]">
        <Link to="/leaderboard" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary hover:text-foreground">
          <TrendingUp className="size-4 text-primary" />
          Watch your rank change live on the leaderboard →
        </Link>

        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
          <div className="mb-3 flex items-center gap-2 font-display font-semibold">
            <History className="size-4 text-primary" /> Your vote history
          </div>
          {history.length === 0 && <div className="text-xs text-muted-foreground">No votes yet — cast one above.</div>}
          <ul className="space-y-2 text-xs">
            {history.slice(0, 8).map((v, i) => {
              const c = contestants.find((x) => x.id === v.contestantId);
              return (
                <li key={i} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    {c && <img src={c.photo} className="size-6 rounded-full object-cover" alt="" />}
                    <div>
                      <div className="font-semibold text-foreground">{c?.name ?? "Unknown"}</div>
                      <div className="text-muted-foreground">{c?.eventCategory}</div>
                    </div>
                  </div>
                  <span className="text-muted-foreground">{new Date(v.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
