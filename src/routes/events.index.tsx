import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { syncEventsFromDb, events, type EventCategory, type EventItem } from "@/lib/mock-data";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events · JNU Connect" },
      { name: "description", content: "Browse and register for every JNU event — tech fests, cultural nights, sports, workshops and more." },
    ],
  }),
  component: EventsPage,
});

const categories: (EventCategory | "All")[] = [
  "All",
  "Tech",
  "Cultural",
  "Sports",
  "Workshop",
];

function EventsPage() {
  const [eventList, setEventList] = useState<EventItem[]>(events);
  const [cat, setCat] = useState<(EventCategory | "All")>("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    syncEventsFromDb().then((data) => {
      setEventList(data);
      setLoading(false);
    });
  }, []);

  const filtered = eventList.filter((e) => {
    const okCat = cat === "All" || e.category === cat;
    const okQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.tagline.toLowerCase().includes(q.toLowerCase());
    return okCat && okQ;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Campus Competitions"
        title="Explore All Events"
        subtitle="Filter by category, register in seconds, and access your digital QR pass."
      />

      {/* Mobile Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events, workshops, hackathons..."
          className="w-full rounded-2xl border border-rose-100 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 transition-all"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 p-1 text-[10px] text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        )}
      </div>

      {/* Horizontal Swipeable Category Pills */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all " +
              (cat === c
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-sm scale-105"
                : "bg-white border border-rose-100 text-slate-600 hover:text-slate-900 hover:bg-slate-50")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400 animate-pulse">
          Loading campus events...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-8 text-center text-xs text-slate-500">
          No events found matching "{q}". Try a different search.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
