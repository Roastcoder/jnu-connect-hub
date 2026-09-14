import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Radio, Users, Heart } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncLiveStreamsFromDb, liveStreams, type LiveStream } from "@/lib/mock-data";

export const Route = createFileRoute("/live/")({
  head: () => ({
    meta: [
      { title: "Live · JNU Connect" },
      { name: "description", content: "Watch JNU events live — main stage, finals, workshops and more." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const [streamList, setStreamList] = useState<LiveStream[]>(liveStreams);

  useEffect(() => {
    syncLiveStreamsFromDb().then((data) => {
      if (data && data.length > 0) setStreamList(data);
    });
  }, []);

  const live = streamList.filter((s) => s.status === "live");
  const upcoming = streamList.filter((s) => s.status === "upcoming");
  const ended = streamList.filter((s) => s.status === "ended");

  return (
    <AppShell>
      <PageHeader eyebrow="Live" title="On air right now" subtitle="Watch every JNU event live from anywhere on campus." />

      {live.length > 0 && (
        <section className="mb-10 grid gap-5 md:grid-cols-2">
          {live.map((s) => (
            <StreamCard key={s.id} stream={s} big />
          ))}
        </section>
      )}

      <SectionHeader title="Upcoming streams" />
      <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((s) => (
          <StreamCard key={s.id} stream={s} />
        ))}
      </section>

      <SectionHeader title="Past streams" />
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ended.map((s) => (
          <StreamCard key={s.id} stream={s} />
        ))}
      </section>
    </AppShell>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>;
}

function StreamCard({ stream, big }: { stream: (typeof liveStreams)[number]; big?: boolean }) {
  return (
    <Link
      to="/live/$streamId"
      params={{ streamId: stream.id }}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elevated transition-transform hover:-translate-y-1"
    >
      <div className={"relative " + (big ? "aspect-video" : "aspect-[16/10]")}>
        <img src={stream.poster} alt={stream.title} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        {stream.status === "live" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-destructive-foreground">
            <span className="size-2 animate-pulse rounded-full bg-white" /> Live
          </span>
        )}
        {stream.status === "upcoming" && (
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
            Upcoming
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold">{stream.title}</h3>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          {stream.status === "live" ? (
            <>
              <span className="flex items-center gap-1"><Radio className="size-3.5 text-destructive" />Live now</span>
              <span className="flex items-center gap-1"><Users className="size-3.5 text-primary" />{stream.viewers.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Heart className="size-3.5 text-accent" />{stream.likes.toLocaleString()}</span>
            </>
          ) : (
            <span>{stream.startTime ? new Date(stream.startTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Scheduled Soon"}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
