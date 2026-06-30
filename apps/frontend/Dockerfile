FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/frontend ./apps/frontend

RUN npm ci

RUN npm run build --workspace=@advids/frontend

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/

RUN cd apps/frontend && npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "start", "--workspace=@advids/frontend"]