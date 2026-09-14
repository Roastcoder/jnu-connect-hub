import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { CoordinatorPageHeader } from "./coordinator";
import { events as seedEvents, type EventItem } from "@/lib/mock-data";

export const Route = createFileRoute("/coordinator/events")({
  component: EventsPage,
});

function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(seedEvents);
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  return (
    <>
      <CoordinatorPageHeader title="Events" subtitle="Create and edit events for the fest calendar." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/60 bg-card shadow-elevated">
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-4 border-b border-border/60 p-4 last:border-0">
              <img src={e.image} className="size-14 rounded-xl object-cover" alt="" />
              <div className="flex-1">
                <div className="font-display font-semibold">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.category} · {e.venue}</div>
              </div>
              <button className="grid size-8 place-items-center rounded-full bg-secondary hover:bg-secondary/70"><Edit3 className="size-3.5" /></button>
              <button onClick={() => setEvents(events.filter((x) => x.id !== e.id))} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!name.trim()) return;
            const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
            setEvents([...events, { id, name, tagline: "", category: "Tech", image: events[0]?.image ?? "", startDate: "", endDate: "", venue, price: 0, seatsLeft: 100, description: "", rules: [], schedule: [], subEvents: [] }]);
            setName(""); setVenue("");
          }}
          className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated h-fit"
        >
          <div className="mb-3 font-display font-semibold">Create event</div>
          <label className="mb-2 block text-xs">Event name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="mb-3 block text-xs">Venue
            <input value={venue} onChange={(e) => setVenue(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /> Add event</button>
        </form>
      </div>
    </>
  );
}
