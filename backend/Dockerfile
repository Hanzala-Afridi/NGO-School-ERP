FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json backend/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY backend backend
COPY packages packages
RUN pnpm --filter @ngo-school-erp/contracts build
RUN pnpm --filter @ngo-school-erp/backend build
RUN pnpm deploy --filter @ngo-school-erp/backend --prod /prod/backend

FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 api
COPY --from=builder --chown=api:nodejs /prod/backend ./
USER api
EXPOSE 4000
CMD ["node", "dist/server.js"]
