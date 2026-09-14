import hackathon from "@/assets/event-hackathon.jpg";
import freshers from "@/assets/event-freshers.jpg";
import sports from "@/assets/event-sports.jpg";
import cultural from "@/assets/event-cultural.jpg";
import workshop from "@/assets/event-workshop.jpg";
import farewell from "@/assets/event-farewell.jpg";

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
  org: string;
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

export const events: EventItem[] = [
  {
    id: "technorazz-2026",
    name: "TECHNORAZZ 2026",
    tagline: "Ignite Innovation. Celebrate Creativity. Compete with the Best.",
    category: "Tech",
    image: hackathon,
    startDate: "2026-09-28",
    endDate: "2026-09-30",
    venue: "Main Ground, JNU",
    price: 500,
    seatsLeft: 120,
    prizePool: "₹50,000",
    participants: "250+",
    description:
      "Technorazz is the annual techno-cultural fest of Jaipur National University. A platform to showcase innovation, talent and creativity across engineering, design and performing arts.",
    rules: [
      "Participants must carry a valid college ID.",
      "Registration is mandatory for every sub-event.",
      "Judges' decision will be final and binding.",
      "Any form of misconduct leads to disqualification.",
    ],
    schedule: [
      { time: "Day 1 · 10:00 AM", title: "Inauguration & Keynote" },
      { time: "Day 1 · 02:00 PM", title: "Hackathon Round 1" },
      { time: "Day 2 · 11:00 AM", title: "Robotics & AI Competition" },
      { time: "Day 3 · 07:00 PM", title: "Closing Ceremony + DJ Night" },
    ],
    subEvents: [
      { id: "hackathon", name: "Hackathon", description: "24-hour coding marathon", fee: 300 },
      { id: "bgmi", name: "BGMI Tournament", description: "Squad-mode battle royale", fee: 200 },
      { id: "robotics", name: "Robotics", description: "Build & battle robots", fee: 400 },
      { id: "ai", name: "AI Competition", description: "Solve real-world ML challenges", fee: 250 },
      { id: "photo", name: "Photography Contest", description: "Capture the fest", fee: 150 },
      { id: "webdesign", name: "Web Design Battle", description: "6-hour design sprint", fee: 200 },
    ],
    specialGuests: [
      { id: "sg-trz-1", name: "Dr. Anand Deshpande", title: "Founder & Chairman", org: "Persistent Systems", photo: "https://i.pravatar.cc/400?u=anand-deshpande", bio: "Padma Shri awardee, IIT-IIM alumnus and evangelist of Indian software." },
      { id: "sg-trz-2", name: "Ritu Karidhal", title: "ISRO Scientist · Rocket Woman of India", org: "ISRO", photo: "https://i.pravatar.cc/400?u=ritu-karidhal", bio: "Deputy Operations Director of Mangalyaan and Chandrayaan-2." },
      { id: "sg-trz-3", name: "Ankur Warikoo", title: "Entrepreneur & Author", org: "webveda", photo: "https://i.pravatar.cc/400?u=ankur-warikoo", bio: "Bestselling author of Do Epic Shit." },
    ],
    featured: true,
  },
  {
    id: "freshers-2026",
    name: "Freshers Party 2026",
    tagline: "Welcome the new stars of JNU.",
    category: "Freshers",
    image: freshers,
    startDate: "2026-08-20",
    endDate: "2026-08-20",
    venue: "JNU Auditorium",
    price: 250,
    seatsLeft: 85,
    prizePool: "Titles & Sashes",
    participants: "180+",
    description:
      "An unforgettable evening welcoming the freshers to the JNU family with performances, competitions and a live DJ.",
    rules: [
      "Open to first-year students only.",
      "Dress code: Formal / Ethnic.",
      "Entry closes 30 minutes after start.",
    ],
    schedule: [
      { time: "06:00 PM", title: "Welcome & Introductions" },
      { time: "07:00 PM", title: "Mr & Ms Fresher Rounds" },
      { time: "09:00 PM", title: "Talent Hunt Finale" },
      { time: "10:30 PM", title: "DJ Night" },
    ],
    subEvents: [
      { id: "mr", name: "Mr Fresher", description: "Personality contest", fee: 100 },
      { id: "ms", name: "Ms Fresher", description: "Personality contest", fee: 100 },
      { id: "dance", name: "Dance Competition", description: "Solo & group", fee: 150 },
      { id: "sing", name: "Singing Competition", description: "Solo performance", fee: 150 },
      { id: "talent", name: "Talent Hunt", description: "Show your spark", fee: 100 },
    ],
    specialGuests: [
      { id: "sg-fr-1", name: "Shirley Setia", title: "Playback Singer & Actor", org: "Bollywood", photo: "https://i.pravatar.cc/400?u=shirley-setia", bio: "Chart-topping singer joining as the celebrity guest." },
      { id: "sg-fr-2", name: "Bhuvan Bam", title: "Creator & Musician", org: "BB Ki Vines", photo: "https://i.pravatar.cc/400?u=bhuvan-bam", bio: "Award-winning content creator and singer-songwriter." },
    ],
    featured: true,
  },
  {
    id: "sports-2026",
    name: "Sports Meet 2026",
    tagline: "Fair play. Fierce spirit. One JNU.",
    category: "Sports",
    image: sports,
    startDate: "2026-10-10",
    endDate: "2026-10-14",
    venue: "Sports Ground, JNU",
    price: 100,
    seatsLeft: 0,
    prizePool: "Trophies & Medals",
    participants: "600+",
    description:
      "Five days of adrenaline across cricket, football, basketball, volleyball, chess and badminton.",
    rules: [
      "Team captains must submit rosters 48h before the event.",
      "Sports kit and shoes are mandatory.",
      "Referee decisions are final.",
    ],
    schedule: [
      { time: "Day 1", title: "Cricket & Football Openers" },
      { time: "Day 2", title: "Basketball & Volleyball" },
      { time: "Day 3", title: "Chess & Badminton" },
      { time: "Day 5", title: "Finals & Prize Distribution" },
    ],
    subEvents: [
      { id: "cricket", name: "Cricket", description: "T10 format", fee: 500 },
      { id: "football", name: "Football", description: "7-a-side", fee: 500 },
      { id: "basketball", name: "Basketball", description: "5-on-5", fee: 400 },
      { id: "chess", name: "Chess", description: "Swiss rounds", fee: 100 },
      { id: "volleyball", name: "Volleyball", description: "6-a-side", fee: 400 },
      { id: "badminton", name: "Badminton", description: "Singles & doubles", fee: 150 },
    ],
    specialGuests: [
      { id: "sg-sp-1", name: "Kapil Dev", title: "Cricket Legend · 1983 WC Winning Captain", org: "BCCI", photo: "https://i.pravatar.cc/400?u=kapil-dev", bio: "Chief guest for the opening ceremony." },
      { id: "sg-sp-2", name: "P.V. Sindhu", title: "Olympic Medallist · Badminton", org: "Team India", photo: "https://i.pravatar.cc/400?u=pv-sindhu", bio: "Guest of honour for badminton finals." },
    ],
    featured: true,
  },
  {
    id: "cultural-fest-2026",
    name: "Rang Cultural Fest 2026",
    tagline: "Colours, rhythms and stories of India.",
    category: "Cultural",
    image: cultural,
    startDate: "2026-11-05",
    endDate: "2026-11-07",
    venue: "Open Air Theatre, JNU",
    price: 200,
    seatsLeft: 300,
    prizePool: "₹25,000",
    participants: "400+",
    description:
      "A three-day celebration of dance, drama, music and folk traditions from across India.",
    rules: ["Traditional attire encouraged.", "Group performers must register together."],
    schedule: [
      { time: "Day 1", title: "Classical Night" },
      { time: "Day 2", title: "Drama & Poetry" },
      { time: "Day 3", title: "Folk & Fusion Finale" },
    ],
    subEvents: [
      { id: "classical", name: "Classical Dance", description: "Solo / group", fee: 150 },
      { id: "drama", name: "Stage Drama", description: "15 min act", fee: 200 },
      { id: "music", name: "Band Performance", description: "Live band", fee: 250 },
    ],
  },
  {
    id: "ai-workshop",
    name: "AI & LLM Workshop",
    tagline: "Build production-ready AI apps in a weekend.",
    category: "Workshop",
    image: workshop,
    startDate: "2026-09-05",
    endDate: "2026-09-06",
    venue: "Lab Block, JNU",
    price: 350,
    seatsLeft: 40,
    participants: "60 seats",
    description:
      "Hands-on 2-day workshop covering prompt engineering, RAG systems and deploying LLM apps.",
    rules: ["Bring your own laptop.", "Basic Python knowledge required."],
    schedule: [
      { time: "Day 1 · 10:00 AM", title: "Foundations & Prompting" },
      { time: "Day 1 · 02:00 PM", title: "Retrieval Augmented Generation" },
      { time: "Day 2 · 10:00 AM", title: "Fine-tuning & Deployment" },
    ],
    subEvents: [
      { id: "prompt", name: "Prompt Engineering", description: "Practical lab", fee: 0 },
      { id: "rag", name: "RAG Systems", description: "Build a knowledge bot", fee: 0 },
    ],
  },
  {
    id: "farewell-2026",
    name: "Alvida - Farewell 2026",
    tagline: "One last night. A thousand memories.",
    category: "Farewell",
    image: farewell,
    startDate: "2026-05-15",
    endDate: "2026-05-15",
    venue: "Grand Hall, JNU",
    price: 400,
    seatsLeft: 0,
    participants: "Final year only",
    description: "A memorable evening honouring the graduating batch of 2026.",
    rules: ["Final-year students only.", "Dress code: Formal."],
    schedule: [
      { time: "07:00 PM", title: "Welcome & Awards" },
      { time: "09:00 PM", title: "Performances" },
      { time: "10:30 PM", title: "Farewell Toast" },
    ],
    subEvents: [],
  },
];

export function getEvent(id: string) {
  return events.find((e) => e.id === id);
}

export const galleryAlbums = [
  { id: "technorazz-2025", title: "Technorazz 2025", count: 120, cover: hackathon },
  { id: "freshers-2025", title: "Freshers Party 2025", count: 85, cover: freshers },
  { id: "sports-2025", title: "Sports Meet 2025", count: 67, cover: sports },
  { id: "hackathon-2025", title: "Hackathon 2025", count: 45, cover: hackathon },
  { id: "cultural-2025", title: "Rang 2025", count: 92, cover: cultural },
  { id: "workshop-2025", title: "Workshops 2025", count: 33, cover: workshop },
];

export const galleryVideos = [
  { id: "gv1", title: "Technorazz 2025 · Aftermovie", youtubeId: "93vaScGAqkE", cover: hackathon, duration: "3:42" },
  { id: "gv2", title: "Freshers 2025 · Mr & Ms Fresher", youtubeId: "93vaScGAqkE", cover: freshers, duration: "4:20" },
  { id: "gv3", title: "Sports Meet 2025 · Cricket Final", youtubeId: "93vaScGAqkE", cover: sports, duration: "6:15" },
  { id: "gv4", title: "Rang 2025 · Classical Night", youtubeId: "93vaScGAqkE", cover: cultural, duration: "5:08" },
];

import { signCertificate, type CertPayload } from "@/lib/cert-crypto";

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

function issue(rec: Omit<CertificateRecord, "signature">): CertificateRecord {
  const payload: CertPayload = {
    code: rec.code, holder: rec.holder, regId: rec.regId, event: rec.event,
    type: rec.type, position: rec.position, date: rec.date, issuedAt: rec.issuedAt,
  };
  return { ...rec, signature: signCertificate(payload) };
}

export const certificates: CertificateRecord[] = [
  issue({ id: "trz2025", code: "JNU-TRZ25-A94F2", title: "Technorazz 2025", type: "Participation Certificate", date: "30 Sept 2025", issuedAt: "2025-10-02T10:15:00Z", holder: "Priya Sharma", regId: "JNU2025TR01", event: "Technorazz 2025" }),
  issue({ id: "hack2025", code: "JNU-HK25-77BC1", title: "Hackathon 2025", type: "Winner Certificate", date: "28 Sept 2025", issuedAt: "2025-09-29T18:40:00Z", holder: "Karan Mehta", regId: "JNU2025HK07", event: "Hackathon 2025", position: "1st Place" }),
  issue({ id: "photo2025", code: "JNU-PH25-33EE9", title: "Photography Contest 2025", type: "Appreciation Certificate", date: "15 Oct 2025", issuedAt: "2025-10-16T09:00:00Z", holder: "Meera Nair", regId: "JNU2025PH04", event: "Photography Contest 2025" }),
  issue({ id: "sports2025", code: "JNU-SP25-52AA0", title: "Sports Meet 2025", type: "Participation Certificate", date: "12 Oct 2025", issuedAt: "2025-10-13T20:00:00Z", holder: "Rahul Verma", regId: "JNU2025SP12", event: "Sports Meet 2025" }),
];

export function verifyCertificate(code: string): CertificateRecord | null {
  const c = code.trim().toUpperCase();
  return certificates.find((x) => x.code.toUpperCase() === c) ?? null;
}

export const notifications = [
  {
    id: "n1",
    title: "Registration Confirmed",
    message: "You're in for Technorazz 2026 Hackathon. Download your QR pass.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Schedule Update",
    message: "Freshers Party moved to Main Auditorium.",
    time: "1d ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Certificate Available",
    message: "Your Photography Contest 2025 certificate is ready.",
    time: "3d ago",
    unread: false,
  },
];

export const currentUser = {
  name: "Yogendra Singh",
  enrollment: "23BCA0123",
  course: "BCA",
  college: "Jaipur National University",
  email: "yogendra@jnu.ac.in",
  registrations: [
    { eventId: "technorazz-2026", subEvent: "Hackathon", status: "Confirmed", regId: "JNU2026TR01" },
    { eventId: "freshers-2026", subEvent: "Talent Hunt", status: "Pending", regId: "JNU2026FR03" },
  ],
};

// ============ Live Streams ============
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

export const liveStreams: (LiveStream & { youtubeId?: string })[] = [
  {
    id: "trz-main",
    eventId: "technorazz-2026",
    title: "Technorazz 2026 · Main Stage",
    poster: hackathon,
    status: "live",
    viewers: 2340,
    peakViewers: 3120,
    likes: 8500,
    startTime: "2026-09-28T18:00:00",
    youtubeId: "93vaScGAqkE",
  },
  {
    id: "freshers-main",
    eventId: "freshers-2026",
    title: "Freshers Party · Mr & Ms Fresher Finale",
    poster: freshers,
    status: "upcoming",
    viewers: 0,
    peakViewers: 0,
    likes: 0,
    startTime: "2026-08-20T19:00:00",
  },
  {
    id: "cricket-final",
    eventId: "sports-2026",
    title: "Sports Meet · Cricket Final",
    poster: sports,
    status: "upcoming",
    viewers: 0,
    peakViewers: 0,
    likes: 0,
    startTime: "2026-10-14T15:00:00",
  },
  {
    id: "rang-classical",
    eventId: "cultural-fest-2026",
    title: "Rang · Classical Night",
    poster: cultural,
    status: "ended",
    viewers: 0,
    peakViewers: 4210,
    likes: 12300,
    startTime: "2026-11-05T19:00:00",
  },
];

export function getStream(id: string) {
  return liveStreams.find((s) => s.id === id);
}

// ============ Contestants & Voting ============
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

const avatar = (seed: string) => `https://i.pravatar.cc/400?u=${seed}`;

export const contestants: Contestant[] = [
  { id: "c1", name: "Priya Sharma", photo: avatar("priya"), college: "JNU", department: "BCA", event: "Freshers Party 2026", eventCategory: "Ms Fresher", bio: "Dancer, coder, chai enthusiast.", votes: 14250, trending: true },
  { id: "c2", name: "Rahul Verma", photo: avatar("rahul"), college: "JNU", department: "B.Tech", event: "Freshers Party 2026", eventCategory: "Mr Fresher", bio: "Aspiring astrophysicist and beatboxer.", votes: 13980 },
  { id: "c3", name: "Ananya Singh", photo: avatar("ananya"), college: "JNU", department: "BCA", event: "Freshers Party 2026", eventCategory: "Dance Competition", bio: "Kathak trained, hip-hop obsessed.", votes: 12450, trending: true },
  { id: "c4", name: "Karan Mehta", photo: avatar("karan"), college: "IIT Jaipur", department: "CSE", event: "Technorazz 2026", eventCategory: "Coding Challenge", bio: "Won 3 hackathons this year.", votes: 9880 },
  { id: "c5", name: "Isha Patel", photo: avatar("isha"), college: "JNU", department: "MBA", event: "Technorazz 2026", eventCategory: "Startup Pitch", bio: "Building an EdTech for tier-3 cities.", votes: 9450 },
  { id: "c6", name: "Aditya Rao", photo: avatar("aditya"), college: "JNU", department: "B.Tech", event: "Freshers Party 2026", eventCategory: "Singing Competition", bio: "Ghazal singer and guitarist.", votes: 7620 },
  { id: "c7", name: "Meera Nair", photo: avatar("meera"), college: "MNIT", department: "Design", event: "Technorazz 2026", eventCategory: "Photography Contest", bio: "Street photographer from Kochi.", votes: 6480 },
  { id: "c8", name: "Sahil Khan", photo: avatar("sahil"), college: "JNU", department: "BCA", event: "Freshers Party 2026", eventCategory: "Talent Hunt", bio: "Stand-up comic in the making.", votes: 5320 },
];

export function getContestant(id: string) {
  return contestants.find((c) => c.id === id);
}

// ============ Alumni ============
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

export const alumni: AlumnusItem[] = [
  { id: "a1", name: "Rohit Malhotra", photo: avatar("rohit"), batch: "2018", course: "B.Tech CSE", role: "Senior SDE", company: "Google", city: "Bengaluru" },
  { id: "a2", name: "Neha Gupta", photo: avatar("neha"), batch: "2019", course: "MBA", role: "Product Manager", company: "Razorpay", city: "Bengaluru" },
  { id: "a3", name: "Arjun Iyer", photo: avatar("arjun"), batch: "2020", course: "BCA", role: "Founder", company: "PixelForge", city: "Pune" },
  { id: "a4", name: "Sneha Reddy", photo: avatar("sneha"), batch: "2017", course: "MCA", role: "Engineering Manager", company: "Microsoft", city: "Hyderabad" },
  { id: "a5", name: "Vikram Bose", photo: avatar("vikram"), batch: "2016", course: "MBA", role: "VP Marketing", company: "Swiggy", city: "Bengaluru" },
];

export const jobBoard = [
  { id: "j1", title: "SDE Intern", company: "Google", location: "Bengaluru", type: "Internship" },
  { id: "j2", title: "Product Analyst", company: "Razorpay", location: "Remote", type: "Full-time" },
  { id: "j3", title: "UI Designer", company: "PixelForge", location: "Pune", type: "Full-time" },
  { id: "j4", title: "Marketing Associate", company: "Swiggy", location: "Bengaluru", type: "Full-time" },
];
