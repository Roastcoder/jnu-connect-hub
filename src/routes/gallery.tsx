import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncGalleryFromDb, galleryAlbums, galleryVideos } from "@/lib/mock-data";

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
  const [albums, setAlbums] = useState(galleryAlbums);
  const [videos, setVideos] = useState(galleryVideos);

  useEffect(() => {
    syncGalleryFromDb().then(() => {
      setAlbums([...galleryAlbums]);
      setVideos([...galleryVideos]);
    });
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Media Archives"
        title="Campus Gallery"
        subtitle="Explore high-resolution event photography, festival reels, and stage performances."
      />

      {/* Segmented Filter Pills */}
      <div className="mb-4 flex items-center gap-1.5 rounded-2xl bg-white p-1 border border-rose-100 shadow-sm w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-xl px-4 py-1.5 text-xs font-bold transition-all " +
              (tab === t
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Photos" && (
        <div className="grid grid-cols-2 gap-3">
          {albums.map((a) => (
            <div
              key={a.id}
              className="group relative overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-sm active:scale-98 transition-all"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={a.cover}
                  alt={a.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-2.5 text-white">
                <h3 className="font-display text-xs font-bold leading-tight truncate drop-shadow-sm">
                  {a.title}
                </h3>
                <p className="text-[9px] text-white/80 font-medium">{a.count} photos</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {(tab === "Videos" || tab === "Reels") && (
        <div className={"grid gap-3 " + (tab === "Reels" ? "grid-cols-2" : "grid-cols-1")}>
          {videos.map((v) => (
            <div
              key={v.id}
              className="group overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-sm"
            >
              <div className={"relative " + (tab === "Reels" ? "aspect-[9/14]" : "aspect-video")}>
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
                      <div className="grid size-11 place-items-center rounded-full bg-white/95 text-red-700 shadow-md transition-transform group-hover:scale-110 active:scale-95">
                        <Play className="ml-0.5 size-5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                      {v.duration}
                    </div>
                  </button>
                )}
              </div>
              <div className="p-2.5 bg-white">
                <div className="font-display text-xs font-bold text-slate-900 truncate">{v.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
