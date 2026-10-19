# Shule Connect

Shule Connect is a multi-school management platform from **Gramvista Empire Group**. It brings students, guardians, staff, attendance, fees, academic results, announcements and controlled SMS communication into one mobile-first workspace.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript and Tailwind CSS 4
- Supabase Auth, PostgreSQL, Row Level Security, Storage and Edge Functions
- OpenNext for Cloudflare Workers
- Vitest, Playwright and SQL tenant-isolation tests

## Start locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase variables, the dashboard shows clearly labelled representative preview data. Authenticated production workflows require a configured Supabase project.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run build:cloudflare
```

Read [SETUP.md](SETUP.md), [DATABASE.md](DATABASE.md), [SECURITY.md](SECURITY.md), [DEPLOYMENT.md](DEPLOYMENT.md) and [GRAMVISTA_SMS_INTEGRATION.md](GRAMVISTA_SMS_INTEGRATION.md) before connecting a real school.

