# PURITY Fashion Studio

[![CI](https://github.com/purity-fashion-studio/web/actions/workflows/ci.yml/badge.svg)](https://github.com/purity-fashion-studio/web/actions/workflows/ci.yml)

Multilingual product platform for PURITY Fashion Studio, built with Next.js,
Payload CMS, PostgreSQL, TypeScript, Tailwind CSS and shadcn/ui. It includes
managed content, leads/request booking, transactional email, Stripe/LiqPay
checkout adapters and signed webhooks. A localized persistent cart retains
service, course and collection selections for individual requests or checkout.

## Design system

The UI uses shadcn preset `b59jufTOPg` as its single design-system source:

- Base Sera with Base UI primitives;
- neutral semantic colors;
- Noto Sans and Noto Serif;
- Phosphor icons;
- standard preset radius and a single light semantic theme.

Canonical primitives live in `components/ui`. Product compositions may use
layout utilities, but must not introduce parallel palettes, custom primitive
variants, or page-specific forks of shadcn components. Primitive contracts are
verified by the static design-token and component checks; there is no public
styleguide route.

## Getting started

Requirements: Node.js 24 and pnpm 10.28.0.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm setup
pnpm dev
```

The localized entry points are `/uk`, `/ru`, and `/en`. The public runtime uses
Payload Local API and therefore requires PostgreSQL plus the variables
documented in `.env.example`. Set `PAYLOAD_ENABLED=true`, point
`DATABASE_URL` at an empty local database, then apply migrations and bootstrap
content before opening the site:

```bash
pnpm payload:migrate
ALLOW_CMS_SEED=true pnpm cms:bootstrap -- --target=local --confirm=BOOTSTRAP_LOCAL
```

For local offline development, set `SITE_MODE=production`, `EMAIL_MODE=offline`
and `PAYMENT_MODE=test` in `.env.local`, leaving both public URLs on `localhost`,
`127.0.0.1` or `[::1]`. Keep `NODE_ENV=development` or `test` and unset
`VERCEL_ENV`. `EMAIL_FROM` is still required when Payload is enabled. Offline
mode rejects production and deployed environments: no messages are sent,
notifications remain queued, and authentication email delivery fails explicitly
rather than pretending a message was delivered. The default `EMAIL_MODE=resend`
requires a real provider key and an approved sender.

For the shared development site, configure `SITE_MODE=preview`,
`EMAIL_MODE=disabled`, `PAYMENT_MODE=test`, and keep indexing and analytics
disabled. Both public URLs must use the stable development origin
`https://purity-fashion-studio.vercel.app` (or loopback locally). This mode
supports production builds without claiming commercial activation. It sends
no mail, retains pending notifications, and rejects authentication-mail
delivery explicitly. It does not require or invent provider credentials.

The default `SITE_MODE=production` retains strict commercial-domain, merchant
and sender requirements. Media storage and independent application/preview/cron
secrets remain required for deployed Payload runtimes in either mode.

### Serial local browser verification

Warm the route families before exercising a development server: initial Next
compilation is not a navigation SLA. For repeated viewport matrices, consume
rendered image variants serially too; a stalled cold optimizer request can hold
the document load event open even after its HTML has rendered. Restart the
isolated server to clear a stuck in-memory request before warming the variants;
keep image optimization enabled and preserve the real source assets. Run browser
checks with one worker and
`--update-snapshots=none`; do not accept visual changes automatically. Exhaustive
locale/viewport matrices can opt into a bounded local wall-clock budget using
`PURITY_LOCAL_STAGE_TIMEOUT_MS=900000`. This is accepted only with explicit offline
email, test payments, no `VERCEL_ENV`, and a Playwright base URL of
`http://127.0.0.1:3102` or `http://localhost:3102`. The maximum is 1200000ms and
budgets cannot be shortened. Without the flag, existing CI deadlines are
unchanged. Assertions, route/locale/width coverage, console-error checks and
visual thresholds are unchanged in both modes. Split long runs into serial
batches and retain per-case results across launcher deadlines.

Public development CSP permits only pinned Next DevTools stylesheet hashes in addition
to the document nonce; arbitrary inline styles remain blocked. Production public
styles remain nonce-bound and script nonce protection is unchanged.

See `docs/launch-handoff.md` for deployment prerequisites and
`docs/operations-runbook.md` for maintenance and recovery procedures.

## Commands

Database integration tests require an explicitly isolated local database:
`PURITY_TEST_DATABASE` must equal the exact database name in `DATABASE_URL`.
Email must be disabled or offline, payments must be in test mode, and Blob
storage must be disabled. The integration guard rejects remote destinations
and connection-string overrides. Run migrations and bootstrap the dedicated
test database first; never point integration tests at business data.

Mutating browser cases use the same isolation guard and Playwright's own local
server. Leave `PLAYWRIGHT_BASE_URL` unset for those cases; an existing server or
remote URL is not an isolated test target. Read-only route checks can still use
an explicitly configured verification URL.

Local filesystem uploads live in the ignored `.payload-media` directory and
are delivered through Payload's access-controlled file route. They are not
Next public assets: uploads must become readable without restarting the server,
and unpublished/restricted media must not bypass collection access controls.
When updating an existing local environment, preserve its upload files in this
directory before restarting. Deployed Blob storage remains separate; do not
upload private documents or unapproved client material to public Blob storage.

| Command                    | Purpose                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| `pnpm dev`                 | Start the development server                                        |
| `pnpm build`               | Create a production build                                           |
| `pnpm payload:migrate`     | Apply committed PostgreSQL migrations                               |
| `pnpm cms:bootstrap`       | Populate an empty Payload database from the manifest                |
| `pnpm cms:verify`          | Verify published Payload content without writing                    |
| `pnpm cms:restore`         | Explicitly restore manifest-owned content                           |
| `pnpm cms:check`           | Validate the actual Payload config and import fixtures              |
| `pnpm payment:check`       | Verify provider routing and payment state transitions               |
| `pnpm payment:integration` | Verify payment concurrency/replay against PostgreSQL                |
| `pnpm test:integration`    | Verify CMS roles/lifecycle/media, bookings and payment concurrency  |
| `pnpm readiness:mvp`       | Run types, lint, content, i18n and design-system checks             |
| `pnpm test:e2e`            | Build and run Playwright route and interaction tests                |
| `pnpm qa:all`              | Run the local static, Knip, dependency, unit, build and budget gate |

## Architecture

- `app/` — localized routes and metadata.
- `components/ui/` — canonical shadcn primitives.
- `components/` — site shell and product compositions.
- `content/` — typed public Local API query layer and migration fixtures.
- `payload/` — collections, globals, access, hooks, migrations and seed import.
- `features/booking/` — leads, booking, payments and status contracts.
- `features/cart/` — validated browser selections and server-side commerce resolution.
- `messages/` — localized interface copy.
- `tests/e2e/` — route, interaction, accessibility and visual coverage.
- `docs/` — launch, QA and CMS handoff documentation.

Development site: [purity-fashion-studio.vercel.app](https://purity-fashion-studio.vercel.app)

Contribution and release rules are defined in [CONTRIBUTING.md](CONTRIBUTING.md).
