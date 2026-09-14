import { createFileRoute, notFound, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, ChevronDown, Heart, MessageCircle, MessageSquare, Maximize2, Minimize2,
  PictureInPicture2, Pin, PinOff, Play, Radio, RotateCcw, RotateCw, Send, Settings2,
  ShieldCheck, Share2, Sparkles, Trash2, Trophy, Users, Volume2, VolumeX, Vote as VoteIcon,
  Wifi, X, Calendar, MapPin, Image as ImageIcon, ListChecks,

} from "lucide-react";
import { getStream, syncLiveStreamsFromDb, liveStreams, contestants, getEvent, galleryAlbums, type LiveStream } from "@/lib/mock-data";
import { useChannel, getChannel } from "@/lib/realtime";
import { BottomNav, TopBar } from "@/components/AppShell";

export const Route = createFileRoute("/live/$streamId")({
  loader: async ({ params }): Promise<{ stream: LiveStream & { youtubeId?: string } }> => {
    let stream = getStream(params.streamId) ?? liveStreams.find((s) => s.id === params.streamId);
    if (!stream) {
      const all = await syncLiveStreamsFromDb();
      stream = all.find((s) => s.id === params.streamId);
    }
    if (!stream) throw notFound();
    return { stream };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.stream.title} · Live · JNU Connect` },
          { name: "description", content: `Watch ${loaderData.stream.title} live on JNU Connect.` },
          { property: "og:image", content: loaderData.stream.poster },
        ]
      : [],
  }),
  component: StreamPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">Stream not found.</div>
  ),
});

// ============ Types & helpers ============
type ChatEvent =
  | { kind: "msg"; msg: ChatMessage }
  | { kind: "react"; id: string; emoji: string }
  | { kind: "pin"; id: string; pinned: boolean }
  | { kind: "hide"; id: string };

interface ChatMessage {
  id: string; user: string; text: string; color: string;
  role?: "student" | "mod" | "official";
  reactions: Record<string, number>;
  pinned?: boolean; hidden?: boolean;
}

const seedChat: ChatMessage[] = [
  { id: "1", user: "Priya", text: "The stage looks 🔥", color: "text-accent", role: "student", reactions: { "❤️": 12, "🔥": 5 } },
  { id: "2", user: "Karan", text: "Anyone else in Block C?", color: "text-primary", role: "student", reactions: {} },
  { id: "3", user: "JNU Official", text: "Welcome to Technorazz 2026! Rules for chat: be kind, no spam.", color: "text-success", role: "official", reactions: { "👏": 32 }, pinned: true },
];

const SPAM = ["http://", "https://", "buy now", "free money", "click here", "whatsapp", "onlyfans"];
function isSpam(t: string): string | null {
  const l = t.toLowerCase();
  for (const w of SPAM) if (l.includes(w)) return `Blocked: contains "${w}"`;
  if (/(.)\1{7,}/.test(t)) return "Blocked: repeated characters";
  if (t.length > 240) return "Blocked: message too long";
  if (t === t.toUpperCase() && t.replace(/[^A-Z]/g, "").length > 12) return "Blocked: all-caps shouting";
  return null;
}

const REACTIONS = ["❤️", "🔥", "👏", "😂", "🎉"];
const QUALITY_OPTIONS = [
  { id: "auto", label: "Auto", vq: undefined as string | undefined },
  { id: "hd1080", label: "1080p", vq: "hd1080" },
  { id: "hd720", label: "720p", vq: "hd720" },
  { id: "large", label: "480p", vq: "large" },
  { id: "medium", label: "360p", vq: "medium" },
];

type TabId = "overview" | "contestants" | "vote" | "leaderboard" | "chat" | "schedule" | "gallery";
const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "contestants", label: "Contestants", icon: Users },
  { id: "vote", label: "Vote", icon: VoteIcon },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "chat", label: "Live Chat", icon: MessageCircle },
  { id: "schedule", label: "Schedule", icon: ListChecks },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
];

type SheetId = "contestants" | "vote" | "leaderboard" | "chat" | null;

// ============ Component ============
function StreamPage() {
  const router = useRouter();
  const { pathname } = useLocation();
  const { stream } = Route.useLoaderData() as { stream: LiveStream & { youtubeId?: string } };
  const event = useMemo(() => getEvent(stream.eventId), [stream.eventId]);
  const eventContestants = useMemo(
    () => contestants.filter((c) => c.event.toLowerCase().includes((event?.name ?? "").split(" ")[0]?.toLowerCase() ?? "__")),
    [event]
  );
  const leaderboard = useMemo(
    () => [...(eventContestants.length ? eventContestants : contestants)].sort((a, b) => b.votes - a.votes),
    [eventContestants]
  );
  const gallery = useMemo(() => galleryAlbums.slice(0, 6), []);

  const [likes, setLikes] = useState(stream.likes);
  const [viewers, setViewers] = useState(stream.viewers);
  const [chat, setChat] = useState<ChatMessage[]>(seedChat);
  const [msg, setMsg] = useState("");
  const [isMod, setIsMod] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const [quality, setQuality] = useState("auto");
  const [showQuality, setShowQuality] = useState(false);
  // Per-stream persisted audio prefs
  const audioStorageKey = `jnu:stream:${stream.id}:audio`;
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { const s = JSON.parse(localStorage.getItem(audioStorageKey) || "null"); return s?.muted ?? false; } catch { return false; }
  });
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 80;
    try { const s = JSON.parse(localStorage.getItem(audioStorageKey) || "null"); return typeof s?.volume === "number" ? s.volume : 80; } catch { return 80; }
  });
  const [showVolume, setShowVolume] = useState(false);
  // True until the browser confirms audio is actually playing unmuted
  const [needsSoundGesture, setNeedsSoundGesture] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const hasStartedRef = useRef(false);
  const [needsPlayGesture, setNeedsPlayGesture] = useState<boolean>(false);


  const [landscape, setLandscape] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [seekHint, setSeekHint] = useState<null | "back" | "fwd">(null);
  const [mini, setMini] = useState(false);
  // Draggable mini/PiP position (bottom-right by default via CSS anchors)
  const [miniPos, setMiniPos] = useState<{ x: number; y: number } | null>(null);
  const miniDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [sheet, setSheet] = useState<SheetId>(null);

  // Persist audio prefs per stream
  useEffect(() => {
    try { localStorage.setItem(audioStorageKey, JSON.stringify({ muted, volume })); } catch { /* noop */ }
  }, [muted, volume, audioStorageKey]);

  const lastSentAt = useRef(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [hasNew, setHasNew] = useState(false);
  const playerBoxRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ t: number; x: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const channelName = `jnu:chat:${stream.id}`;
  const broadcast = useChannel<ChatEvent>(channelName, (evt) => setChat((c) => reduceChat(c, evt)));

  useEffect(() => { setConnected(true); }, []);
  useEffect(() => {
    if (stream.status !== "live") return;
    const id = setInterval(() => setViewers((v) => Math.max(1, v + Math.floor(Math.random() * 8 - 3))), 3000);
    return () => clearInterval(id);
  }, [stream.status]);

  // Keep bottom nav visible on this page

  // Auto-scroll chat when at bottom
  const scrollTORef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function checkBottom() {
    const el = chatScrollRef.current; if (!el) return;
    const near = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
    isAtBottomRef.current = near;
    if (near) setHasNew(false);
  }
  useEffect(() => {
    if (isAtBottomRef.current) { const el = chatScrollRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }
    else setHasNew(true);
  }, [chat.length]);

  // Landscape lock / unlock
  async function enterLandscape() {
    setLandscape(true);
    document.body.style.overflow = "hidden";
    try {
      const el = playerBoxRef.current as any;
      const req = el?.requestFullscreen || el?.webkitRequestFullscreen;
      if (req) { try { await req.call(el); } catch { /* ignore */ } }
      const so = (screen as any).orientation;
      if (so?.lock) { try { await so.lock("landscape"); } catch { /* ignore */ } }
    } catch { /* ignore */ }
    scheduleHideControls();
  }
  function exitLandscape() {
    setLandscape(false);
    document.body.style.overflow = "";
    try {
      const so = (screen as any).orientation;
      if (so?.unlock) so.unlock();
    } catch { /* ignore */ }
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      try { (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc); } catch { /* ignore */ }
    }
    setControlsVisible(true);
  }
  useEffect(() => {
    const onFs = () => {
      const active = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!active && landscape) exitLandscape();
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs as any);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landscape]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && landscape) exitLandscape(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landscape]);

  function scheduleHideControls() {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }
  function pokeControls() {
    setControlsVisible(true);
    if (landscape) scheduleHideControls();
  }

  // Gestures on overlay
  function onOverlayTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }
  function onOverlayTouchEnd(e: React.TouchEvent) {
    const s = touchStartRef.current; if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y, dt = Date.now() - s.t;
    // Swipe down exits fullscreen
    if (dy > 80 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      if (landscape) { exitLandscape(); return; }
    }
    // Horizontal swipe → scrub (1s per 12px), min ±5s
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const delta = Math.max(-120, Math.min(120, Math.round(dx / 12)));
      const dir = delta >= 0 ? "fwd" : "back";
      setSeekHint(dir);
      setTimeout(() => setSeekHint(null), 550);
      ytSeekBy(delta);
      return;
    }
    // Tap / double-tap
    if (dt < 250 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const now = Date.now();
      const last = lastTapRef.current;
      if (last && now - last.t < 300) {
        const w = (e.currentTarget as HTMLElement).clientWidth;
        const side = t.clientX < w / 2 ? "back" : "fwd";
        setSeekHint(side);
        setTimeout(() => setSeekHint(null), 550);
        ytSeekBy(side === "back" ? -10 : 10);
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { t: now, x: t.clientX };
        setTimeout(() => {
          if (lastTapRef.current && Date.now() - lastTapRef.current.t >= 280) {
            // single tap
            setControlsVisible((v) => !v);
            if (landscape && !controlsVisible) scheduleHideControls();
          }
        }, 300);
      }
    }
  }


  // Chat helpers
  function reduceChat(c: ChatMessage[], evt: ChatEvent): ChatMessage[] {
    if (evt.kind === "msg") return c.some((m) => m.id === evt.msg.id) ? c : [...c, evt.msg];
    if (evt.kind === "react") return c.map((m) => m.id === evt.id ? { ...m, reactions: { ...m.reactions, [evt.emoji]: (m.reactions[evt.emoji] ?? 0) + 1 } } : m);
    if (evt.kind === "pin") return c.map((m) => m.id === evt.id ? { ...m, pinned: evt.pinned } : m);
    if (evt.kind === "hide") return c.map((m) => m.id === evt.id ? { ...m, hidden: true } : m);
    return c;
  }
  function send(text?: string) {
    const t = (text ?? msg).trim(); if (!t) return;
    if (Date.now() - lastSentAt.current < 1500) { setWarning("Slow down — 1 message per 1.5s."); return; }
    const spam = isSpam(t); if (spam) { setWarning(spam); return; }
    setWarning(null); lastSentAt.current = Date.now();
    broadcast({ kind: "msg", msg: { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, user: "You", text: t, color: "text-foreground", role: "student", reactions: {} } });
    setMsg("");
  }
  const react = (id: string, emoji: string) => broadcast({ kind: "react", id, emoji });
  const togglePin = (id: string, pinned: boolean) => broadcast({ kind: "pin", id, pinned: !pinned });
  const hide = (id: string) => broadcast({ kind: "hide", id });
  const pinned = chat.filter((m) => m.pinned && !m.hidden);
  const feed = chat.filter((m) => !m.hidden);

  // Player — always autoplay muted for iOS/Safari; we unmute via postMessage after load.
  const activeQuality = QUALITY_OPTIONS.find((q) => q.id === quality) ?? QUALITY_OPTIONS[0];
  const [iframeSrc, setIframeSrc] = useState("");
  useEffect(() => {
    if (!stream.youtubeId) return;
    const origin = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";
    setIframeSrc(`https://www.youtube-nocookie.com/embed/${stream.youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&enablejsapi=1&mute=1&origin=${origin}${activeQuality.vq ? `&vq=${activeQuality.vq}` : ""}`);
  }, [stream.youtubeId, activeQuality.vq]);

  // YouTube postMessage seek + volume support
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentTimeRef = useRef(0);
  const playerReadyRef = useRef(false);
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (typeof e.data !== "string") return;
      try {
        const d = JSON.parse(e.data);
        if (d.event === "infoDelivery") {
          if (d.info?.currentTime != null) currentTimeRef.current = d.info.currentTime;
          // If we intended to be unmuted but the player reports it's still muted,
          // iOS/Safari likely blocked autoplay-with-sound: prompt for a gesture.
          if (d.info?.muted != null && !muted) {
            setNeedsSoundGesture(d.info.muted === true || d.info.muted === 1);
          }
        }
        if (d.event === "onReady" || d.event === "initialDelivery") {
          playerReadyRef.current = true;
          applyAudio();
          ytPost("playVideo");
        }
        if (d.event === "onStateChange") {
          if (d.info === 1) { hasStartedRef.current = true; setHasStarted(true); setNeedsPlayGesture(false); }
          if (d.info === 2 || d.info === 5) {
            // paused or cued — force play
            ytPost("playVideo");
          }
        }

      } catch { /* noop */ }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted, volume]);
  function ytPost(func: string, args: any[] = []) {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }
  function ytStartListening() {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
    // Try to apply audio prefs shortly after load and force playback
    setTimeout(() => { applyAudio(); ytPost("playVideo"); }, 400);
    setTimeout(() => ytPost("playVideo"), 1200);
    setTimeout(() => { if (!hasStartedRef.current) setNeedsPlayGesture(true); }, 2500);

  }

  function ytSeekBy(delta: number) {
    const t = Math.max(0, (currentTimeRef.current || 0) + delta);
    ytPost("seekTo", [t, true]);
  }
  function applyAudio() {
    ytPost("setVolume", [Math.max(0, Math.min(100, volume))]);
    if (muted) {
      ytPost("mute");
      setNeedsSoundGesture(false);
    } else {
      ytPost("unMute");
      // We'll confirm via infoDelivery whether iOS actually let us unmute.
    }
  }
  // Re-apply when user changes prefs
  useEffect(() => { if (playerReadyRef.current) applyAudio(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted, volume]);

  // Explicit user-gesture unmute — safe path for iOS autoplay restrictions.
  function enableSound() {
    setMuted(false);
    ytPost("unMute");
    ytPost("setVolume", [Math.max(0, Math.min(100, volume || 80))]);
    ytPost("playVideo");
    setNeedsSoundGesture(false);
  }

  async function tryPiP() {
    // YouTube iframes block programmatic PiP on most browsers; use the in-app
    // mini/floating player instead so it works everywhere and can be dragged.
    try {
      const doc = document as any;
      const vids = playerBoxRef.current?.querySelectorAll("video");
      const v = vids?.[0] as any;
      if (v?.requestPictureInPicture && doc.pictureInPictureEnabled) {
        await v.requestPictureInPicture();
        return;
      }
    } catch { /* fall through to mini */ }
    setMini(true);
  }

  // Drag the floating mini player
  function clampMini(x: number, y: number) {
    if (typeof window === "undefined") return { x, y };
    const el = playerBoxRef.current;
    const w = el?.offsetWidth ?? 224;
    const h = el?.offsetHeight ?? 140;
    const maxX = window.innerWidth - w - 8;
    const maxY = window.innerHeight - h - 8;
    return { x: Math.max(8, Math.min(maxX, x)), y: Math.max(8, Math.min(maxY, y)) };
  }
  function onMiniPointerDown(e: React.PointerEvent) {
    if (!mini) return;
    const el = playerBoxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    miniDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      moved: false,
    };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }
  function onMiniPointerMove(e: React.PointerEvent) {
    const d = miniDragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    d.moved = true;
    setMiniPos(clampMini(d.origX + dx, d.origY + dy));
  }
  function onMiniPointerUp(e: React.PointerEvent) {
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    miniDragRef.current = null;
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: stream.title, url });
      else { await navigator.clipboard.writeText(url); }
    } catch { /* noop */ }
  }
  function goBack() {
    // Mini player instead of leaving
    setMini(true);
  }
  function closeMini() {
    setMini(false);
    router.navigate({ to: "/live" });
  }

  // ============ Render ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 pb-[calc(5.5rem+env(safe-area-inset-bottom))]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {!landscape && <TopBar />}
      {/* PLAYER SHELL */}
      <div
        ref={playerBoxRef}
        className={
          landscape
            ? "fixed inset-0 z-[9999] bg-black"
            : mini
              ? "fixed z-[80] aspect-video w-56 touch-none overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl md:w-72"
              : "relative z-30 w-full bg-black"
        }
        style={
          mini
            ? miniPos
              ? { left: miniPos.x, top: miniPos.y, right: "auto", bottom: "auto" }
              : { right: "1rem", bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }
            : undefined
        }
        onPointerDown={mini ? onMiniPointerDown : undefined}
        onPointerMove={mini ? onMiniPointerMove : undefined}
        onPointerUp={mini ? onMiniPointerUp : undefined}
        onPointerCancel={mini ? onMiniPointerUp : undefined}
      >

        <div className={landscape ? "relative size-full" : "relative aspect-[16/10] w-full"}>
          {stream.youtubeId && iframeSrc ? (
            <>
              <iframe
                ref={iframeRef}
                key={`${stream.id}-${quality}`}
                className="absolute inset-0 size-full"
                src={iframeSrc}
                title={stream.title}
                onLoad={ytStartListening}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              />
              {/* Mask residual YouTube chrome — only in the main player */}
              {!mini && !landscape && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-10 bg-black" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-8 bg-black" />
                </>
              )}
            </>
          ) : (
            <>
              <img src={stream.poster} alt={stream.title} className="absolute inset-0 size-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-hero opacity-60 mix-blend-multiply" />
            </>
          )}

          {/* Mini-mode drag handle — iframe swallows pointer events, so
              we provide a visible strip along the top for grabbing. */}
          {mini && (
            <div
              className="absolute inset-x-0 top-0 z-[15] flex h-9 cursor-grab items-center justify-center bg-gradient-to-b from-black/70 to-transparent active:cursor-grabbing"
              onPointerDown={onMiniPointerDown}
              onPointerMove={onMiniPointerMove}
              onPointerUp={onMiniPointerUp}
              onPointerCancel={onMiniPointerUp}
              title="Drag to move"
            >
              <span className="h-1 w-10 rounded-full bg-white/60" />
            </div>
          )}



          {/* Gesture overlay (transparent, above iframe but not blocking iframe by default via pointer-events sequencing) */}
          <div
            className="absolute inset-0 z-10"
            style={{ pointerEvents: mini ? "none" : "auto" }}
            onTouchStart={onOverlayTouchStart}
            onTouchEnd={onOverlayTouchEnd}
            onClick={() => { if (!landscape) pokeControls(); }}
          />

          {/* Seek hint */}
          {seekHint && (
            <div className={"pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-white backdrop-blur-md " + (seekHint === "back" ? "left-8" : "right-8")}>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                {seekHint === "back" ? <RotateCcw className="size-4" /> : <RotateCw className="size-4" />} 10s
              </div>
            </div>
          )}

          {/* iOS autoplay fallback: sound needs a user gesture */}
          {needsSoundGesture && !mini && (
            <button
              onClick={(e) => { e.stopPropagation(); enableSound(); }}
              className="absolute left-1/2 top-4 z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-black shadow-lg backdrop-blur"
            >
              <Volume2 className="size-4" /> Tap for sound
            </button>
          )}

          {/* Mobile autoplay fallback: video didn't start — user gesture required */}
          {needsPlayGesture && !hasStarted && !mini && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                ytPost("playVideo");
                applyAudio();
                setNeedsPlayGesture(false);
              }}
              className="absolute inset-0 z-30 grid place-items-center bg-black/50"
              aria-label="Tap to play"
            >
              <span className="grid size-20 place-items-center rounded-full bg-white/95 text-black shadow-2xl">
                <Play className="size-8 translate-x-0.5" />
              </span>
            </button>
          )}


          {/* Top controls */}
          <div
            className={
              "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-5 py-3 transition-opacity duration-300 md:px-3 " +
              (controlsVisible ? "opacity-100" : "opacity-0")
            }
            style={{
              paddingTop: "0.75rem",
              paddingLeft: "calc(1.25rem + env(safe-area-inset-left))",
              paddingRight: "calc(1.25rem + env(safe-area-inset-right))",
            }}
          >
            {!mini && (
              <button onClick={landscape ? exitLandscape : goBack} className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                <ArrowLeft className="size-4" />
              </button>
            )}
            {stream.status === "live" && (
              <span className="pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-white" /> Live
              </span>
            )}
            <span className="pointer-events-none inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur">
              <Users className="size-3" />{viewers.toLocaleString()}
            </span>
            <span className="pointer-events-none hidden sm:inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur">
              <Wifi className={"size-3 " + (connected ? "text-emerald-400" : "text-white/60")} /> {activeQuality.label}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {mini ? (
                <>
                  <button onClick={() => setMini(false)} className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                    <Maximize2 className="size-4" />
                  </button>
                  <button onClick={closeMini} className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={share} className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur" title="Share">
                    <Share2 className="size-4" />
                  </button>
                  <button onClick={tryPiP} className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur" title="Picture in picture">
                    <PictureInPicture2 className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          {!mini && (
            <div
              className={
                "pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent px-5 py-3 transition-opacity duration-300 md:px-3 " +
                (controlsVisible ? "opacity-100" : "opacity-0")
              }
              style={{
                paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
                paddingLeft: "calc(1.25rem + env(safe-area-inset-left))",
                paddingRight: "calc(1.25rem + env(safe-area-inset-right))",
              }}
            >
              <button onClick={() => setLikes((l) => l + 1)} className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                <Heart className="size-4 text-red-400" fill="currentColor" /> {likes.toLocaleString()}
              </button>
              <div className="pointer-events-auto relative flex items-center">
                <button
                  onClick={() => {
                    if (muted) { enableSound(); }
                    else { setMuted(true); }
                    setShowVolume(true);
                  }}
                  onMouseEnter={() => setShowVolume(true)}
                  className="grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
                {showVolume && (
                  <div
                    className="ml-1 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md"
                    onMouseLeave={() => setShowVolume(false)}
                  >
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={muted ? 0 : volume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        if (v > 0 && muted) { enableSound(); }
                        if (v === 0) { setMuted(true); }
                      }}
                      aria-label="Volume"
                      className="h-1 w-24 cursor-pointer accent-white"
                    />
                    <span className="w-8 text-right text-[10px] font-semibold text-white/80 tabular-nums">
                      {muted ? 0 : volume}
                    </span>
                  </div>
                )}
              </div>
              <div className="pointer-events-auto relative">
                <button onClick={() => setShowQuality((s) => !s)} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  <Settings2 className="size-4" />{activeQuality.label}
                </button>
                {showQuality && (
                  <div className="absolute bottom-full right-0 mb-2 w-36 overflow-hidden rounded-2xl border border-white/10 bg-black/80 py-1 text-xs text-white backdrop-blur-xl">
                    {QUALITY_OPTIONS.map((q) => (
                      <button key={q.id} onClick={() => { setQuality(q.id); setShowQuality(false); }} className={"flex w-full items-center justify-between px-3 py-1.5 hover:bg-white/10 " + (quality === q.id ? "text-accent" : "")}>
                        {q.label}{quality === q.id && <span>●</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={landscape ? exitLandscape : enterLandscape} className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                {landscape ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Landscape floating action bar for sheets */}
        {landscape && (
          <div className={"pointer-events-none absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2 transition-opacity duration-300 " + (controlsVisible ? "opacity-100" : "opacity-0")}>
            {(["chat", "vote", "contestants", "leaderboard"] as const).map((s) => (
              <button key={s} onClick={() => setSheet(s)} className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-xl">
                {s === "chat" && <MessageCircle className="size-3.5" />}
                {s === "vote" && <VoteIcon className="size-3.5" />}
                {s === "contestants" && <Users className="size-3.5" />}
                {s === "leaderboard" && <Trophy className="size-3.5" />}
                <span className="capitalize">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PAGE CONTENT (hidden when landscape) */}
      {!landscape && !mini && (
        <>
          {/* Event card */}
          <section className="mx-auto max-w-4xl px-4 pt-5">
            <div className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-elevated backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
                <Radio className="size-3.5" />{stream.status === "live" ? "Broadcasting now" : stream.status}
              </div>
              <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{stream.title}</h1>
              {event?.description && <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {event?.startDate && <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />{event.startDate}</span>}
                {event?.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{event.venue}</span>}
                <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" />Peak {stream.peakViewers.toLocaleString()}</span>
                <span className="inline-flex items-center gap-1.5"><Heart className="size-3.5" />{likes.toLocaleString()}</span>
              </div>
              {eventContestants.length > 0 && (
                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Special guests</div>
                  <div className="mt-2 flex -space-x-2">
                    {eventContestants.slice(0, 5).map((c) => (
                      <img key={c.id} src={c.photo} alt={c.name} className="size-9 rounded-full border-2 border-card object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sticky tabs */}
          <nav className="sticky top-0 z-30 mt-6 border-b border-border/50 bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); if (t.id === "chat" || t.id === "vote" || t.id === "contestants" || t.id === "leaderboard") setSheet(t.id as SheetId); }}
                  className={"inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all " + (tab === t.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary/60 text-muted-foreground hover:text-foreground")}
                >
                  <t.icon className="size-3.5" />{t.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Tab content */}
          <section className="mx-auto mt-6 max-w-4xl px-4 pb-4">
            {tab === "overview" && (
              <div className="space-y-5">
                <Card title="About this stream">
                  <p className="text-sm text-muted-foreground">{event?.tagline ?? "Enjoy the live broadcast in premium quality."}</p>
                </Card>
                {event?.rules?.length ? (
                  <Card title="Rules">
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {event.rules.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </Card>
                ) : null}
                <Card title="Up next">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {liveStreams.filter((s) => s.id !== stream.id).slice(0, 4).map((s) => (
                      <Link key={s.id} to="/live/$streamId" params={{ streamId: s.id }} className="group flex gap-3 rounded-2xl border border-border/60 bg-background/50 p-2 transition-all hover:border-primary/60">
                        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-black">
                          <img src={s.poster} alt={s.title} className="size-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-sm font-semibold">{s.title}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{s.status === "live" ? `${s.viewers.toLocaleString()} watching` : s.status}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              </div>
            )}
            {tab === "schedule" && (
              <Card title="Schedule">
                {event?.schedule?.length ? (
                  <ol className="space-y-3">
                    {event.schedule.map((s, i) => (
                      <li key={i} className="flex gap-3 rounded-2xl border border-border/60 bg-background/50 p-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{i + 1}</div>
                        <div>
                          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.time}</div>
                          <div className="text-sm font-semibold">{s.title}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : <p className="text-sm text-muted-foreground">Schedule will be announced soon.</p>}
              </Card>
            )}
            {tab === "gallery" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((a) => (
                  <Link key={a.id} to="/gallery" className="group relative aspect-square overflow-hidden rounded-2xl">
                    <img src={a.cover} alt={a.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs font-semibold text-white">{a.title}</div>
                  </Link>
                ))}
              </div>
            )}
            {/* For chat/vote/contestants/leaderboard tabs, content is shown in bottom sheet — placeholder here */}
            {(tab === "chat" || tab === "vote" || tab === "contestants" || tab === "leaderboard") && (
              <Card title="Opening…">
                <p className="text-sm text-muted-foreground">This opens as a floating panel over the video. Tap the button below to reopen.</p>
                <button onClick={() => setSheet(tab as SheetId)} className="mt-3 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">Open panel</button>
              </Card>
            )}
          </section>
        </>
      )}

      {/* MINI player: show a lightweight browse area behind */}
      {mini && (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Continue browsing</h2>
            <Link to="/live" className="text-xs text-muted-foreground hover:text-foreground">All streams →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((a) => (
              <Link key={a.id} to="/gallery" className="group relative aspect-square overflow-hidden rounded-2xl">
                <img src={a.cover} alt={a.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs font-semibold text-white">{a.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM SHEET */}
      {sheet && (
        <BottomSheet onClose={() => setSheet(null)} title={sheetTitle(sheet)} landscape={landscape}>
          {sheet === "chat" && (
            <ChatPanel
              feed={feed} pinned={pinned} isMod={isMod} setIsMod={setIsMod} connected={connected}
              msg={msg} setMsg={setMsg} send={send} warning={warning}
              react={react} togglePin={togglePin} hide={hide}
              scrollRef={chatScrollRef} onScroll={() => { if (scrollTORef.current) clearTimeout(scrollTORef.current); scrollTORef.current = setTimeout(checkBottom, 80); }}
              hasNew={hasNew} setHasNew={setHasNew}
            />
          )}
          {sheet === "contestants" && <ContestantsPanel list={eventContestants.length ? eventContestants : contestants} />}
          {sheet === "vote" && <VotePanel list={eventContestants.length ? eventContestants : contestants} />}
          {sheet === "leaderboard" && <LeaderboardPanel list={leaderboard} />}
        </BottomSheet>
      )}
      <BottomNav pathname={pathname} />
    </div>
  );
}

// ============ Sub-components ============
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary">{title}</div>
      {children}
    </div>
  );
}

function sheetTitle(s: Exclude<SheetId, null>) {
  return s === "chat" ? "Live Chat" : s === "vote" ? "Cast your vote" : s === "contestants" ? "Contestants" : "Leaderboard";
}

function BottomSheet({ title, onClose, landscape, children }: { title: string; onClose: () => void; landscape: boolean; children: ReactNode }) {
  const startY = useRef<number | null>(null);
  const [dy, setDy] = useState(0);
  return (
    <div className={"fixed inset-x-0 bottom-0 z-[9999] " + (landscape ? "" : "")}>
      <div className="absolute inset-0 -z-10 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="mx-auto max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-t-3xl border border-white/10 bg-card/90 shadow-2xl backdrop-blur-2xl"
        style={{ transform: `translateY(${Math.max(0, dy)}px)`, transition: dy === 0 ? "transform .25s ease" : "none" }}
      >
        <div
          className="flex cursor-grab items-center justify-center py-2"
          onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
          onTouchMove={(e) => { if (startY.current != null) setDy(e.touches[0].clientY - startY.current); }}
          onTouchEnd={() => { if (dy > 100) onClose(); setDy(0); startY.current = null; }}
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full bg-secondary/70 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex max-h-[70vh] min-h-0 flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function ChatPanel(props: {
  feed: ChatMessage[]; pinned: ChatMessage[]; isMod: boolean; setIsMod: (b: boolean) => void; connected: boolean;
  msg: string; setMsg: (s: string) => void; send: () => void; warning: string | null;
  react: (id: string, e: string) => void; togglePin: (id: string, p: boolean) => void; hide: (id: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>; onScroll: () => void;
  hasNew: boolean; setHasNew: (b: boolean) => void;
}) {
  const { feed, pinned, isMod, setIsMod, connected, msg, setMsg, send, warning, react, togglePin, hide, scrollRef, onScroll, hasNew, setHasNew } = props;
  return (
    <>
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Wifi className={"size-3 " + (connected ? "text-success" : "text-muted-foreground")} />
          {connected ? "Realtime · synced" : "Connecting…"}
        </div>
        <button onClick={() => setIsMod(!isMod)} className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold " + (isMod ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground")}>
          <ShieldCheck className="size-3" /> Mod
        </button>
      </div>
      {pinned.length > 0 && (
        <div className="border-b border-border/60 bg-accent/10 px-5 py-3">
          {pinned.map((m) => (
            <div key={m.id} className="flex items-start gap-2 text-xs">
              <Pin className="mt-0.5 size-3 shrink-0 text-accent" />
              <div><span className={"mr-1 font-semibold " + m.color}>{m.user}:</span><span className="text-muted-foreground">{m.text}</span></div>
            </div>
          ))}
        </div>
      )}
      <div ref={scrollRef} onScroll={onScroll} className="relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-4 text-sm">
        {hasNew && (
          <button
            onClick={() => { const el = scrollRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); setHasNew(false); }}
            className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
          >
            <span className="inline-flex items-center gap-1"><ChevronDown className="size-3" /> New messages</span>
          </button>
        )}
        {feed.map((c) => (
          <div key={c.id} className="group leading-tight">
            <div>
              <span className={"mr-1 font-semibold " + c.color}>{c.user}
                {c.role === "official" && <span className="ml-1 rounded bg-success/20 px-1 text-[9px] uppercase text-success">Official</span>}
              :</span>
              <span className="text-muted-foreground">{c.text}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {Object.entries(c.reactions).map(([e, n]) => (
                <button key={e} onClick={() => react(c.id, e)} className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] hover:bg-secondary/70">
                  <span>{e}</span><span className="text-muted-foreground">{n}</span>
                </button>
              ))}
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                {REACTIONS.map((e) => (
                  <button key={e} onClick={() => react(c.id, e)} className="rounded-full px-1 text-xs hover:bg-secondary">{e}</button>
                ))}
              </div>
              {isMod && (
                <div className="ml-auto flex gap-1">
                  <button onClick={() => togglePin(c.id, !!c.pinned)} className="rounded-full bg-secondary p-1 text-[10px] hover:bg-secondary/70" title={c.pinned ? "Unpin" : "Pin"}>
                    {c.pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
                  </button>
                  <button onClick={() => hide(c.id)} className="rounded-full bg-destructive/10 p-1 text-destructive hover:bg-destructive/20" title="Delete">
                    <Trash2 className="size-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {warning && <div className="border-t border-destructive/30 bg-destructive/10 px-5 py-2 text-[11px] text-destructive">{warning}</div>}
      <div className="border-t border-border/60 p-3">
        <div className="mb-2 flex gap-1">
          {REACTIONS.map((e) => (
            <button key={e} onClick={() => { setMsg(e); send(); }} className="rounded-full bg-secondary px-2 py-1 text-sm hover:bg-secondary/70">{e}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Say something..." maxLength={240} className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="submit" className="grid size-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  );
}

function ContestantsPanel({ list }: { list: typeof contestants }) {
  return (
    <div className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3">
      {list.map((c) => (
        <div key={c.id} className="rounded-2xl border border-border/60 bg-background/50 p-3">
          <img src={c.photo} alt={c.name} className="mb-2 aspect-square w-full rounded-xl object-cover" />
          <div className="text-sm font-semibold">{c.name}</div>
          <div className="text-[11px] text-muted-foreground">{c.eventCategory}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{c.votes.toLocaleString()} votes</div>
        </div>
      ))}
    </div>
  );
}

function VotePanel({ list }: { list: typeof contestants }) {
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  return (
    <div className="min-h-0 space-y-2 overflow-y-auto p-5">
      {list.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-3">
          <img src={c.photo} alt={c.name} className="size-12 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{c.name}</div>
            <div className="text-[11px] text-muted-foreground">{c.eventCategory} · {c.votes.toLocaleString()} votes</div>
          </div>
          <button
            onClick={() => setVoted((v) => ({ ...v, [c.id]: !v[c.id] }))}
            className={"rounded-full px-3 py-1.5 text-xs font-semibold " + (voted[c.id] ? "bg-success text-success-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow")}
          >
            {voted[c.id] ? "Voted" : "Vote"}
          </button>
        </div>
      ))}
    </div>
  );
}

function LeaderboardPanel({ list }: { list: typeof contestants }) {
  return (
    <div className="min-h-0 space-y-2 overflow-y-auto p-5">
      {list.map((c, i) => (
        <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-3">
          <div className={"grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold " + (i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-slate-300 text-black" : i === 2 ? "bg-amber-600 text-white" : "bg-secondary text-muted-foreground")}>{i + 1}</div>
          <img src={c.photo} alt={c.name} className="size-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{c.name}</div>
            <div className="text-[11px] text-muted-foreground">{c.eventCategory}</div>
          </div>
          <div className="text-sm font-bold text-primary">{c.votes.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

// Silence unused warning; getChannel is public API surface for external tools.
export const _channel = getChannel;
