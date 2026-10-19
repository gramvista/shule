# Setup

## Requirements

- Node.js 24 and npm
- A Supabase project and Supabase CLI
- A Cloudflare account for Worker deployment
- Gramvista SMS credentials only when messaging is enabled

## Environment

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_APP_URL` to the exact external HTTPS origin in production. Add the Supabase project URL and anon key. The service-role key and SMS secrets are server-only and must be stored in the deployment secret manager, never in Git or browser code.

Use separate Supabase projects for development, testing and production. Do not point local or CI tests at production.

## Database

Link the CLI to a non-production project and apply migrations:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

In Supabase Auth, add these redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://YOUR_DOMAIN/auth/callback`
- `http://localhost:3000/reset-password`
- `https://YOUR_DOMAIN/reset-password`

Never use a wildcard production redirect.

## First school

Create the owner account, confirm its email, and finish `/onboarding`. The transactional `onboard_school` database function creates the organization, owner membership, main branch, active academic period and trial subscription together.

