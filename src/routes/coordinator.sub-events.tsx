import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CoordinatorPageHeader } from "./coordinator";
import { events as seedEvents, type EventItem, type SubEvent } from "@/lib/mock-data";

export const Route = createFileRoute("/coordinator/sub-events")({
  component: SubEventsPage,
});

function SubEventsPage() {
  const [events, setEvents] = useState<EventItem[]>(seedEvents);
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [name, setName] = useState("");
  const [fee, setFee] = useState(0);
  const event = events.find((e) => e.id === eventId);

  function add() {
    if (!event || !name.trim()) return;
    const sub: SubEvent = { id: "s-" + Date.now().toString(36), name, description: "", fee };
    setEvents(events.map((e) => e.id === eventId ? { ...e, subEvents: [...e.subEvents, sub] } : e));
    setName(""); setFee(0);
  }
  function remove(sid: string) {
    setEvents(events.map((e) => e.id === eventId ? { ...e, subEvents: e.subEvents.filter((s) => s.id !== sid) } : e));
  }

  return (
    <>
      <CoordinatorPageHeader title="Sub-events" subtitle="Add competitions and workshops under each event." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="mb-4 w-full rounded-full border border-border bg-background px-4 py-2 text-sm">
            {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <ul className="space-y-2">
            {event?.subEvents.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">Fee ₹{s.fee}</div>
                </div>
                <button onClick={() => remove(s.id)} className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
              </li>
            ))}
            {event && event.subEvents.length === 0 && <li className="text-sm text-muted-foreground">No sub-events yet.</li>}
          </ul>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated h-fit">
          <div className="mb-3 font-display font-semibold">Add sub-event</div>
          <label className="mb-2 block text-xs">Name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="mb-3 block text-xs">Fee (₹)
            <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} className="mt-1 w-full rounded-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <button onClick={add} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Plus className="size-4" /> Add</button>
        </div>
      </div>
    </>
  );
}
