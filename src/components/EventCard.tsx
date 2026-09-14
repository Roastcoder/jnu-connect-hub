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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-900 shadow-sm backdrop-blur-md">
            {event.category}
          </span>
          {event.featured && (
            <span className="rounded-full bg-amber-400 text-slate-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
              ★ Featured
            </span>
          )}
        </div>

        {event.price > 0 ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            ₹{event.price}
          </span>
        ) : (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            FREE
          </span>
        )}

        <div className="absolute bottom-2.5 left-3 right-3">
          <h3 className="font-display text-sm font-bold tracking-tight text-white line-clamp-1">{event.name}</h3>
          <p className="text-[10.5px] text-slate-200 line-clamp-1 mt-0.5">{event.tagline}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 gap-2.5">
        <div className="grid grid-cols-1 gap-1 text-[11.5px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary shrink-0" />
            <span className="font-semibold text-slate-900">{formatDateRange(event.startDate, event.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
          <span
            className={
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold " +
              (event.seatsLeft > 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200")
            }
          >
            <span className={`size-1.5 rounded-full ${event.seatsLeft > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            {event.seatsLeft > 0 ? `${event.seatsLeft} spots` : "Full"}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-red-700 group-hover:translate-x-0.5 transition-transform">
            Details <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
