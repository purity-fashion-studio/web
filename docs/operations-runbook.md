# PURITY Operations Runbook

## Health and incident triage

Monitor `GET /api/health/live` and `GET /api/health/ready` without caching.
Readiness returns `503` when migrations, required published content or its
public media probe is unavailable. Check application errors, managed PostgreSQL, storage,
Resend and provider status pages without logging secrets, raw webhooks, form
messages or client PII. Site Settings can publish a localized maintenance
message; payment/booking writes must fail closed rather than pretend success.

## Backup and restore

The owner must configure automated encrypted PostgreSQL backups and a separate
recoverable media backup. Vercel Blob deletion is not assumed reversible.
Record the agreed retention, RPO and RTO in the private operations register.

Quarterly and before destructive migration:

1. create a named database backup and record its timestamp/version;
2. retain the matching application commit, migration list and storage snapshot;
3. restore into an isolated non-production database and storage namespace;
4. configure a staging deployment with isolated secrets and indexing disabled;
5. run `pnpm payload:migrate:status`, `pnpm payload:migrate`,
   `pnpm readiness:mvp` and a CMS/public route smoke;
6. compare counts for content, leads, bookings, payment orders and webhook
   events, then sample media URLs and relationship integrity;
7. record duration, data gap and reviewer evidence; delete the drill copy under
   the approved retention policy.

Never test restore against production. Never roll a production schema backward
after new writes unless the migration owner explicitly approves a compatible
down migration; prefer forward repair or full restore.

## Deploy and migrate

Use separate local, preview and production databases, buckets, email routing,
payment keys, URLs and analytics. Preview must not mutate production. Before app
traffic changes, back up, check migration status, migrate once, deploy a
forward-compatible app, smoke health/admin/public reads, then enable traffic.
If the app fails, restore the previous deployment while retaining the migrated
database unless the approved recovery plan says otherwise.

## Payments and webhook operations

Provider endpoints retry safely through provider-scoped Webhook Events. A
`processed` event is acknowledged without repeating side effects; a
`failed`/`retryable` event is claimable again and records attempts, next retry
and a sanitized error. Investigate by payload hash, correlation ID, safe error,
order UUID and provider dashboard; do not paste raw payloads into tickets.
Finance never edits `paid` manually.
Refund actions require owner/finance authorization, reason, amount, provider
reference and policy evidence. Reconcile pending orders and provider totals on
an agreed schedule; escalate amount/currency mismatches immediately. The
authenticated `/api/jobs/reconcile-payments` endpoint rotates due orders and
uses per-order locks, so concurrent invocations do not double-process one
order. Vercel invokes the recovery job daily; merchant activation must provide
a more frequent external schedule when the chosen Vercel plan cannot run the
required interval.

## Email operations

Booking/payment state and one persistent outbox row per recipient commit in one
database transaction. `/api/jobs/process-notifications` claims due rows,
records the provider message ID, retries transient failures with exponential
backoff and marks an item dead after ten attempts. A partial two-recipient
delivery therefore retries only the missing recipient. `notificationStatus`
is a summary; failed delivery never justifies recreating the booking. Vercel
runs a daily recovery pass, while normal booking/webhook requests trigger an
immediate bounded drain. `SITE_MODE=preview` requires `EMAIL_MODE=disabled`:
no messages are sent, queued entries remain pending, and authentication email
fails explicitly. Standard Resend preview environments require
`EMAIL_OVERRIDE_RECIPIENT` and must never address the submitted client email.
Monitor domain verification, bounces and complaints when delivery is enabled.

Both job endpoints require an Authorization bearer header containing `CRON_SECRET`.
Run
`pnpm payment:integration` against an isolated PostgreSQL database after fresh
migrations to exercise 20-way payment transitions, concurrent webhook replay
and failed-event recovery.

## Error monitoring

Use Vercel runtime logs, Payload structured logs and the correlation ID returned
by API operations. Logs contain safe codes and sanitized error names/messages,
never raw webhook bodies or lead fields.

## Security and privacy

Rotate compromised credentials immediately and disable affected users. Preserve
the minimum audit evidence without copying passwords, tokens, card data, raw
provider payloads or unnecessary PII. Data export, correction, deletion,
anonymization, lead/booking retention, accounting retention and incident
notification follow the owner-approved private privacy register and legal
policy; code cannot choose those periods on the owner's behalf.
