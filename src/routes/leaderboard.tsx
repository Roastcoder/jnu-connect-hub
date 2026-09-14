import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { ArrowDown, ArrowUp, Crown, Medal, Radio, Trophy } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { contestants, type Contestant } from "@/lib/mock-data";
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

const scopes = ["Global", ...Array.from(new Set(contestants.map((c) => c.eventCategory)))];

// Real WebSocket-style broadcast: every client subscribes to the same channel,
// and vote deltas fan out instantly to all connected leaderboards + voting pages.
function useLiveVotes(initial: Contestant[]) {
  const [votes, setVotes] = useState<Record<string, number>>(
    () => Object.fromEntries(initial.map((c) => [c.id, c.votes])),
  );
  useChannel<{ contestantId: string; delta: number }>("jnu:votes", (m) => {
    setVotes((prev) => ({ ...prev, [m.contestantId]: (prev[m.contestantId] ?? 0) + m.delta }));
  });
  useEffect(() => {
    // Simulated firehose from the "server": bumps random contestants each tick
    // so every open tab shows the same live-updating leaderboard.
    const id = setInterval(() => {
      setVotes((prev) => {
        const next = { ...prev };
        for (let i = 0; i < 3; i++) {
          const c = initial[Math.floor(Math.random() * initial.length)];
          next[c.id] = (next[c.id] ?? 0) + Math.floor(Math.random() * 40) + 5;
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [initial]);
  return votes;
}

function LeaderboardPage() {
  const [scope, setScope] = useState("Global");
  const liveVotes = useLiveVotes(contestants);
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});

  const ranked = useMemo(
    () =>
      [...contestants]
        .map((c) => ({ ...c, votes: liveVotes[c.id] ?? c.votes }))
        .filter((c) => scope === "Global" || c.eventCategory === scope)
        .sort((a, b) => b.votes - a.votes),
    [scope, liveVotes],
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
        eyebrow="Leaderboard"
        title="Live ranks across JNU"
        subtitle="Ranks update in real time via WebSocket as votes stream in."
        action={
          <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
            <Radio className="size-3.5 animate-pulse" /> LIVE
          </div>
        }
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {scopes.map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all " +
              (scope === s
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70")
            }
          >
            {s}
          </button>
        ))}
      </div>

      {podium.length === 3 && (
        <div className="mb-10 grid grid-cols-3 gap-3 md:gap-6">
          <PodiumCard rank={2} contestant={podium[1]} />
          <PodiumCard rank={1} contestant={podium[0]} big />
          <PodiumCard rank={3} contestant={podium[2]} />
        </div>
      )}

      <Reorder.Group axis="y" values={rest} onReorder={() => {}} className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elevated">
        <AnimatePresence initial={false}>
          {rest.map((c, i) => {
            const rank = i + 4;
            const prev = prevRanks[c.id];
            const delta = prev !== undefined ? prev - i - 3 : 0;
            return (
              <Reorder.Item
                key={c.id}
                value={c}
                drag={false}
                layout
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="flex items-center gap-4 border-b border-border/60 p-4 last:border-b-0"
              >
                <div className="w-10 font-display text-lg font-bold text-muted-foreground">#{rank}</div>
                <img src={c.photo} alt={c.name} className="size-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-display font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.eventCategory} · {c.college}</div>
                </div>
                {delta !== 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: delta > 0 ? -6 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={
                      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold " +
                      (delta > 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")
                    }
                  >
                    {delta > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    {Math.abs(delta)}
                  </motion.span>
                )}
                <div className="text-right">
                  <motion.div
                    key={c.votes}
                    initial={{ scale: 1.15, color: "hsl(var(--accent))" }}
                    animate={{ scale: 1, color: "hsl(var(--primary))" }}
                    transition={{ duration: 0.4 }}
                    className="font-display text-lg font-bold"
                  >
                    {c.votes.toLocaleString()}
                  </motion.div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">votes</div>
                </div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
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
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={
        "flex flex-col items-center rounded-3xl border border-border/60 bg-gradient-card p-4 text-center shadow-elevated " +
        (big ? "-mt-4 pb-6 pt-6" : "")
      }
    >
      <Icon className={"mb-2 " + (rank === 1 ? "size-8 text-accent" : "size-6 text-primary")} />
      <img
        src={contestant.photo}
        alt={contestant.name}
        className={
          "rounded-full object-cover ring-4 " +
          (rank === 1 ? "size-24 ring-accent/50 shadow-glow" : "size-16 ring-primary/30")
        }
      />
      <div className="mt-3 font-display font-semibold">{contestant.name}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {contestant.eventCategory}
      </div>
      <motion.div
        key={contestant.votes}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={"mt-2 font-display font-bold text-primary " + (big ? "text-2xl" : "text-lg")}
      >
        {contestant.votes.toLocaleString()}
      </motion.div>
    </motion.div>
  );
}
