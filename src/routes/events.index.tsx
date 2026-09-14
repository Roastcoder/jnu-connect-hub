import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { events, type EventCategory } from "@/lib/mock-data";

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
  "Freshers",
  "Farewell",
];

function EventsPage() {
  const [cat, setCat] = useState<(EventCategory | "All")>("All");
  const [q, setQ] = useState("");

  const filtered = events.filter((e) => {
    const okCat = cat === "All" || e.category === cat;
    const okQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.tagline.toLowerCase().includes(q.toLowerCase());
    return okCat && okQ;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="All Events"
        title="Every campus moment, in one place"
        subtitle="Filter by category or search by name. Register once, save your QR pass, collect certificates."
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all " +
              (cat === c
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No events match your search.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
