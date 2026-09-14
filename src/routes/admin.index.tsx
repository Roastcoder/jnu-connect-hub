import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "./admin";
import { Award, CalendarDays, Radio, TrendingUp, Users, Ticket, IndianRupee } from "lucide-react";
import { contestants, events, liveStreams } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const stats = [
  { label: "Total Users", value: "8,420", Icon: Users, trend: "+12%" },
  { label: "Total Events", value: String(events.length), Icon: CalendarDays, trend: "+3" },
  { label: "Live Now", value: String(liveStreams.filter((s) => s.status === "live").length), Icon: Radio, trend: "" },
  { label: "Registrations", value: "3,201", Icon: Ticket, trend: "+240 today" },
  { label: "Revenue", value: "₹6.4L", Icon: IndianRupee, trend: "+₹42K" },
  { label: "Certificates Issued", value: "1,890", Icon: Award, trend: "+56" },
];

function AdminDashboard() {
  const top = [...contestants].sort((a, b) => b.votes - a.votes).slice(0, 5);
  return (
    <>
      <AdminPageHeader title="Overview" subtitle="What's happening across JNU Connect today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, Icon, trend }) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
                <div className="mt-2 font-display text-3xl font-bold">{value}</div>
                {trend && <div className="mt-1 inline-flex items-center gap-1 text-xs text-success"><TrendingUp className="size-3" />{trend}</div>}
              </div>
              <div className="grid size-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
          <h3 className="font-display text-lg font-semibold">Top contestants</h3>
          <div className="mt-4 grid gap-3">
            {top.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-6 font-display font-bold text-muted-foreground">#{i + 1}</div>
                <img src={c.photo} alt={c.name} className="size-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.eventCategory}</div>
                </div>
                <div className="font-display font-bold text-primary">{c.votes.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
          <h3 className="font-display text-lg font-semibold">Upcoming events</h3>
          <div className="mt-4 grid gap-3">
            {events.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <img src={e.image} alt={e.name} className="size-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.venue} · {e.startDate}</div>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase text-primary">
                  {e.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
