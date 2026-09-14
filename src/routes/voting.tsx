import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
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
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || now === null) return "";
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function VotingPage() {
  const win = useVotingWindow();
  const [now, setNow] = useState<number | null>(null);
  const countdown = useCountdown(win.endsAt);
  const [cat, setCat] = useState("All");
  const [contestantList, setContestantList] = useState<Contestant[]>(contestants);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<VoteEvent[]>([]);
  const [bumps, setBumps] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    try {
      const v = localStorage.getItem("jnu:voted");
      if (v) setVoted(JSON.parse(v));
      const h = localStorage.getItem("jnu:vote-history");
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  const active = win.active && (win.endsAt === null || now === null || win.endsAt > now);

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

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("jnu:voted", JSON.stringify(voted));
    } catch {}
  }, [voted, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("jnu:vote-history", JSON.stringify(history));
    } catch {}
  }, [history, mounted]);

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
        eyebrow="Live Polls"
        title="Vote for Your Stars"
        subtitle="1 vote per contestant. Watch real-time leaderboard ranks update dynamically."
        action={
          <div
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold " +
              (active
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800")
            }
          >
            <Clock className="size-3" />
            {active ? `Closes in ${countdown || "…"}` : "Polls Closed"}
          </div>
        }
      />

      {/* Swipeable Category Filters */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              "shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition-all " +
              (cat === c
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-sm scale-105"
                : "bg-white border border-rose-100 text-slate-600 hover:text-slate-900")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {/* 2-Column Mobile Contestant Grid */}
      <div className="grid grid-cols-2 gap-3">
        {list.map((c) => {
          const total = c.votes + (bumps[c.id] ?? 0);
          const rank = myRankMap[c.id];
          const hasVoted = Boolean(voted[c.id]);

          return (
            <div
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-sm flex flex-col justify-between"
            >
              <div className="relative">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={c.photo}
                    alt={c.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                {c.trending && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-amber-950 shadow-sm">
                    <Flame className="size-2.5" /> HOT
                  </span>
                )}

                <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur">
                  <Trophy className="size-2.5 text-amber-300" /> #{rank}
                </span>

                <div className="absolute inset-x-2.5 bottom-2 text-white">
                  <div className="text-[8.5px] font-bold uppercase tracking-wider text-amber-300">
                    {c.eventCategory}
                  </div>
                  <h3 className="font-display text-xs font-bold truncate leading-tight drop-shadow-sm">
                    {c.name}
                  </h3>
                  <div className="text-[9px] text-white/80 truncate">
                    {c.department}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 border-t border-rose-50 bg-slate-50/50">
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Votes</div>
                  <div className="font-display text-xs font-black text-red-700">{total.toLocaleString()}</div>
                </div>

                <button
                  onClick={() => vote(c)}
                  disabled={hasVoted || !active}
                  className={
                    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all active:scale-90 " +
                    (hasVoted
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-800"
                      : active
                      ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed")
                  }
                >
                  <Heart className="size-3" fill={hasVoted ? "currentColor" : "none"} />
                  {hasVoted ? "Voted" : "Vote"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Link to Full Leaderboard */}
      <div className="mt-4">
        <Link
          to="/leaderboard"
          className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-rose-100 p-3 text-xs font-bold text-red-700 shadow-sm active:scale-98 transition-all hover:bg-rose-50/40"
        >
          <TrendingUp className="size-3.5" />
          View Live Leaderboard Ranks →
        </Link>
      </div>

      {/* Vote History Card */}
      <div className="mt-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
        <div className="mb-2.5 flex items-center gap-1.5 font-display text-xs font-bold text-slate-900">
          <History className="size-3.5 text-red-700" /> Your Vote History
        </div>
        {history.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-3">No votes cast yet. Tap "Vote" on any contestant above.</div>
        ) : (
          <ul className="divide-y divide-rose-50 text-xs">
            {history.slice(0, 5).map((v, i) => {
              const c = contestantList.find((x) => x.id === v.contestantId);
              return (
                <li key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {c?.photo && <img src={c.photo} className="size-6 rounded-full object-cover shadow-xs" alt="" />}
                    <div>
                      <div className="font-bold text-slate-900">{c?.name ?? "Contestant"}</div>
                      <div className="text-[10px] text-slate-500">{c?.eventCategory}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {new Date(v.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
