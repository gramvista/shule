# Deployment

## Cloudflare Workers

The project uses OpenNext. `npm run build:cloudflare` produces `.open-next/worker.js` and assets for Cloudflare Workers. `wrangler.jsonc` enables Node.js compatibility.

Set production variables in the hosting secret manager. Public values are `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Keep `SUPABASE_SERVICE_ROLE_KEY`, `GRAMVISTA_SMS_*` secrets and `SMS_CREDENTIAL_ENCRYPTION_KEY` encrypted and server-only.

Before deployment:

1. Run CI and require all checks.
2. Apply reviewed Supabase migrations and capture a backup.
3. Configure exact Supabase Auth redirect URLs.
4. Build with the production environment and test the Worker preview.
5. Deploy privately first, exercise the acceptance flow, then change audience only through the approved release process.

Use the normal Cloudflare command when deploying outside ChatGPT Sites:

```bash
npm run deploy:cloudflare
```

Never run production migration or deployment jobs from an unreviewed branch.

