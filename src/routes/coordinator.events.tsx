import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { CoordinatorPageHeader } from "./coordinator";
import { syncEventsFromDb, events as seedEvents, type EventItem } from "@/lib/mock-data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/coordinator/events")({
  component: EventsPage,
});

function EventsPage() {
  const [eventList, setEventList] = useState<EventItem[]>(seedEvents);
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");

  const refresh = () => {
    syncEventsFromDb().then((data) => {
      if (data && data.length > 0) setEventList(data);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: string) => {
    setEventList(eventList.filter((x) => x.id !== id));
    try {
      await api.from("events").eq("id", id).delete();
    } catch (err) {
      console.error("Failed to delete event from DB:", err);
    }
  };

  const handleCreate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
    const newEv: EventItem = {
      id,
      name,
      tagline: "Technorazz 2026 Competition",
      category: "Tech",
      image: eventList[0]?.image ?? "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
      startDate: "2026-09-29",
      endDate: "2026-10-01",
      venue: venue || "Main Campus, JNU",
      price: 0,
      seatsLeft: 100,
      description: "Official event for Technorazz 2026.",
      rules: ["Follow campus decorum."],
      schedule: [{ time: "10:00 AM", title: name }],
      subEvents: [],
    };
    setEventList([...eventList, newEv]);
    setName("");
    setVenue("");

    try {
      await api.from("events").insert({
        id,
        name,
        tagline: newEv.tagline,
        category: newEv.category,
        venue: newEv.venue,
        image: newEv.image,
        description: newEv.description,
        price: 0,
        seats_left: 100,
      });
      refresh();
    } catch (err) {
      console.error("Failed to insert event into DB:", err);
    }
  };

  return (
    <>
      <CoordinatorPageHeader title="Events" subtitle="Create and edit events for the fest calendar." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/60 bg-card shadow-elevated">
          {eventList.map((e) => (
            <div key={e.id} className="flex items-center gap-4 border-b border-border/60 p-4 last:border-0">
              <img src={e.image} className="size-14 rounded-xl object-cover" alt="" />
              <div className="flex-1">
                <div className="font-display font-semibold">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.category} · {e.venue}</div>
              </div>
              <button className="grid size-8 place-items-center rounded-full bg-secondary hover:bg-secondary/70"><Edit3 className="size-3.5" /></button>
              <button onClick={() => handleDelete(e.id)} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleCreate}
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
