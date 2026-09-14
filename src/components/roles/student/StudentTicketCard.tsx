import { Ticket, Calendar, MapPin, CheckCircle2 } from "lucide-react";

export function StudentTicketCard({
  regId,
  eventName,
  subEventName,
  fullName,
  date,
  venue,
  status = "confirmed",
}: {
  regId: string;
  eventName: string;
  subEventName?: string;
  fullName: string;
  date?: string;
  venue?: string;
  status?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-glow">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
            <Ticket className="size-3.5" /> ENTRY PASS
          </span>
          <h3 className="mt-3 font-display text-2xl font-bold text-foreground">{eventName}</h3>
          {subEventName && <p className="text-sm font-semibold text-primary">{subEventName}</p>}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="size-3.5" /> {status.toUpperCase()}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border/50 py-4 text-xs">
        <div>
          <span className="text-muted-foreground uppercase font-medium">Attendee</span>
          <div className="font-semibold text-foreground text-sm mt-0.5 truncate">{fullName}</div>
        </div>
        <div>
          <span className="text-muted-foreground uppercase font-medium">Pass ID</span>
          <div className="font-mono font-bold text-primary text-sm mt-0.5">{regId}</div>
        </div>
        {date && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="size-3.5 text-primary" /> {date}
          </div>
        )}
        {venue && (
          <div className="flex items-center gap-1.5 text-muted-foreground truncate">
            <MapPin className="size-3.5 text-primary" /> {venue}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground">
          Show this QR code at campus gate for instant check-in.
        </div>
      </div>
    </div>
  );
}
