# NGO School ERP

Production-grade, cloud-based ERP foundation for an NGO-operated free school.
The requirements in [`docs/`](./docs) are the single source of truth and must
be read in numeric order.

## Foundation and Phase One

This repository currently contains the approved Phase Zero foundation and Phase
One identity/security layer:

- Next.js App Router frontend
- Express TypeScript API
- Shared API response contracts
- Docker-ready services
- CI quality gates
- Supabase Auth with invite-only provisioning
- Profiles, roles, permissions, record scopes, and immutable security audits

Students, attendance, welfare, inventory, and all other business modules remain
excluded until their phases are approved.

## Requirements

- Node.js 24
- pnpm 11

Enable pnpm through Corepack:

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
```

## Setup

```bash
pnpm install
copy frontend\.env.example frontend\.env.local
copy backend\.env.example backend\.env
pnpm dev
```

The frontend runs at `http://localhost:3000` and the API at
`http://localhost:4000`.

## Quality Commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## API Operations

- `GET /api/v1/health` — process liveness
- `GET /api/v1/ready` — process and configuration readiness

Readiness confirms that required Supabase configuration is present. It does not
claim live database connectivity; database probes are deferred until a
business-data phase requires them.

## Phase One database and first Admin

Start the local Supabase stack, apply the migration, then bootstrap exactly one
Admin account:

```bash
pnpm db:start
pnpm db:reset
pnpm bootstrap:admin
```

Set the `BOOTSTRAP_ADMIN_*` values only for the one-time command, then remove
them. All later users are invited by an authorized Admin through the backend
API. Public signup is intentionally unavailable.

## Docker

```bash
docker compose up --build
```

Only synthetic data may be used in demos. Never commit real credentials,
beneficiary data, or Supabase service-role keys.
