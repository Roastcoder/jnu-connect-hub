import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Users, ArrowUpRight } from "lucide-react";
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
      className="liquid-glass group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-zinc-900">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full liquid-pill px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
            {event.category}
          </span>
          {event.featured && (
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm">
              ★ Featured
            </span>
          )}
        </div>

        {event.price > 0 ? (
          <span className="absolute right-3 top-3 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-bold text-white shadow-glow backdrop-blur-md">
            ₹{event.price}
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500/90 border border-emerald-400/40 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
            FREE ENTRY
          </span>
        )}

        <div className="absolute bottom-3 left-3.5 right-3.5">
          <h3 className="font-display text-base font-bold tracking-tight text-white line-clamp-1">{event.name}</h3>
          <p className="text-[11px] text-white/80 line-clamp-1">{event.tagline}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 gap-3 bg-transparent">
        <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground/90">{formatDateRange(event.startDate, event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          {event.participants && (
            <div className="flex items-center gap-2">
              <Users className="size-3.5 text-primary shrink-0" />
              <span>{event.participants} registered</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.06] pt-3">
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide " +
              (event.seatsLeft > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20")
            }
          >
            <span className={`size-1.5 rounded-full ${event.seatsLeft > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            {event.seatsLeft > 0 ? `${event.seatsLeft} spots open` : "Full"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            View Details <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
