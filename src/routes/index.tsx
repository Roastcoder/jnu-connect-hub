import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Zap,
  QrCode,
  Award,
  Radio,
  Trophy,
  ChevronRight,
  Clock,
  Flame,
  ShieldCheck,
  FileText,
  Download,
  Share2
} from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { EventCard } from "@/components/EventCard";
import { PosterPopupBanner, openPosterBanner } from "@/components/PosterPopupBanner";
import { syncEventsFromDb, events, type EventItem } from "@/lib/mock-data";
import { useAuth, useProfile } from "@/lib/auth";
import heroFest from "@/assets/hero-fest.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JNU Connect — Technorazz 2026 Event Platform" },
      {
        name: "description",
        content:
          "Register, get QR passes, vote for contestants, watch live streams and collect certificates for Technorazz 2026 at Jaipur National University.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AuthGuard>
      <Home />
    </AuthGuard>
  );
}

// Target: Sept 29, 2026 09:00 AM IST (Official Technorazz 2026 Kickoff)
const FEST_TARGET_TIMESTAMP = new Date("2026-09-29T09:00:00+05:30").getTime();

function useCountdown(targetTimestamp: number = FEST_TARGET_TIMESTAMP) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = targetTimestamp - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return timeLeft;
}

function Home() {
  const { user } = useAuth();
  const profile = useProfile();
  const [eventList, setEventList] = useState<EventItem[]>(events);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const countdown = useCountdown(FEST_TARGET_TIMESTAMP);

  useEffect(() => {
    syncEventsFromDb().then((data) => {
      if (data && data.length > 0) setEventList(data);
    });
  }, []);

  const categories = ["All", "Tech", "Cultural", "Sports", "Workshop", "Freshers"];

  const filteredEvents =
    selectedCategory === "All"
      ? eventList
      : eventList.filter(
          (e) => e.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const featured = eventList.filter((e) => e.featured);

  const displayName = (() => {
    const raw =
      profile?.full_name?.trim() ||
      user?.profile?.full_name?.trim() ||
      user?.full_name?.trim() ||
      (user?.email ? user.email.split("@")[0] : "");
    if (!raw) return "Student";
    return raw.split(/\s+/)[0];
  })();

  const scheduleDays = [
    {
      day: 1,
      date: "Mon, Sept 28",
      title: "Inauguration & Tech Summit",
      items: [
        { time: "09:30 AM", title: "Grand Opening & Lighting of Lamp", venue: "Main Auditorium", badge: "Ceremony" },
        { time: "11:00 AM", title: "24-Hour Hackathon Kickoff", venue: "SILAS Tech Hub", badge: "Technical" },
        { time: "02:00 PM", title: "Robo-Wars & Drone Racing Arena", venue: "Open Ground B", badge: "Robotics" },
        { time: "06:00 PM", title: "Band Symphony & Unplugged Eve", venue: "Central Amphitheatre", badge: "Cultural" },
      ],
    },
    {
      day: 2,
      date: "Tue, Sept 29",
      title: "Cultural & Creative Fest",
      items: [
        { time: "10:00 AM", title: "National Debate & Shark Tank Pitch", venue: "Conference Hall 1", badge: "Management" },
        { time: "11:30 AM", title: "Esports Arena (Valorant & BGMI)", venue: "Gaming Lab 3", badge: "Gaming" },
        { time: "03:00 PM", title: "Fashion Extravaganza 'Vogue JNU'", venue: "Main Stage", badge: "Cultural" },
        { time: "07:00 PM", title: "EDM Fusion & DJ Night", venue: "Fest Ground", badge: "Star Event" },
      ],
    },
    {
      day: 3,
      date: "Wed, Sept 30",
      title: "Grand Finale & Star Celebrity Night",
      items: [
        { time: "10:00 AM", title: "Hackathon Demos & Jury Grand Defense", venue: "SILAS Auditorium", badge: "Finale" },
        { time: "02:00 PM", title: "Annual Prize Distribution & Trophies", venue: "Main Auditorium", badge: "Valedictory" },
        { time: "06:30 PM", title: "Celebrity Artist Musical Concert", venue: "Main Stadium Ground", badge: "Celebrity Night" },
      ],
    },
  ];

  return (
    <AppShell>
      {/* Official Poster Popup Banner Component */}
      <PosterPopupBanner />

      {/* Apple-style Keynote Hero */}
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-white/10">
        {/* Ambient Backlight Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-96 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 md:p-12 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Live Campus Pill */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold backdrop-blur-md w-fit">
                <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-white/90">Technorazz 2026 • Sept 29–Oct 01</span>
              </div>

              <button
                onClick={openPosterBanner}
                className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-300 backdrop-blur-md hover:bg-pink-500/20 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="size-3 text-pink-400" /> Official Poster 📄
              </button>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
              The Grand <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                National Fest.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Welcome back, <span className="text-white font-semibold">{displayName}</span>! Experience 3 days of high-octane technical summits, cultural showcases, esports championships, star-vibes celebrity nights, and verified digital certifications.
            </p>

            {/* Live Countdown Grid */}
            <div className="mt-6 flex items-center gap-2 sm:gap-3">
              {[
                { label: "Days", val: countdown.days },
                { label: "Hours", val: countdown.hours },
                { label: "Mins", val: countdown.minutes },
                { label: "Secs", val: countdown.seconds },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md min-w-[62px] sm:min-w-[72px]"
                >
                  <span className="font-display text-lg sm:text-2xl font-bold tracking-tight text-white tabular-nums">
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-xs sm:text-sm font-bold shadow-lg transition-all duration-200 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
              >
                Register for Events <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={openPosterBanner}
                className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/20 px-5 py-3 text-xs sm:text-sm font-bold text-pink-200 backdrop-blur-md transition-all duration-200 hover:bg-pink-500/30 active:scale-[0.98]"
              >
                <Sparkles className="size-4 text-pink-400" /> View Poster
              </button>
              <Link
                to="/qr-pass"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
              >
                <QrCode className="size-4" /> My Pass
              </Link>
            </div>
          </div>

          {/* Right Visual Card - Interactive Poster Card */}
          <div className="lg:col-span-5 relative">
            <div
              onClick={openPosterBanner}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl group cursor-pointer"
            >
              <img
                src="/image.png"
                alt="JNU Technorazz 2026 Official Poster"
                className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-1 rounded-full bg-pink-500 text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1.5 shadow-sm">
                  <Sparkles className="size-3" /> Click to Expand Poster
                </div>
                <div className="font-display text-base font-bold text-white">Technorazz 2026 Official Brochure</div>
                <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                  <span>📍 Main Campus, Jaipur</span>
                  <span className="font-semibold text-emerald-400">₹5 Lakhs+ Prizes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Ticker */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-2 shadow-apple">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-3 text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary font-bold px-2.5 py-1 shrink-0 text-[11px]">
            <Zap className="size-3.5" /> LIVE UPDATES
          </div>
          <div className="flex items-center gap-6 text-muted-foreground shrink-0 font-medium">
            <span className="flex items-center gap-1.5">
              🏆 <strong className="text-foreground">₹5 Lakhs</strong> Prize Pool for 2026 Competitions
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              ⚡ <strong className="text-foreground">24-Hr Hackathon</strong> registrations closing in 3 days
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              🎤 <strong className="text-foreground">Celebrity Star Night</strong> artist reveal on Day 2
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              🎟️ <strong className="text-foreground">Digital QR Ticket</strong> mandatory for campus entrance
            </span>
          </div>
        </div>
      </div>

      {/* Student Quick Hub (Apple Bento Grid) */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Student Hub</h2>
            <p className="text-xs text-muted-foreground">Instant access to your festival pass, voting, and broadcasts</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Bento 1: QR Ticket */}
          <Link
            to="/qr-pass"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 sm:p-5 shadow-apple transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-11 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <QrCode className="size-5" />
              </div>
              <span className="flex size-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-4">
              <div className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                My QR Pass
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Ready for fast campus entry</div>
            </div>
          </Link>

          {/* Bento 2: Live Stream */}
          <Link
            to="/live"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 sm:p-5 shadow-apple transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-11 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <Radio className="size-5" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-600 px-1.5 py-0.5 text-[9px] font-bold">
                REC
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Live Broadcast
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Main stage 4K streaming</div>
            </div>
          </Link>

          {/* Bento 3: Voting & Ranks */}
          <Link
            to="/voting"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 sm:p-5 shadow-apple transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-11 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Trophy className="size-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-600">LIVE</span>
            </div>
            <div className="mt-4">
              <div className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Vote & Rank
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Live audience score tally</div>
            </div>
          </Link>

          {/* Bento 4: Certificates */}
          <Link
            to="/certificates"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-4 sm:p-5 shadow-apple transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Award className="size-5" />
              </div>
              <ShieldCheck className="size-4 text-emerald-500" />
            </div>
            <div className="mt-4">
              <div className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Certificates
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Digitally signed & verified</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Flagship Fest Banner Card */}
      {featured[0] && (
        <section className="mb-14">
          <Link
            to="/events/$eventId"
            params={{ eventId: featured[0].id }}
            className="group relative block overflow-hidden rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-slate-950 text-white shadow-2xl"
          >
            <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden">
              <img
                src={featured[0].image}
                alt={featured[0].name}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 w-fit mb-2">
                  ★ FEATURED SUMMIT
                </div>
                <h3 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {featured[0].name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2">
                  {featured[0].tagline}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1"><Calendar className="size-3.5 text-primary-glow" /> 28–30 Sept 2026</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3.5 text-primary-glow" /> {featured[0].venue}</span>
                  <span className="flex items-center gap-1"><Users className="size-3.5 text-primary-glow" /> {featured[0].participants}</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* STAR-VIBES FOR YOU (Celebrity Lineup) */}
      <section className="mb-14 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 p-6 sm:p-8 text-white border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-purple-500/20 blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/20 border border-pink-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-300 mb-2">
                ★ STAR-VIBES FOR YOU
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Headline Artists & Performers
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
                Experience high-energy live concerts, acoustic sets, and star DJ nights across 3 days
              </p>
            </div>
            <span className="text-xs font-semibold text-pink-300 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-md w-fit">
              📍 Main Stage & Fest Arena
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Tej Gill",
                role: "Celebrity Singer & Performer",
                tag: "Star Night",
                image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
              },
              {
                name: "DJ Tan",
                role: "Celebrity DJ & Producer",
                tag: "EDM Fusion",
                image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400&h=400&fit=crop",
              },
              {
                name: "Snehi Live",
                role: "Acoustic Singer & Guitarist",
                tag: "Unplugged Eve",
                image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
              },
              {
                name: "Rishabh Chaturvedi",
                role: "Bollywood Playback Singer",
                tag: "Grand Finale",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
              },
            ].map((star) => (
              <div
                key={star.name}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/40 hover:bg-white/10"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={star.image}
                    alt={star.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 rounded-full bg-pink-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {star.tag}
                  </span>
                </div>
                <div className="font-display text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                  {star.name}
                </div>
                <div className="text-[11px] text-purple-200/70 mt-0.5">{star.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitions & Events Filter Grid */}
      <section className="mb-14">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Discover</div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Official Competitions & Summits
            </h2>
          </div>

          {/* Apple-style Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar rounded-full bg-slate-100 dark:bg-zinc-900 p-1 border border-black/[0.04] dark:border-white/[0.05]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* 3-Day Fest Timeline Roadmap */}
      <section className="mb-14 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-6 sm:p-8 shadow-apple">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Schedule Roadmap</div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              3-Day Festival Highlights
            </h2>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-zinc-900 p-1 border border-black/[0.04]">
            {scheduleDays.map((s) => (
              <button
                key={s.day}
                onClick={() => setSelectedDay(s.day)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedDay === s.day
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Day {s.day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Timeline List */}
        <div className="space-y-3">
          {scheduleDays
            .find((s) => s.day === selectedDay)
            ?.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-slate-50/70 dark:bg-zinc-900/50 p-3.5 sm:p-4 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary min-w-[70px]">
                    <Clock className="size-3.5" />
                    {item.time}
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" /> {item.venue}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {item.badge}
                </span>
              </div>
            ))}
        </div>
      </section>

      {/* Official Coordinators & Contact Grid */}
      <section className="mb-14 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-card p-6 sm:p-8 shadow-apple">
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Need Help?</div>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Official Festival Coordinators
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Reach out to our event & student conveners for queries or guidelines</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Faculty Coordinators */}
          <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-slate-50/80 dark:bg-zinc-900/50 p-4 sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Event Faculty Coordinators</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-sm font-bold text-foreground">Prof. Sudhir Sharma</div>
                  <div className="text-xs text-muted-foreground">Event Convener</div>
                </div>
                <a
                  href="tel:8875020636"
                  className="rounded-full bg-white dark:bg-zinc-800 border border-black/[0.06] px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  📞 8875 020 636
                </a>
              </div>
              <div className="flex items-center justify-between border-t border-black/[0.04] pt-2">
                <div>
                  <div className="font-display text-sm font-bold text-foreground">Ms. Shanu Bhatia</div>
                  <div className="text-xs text-muted-foreground">Co-Convener</div>
                </div>
                <a
                  href="tel:8823999219"
                  className="rounded-full bg-white dark:bg-zinc-800 border border-black/[0.06] px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  📞 8823 999 219
                </a>
              </div>
            </div>
          </div>

          {/* Student Coordinators */}
          <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-slate-50/80 dark:bg-zinc-900/50 p-4 sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Student Coordinators</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between sm:flex-col sm:items-start p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.04]">
                <div>
                  <div className="font-display text-xs font-bold text-foreground">Mr. Durgesh Kumar</div>
                  <div className="text-[10px] text-muted-foreground">Lead Coordinator</div>
                </div>
                <a href="tel:8603933369" className="text-[11px] font-semibold text-primary mt-1">8603 933 369</a>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.04]">
                <div>
                  <div className="font-display text-xs font-bold text-foreground">Mr. Chandra Kant Mani</div>
                  <div className="text-[10px] text-muted-foreground">Coordinator</div>
                </div>
                <a href="tel:9155256952" className="text-[11px] font-semibold text-primary mt-1">9155 256 952</a>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.04]">
                <div>
                  <div className="font-display text-xs font-bold text-foreground">Mr. Aryan Yadav</div>
                  <div className="text-[10px] text-muted-foreground">Coordinator</div>
                </div>
                <a href="tel:9950414483" className="text-[11px] font-semibold text-primary mt-1">9950 414 483</a>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.04]">
                <div>
                  <div className="font-display text-xs font-bold text-foreground">Mr. Aatman Pareek</div>
                  <div className="text-[10px] text-muted-foreground">Coordinator</div>
                </div>
                <a href="tel:9929390806" className="text-[11px] font-semibold text-primary mt-1">9929 390 806</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Guidelines & Document Vault */}
      <section className="mb-12 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-slate-100/70 dark:bg-zinc-900/40 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-sm">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-foreground">
                Technorazz 2026 Official Document Vault
              </div>
              <div className="text-xs text-muted-foreground">
                Jaipur National University, Jaipur – Agra By-Pass, Jagatpura, Jaipur – 302017
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to="/help"
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-slate-50 transition-colors"
            >
              <Download className="size-3.5" /> Rulebook PDF
            </Link>
            <Link
              to="/events"
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
            >
              Register Now <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
