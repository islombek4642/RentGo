# 🚗 RentGo — Car Rental Platform

> A production-grade car rental platform built with Node.js, React Native (Expo), and Next.js. Features multi-role RBAC, real-time booking management, and a full admin panel.

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)
![React Native](https://img.shields.io/badge/React_Native-Expo-000020?logo=expo)
![Next.js](https://img.shields.io/badge/Next.js-14+-000000?logo=next.js)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Security](#-security-features)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Project](#-running-the-project)
- [API Overview](#-api-overview)
- [Folder Structure](#-folder-structure)
- [Testing](#-testing)
- [Deployment](#-production-deployment)
- [Roadmap](#-future-roadmap)

---

## ✨ Features

### 👤 User (Renter)

- Phone-based registration & JWT authentication
- Browse and filter cars by region, district, price
- Book cars with date-range selection & overlap prevention
- Cancel bookings, leave reviews
- Multi-language support (UZ, RU, OZ)

### 🏢 Owner

- Add/edit cars with image upload
- Manage incoming booking requests (confirm/reject)
- Start & complete trips
- Dashboard with booking statistics

### 🛡️ Admin Panel

- **User Management** — view, verify, deactivate, change roles
- **Car Moderation** — approve/reject pending cars
- **Booking Monitor** — oversee all bookings, intervene if needed
- **Audit Logs** — track all admin actions with metadata
- **Admin Management** — manage admin team (Super Admin only)

---

## 🏗 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Admin Panel    │    │    Backend API   │
│  React Native   │───▶│    Next.js 14    │───▶│  Express + PG   │
│     (Expo)      │    │   (App Router)   │    │   (REST API)    │
└─────────────────┘    └──────────────────┘    └────────┬────────┘
                                                        │
                                                  ┌─────▼─────┐
                                                  │ PostgreSQL │
                                                  └───────────┘
```

**Backend Pattern:** Modular MVC (Controller → Service → Repository)

---

## 🛠 Tech Stack

| Layer              | Technology                                       |
| ------------------ | ------------------------------------------------ |
| **Backend**  | Node.js 22, Express 4, PostgreSQL 15             |
| **Mobile**   | React Native (Expo), TypeScript, Zustand         |
| **Admin**    | Next.js 14, TypeScript, TailwindCSS, React Query |
| **Auth**     | JWT (Access + Refresh tokens with versioning)    |
| **Security** | Helmet, CORS, HPP, Rate Limiting, Advisory Locks |
| **Logging**  | Winston (structured), Sentry (production)        |
| **Storage**  | Multer (local file uploads)                      |

---

## 🔐 Security Features

| Feature                    | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| **RBAC**             | 6 roles: USER, OWNER, SUPPORT, MODERATOR, ADMIN, SUPER_ADMIN                  |
| **JWT Versioning**   | `token_version` field — tokens invalidated on password change/deactivation |
| **Advisory Locks**   | `pg_advisory_xact_lock(car_id)` prevents race conditions in bookings        |
| **Idempotency**      | `X-Idempotency-Key` header prevents duplicate booking requests              |
| **Soft Delete**      | All entities use `deleted_at` — no hard deletes                            |
| **Rate Limiting**    | Tiered: Auth (5/15min), Booking (10/min), Global (100/min)                    |
| **Admin Safety**     | Self-deactivation blocked, last Super Admin protected                         |
| **Input Validation** | Joi schemas on all mutating endpoints                                         |
| **Partial Indexes**  | Phone uniqueness only for non-deleted users                                   |

---

## 📦 Installation

### Prerequisites

- Node.js ≥ 22
- PostgreSQL ≥ 15
- Expo CLI (`npm install -g expo-cli`)

### Clone & Install

```bash
git clone https://github.com/your-repo/RentGo.git
cd RentGo

# Backend
npm install

# Mobile
cd mobile && npm install && cd ..

# Admin Panel
cd admin-web && npm install && cd ..
```

---

## ⚙️ Environment Setup

Create `.env` in the project root:

```env
# General
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
AUTO_DB_INIT=true

# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rentgo

# Security
JWT_SECRET=your_strong_jwt_secret_here
JWT_REFRESH_SECRET=your_strong_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Logging
LOG_LEVEL=info

# Storage
UPLOAD_PATH=uploads/

# Seeding (Development only)
SEED_ADMIN_PASSWORD=admin123
SEED_USER_PASSWORD=user123
```

---

## 🚀 Running the Project

### Backend

```bash
npm run dev
# Server starts on http://localhost:3000
# Database auto-initializes on first run (AUTO_DB_INIT=true)
```

### Mobile (Expo)

```bash
cd mobile
npx expo start --clear
# Scan QR with Expo Go app
```

### Admin Panel

```bash
cd admin-web
npm run dev
# Opens on http://localhost:3000 (or next available port)
```

---

## 📡 API Overview

Base URL: `http://localhost:3000/api/v1`

| Module              | Endpoint                               | Description                 |
| ------------------- | -------------------------------------- | --------------------------- |
| **Auth**      | `POST /auth/register`                | Register new user           |
|                     | `POST /auth/login`                   | Login with phone + password |
|                     | `POST /auth/refresh`                 | Refresh access token        |
|                     | `POST /auth/logout`                  | Revoke refresh token        |
| **Cars**      | `GET /cars`                          | List cars (with filters)    |
|                     | `POST /cars`                         | Create car (owner)          |
|                     | `PATCH /cars/:id`                    | Update car (owner)          |
| **Bookings**  | `POST /bookings`                     | Create booking              |
|                     | `GET /bookings/my`                   | User's bookings             |
|                     | `PATCH /bookings/:id/status`         | Update status               |
| **Admin**     | `GET /admin/users`                   | List users                  |
|                     | `PATCH /admin/users/:id/role`        | Change role                 |
|                     | `GET /admin/cars`                    | List all cars               |
|                     | `PATCH /admin/cars/:id/status`       | Approve/reject              |
|                     | `GET /admin/audit-logs`              | View audit trail            |
| **Locations** | `GET /locations/regions`             | All regions                 |
|                     | `GET /locations/districts/:regionId` | Districts                   |

Full Swagger docs: `http://localhost:3000/api-docs`

---

## 📁 Folder Structure

```
RentGo/
├── src/                        # Backend source
│   ├── config/                 # DB, env, logger, analytics
│   ├── constants/              # Roles, permissions, HTTP codes
│   ├── middleware/             # Auth, RBAC, security, error handling
│   │   ├── auth.middleware.js
│   │   ├── security.middleware.js
│   │   ├── error.middleware.js
│   │   └── idempotency.middleware.js
│   ├── modules/
│   │   ├── auth/               # Authentication (JWT)
│   │   ├── users/              # User profile management
│   │   ├── cars/               # Car CRUD + moderation
│   │   ├── bookings/           # Booking lifecycle
│   │   ├── reviews/            # Review system
│   │   ├── locations/          # Uzbekistan regions/districts
│   │   └── admin/              # Admin panel API
│   └── utils/                  # AppError, i18n, seed
├── mobile/                     # React Native (Expo)
│   └── src/
│       ├── screens/            # Auth, Main, Owner screens
│       ├── components/         # Reusable UI components
│       ├── services/           # API client (axios + retry)
│       ├── store/              # Zustand state management
│       └── i18n.ts             # Localization
├── admin-web/                  # Next.js Admin Panel
│   └── src/
│       ├── app/                # App Router pages
│       ├── modules/            # Feature modules
│       ├── components/         # Shared UI (Badge, Modal)
│       ├── services/           # API client
│       └── config/             # Roles, permissions
├── database/                   # SQL migrations
└── uploads/                    # User-uploaded images
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd mobile && npx jest --passWithNoTests

# API manual testing
# Swagger UI: http://localhost:3000/api-docs

# E2E (Maestro framework — see mobile/maestro/)
npx maestro test maestro/
```

---

## 🚢 Production Deployment

### Backend

```bash
NODE_ENV=production node src/server.js
```

### Key Production Checklist

- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Configure Sentry DSN for error tracking
- [ ] Set `AUTO_DB_INIT=false` after first deploy
- [ ] Use connection pooling (PgBouncer recommended)
- [ ] Enable HTTPS via reverse proxy (Nginx)
- [ ] Set up log rotation for Winston files

---

## 🔮 Future Roadmap

- [ ] Payment integration (Payme, Click)
- [ ] Push notifications (Expo Push)
- [ ] Real-time chat (Socket.io)
- [ ] Dashboard analytics with charts (Recharts)
- [ ] Docker Compose deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Car availability calendar sync
- [ ] Owner earnings dashboard

---

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ in Uzbekistan
