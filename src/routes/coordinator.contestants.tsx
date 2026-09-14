import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CoordinatorPageHeader } from "./coordinator";
import { contestants as seedContestants, events as seedEvents, type Contestant } from "@/lib/mock-data";

export const Route = createFileRoute("/coordinator/contestants")({
  component: ContestantsPage,
});

function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>(seedContestants);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Mr Fresher");
  return (
    <>
      <CoordinatorPageHeader title="Contestants" subtitle="Register and manage participants across events." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-2">
          {contestants.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-elevated">
              <img src={c.photo} className="size-12 rounded-full object-cover" alt="" />
              <div className="flex-1">
                <div className="font-display font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.eventCategory} · {c.college}</div>
              </div>
              <button onClick={() => setContestants(contestants.filter((x) => x.id !== c.id))} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated h-fit">
          <div className="mb-3 font-display font-semibold">Add contestant</div>
          <label className="mb-2 block text-xs">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <label className="mb-3 block text-xs">Category<input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" /></label>
          <button onClick={() => { if (!name.trim()) return; setContestants([...contestants, { id: "c-" + Date.now().toString(36), name, photo: `https://i.pravatar.cc/400?u=${name}`, college: "JNU", department: "-", event: seedEvents[0]?.name ?? "-", eventCategory: category, bio: "", votes: 0 }]); setName(""); }} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /> Add</button>
        </div>
      </div>
    </>
  );
}
