import hackathonImg from "@/assets/event-hackathon.jpg";
import sportsImg from "@/assets/event-sports.jpg";
import culturalImg from "@/assets/event-cultural.jpg";
import workshopImg from "@/assets/event-workshop.jpg";
import type { EventCategory, EventItem, SubEvent } from "@/lib/mock-data";

const image: Record<EventCategory, string> = {
  Tech: hackathonImg,
  Cultural: culturalImg,
  Sports: sportsImg,
  Workshop: workshopImg,
  Freshers: culturalImg,
  Farewell: culturalImg,
  Alumni: culturalImg,
};

type Spec = {
  id: string;
  name: string;
  tagline: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  organisers: string;
  description: string;
  rules?: string[];
  schedule?: { time: string; title: string }[];
  subEvents?: SubEvent[];
  seatsLeft?: number;
  price?: number;
};

const COMMON_RULES = [
  "Participants must report to the event convener two hours before the scheduled start.",
  "Carry a valid JNU / college ID card along with your registration proof.",
  "Bring all required costumes, props and equipment yourself.",
  "Content that is vulgar, abusive, hateful or discriminatory is not allowed.",
  "The decision of the jury and the organising committee is final and binding.",
];

const TUG_RULES = [
  "One team per school, with about 8–10 players per team.",
  "Players must stay inside the designated area.",
  "The rope is pulled horizontally and parallel to the ground.",
  "Knees and elbows must not touch the ground.",
  "The rope must not be wrapped around the body or arms.",
  "A team wins by pulling the rope the specified distance (about 2–3 metres) or when the other team loses grip.",
];

const specs: Spec[] = [
  // ---------- Day 1 · 29 September 2026 ----------
  {
    id: "cyclothon-2026",
    name: "Cyclothon",
    tagline: "Ride the campus — Plus Gate to SADTM Main Gate.",
    category: "Sports",
    date: "2026-09-29",
    time: "10:30 AM – 12:00 PM",
    venue: "Plus Gate (Main Campus) to SADTM Main Gate",
    organisers: "Convener: Prof. E.V.D. Sastry · Co-Convener: Dr. Himanshu",
    description:
      "An in-house cycling rally for Jaipur National University students, flagged off at Plus Gate and finishing at the SADTM Campus main gate. Lead and support vehicles, safety marshals and a first-aid team accompany the route.",
    rules: [
      "In-house event — open to Jaipur National University students only.",
      "Reach the Plus Gate starting point and report at least 30 minutes early.",
      "Start only on the official flag-off and stay on the marked route.",
      "Short-cutting or leaving the route leads to disqualification.",
      "Bicycles must be roadworthy: working brakes, inflated tyres, secure wheels, proper steering and seat.",
      "Motorised bicycles, e-bikes, scooters or any motor-assisted vehicle are not permitted.",
      "Sports shoes and sports clothing are advised; gloves, elbow and knee protection may be used.",
      "Blocking, pushing, holding another cycle or cutting across another rider is prohibited.",
      "Unauthorised assistance, cycle changes or motorised help means disqualification.",
      "The official timekeeping and finish officials decide the result.",
    ],
  },
  {
    id: "walkathon-2026",
    name: "Walkathon",
    tagline: "Walk for the campus — together, at your own pace.",
    category: "Sports",
    date: "2026-09-29",
    time: "10:30 AM – 12:00 PM",
    venue: "Plus Gate near Residential Area → Medical Lawn → Back",
    organisers: "Convener: Prof. E.V.D. Sastry · Co-Convener: Dr. Himanshu",
    description:
      "An in-house walkathon along the Main Campus route from Plus Gate to the Medical Lawn and back, guided by coordinators, volunteers and marshals.",
    rules: [
      "Carry a valid JNU ID and your registration proof.",
      "Report at least 30 minutes before the scheduled time and follow the official flag-off.",
      "Stay on the marked route — shortcuts and deliberate deviations are prohibited.",
      "Running, cycles, two-wheelers, cars or any transport are not allowed.",
      "Follow the instructions of coordinators, volunteers, security personnel and marshals.",
      "Pushing, obstruction or intimidation is prohibited.",
      "Do not litter or damage university property.",
      "Wear comfortable clothing and walking shoes, and stay hydrated.",
      "Report any injury or medical problem immediately.",
      "Violations may lead to disqualification; the committee's decision is final.",
    ],
  },
  {
    id: "devils-circuit-2026",
    name: "Devil's Circuit — Hurdle Race",
    tagline: "Crawl, climb, balance and sprint through the circuit.",
    category: "Sports",
    date: "2026-09-29",
    time: "12:30 PM – 2:00 PM",
    venue: "Medical Ground, Near Hostels, Main Campus",
    organisers: "Convener: Prof. Shubhranshu Panda · Co-Convener: Ms. Shanu Bhatia",
    description:
      "An obstacle race across hurdles, tyres, cones, crawl tunnels, low walls, balance beams, rope obstacles, step-over barriers, sand sections and carry-drag challenges. The fastest valid time on a correctly completed course wins.",
    rules: [
      "Complete every obstacle in the prescribed order.",
      "Do not bypass an obstacle unless an official instructs you to.",
      "Unsafe attempts are prohibited; nobody is forced to attempt an obstacle they cannot safely complete.",
      "Assemble 30 minutes before the event and stay behind the starting line.",
      "Start only on the official signal — an early start may bring a warning or penalty, repeated false starts mean disqualification.",
      "A participant who skips or improperly completes an obstacle is not declared winner, even with a faster time.",
      "Report injuries or dangerous conditions immediately; the Safety Officer's decision is final.",
    ],
  },
  {
    id: "live-band-2026",
    name: "Live Performance — Band",
    tagline: "Campus bands take over the Main Campus stage.",
    category: "Cultural",
    date: "2026-09-29",
    time: "2:00 PM – 3:15 PM",
    venue: "Main Campus",
    organisers: "Convener: Prof. Dheera Sanadhya",
    description:
      "An in-house live band performance slot on Day 1, coordinated by Dr. Dheera Sanadhya, opening the cultural line-up of Technorazz 2026.",
  },
  {
    id: "gen-z-jnu-2026",
    name: "Gen Z JNU",
    tagline: "Talent, sport, costume and the ramp — all in one title.",
    category: "Cultural",
    date: "2026-09-29",
    time: "3:15 PM – 4:15 PM",
    venue: "Main Campus / Central Ground, SADTM Campus",
    organisers: "Convener: Prof. Rana Zaidi · Co-Convener: Dr. Meena Godha",
    description:
      "An in-house personality hunt for JNU students across multiple rounds — registration and portfolio submission, a talent round, a sports round, a costume round and a ramp walk with Q&A. The committee may change the number or order of rounds based on participation.",
    rules: [
      "In-house event — open to JNU students only.",
      "Rounds may include portfolio submission, talent, sports, costume and ramp walk with Q&A.",
      "Props need prior approval and must be arranged by the participant.",
      "Music must be submitted within the specified deadline and be suitable for a university event.",
      "Seeking or attempting to influence judges is prohibited.",
      "Disrupting another participant's performance is prohibited.",
      "Vulgar, abusive, hateful or discriminatory content is not permitted.",
      "The jury and organising committee decision is final and binding.",
    ],
  },
  {
    id: "inauguration-2026",
    name: "Inauguration Ceremony",
    tagline: "Technorazz 2026 opens at the Central Lawn.",
    category: "Cultural",
    date: "2026-09-29",
    time: "4:15 PM – 4:30 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Organising Committee, Technorazz 2026",
    description:
      "The official inauguration of Technorazz 2026 at the Central Lawn, SADTM Campus, followed by the in-house dance challenge and Stage on Rage.",
  },
  {
    id: "dance-challenge-inhouse-2026",
    name: "The Great Dance Challenge (In-house)",
    tagline: "JNU crews battle it out on the Central Lawn.",
    category: "Cultural",
    date: "2026-09-29",
    time: "4:30 PM – 6:30 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers:
      "Convener: Dr. (Mrs.) Preeti Bakshi · Co-Conveners: Dr. Sumedha Bajpai, Dr. Meenal Dixit",
    description:
      "The in-house edition of The Great Dance Challenge, where JNU schools and departments compete on the main Technorazz stage on Day 1.",
  },
  {
    id: "stage-on-rage-inhouse-2026",
    name: "Stage on Rage (In-house)",
    tagline: "The in-house fashion showcase.",
    category: "Cultural",
    date: "2026-09-29",
    time: "6:30 PM – 8:00 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers:
      "Convener: Dr. Preeti Bakshi · Co-Conveners: Dr. Dheera Sanadhya, Ms. Rekha Sharma",
    description:
      "Stage on Rage brings JNU's in-house fashion teams to the ramp with themed rounds, styling and stage presence on Day 1 of Technorazz 2026.",
  },

  // ---------- Day 2 · 30 September 2026 ----------
  {
    id: "chef-in-making-2026",
    name: "Chef in Making",
    tagline: "Cook, plate and present under the clock.",
    category: "Workshop",
    date: "2026-09-30",
    time: "10:00 AM – 12:30 PM",
    venue: "HMCT Block, SADTM Campus",
    organisers:
      "Convener: Dr. Jaspreet Singh · Co-Conveners: Chef Jhinesh, Mr. Praveen Choudhary, Dr. Poonam Jethwani",
    description:
      "A live culinary competition at the HMCT Block where teams cook, plate and present their dish to a panel of chefs and faculty judges.",
  },
  {
    id: "startup-spirit-2026",
    name: "Start Up Spirit — Shark Tank",
    tagline: "Pitch your idea to the sharks.",
    category: "Tech",
    date: "2026-09-30",
    time: "10:00 AM – 12:30 PM",
    venue: "Auditorium, Engineering Block, Main Campus",
    organisers: "Conveners: Dr. Jaspreet Singh, Dr. Sumit Govil",
    description:
      "A Shark Tank style pitching contest where student founders present their business model, market and numbers to a jury of entrepreneurs and faculty mentors.",
  },
  {
    id: "hackathon-2026",
    name: "Hackathon",
    tagline: "Build it in one long sprint.",
    category: "Tech",
    date: "2026-09-30",
    time: "9:30 AM onwards",
    venue: "MCA Block & Filmtech Auditorium, Media Block, SADTM Campus",
    organisers: "Convener: Prof. Rohit Singhal · Co-Convener: Ms. Urmi Mala Naha",
    description:
      "The flagship Technorazz hackathon runs in different segments across the MCA Block and the Media Block, including the Media Hack 180° challenges for media and design teams.",
    subEvents: [
      {
        id: "media-hack-edit-wars",
        name: "Media Hack 180° — Edit Wars",
        description: "Same footage, different story: teams edit identical raw footage into opposing narratives.",
        fee: 0,
      },
      {
        id: "media-hack-silent-sell",
        name: "Media Hack 180° — Silent Sell",
        description: "Advertise without words — sell a product using only visuals and sound design.",
        fee: 0,
      },
    ],
  },
  {
    id: "game-of-valor-2026",
    name: "Game of Valor — Call of Duty",
    tagline: "Squad up for the campus esports title.",
    category: "Tech",
    date: "2026-09-30",
    time: "10:00 AM – 12:30 PM",
    venue: "Smart Class Rooms, Ground Floor, Engineering Block, SADTM Campus",
    organisers: "Convener: Dr. Atul Singh · Co-Convener: Mr. Robin Khandelwal",
    description:
      "A knockout Call of Duty esports tournament held in the smart classrooms of the Engineering Block, SADTM Campus.",
  },
  {
    id: "prompt-battle-royale-2026",
    name: "Prompt Battle Royale",
    tagline: "Prompt smarter, not longer.",
    category: "Tech",
    date: "2026-09-30",
    time: "1:00 PM – 3:30 PM",
    venue: "Computer Labs, Engineering Block, SADTM Campus",
    organisers: "Convener: Prof. Sunil Gupta · Co-Convener: Ms. Shalini Rajawat",
    description:
      "A timed AI prompting contest in the computer labs — participants solve creative and technical briefs using generative AI tools and are judged on output quality and craft.",
  },
  {
    id: "the-influencer-2026",
    name: "The Influencer",
    tagline: "Shoot a reel, own the feed.",
    category: "Cultural",
    date: "2026-09-30",
    time: "1:00 PM – 3:30 PM",
    venue: "Filmtech Auditorium, Media Block, SADTM Campus",
    organisers: "Convener: Ms. Akansha Bakshi · Co-Convener: Prof. Dheera Sanadhya",
    description:
      "Participants get a fixed reel preparation window and then present their content to the jury for judgement on the same day.",
    schedule: [
      { time: "1:00 PM – 2:30 PM", title: "Reel preparation time" },
      { time: "2:30 PM – 3:30 PM", title: "Presentation & judgement" },
    ],
  },
  {
    id: "cryptic-hunt-2026",
    name: "Cryptic Hunt",
    tagline: "Follow the clues across the campus.",
    category: "Tech",
    date: "2026-09-30",
    time: "1:00 PM – 3:30 PM",
    venue: "MCA Block, SADTM Campus",
    organisers: "Conveners: Prof. Sudhir Sharma, Mr. Ashutosh Sharma",
    description:
      "A chained puzzle hunt — every solved clue unlocks the next. Teams race through logic, code and campus riddles to reach the final answer first.",
  },
  {
    id: "tug-of-war-faculty-2026",
    name: "Tug of War (Faculty)",
    tagline: "School versus school, rope in hand.",
    category: "Sports",
    date: "2026-09-30",
    time: "3:30 PM – 4:30 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Convener: Dr. Ashutosh Sharma · Co-Convener: Dr. Suyash Kunal Joshi",
    description:
      "The faculty tug of war, played school-wise on the Central Lawn between the afternoon and evening programmes of Day 2.",
    rules: TUG_RULES,
  },
  {
    id: "dance-challenge-2026",
    name: "The Great Dance Challenge (Inter-University)",
    tagline: "The biggest dance battle of Technorazz.",
    category: "Cultural",
    date: "2026-09-30",
    time: "4:30 PM – 6:20 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers:
      "Convener: Dr. (Mrs.) Preeti Bakshi · Co-Conveners: Dr. Sumedha Bajpai, Dr. Meenal Dixit",
    description:
      "The inter-university edition of The Great Dance Challenge, with crews from visiting colleges competing on the main Central Lawn stage.",
  },
  {
    id: "stage-on-rage-2026",
    name: "Stage on Rage — Fashion Show",
    tagline: "The inter-university ramp showdown.",
    category: "Cultural",
    date: "2026-09-30",
    time: "6:20 PM – 7:45 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers:
      "Convener: Dr. Preeti Bakshi · Co-Conveners: Dr. Dheera Sanadhya, Ms. Rekha Sharma",
    description:
      "The inter-university fashion show of Technorazz 2026, judged on styling, theme, choreography and stage presence.",
  },
  {
    id: "musical-evening-2026",
    name: "Musical Evening — Ms. Snehi & Tej Gill",
    tagline: "Day 2 closes with live music.",
    category: "Cultural",
    date: "2026-09-30",
    time: "7:45 PM – 9:15 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Organising Committee, Technorazz 2026",
    description:
      "A live musical evening on the Central Lawn with performances by Ms. Snehi and Tej Gill, closing the second day of the fest.",
  },
  {
    id: "reel-rush-2026",
    name: "Reel Rush (Online)",
    tagline: "The online reel-making contest.",
    category: "Tech",
    date: "2026-09-30",
    time: "Online — entries as per committee deadline",
    venue: "Online",
    organisers: "Convener: Mr. Hitesh Kakkar · Co-Convener: Ms. Anmol Bhat",
    description:
      "The official online event of Technorazz 2026. Participants submit short reels digitally; entries are shortlisted and judged by the online event committee.",
  },

  // ---------- Day 3 · 1 October 2026 ----------
  {
    id: "drone-race-2026",
    name: "Drone Race",
    tagline: "Fly the line, beat the clock.",
    category: "Tech",
    date: "2026-10-01",
    time: "10:00 AM – 12:00 Noon",
    venue: "Central Lawn, SADTM Campus",
    organisers:
      "Convener: Mr. Hitesh Kakkar · Co-Conveners: Prof. Sunil Gupta, Mr. Dushyant Kumar",
    description:
      "A timed drone racing competition on the Central Lawn, with pilots navigating a marked aerial course laid out on the SADTM Campus.",
  },
  {
    id: "crack-the-crime-2026",
    name: "Crack The Crime — Escape Room (Forensic)",
    tagline: "Read the evidence, name the culprit.",
    category: "Tech",
    date: "2026-10-01",
    time: "10:00 AM – 12:30 PM",
    venue: "Basement, Engineering Block, Main Campus",
    organisers: "Convener: Prof. Jaspreet Singh · Co-Convener: Mr. Karan Sharma",
    description:
      "The forensic escape room: teams work a staged crime scene, examine evidence and reconstruct the sequence of events to escape within the time limit.",
  },
  {
    id: "biological-mystery-2026",
    name: "Crack the Biological Mystery — Escape Room",
    tagline: "Life sciences, but as a locked room.",
    category: "Tech",
    date: "2026-10-01",
    time: "10:00 AM – 12:30 PM",
    venue: "Basement, Engineering Block, Main Campus",
    organisers:
      "Convener: Prof. R.K. Bansal · Co-Conveners: Dr. Meenal Dixit, Dr. Meena Godha",
    description:
      "The non-forensic escape room, built around biological puzzles, lab clues and diagnostic reasoning that teams must solve against the clock.",
  },
  {
    id: "mind-fest-2026",
    name: "Mind Fest — General Quiz",
    tagline: "The general quiz championship.",
    category: "Tech",
    date: "2026-10-01",
    time: "10:00 AM – 12:30 PM",
    venue: "SIILAS Auditorium",
    organisers:
      "Conveners: Dr. Shilpi Bagga, Dr. Shilpi Sharma · Co-Convener: Ms. Anmol Bhat",
    description:
      "A multi-round general quiz at the SIILAS Auditorium, moving from written prelims to a buzzer-based stage final.",
  },
  {
    id: "ad-war-2026",
    name: "Ad-War — Video Advertisement Challenge",
    tagline: "Sixty seconds to sell it.",
    category: "Cultural",
    date: "2026-10-01",
    time: "10:00 AM – 12:30 PM",
    venue: "Filmtech Auditorium, Media Block, SADTM Campus",
    organisers:
      "Convener: Prof. M. M. Bagali · Co-Conveners: Dr. Shilpi Bagga, Ms. Shikha Agarwal",
    description:
      "Teams script, shoot and screen a video advertisement, judged on concept, storytelling, production quality and brand recall.",
  },
  {
    id: "iot-robotics-2026",
    name: "IoT Based Robotics Competition",
    tagline: "Sensors, boards and bots that actually work.",
    category: "Tech",
    date: "2026-10-01",
    time: "10:00 AM – 12:30 PM",
    venue: "Ground Floor, Engineering Block, Main Campus",
    organisers:
      "Convener: Prof. Sudhir Kumar Sharma · Co-Conveners: Prof. Neeraj Tiwari, Mr. Puneet Kalia",
    description:
      "Teams demonstrate IoT-driven robots and connected prototypes, judged on design, working demo, innovation and real-world use.",
  },
  {
    id: "musical-chair-faculty-2026",
    name: "Musical Chair (Faculty / School Wise)",
    tagline: "When the music stops, be quick.",
    category: "Sports",
    date: "2026-10-01",
    time: "1:00 PM – 2:00 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Convener: Dr. Shilpi Sharma · Co-Convener: Mr. Deepak Jain",
    description:
      "The faculty musical chair round, played school-wise on the Central Lawn on the final day of Technorazz 2026.",
    rules: [
      "Open to all specified participants.",
      "Participants walk around the designated area while the music plays.",
      "Participants are eliminated after each round.",
      "The last remaining participant wins.",
    ],
  },
  {
    id: "tug-of-war-students-2026",
    name: "Tug of War (Students / Team Wise)",
    tagline: "Grip, dig in and pull.",
    category: "Sports",
    date: "2026-10-01",
    time: "2:00 PM – 3:00 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Convener: Dr. Ashutosh Sharma · Co-Convener: Dr. Suyash Kunal Joshi",
    description:
      "The student tug of war, played team-wise on the Central Lawn before the valedictory ceremony.",
    rules: TUG_RULES,
  },
  {
    id: "campus-fashion-icons-2026",
    name: "Best Campus Fashion Icons (Faculty)",
    tagline: "Style, presence and the ramp — faculty edition.",
    category: "Cultural",
    date: "2026-10-01",
    time: "3:00 PM – 4:00 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers:
      "Conveners: Dr. Shilpi Sharma, Dr. Shilpi Bagga · Coordinated by Dr. Shilpi Bagga and Dr. Shilpi Sharma",
    description:
      "Faculty teams represent their schools on the ramp. Judging covers overall appearance and styling, confidence and stage presence, personality, creativity of attire, grooming and ramp walk.",
    rules: [
      "Participation is faculty-only, campus and school wise.",
      "Attire may be Indian, Western, Indo-Western, formal, ethnic or fusion.",
      "Each team gets a fixed presentation time; exceeding it may affect evaluation.",
      "Evaluation covers appearance and styling, confidence and stage presence, personality, creativity, grooming and body language.",
      "The jury and organising committee decision is final and binding.",
    ],
  },
  {
    id: "valedictory-2026",
    name: "Valedictory Ceremony",
    tagline: "Prizes, the Chief Guest and a farewell to Technorazz 2026.",
    category: "Cultural",
    date: "2026-10-01",
    time: "4:15 PM – 5:00 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Organising Committee, Technorazz 2026",
    description:
      "The closing ceremony of Technorazz 2026 with the winning team performance, arrival of the Chief Guest, lighting of the lamp, prize distribution and the Chief Guest's address.",
    schedule: [
      { time: "3:30 PM – 4:00 PM", title: "Winner team performance" },
      { time: "4:00 PM", title: "Arrival of Chief Guest" },
      { time: "4:05 PM", title: "Chief Guest, Pro-Chancellor, Vice-Chancellor, Executive Director and Directors occupy seats" },
      { time: "4:07 PM", title: "Lighting of lamp" },
      { time: "4:10 PM", title: "Floral welcome of Chief Guest" },
      { time: "4:10 PM – 4:15 PM", title: "Dignitaries occupy seats on the head table" },
      { time: "4:15 PM – 4:50 PM", title: "Prize distribution by Chief Guest and dignitaries" },
      { time: "4:50 PM – 5:00 PM", title: "Address by Chief Guest" },
    ],
  },
  {
    id: "celebrity-performance-2026",
    name: "Celebrity Performance",
    tagline: "Musical evening with Mr. Rishab Chaturvedi & DJ Tan.",
    category: "Cultural",
    date: "2026-10-01",
    time: "5:00 PM – 8:00 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Organising Committee, Technorazz 2026",
    description:
      "The celebrity musical evening of Technorazz 2026 with performances by Mr. Rishab Chaturvedi and DJ Tan on the Central Lawn.",
  },
  {
    id: "dj-night-2026",
    name: "DJ Night",
    tagline: "The final night of Technorazz 2026.",
    category: "Cultural",
    date: "2026-10-01",
    time: "8:00 PM – 10:00 PM",
    venue: "Central Lawn, SADTM Campus",
    organisers: "Organising Committee, Technorazz 2026",
    description:
      "Technorazz 2026 closes with a two-hour DJ night on the Central Lawn, SADTM Campus.",
  },
];

export const technorazzEvents: EventItem[] = specs.map((s) => ({
  id: s.id,
  name: s.name,
  tagline: s.tagline,
  category: s.category,
  image: image[s.category],
  startDate: s.date,
  endDate: s.date,
  venue: s.venue,
  price: s.price ?? 0,
  seatsLeft: s.seatsLeft ?? 60,
  participants: "Technorazz 2026",
  description: `${s.description}\n\nWhen: ${s.time}\nVenue: ${s.venue}\n${s.organisers}`,
  rules: s.rules ?? COMMON_RULES,
  schedule: s.schedule ?? [{ time: s.time, title: s.name }],
  subEvents: s.subEvents ?? [],
}));
