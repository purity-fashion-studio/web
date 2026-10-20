# PURITY Payload CMS Contract

Payload 3 is embedded in the existing Next.js app. PostgreSQL uses UUID IDs;
public React Server Components call Local API through typed functions in
`content/public-api.ts`. REST remains available for external/browser needs,
GraphQL is disabled, and locale fallback is disabled.

## Collections and globals

Content: Directions, Services, Offers, Courses, Fashion Collections, Portfolio
Cases, Testimonials and Pages. Site: Media and managed Redirects. Operations:
Leads, Booking Requests, Payment Orders and Webhook Events. Administration:
Users. Globals: Home, Header, Footer, Site Settings and Booking Settings.

`Service` owns the value/process narrative. `Offer` owns SKU, format, price in
integer minor units, commercial/checkout mode, deposit, availability and terms
version. Payment Orders retain an immutable offer snapshot.

## Roles and access

- owner: users, settings, all content and operations;
- editor: public drafts/publish, SEO and media; no payment/PII internals;
- support: leads and booking operations only;
- finance: payment orders and webhook audit only;
- developer: schema-oriented non-production access, not production PII.

Disabled users are rejected at login, API keys are disabled, login attempts are
limited, sessions expire, and passwords must contain at least 14 characters.
Trusted Local API bypasses are limited to named booking/webhook/import contexts.

## Seed and migrations

Bootstrap is allowed only against an empty database. Run it through the
serialized `CMS release operation` workflow, or locally with exact resource
identity variables:

```bash
pnpm content:manifest:verify
pnpm payload:migrate:status
pnpm payload:migrate
ALLOW_CMS_SEED=true pnpm cms:bootstrap -- --target=preview --confirm=BOOTSTRAP_PREVIEW
```

The bootstrap importer writes in relationship order and refuses any non-empty
database. A restore is a separate, explicitly confirmed operation. Migration
files and `payload-types.ts` are committed; schema push is limited to isolated
development.

Vercel builds verify the manifest and build the application only. Migrations,
bootstrap, restore and Preview reset are manual release operations serialized by
GitHub environment. Preview reset also requires exact database and Blob store
identity matches before the first destructive call.

## Publish, preview and cache

Drafts, autosave, versions, scheduled publish support, restore, preview and
Live Preview are configured. Draft Mode uses a 32+ character secret, an
allowlisted localized path and open-redirect protection. Breakpoints are
390×844, 768×1024 and 1440×900. Public queries use locale, no fallback, selected
fields, bounded depth and public access. Cache tags and route invalidation run
on publish, unpublish, delete and global/media/offer change. Slug changes create
301 records; `proxy.ts` resolves them with a bounded cached chain and loop guard.

## Media governance

Production uses Vercel Blob storage with direct client upload. Only JPEG,
PNG, WebP and AVIF are accepted; upload size is limited to 20 MB and remote URL
paste is disabled. Thumbnail, card, editorial and hero derivatives are
generated. Public reads require visibility, approved and non-expired rights.
Generated media cannot be real client proof.

## Runtime source

The public runtime is Payload-only. Static content is a versioned one-time
migration input and test fixture; public routes never import it. An application
rollback must preserve the database because seed is not an authoritative
runtime or rollback source.

`pnpm content:manifest:verify` validates the immutable versioned
route/localization/media checksum fixture used for parity review. Run the
guarded importer twice in Preview and compare the resulting counts and
checksums before Production cutover.
