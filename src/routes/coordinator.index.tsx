import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle2, Users, Gavel, Trophy, ArrowRight, Zap } from "lucide-react";
import { CoordinatorPageHeader } from "./coordinator";
import { syncEventsFromDb, syncContestantsFromDb } from "@/lib/mock-data";
import { loadVotingWindow } from "@/lib/realtime";
import { api } from "@/lib/api";

export const Route = createFileRoute("/coordinator/")({
  component: CoordinatorHome,
});

function CoordinatorHome() {
  const voting = loadVotingWindow();
  const [stats, setStats] = useState({
    events: 0,
    subEvents: 0,
    contestants: 0,
    judges: 0,
  });

  useEffect(() => {
    async function loadCoordinatorStats() {
      const [evs, conts, subsRes, judgesRes] = await Promise.all([
        syncEventsFromDb(),
        syncContestantsFromDb(),
        api.from("sub_events").select("*").catch(() => ({ data: [] })),
        api.from("judges").select("*").catch(() => ({ data: [] })),
      ]);

      const evCount = Array.isArray(evs) ? evs.length : 0;
      const subCount = Array.isArray(subsRes.data)
        ? subsRes.data.length
        : Array.isArray(evs)
        ? evs.reduce((s, e) => s + (e.subEvents?.length || 0), 0)
        : 0;
      const contCount = Array.isArray(conts) ? conts.length : 0;
      const judgeCount = Array.isArray(judgesRes.data) ? judgesRes.data.length : 3;

      setStats({
        events: evCount,
        subEvents: subCount,
        contestants: contCount,
        judges: judgeCount,
      });
    }

    loadCoordinatorStats();
  }, []);

  return (
    <>
      <CoordinatorPageHeader
        title="Run your event"
        subtitle="Create and edit events, manage contestants and judges, and control the voting window in real time."
        action={
          <div className={"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold " + (voting.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
            <Zap className="size-3.5" /> Voting {voting.active ? "OPEN" : "CLOSED"}
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={CalendarDays} label="Events" value={stats.events} />
        <StatCard icon={CheckCircle2} label="Sub-events" value={stats.subEvents} />
        <StatCard icon={Users} label="Contestants" value={stats.contestants} />
        <StatCard icon={Gavel} label="Judges" value={stats.judges} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ActionCard to="/coordinator/events" Icon={CalendarDays} title="Events" desc="Create and edit event details, venues and categories." />
        <ActionCard to="/coordinator/sub-events" Icon={CheckCircle2} title="Sub-events" desc="Add competitions and workshops under each event." />
        <ActionCard to="/coordinator/contestants" Icon={Users} title="Contestants" desc="Register and manage participants across events." />
        <ActionCard to="/coordinator/judges" Icon={Gavel} title="Judges" desc="Add judges and assign them to events." />
        <ActionCard to="/coordinator/voting" Icon={Trophy} title="Voting window" desc="Open and close the live voting window in real time." primary />
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
      <div className="mb-3 grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"><Icon className="size-5" /></div>
      <div className="font-display text-3xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function ActionCard({ to, Icon, title, desc, primary }: { to: string; Icon: any; title: string; desc: string; primary?: boolean }) {
  return (
    <Link to={to} className={`group rounded-2xl border p-5 shadow-elevated transition-transform hover:-translate-y-0.5 ${primary ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card"}`}>
      <div className="mb-3 grid size-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"><Icon className="size-5" /></div>
      <div className="font-display text-lg font-bold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
