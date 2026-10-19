# Database

The source of truth is `supabase/migrations`. Every school-owned record carries `organization_id`; branch-owned operational records also carry `branch_id`.

## Main domains

- Identity: `profiles`, `organization_members`, `member_branches`, `invitations`
- School structure: `organizations`, `branches`, `academic_years`, `terms`, `classes`, `streams`
- People: `students`, `guardians`, `student_guardians`, `staff`
- History: `enrollments`, `teaching_assignments`
- Operations: `attendance_records`, `announcements`, `notifications`
- Finance: `fee_items`, `fee_structures`, `student_charges`, `payments`, `payment_allocations`
- Academics: `subjects`, `assessments`, `assessment_results`, `grading_scales`, `grade_ranges`
- Messaging: `sms_settings`, `sms_provider_credentials`, `sms_messages`, `sms_recipients`
- Governance: `subscriptions`, `subscription_plans`, `audit_logs`, `platform_admins`

Money is stored as integer minor units. Student class history is stored in `enrollments`, not overwritten on the student row. Payments are append-oriented and use organization-scoped idempotency keys and unique receipt numbers.

## Migrations and rollback

Create a new migration for every schema change; never edit a migration already applied to production. Test forward migration against a restored production-like backup. Destructive rollback is not automatic: prepare a reviewed compensating migration and restore from a verified backup when data loss is possible.

## Backup and restore

Enable Supabase point-in-time recovery for production where the plan supports it. Schedule encrypted logical backups to a separate controlled location. Quarterly, restore the latest backup into an isolated project and verify row counts, RLS policies and representative school workflows before declaring the backup healthy.

