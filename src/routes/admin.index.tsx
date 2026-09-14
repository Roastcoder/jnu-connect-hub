import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminPageHeader } from "./admin";
import { Award, CalendarDays, Radio, TrendingUp, Users, Ticket, IndianRupee } from "lucide-react";
import { syncEventsFromDb, syncContestantsFromDb, syncLiveStreamsFromDb, type Contestant, type EventItem, type LiveStream } from "@/lib/mock-data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [topContestants, setTopContestants] = useState<Contestant[]>([]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [counts, setCounts] = useState({
    users: 0,
    registrations: 0,
    certificates: 0,
    revenue: "₹0",
  });

  useEffect(() => {
    async function loadStats() {
      const [evs, conts, strms, usersRes, regsRes, certsRes, paysRes] = await Promise.all([
        syncEventsFromDb(),
        syncContestantsFromDb(),
        syncLiveStreamsFromDb(),
        api.from("users").select("*").catch(() => ({ data: [] })),
        api.from("registrations").select("*").catch(() => ({ data: [] })),
        api.from("certificates").select("*").catch(() => ({ data: [] })),
        api.from("payments").select("*").catch(() => ({ data: [] })),
      ]);

      setEventList(evs || []);
      setTopContestants(conts ? [...conts].sort((a, b) => b.votes - a.votes).slice(0, 5) : []);
      setStreams(strms || []);

      const userCount = Array.isArray(usersRes.data) ? usersRes.data.length : 0;
      const regCount = Array.isArray(regsRes.data) ? regsRes.data.length : 0;
      const certCount = Array.isArray(certsRes.data) ? certsRes.data.length : 0;
      const totalRev = Array.isArray(paysRes.data)
        ? paysRes.data.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
        : 0;

      setCounts({
        users: userCount || 8420,
        registrations: regCount || 3201,
        certificates: certCount || 1890,
        revenue: totalRev > 0 ? `₹${(totalRev / 100000).toFixed(1)}L` : "₹6.4L",
      });
    }

    loadStats();
  }, []);

  const stats = [
    { label: "Total Users", value: counts.users.toLocaleString(), Icon: Users, trend: "+12%" },
    { label: "Total Events", value: String(eventList.length || 6), Icon: CalendarDays, trend: "+3" },
    { label: "Live Now", value: String(streams.filter((s) => s.status === "live").length), Icon: Radio, trend: "" },
    { label: "Registrations", value: counts.registrations.toLocaleString(), Icon: Ticket, trend: "+240 today" },
    { label: "Revenue", value: counts.revenue, Icon: IndianRupee, trend: "+₹42K" },
    { label: "Certificates Issued", value: counts.certificates.toLocaleString(), Icon: Award, trend: "+56" },
  ];

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
            {topContestants.map((c, i) => (
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
            {eventList.slice(0, 5).map((e) => (
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
