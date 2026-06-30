FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy backend app
COPY apps/backend ./apps/backend

# Copy prisma schema
COPY prisma ./prisma

# Install dependencies
RUN npm ci --omit=dev

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

CMD ["node", "apps/backend/src/index.js"]