# Stage 1: builder
FROM node:20-alpine AS builder

WORKDIR /build

COPY packages/shared ./packages/shared
COPY apps/watcher ./apps/watcher
COPY apps/dashboard ./apps/dashboard

# Install and build shared package
WORKDIR /build/packages/shared
RUN npm install && npx tsc

# Install and build watcher
WORKDIR /build/apps/watcher
RUN npm install && npx tsc

# Install and build dashboard
WORKDIR /build/apps/dashboard
RUN npm install && npx tsc

# Stage 2: runner
FROM node:20-alpine AS runner

RUN npm install -g pm2

RUN mkdir -p /data /app/watcher /app/dashboard /app/shared

# Copy built artifacts
COPY --from=builder /build/packages/shared/dist /app/shared/dist
COPY --from=builder /build/packages/shared/package.json /app/shared/package.json

COPY --from=builder /build/apps/watcher/dist /app/watcher/dist
COPY --from=builder /build/apps/watcher/package.json /app/watcher/package.json

COPY --from=builder /build/apps/dashboard/dist /app/dashboard/dist
COPY --from=builder /build/apps/dashboard/package.json /app/dashboard/package.json

# Install production dependencies only
WORKDIR /app/watcher
RUN npm install --omit=dev

WORKDIR /app/dashboard
RUN npm install --omit=dev

WORKDIR /app

COPY ecosystem.config.js ./
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

CMD ["pm2-runtime", "ecosystem.config.js"]
