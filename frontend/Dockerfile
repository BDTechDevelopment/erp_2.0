# ── Stage 1: Instalar dependências ────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ── Stage 2: Build da aplicação ───────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: Runner de produção (imagem mínima) ───────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
