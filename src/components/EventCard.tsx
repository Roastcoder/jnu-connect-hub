import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { EventItem } from "@/lib/mock-data";

function formatDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", { ...opts, year: "numeric" });
  return start === end ? e : `${s} – ${e}`;
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elevated transition-all hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
          {event.category}
        </span>
        {event.price > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-glow">
            ₹{event.price}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">{event.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.tagline}</p>
        </div>
        <div className="mt-auto grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-primary" />
            {formatDateRange(event.startDate, event.endDate)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary" />
            {event.venue}
          </div>
          {event.participants && (
            <div className="flex items-center gap-2">
              <Users className="size-3.5 text-primary" />
              {event.participants}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span
            className={
              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider " +
              (event.seatsLeft > 0
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive")
            }
          >
            {event.seatsLeft > 0 ? `${event.seatsLeft} seats left` : "Sold out"}
          </span>
          <span className="text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
