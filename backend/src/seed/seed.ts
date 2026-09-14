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
  const judgeRepo = dataSource.getRepository(Judge);
  const specialGuestRepo = dataSource.getRepository(SpecialGuest);
  const sponsorRepo = dataSource.getRepository(Sponsor);
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
      name: 'Aarav Sharma',
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
        enrollment: 'JNU/' + Math.floor(100000 + Math.random() * 900000),
        course: 'B.Tech / MCA',
        college: u.college,
        avatar_url: '',
      });
      await profileRepo.save(profile);

      const userRole = roleRepo.create({
        user_id: savedUser.id,
        role: u.role as any,
      });
      await roleRepo.save(userRole);
      console.log(`✅ Created ${u.role} user: ${u.email} / ${u.password}`);
    }
  }

  // 2. Create Departments from Official PDF Committee List
  const defaultDepts = [
    { name: 'School of Engineering & Technology (SOET)', code: 'SOET', head_name: 'Prof. E.V.D. Sastry' },
    { name: 'School of Computer & Systems Sciences (SCSS)', code: 'SCSS', head_name: 'Prof. Rohit Singhal' },
    { name: 'School of Hotel Management & Catering Tech (SHMCT)', code: 'SHMCT', head_name: 'Dr. Jaspreet Singh' },
    { name: 'School of Pharmaceutical Sciences (SPS)', code: 'SPS', head_name: 'Dr. Shubhranshu Panda' },
    { name: 'School of Media & Mass Communication', code: 'SMMC', head_name: 'Dr. (Mrs.) Preeti Bakshi' },
    { name: 'School of Business & Management (SOBM)', code: 'SOBM', head_name: 'Dr. Sumit Govil' },
    { name: 'School of Law & Governance (SOLG)', code: 'SOLG', head_name: 'Prof. S.K. Joshi' },
  ];

  for (const d of defaultDepts) {
    const existing = await deptRepo.findOne({ where: { code: d.code } });
    if (!existing) {
      await deptRepo.save(deptRepo.create(d));
      console.log(`✅ Created department: ${d.code}`);
    }
  }

  // 3. Create Technorazz 2026 Official Events from Brochure PDF
  const officialEvents = [
    {
      id: 'technorazz-2026',
      name: 'Technorazz 2026 — Mega Fest',
      tagline: 'The Grand Annual National Techno-Cultural Fest of JNU',
      category: 'Fest',
      description:
        '3-day National Mega Fest across Main Campus and SADTM Campus. Featuring 50+ inter-college competitions in Tech, Cultural, Sports, Fine Arts, and Fashion with prizes worth ₹5 Lakhs.',
      venue: 'JNU Main Ground & SADTM Campus, Jaipur',
      start_date: new Date('2026-09-29T09:00:00Z'),
      end_date: new Date('2026-10-01T22:00:00Z'),
      price: 0,
      seats_left: 3000,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Valid College / JNU ID Card is mandatory for entry.',
        'Registration pass QR code must be presented at the gate.',
        'Participants must report to their respective convener 2 hours before the event start.',
        'Follow campus decorum and dress code at all times.',
      ],
    },
    {
      id: 'cyclothon-2026',
      name: 'Cyclothon 2026',
      tagline: 'Ride the campus — Plus Gate to SADTM Main Gate.',
      category: 'Sports',
      description:
        'An in-house cycling rally for JNU students flagged off at Plus Gate and finishing at SADTM Main Gate with pilot lead vehicles and medical teams.',
      venue: 'Plus Gate (Main Campus) to SADTM Main Gate',
      start_date: new Date('2026-09-29T10:30:00Z'),
      end_date: new Date('2026-09-29T12:00:00Z'),
      price: 0,
      seats_left: 200,
      image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Open to Jaipur National University students only.',
        'Bicycles must have working brakes and properly inflated tyres.',
        'Motorised or e-bikes are strictly prohibited.',
        'Report at least 30 minutes before flag-off at Plus Gate.',
      ],
    },
    {
      id: 'hackathon-2026',
      name: 'Technorazz Hackathon & Media Hack 180°',
      tagline: 'Build, Code and Innovate in one high-octane sprint.',
      category: 'Tech',
      description:
        'National 24-hour hackathon with AI, Web3, IoT and Media Hack 180° challenges (Edit Wars & Silent Sell). Prizes worth ₹1.5 Lakhs.',
      venue: 'MCA Block & Filmtech Auditorium, SADTM Campus',
      start_date: new Date('2026-09-30T09:30:00Z'),
      end_date: new Date('2026-09-30T18:00:00Z'),
      price: 200,
      seats_left: 400,
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Team size: 2 to 4 members.',
        'All code and media assets must be developed during the event.',
        'Bring your own laptops and hardware kits.',
      ],
    },
    {
      id: 'dance-challenge-2026',
      name: 'The Great Dance Challenge',
      tagline: 'Western, Classical, Folk & Street Crews Battle for Glory.',
      category: 'Cultural',
      description:
        'Inter-college dance showdown featuring solo, duet, and mega-group choreographies on the Central Lawn Mega Stage.',
      venue: 'Central Lawn Mega Stage, SADTM Campus',
      start_date: new Date('2026-09-29T16:30:00Z'),
      end_date: new Date('2026-09-29T20:30:00Z'),
      price: 0,
      seats_left: 1500,
      image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Time limit: Solo (3-4 mins), Group (6-8 mins).',
        'Audio tracks must be submitted in MP3 format 2 hours prior.',
        'Costume and props must be self-arranged.',
      ],
    },
    {
      id: 'stage-on-rage-2026',
      name: 'Stage on Rage — Couture Runway',
      tagline: 'Theme-based high fashion & ramp walk competition.',
      category: 'Cultural',
      description:
        'The premier fashion runway of Technorazz showcasing innovative student design collections, choreography, and styling.',
      venue: 'Main Auditorium & Amphitheatre, SADTM Campus',
      start_date: new Date('2026-09-30T18:30:00Z'),
      end_date: new Date('2026-09-30T21:30:00Z'),
      price: 0,
      seats_left: 1200,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Minimum 8 models and 1 designer per team.',
        'Vulgarity or inappropriate costumes will lead to direct disqualification.',
        'Judging on Theme adherence, Walk, Coordination, and Garment Appeal.',
      ],
    },
    {
      id: 'robo-wars-2026',
      name: 'RoboWars & Robo Soccer',
      tagline: 'Steel against steel in the battle arena.',
      category: 'Tech',
      description:
        'Wired and wireless combat robot battle inside a reinforced polycarbonate enclosure, plus high-speed autonomous Robo Race and Robo Soccer.',
      venue: 'Mechanical Workshop Arena, SOET Block',
      start_date: new Date('2026-09-30T11:00:00Z'),
      end_date: new Date('2026-09-30T16:00:00Z'),
      price: 300,
      seats_left: 150,
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
      rules: [
        'Bot weight class: 15kg & 30kg.',
        'Pneumatic and spinning weapon systems must have safety lock-pins.',
      ],
    },
  ];

  for (const ev of officialEvents) {
    const existing = await eventRepo.findOne({ where: { id: ev.id } });
    if (!existing) {
      await eventRepo.save(eventRepo.create(ev));
      console.log(`✅ Created event: ${ev.name}`);
    }
  }

  // 4. Create Official Sub-Events from Technorazz Schedule PDF
  const subEvents = [
    { event_id: 'technorazz-2026', name: 'Battle of the Bands (Rock & Fusion)', description: 'Live instruments band clash', fee: 500 },
    { event_id: 'technorazz-2026', name: 'Nukkad Natak (Street Play)', description: 'Social awakening theatre contest', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Tug of War Championship', description: 'Inter-department strength showdown', fee: 0 },
    { event_id: 'technorazz-2026', name: 'Arm Wrestling Challenge', description: 'Weight categories for Boys and Girls', fee: 50 },
    { event_id: 'technorazz-2026', name: 'Rangoli & Face Painting', description: 'Creative theme-based art contest', fee: 0 },
    { event_id: 'hackathon-2026', name: 'Media Hack 180° — Edit Wars', description: 'Raw footage narrative editing duel', fee: 0 },
    { event_id: 'hackathon-2026', name: 'Media Hack 180° — Silent Sell', description: 'Ad storytelling using zero dialogue', fee: 0 },
    { event_id: 'dance-challenge-2026', name: 'Solo Classical & Western Dance', description: 'Individual spotlight performances', fee: 100 },
    { event_id: 'dance-challenge-2026', name: 'Mega Group Dance Battle', description: 'Full squad choreography clash', fee: 300 },
  ];

  for (const sub of subEvents) {
    const existing = await subEventRepo.findOne({ where: { name: sub.name } });
    if (!existing) {
      await subEventRepo.save(subEventRepo.create(sub));
    }
  }

  // 5. Create Contestants for Live Voting
  const contestants = [
    {
      name: 'Rohan Deshmukh',
      event_id: 'dance-challenge-2026',
      department: 'School of Computer & Systems Sciences',
      college: 'Jaipur National University',
      event_category: 'Dance Solo',
      bio: 'National level hip-hop and popping artist with 5+ years stage experience.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Ananya Singhania',
      event_id: 'dance-challenge-2026',
      department: 'School of Media & Mass Communication',
      college: 'Jaipur National University',
      event_category: 'Kathak & Fusion',
      bio: 'Classical Kathak exponent bringing dynamic fusion choreography to Technorazz 2026.',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'The Sonic Vibe Band',
      event_id: 'technorazz-2026',
      department: 'School of Engineering & Technology',
      college: 'Jaipur National University',
      event_category: 'Battle of Bands',
      bio: '5-piece alternative rock and Bollywood fusion band.',
      photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Team Velocity (Couture)',
      event_id: 'stage-on-rage-2026',
      department: 'School of Fashion & Design',
      college: 'Jaipur National University',
      event_category: 'Fashion Runway',
      bio: 'Theme: "Cyberpunk Heritage" — blending Rajasthani hand-block prints with futuristic cuts.',
      photo: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&auto=format&fit=crop&q=80',
    },
  ];

  for (const c of contestants) {
    const existing = await contestantRepo.findOne({ where: { name: c.name } });
    if (!existing) {
      await contestantRepo.save(contestantRepo.create(c));
    }
  }

  // 6. Create Sponsors from Official Brochure
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

  // 7. Default App Settings
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

  console.log('🎉 Seeding of official Technorazz PDF documents completed successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
