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
  Code2,
  Gamepad2,
  Mic2,
  Ticket,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { EventCard } from "@/components/EventCard";
import { PosterPopupBanner, openPosterBanner } from "@/components/PosterPopupBanner";
import { syncEventsFromDb, events, type EventItem } from "@/lib/mock-data";
import { useAuth, useProfile } from "@/lib/auth";
import heroFest from "@/assets/hero-fest.jpg";
import hackathonImg from "@/assets/event-hackathon.jpg";
import culturalImg from "@/assets/event-cultural.jpg";
import sportsImg from "@/assets/event-sports.jpg";
import workshopImg from "@/assets/event-workshop.jpg";

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
  return <Home />;
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

  const categories = ["All", "Tech", "Cultural", "Sports", "Workshop"];

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
      date: "Tue, 29 Sept 2026",
      title: "Inauguration & In-House Tournaments",
      items: [
        { time: "10:30 AM", title: "Cyclothon & Walkathon", venue: "Plus Gate → SADTM Campus", badge: "In-House" },
        { time: "12:30 PM", title: "Devil's Circuit (Hurdle Race)", venue: "Medical Ground, IMSRC", badge: "Sports" },
        { time: "02:00 PM", title: "Live Band Performance", venue: "Main Campus", badge: "Cultural" },
        { time: "03:15 PM", title: "Gen Z JNU Talent Round", venue: "Central Ground, SADTM", badge: "Cultural" },
        { time: "04:15 PM", title: "Grand Inauguration Ceremony", venue: "Central Lawn, SADTM", badge: "Ceremony" },
        { time: "04:30 PM", title: "The Great Dance Challenge (In-House)", venue: "Central Lawn, SADTM", badge: "Dance" },
        { time: "06:30 PM", title: "Stage on Rage (In-House)", venue: "Central Lawn, SADTM", badge: "Fashion" },
      ],
    },
    {
      day: 2,
      date: "Wed, 30 Sept 2026",
      title: "Flagship Competitions & Musical Evening",
      items: [
        { time: "09:30 AM", title: "Hackathon 2026 (All Tracks)", venue: "MCA Block & Media Block, SADTM", badge: "Tech" },
        { time: "10:00 AM", title: "Chef in Making Culinary Challenge", venue: "HMCT Block, SADTM", badge: "Hospitality" },
        { time: "10:00 AM", title: "The Start-up Spirit (Shark Tank)", venue: "Auditorium, Engg Block", badge: "Management" },
        { time: "10:00 AM", title: "Game of Valor (Call of Duty)", venue: "Smart Classrooms, Engg Block", badge: "Esports" },
        { time: "01:00 PM", title: "Prompt Battle Royale & Cryptic Hunt", venue: "Computer Labs & MCA Block", badge: "AI & Tech" },
        { time: "02:30 PM", title: "The Influencer & Reel Rush Judgement", venue: "Filmtech Auditorium, Media Block", badge: "Media" },
        { time: "03:30 PM", title: "Tug of War (Faculty Tournament)", venue: "Central Lawn, SADTM", badge: "Faculty" },
        { time: "04:30 PM", title: "The Great Dance Challenge (Inter-Univ)", venue: "Central Lawn, SADTM", badge: "Dance" },
        { time: "06:20 PM", title: "Stage on Rage — Fashion Show (Inter-Univ)", venue: "Central Lawn, SADTM", badge: "Fashion" },
        { time: "07:45 PM", title: "Musical Evening — Ms. Snehi & Tej Gill", venue: "Central Lawn, SADTM", badge: "Concert" },
      ],
    },
    {
      day: 3,
      date: "Thu, 1 Oct 2026",
      title: "Grand Finale, Valedictory & Celebrity DJ Night",
      items: [
        { time: "10:00 AM", title: "Drone Race Championship", venue: "Central Lawn, SADTM", badge: "Aviation" },
        { time: "10:00 AM", title: "IoT Based Robotics Competition", venue: "Ground Floor, Engg Block", badge: "Robotics" },
        { time: "10:00 AM", title: "Mind Fest (General Quiz) & Ad-War", venue: "SIILAS Auditorium & Filmtech", badge: "Quiz & Media" },
        { time: "10:00 AM", title: "Escape Room (Forensic & Non-forensic)", venue: "Basement, Engg Block", badge: "Forensic" },
        { time: "01:00 PM", title: "Faculty Musical Chair & Student Tug of War", venue: "Central Lawn, SADTM", badge: "In-House" },
        { time: "03:00 PM", title: "Best Campus Fashion Icons (Faculty)", venue: "Central Lawn, SADTM", badge: "Fashion" },
        { time: "04:15 PM", title: "Valedictory Ceremony & Prize Distribution", venue: "Central Lawn, SADTM", badge: "Valedictory" },
        { time: "05:00 PM", title: "Celebrity Performance — Rishabh Chaturvedi & DJ Tan", venue: "Central Lawn, SADTM", badge: "Star Concert" },
        { time: "08:00 PM", title: "Mega DJ Night Finale", venue: "Central Lawn, SADTM", badge: "DJ Night" },
      ],
    },
  ];

  return (
    <AppShell>
      {/* Quick Navigation Stories */}
      <div className="mb-4 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {[
          { label: "Hackathon", image: hackathonImg, to: "/events", tag: "Tech" },
          { label: "Robotics", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop&q=80", to: "/events", tag: "IoT" },
          { label: "Drone Race", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300&h=300&fit=crop&q=80", to: "/events", tag: "Race" },
          { label: "Dance", image: culturalImg, to: "/events", tag: "Stage" },
          { label: "Fashion", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop&q=80", to: "/events", tag: "Ramp" },
          { label: "Star Night", image: heroFest, to: "/events", tag: "Concert" },
          { label: "Live Stage", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop&q=80", to: "/live", isLive: true, tag: "Live" },
          { label: "QR Pass", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=300&fit=crop&q=80", to: "/qr-pass", tag: "Entry" },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-all"
          >
            <div className="relative size-14 rounded-full p-0.5 ring-2 ring-slate-200 group-hover:ring-red-700 transition-all duration-200">
              <div className="size-full rounded-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.label}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {item.isLive && (
                <span className="absolute -top-0.5 -right-0.5 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3 bg-red-600 ring-2 ring-white" />
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium text-slate-800 group-hover:text-red-700 transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Official Image-Based Festival Banner (Mobile Optimized) */}
      <section className="relative mb-4">
        <div className="overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-sm transition-all">
          {/* Upper Side: High-Res Image Banner */}
          <div
            onClick={openPosterBanner}
            className="group relative w-full cursor-pointer overflow-hidden bg-slate-100 aspect-[16/10]"
          >
            <img
              src="/Technorazz-2026%20Poster.png"
              alt="Jaipur National University Technorazz 2026 Official Festival Poster"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
            
            {/* Top Expand Pill */}
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 border border-slate-200/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-md">
                <Sparkles className="size-3 text-amber-600" /> Expand 🔍
              </span>
            </div>
          </div>

          {/* Lower Side: Clean Light Information & Quick Action Bar */}
          <div className="border-t border-rose-100/80 bg-white p-3.5">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Technorazz 2026
              </span>
              <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                🏆 ₹5 Lakhs+ Prizes
              </span>
            </div>
            
            <h1 className="font-display text-base font-bold tracking-tight text-slate-900">
              Technorazz 2026 • Jaipur National University
            </h1>
            <p className="text-[12px] text-slate-500 mt-0.5 leading-tight">
              29 September – 1 October 2026 • Main, SADTM & SIILAS Campuses
            </p>

            {/* Action Buttons */}
            <div className="mt-3 flex items-center gap-2">
              <Link
                to="/events"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white py-2 text-xs font-semibold shadow-xs active:scale-95 transition-all"
              >
                Browse All Competitions <ArrowRight className="size-3.5" />
              </Link>
              <button
                onClick={openPosterBanner}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Eye className="size-3.5 text-slate-500" /> Poster
              </button>
              <Link
                to="/qr-pass"
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <QrCode className="size-3.5 text-slate-500" /> Pass
              </Link>
            </div>
          </div>
        </div>

        {/* Live Countdown Grid Underneath Banner */}
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {[
            { label: "Days", val: countdown.days },
            { label: "Hours", val: countdown.hours },
            { label: "Minutes", val: countdown.minutes },
            { label: "Seconds", val: countdown.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white py-2 px-1 shadow-2xs"
            >
              <span className="font-display text-base font-bold tracking-tight text-slate-900 tabular-nums">
                {String(item.val).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Shortcuts */}
      <section className="mb-6">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">Quick Access</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Quick Access 1: QR Ticket */}
          <Link
            to="/qr-pass"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition-all active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <QrCode className="size-4" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">Active</span>
            </div>
            <div className="mt-2.5">
              <div className="font-display text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                Digital Pass
              </div>
              <div className="text-[11px] text-slate-500">Scannable QR badge</div>
            </div>
          </Link>

          {/* Quick Access 2: Live Stream */}
          <Link
            to="/live"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition-all active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <Radio className="size-4" />
              </div>
              <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200/60">Live</span>
            </div>
            <div className="mt-2.5">
              <div className="font-display text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                Live Broadcast
              </div>
              <div className="text-[11px] text-slate-500">Central Lawn Stage</div>
            </div>
          </Link>

          {/* Quick Access 3: Voting & Ranks */}
          <Link
            to="/voting"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition-all active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <Trophy className="size-4" />
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">Polls</span>
            </div>
            <div className="mt-2.5">
              <div className="font-display text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                Live Voting
              </div>
              <div className="text-[11px] text-slate-500">Vote for contestants</div>
            </div>
          </Link>

          {/* Quick Access 4: Certificates */}
          <Link
            to="/certificates"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition-all active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <Award className="size-4" />
              </div>
              <ShieldCheck className="size-3.5 text-slate-400" />
            </div>
            <div className="mt-2.5">
              <div className="font-display text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                Certificates
              </div>
              <div className="text-[11px] text-slate-500">Verified e-certificates</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Celebrity Artists & Star Performances */}
      <section className="mb-8 rounded-xl bg-white p-4 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight text-slate-900">
              Star Performers & Musical Evenings
            </h2>
            <p className="text-[11px] text-slate-500">Evenings at Central Lawn, SADTM Campus</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {[
            {
              name: "Ms. Snehi & Tej Gill",
              role: "Musical Concert & Acoustic Set",
              date: "30 Sept • 7:45 PM",
              image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
            },
            {
              name: "Rishabh Chaturvedi",
              role: "Playback Singer & Celebrity Live",
              date: "1 Oct • 5:00 PM",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            },
            {
              name: "DJ Tan",
              role: "Grand Valedictory EDM Set",
              date: "1 Oct • 6:30 PM",
              image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400&h=400&fit=crop",
            },
          ].map((star) => (
            <div
              key={star.name}
              className="w-44 shrink-0 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-left transition-all"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2.5 bg-slate-200">
                <img
                  src={star.image}
                  alt={star.name}
                  className="size-full object-cover"
                />
              </div>
              <div className="font-display text-xs font-bold text-slate-900 truncate">
                {star.name}
              </div>
              <div className="text-[11px] text-slate-600 truncate mt-0.5">{star.role}</div>
              <div className="text-[10px] font-medium text-red-700 mt-1">{star.date}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Competitions & Events Filter Grid */}
      <section className="mb-10">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">
              Technorazz 2026 Competitions
            </h2>
            <p className="text-xs text-slate-500">Official university technical, cultural & sports events</p>
          </div>

          {/* Clean Segmented Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* 3-Day Fest Timeline Roadmap */}
      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Day-Wise Programme Schedule
            </h2>
            <p className="text-xs text-slate-500">29 September – 1 October 2026</p>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            {scheduleDays.map((s) => (
              <button
                key={s.day}
                onClick={() => setSelectedDay(s.day)}
                className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition-all ${
                  selectedDay === s.day
                    ? "bg-red-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Day {s.day} ({s.date.split(" ")[1]} {s.date.split(" ")[2]})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Timeline List */}
        <div className="space-y-2.5">
          {scheduleDays
            .find((s) => s.day === selectedDay)
            ?.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-3.5 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-red-700 min-w-[75px]">
                    <Clock className="size-3 text-red-600" />
                    {item.time}
                  </div>
                  <div>
                    <div className="font-display text-xs sm:text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-slate-400" /> {item.venue}
                    </div>
                  </div>
                </div>
                <span className="rounded-md bg-slate-200/70 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                  {item.badge}
                </span>
              </div>
            ))}
        </div>
      </section>

      {/* Official Conveners & Committee Contacts */}
      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="mb-4">
          <h2 className="font-display text-base font-bold tracking-tight text-slate-900">
            Key Event Conveners
          </h2>
          <p className="text-xs text-slate-500">Official faculty conveners appointed for Technorazz 2026</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Prof. Sudhir Kumar Sharma</div>
            <div className="text-[11px] text-slate-500 mt-0.5">IoT Robotics & Cryptic Hunt</div>
            <div className="text-[10px] font-medium text-red-700 mt-1">Convener</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Dr. (Mrs.) Preeti Bakshi</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dance Challenge & Stage on Rage</div>
            <div className="text-[10px] font-medium text-red-700 mt-1">Convener</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Prof. Rohit Singhal</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Hackathon 2026</div>
            <div className="text-[10px] font-medium text-red-700 mt-1">Convener</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Mr. Hitesh Kakkar</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Drone Race & Reel Rush</div>
            <div className="text-[10px] font-medium text-red-700 mt-1">Convener</div>
          </div>
        </div>
      </section>

      {/* Student Coordinators */}
      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="mb-4">
          <h2 className="font-display text-base font-bold tracking-tight text-slate-900">
            Student Coordinators
          </h2>
          <p className="text-xs text-slate-500">Official student lead committee for attendee support</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Mr. Durgesh Kumar</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Lead Student Coordinator</div>
            <a href="tel:8603933369" className="text-[10px] font-semibold text-red-700 mt-1 inline-block">8603 933 369</a>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Mr. Chandra Kant Mani</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Technical Operations</div>
            <a href="tel:9155256952" className="text-[10px] font-semibold text-red-700 mt-1 inline-block">9155 256 952</a>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Mr. Aryan Yadav</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Event Management</div>
            <a href="tel:9950414483" className="text-[10px] font-semibold text-red-700 mt-1 inline-block">9950 414 483</a>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="font-display text-xs font-bold text-slate-900">Mr. Aatman Pareek</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Student Registrations</div>
            <a href="tel:9929390806" className="text-[10px] font-semibold text-red-700 mt-1 inline-block">9929 390 806</a>
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
