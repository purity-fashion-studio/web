import { existsSync } from "node:fs"
import { basename } from "node:path"

import { z } from "zod"

import {
  collectionPath,
  coursePath,
  portfolioCasePath,
  sectionPath,
  servicePath,
} from "../content/routes"
import { locales } from "../i18n/routing"
import {
  getManifestRoutes,
  purityContentManifest,
} from "../payload/seed/manifest"

const {
  collections,
  courses,
  "media-assets": mediaAssets,
  "portfolio-cases": portfolioCases,
  pages: publicPages,
  "service-categories": serviceCategories,
  services,
  settings: [siteSettings],
} = purityContentManifest.source
const { navigation } = purityContentManifest.migrationCopy
const serviceCategorySlugs = serviceCategories.map((item) => item.slug) as [
  string,
  ...string[],
]
const publicPageSlugs = publicPages.map((item) => item.slug) as [
  string,
  ...string[],
]
type MediaAsset = (typeof mediaAssets)[number]

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const path = z.string().regex(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/)
const localeEnum = z.enum(locales)
const localizedString = z.record(localeEnum, z.string().min(1))
const localizedStringList = z.record(
  localeEnum,
  z.array(z.string().min(1)).min(1)
)
const localizedSeo = z.record(
  localeEnum,
  z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })
)
const categorySlug = z.enum(serviceCategorySlugs)
const coreServiceCategories = [
  "research",
  "realisation",
  "atelier",
  "transformation",
  "corporate",
  "school",
  "collections",
] as const
const coreCategorySlug = z.enum(coreServiceCategories)
const navigationId = z.union([z.literal("home"), categorySlug])
const publicPageSlug = z.enum(publicPageSlugs)
const publicNavigationId = z.union([navigationId, publicPageSlug])
const ctaSchema = z.object({
  label: localizedString,
  path,
})
const sourceRefSchema = {
  sourceUrl: z.url().optional(),
  sourceLabel: z.string().min(1).optional(),
}

const categorySchema = z.object({
  slug: categorySlug,
  routeSegment: slug,
  ...sourceRefSchema,
  title: localizedString,
  summary: localizedString,
})

const serviceSchema = z.object({
  slug,
  category: coreCategorySlug,
  routeSegment: slug,
  visibleInMvp: z.boolean(),
  title: localizedString,
  summary: localizedString,
  commercialStatus: localizedString,
  priceNote: localizedString,
  outcomes: localizedStringList,
  mediaIds: z.array(slug).min(1),
  seo: localizedSeo,
  ...sourceRefSchema,
})

const courseSchema = z.object({
  slug,
  routeSegment: slug,
  visibleInMvp: z.boolean(),
  title: localizedString,
  summary: localizedString,
  commercialStatus: localizedString,
  priceNote: localizedString,
  audience: localizedString,
  lessons: localizedStringList,
  mediaIds: z.array(slug).min(1),
  seo: localizedSeo,
  ...sourceRefSchema,
})

const collectionSchema = z.object({
  slug,
  routeSegment: slug,
  visibleInMvp: z.boolean(),
  title: localizedString,
  summary: localizedString,
  commercialStatus: localizedString,
  priceNote: localizedString,
  materials: localizedStringList,
  mediaIds: z.array(slug).min(1),
  seo: localizedSeo,
  ...sourceRefSchema,
})

const portfolioCaseSchema = z.object({
  slug,
  routeSegment: slug,
  visibleInMvp: z.boolean(),
  title: localizedString,
  summary: localizedString,
  mediaIds: z.array(slug).min(1),
  isRealClientProof: z.boolean(),
  seo: localizedSeo,
})

const publicPageSchema = z.object({
  slug: publicPageSlug,
  routeSegment: slug,
  title: localizedString,
  eyebrow: localizedString,
  summary: localizedString,
  body: localizedStringList,
  mediaIds: z.array(slug).min(1).optional(),
  cta: ctaSchema.optional(),
  seo: localizedSeo,
  ...sourceRefSchema,
})

const navigationSchema = z.object({
  id: publicNavigationId,
  label: localizedString,
  path,
  visibleInMvp: z.boolean(),
})

const mediaAssetSchema = z.object({
  id: slug,
  kind: z.enum(["logo", "image"]),
  source: z.enum(["client", "generated"]),
  generated: z.boolean(),
  fileName: z.string().regex(/^[a-z0-9-]+\.(?:png|jpg|jpeg|webp)$/),
  aspectRatio: z.string().regex(/^[0-9]+:[0-9]+$/),
  sourceFile: z.string().min(1).optional(),
  sourceMetadata: z
    .object({
      origin: z.literal("generated"),
      disclosure: z.string().min(1),
    })
    .optional(),
  src: z.string().startsWith("/").optional(),
  usage: z.array(z.string().min(1)).min(1),
  internalLabel: localizedString,
  alt: localizedString,
  heroFocalPoint: z.enum(["left", "center", "right"]).optional(),
  replacementPriority: z.enum([
    "keep-client-source",
    "replace-before-launch",
    "replace-when-client-proof-arrives",
  ]),
  isRealClientProof: z.boolean(),
})

const siteSettingsSchema = z.object({
  brandName: z.string().min(1),
  languageLabel: localizedString,
  home: z.object({
    eyebrow: localizedString,
    title: localizedString,
    summary: localizedString,
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    studioEyebrow: localizedString,
    studioTitle: localizedString,
    studioSummary: localizedString,
    serviceRailTitle: localizedString,
    collectionRailTitle: localizedString,
    portfolioNote: localizedString,
  }),
  defaultOgImageId: slug,
  primaryNavigation: z.array(publicNavigationId).min(1),
  footerNavigation: z.array(publicNavigationId).min(1),
  seo: localizedSeo,
  contacts: z.object({
    city: localizedString,
    address: localizedString,
    hours: localizedString,
    responseTime: localizedString,
    actionLabel: localizedString,
    actionPath: path,
    email: z.email().nullable(),
    phone: z.string().min(1).nullable(),
    phones: z.array(z.string().min(1)).min(2),
    viberUrl: z.string().regex(/^viber:\/\/chat\?number=%2B[0-9]+$/),
    socials: z
      .array(
        z.object({
          label: z.string().min(1),
          url: z.url(),
        })
      )
      .min(4),
    sourceUrl: z.url(),
    sourceLabel: z.string().min(1),
  }),
})

function parse(label: string, schema: z.ZodType, value: unknown) {
  const result = schema.safeParse(value)

  if (!result.success) {
    throw new Error(`${label} invalid:\n${z.prettifyError(result.error)}`)
  }
}

function assertUnique<T>(
  label: string,
  items: T[],
  getKey: (item: T) => string
) {
  const seen = new Set<string>()

  for (const item of items) {
    const key = getKey(item)

    if (seen.has(key)) {
      throw new Error(`Duplicate ${label}: ${key}`)
    }

    seen.add(key)
  }
}

function assertInquiryBasedOffer(
  kind: string,
  item: {
    slug: string
    commercialStatus: Record<string, string>
    priceNote: Record<string, string>
  }
) {
  const searchable = [
    ...Object.values(item.commercialStatus),
    ...Object.values(item.priceNote),
  ].join(" ")

  if (!/(запит|запрос|request)/i.test(searchable)) {
    throw new Error(`${kind} ${item.slug} must mark pricing/status by request`)
  }
}

function assertFixedOfferPlaceholder(
  kind: string,
  item: {
    slug: string
    commercialStatus: Record<string, string>
    priceNote: Record<string, string>
  }
) {
  const searchable = [
    ...Object.values(item.commercialStatus),
    ...Object.values(item.priceNote),
  ].join(" ")

  if (!/placeholder/i.test(searchable)) {
    throw new Error(
      `${kind} ${item.slug} must expose an explicit placeholder offer`
    )
  }
}

parse("Service categories", z.array(categorySchema), serviceCategories)
parse("Services", z.array(serviceSchema), services)
parse("Courses", z.array(courseSchema), courses)
parse("Collections", z.array(collectionSchema), collections)
parse("Portfolio cases", z.array(portfolioCaseSchema), portfolioCases)
parse("Public pages", z.array(publicPageSchema), publicPages)
parse("Navigation", z.array(navigationSchema), navigation)
parse("Media assets", z.array(mediaAssetSchema), mediaAssets)
parse("Site settings", siteSettingsSchema, siteSettings)

const serializedContent = JSON.stringify({
  serviceCategories,
  services,
  courses,
  collections,
  publicPages,
  siteSettings,
})

for (const forbiddenFact of ["Прага", "Prague"]) {
  if (serializedContent.includes(forbiddenFact)) {
    throw new Error(`Invented location remains in content: ${forbiddenFact}`)
  }
}

for (const item of [
  ...serviceCategories,
  ...services,
  ...courses,
  ...collections,
]) {
  if (!item.sourceUrl || !item.sourceLabel) {
    throw new Error(`Source metadata missing for content entry: ${item.slug}`)
  }
}

for (const page of publicPages.filter((item) =>
  ["studio", "booking"].includes(item.slug)
)) {
  if (!page.sourceUrl || !page.sourceLabel) {
    throw new Error(`Source metadata missing for public page: ${page.slug}`)
  }
}

const requiredContacts = [
  "Предславинская 44",
  "French Quarter 2",
  "11:00-20:00",
  "+38 067 656 19 12",
  "+38 066 00 44 066",
  "voronina@purity-fashion.com",
]
const contactFacts = JSON.stringify(siteSettings.contacts)

for (const fact of requiredContacts) {
  if (!contactFacts.includes(fact)) {
    throw new Error(`Missing source-backed contact fact: ${fact}`)
  }
}

if (!siteSettings.contacts.viberUrl.includes("380676561912")) {
  throw new Error("Viber link must use the source-backed stylist phone number")
}

for (const social of ["Instagram", "Facebook", "YouTube", "Pinterest"]) {
  if (!siteSettings.contacts.socials.some((item) => item.label === social)) {
    throw new Error(`Missing source-backed social link: ${social}`)
  }
}

assertUnique("service category", serviceCategories, (item) => item.slug)
assertUnique("service slug", services, (item) => item.slug)
assertUnique("service route", services, (item) => item.routeSegment)
assertUnique("course slug", courses, (item) => item.slug)
assertUnique("collection slug", collections, (item) => item.slug)
assertUnique("portfolio case slug", portfolioCases, (item) => item.slug)
assertUnique("public page slug", publicPages, (item) => item.slug)
assertUnique("navigation id", navigation, (item) => item.id)
assertUnique("media asset", mediaAssets, (item) => item.id)

const categoryIds = new Set(serviceCategories.map((item) => item.slug))
const mediaIds = new Set(mediaAssets.map((item) => item.id))
const imageMediaIds = new Set(
  mediaAssets
    .filter((item) => item.kind === "image" && item.src)
    .map((item) => item.id)
)
const navIds = new Set(navigation.map((item) => item.id))

for (const area of serviceCategorySlugs) {
  if (!categoryIds.has(area)) {
    throw new Error(`Missing brief area category: ${area}`)
  }
}

for (const category of coreServiceCategories) {
  if (!services.some((service) => service.category === category)) {
    throw new Error(`Missing brief-required service category: ${category}`)
  }
}

for (const service of services) {
  for (const mediaId of service.mediaIds) {
    if (!mediaIds.has(mediaId)) {
      throw new Error(
        `Service ${service.slug} references missing media: ${mediaId}`
      )
    }
  }
}

for (const course of courses) {
  for (const mediaId of course.mediaIds) {
    if (!mediaIds.has(mediaId)) {
      throw new Error(
        `Course ${course.slug} references missing media: ${mediaId}`
      )
    }
  }
}

for (const collection of collections) {
  for (const mediaId of collection.mediaIds) {
    if (!mediaIds.has(mediaId)) {
      throw new Error(
        `Collection ${collection.slug} references missing media: ${mediaId}`
      )
    }
  }
}

for (const page of publicPages) {
  for (const mediaId of page.mediaIds ?? []) {
    if (!mediaIds.has(mediaId)) {
      throw new Error(`Page ${page.slug} references missing media: ${mediaId}`)
    }
  }
}

for (const portfolioCase of portfolioCases) {
  for (const mediaId of portfolioCase.mediaIds) {
    if (!mediaIds.has(mediaId)) {
      throw new Error(
        `Portfolio case ${portfolioCase.slug} references missing media: ${mediaId}`
      )
    }
  }

  if (portfolioCase.visibleInMvp && !portfolioCase.isRealClientProof) {
    throw new Error(
      `Portfolio case ${portfolioCase.slug} cannot be public without real proof`
    )
  }
}

const allMediaAssets: MediaAsset[] = mediaAssets

for (const asset of allMediaAssets) {
  if (asset.generated !== (asset.source === "generated")) {
    throw new Error(
      `Media generated flag must match source for ${asset.id}: ${asset.source}`
    )
  }

  if (asset.src) {
    const publicPath = `public/${asset.src.replace(/^\//, "")}`

    if (!existsSync(publicPath)) {
      throw new Error(
        `Media asset ${asset.id} points at missing file: ${asset.src}`
      )
    }

    if (basename(asset.src) !== asset.fileName) {
      throw new Error(
        `Media asset ${asset.id} fileName does not match src: ${asset.fileName}`
      )
    }
  }

  if (asset.source === "generated") {
    if (!asset.src) {
      throw new Error(`Generated media is missing a real file: ${asset.id}`)
    }

    if (
      !asset.generated ||
      asset.sourceMetadata?.origin !== "generated" ||
      !asset.sourceMetadata.disclosure
    ) {
      throw new Error(
        `Generated media requires an explicit origin and proof disclosure: ${asset.id}`
      )
    }

    if (asset.isRealClientProof) {
      throw new Error(
        `Generated media cannot be marked as real proof: ${asset.id}`
      )
    }

    if (asset.replacementPriority === "keep-client-source") {
      throw new Error(
        `Generated media must have a replacement priority: ${asset.id}`
      )
    }
  }
}

for (const service of services.filter((item) => item.visibleInMvp)) {
  assertInquiryBasedOffer("Service", service)

  if (!service.mediaIds.some((mediaId) => imageMediaIds.has(mediaId))) {
    throw new Error(`Visible service has no usable image: ${service.slug}`)
  }
}

for (const course of courses.filter((item) => item.visibleInMvp)) {
  assertFixedOfferPlaceholder("Course", course)

  if (!course.mediaIds.some((mediaId) => imageMediaIds.has(mediaId))) {
    throw new Error(`Visible course has no usable image: ${course.slug}`)
  }
}

for (const collection of collections.filter((item) => item.visibleInMvp)) {
  assertInquiryBasedOffer("Collection", collection)

  if (!collection.mediaIds.some((mediaId) => imageMediaIds.has(mediaId))) {
    throw new Error(
      `Visible collection has no usable image: ${collection.slug}`
    )
  }
}

for (const page of publicPages.filter((item) =>
  ["studio", "booking"].includes(item.slug)
)) {
  if (!page.mediaIds?.some((mediaId) => imageMediaIds.has(mediaId))) {
    throw new Error(`Major public page has no usable image: ${page.slug}`)
  }
}

for (const navId of [
  ...siteSettings.primaryNavigation,
  ...siteSettings.footerNavigation,
]) {
  if (!navIds.has(navId)) {
    throw new Error(`Site settings reference missing navigation item: ${navId}`)
  }
}

if (!mediaIds.has(siteSettings.defaultOgImageId)) {
  throw new Error(`Missing default OG media: ${siteSettings.defaultOgImageId}`)
}

function assertUsableContactEmail(email: string | null) {
  if (email && email.endsWith(".example")) {
    throw new Error("Contact email cannot use the reserved .example domain")
  }
}

assertUsableContactEmail(siteSettings.contacts.email as string | null)

const generatedPaths = new Set([
  "/",
  "/portfolio",
  "/contacts",
  "/payment/success",
  "/payment/cancel",
  "/payment/failure",
  ...serviceCategories
    .filter(
      (category) =>
        category.slug !== "portfolio" && category.slug !== "contacts"
    )
    .map((category) => sectionPath(category.routeSegment)),
  ...publicPages.map((page) => sectionPath(page.routeSegment)),
  ...services.map((service) => servicePath(service.routeSegment)),
  ...courses.map((course) => coursePath(course.routeSegment)),
  ...collections.map((collection) => collectionPath(collection.routeSegment)),
  ...portfolioCases.map((portfolioCase) =>
    portfolioCasePath(portfolioCase.routeSegment)
  ),
])

const requiredRouteFiles = [
  "app/[locale]/[section]/page.tsx",
  "app/[locale]/services/[slug]/page.tsx",
  "app/[locale]/courses/[slug]/page.tsx",
  "app/[locale]/collections/[slug]/page.tsx",
  "app/[locale]/portfolio/page.tsx",
  "app/[locale]/portfolio/[slug]/page.tsx",
  "app/[locale]/contacts/page.tsx",
  "app/[locale]/booking/page.tsx",
  "app/[locale]/payment/success/page.tsx",
  "app/[locale]/payment/cancel/page.tsx",
  "app/[locale]/payment/failure/page.tsx",
]

for (const file of requiredRouteFiles) {
  if (!existsSync(file)) {
    throw new Error(`Missing generated content route file: ${file}`)
  }
}

for (const item of navigation) {
  if (!generatedPaths.has(item.path)) {
    throw new Error(
      `Navigation item ${item.id} points at unknown path: ${item.path}`
    )
  }
}

for (const cta of [
  siteSettings.home.primaryCta,
  siteSettings.home.secondaryCta,
  {
    label: siteSettings.contacts.actionLabel,
    path: siteSettings.contacts.actionPath,
  },
  ...publicPages.flatMap((page) => (page.cta ? [page.cta] : [])),
]) {
  if (!cta.path.startsWith("mailto:") && !generatedPaths.has(cta.path)) {
    throw new Error(`CTA points at unknown path: ${cta.path}`)
  }
}

for (const locale of locales) {
  const routes = getManifestRoutes(locale)
  const contentHrefs = new Set<string>()

  for (const route of routes) {
    if (!route.href.startsWith(`/${locale}`)) {
      throw new Error(`Route does not preserve locale ${locale}: ${route.href}`)
    }

    if (route.kind !== "navigation") {
      if (contentHrefs.has(route.href)) {
        throw new Error(`Duplicate generated content route: ${route.href}`)
      }

      contentHrefs.add(route.href)
    }
  }

  for (const service of services.filter((item) => item.visibleInMvp)) {
    if (
      !routes.some(
        (route) => route.kind === "service" && route.id === service.slug
      )
    ) {
      throw new Error(`Missing generated route for service: ${service.slug}`)
    }
  }

  for (const course of courses.filter((item) => item.visibleInMvp)) {
    if (
      !routes.some(
        (route) => route.kind === "course" && route.id === course.slug
      )
    ) {
      throw new Error(`Missing generated route for course: ${course.slug}`)
    }
  }

  for (const collection of collections.filter((item) => item.visibleInMvp)) {
    if (
      !routes.some(
        (route) => route.kind === "collection" && route.id === collection.slug
      )
    ) {
      throw new Error(
        `Missing generated route for collection: ${collection.slug}`
      )
    }
  }
}

console.log(
  [
    `Content ok: ${services.length} services`,
    `${courses.length} courses`,
    `${collections.length} collections`,
    `${portfolioCases.length} portfolio cases`,
    `${mediaAssets.length} media assets`,
  ].join(", ")
)
