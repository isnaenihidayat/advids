# AdvIDs - AI Video Creator SaaS

A monorepo SaaS platform for AI-generated video creation.

## Structure

```
advids/
├── apps/
│   ├── backend/     # Express.js API + Prisma ORM
│   └── frontend/    # Next.js + NextAuth.js
├── ugcmaker/        # Legacy single-user app (preserved)
└── package.json     # Monorepo root
```

## Phase 1 Foundation — Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Database

Create a PostgreSQL database:

```bash
createdb advids
```

Or with Docker:

```bash
docker run -d \
  --name advids-postgres \
  -e POSTGRES_DB=advids \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend

```bash
cd apps/backend

# Copy and edit env
cp .env.example .env

# Run migrations
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

Backend runs at `http://localhost:4000`.

### 3. Frontend

```bash
cd apps/frontend

# Copy and edit env
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Server port (default: 4000) |
| `CORS_ORIGIN` | Allowed CORS origin |

### Frontend (`apps/frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXTAUTH_URL` | NextAuth base URL |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `POST /api/auth/logout` — Logout

### Videos (requires auth)
- `GET /api/videos` — List videos
- `POST /api/videos` — Create video
- `GET /api/videos/:id` — Get video
- `PATCH /api/videos/:id` — Update video
- `DELETE /api/videos/:id` — Delete video

### Assets (requires auth)
- `GET /api/assets` — List assets
- `GET /api/assets/:id` — Get asset
- `DELETE /api/assets/:id` — Delete asset

### Queue (requires auth)
- `GET /api/queue` — List queue items
- `POST /api/queue` — Add to queue
- `GET /api/queue/:id` — Get queue item
- `PATCH /api/queue/:id` — Update queue item
- `DELETE /api/queue/:id` — Remove from queue

### Settings (requires auth)
- `GET /api/settings` — Get user settings
- `PATCH /api/settings` — Update settings

## Legacy App

The original single-user `ugcmaker/` app is preserved and still runnable:

```bash
cd ugcmaker && npm start