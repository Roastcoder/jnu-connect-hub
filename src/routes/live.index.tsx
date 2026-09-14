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
      <PageHeader
        eyebrow="Broadcast Hub"
        title="Live 4K Streams"
        subtitle="Experience live stages, cultural performances, and celebrity shows in real time."
      />

      {live.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="size-2 rounded-full bg-red-600 animate-ping" />
            <h2 className="font-display text-xs font-extrabold uppercase tracking-wider text-red-700">
              Broadcasting Now
            </h2>
          </div>
          <div className="grid gap-3">
            {live.map((s) => (
              <StreamCard key={s.id} stream={s} big />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Scheduled Broadcasts" />
          <div className="grid gap-3">
            {upcoming.map((s) => (
              <StreamCard key={s.id} stream={s} />
            ))}
          </div>
        </section>
      )}

      {ended.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Stream Archives" />
          <div className="grid gap-3">
            {ended.map((s) => (
              <StreamCard key={s.id} stream={s} />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="mb-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-500">
      {title}
    </h2>
  );
}

function StreamCard({ stream, big }: { stream: (typeof liveStreams)[number]; big?: boolean }) {
  return (
    <Link
      to="/live/$streamId"
      params={{ streamId: stream.id }}
      className="group relative overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-sm transition-transform active:scale-[0.98]"
    >
      <div className={"relative " + (big ? "aspect-[16/9]" : "aspect-[16/9]")}>
        <img
          src={stream.poster}
          alt={stream.title}
          loading="lazy"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        {stream.status === "live" && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white shadow-sm">
            <span className="size-1.5 animate-ping rounded-full bg-white" /> LIVE
          </span>
        )}
        {stream.status === "upcoming" && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur">
            UPCOMING
          </span>
        )}
        <div className="absolute inset-x-3 bottom-2 text-white">
          <h3 className="font-display text-sm font-bold truncate leading-tight drop-shadow-sm">
            {stream.title}
          </h3>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between text-[11px] text-slate-500">
        {stream.status === "live" ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-red-700">
              <Radio className="size-3" /> Live
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3 text-slate-400" />
              {stream.viewers.toLocaleString()} watching
            </span>
            <span className="flex items-center gap-1">
              <Heart className="size-3 text-rose-500" />
              {stream.likes.toLocaleString()}
            </span>
          </div>
        ) : (
          <span>
            {stream.startTime
              ? new Date(stream.startTime).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Coming Soon"}
          </span>
        )}
        <span className="font-bold text-red-700">Watch →</span>
      </div>
    </Link>
  );
}
