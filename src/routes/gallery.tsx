import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { galleryAlbums, galleryVideos } from "@/lib/mock-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery · JNU Connect" },
      { name: "description", content: "Relive every JNU event — photos, videos and reels." },
    ],
  }),
  component: GalleryPage,
});

const tabs = ["Photos", "Videos", "Reels"] as const;

function GalleryPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Photos");
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <AppShell>
      <PageHeader eyebrow="JNU Gallery" title="Every event, remembered" subtitle="Photos, videos and reels from across campus." />

      <div className="mb-8 flex gap-1 rounded-full border border-border bg-card p-1 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={"rounded-full px-5 py-2 text-xs font-semibold transition-all " + (tab === t ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Photos" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryAlbums.map((a) => (
            <div key={a.id} className="group relative overflow-hidden rounded-3xl shadow-elevated">
              <img src={a.cover} alt={a.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                <p className="text-xs text-muted-foreground">{a.count} photos</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {(tab === "Videos" || tab === "Reels") && (
        <div className={"grid gap-5 " + (tab === "Reels" ? "sm:grid-cols-3 md:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3")}>
          {galleryVideos.map((v) => (
            <div key={v.id} className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elevated">
              <div className={"relative " + (tab === "Reels" ? "aspect-[9/16]" : "aspect-video")}>
                {playing === v.id ? (
                  <iframe
                    className="size-full"
                    src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
                    title={v.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button onClick={() => setPlaying(v.id)} className="group relative block size-full">
                    <img src={v.cover} alt={v.title} className="size-full object-cover" />
                    <div className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/45">
                      <div className="grid size-14 place-items-center rounded-full bg-white/90 text-primary shadow-glow transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 size-6" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">{v.duration}</div>
                  </button>
                )}
              </div>
              <div className="p-3">
                <div className="font-display text-sm font-semibold">{v.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
