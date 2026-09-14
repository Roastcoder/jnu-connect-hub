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
      <Link to="/events" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← All events
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl shadow-elevated">
        <img src={event.image} alt={event.name} loading="lazy" className="h-72 w-full object-cover md:h-96" />
        <div className="absolute inset-0 bg-gradient-hero opacity-70 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground md:p-10">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary-glow">
            {event.category}
          </div>
          <h1 className="font-display text-3xl font-bold md:text-5xl">{event.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">{event.tagline}</p>
        </div>
      </div>

      {/* Meta cards */}
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <MetaCard Icon={CalendarDays} label="Date" value={formatRange(event.startDate, event.endDate)} />
        <MetaCard Icon={MapPin} label="Venue" value={event.venue} />
        {event.prizePool && <MetaCard Icon={Trophy} label="Prize Pool" value={event.prizePool} />}
        {event.participants && <MetaCard Icon={Users} label="Participants" value={event.participants} />}
      </div>

      {/* Tabs */}
      <div className="mt-8 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="inline-flex min-w-full gap-1 rounded-full border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all md:flex-1 md:text-sm " +
                (tab === t
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>


      <div className="mt-6 rounded-3xl border border-border/60 bg-card p-6 shadow-elevated md:p-8">
        {tab === "About" && (
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{event.description}</p>
        )}
        {tab === "Schedule" && (
          <ol className="space-y-4">
            {event.schedule.map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground shadow-glow">
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-primary">{s.time}</div>
                  <div className="font-medium">{s.title}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {tab === "Rules" && (
          <ul className="space-y-3 text-sm text-muted-foreground">
            {event.rules.map((r, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === "Sub Events" && (
          <div className="grid gap-3 md:grid-cols-2">
            {event.subEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">No sub-events for this event.</div>
            ) : (
              event.subEvents.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border/60 bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-display font-semibold">{s.name}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                    </div>
                    <div className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                      {s.fee > 0 ? `₹${s.fee}` : "Free"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {tab === "Special Guests" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {!event.specialGuests || event.specialGuests.length === 0 ? (
              <div className="text-sm text-muted-foreground">Special guests will be announced soon.</div>
            ) : (
              event.specialGuests.map((g) => (
                <div key={g.id} className="flex gap-4 rounded-2xl border border-border/60 bg-background p-4">
                  <img src={g.photo} alt={g.name} className="size-20 shrink-0 rounded-2xl object-cover shadow-glow" />
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">✦ Guest of Honour</div>
                    <h4 className="mt-1 font-display text-base font-semibold">{g.name}</h4>
                    <div className="text-xs text-primary">{g.title}</div>
                    <div className="text-xs text-muted-foreground">{g.org}</div>
                    {g.bio && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{g.bio}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Register CTA */}
      <div className="sticky bottom-24 mt-8 flex items-center justify-between rounded-3xl border border-border/60 bg-card p-4 shadow-elevated md:bottom-6 md:p-5">
        <div>
          <div className="text-xs text-muted-foreground">Registration Fee</div>
          <div className="font-display text-2xl font-bold text-primary">
            {event.price > 0 ? `₹${event.price}` : "Free"}
          </div>
        </div>
        <Link
          to="/events/$eventId/register"
          params={{ eventId: event.id }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
        >
          <Ticket className="size-4" />
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
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-1 font-display text-sm font-semibold">{value}</div>
    </div>
  );
}

function formatRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const s = new Date(start).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return start === end ? e : `${s} – ${e}`;
}
