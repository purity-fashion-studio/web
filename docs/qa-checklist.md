# PURITY QA and Release Checklist

## Automated gate

Run `pnpm qa:all`. Warnings and failures block release. The local gate covers
env, strict types, lint, content import fixtures, actual Payload config, payment
transition contract, routes/content, launch handoff, i18n, design tokens, brand,
architecture, Knip, production dependency audit, unit tests, production build
and JS budget. PostgreSQL-backed integration/payment tests and Playwright run as
separate CI jobs. Visual baselines are never regenerated without explicit
approval.

## CMS integration

- Apply migrations to an empty DB and a representative restored DB.
- Generate types/import map and verify no drift.
- Run seed twice; relationships/counts stay stable.
- Test public exclusion of drafts, disabled records, private fields,
  unapproved/expired media and unapproved portfolio.
- Test owner/editor/support/finance/developer matrix and disabled users.
- Test preview, exit preview, all live-preview breakpoints and noindex.
- Test publish/unpublish/delete/slug changes, cache invalidation, 301 resolution
  and redirect loop protection.
- Create a CMS-only entity and verify on-demand localized routing without a
  rebuild; verify unpublished/unknown returns 404.

## Booking and payments

- Validate private, corporate, course, collection and general inquiry paths.
- Verify client and server validation, honeypot, dwell, rate limit, lead match,
  first/last touch, consent version and idempotent duplicate submit.
- Persist before email; email failure remains visible and retryable without
  duplicating the request.
- Verify server-side entity/offer/amount/currency/provider resolution.
- Reject invalid Stripe/LiqPay signatures, stale timestamps, amount/currency
  mismatch and unknown orders.
- Replay duplicate and out-of-order events; final paid/refunded state never
  regresses to expired/failed.
- Test success, async failure, expiry, late success, partial/full refund and
  provider checkout failure.
- Confirm public status pages never infer success from query/redirect alone.

## Browser and content

- UK/RU/EN home, directions, services, course, collection, portfolio, Studio,
  Contacts, Booking, legal and payment routes.
- Language switch keeps the equivalent entity and `html lang`.
- Service/offer CTA preselection, keyboard flow, focus, field errors, status
  announcements, menu and legal links.
- 320, 390, 768, 934, 1024, 1440 and manual wide desktop; no overflow, missing
  images, console errors or layout shifts.
- Canonical/hreflang/OG/Twitter, schema.org, published-only sitemap, preview
  robots closure, booking/payment noindex and managed redirects.
- Generated imagery remains editorial, never testimonial/before-after/client
  evidence; all public claims, prices, contacts and policies are owner-reviewed.

## External UAT and launch blockers

Owner/brand, editor, support and finance each sign their domain. Before live
traffic: legal/privacy/cookie/retention approval, merchant and fiscal readiness,
provider live transactions and wallet eligibility, SPF/DKIM/DMARC, backup
restore drill with approved RPO/RTO, uptime/error monitoring, GA4 consent/debug,
Search Console/sitemap, DNS/TLS and production smoke. Developer approval cannot
substitute for these decisions.
