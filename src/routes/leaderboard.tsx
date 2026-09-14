import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { ArrowDown, ArrowUp, Crown, Medal, Radio, Trophy } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncContestantsFromDb, contestants, type Contestant } from "@/lib/mock-data";
import { useChannel } from "@/lib/realtime";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard · JNU Connect" },
      { name: "description", content: "Live ranks across every JNU competition — updated in real time." },
    ],
  }),
  component: LeaderboardPage,
});

function useLiveVotes(initial: Contestant[]) {
  const [votes, setVotes] = useState<Record<string, number>>(
    () => Object.fromEntries(initial.map((c) => [c.id, c.votes])),
  );
  useEffect(() => {
    setVotes(Object.fromEntries(initial.map((c) => [c.id, c.votes])));
  }, [initial]);

  useChannel<{ contestantId: string; delta: number }>("jnu:votes", (m) => {
    setVotes((prev) => ({ ...prev, [m.contestantId]: (prev[m.contestantId] ?? 0) + m.delta }));
  });
  return votes;
}

function LeaderboardPage() {
  const [contestantList, setContestantList] = useState<Contestant[]>(contestants);
  const [scope, setScope] = useState("Global");
  const liveVotes = useLiveVotes(contestantList);
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});

  useEffect(() => {
    syncContestantsFromDb().then((data) => {
      if (data && data.length > 0) setContestantList(data);
    });
  }, []);

  const scopes = useMemo(() => {
    return ["Global", ...Array.from(new Set(contestantList.map((c) => c.eventCategory)))];
  }, [contestantList]);

  const ranked = useMemo(
    () =>
      [...contestantList]
        .map((c) => ({ ...c, votes: liveVotes[c.id] ?? c.votes }))
        .filter((c) => scope === "Global" || c.eventCategory === scope)
        .sort((a, b) => b.votes - a.votes),
    [scope, liveVotes, contestantList],
  );

  useEffect(() => {
    setPrevRanks((prev) => {
      const next: Record<string, number> = {};
      ranked.forEach((c, i) => (next[c.id] = i));
      // keep prev around for delta calc
      Object.keys(prev).forEach((k) => (next[k] = next[k] ?? prev[k]));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ranked.map((c) => c.id).join(",")]);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Live Ranks"
        title="Contestant Leaderboard"
        subtitle="Live rankings synchronized in real time as students vote across campus."
        action={
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
            <Radio className="size-3 animate-pulse text-emerald-600" /> LIVE
          </div>
        }
      />

      {/* Category Pills */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {scopes.map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={
              "shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition-all " +
              (scope === s
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-sm scale-105"
                : "bg-white border border-rose-100 text-slate-600 hover:text-slate-900")
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Top 3 Mobile Podium */}
      {podium.length === 3 && (
        <div className="mb-6 grid grid-cols-3 gap-2 items-end">
          <PodiumCard rank={2} contestant={podium[1]} />
          <PodiumCard rank={1} contestant={podium[0]} big />
          <PodiumCard rank={3} contestant={podium[2]} />
        </div>
      )}

      {/* Remaining Ranks List */}
      <div className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden divide-y divide-rose-50">
        <div className="p-3 bg-slate-50/60 border-b border-rose-100/60">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Current Rankings ({rest.length + 3} Contestants)
          </div>
        </div>

        {rest.map((c, i) => {
          const rank = i + 4;
          const prev = prevRanks[c.id];
          const delta = prev !== undefined ? prev - i - 3 : 0;
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-6 text-center font-display text-xs font-bold text-slate-400">
                #{rank}
              </div>
              <img
                src={c.photo}
                alt={c.name}
                className="size-10 rounded-full object-cover border border-rose-100 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-display text-xs font-bold text-slate-900 truncate">
                  {c.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {c.eventCategory} · {c.department}
                </div>
              </div>

              {delta !== 0 && (
                <span
                  className={
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold " +
                    (delta > 0
                      ? "bg-emerald-500/15 text-emerald-800"
                      : "bg-rose-50 text-rose-800")
                  }
                >
                  {delta > 0 ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
                  {Math.abs(delta)}
                </span>
              )}

              <div className="text-right shrink-0">
                <div className="font-display text-xs font-black text-red-700">
                  {c.votes.toLocaleString()}
                </div>
                <div className="text-[8px] uppercase tracking-wider text-slate-400">
                  votes
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function PodiumCard({
  rank,
  contestant,
  big,
}: {
  rank: number;
  contestant: Contestant;
  big?: boolean;
}) {
  const Icon = rank === 1 ? Crown : rank === 2 ? Trophy : Medal;
  const rankBg =
    rank === 1
      ? "bg-gradient-to-b from-amber-50 to-white border-amber-300 ring-2 ring-amber-400/20"
      : rank === 2
      ? "bg-gradient-to-b from-slate-100 to-white border-slate-200"
      : "bg-gradient-to-b from-orange-50 to-white border-orange-200";

  return (
    <div
      className={
        `flex flex-col items-center rounded-2xl border p-2.5 text-center shadow-xs transition-all ${rankBg} ` +
        (big ? "-mt-2 pb-4 pt-4 shadow-md" : "")
      }
    >
      <Icon
        className={
          "mb-1 " +
          (rank === 1
            ? "size-6 text-amber-500"
            : rank === 2
            ? "size-5 text-slate-600"
            : "size-5 text-amber-700")
        }
      />
      <img
        src={contestant.photo}
        alt={contestant.name}
        className={
          "rounded-full object-cover shadow-sm " +
          (rank === 1
            ? "size-16 ring-3 ring-amber-400"
            : "size-12 ring-2 ring-slate-300")
        }
      />
      <div className="mt-1.5 font-display text-[11px] font-bold text-slate-900 truncate max-w-full">
        {contestant.name}
      </div>
      <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 truncate max-w-full">
        {contestant.eventCategory}
      </div>
      <div
        className={
          "mt-1 font-display font-black text-red-700 " +
          (big ? "text-sm" : "text-xs")
        }
      >
        {contestant.votes.toLocaleString()}
      </div>
      <div className="text-[7.5px] uppercase tracking-wider text-slate-400 font-bold">
        votes
      </div>
    </div>
  );
}
