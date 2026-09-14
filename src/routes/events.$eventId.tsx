import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, MapPin, Users, Trophy, Ticket, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getEvent, syncEventsFromDb, type EventItem } from "@/lib/mock-data";

export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }): Promise<{ event: EventItem }> => {
    let event = getEvent(params.eventId);
    if (!event) {
      const all = await syncEventsFromDb();
      event = all.find((e) => e.id === params.eventId);
    }
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.event.name} · JNU Connect` },
          { name: "description", content: loaderData.event.tagline },
          { property: "og:title", content: loaderData.event.name },
          { property: "og:description", content: loaderData.event.tagline },
        ]
      : [],
  }),
  component: EventDetail,
  notFoundComponent: () => (
    <AppShell>
      <div className="rounded-3xl border border-dashed border-border p-12 text-center">
        <h2 className="font-display text-2xl font-bold">Event not found</h2>
        <Link to="/events" className="mt-4 inline-block text-primary hover:underline">
          Back to events
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <div className="rounded-3xl border border-dashed border-destructive/40 p-12 text-center">
        <h2 className="font-display text-2xl font-bold">Couldn't load this event</h2>
      </div>
    </AppShell>
  ),
});

const tabs = ["About", "Schedule", "Rules", "Sub Events", "Special Guests"] as const;
type Tab = (typeof tabs)[number];

function EventDetail() {
  const { event } = Route.useLoaderData() as { event: EventItem };
  const [tab, setTab] = useState<Tab>("About");

  return (
    <AppShell>
      {/* Mobile Back Button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-rose-100 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm mb-3 active:scale-95 transition-all"
      >
        ← Back to Events
      </Link>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-100/80 bg-white shadow-sm">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <img
            src={event.image}
            alt={event.name}
            loading="lazy"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute inset-x-3.5 bottom-3.5 text-white">
            <span className="inline-block rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm mb-1.5">
              {event.category}
            </span>
            <h1 className="font-display text-xl font-black leading-tight text-white drop-shadow-sm">
              {event.name}
            </h1>
            <p className="mt-1 text-xs text-white/90 line-clamp-2 leading-relaxed">
              {event.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Meta cards 2x2 grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetaCard Icon={CalendarDays} label="Date" value={formatRange(event.startDate, event.endDate)} />
        <MetaCard Icon={MapPin} label="Venue" value={event.venue} />
        {event.prizePool && <MetaCard Icon={Trophy} label="Prize Pool" value={event.prizePool} highlight />}
        {event.participants && <MetaCard Icon={Users} label="Expected" value={event.participants} />}
      </div>

      {/* Segmented Tab Controls */}
      <div className="mt-4 flex items-center gap-1 overflow-x-auto no-scrollbar rounded-2xl bg-white p-1 border border-rose-100 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all " +
              (tab === t
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content Box */}
      <div className="mt-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm min-h-[140px]">
        {tab === "About" && (
          <p className="text-xs leading-relaxed text-slate-700">{event.description}</p>
        )}
        {tab === "Schedule" && (
          <ol className="space-y-3">
            {event.schedule.map((s, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="grid size-6 shrink-0 place-items-center rounded-full bg-rose-50 border border-rose-200 text-[10px] font-black text-rose-800">
                  {i + 1}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">{s.time}</div>
                  <div className="text-xs font-bold text-slate-900">{s.title}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {tab === "Rules" && (
          <ul className="space-y-2.5 text-xs text-slate-700">
            {event.rules.map((r, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span className="leading-snug">{r}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === "Sub Events" && (
          <div className="space-y-2">
            {event.subEvents.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No sub-events listed for this competition.</div>
            ) : (
              event.subEvents.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display text-xs font-bold text-slate-900">{s.name}</h4>
                      <p className="mt-0.5 text-[11px] text-slate-500">{s.description}</p>
                    </div>
                    <div className="shrink-0 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      {s.fee > 0 ? `₹${s.fee}` : "Free"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {tab === "Special Guests" && (
          <div className="space-y-2.5">
            {!event.specialGuests || event.specialGuests.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">Special guests will be announced soon.</div>
            ) : (
              event.specialGuests.map((g) => (
                <div key={g.id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                  <img src={g.photo} alt={g.name} className="size-14 shrink-0 rounded-xl object-cover shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-amber-800">
                      ✦ Guest of Honour
                    </div>
                    <h4 className="mt-0.5 font-display text-xs font-bold text-slate-900 truncate">{g.name}</h4>
                    <div className="text-[10px] font-semibold text-red-700 truncate">{g.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{g.org}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="sticky bottom-20 mt-6 flex items-center justify-between rounded-2xl border border-rose-100 bg-white/95 backdrop-blur-md p-3.5 shadow-lg">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Entry Fee</div>
          <div className="font-display text-lg font-black text-red-700">
            {event.price > 0 ? `₹${event.price}` : "FREE"}
          </div>
        </div>
        <Link
          to="/events/$eventId/register"
          params={{ eventId: event.id }}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
        >
          <Ticket className="size-3.5" />
          Register Now
        </Link>
      </div>
    </AppShell>
  );
}

function MetaCard({
  Icon,
  label,
  value,
  highlight,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-2.5 shadow-xs ${highlight ? "bg-amber-50/60 border-amber-200" : "bg-white border-rose-100"}`}>
      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
        <Icon className={`size-3 ${highlight ? "text-amber-700" : "text-red-700"}`} />
        {label}
      </div>
      <div className={`mt-0.5 font-display text-xs font-bold truncate ${highlight ? "text-amber-900 font-extrabold" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}

function formatRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const s = new Date(start).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return start === end ? e : `${s} – ${e}`;
}
