# FitMap — Architecture & Project Documentation

## Overview

FitMap is a bilingual (Bulgarian/English) web application for discovering fitness venues, trainers, and schedules across Bulgaria. Users can browse venues on a map, read reviews, save favorites, and manage their profiles. Venue owners can manage their venues, schedules, and photos. Admins have full control over users and venues.

---

## Tech Stack

| Layer       | Technology                                                    |
|-------------|---------------------------------------------------------------|
| Frontend    | React 19, TypeScript, Vite, React Router 7                   |
| Backend     | NestJS 11, TypeScript, TypeORM 0.3                            |
| Database    | PostgreSQL 18                                                 |
| Auth        | JWT (Passport.js) with role-based access control              |
| Maps        | Leaflet + react-leaflet + OpenStreetMap (no API key needed)   |
| File Upload | Multer (disk storage)                                         |
| API Docs    | Swagger (available at `/api/docs`)                            |
| Dev Infra   | Docker Compose (3 containers)                                 |
| Package Mgr | pnpm (both client and server)                                 |

---

## Project Structure

```
fitmap/
├── docker-compose.yml          # Orchestrates all 3 services
├── client/                     # React frontend (Vite)
│   ├── Dockerfile              # Dev: pnpm dev --host on port 5173
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx            # Entry point — renders <App />
│       ├── App.tsx             # Router setup, all routes defined here
│       ├── App.css             # All application styles (single file)
│       ├── index.css           # Global base styles
│       ├── api/                # Axios API client modules
│       │   ├── client.ts       # Axios instance (base URL, auth interceptor)
│       │   ├── auth.ts         # Signup, login, profile, avatar upload
│       │   ├── venues.ts       # CRUD, photos, verify, feature
│       │   ├── trainers.ts     # List, detail
│       │   ├── schedules.ts    # By venue, create, remove, day names
│       │   ├── reviews.ts      # By venue, create, delete
│       │   ├── favorites.ts    # List, toggle, get IDs
│       │   ├── cities.ts       # List all cities
│       │   ├── training-types.ts # List all training types
│       │   └── admin.ts        # Stats, users, role changes
│       ├── context/            # React Context providers
│       │   ├── AuthContext.tsx  # User state, JWT token, login/signup/logout
│       │   └── LangContext.tsx  # Language toggle (EN/BG), t() and td() helpers
│       ├── components/         # Shared UI components
│       │   ├── Layout.tsx      # Navbar + <Outlet /> wrapper
│       │   ├── Navbar.tsx      # Top navigation, hamburger menu, lang toggle
│       │   ├── Map.tsx         # VenueMap (single) + VenuesMap (multi-marker)
│       │   └── Stars.tsx       # StarsDisplay (read-only) + StarsInput (interactive)
│       ├── hooks/
│       │   └── useReveal.ts    # Scroll-reveal animations (IntersectionObserver)
│       └── pages/              # Route-level page components
│           ├── Home.tsx        # Hero, cities, map, training types, featured venues
│           ├── Venues.tsx      # Venue list with filters, pagination, map toggle, favorites
│           ├── VenueDetail.tsx # Full venue page: gallery, map, schedule, reviews, favorite
│           ├── Trainers.tsx    # Trainer list with search, pagination
│           ├── TrainerDetail.tsx # Trainer profile: bio, schedule
│           ├── Favorites.tsx   # User's saved venues
│           ├── Profile.tsx     # User profile: avatar, edit name/email/password, reviews
│           ├── Login.tsx       # Login form
│           ├── Signup.tsx      # Registration form
│           ├── Admin.tsx       # Admin dashboard: stats, users table, venues table
│           └── OwnerPanel.tsx  # Venue owner: CRUD venues, schedules, photos
│
└── server/                     # NestJS backend
    ├── Dockerfile              # Dev: pnpm start:dev (watch mode) on port 3000
    ├── package.json
    ├── nest-cli.json
    └── src/
        ├── main.ts             # Bootstrap: CORS, validation pipe, static assets, Swagger
        ├── app.module.ts       # Root module — registers all feature modules + TypeORM
        ├── data-source.ts      # TypeORM DataSource config (for CLI migrations)
        ├── entities/           # TypeORM entity definitions
        │   ├── index.ts        # Barrel export for all entities
        │   ├── user.entity.ts
        │   ├── city.entity.ts
        │   ├── training-type.entity.ts
        │   ├── venue.entity.ts
        │   ├── trainer.entity.ts
        │   ├── schedule.entity.ts
        │   ├── review.entity.ts
        │   └── favorite.entity.ts
        ├── migrations/         # TypeORM migrations (run automatically on startup)
        │   ├── 1712700000000-InitialSchema.ts
        │   ├── 1713020000000-TrainerBilingualNames.ts
        │   └── 1713020100000-Favorites.ts
        ├── seeds/
        │   └── seed.ts         # Seed script: cities, training types, users, venues, trainers, schedules, reviews
        ├── auth/               # Authentication & admin module
        │   ├── auth.module.ts
        │   ├── auth.controller.ts    # POST /auth/signup, POST /auth/login, GET/PATCH /auth/profile, POST /auth/profile/avatar
        │   ├── auth.service.ts       # Signup, login, profile CRUD, avatar
        │   ├── admin.controller.ts   # GET /admin/stats, GET /admin/users, PATCH role, DELETE user
        │   ├── admin.service.ts      # Dashboard stats, user management
        │   ├── jwt.strategy.ts       # Passport JWT strategy
        │   ├── guards/               # JwtAuthGuard, RolesGuard
        │   ├── decorators/           # @CurrentUser(), @Roles()
        │   └── dto/                  # SignupDto, LoginDto, UpdateProfileDto, AuthResponseDto
        ├── cities/             # GET /cities (public)
        ├── training-types/     # GET /training-types (public)
        ├── venues/             # Full CRUD + photos + verify/feature
        ├── trainers/           # CRUD (owner/admin write, public read)
        ├── schedules/          # CRUD (owner/admin write, public read)
        ├── reviews/            # Create (authenticated), delete (own/admin), read (public)
        └── favorites/          # Toggle, list (authenticated only)
```

---

## Docker Compose Architecture

```
┌────────────────────────────────────────────────┐
│                Docker Compose                   │
│                                                 │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐ │
│  │ postgres │◄──│  server  │◄──│   client   │ │
│  │ :5432    │   │  :3000   │   │   :5173    │ │
│  └──────────┘   └──────────┘   └────────────┘ │
│    pgdata vol    ./server vol   ./client vol   │
└────────────────────────────────────────────────┘
```

**Services:**

| Service    | Image/Build     | Port  | Purpose                              |
|------------|-----------------|-------|--------------------------------------|
| `postgres` | postgres:18     | 5432  | Database with health check           |
| `server`   | ./server        | 3000  | NestJS API (dev mode with --watch)   |
| `client`   | ./client        | 5173  | Vite dev server with HMR             |

**Volume mounts:** Both `server` and `client` mount their source directories for live reload. Anonymous volumes (`/app/node_modules`) prevent host `node_modules` from overriding container dependencies.

**Startup order:** `postgres` starts first (with healthcheck). `server` waits for postgres to be healthy. `client` waits for `server`.

**Important:** Use `docker compose up -d --build -V` to recreate anonymous volumes when dependencies change.

---

## Database Schema (Entity Relationship)

```
users                          cities                 training_types
├── id (uuid, PK)              ├── id (serial, PK)    ├── id (serial, PK)
├── name                       ├── name_bg            ├── name_bg
├── email (unique)             ├── name_en            ├── name_en
├── password_hash              └── slug (unique)      ├── slug (unique)
├── role (enum: user/owner/admin)                     └── icon
├── avatar_url
├── preferred_language (enum: bg/en)
└── created_at
     │
     │ 1:N                    N:1
     ▼                         │
   venues ─────────────────────┘ (city_id → cities)
   ├── id (uuid, PK)
   ├── owner_id (FK → users)
   ├── name
   ├── description_bg / description_en
   ├── address
   ├── city_id (FK → cities)
   ├── latitude / longitude (decimal)
   ├── phone / email / website
   ├── price_range (enum: $ / $$ / $$$)
   ├── amenities (jsonb array)
   ├── photos (jsonb array of URL strings)
   ├── is_verified / is_featured (boolean)
   └── created_at / updated_at
        │
        ├── N:M ──── venue_training_types ──── training_types
        │            (venue_id, training_type_id)
        │
        │ 1:N
        ▼
      trainers
      ├── id (uuid, PK)
      ├── venue_id (FK → venues, CASCADE)
      ├── name_bg / name_en
      ├── bio_bg / bio_en
      ├── photo_url
      └── specialties (jsonb array)
           │
           │ 1:N (optional)
           ▼
         schedules
         ├── id (uuid, PK)
         ├── venue_id (FK → venues, CASCADE)
         ├── training_type_id (FK → training_types)
         ├── trainer_id (FK → trainers, nullable)
         ├── day_of_week (0=Sun, 1=Mon, ..., 6=Sat)
         └── start_time / end_time (TIME)

      reviews
      ├── id (uuid, PK)
      ├── venue_id (FK → venues, CASCADE)
      ├── user_id (FK → users, CASCADE)
      ├── rating (integer 1-5)
      ├── comment (text)
      └── created_at

      favorites
      ├── id (uuid, PK)
      ├── user_id (FK → users, CASCADE)
      ├── venue_id (FK → venues, CASCADE)
      ├── created_at
      └── UNIQUE(user_id, venue_id)
```

---

## API Endpoints

### Auth (`/auth`)
| Method | Path                  | Auth    | Description                    |
|--------|-----------------------|---------|--------------------------------|
| POST   | `/auth/signup`        | Public  | Register new user              |
| POST   | `/auth/login`         | Public  | Login, returns JWT             |
| GET    | `/auth/profile`       | JWT     | Get profile with reviews       |
| PATCH  | `/auth/profile`       | JWT     | Update name/email/password     |
| POST   | `/auth/profile/avatar`| JWT     | Upload avatar (multipart)      |

### Admin (`/admin`)
| Method | Path                    | Auth  | Description              |
|--------|-------------------------|-------|--------------------------|
| GET    | `/admin/stats`          | Admin | Dashboard statistics     |
| GET    | `/admin/users`          | Admin | List all users           |
| PATCH  | `/admin/users/:id/role` | Admin | Change user role         |
| DELETE | `/admin/users/:id`      | Admin | Delete user              |

### Venues (`/venues`)
| Method | Path                    | Auth         | Description                    |
|--------|-------------------------|--------------|--------------------------------|
| GET    | `/venues`               | Public       | List all venues                |
| GET    | `/venues/:id`           | Public       | Venue detail with relations    |
| POST   | `/venues`               | Owner/Admin  | Create venue                   |
| PATCH  | `/venues/:id`           | Owner/Admin  | Update venue                   |
| DELETE | `/venues/:id`           | Owner/Admin  | Delete venue                   |
| POST   | `/venues/:id/photos`    | Owner/Admin  | Upload photo (multipart)       |
| DELETE | `/venues/:id/photos`    | Owner/Admin  | Remove photo                   |
| PATCH  | `/venues/:id/verify`    | Admin        | Toggle verification            |
| PATCH  | `/venues/:id/feature`   | Admin        | Toggle featured status         |

### Trainers (`/trainers`)
| Method | Path              | Auth         | Description                          |
|--------|-------------------|--------------|--------------------------------------|
| GET    | `/trainers`       | Public       | List all (optional `?venue_id=`)     |
| GET    | `/trainers/:id`   | Public       | Trainer detail with schedules        |
| POST   | `/trainers`       | Owner/Admin  | Add trainer to venue                 |
| PATCH  | `/trainers/:id`   | Owner/Admin  | Update trainer                       |
| DELETE | `/trainers/:id`   | Owner/Admin  | Remove trainer                       |

### Schedules (`/schedules`)
| Method | Path               | Auth         | Description                        |
|--------|--------------------|--------------|------------------------------------|
| GET    | `/schedules`       | Public       | List by venue (`?venue_id=`)       |
| GET    | `/schedules/:id`   | Public       | Get single schedule                |
| POST   | `/schedules`       | Owner/Admin  | Create schedule entry              |
| PATCH  | `/schedules/:id`   | Owner/Admin  | Update schedule entry              |
| DELETE | `/schedules/:id`   | Owner/Admin  | Delete schedule entry              |

### Reviews (`/reviews`)
| Method | Path             | Auth          | Description                     |
|--------|------------------|---------------|---------------------------------|
| GET    | `/reviews`       | Public        | List by venue (`?venue_id=`)    |
| POST   | `/reviews`       | Authenticated | Create review                   |
| DELETE | `/reviews/:id`   | Own/Admin     | Delete review                   |

### Favorites (`/favorites`)
| Method | Path                    | Auth          | Description                     |
|--------|-------------------------|---------------|---------------------------------|
| GET    | `/favorites`            | Authenticated | List favorites with venue data  |
| GET    | `/favorites/ids`        | Authenticated | List favorited venue IDs only   |
| POST   | `/favorites/:venueId`   | Authenticated | Toggle favorite on/off          |

### Reference Data
| Method | Path              | Auth   | Description           |
|--------|-------------------|--------|-----------------------|
| GET    | `/cities`         | Public | All cities            |
| GET    | `/training-types` | Public | All training types    |

---

## Authentication Flow

```
Client                          Server
  │                               │
  ├── POST /auth/signup ─────────►│ Hash password (bcrypt, 10 rounds)
  │   { name, email, password }   │ Save user to DB
  │◄── { access_token, user } ────│ Sign JWT { sub: user.id, email, role }
  │                               │
  │  Store token in localStorage  │
  │  Store user in localStorage   │
  │                               │
  ├── GET /venues ────────────────►│ (public — no auth needed)
  │   Authorization: Bearer <jwt> │
  │                               │
  ├── POST /favorites/:id ────────►│ JwtAuthGuard extracts JWT from header
  │   Authorization: Bearer <jwt> │ JwtStrategy.validate() → { id, email, role }
  │                               │ @CurrentUser() injects user into handler
  │                               │ Service checks permissions
  │◄── { favorited: true } ───────│
```

**JWT payload:** `{ sub: userId, email, role }` — expires in 7 days.

**Guards:**
- `JwtAuthGuard` — verifies JWT token, rejects 401 if invalid/missing
- `RolesGuard` — reads `@Roles()` decorator metadata, rejects 403 if user role doesn't match

**Roles:** `user` (default), `owner` (can manage own venues), `admin` (full access)

---

## Client-Side Architecture

### Context Providers

The app wraps all routes in two context providers:

```tsx
<LangProvider>        // Language state (en/bg), persisted to localStorage
  <AuthProvider>      // User/token state, persisted to localStorage
    <BrowserRouter>
      <Routes>...</Routes>
    </BrowserRouter>
  </AuthProvider>
</LangProvider>
```

**LangContext** provides:
- `lang` — current language (`'en'` or `'bg'`)
- `toggleLang()` — switches between EN/BG
- `t(item)` — returns `item.name_en` or `item.name_bg` based on lang
- `td(item)` — returns `item.description_en` or `item.description_bg`

**AuthContext** provides:
- `user` — current user object (`{ id, name, email, role }`) or `null`
- `token` — JWT string or `null`
- `login(data)` / `signup(data)` — authenticate and store credentials
- `logout()` — clear credentials
- `refreshUser(response)` — update stored user after profile edits

### API Client

All API calls go through a shared Axios instance (`client/src/api/client.ts`) that:
1. Sets `baseURL` to `VITE_API_URL` (defaults to `http://localhost:3000`)
2. Attaches `Authorization: Bearer <token>` header via request interceptor (if token exists in localStorage)

Each feature has its own API module (e.g., `venues.ts`, `trainers.ts`) that exports typed functions.

### Routing

```
/                     → Home (hero, cities, map, training types, featured venues)
/venues               → Venues (list + filters + map toggle + pagination + favorites)
/venues/:id           → VenueDetail (gallery, info, map, schedule, reviews, favorite)
/trainers             → Trainers (search + pagination)
/trainers/:id         → TrainerDetail (bio, schedule)
/favorites            → Favorites (saved venues, requires auth)
/profile              → Profile (avatar, edit info, reviews, requires auth)
/login                → Login form
/signup               → Registration form
/admin                → Admin dashboard (requires admin role)
/my-venues            → OwnerPanel (requires owner/admin role)
```

All routes are wrapped in a `<Layout>` component that renders `<Navbar />` above an `<Outlet />`.

### Key UI Patterns

**Bilingual support:** Every user-facing string uses `lang === 'bg' ? 'Текст' : 'Text'` ternaries. Entity names use `t(entity)` which reads `name_bg` or `name_en`. Descriptions use `td(entity)`.

**Map integration:** Leaflet maps use OpenStreetMap tiles (free, no API key). The `Map.tsx` component exports `VenueMap` (single marker) and `VenuesMap` (multiple markers with popups). The home page lazy-loads the map with `React.lazy()` + `<Suspense>`.

**Star ratings:** `StarsDisplay` renders read-only stars with SVG `linearGradient` for partial fill (e.g., 4.3 stars). `StarsInput` renders clickable stars with hover preview.

**Scroll animations:** `useRevealAll()` uses `IntersectionObserver` + `MutationObserver` to add a `.visible` class to `.reveal` elements as they enter the viewport. Child staggering is done with CSS `transition-delay`.

**Pagination:** Client-side pagination with `useMemo` slicing. 12 items per page on Venues and Trainers pages.

**Favorites:** Heart buttons on venue cards and detail pages. Venue list fetches favorite IDs on mount to show filled/empty hearts. Toggle sends `POST /favorites/:venueId` which creates or deletes the record.

---

## Server-Side Architecture

### Module Structure

NestJS organizes code into feature modules. Each module has:
- **Module file** — declares imports, controllers, providers
- **Controller** — route handlers with decorators for auth, validation, Swagger
- **Service** — business logic, database access via TypeORM repositories
- **DTOs** — request validation with `class-validator` decorators

```
AppModule
├── AuthModule (User, Venue, Review entities)
│   ├── AuthController    → /auth/*
│   ├── AuthService       → signup, login, profile
│   ├── AdminController   → /admin/*
│   ├── AdminService      → stats, user management
│   └── JwtStrategy       → Passport JWT validation
├── CitiesModule (City entity)
│   └── /cities
├── TrainingTypesModule (TrainingType entity)
│   └── /training-types
├── VenuesModule (Venue, TrainingType entities)
│   └── /venues/*
├── TrainersModule (Trainer, Venue entities)
│   └── /trainers/*
├── SchedulesModule (Schedule, Venue entities)
│   └── /schedules/*
├── ReviewsModule (Review, Venue entities)
│   └── /reviews/*
└── FavoritesModule (Favorite entity)
    └── /favorites/*
```

### Request Pipeline

```
HTTP Request
  │
  ▼
  CORS (enabled for all origins)
  │
  ▼
  Global ValidationPipe (whitelist: true — strips unknown properties)
  │
  ▼
  Route matching → Controller method
  │
  ├── @UseGuards(JwtAuthGuard) → Passport extracts/validates JWT
  ├── @UseGuards(RolesGuard)   → Checks @Roles() against user.role
  ├── @UseInterceptors(FileInterceptor) → Multer handles file upload
  │
  ▼
  DTO validation (class-validator)
  │
  ▼
  Service method → TypeORM Repository → PostgreSQL
  │
  ▼
  JSON Response
```

### File Uploads

Multer with `diskStorage` saves files to the `uploads/` directory:
- **Venue photos:** `uploads/venues/<uuid>.<ext>` — max 5MB, images only
- **User avatars:** `uploads/avatars/<uuid>.<ext>` — max 5MB, images only

The server serves `uploads/` as static assets (configured in `main.ts`). The client resolves photo URLs by prepending `VITE_API_URL` to paths starting with `/`.

### Migrations

TypeORM migrations run automatically on server startup (`migrationsRun: true` in the TypeORM config). Migration files are in `server/src/migrations/`:

1. **InitialSchema** — Creates all tables, enums, foreign keys, and constraints
2. **TrainerBilingualNames** — Adds `name_bg`/`name_en` to trainers, copies data from `name`, drops `name`
3. **Favorites** — Creates the `favorites` table with unique user-venue constraint

To create a new migration: `pnpm migration:generate src/migrations/MigrationName`

### Seeding

The seed script (`pnpm seed`) populates the database with:
- 5 cities (Sofia, Plovdiv, Varna, Burgas, Stara Zagora)
- 12 training types (MMA, Boxing, Yoga, CrossFit, etc.)
- 5 users (1 admin, 2 owners, 2 regular users) — all with password `password123`
- 6 venues across different cities
- 5 trainers with bilingual names
- 14 schedule entries
- 7 reviews

The seed is idempotent — it checks for existing records before inserting.

---

## Environment Variables

### Server
| Variable          | Default              | Description                    |
|-------------------|----------------------|--------------------------------|
| `POSTGRES_HOST`   | `localhost`          | Database host                  |
| `POSTGRES_PORT`   | `5432`               | Database port                  |
| `POSTGRES_USER`   | `fitmap`             | Database user                  |
| `POSTGRES_PASSWORD`| `fitmap_dev`        | Database password              |
| `POSTGRES_DB`     | `fitmap`             | Database name                  |
| `JWT_SECRET`      | `fitmap_jwt_dev_secret` | JWT signing secret          |
| `DATABASE_URL`    | (none)               | Full connection URL (overrides individual vars) |
| `PORT`            | `3000`               | Server listen port             |

### Client
| Variable        | Default              | Description                 |
|-----------------|----------------------|-----------------------------|
| `VITE_API_URL`  | `http://localhost:3000` | Backend API base URL      |

---

## Development Workflow

### Start development environment
```bash
docker compose up -d --build -V
```

### Re-seed the database
```bash
docker compose exec server pnpm seed
```

### Run a migration
```bash
docker compose exec server pnpm migration:run
```

### TypeScript check
```bash
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

### Access points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Swagger docs:** http://localhost:3000/api/docs
- **Database:** localhost:5432 (user: fitmap, password: fitmap_dev, db: fitmap)

### Test accounts (after seeding)
| Email              | Password     | Role  |
|--------------------|-------------|-------|
| admin@fitmap.bg    | password123 | admin |
| ivan@fitmap.bg     | password123 | owner |
| maria@fitmap.bg    | password123 | owner |
| georgi@fitmap.bg   | password123 | user  |
| elena@fitmap.bg    | password123 | user  |
