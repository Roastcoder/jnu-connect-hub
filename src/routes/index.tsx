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
  Share2,
  Eye,
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

      {/* Official Image-Based Festival Banner (Image Upper Side & Light Theme) */}
      <section className="relative mb-8 sm:mb-10">
        <div className="overflow-hidden rounded-3xl border border-rose-100/90 bg-white shadow-elevated transition-all">
          {/* Upper Side: High-Res Image Banner */}
          <div
            onClick={openPosterBanner}
            className="group relative w-full cursor-pointer overflow-hidden bg-slate-50"
          >
            <img
              src="/Technorazz-2026%20Poster.png"
              alt="Jaipur National University Technorazz 2026 Official Festival Poster"
              className="w-full max-h-[360px] sm:max-h-[440px] md:max-h-[500px] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
            
            {/* Top Expand Pill */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-slate-200/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-md backdrop-blur-md hover:bg-white transition-all">
                <Sparkles className="size-3.5 text-amber-600" /> Tap to Expand 🔍
              </span>
            </div>
          </div>

          {/* Lower Side: Clean Light Information & Action Bar */}
          <div className="border-t border-rose-100/80 bg-white p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-xs font-bold text-rose-900">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Technorazz 2026
                  </span>
                  <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-bold">
                    🏆 ₹5 Lakhs+ Prize Pool
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    📅 29th Sept – 01st Oct 2026
                  </span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Jaipur National University Mega Festival
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Experience high-octane technical hackathons, cultural showcases, star celebrity concerts, and verified digital certifications.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-700 to-red-800 text-white px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold shadow-glow hover:brightness-105 active:scale-95 transition-all"
                >
                  Register for Events <ArrowRight className="size-4" />
                </Link>
                <button
                  onClick={openPosterBanner}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-rose-900 hover:bg-rose-100 active:scale-95 transition-all"
                >
                  <Eye className="size-4 text-primary" /> Full Poster
                </button>
                <Link
                  to="/qr-pass"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <QrCode className="size-4 text-primary" /> My Pass
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live Countdown Grid Underneath Banner */}
        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Days Left", val: countdown.days },
            { label: "Hours", val: countdown.hours },
            { label: "Minutes", val: countdown.minutes },
            { label: "Seconds", val: countdown.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white py-2 sm:py-2.5 px-2 shadow-sm"
            >
              <span className="font-display text-lg sm:text-2xl font-bold tracking-tight text-red-700 tabular-nums">
                {String(item.val).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>


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
            className="group relative block overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-elevated transition-transform hover:-translate-y-1"
          >
            <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden">
              <img
                src={featured[0].image}
                alt={featured[0].name}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider w-fit mb-2 shadow-sm">
                  ★ FEATURED SUMMIT
                </div>
                <h3 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  {featured[0].name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-100 line-clamp-2">
                  {featured[0].tagline}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-200">
                  <span className="flex items-center gap-1"><Calendar className="size-3.5 text-amber-300" /> 28–30 Sept 2026</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3.5 text-amber-300" /> {featured[0].venue}</span>
                  <span className="flex items-center gap-1"><Users className="size-3.5 text-amber-300" /> {featured[0].participants}</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* STAR-VIBES FOR YOU (Celebrity Lineup) */}
      <section className="mb-14 rounded-3xl bg-white p-6 sm:p-8 border border-rose-100 shadow-apple relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-red-600/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-amber-500/5 blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-900 mb-2">
                ★ STAR-VIBES FOR YOU
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Headline Artists & Performers
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Experience high-energy live concerts, acoustic sets, and star DJ nights across 3 days
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200/80 rounded-full px-3.5 py-1.5 w-fit">
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
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:bg-white hover:shadow-md"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={star.image}
                    alt={star.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 rounded-full bg-primary text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {star.tag}
                  </span>
                </div>
                <div className="font-display text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {star.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{star.role}</div>
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
