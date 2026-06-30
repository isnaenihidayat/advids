# Deployment Guide

## Local Development with Docker

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up

# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

### Run migrations inside Docker

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

## Local Development without Docker

```bash
# 1. Install dependencies
npm ci

# 2. Copy and fill env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 3. Run migrations
cd apps/backend && npx prisma migrate dev

# 4. Start backend
npm run dev --workspace=@advids/backend

# 5. Start frontend (separate terminal)
npm run dev --workspace=@advids/frontend
```

## Production Deployment

### 1. Set environment variables

Copy `.env.production.example` and fill in real values:

```bash
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 2. Build Docker images

```bash
docker build -f apps/backend/Dockerfile -t advids-backend:latest .
docker build -f apps/frontend/Dockerfile -t advids-frontend:latest .
```

### 3. Run migrations on production DB

```bash
DATABASE_URL=postgresql://... npx prisma migrate deploy
```

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs on every push to `main`/`develop`:

1. Spins up PostgreSQL service container
2. Installs deps, runs migrations
3. Lints and builds
4. Builds Docker images (main branch only)

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Production database URL |
| `JWT_SECRET` | JWT signing secret |
| `NEXTAUTH_SECRET` | NextAuth secret |

## Security Checklist

- [ ] Rotate all secrets from `.env.production.example`
- [ ] Enable HTTPS/TLS
- [ ] Set `CORS_ORIGIN` to exact frontend domain
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable audit logging