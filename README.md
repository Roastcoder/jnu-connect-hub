# JNU Connect Hub 🎓

**Jaipur National University — Campus Event Management Platform**

A modern full-stack web application with a standalone **NestJS backend** and **TanStack React frontend**, featuring dedicated role-based portals for Students, Super Admins, Department Admins, Event Coordinators, and Event Gate Staff.

---

## Architecture Overview

```
JNU Connect Hub/
├── backend/                  # NestJS REST API Backend
│   ├── src/
│   │   ├── auth/             # JWT Authentication & Role Guards
│   │   ├── entities/         # TypeORM Database Entities
│   │   ├── roles/            # Role-Specific Services & Controllers
│   │   │   ├── admin/        # Super Admin module
│   │   │   ├── dept-admin/   # Department Admin module
│   │   │   ├── coordinator/  # Event Coordinator module
│   │   │   ├── staff/        # Staff / Gate Scanner module
│   │   │   └── student/      # Student & Public module
│   │   ├── crud/             # Universal Data CRUD Module
│   │   ├── seed/             # Database Seeder (sample users & events)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── src/                      # TanStack React Frontend
│   ├── routes/               # Dedicated Role Pages & Routes
│   │   ├── admin.*.tsx       # Super Admin UI Pages
│   │   ├── dept-admin.*.tsx  # Department Admin UI Pages
│   │   ├── coordinator.*.tsx # Coordinator UI Pages
│   │   ├── staff.*.tsx       # Staff & QR Scanner UI Pages
│   │   └── *.tsx             # Student & Public UI Pages
│   ├── components/           # UI Components & Design System
│   ├── lib/                  # REST API Client & Auth
│   └── styles.css
│
├── package.json
└── vite.config.ts
```

---

## Quick Start Guide

### 1. Start the NestJS Backend

```bash
cd backend
npm install
npm run seed     # Seeds default users, departments & Technorazz events
npm run start:dev
```

The NestJS backend will start on **http://localhost:3000/api**  
Swagger API Docs available at **http://localhost:3000/api/docs**

### 2. Start the Frontend

In a separate terminal at the project root:

```bash
npm install
npm run dev
```

The frontend application will start on **http://localhost:5173**

---

## Default Role Accounts (Pre-Seeded)

| Role | Email | Password | Dedicated Portal |
|---|---|---|---|
| **Super Admin** | `admin@jnu.ac.in` | `Admin@123` | `/admin` |
| **Department Admin** | `deptadmin@jnu.ac.in` | `DeptAdmin@123` | `/dept-admin` |
| **Event Coordinator** | `coordinator@jnu.ac.in` | `Coord@123` | `/coordinator` |
| **Gate / Staff** | `staff@jnu.ac.in` | `Staff@123` | `/staff` |
| **Student** | `student@jnu.ac.in` | `Student@123` | `/profile` / `/events` |

---

## Key Features

- **Role-Separated Dashboards**: Completely independent UI pages and dedicated controllers for every single role.
- **Event & Sub-Event Management**: Complete lifecycle from registration, ticket generation with QR code, to attendance.
- **Gate Check-In / QR Scanner**: Fast ticket scanning with duplicate check-in prevention.
- **Live Voting & Leaderboard**: Real-time contestant voting with fraud protection.
- **Certificate Verification**: Cryptographically verifiable certificates with QR verification.
- **Department Analytics & Reports**: Live metrics for attendance, registrations, faculty, and student participation.
