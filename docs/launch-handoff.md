# PURITY Launch and Handoff

The application uses Next.js and Payload with PostgreSQL.
Payload is the public runtime content source.

## Production Deployment

The stable development site uses `SITE_MODE=preview`, `EMAIL_MODE=disabled`,
test payments, and disabled indexing/analytics. Its Vercel production target
maintains the development alias; it is not a commercial launch. Do not enable
business integrations or change the business domain as part of preview delivery.

1. Provision separate production PostgreSQL, Vercel Blob storage, Resend,
   Stripe, and LiqPay resources. Never reuse preview resources.
2. Configure every variable from `.env.example`; use the canonical HTTPS
   origin for both public URLs.
3. Back up the database, then run `pnpm payload:migrate:status` and
   `pnpm payload:migrate` before switching application traffic.
4. Run the reviewed SHA through the `CMS release operation` workflow with
   `BOOTSTRAP_PRODUCTION`; then run `pnpm cms:verify` before editors change
   production content.
5. Review all three locales in Draft Mode and publish approved records.
6. Run `pnpm qa:all` from the reviewed checkout. In CI, require the separate
   PostgreSQL `test:integration` job and all Playwright shards as well; `qa:all`
   is the local static/Knip/dependency/unit/build/budget gate and does not claim
   those database-backed checks. Verify `/api/health/live`, `/api/health/ready`,
   `/robots.txt`, `/sitemap.xml`, and perform signed webhook test transactions
   in both currencies.
7. Enable indexing only on the canonical production deployment by setting
   `NEXT_PUBLIC_INDEXING_ENABLED=true` after Search Console and canonical-domain
   review.

Rollback is application-forward: keep the previous deployment, do not reverse
destructive migrations without an approved restore, and never discard CMS
records created after the source switch.

## Environment and Secrets

- Payload: `PAYLOAD_ENABLED=true`, two independent
  32+ character secrets, managed `DATABASE_URL`.
- Media: `BLOB_READ_WRITE_TOKEN` is mandatory for deployed Payload media.
  The server enforces MIME, size, access and usage-rights gates.
- Email: verified Resend sender, SPF, DKIM, DMARC, bounce/complaint ownership,
  environment-safe recipient routing and a protected notification-outbox job.
- Development: explicit disabled delivery needs no sender or provider key;
  pending notifications remain pending and authentication mail fails explicitly.
- Payments: `PAYMENT_MODE=live` requires both provider credentials, signed
  webhook secrets, and `PAYMENT_MERCHANT_READY=true`.
- Analytics/indexing are fail-closed and require explicit public flags.

Secrets belong in environment stores only. Rotate Payload, webhook, database,
storage, email, and cron credentials independently per environment.

## Payment Activation

1. Owner/finance approves merchant entities, public offer, cancellation/refund
   policy, fiscalization/receipt responsibility, descriptor, countries, and
   currencies.
2. Register Stripe webhook `/api/payments/webhooks/stripe` and LiqPay callback
   `/api/payments/webhooks/liqpay` on the canonical HTTPS domain.
3. Verify signed success, failure, expiry, duplicate delivery, late success,
   partial/full refund, amount mismatch, and currency mismatch behavior.
4. Confirm Apple Pay/Google Pay only after provider eligibility, domain
   verification, device testing, and a live transaction.
5. Reconcile provider dashboards against immutable `payment-orders`; never
   edit `paid` manually.
6. Invoke both `/api/jobs/reconcile-payments` and
   `/api/jobs/process-notifications` with `CRON_SECRET`; retain a daily Vercel
   recovery run and configure the merchant-approved higher frequency externally
   if the Vercel plan cannot provide it.

Redirects never prove payment. The public success page reads the stored order
status written by a verified webhook.

## CMS Activation

Payload Admin is served at `/admin`; public Server Components use Local API.
The code-first collections, globals, generated types, migrations, preview,
live-preview breakpoints, role access, Vercel Blob uploads, SEO fields, redirect records,
and revalidation hooks are committed in this repository.

Before opening editor access:

- migrate an empty and a representative restored database;
- run `pnpm cms:verify` and compare counts with the reviewed manifest;
- test owner/editor/support/finance/developer access;
- test draft, publish, unpublish, slug redirect, and old/new route behavior;
- review UK/RU/EN without locale fallback;
- confirm generated/restricted/expired media cannot become public proof.

## Real Media Replacement

Every public asset requires approved rights, localized alt, allowed usage,
credit/release metadata where applicable, and a non-expired rights window.
Generated media is editorial filler only, remains
`isRealClientProof=false`, and carries replacement priority. Portfolio requires
published status, real-client proof, approved rights, approval, and visibility.

## Editable Now

With Payload enabled, editors manage Directions, Services, Offers, Courses,
Collections, Portfolio, Pages, Testimonials, Home/Header/Footer/Settings and
Media in `/admin`. Support manages Leads and Booking Requests. Finance/owner
can inspect Payment Orders and Webhook Events. Schema, migrations, provider
logic, roles, secrets, and arbitrary styling remain code-owned.

## Editable After CMS Activation

Commercial production editing requires isolated database/storage resources,
an owner account, role acceptance tests, tested backups and approved content.
Email activation is separate from development editor access. Seed files are
import/test fixtures, not a source of ongoing editor updates.

## Future Backlog

Real-time scheduling is not implemented: resources,
availability, holds, appointments, overlap constraints, reminders, and audit
history require a separately approved operating model. LMS/student accounts,
full ecommerce, inventory, shipping, tax, client portal, and private lookbooks
also remain separate products.
