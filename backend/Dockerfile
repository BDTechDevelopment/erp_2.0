# ── Stage 1: Build + geração do Prisma Client ────────────────────────────────
FROM node:18-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

# ── Stage 2: Runner de produção ───────────────────────────────────────────────
FROM node:18-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node src/server.js"]
