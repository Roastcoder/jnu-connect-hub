import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import {
  User,
  Profile,
  UserRole,
  Event,
  SubEvent,
  Department,
  Registration,
  Attendance,
  Contestant,
  Vote,
  Judge,
  LiveStream,
  Notification,
  SpecialGuest,
  Sponsor,
  Gallery,
  Certificate,
  Student,
  Faculty,
  Staff,
  Payment,
  AppSetting,
  Alumnus,
  Job,
} from '../entities';

const ALL_ENTITIES = [
  User,
  Profile,
  UserRole,
  Event,
  SubEvent,
  Department,
  Registration,
  Attendance,
  Contestant,
  Vote,
  Judge,
  LiveStream,
  Notification,
  SpecialGuest,
  Sponsor,
  Gallery,
  Certificate,
  Student,
  Faculty,
  Staff,
  Payment,
  AppSetting,
  Alumnus,
  Job,
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  let dataSource: DataSource;

  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    dataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: ALL_ENTITIES,
      synchronize: true,
      ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
    });
  } else {
    dataSource = new DataSource({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: ALL_ENTITIES,
      synchronize: true,
    });
  }

  await dataSource.initialize();
  console.log('🌱 Database connection initialized for seeding...');

  const userRepo = dataSource.getRepository(User);
  const profileRepo = dataSource.getRepository(Profile);
  const roleRepo = dataSource.getRepository(UserRole);
  const deptRepo = dataSource.getRepository(Department);
  const eventRepo = dataSource.getRepository(Event);
  const subEventRepo = dataSource.getRepository(SubEvent);
  const contestantRepo = dataSource.getRepository(Contestant);
  const liveStreamRepo = dataSource.getRepository(LiveStream);
  const specialGuestRepo = dataSource.getRepository(SpecialGuest);
  const sponsorRepo = dataSource.getRepository(Sponsor);
  const galleryRepo = dataSource.getRepository(Gallery);
  const certificateRepo = dataSource.getRepository(Certificate);
  const notificationRepo = dataSource.getRepository(Notification);
  const alumnusRepo = dataSource.getRepository(Alumnus);
  const jobRepo = dataSource.getRepository(Job);
  const settingRepo = dataSource.getRepository(AppSetting);

  // 1. Create Default Users
  const defaultUsers = [
    {
      email: 'admin@jnu.ac.in',
      password: 'Admin@123',
      name: 'JNU Super Administrator',
      role: 'admin',
      college: 'Jaipur National University',
    },
    {
      email: 'admin@demo.jnu',
      password: 'Demo@1234',
      name: 'Demo Super Administrator',
      role: 'admin',
      college: 'Jaipur National University',
    },
    {
      email: 'deptadmin@jnu.ac.in',
      password: 'DeptAdmin@123',
      name: 'Prof. E.V.D. Sastry (SOET Admin)',
      role: 'dept_admin',
      college: 'School of Engineering & Technology',
    },
    {
      email: 'dept@demo.jnu',
      password: 'Demo@1234',
      name: 'Demo Department Admin',
      role: 'dept_admin',
      college: 'School of Engineering & Technology',
    },
    {
      email: 'coordinator@jnu.ac.in',
      password: 'Coord@123',
      name: 'Prof. Rohit Singhal (Technorazz Coordinator)',
      role: 'coordinator',
      college: 'Technorazz Organizing Committee',
    },
    {
      email: 'coordinator@demo.jnu',
      password: 'Demo@1234',
      name: 'Demo Event Coordinator',
      role: 'coordinator',
      college: 'Technorazz Organizing Committee',
    },
    {
      email: 'staff@jnu.ac.in',
      password: 'Staff@123',
      name: 'Gate Security & Verification Staff',
      role: 'staff',
      college: 'Main Campus Plus Gate',
    },
    {
      email: 'staff@demo.jnu',
      password: 'Demo@1234',
      name: 'Demo Gate Staff',
      role: 'staff',
      college: 'Main Campus Plus Gate',
    },
    {
      email: 'student@jnu.ac.in',
      password: 'Student@123',
      name: 'Yogendra Singh',
      role: 'student',
      college: 'School of Computer & Systems Sciences',
    },
    {
      email: 'student@demo.jnu',
      password: 'Demo@1234',
      name: 'Demo Student',
      role: 'student',
      college: 'School of Computer & Systems Sciences',
    },
  ];

  const salt = await bcrypt.genSalt(10);

  for (const u of defaultUsers) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      const password_hash = await bcrypt.hash(u.password, salt);
      const user = userRepo.create({
        email: u.email,
        password_hash,
      });
      const savedUser = await userRepo.save(user);

      const profile = profileRepo.create({
        id: savedUser.id,
        full_name: u.name,
        enrollment: '23JNU' + Math.floor(1000 + Math.random() * 9000),
        course: 'B.Tech / MCA',
        college: u.college,
        avatar_url: `https://i.pravatar.cc/300?u=${u.email}`,
      });
      await profileRepo.save(profile);

      const userRole = roleRepo.create({
        user_id: savedUser.id,
        role: u.role as any,
      });
      await roleRepo.save(userRole);
      console.log(`✅ Created ${u.role} user: ${u.email}`);
    }
  }

  // 2. Create Departments from Official PDF
  const defaultDepts = [
    { name: 'School of Engineering & Technology (SOET)', code: 'SOET', head_name: 'Prof. E.V.D. Sastry' },
    { name: 'School of Computer & Systems Sciences (SCSS)', code: 'SCSS', head_name: 'Prof. Rohit Singhal' },
    { name: 'School of Hotel Management & Catering Tech (SHMCT)', code: 'SHMCT', head_name: 'Dr. Jaspreet Singh' },
    { name: 'School of Pharmaceutical Sciences (SPS)', code: 'SPS', head_name: 'Dr. Shubhranshu Panda' },
    { name: 'School of Media & Mass Communication (SMMC)', code: 'SMMC', head_name: 'Dr. (Mrs.) Preeti Bakshi' },
    { name: 'School of Business & Management (SOBM)', code: 'SOBM', head_name: 'Dr. Sumit Govil' },
    { name: 'School of Law & Governance (SOLG)', code: 'SOLG', head_name: 'Prof. S.K. Joshi' },
  ];

  for (const d of defaultDepts) {
    const existing = await deptRepo.findOne({ where: { code: d.code } });
    if (!existing) {
      await deptRepo.save(deptRepo.create(d));
    }
  }
  console.log('✅ Departments seeded');

  // 3. Create Technorazz 2026 & All Campus Events
  // 3. Create Technorazz 2026 Official Events (Strictly matching official University document)
  const officialEvents = [
    {
      id: 'technorazz-2026',
      name: 'TECHNORAZZ 2026',
      tagline: 'A Fest of Tech, Talent & Culture • 29th Sept – 01st Oct 2026',
      category: 'Tech',
      description:
        'Jaipur National University proudly presents TECHNORAZZ 2026 — the grand national fest of technology, talent, and culture. Featuring 17 flagship technical, cultural, and online competitions with prizes worth ₹5 Lakhs+, alongside star celebrity concerts by Tej Gill, DJ Tan, Snehi Live, and Rishabh Chaturvedi.',
      venue: 'Jaipur National University, Main Campus & SADTM Campus',
      start_date: new Date('2026-09-29T09:00:00Z'),
      end_date: new Date('2026-10-01T22:00:00Z'),
      price: 0,
      seats_left: 3500,
      prize_pool: '₹5,00,000+',
      participants: '5000+',
      featured: true,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Participants must carry a valid University / College ID card and their digital QR Pass.',
        'Registration is mandatory for all Technical, Cultural, and Online events.',
        'Last date to register is 28th September 2026.',
        'Judges and Organizers decisions will be final and binding.',
        'Any indiscipline or misconduct leads to immediate disqualification.',
      ],
      schedule: [
        { time: 'Day 1 (29 Sept) · 09:30 AM', title: 'Grand Inauguration & Lighting of Lamp' },
        { time: 'Day 1 (29 Sept) · 11:00 AM', title: 'Hackathon, IoT Robotics & Drone Race' },
        { time: 'Day 1 (29 Sept) · 06:00 PM', title: 'Snehi Live & Musical Evening' },
        { time: 'Day 2 (30 Sept) · 10:00 AM', title: 'Start Up Spirit (Shark Tank) & Ad-War' },
        { time: 'Day 2 (30 Sept) · 02:00 PM', title: 'The Great Dance Challenge & Stage on Rage' },
        { time: 'Day 2 (30 Sept) · 07:00 PM', title: 'DJ Tan EDM Night' },
        { time: 'Day 3 (01 Oct) · 10:00 AM', title: 'Game of Valor (COD) & Prompt Battle Royale' },
        { time: 'Day 3 (01 Oct) · 02:00 PM', title: 'Annual Prize Distribution & Valedictory' },
        { time: 'Day 3 (01 Oct) · 06:30 PM', title: 'Star Celebrity Concert: Tej Gill & Rishabh Chaturvedi' },
      ],
    },
    {
      id: 'cyclothon-2026',
      name: 'Cyclothon 2026',
      tagline: 'Ride the campus — Plus Gate to SADTM Main Gate.',
      category: 'Sports',
      description: 'An in-house cycling rally for JNU students flagged off at Plus Gate and finishing at SADTM Main Gate.',
      venue: 'Plus Gate (Main Campus) to SADTM Main Gate',
      start_date: new Date('2026-09-29T10:30:00Z'),
      end_date: new Date('2026-09-29T12:00:00Z'),
      price: 0,
      seats_left: 200,
      prize_pool: 'Finisher Medals',
      participants: '200+',
      featured: false,
      image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Open to Jaipur National University students only.',
        'Bicycles must have working brakes and properly inflated tyres.',
        'Motorised or e-bikes are strictly prohibited.',
        'Report at least 30 minutes before flag-off at Plus Gate.',
      ],
      schedule: [{ time: '10:30 AM', title: 'Flag off from Plus Gate' }],
    },
    {
      id: 'walkathon-2026',
      name: 'Walkathon 2026',
      tagline: 'Walk for the campus — together, at your own pace.',
      category: 'Sports',
      description: 'An in-house walkathon along the Main Campus route from Plus Gate to the Medical Lawn and back.',
      venue: 'Plus Gate near Residential Area → Medical Lawn → Back',
      start_date: new Date('2026-09-29T10:30:00Z'),
      end_date: new Date('2026-09-29T12:00:00Z'),
      price: 0,
      seats_left: 300,
      prize_pool: 'Participation Medals',
      participants: '300+',
      featured: false,
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
      rules: ['Carry valid JNU ID.', 'Follow marked route.'],
      schedule: [{ time: '10:30 AM', title: 'Flag off' }],
    },
    {
      id: 'devils-circuit-2026',
      name: "Devil's Circuit — Hurdle Race",
      tagline: 'Crawl, climb, balance and sprint through the circuit.',
      category: 'Sports',
      description: 'An obstacle race across hurdles, tyres, cones, crawl tunnels, low walls, and balance beams.',
      venue: 'Medical Ground, Near Hostels, Main Campus',
      start_date: new Date('2026-09-29T12:30:00Z'),
      end_date: new Date('2026-09-29T14:00:00Z'),
      price: 0,
      seats_left: 150,
      prize_pool: 'Winner Trophy & Cash Prize',
      participants: '150+',
      featured: false,
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop&q=80',
      rules: ['Complete every obstacle in prescribed order.', 'False start penalty.'],
      schedule: [{ time: '12:30 PM', title: 'Race Commences' }],
    },
    {
      id: 'live-band-2026',
      name: 'Live Performance — Band',
      tagline: 'Campus bands take over the Main Campus stage.',
      category: 'Cultural',
      description: 'An in-house live band performance opening the cultural line-up of Technorazz 2026.',
      venue: 'Main Campus',
      start_date: new Date('2026-09-29T14:00:00Z'),
      end_date: new Date('2026-09-29T15:15:00Z'),
      price: 0,
      seats_left: 500,
      prize_pool: 'Best Band Trophy',
      participants: '10 Bands',
      featured: false,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
      rules: ['15 mins performance per band.'],
      schedule: [{ time: '02:00 PM', title: 'Bands Live' }],
    },
    {
      id: 'gen-z-jnu-2026',
      name: 'Gen Z JNU',
      tagline: 'Talent, sport, costume and the ramp — all in one title.',
      category: 'Cultural',
      description: 'An in-house personality hunt for JNU students across talent, sports, costume, and ramp walk with Q&A.',
      venue: 'Central Ground, SADTM Campus',
      start_date: new Date('2026-09-29T15:15:00Z'),
      end_date: new Date('2026-09-29T16:15:00Z'),
      price: 0,
      seats_left: 100,
      prize_pool: 'Mr & Ms Gen Z Titles',
      participants: '80 Contestants',
      featured: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
      rules: ['Open to JNU students only.', 'Portfolio submission mandatory.'],
      schedule: [{ time: '03:15 PM', title: 'Rounds Begin' }],
    },
    {
      id: 'dance-challenge-2026',
      name: 'The Great Dance Challenge',
      tagline: 'The biggest dance battle of Technorazz.',
      category: 'Cultural',
      description: 'Solo and group dance championship on the main Central Lawn stage.',
      venue: 'Central Lawn, SADTM Campus',
      start_date: new Date('2026-09-30T16:30:00Z'),
      end_date: new Date('2026-09-30T18:20:00Z'),
      price: 0,
      seats_left: 500,
      prize_pool: '₹50,000 Cash + Trophies',
      participants: '200 Dancers',
      featured: true,
      image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      rules: ['Solo (3-4 mins), Group (5-8 mins).', 'Original tracks required.'],
      schedule: [{ time: '04:30 PM', title: 'Dance Showdown' }],
    },
    {
      id: 'stage-on-rage-2026',
      name: 'Stage on Rage — Fashion Show',
      tagline: 'The ramp showdown of Technorazz 2026.',
      category: 'Cultural',
      description: 'Theatrical fashion showcase judged on styling, theme, choreography and stage presence.',
      venue: 'Central Lawn, SADTM Campus',
      start_date: new Date('2026-09-30T18:20:00Z'),
      end_date: new Date('2026-09-30T19:45:00Z'),
      price: 0,
      seats_left: 500,
      prize_pool: 'Best Team & Best Model Trophies',
      participants: '15 Teams',
      featured: true,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
      rules: ['Theme based rounds.', 'Maximum 10 mins per team.'],
      schedule: [{ time: '06:20 PM', title: 'Ramp Walk' }],
    },
    {
      id: 'hackathon-2026',
      name: 'Hackathon & Media Hack 180°',
      tagline: '24-hour innovation and coding marathon.',
      category: 'Tech',
      description: 'Flagship 24h development sprint across software, AI, and digital media challenges.',
      venue: 'MCA Block & Filmtech Auditorium, Media Block, SADTM',
      start_date: new Date('2026-09-30T09:30:00Z'),
      end_date: new Date('2026-10-01T12:00:00Z'),
      price: 0,
      seats_left: 200,
      prize_pool: '₹1,00,000 Cash Pool',
      participants: '60 Teams',
      featured: true,
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      rules: ['Teams of 2-4.', 'Original code only created during the sprint.'],
      schedule: [{ time: '09:30 AM', title: 'Sprint Kickoff' }],
    },
    {
      id: 'drone-race-2026',
      name: 'Drone Race',
      tagline: 'Fly the line, beat the clock.',
      category: 'Tech',
      description: 'High-speed obstacle navigation drone racing tournament on the Central Lawn.',
      venue: 'Central Lawn, SADTM Campus',
      start_date: new Date('2026-10-01T10:00:00Z'),
      end_date: new Date('2026-10-01T12:00:00Z'),
      price: 0,
      seats_left: 50,
      prize_pool: '₹30,000 Cash + Drone Kits',
      participants: '30 Pilots',
      featured: true,
      image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80',
      rules: ['Standard FPV safety guidelines.', 'Time-attack format.'],
      schedule: [{ time: '10:00 AM', title: 'Aerial Course Open' }],
    },
    {
      id: 'iot-robotics-2026',
      name: 'IoT Based Robotics Competition',
      tagline: 'Design and operate smart autonomous robots.',
      category: 'Tech',
      description: 'Teams demonstrate IoT-driven connected robots and automated prototypes.',
      venue: 'Ground Floor, Engineering Block, Main Campus',
      start_date: new Date('2026-10-01T10:00:00Z'),
      end_date: new Date('2026-10-01T12:30:00Z'),
      price: 0,
      seats_left: 80,
      prize_pool: '₹40,000 Cash + Shield',
      participants: '40 Teams',
      featured: true,
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
      rules: ['Autonomous & manual rounds.', 'Live demonstration.'],
      schedule: [{ time: '10:00 AM', title: 'Robo Arena' }],
    },
  ];

  // Purge any non-Technorazz events from previous tests
  const validEventIds = officialEvents.map((e) => e.id);
  const allExistingEvents = await eventRepo.find();
  for (const existing of allExistingEvents) {
    if (!validEventIds.includes(existing.id)) {
      try {
        await subEventRepo.delete({ event_id: existing.id });
        await specialGuestRepo.delete({ event_id: existing.id });
        await eventRepo.delete(existing.id);
        console.log(`🗑️ Removed non-Technorazz event: ${existing.name}`);
      } catch {}
    }
  }

  for (const ev of officialEvents) {
    const existing = await eventRepo.findOne({ where: { id: ev.id } });
    if (!existing) {
      await eventRepo.save(eventRepo.create(ev));
    } else {
      await eventRepo.update(ev.id, ev);
    }
  }
  console.log('✅ Events seeded');

  // 4. Create All 17 Official Sub-Events of Technorazz 2026 (From Official Document)
  const officialSubEvents = [
    { event_id: 'technorazz-2026', name: 'IoT Based Robotic Competition', description: 'Design & operate smart autonomous robots', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Drone Race', description: 'High-speed obstacle navigation drone tournament', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Hackathon', description: '24-hour innovation and coding marathon', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Media Hack 180° — Edit Wars', description: 'Same footage, different story challenge', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Media Hack 180° — Silent Sell', description: 'Advertise without words creative sprint', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Prompt Battle Royale', description: 'Generative AI and prompt engineering showdown', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Ad-War - Video Advertisement Challenge', description: 'Create the most viral commercial in 3 hours', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Mind Fest (General Quiz)', description: 'Ultimate test of intellect, trivia, and tech', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Start Up Spirit (Shark Tank)', description: 'Pitch your venture to angel investors and jury', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Game of Valor (Call of Duty)', description: 'Multiplayer esports battle royale tournament', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Chef in Making', description: 'Live culinary arts and gastronomy competition', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Cryptic Hunt', description: 'Campus-wide code-breaking and riddle hunt', fee: 0 },
    { event_id: 'technorazz-2026', name: 'The Great Dance Challenge', description: 'Solo and group dance championship', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Stage on Rage', description: 'Theatrical drama, street play, and fashion show', fee: 0 },
    { event_id: 'technorazz-2026', name: 'The Influencer', description: 'Content creation and digital persona contest', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Crack the Crime — Escape Room', description: 'Forensic investigation and puzzle simulation', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Crack the Biological Mystery', description: 'Biomedical locked-room quest', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Reel Rush 2026 (Online)', description: 'Campus reel making & viral video contest', fee: 0 },
  ];

  // Purge any obsolete sub-events
  const validSubNames = officialSubEvents.map((s) => s.name);
  const allExistingSubs = await subEventRepo.find();
  for (const s of allExistingSubs) {
    if (!validSubNames.includes(s.name) || s.event_id !== 'technorazz-2026') {
      try {
        await subEventRepo.delete(s.id);
      } catch {}
    }
  }

  for (const sub of officialSubEvents) {
    const existing = await subEventRepo.findOne({ where: { name: sub.name, event_id: sub.event_id } });
    if (!existing) {
      await subEventRepo.save(subEventRepo.create(sub));
    }
  }
  console.log('✅ Sub-events seeded');

  // 5. Create Star-Vibes Celebrity Special Guests (From Official Document)
  const specialGuests = [
    {
      event_id: 'technorazz-2026',
      name: 'Tej Gill',
      title: 'Celebrity Singer & Live Performer',
      bio: 'Renowned vocalist and crowd-favorite Punjabi pop artist headlining Day 3 finale.',
      photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    },
    {
      event_id: 'technorazz-2026',
      name: 'DJ Tan',
      title: 'Celebrity DJ & Electronic Music Producer',
      bio: 'High-octane EDM producer electrifying the Central Lawn stage on Day 2.',
      photo: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=500&auto=format&fit=crop&q=80',
    },
    {
      event_id: 'technorazz-2026',
      name: 'Snehi Live',
      title: 'Acoustic & Fusion Live Artist',
      bio: 'Soulful acoustic performer setting the magical evening vibe on Day 1.',
      photo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    },
    {
      event_id: 'technorazz-2026',
      name: 'Rishabh Chaturvedi',
      title: 'Bollywood Playback Singer & Indian Idol Finalist',
      bio: 'Celebrated Bollywood vocalist performing romantic and energetic tracks on Day 3.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    },
  ];

  // Purge obsolete guests
  const validGuestNames = specialGuests.map((g) => g.name);
  const allExistingGuests = await specialGuestRepo.find();
  for (const g of allExistingGuests) {
    if (!validGuestNames.includes(g.name)) {
      try {
        await specialGuestRepo.delete(g.id);
      } catch {}
    }
  }

  for (const sg of specialGuests) {
    const existing = await specialGuestRepo.findOne({ where: { name: sg.name } });
    if (!existing) {
      await specialGuestRepo.save(specialGuestRepo.create(sg));
    }
  }
  console.log('✅ Special guests seeded');

  // 6. Create Contestants for Live Voting
  const contestants = [
    {
      name: 'Priya Sharma',
      event_id: 'freshers-2026',
      department: 'School of Computer & Systems Sciences',
      college: 'Jaipur National University',
      event_category: 'Ms Fresher',
      bio: 'Dancer, coder, chai enthusiast.',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      votes_count: 14250,
      trending: true,
    },
    {
      name: 'Rahul Verma',
      event_id: 'freshers-2026',
      department: 'School of Engineering & Technology',
      college: 'Jaipur National University',
      event_category: 'Mr Fresher',
      bio: 'Aspiring astrophysicist and beatboxer.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      votes_count: 13980,
      trending: false,
    },
    {
      name: 'Ananya Singh',
      event_id: 'technorazz-2026',
      department: 'School of Media & Mass Communication',
      college: 'Jaipur National University',
      event_category: 'The Great Dance Challenge',
      bio: 'Kathak trained, hip-hop fusion exponent.',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
      votes_count: 12450,
      trending: true,
    },
    {
      name: 'Karan Mehta',
      event_id: 'technorazz-2026',
      department: 'School of Computer & Systems Sciences',
      college: 'Jaipur National University',
      event_category: 'Hackathon',
      bio: 'Full-stack AI developer and 3x hackathon winner.',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
      votes_count: 9880,
      trending: false,
    },
    {
      name: 'Isha Patel',
      event_id: 'technorazz-2026',
      department: 'School of Business & Management',
      college: 'Jaipur National University',
      event_category: 'Start Up Spirit (Shark Tank)',
      bio: 'Founder building sustainable rural logistics platform.',
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
      votes_count: 9450,
      trending: false,
    },
    {
      name: 'Aditya Rao',
      event_id: 'technorazz-2026',
      department: 'School of Hotel Management',
      college: 'Jaipur National University',
      event_category: 'Chef in Making',
      bio: 'Modern Indian culinary innovator and pastry artist.',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
      votes_count: 7620,
      trending: false,
    },
  ];

  for (const c of contestants) {
    const existing = await contestantRepo.findOne({ where: { name: c.name } });
    if (!existing) {
      await contestantRepo.save(contestantRepo.create(c));
    }
  }
  console.log('✅ Contestants seeded');

  // 7. Create Live Streams
  const liveStreams = [
    {
      id: 'trz-main',
      event_id: 'technorazz-2026',
      title: 'Technorazz 2026 · Main Stage Live Keynote',
      poster: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      status: 'live',
      viewers: 2340,
      peak_viewers: 3120,
      likes: 8500,
      youtube_id: '93vaScGAqkE',
      stream_url: 'https://www.youtube.com/embed/93vaScGAqkE',
      scheduled_at: new Date('2026-09-29T09:30:00Z'),
    },
    {
      id: 'freshers-main',
      event_id: 'freshers-2026',
      title: 'Freshers Party · Mr & Ms Fresher Finale',
      poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
      status: 'upcoming',
      viewers: 0,
      peak_viewers: 0,
      likes: 420,
      youtube_id: '93vaScGAqkE',
      stream_url: '',
      scheduled_at: new Date('2026-08-20T19:00:00Z'),
    },
    {
      id: 'cricket-final',
      event_id: 'sports-2026',
      title: 'Sports Meet · Cricket Championship Final',
      poster: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
      status: 'upcoming',
      viewers: 0,
      peak_viewers: 0,
      likes: 810,
      youtube_id: '93vaScGAqkE',
      stream_url: '',
      scheduled_at: new Date('2026-10-14T15:00:00Z'),
    },
    {
      id: 'rang-classical',
      event_id: 'cultural-fest-2026',
      title: 'Rang Fest · Classical & Folk Showcase',
      poster: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      status: 'ended',
      viewers: 0,
      peak_viewers: 4210,
      likes: 12300,
      youtube_id: '93vaScGAqkE',
      stream_url: '',
      scheduled_at: new Date('2026-11-05T19:00:00Z'),
    },
  ];

  for (const ls of liveStreams) {
    const existing = await liveStreamRepo.findOne({ where: { id: ls.id } });
    if (!existing) {
      await liveStreamRepo.save(liveStreamRepo.create(ls));
    }
  }
  console.log('✅ Live streams seeded');

  // 8. Create Gallery Albums & Videos
  const galleryItems = [
    {
      title: 'Technorazz 2025 · Aftermovie',
      album: 'Technorazz Highlights',
      count: 140,
      cover: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      youtube_id: '93vaScGAqkE',
      duration: '3:42',
    },
    {
      title: 'Freshers Party 2025 · Mr & Ms Fresher',
      album: 'Campus Celebrations',
      count: 85,
      cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
      youtube_id: '93vaScGAqkE',
      duration: '4:20',
    },
    {
      title: 'Sports Meet 2025 · Cricket Final',
      album: 'Sports & Athletics',
      count: 67,
      cover: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
      youtube_id: '93vaScGAqkE',
      duration: '6:15',
    },
    {
      title: 'Rang 2025 · Classical Night',
      album: 'Cultural Heritage',
      count: 92,
      cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      youtube_id: '93vaScGAqkE',
      duration: '5:08',
    },
  ];

  for (const gi of galleryItems) {
    const existing = await galleryRepo.findOne({ where: { title: gi.title } });
    if (!existing) {
      await galleryRepo.save(galleryRepo.create(gi));
    }
  }
  console.log('✅ Gallery albums seeded');

  // 9. Create Certificates
  const certificates = [
    {
      id: 'trz2025',
      code: 'JNU-TRZ25-A94F2',
      title: 'Technorazz 2025',
      kind: 'Participation Certificate',
      recipient_name: 'Priya Sharma',
      reg_id: 'JNU2025TR01',
      event_name: 'Technorazz 2025',
      position: 'Participant',
      signature: 'ed25519-sig-trz-94f2',
      url: 'https://jnujaipur.ac.in/verify/JNU-TRZ25-A94F2',
    },
    {
      id: 'hack2025',
      code: 'JNU-HK25-77BC1',
      title: 'Hackathon 2025',
      kind: 'Winner Certificate',
      recipient_name: 'Karan Mehta',
      reg_id: 'JNU2025HK07',
      event_name: 'Technorazz Hackathon 2025',
      position: '1st Place Winner',
      signature: 'ed25519-sig-hk-77bc1',
      url: 'https://jnujaipur.ac.in/verify/JNU-HK25-77BC1',
    },
    {
      id: 'photo2025',
      code: 'JNU-PH25-33EE9',
      title: 'Photography Contest 2025',
      kind: 'Appreciation Certificate',
      recipient_name: 'Meera Nair',
      reg_id: 'JNU2025PH04',
      event_name: 'Campus Lens 2025',
      position: 'Top 5 Finalist',
      signature: 'ed25519-sig-ph-33ee9',
      url: 'https://jnujaipur.ac.in/verify/JNU-PH25-33EE9',
    },
    {
      id: 'sports2025',
      code: 'JNU-SP25-52AA0',
      title: 'Sports Meet 2025',
      kind: 'Participation Certificate',
      recipient_name: 'Rahul Verma',
      reg_id: 'JNU2025SP12',
      event_name: 'Annual Sports Meet 2025',
      position: 'Participant',
      signature: 'ed25519-sig-sp-52aa0',
      url: 'https://jnujaipur.ac.in/verify/JNU-SP25-52AA0',
    },
  ];

  for (const c of certificates) {
    const existing = await certificateRepo.findOne({ where: { code: c.code } });
    if (!existing) {
      await certificateRepo.save(certificateRepo.create(c));
    }
  }
  console.log('✅ Certificates seeded');

  // 10. Create Notifications
  const notifications = [
    {
      title: 'Registration Confirmed for Technorazz 2026',
      body: 'Your registration pass for Technorazz 2026 has been generated. Show your QR Pass at Plus Gate for seamless check-in.',
      message: 'Your registration pass for Technorazz 2026 has been generated. Show your QR Pass at Plus Gate for seamless check-in.',
      audience: 'all',
      unread: true,
      time: '2h ago',
    },
    {
      title: 'Star-Vibes Concert Lineup Announced',
      body: 'Catch Tej Gill, DJ Tan, Snehi Live, and Rishabh Chaturvedi live on the Central Lawn Mega Stage from 29th Sept to 1st Oct!',
      message: 'Catch Tej Gill, DJ Tan, Snehi Live, and Rishabh Chaturvedi live on the Central Lawn Mega Stage from 29th Sept to 1st Oct!',
      audience: 'all',
      unread: true,
      time: '1d ago',
    },
    {
      title: 'Live Voting is Now Active',
      body: 'Cast your vote for The Great Dance Challenge and Stage on Rage finalists on the campus leaderboard.',
      message: 'Cast your vote for The Great Dance Challenge and Stage on Rage finalists on the campus leaderboard.',
      audience: 'all',
      unread: false,
      time: '2d ago',
    },
  ];

  for (const n of notifications) {
    const existing = await notificationRepo.findOne({ where: { title: n.title } });
    if (!existing) {
      await notificationRepo.save(notificationRepo.create(n));
    }
  }
  console.log('✅ Notifications seeded');

  // 11. Create Alumni & Job Board
  const alumniList = [
    {
      name: 'Rohit Malhotra',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      batch: '2018',
      course: 'B.Tech CSE',
      role: 'Staff Software Engineer',
      company: 'Google',
      city: 'Bengaluru',
    },
    {
      name: 'Neha Gupta',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      batch: '2019',
      course: 'MBA',
      role: 'Product Lead',
      company: 'Razorpay',
      city: 'Bengaluru',
    },
    {
      name: 'Arjun Iyer',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      batch: '2020',
      course: 'BCA',
      role: 'Founder & CEO',
      company: 'PixelForge Studio',
      city: 'Pune',
    },
    {
      name: 'Sneha Reddy',
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
      batch: '2017',
      course: 'MCA',
      role: 'Engineering Manager',
      company: 'Microsoft',
      city: 'Hyderabad',
    },
    {
      name: 'Vikram Bose',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      batch: '2016',
      course: 'MBA',
      role: 'VP Marketing',
      company: 'Swiggy',
      city: 'Bengaluru',
    },
  ];

  for (const a of alumniList) {
    const existing = await alumnusRepo.findOne({ where: { name: a.name } });
    if (!existing) {
      await alumnusRepo.save(alumnusRepo.create(a));
    }
  }

  const jobsList = [
    { title: 'Graduate SDE Intern', company: 'Google', location: 'Bengaluru', type: 'Internship' },
    { title: 'Product Analyst', company: 'Razorpay', location: 'Remote', type: 'Full-time' },
    { title: 'UI / UX Designer', company: 'PixelForge Studio', location: 'Pune', type: 'Full-time' },
    { title: 'Growth Marketing Associate', company: 'Swiggy', location: 'Bengaluru', type: 'Full-time' },
  ];

  for (const j of jobsList) {
    const existing = await jobRepo.findOne({ where: { title: j.title } });
    if (!existing) {
      await jobRepo.save(jobRepo.create(j));
    }
  }
  console.log('✅ Alumni & Jobs seeded');

  // 12. Create Official Sponsors
  const sponsors = [
    { name: 'State Bank of India', tier: 'title', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-Logo.svg', url: 'https://sbi.co.in' },
    { name: 'Red Bull Energy', tier: 'gold', logo: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200&auto=format&fit=crop&q=80', url: 'https://redbull.com' },
    { name: 'GeeksforGeeks', tier: 'tech_partner', logo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=80', url: 'https://geeksforgeeks.org' },
  ];

  for (const sp of sponsors) {
    const existing = await sponsorRepo.findOne({ where: { name: sp.name } });
    if (!existing) {
      await sponsorRepo.save(sponsorRepo.create(sp));
    }
  }

  // 13. App Settings
  const settings = [
    { key: 'site_name', value: 'JNU Connect Hub' },
    { key: 'fest_dates', value: '29 September – 01 October 2026' },
    { key: 'fest_theme', value: 'Technorazz 2026: Inspiring Innovation & Celebrating Culture' },
    { key: 'voting_enabled', value: 'true' },
    { key: 'registration_open', value: 'true' },
    { key: 'announcement_banner', value: 'Technorazz 2026 Official Schedule and Entry Passes are now live! Check in with your digital QR pass at Plus Gate.' },
  ];

  for (const s of settings) {
    const existing = await settingRepo.findOne({ where: { key: s.key } });
    if (!existing) {
      await settingRepo.save(settingRepo.create(s));
    }
  }

  console.log('🎉 Full Database Seeding Completed Successfully in PostgreSQL!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
