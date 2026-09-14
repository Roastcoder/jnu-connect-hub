import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gavel, Plus, Trash2 } from "lucide-react";
import { CoordinatorPageHeader } from "./coordinator";
import { events as seedEvents } from "@/lib/mock-data";

export const Route = createFileRoute("/coordinator/judges")({
  component: JudgesPage,
});

type Judge = { id: string; name: string; expertise: string; event: string };
const seedJudges: Judge[] = [
  { id: "j1", name: "Prof. Anil Kapoor", expertise: "Software Architecture", event: "Technorazz 2026" },
  { id: "j2", name: "Ms. Nisha Rao", expertise: "Design & UX", event: "Technorazz 2026" },
  { id: "j3", name: "Dr. Vivek Menon", expertise: "Classical Music", event: "Freshers Party 2026" },
];

function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>(seedJudges);
  const [name, setName] = useState("");
  const [expertise, setExpertise] = useState("");
  const [eventName, setEventName] = useState(seedEvents[0]?.name ?? "");
  return (
    <>
      <CoordinatorPageHeader title="Judges" subtitle="Add judges and assign them to events." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/60 bg-card shadow-elevated">
          {judges.map((j) => (
            <div key={j.id} className="flex items-center gap-3 border-b border-border/60 p-4 last:border-0">
              <div className="grid size-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground"><Gavel className="size-4" /></div>
              <div className="flex-1">
                <div className="font-display font-semibold">{j.name}</div>
                <div className="text-xs text-muted-foreground">{j.expertise} · {j.event}</div>
              </div>
              <button onClick={() => setJudges(judges.filter((x) => x.id !== j.id))} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated h-fit">
          <div className="mb-3 font-display font-semibold">Add judge</div>
          <label className="mb-2 block text-xs">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-2 block text-xs">Expertise<input value={expertise} onChange={(e) => setExpertise(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-3 block text-xs">Event<select value={eventName} onChange={(e) => setEventName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm">{seedEvents.map((e) => <option key={e.id}>{e.name}</option>)}</select></label>
          <button onClick={() => { if (!name.trim()) return; setJudges([...judges, { id: "j-" + Date.now().toString(36), name, expertise, event: eventName }]); setName(""); setExpertise(""); }} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /> Add</button>
        </div>
      </div>
    </>
  );
}
