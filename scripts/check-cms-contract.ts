import { existsSync } from "node:fs"

import configPromise from "../payload.config"
import { purityContentManifest } from "../payload/seed/manifest"

const config = await configPromise
const expectedCollections = [
  "users",
  "media",
  "directions",
  "services",
  "offers",
  "courses",
  "fashion-collections",
  "portfolio-cases",
  "testimonials",
  "pages",
  "leads",
  "booking-requests",
  "payment-orders",
  "webhook-events",
  "notification-outbox",
  "redirects",
]
const expectedGlobals = [
  "home",
  "header",
  "footer",
  "site-settings",
  "booking-settings",
]
const collectionSlugs = new Set<string>(
  config.collections?.map((collection) => collection.slug)
)
const globalSlugs = new Set<string>(
  config.globals?.map((global) => global.slug)
)
const issues = [
  ...expectedCollections
    .filter((slug) => !collectionSlugs.has(slug))
    .map((slug) => `Missing Payload collection: ${slug}`),
  ...expectedGlobals
    .filter((slug) => !globalSlugs.has(slug))
    .map((slug) => `Missing Payload global: ${slug}`),
]

if (config.graphQL?.disable !== true) {
  issues.push("Payload GraphQL must remain disabled")
}
if (!config.localization || config.localization.fallback !== false) {
  issues.push("Payload locale fallback must remain disabled")
}
if (!existsSync("payload-types.ts"))
  issues.push("Missing generated Payload types")
if (!existsSync("payload/migrations/index.ts")) {
  issues.push("Missing committed Payload migrations")
}

const requiredManifestCollections = [
  "service-categories",
  "services",
  "courses",
  "collections",
  "portfolio-cases",
  "testimonials",
  "media-assets",
  "pages",
  "settings",
  "leads",
  "booking-requests",
  "payment-orders",
] as const

for (const collection of requiredManifestCollections) {
  const records = purityContentManifest.source[collection]
  const checksums = purityContentManifest.checksums.records[collection]

  if (!Array.isArray(records) || !Array.isArray(checksums)) {
    issues.push(`Manifest collection is incomplete: ${collection}`)
    continue
  }

  if (records.length !== checksums.length) {
    issues.push(`Manifest checksum count drifted: ${collection}`)
  }
}

if (
  purityContentManifest.checksums.media.length !==
  purityContentManifest.source["media-assets"].length
) {
  issues.push("Manifest media checksum count drifted")
}

if (issues.length) {
  throw new Error(`CMS contract invalid:\n${issues.join("\n")}`)
}

const counts = purityContentManifest.source
console.log(
  [
    `Payload contract ok: ${expectedCollections.length} collections`,
    `${expectedGlobals.length} globals`,
    `${counts.services.length} services ready for import`,
    `${counts["media-assets"].length} media records`,
  ].join(", ")
)
