import { api } from "@/lib/api";
import { signCertificate, type CertPayload } from "@/lib/cert-crypto";

export type EventCategory =
  | "Tech"
  | "Cultural"
  | "Sports"
  | "Workshop"
  | "Freshers"
  | "Farewell"
  | "Alumni";

export interface SubEvent {
  id: string;
  name: string;
  description: string;
  fee: number;
}

export interface SpecialGuest {
  id: string;
  name: string;
  title: string;
  org?: string;
  photo: string;
  bio?: string;
}

export interface EventItem {
  id: string;
  name: string;
  tagline: string;
  category: EventCategory;
  image: string;
  startDate: string;
  endDate: string;
  venue: string;
  price: number;
  seatsLeft: number;
  prizePool?: string;
  participants?: string;
  description: string;
  rules: string[];
  schedule: { time: string; title: string }[];
  subEvents: SubEvent[];
  specialGuests?: SpecialGuest[];
  featured?: boolean;
}

// In-memory cache synced with database
export let events: EventItem[] = [];
export let contestants: Contestant[] = [];
export let liveStreams: (LiveStream & { youtubeId?: string })[] = [];
export let galleryAlbums: { id: string; title: string; count: number; cover: string }[] = [];
export let galleryVideos: { id: string; title: string; youtubeId: string; cover: string; duration: string }[] = [];
export let certificates: CertificateRecord[] = [];
export let notifications: { id: string; title: string; message: string; time: string; unread: boolean }[] = [];
export let alumni: AlumnusItem[] = [];
export let jobBoard: { id: string; title: string; company: string; location: string; type: string }[] = [];

export interface CertificateRecord {
  id: string;
  code: string;
  title: string;
  type: "Winner Certificate" | "Participation Certificate" | "Appreciation Certificate";
  date: string;
  issuedAt: string;
  holder: string;
  regId: string;
  event: string;
  position?: string;
  signature: string;
}

export type StreamStatus = "live" | "upcoming" | "ended";
export interface LiveStream {
  id: string;
  eventId: string;
  title: string;
  poster: string;
  status: StreamStatus;
  viewers: number;
  peakViewers: number;
  likes: number;
  startTime: string;
}

export interface Contestant {
  id: string;
  name: string;
  photo: string;
  college: string;
  department: string;
  event: string;
  eventCategory: string;
  bio: string;
  votes: number;
  trending?: boolean;
}

export interface AlumnusItem {
  id: string;
  name: string;
  photo: string;
  batch: string;
  course: string;
  role: string;
  company: string;
  city: string;
}

export const currentUser = {
  name: "Yogendra Singh",
  enrollment: "23BCA0123",
  course: "BCA",
  college: "Jaipur National University",
  email: "yogendra@jnu.ac.in",
  registrations: [
    { eventId: "technorazz-2026", subEvent: "Hackathon", status: "Confirmed", regId: "JNU2026TR01" },
  ],
};

/**
 * DB Sync Helpers
 */
export async function syncEventsFromDb(): Promise<EventItem[]> {
  try {
    const { data: dbEvents } = await api.from("events").select("*");
    const { data: dbSubs } = await api.from("sub_events").select("*");
    const { data: dbGuests } = await api.from("special_guests").select("*");

    if (Array.isArray(dbEvents) && dbEvents.length > 0) {
      events = dbEvents.map((e: any) => {
        const subs = Array.isArray(dbSubs)
          ? dbSubs
              .filter((s: any) => s.event_id === e.id)
              .map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description || "",
                fee: Number(s.fee || 0),
              }))
          : [];

        const guests = Array.isArray(dbGuests)
          ? dbGuests
              .filter((g: any) => g.event_id === e.id)
              .map((g: any) => ({
                id: g.id,
                name: g.name,
                title: g.title || "",
                org: g.bio || "",
                photo: g.photo || "",
                bio: g.bio || "",
              }))
          : [];

        return {
          id: e.id,
          name: e.name,
          tagline: e.tagline || "",
          category: (e.category as EventCategory) || "Tech",
          image: e.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
          startDate: e.start_date ? new Date(e.start_date).toISOString().split("T")[0] : "2026-09-29",
          endDate: e.end_date ? new Date(e.end_date).toISOString().split("T")[0] : "2026-10-01",
          venue: e.venue || "Jaipur National University",
          price: Number(e.price || 0),
          seatsLeft: Number(e.seats_left ?? 100),
          prizePool: e.prize_pool || "₹5,00,000+",
          participants: e.participants || "5000+",
          description: e.description || "",
          rules: Array.isArray(e.rules) ? e.rules : [],
          schedule: Array.isArray(e.schedule) ? e.schedule : [],
          subEvents: subs,
          specialGuests: guests,
          featured: Boolean(e.featured),
        };
      });
    }
  } catch (err) {
    console.error("Failed to sync events from DB:", err);
  }
  return events;
}

export async function syncContestantsFromDb(): Promise<Contestant[]> {
  try {
    const { data: dbContestants } = await api.from("contestants").select("*");
    if (Array.isArray(dbContestants) && dbContestants.length > 0) {
      contestants = dbContestants.map((c: any) => ({
        id: c.id,
        name: c.name,
        photo: c.photo || `https://i.pravatar.cc/400?u=${c.name}`,
        college: c.college || "Jaipur National University",
        department: c.department || "General",
        event: c.event_id || "Technorazz 2026",
        eventCategory: c.event_category || "Main",
        bio: c.bio || "",
        votes: Number(c.votes_count || 0),
        trending: Boolean(c.trending),
      }));
    }
  } catch (err) {
    console.error("Failed to sync contestants from DB:", err);
  }
  return contestants;
}

export async function syncLiveStreamsFromDb(): Promise<LiveStream[]> {
  try {
    const { data: dbStreams } = await api.from("live_streams").select("*");
    if (Array.isArray(dbStreams) && dbStreams.length > 0) {
      liveStreams = dbStreams.map((s: any) => ({
        id: s.id,
        eventId: s.event_id || "technorazz-2026",
        title: s.title,
        poster: s.poster || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
        status: (s.status as StreamStatus) || "upcoming",
        viewers: Number(s.viewers || 0),
        peakViewers: Number(s.peak_viewers || 0),
        likes: Number(s.likes || 0),
        startTime: s.scheduled_at || new Date().toISOString(),
        youtubeId: s.youtube_id || "",
      }));
    }
  } catch (err) {
    console.error("Failed to sync live streams from DB:", err);
  }
  return liveStreams;
}

export async function syncGalleryFromDb() {
  try {
    const { data: dbGallery } = await api.from("gallery").select("*");
    if (Array.isArray(dbGallery) && dbGallery.length > 0) {
      galleryAlbums = dbGallery.map((g: any) => ({
        id: g.id,
        title: g.title,
        count: Number(g.count || 50),
        cover: g.cover || g.image_url,
      }));
      galleryVideos = dbGallery
        .filter((g: any) => Boolean(g.youtube_id))
        .map((g: any) => ({
          id: g.id,
          title: g.title,
          youtubeId: g.youtube_id,
          cover: g.cover || g.image_url,
          duration: g.duration || "4:00",
        }));
    }
  } catch (err) {
    console.error("Failed to sync gallery from DB:", err);
  }
}

export async function syncCertificatesFromDb(): Promise<CertificateRecord[]> {
  try {
    const { data: dbCerts } = await api.from("certificates").select("*");
    if (Array.isArray(dbCerts) && dbCerts.length > 0) {
      certificates = dbCerts.map((c: any) => ({
        id: c.id,
        code: c.code,
        title: c.title || c.event_name || "Technorazz Certificate",
        type: (c.kind as any) || "Participation Certificate",
        date: c.issued_at ? new Date(c.issued_at).toLocaleDateString("en-IN") : "Oct 2026",
        issuedAt: c.issued_at || new Date().toISOString(),
        holder: c.recipient_name,
        regId: c.reg_id || "JNU2026TR01",
        event: c.event_name || "Technorazz 2026",
        position: c.position,
        signature: c.signature || "ed25519-valid",
      }));
    }
  } catch (err) {
    console.error("Failed to sync certificates from DB:", err);
  }
  return certificates;
}

export async function syncNotificationsFromDb() {
  try {
    const { data: dbNotifs } = await api.from("notifications").select("*");
    if (Array.isArray(dbNotifs) && dbNotifs.length > 0) {
      notifications = dbNotifs.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.body || n.message,
        time: n.time || "Recently",
        unread: Boolean(n.unread),
      }));
    }
  } catch (err) {
    console.error("Failed to sync notifications from DB:", err);
  }
}

export async function syncAlumniFromDb() {
  try {
    const { data: dbAlumni } = await api.from("alumni").select("*");
    const { data: dbJobs } = await api.from("jobs").select("*");

    if (Array.isArray(dbAlumni) && dbAlumni.length > 0) {
      alumni = dbAlumni.map((a: any) => ({
        id: a.id,
        name: a.name,
        photo: a.photo || `https://i.pravatar.cc/300?u=${a.name}`,
        batch: a.batch || "2024",
        course: a.course || "B.Tech",
        role: a.role || "Software Engineer",
        company: a.company || "Google",
        city: a.city || "Jaipur",
      }));
    }

    if (Array.isArray(dbJobs) && dbJobs.length > 0) {
      jobBoard = dbJobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        type: j.type || "Full-time",
      }));
    }
  } catch (err) {
    console.error("Failed to sync alumni/jobs from DB:", err);
  }
}

// Kick off initial sync immediately in browser
if (typeof window !== "undefined") {
  syncEventsFromDb();
  syncContestantsFromDb();
  syncLiveStreamsFromDb();
  syncGalleryFromDb();
  syncCertificatesFromDb();
  syncNotificationsFromDb();
  syncAlumniFromDb();
}

export function getEvent(id: string): EventItem | undefined {
  return events.find((e) => e.id === id);
}

export function getStream(id: string): (LiveStream & { youtubeId?: string }) | undefined {
  return liveStreams.find((s) => s.id === id);
}

export function getContestant(id: string): Contestant | undefined {
  return contestants.find((c) => c.id === id);
}

export function verifyCertificate(code: string): CertificateRecord | null {
  const c = code.trim().toUpperCase();
  return certificates.find((x) => x.code.toUpperCase() === c) ?? null;
}
