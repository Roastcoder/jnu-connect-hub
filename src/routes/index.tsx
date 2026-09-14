import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, MapPin, Sparkles, Users, Zap, QrCode, Award, Image as ImageIcon, Ticket, Radio, Trophy, Bell } from "lucide-react";
import { AppShell, QuickActionGrid } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { EventCard } from "@/components/EventCard";
import { events } from "@/lib/mock-data";
import { useAuth, useProfile } from "@/lib/auth";
import heroFest from "@/assets/hero-fest.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JNU Connect — Every Campus Event, One App" },
      {
        name: "description",
        content:
          "Register, get QR passes, browse the gallery and collect certificates — all your JNU events in one place.",
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

function Home() {
  const { user } = useAuth();
  const profile = useProfile();
  const featured = events.filter((e) => e.featured);
  const upcoming = events.slice(0, 4);

  const displayName = (() => {
    const raw =
      profile?.full_name?.trim() ||
      (user?.user_metadata as any)?.full_name?.trim() ||
      (user?.user_metadata as any)?.name?.trim() ||
      (user?.email ? user.email.split("@")[0] : "");
    if (!raw) return "there";
    // First name only for the greeting chip
    return raw.split(/\s+/)[0];
  })();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  return (
    <AppShell>

      {/* Hero */}
      <section className="relative -mx-4 mb-12 overflow-hidden rounded-none md:mx-0 md:rounded-3xl">
        <div className="relative">
          <img
            src={heroFest}
            alt="JNU campus fest"
            width={1920}
            height={1200}
            className="h-[320px] w-full object-cover md:h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/95" />
          <div className="absolute inset-0 bg-gradient-hero opacity-70 mix-blend-multiply" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <div className="max-w-2xl text-primary-foreground">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5" />
              Hello, {displayName} 👋 — {greeting}!
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              One app for every <span className="text-primary-glow">campus event.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-white/80 md:text-base">
              Register in seconds, get your QR pass, watch the gallery light up and collect certificates —
              from Technorazz to Freshers Night, JNU Connect has you covered.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-glow transition-transform hover:-translate-y-0.5"
              >
                Explore events <ArrowRight className="size-4" />
              </Link>
              {!user && (
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Create account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile app-style 2x2 dashboard */}
      <section className="mb-10 md:hidden">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Your dashboard</h2>
          <Link to="/events" className="text-xs font-semibold text-primary">See all →</Link>
        </div>
        <QuickActionGrid
          actions={[
            { to: "/events", label: "Browse Events", hint: `${events.length} live`, Icon: Ticket, tone: "primary" },
            { to: "/qr-pass", label: "My QR Pass", hint: "Ready to scan", Icon: QrCode, tone: "accent" },
            { to: "/live", label: "Watch Live", hint: "Streaming now", Icon: Radio, tone: "success" },
            { to: "/voting", label: "Vote & Rank", hint: "Vote your stars", Icon: Trophy, tone: "primary" },
          ]}
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link to="/certificates" className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-elevated">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"><Award className="size-4" /></div>
            <div><div className="text-xs font-semibold">Certificates</div><div className="text-[10px] text-muted-foreground">4 available</div></div>
          </Link>
          <Link to="/notifications" className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-elevated">
            <div className="grid size-10 place-items-center rounded-xl bg-secondary"><Bell className="size-4" /></div>
            <div><div className="text-xs font-semibold">Alerts</div><div className="text-[10px] text-muted-foreground">2 unread</div></div>
          </Link>
        </div>
      </section>


      {/* Feature strip (desktop) */}
      <section className="mb-14 hidden grid-cols-2 gap-3 md:grid md:grid-cols-4">
        {[
          { Icon: Zap, label: "Easy Registration" },
          { Icon: QrCode, label: "QR Pass & Tickets" },
          { Icon: Award, label: "Certificates" },
          { Icon: ImageIcon, label: "Gallery & Reels" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-elevated"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Icon className="size-4" />
            </div>
            <div className="text-sm font-medium">{label}</div>
          </div>
        ))}
      </section>

      {/* Featured banner */}
      {featured[0] && (
        <section className="mb-14">
          <FeaturedBanner event={featured[0]} />
        </section>
      )}

      {/* Upcoming events */}
      <section className="mb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Upcoming
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">Events you'll love</h2>
          </div>
          <Link to="/events" className="text-sm font-semibold text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="mb-16 grid gap-4 md:grid-cols-3">
        {[
          { title: "Inter-college participation open", body: "External students can now register in Technorazz sub-events." },
          { title: "Freshers Party dress code", body: "Formal / Ethnic. Entry closes 30 min after start." },
          { title: "Sports Meet rosters due", body: "Captains must submit team lists 48 hours before matchday." },
        ].map((a) => (
          <div
            key={a.title}
            className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elevated"
          >
            <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Announcement
            </div>
            <h3 className="mt-2 font-display text-base font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}

function FeaturedBanner({ event }: { event: (typeof events)[number] }) {
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group relative block overflow-hidden rounded-3xl shadow-elevated"
    >
      <img
        src={event.image}
        alt={event.name}
        loading="lazy"
        width={1200}
        height={800}
        className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-64"
      />
      <div className="absolute inset-0 bg-gradient-hero opacity-80 mix-blend-multiply" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground md:p-10">
        <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur">
          Featured Fest
        </div>
        <h3 className="font-display text-3xl font-bold md:text-5xl">{event.name}</h3>
        <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">{event.tagline}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs md:text-sm">
          <span className="flex items-center gap-1.5"><Calendar className="size-4" />28–30 Sept 2026</span>
          <span className="flex items-center gap-1.5"><MapPin className="size-4" />{event.venue}</span>
          <span className="flex items-center gap-1.5"><Users className="size-4" />{event.participants}</span>
        </div>
      </div>
    </Link>
  );
}
