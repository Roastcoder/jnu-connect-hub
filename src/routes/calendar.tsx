import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncEventsFromDb, events, type EventItem } from "@/lib/mock-data";
import { CalendarDays, MapPin } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar · JNU Connect" },
      { name: "description", content: "The full JNU event calendar in chronological order." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const [eventList, setEventList] = useState<EventItem[]>(events);

  useEffect(() => {
    syncEventsFromDb().then((data) => {
      if (data && data.length > 0) setEventList(data);
    });
  }, []);

  const sorted = [...eventList].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return (
    <AppShell>
      <PageHeader eyebrow="Timeline" title="Event calendar" subtitle="Everything happening on campus, in order." />
      <div className="relative ml-3 border-l-2 border-dashed border-border pl-6">
        {sorted.map((e) => (
          <div key={e.id} className="relative mb-8">
            <span className="absolute -left-[33px] top-1 grid size-6 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground shadow-glow">
              {new Date(e.startDate).getDate()}
            </span>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated md:p-5">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                {new Date(e.startDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold">{e.name}</h3>
              <p className="text-sm text-muted-foreground">{e.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-primary" />{e.startDate} → {e.endDate}</span>
                <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" />{e.venue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
