# FitMap

A platform for discovering fitness venues, trainers, and schedules across Bulgarian cities.

## Tech Stack

- **Backend:** NestJS + TypeScript + TypeORM
- **Frontend:** React + TypeScript (Vite)
- **Database:** PostgreSQL 18
- **Runtime:** Docker + Docker Compose
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- pnpm

### Run with Docker

```bash
docker compose up --build
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3000
- **PostgreSQL:** localhost:5432

### Database

Migrations run automatically on server startup.

#### Seed data

```bash
cd server
pnpm seed
```

#### Generate a new migration

```bash
cd server
pnpm migration:generate src/migrations/MigrationName
```

## Environment Variables

| Variable          | Default     |
| ----------------- | ----------- |
| POSTGRES_HOST     | postgres    |
| POSTGRES_PORT     | 5432        |
| POSTGRES_USER     | fitmap      |
| POSTGRES_PASSWORD | fitmap_dev  |
| POSTGRES_DB       | fitmap      |
