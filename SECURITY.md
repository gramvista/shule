# Security

## Tenant boundary

The browser never establishes tenancy by sending a trusted `organization_id`. RLS resolves access from `auth.uid()` through active organization membership. Branch access is checked by `can_access_branch`. Cross-tenant foreign-key triggers prevent a valid School A row from referencing a known School B identifier.

`supabase/tests/tenant_isolation.sql` exercises cross-school reads and updates using authenticated database roles. Add equivalent tests for every new tenant-owned table.

## Permissions

Default roles are mapped to named permissions in the `has_permission` database function. Owner and school administrator actions are still subject to organization membership. Platform administrators use a separate table and are not automatically granted access to school records.

## Secrets and files

- The Supabase service-role key and Gramvista SMS key never enter client bundles.
- SMS API keys are AES-GCM ciphertext; the encryption key lives only in the Edge Function secret store.
- The credential table has RLS enabled with no browser policy.
- The `school-assets` bucket is private. Object paths begin with the owning organization UUID and access uses signed URLs.
- Passwords and raw secrets must never be added to audit metadata or logs.

## Operational controls still required

Configure rate limiting at Cloudflare and for Supabase Edge Functions, rotate secrets, enable MFA for privileged users, review audit logs, validate recovery procedures, run dependency scanning, and complete an independent penetration test before onboarding production schools.

