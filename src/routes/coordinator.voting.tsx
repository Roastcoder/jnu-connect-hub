import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Play, Trophy } from "lucide-react";
import { CoordinatorPageHeader } from "./coordinator";
import { events as seedEvents } from "@/lib/mock-data";
import { loadVotingWindow, saveVotingWindow } from "@/lib/realtime";

export const Route = createFileRoute("/coordinator/voting")({
  component: VotingPage,
});

function VotingPage() {
  const [voting, setVoting] = useState(() => loadVotingWindow());
  const [hours, setHours] = useState(6);
  const [eventId, setEventId] = useState(voting.eventId ?? seedEvents[0]?.id ?? "");

  function start() {
    const next = { active: true, eventId, endsAt: Date.now() + hours * 3600_000 };
    setVoting(next); saveVotingWindow(next);
  }
  function stop() {
    const next = { active: false, eventId, endsAt: null };
    setVoting(next); saveVotingWindow(next);
  }

  return (
    <>
      <CoordinatorPageHeader title="Voting control" subtitle="Open and close the voting window — changes broadcast live to every voter and leaderboard." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-elevated">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary"><Trophy className="size-3.5" /> Voting window</div>
          <div className="font-display text-3xl font-bold">{voting.active ? "OPEN" : "CLOSED"}</div>
          {voting.endsAt && voting.active && <div className="mt-1 text-sm text-muted-foreground">Closes at {new Date(voting.endsAt).toLocaleString()}</div>}
          <div className="mt-6 space-y-3">
            <label className="block text-xs">Event
              <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm">
                {seedEvents.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </label>
            <label className="block text-xs">Window duration (hours)
              <input type="number" min={1} max={72} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={start} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Play className="size-4" /> Start voting</button>
            <button onClick={stop} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground"><Pause className="size-4" /> Stop voting</button>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Starting or stopping voting is broadcast in real time to every open <b>Voting</b> and <b>Leaderboard</b> page — no refresh needed.
        </div>
      </div>
    </>
  );
}
