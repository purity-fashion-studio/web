import "server-only"

import { unstable_cache } from "next/cache"
import { draftMode, headers } from "next/headers"
import { cache } from "react"
import { getPayload } from "payload"

import config from "@payload-config"
import type {
  Course as PayloadCourse,
  Direction as PayloadDirection,
  FashionCollection as PayloadFashionCollection,
  Media,
  Offer,
  Page as PayloadPage,
  PortfolioCase as PayloadPortfolioCase,
  Service as PayloadService,
} from "@/payload-types"
import type { BookingPublicCopy } from "@/features/booking/public-copy"
import type { MediaAsset } from "./media"
import { commerceLabel, formatOfferPrice } from "./commerce"
import { contentCacheIdentity } from "./cache-identity"
import { resolveEditorialBlocks, type EditorialBlock } from "./editorial"
import type { Locale } from "../i18n/routing"

export type ServiceOffer = Pick<
  Offer,
  | "id"
  | "sku"
  | "title"
  | "shortDescription"
  | "format"
  | "pricingMode"
  | "checkoutMode"
  | "commercialStatus"
  | "prices"
  | "durationMinutes"
  | "sessions"
  | "deposit"
  | "termsVersion"
>

type PublicSEO = { title: string; description: string; image?: MediaAsset }

export type ServicePageData = {
  editorialBlocks?: EditorialBlock[]
  id: string
  slug: string
  routeSegment: string
  eyebrow: string
  title: string
  summary: string
  intro: string
  audience: string
  formatsTitle: string
  formats: Array<{ title: string; text: string }>
  processTitle: string
  process: Array<{ title: string; text: string }>
  outcomeTitle: string
  outcomeSummary: string
  outcomes: string[]
  commercialTitle: string
  commercialStatus: string
  priceNote: string
  timingNote?: string
  qualification?: string
  nextStepTitle: string
  nextStepSummary: string

  mediaAsset?: MediaAsset
  offers: ServiceOffer[]
  faq: Array<{ question: string; answer: string }>
  cta: {
    action: PayloadService["cta"]["action"] | "booking-request"
    label: string
  }
  seo: PublicSEO
}

export type CoursePageData = {
  editorialBlocks?: EditorialBlock[]
  id: string
  slug: string
  routeSegment: string
  title: string
  summary: string
  description: string
  eyebrow: string
  serviceLabel: string
  audienceTitle: string
  formatTitle: string
  methodTitle: string
  prerequisitesTitle: string
  curriculumTitle: string
  curriculumSummary: string
  outcomesTitle: string
  outcomesSummary: string
  commercialTitle: string
  ctaTitle: string
  ctaSummary: string
  audience: string
  prerequisites?: string
  sessions: number
  formats: PayloadCourse["formats"]
  program: Array<{ title: string; description: string }>
  instructor?: string
  credentials?: string
  intakeNote?: string
  availability: PayloadCourse["availability"] | "coming-soon"
  commercialStatus: string
  priceNote: string
  mediaAsset?: MediaAsset
  offers: ServiceOffer[]
  cta: PayloadCourse["cta"]
  seo: PublicSEO
}

export type FashionCollectionPageData = {
  editorialBlocks?: EditorialBlock[]
  id: string
  slug: string
  routeSegment: string
  title: string
  eyebrow: string
  summary: string
  narrative: string
  stylingNotes?: string
  stylingTitle: string
  styling: Array<{ title: string; text: string }>
  factsTitle: string
  facts: Array<{ title: string; text: string }>
  inquiryTitle: string
  inquirySteps: Array<{ title: string; text: string }>
  materialsTitle: string
  availabilityTitle: string
  ctaTitle: string
  ctaSummary: string
  serviceLabel: string
  collectionType: PayloadFashionCollection["collectionType"]
  collaborationCredits?: string
  materials: string[]
  pieces: Array<{ name: string; description?: string }>
  season?: string
  year?: number
  availability: PayloadFashionCollection["availability"] | "inquiry"
  commercialStatus: string
  priceNote: string
  mediaAssets: MediaAsset[]
  offers: ServiceOffer[]
  rightsAndCredits: string
  cta: PayloadFashionCollection["cta"]
  seo: PublicSEO
}

export type PortfolioCasePageData = {
  id: string
  slug: string
  routeSegment: string
  title: string
  summary: string
  clientType: PayloadPortfolioCase["clientType"]
  brief: string
  constraints: string
  research: string
  process: string
  result: string
  hasBeforeAfter: boolean
  mediaAssets: MediaAsset[]
  seo: PublicSEO
}

export type ServiceCardData = {
  id: string
  slug: string
  routeSegment: string
  title: string
  summary: string
  mediaAsset?: MediaAsset
}

export type DirectionPageData = {
  editorialBlocks?: EditorialBlock[]
  id: string
  slug: string
  routeSegment: string
  canonicalKey: PayloadDirection["canonicalKey"]
  title: string
  summary: string
  eyebrow?: string
  narrative: string
  processTitle: string
  formatsTitle: string
  formatNotes: string[]
  outcomesTitle: string
  ctaTitle: string
  ctaSummary: string
  ctaService: string
  ctaLabel: string
  diagnosticLabel?: string
  faqTitle?: string
  faq: Array<{ question: string; answer: string }>
  countLabel?: string
  availabilityValue?: string
  availabilityLabel?: string
  fittingValue?: string
  fittingLabel?: string
  catalogueTitle?: string
  catalogueSummary?: string
  materialsLabel?: string
  inquiryTitle?: string
  inquirySteps: Array<{ title: string; text: string }>
  process: Array<{ title: string; description: string }>
  outcomes: string[]
  services: ServiceCardData[]
  mediaAsset?: MediaAsset
  seo: PublicSEO
}

export type PublicPageData = {
  editorialBlocks?: EditorialBlock[]
  id: string
  slug: string
  routeSegment: string
  pageType: PayloadPage["pageType"]
  title: string
  summary: string
  eyebrow?: string
  body: string
  studioSignals: Array<{ label: string; value: string }>
  methodEyebrow?: string
  methodTitle?: string
  methodSteps: Array<{ title: string; text: string }>
  clientsTitle?: string
  clientsSummary?: string
  privateTitle?: string
  corporateTitle?: string
  directionsTitle?: string
  ctaTitle?: string
  ctaSummary?: string
  formTitle?: string
  formSummary?: string
  heroMediaLabel?: string
  standardsTitle?: string
  standards: Array<{ title: string; text: string }>
  recordTitle?: string
  recordSummary?: string
  recordItems: string[]
  currentTitle?: string
  currentItems: Array<{ title: string; text: string }>
  flowTitle?: string
  flowItems: string[]
  secondaryCTALabel?: string
  emptyEyebrow?: string
  emptyTitle?: string
  emptySummary?: string
  emptyAction?: string
  sections: Array<{ heading: string; body: string; mediaAsset?: MediaAsset }>
  mediaAsset?: MediaAsset
  mediaIds?: string[]
  cta: PayloadPage["cta"]
  legalVersion?: string
  contentsTitle?: string
  effectiveDateLabel?: string
  effectiveDate?: string
  seo: PublicSEO
}

export type HeaderData = {
  navigation: Array<{
    label: string
    path: string
    visible: boolean
    external: boolean
    accessibleLabel?: string
  }>
  bookingLabel: string
}

export type FooterData = {
  email: string
  phone: string
  phones: string[]
  address: string
  hours: string
  responseTime: string
  socialLinks: Array<{
    platform: string
    url: string
    accessibleLabel: string
  }>
  legalNavigation: Array<{ label: string; path: string }>
  copyright: string
}

export type SiteSettingsData = {
  brandName: string
  canonicalOrigin: string
  contacts: {
    email: string
    phone: string
    address: string
    city: string
    hours: string
    actionLabel: string
    actionPath: string
    viberURL?: string
  }
  localeLabels: Record<Locale, string>
  uiLabels: {
    language: string
    close: string
    externalLink: string
    menu: string
    footerDirections: string
    footerContacts: string
  }
  contactLabels: {
    phone: string
    email: string
    viber: string
    socials: string
    direct: string
    address: string
    hours: string
    request: string
    requestSummary: string
  }
  booking: BookingPublicCopy
  maintenance: { enabled: boolean; message?: string }
}

export type HomeData = {
  heroEyebrow?: string
  heroTitle: string
  heroSummary: string
  heroMedia?: MediaAsset
  primaryCTA: { label: string; path: string }
  secondaryCTA: { label: string; path: string }
  method: Array<{ label: string; description: string }>
  studioIntro: string
  serviceIntro: string
  priceNote: string
  methodEyebrow: string
  methodTitle: string
  methodDetails: string[]
  studioEyebrow: string
  studioTitle: string
  serviceRailTitle: string
  collectionRailTitle: string
  portfolioNote: string
  portfolioTitle: string
  portfolioSummary: string
  portfolioSignals: string[]
  faqTitle: string
  faq: Array<{ question: string; answer: string }>
  sectionMedia: {
    research?: MediaAsset
    imagine?: MediaAsset
    create?: MediaAsset
    directions?: MediaAsset
    studio?: MediaAsset
    portfolio?: MediaAsset
  }
  finalCTATitle: string
  finalCTASummary: string
  selectedServiceSlugs: string[]
  selectedCourseSlugs: string[]
  selectedCollectionSlugs: string[]
  selectedPortfolioSlugs: string[]
  seo: PublicSEO
}

const getPayloadClient = cache(() => getPayload({ config }))

// Namespace persistent public reads by deployment so cached drafts or missing
// documents cannot mask current published content. Local runtimes use a stable
// namespace and the same content-change invalidation hooks.
const payloadCacheNamespace = contentCacheIdentity({
  deploymentKey:
    process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA,
  databaseURL: process.env.DATABASE_URL,
  localMedia: process.env.PAYLOAD_DISABLE_BLOB_STORAGE === "true",
})

function safeExternalURL(value: string | null | undefined) {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return undefined
  try {
    const url = new URL(value.trim())
    return ["http:", "https:", "mailto:", "tel:", "viber:"].includes(
      url.protocol
    )
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
}

const getAuthenticatedPayloadUser = cache(async () => {
  const payload = await getPayloadClient()
  const result = await payload.auth({ headers: await headers() })
  return result.user ?? undefined
})

async function getPayloadAccess(draft: boolean) {
  return {
    overrideAccess: false as const,
    user: draft ? await getAuthenticatedPayloadUser() : undefined,
  }
}

function payloadMediaToView(
  media: Media,
  locale: Locale
): MediaAsset | undefined {
  if (
    media.usageRightsStatus !== "approved" ||
    media.publicVisibility !== true ||
    (media.rightsExpiry && new Date(media.rightsExpiry).valueOf() <= Date.now())
  ) {
    return undefined
  }

  const preferredSize = media.sizes?.hero
  const filename = preferredSize?.filename ?? media.filename
  if (!filename) return undefined

  const alt = { uk: media.alt, ru: media.alt, en: media.alt }
  const internalLabel = {
    uk: media.internalLabel,
    ru: media.internalLabel,
    en: media.internalLabel,
  }
  const focalX = media.focalX ?? 50

  return {
    id: media.id,
    kind: "image",
    source: media.source,
    generated: media.source === "generated",
    fileName: media.filename ?? media.id,
    aspectRatio:
      media.width && media.height ? `${media.width}/${media.height}` : "4/3",
    // Never publish a storage-provider URL. Both local and Blob adapters serve
    // this endpoint only after checking the current Media read access policy.
    src: `/api/media/file/${encodeURIComponent(filename)}`,
    heroFocalPoint: focalX < 34 ? "left" : focalX > 66 ? "right" : "center",
    usage: media.allowedUsageContexts ?? [],
    internalLabel,
    alt: { ...alt, [locale]: media.alt },
    replacementPriority:
      media.replacementPriority === "none"
        ? "keep-client-source"
        : media.replacementPriority === "replace-when-approved"
          ? "replace-when-client-proof-arrives"
          : media.replacementPriority,
    isRealClientProof: media.isRealClientProof,
  }
}

const publicMediaSelect = {
  internalLabel: true,
  alt: true,
  source: true,
  allowedUsageContexts: true,
  isRealClientProof: true,
  publicVisibility: true,
  usageRightsStatus: true,
  rightsExpiry: true,
  replacementPriority: true,
  url: true,
  filename: true,
  width: true,
  height: true,
  focalX: true,
  sizes: true,
} as const

function relationshipID(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "id" in value) {
    const id = value.id
    return typeof id === "string" || typeof id === "number"
      ? String(id)
      : undefined
  }
  return undefined
}

function relationshipIDs(value: unknown): string[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const id = relationshipID(item)
        return id ? [id] : []
      })
    : []
}

async function findReadableMediaMap(
  locale: Locale,
  ids: string[],
  draft: boolean,
  proofOnly = false
) {
  const mediaByID = new Map<string, MediaAsset | undefined>()
  if (!ids.length) return mediaByID

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "media",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: ids.length,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: publicMediaSelect,
    where: { id: { in: ids } },
  })

  for (const media of result.docs) {
    mediaByID.set(
      media.id,
      proofOnly &&
        !draft &&
        (media.source !== "client" || !media.isRealClientProof)
        ? undefined
        : payloadMediaToView(media as Media, locale)
    )
  }
  return mediaByID
}

async function findSEOImage(value: unknown, locale: Locale, draft: boolean) {
  const id = relationshipID(value)
  return id
    ? (await findReadableMediaMap(locale, [id], draft)).get(id)
    : undefined
}

async function findEditorialBlocks(
  blocks: PayloadService["supplementaryLayout"],
  locale: Locale,
  draft: boolean
) {
  if (!blocks?.length) return []
  return resolveEditorialBlocks({
    blocks,
    locale,
    draft,
    payload: await getPayloadClient(),
    access: await getPayloadAccess(draft),
    readMedia: (ids) => findReadableMediaMap(locale, ids, draft),
  })
}

function orderByRelationship<T extends { id: string }>(
  docs: T[],
  relationship: unknown
) {
  if (!Array.isArray(relationship)) return docs

  const order = new Map(
    relationship.map((value, index) => {
      const id =
        typeof value === "string"
          ? value
          : value && typeof value === "object" && "id" in value
            ? String(value.id)
            : undefined
      return [id, index] as const
    })
  )

  return [...docs].sort(
    (left, right) =>
      (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(right.id) ?? Number.MAX_SAFE_INTEGER)
  )
}

async function findReadableMediaByID(
  locale: Locale,
  id: string,
  draft: boolean
): Promise<MediaAsset | undefined> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "media",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    where: { id: { equals: id } },
    select: publicMediaSelect,
  })

  const media = result.docs[0]
  return media ? payloadMediaToView(media as Media, locale) : undefined
}

async function findPayloadService(
  locale: Locale,
  slug: string,
  draft: boolean
): Promise<ServicePageData | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "services",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      primaryDirection: true,
      audience: true,
      intro: true,
      formatsTitle: true,
      processTitle: true,
      outcomeTitle: true,
      commercialTitle: true,
      commercialStatusCopy: true,
      priceNote: true,
      nextStepTitle: true,
      nextStepSummary: true,
      formats: true,
      formatPresentation: true,
      processSteps: true,
      benefits: true,
      outcomes: true,
      timingNote: true,
      qualification: true,
      supplementaryLayout: true,
      gallery: true,
      faq: true,
      cta: true,
      meta: true,
    },
    where: { slug: { equals: slug } },
  })
  const service = result.docs[0]
  if (!service) return null

  const [directionResult, mediaResult, offersResult] = await Promise.all([
    payload.find({
      collection: "directions",
      where: { id: { equals: relationshipID(service.primaryDirection) } },
      limit: 1,
      depth: 0,
      draft,
      fallbackLocale: false,
      locale,
      ...(await getPayloadAccess(draft)),
      select: { title: true },
    }),
    service.gallery?.length
      ? payload.find({
          collection: "media",
          depth: 0,
          draft,
          fallbackLocale: false,
          limit: service.gallery.length,
          locale,
          ...(await getPayloadAccess(draft)),
          pagination: false,
          select: publicMediaSelect,
          where: { id: { in: service.gallery } },
        })
      : Promise.resolve({ docs: [] }),
    payload.find({
      collection: "offers",
      depth: 0,
      draft,
      fallbackLocale: false,
      locale,
      ...(await getPayloadAccess(draft)),
      pagination: false,
      sort: "sortOrder",
      select: {
        id: true,
        sku: true,
        title: true,
        shortDescription: true,
        format: true,
        pricingMode: true,
        checkoutMode: true,
        commercialStatus: true,
        prices: true,
        durationMinutes: true,
        sessions: true,
        deposit: true,
        termsVersion: true,
      },
      where: { service: { equals: service.id } },
    }),
  ])

  const direction = directionResult.docs[0]
  if (!direction) return null
  const media = orderByRelationship(mediaResult.docs, service.gallery)[0]
  const formats = service.formatPresentation ?? []
  const outcomes = service.outcomes?.map((item) => item.text) ?? []
  const offers = offersResult.docs as ServiceOffer[]

  return {
    id: service.id,
    slug: service.slug,
    routeSegment: service.slug,
    eyebrow: direction.title,
    title: service.title,
    summary: service.summary,
    intro: service.intro,
    audience: service.audience,
    formatsTitle: service.formatsTitle,
    formats,
    processTitle: service.processTitle,
    process:
      service.processSteps?.map((step) => ({
        title: step.title,
        text: step.description,
      })) ?? [],
    outcomeTitle: service.outcomeTitle,
    outcomeSummary:
      service.benefits?.map((benefit) => benefit.description).join(" ") ||
      service.summary,
    outcomes,
    commercialTitle: service.commercialTitle,
    commercialStatus: service.commercialStatusCopy,
    priceNote: service.priceNote,
    timingNote: service.timingNote ?? undefined,
    qualification: service.qualification ?? undefined,
    nextStepTitle: service.nextStepTitle,
    nextStepSummary: service.nextStepSummary,
    mediaAsset: media ? payloadMediaToView(media as Media, locale) : undefined,
    offers,
    editorialBlocks: await findEditorialBlocks(
      service.supplementaryLayout,
      locale,
      draft
    ),
    faq:
      service.faq?.map((item) => ({
        question: item.question,
        answer: item.answer,
      })) ?? [],
    cta: service.cta,
    seo: {
      title: service.meta?.title || `${service.title} | PURITY Fashion Studio`,
      description: service.meta?.description || service.summary,
      image: await findSEOImage(service.meta?.image, locale, draft),
    },
  }
}

function cachedPayloadService(locale: Locale, slug: string) {
  return unstable_cache(
    () => findPayloadService(locale, slug, false),
    [payloadCacheNamespace, "cms", "service", locale, slug],
    {
      revalidate: 60,
      tags: [
        "cms:editorial",
        "cms:services",
        "cms:offers",
        "cms:media",
        `cms:services:${slug}`,
      ],
    }
  )()
}

export async function getServiceBySlug(
  locale: Locale,
  slug: string
): Promise<ServicePageData | null> {
  const { isEnabled } = await draftMode()
  return isEnabled
    ? findPayloadService(locale, slug, true)
    : cachedPayloadService(locale, slug)
}

export async function getPublishedServiceSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "services",
    depth: 0,
    fallbackLocale: false,
    limit: 1000,
    locale: "uk",
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
    sort: "sortOrder",
  })

  return result.docs.map((service) => service.slug)
}

async function findPayloadCourse(
  locale: Locale,
  slug: string,
  draft: boolean
): Promise<CoursePageData | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "courses",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      eyebrow: true,
      summary: true,
      description: true,
      serviceLabel: true,
      audienceTitle: true,
      formatTitle: true,
      methodTitle: true,
      prerequisitesTitle: true,
      curriculumTitle: true,
      curriculumSummary: true,
      outcomesTitle: true,
      outcomesSummary: true,
      commercialTitle: true,
      ctaTitle: true,
      ctaSummary: true,
      audience: true,
      prerequisites: true,
      sessions: true,
      formats: true,
      program: true,
      instructor: true,
      credentials: true,
      intakeNote: true,
      supplementaryLayout: true,
      media: true,
      availability: true,
      cta: true,
      meta: true,
    },
    where: { slug: { equals: slug } },
  })
  const course = result.docs[0]
  if (!course) return null

  const [mediaResult, offersResult] = await Promise.all([
    course.media?.length
      ? payload.find({
          collection: "media",
          depth: 0,
          draft,
          fallbackLocale: false,
          limit: course.media.length,
          locale,
          ...(await getPayloadAccess(draft)),
          pagination: false,
          select: publicMediaSelect,
          where: { id: { in: course.media } },
        })
      : Promise.resolve({ docs: [] }),
    payload.find({
      collection: "offers",
      depth: 0,
      draft,
      fallbackLocale: false,
      locale,
      ...(await getPayloadAccess(draft)),
      pagination: false,
      sort: "sortOrder",
      select: {
        id: true,
        sku: true,
        title: true,
        shortDescription: true,
        format: true,
        pricingMode: true,
        checkoutMode: true,
        commercialStatus: true,
        prices: true,
        durationMinutes: true,
        sessions: true,
        deposit: true,
        termsVersion: true,
      },
      where: { course: { equals: course.id } },
    }),
  ])
  const media = orderByRelationship(mediaResult.docs, course.media)[0]

  return {
    id: course.id,
    slug: course.slug,
    routeSegment: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    eyebrow: course.eyebrow,
    serviceLabel: course.serviceLabel,
    audienceTitle: course.audienceTitle,
    formatTitle: course.formatTitle,
    methodTitle: course.methodTitle,
    prerequisitesTitle: course.prerequisitesTitle,
    curriculumTitle: course.curriculumTitle,
    curriculumSummary: course.curriculumSummary,
    outcomesTitle: course.outcomesTitle,
    outcomesSummary: course.outcomesSummary,
    commercialTitle: course.commercialTitle,
    ctaTitle: course.ctaTitle,
    ctaSummary: course.ctaSummary,
    audience: course.audience,
    prerequisites: course.prerequisites ?? undefined,
    sessions: course.sessions,
    formats: course.formats,
    program:
      course.program?.map((lesson) => ({
        title: lesson.title,
        description: lesson.description,
      })) ?? [],
    instructor: course.instructor ?? undefined,
    credentials: course.credentials ?? undefined,
    intakeNote: course.intakeNote ?? undefined,
    availability: course.availability,
    commercialStatus:
      offersResult.docs.find((offer) => offer.commercialStatus === "active")
        ?.commercialStatus ?? course.availability,
    // Courses intentionally render their offer price through the localized
    // Site Settings labels. `shortDescription` retains the imported source
    // note on the offer without exposing a technical pricing mode such as
    // "custom" to visitors.
    priceNote: "",
    mediaAsset: media ? payloadMediaToView(media as Media, locale) : undefined,
    offers: offersResult.docs as ServiceOffer[],
    cta: course.cta,
    editorialBlocks: await findEditorialBlocks(
      course.supplementaryLayout,
      locale,
      draft
    ),
    seo: {
      title: course.meta?.title || `${course.title} | PURITY Fashion Studio`,
      description: course.meta?.description || course.summary,
      image: await findSEOImage(course.meta?.image, locale, draft),
    },
  }
}

function cachedPayloadCourse(locale: Locale, slug: string) {
  return unstable_cache(
    () => findPayloadCourse(locale, slug, false),
    [payloadCacheNamespace, "cms", "course", locale, slug],
    {
      revalidate: 60,
      tags: [
        "cms:editorial",
        "cms:courses",
        "cms:offers",
        "cms:media",
        `cms:courses:${slug}`,
      ],
    }
  )()
}

export async function getCourseBySlug(locale: Locale, slug: string) {
  const { isEnabled } = await draftMode()
  return isEnabled
    ? findPayloadCourse(locale, slug, true)
    : cachedPayloadCourse(locale, slug)
}

export async function getPublishedCourseSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "courses",
    depth: 0,
    fallbackLocale: false,
    limit: 1000,
    locale: "uk",
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
    sort: "sortOrder",
  })
  return result.docs.map((course) => course.slug)
}

export type CourseCategoryCard = Pick<
  CoursePageData,
  | "id"
  | "slug"
  | "routeSegment"
  | "title"
  | "summary"
  | "commercialStatus"
  | "priceNote"
  | "mediaAsset"
>

async function findPublishedPayloadCourseCards(
  locale: Locale,
  draft: boolean
): Promise<CourseCategoryCard[]> {
  const payload = await getPayloadClient()
  const access = await getPayloadAccess(draft)
  const result = await payload.find({
    collection: "courses",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1000,
    locale,
    ...access,
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      availability: true,
      media: true,
    },
    sort: "sortOrder",
  })
  const courseIDs = result.docs.map((course) => course.id)
  const mediaIDs = [
    ...new Set(result.docs.flatMap((course) => relationshipIDs(course.media))),
  ]
  const [offersResult, mediaByID] = await Promise.all([
    courseIDs.length
      ? payload.find({
          collection: "offers",
          depth: 0,
          draft,
          fallbackLocale: false,
          limit: 1000,
          locale,
          ...access,
          pagination: false,
          select: { course: true, commercialStatus: true },
          where: { course: { in: courseIDs } },
        })
      : Promise.resolve({ docs: [] }),
    findReadableMediaMap(locale, mediaIDs, draft),
  ])
  const activeCourseIDs = new Set(
    offersResult.docs.flatMap((offer) => {
      const courseID = relationshipID(offer.course)
      return offer.commercialStatus === "active" && courseID ? [courseID] : []
    })
  )

  return result.docs.map((course) => {
    const firstMediaID = relationshipIDs(course.media)[0]
    return {
      id: course.id,
      slug: course.slug,
      routeSegment: course.slug,
      title: course.title,
      summary: course.summary,
      commercialStatus: activeCourseIDs.has(course.id)
        ? "active"
        : course.availability,
      priceNote: "",
      mediaAsset: firstMediaID ? mediaByID.get(firstMediaID) : undefined,
    }
  })
}

export async function getPublishedCourseCards(locale: Locale) {
  const draft = await getDraftFlag()
  if (draft) return findPublishedPayloadCourseCards(locale, true)
  return unstable_cache(
    () => findPublishedPayloadCourseCards(locale, false),
    [payloadCacheNamespace, "cms", "course-cards", locale],
    {
      revalidate: 60,
      tags: ["cms:courses", "cms:offers", "cms:media"],
    }
  )()
}

async function findPayloadFashionCollection(
  locale: Locale,
  slug: string,
  draft: boolean
): Promise<FashionCollectionPageData | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "fashion-collections",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      eyebrow: true,
      summary: true,
      narrative: true,
      stylingNotes: true,
      stylingTitle: true,
      styling: true,
      factsTitle: true,
      facts: true,
      inquiryTitle: true,
      inquirySteps: true,
      materialsTitle: true,
      availabilityTitle: true,
      ctaTitle: true,
      ctaSummary: true,
      serviceLabel: true,
      collectionType: true,
      collaborationCredits: true,
      materials: true,
      pieces: true,
      season: true,
      year: true,
      gallery: true,
      availability: true,
      rightsAndCredits: true,
      supplementaryLayout: true,
      cta: true,
      meta: true,
    },
    where: { slug: { equals: slug } },
  })
  const collection = result.docs[0]
  if (!collection) return null

  const [mediaResult, offersResult] = await Promise.all([
    payload.find({
      collection: "media",
      depth: 0,
      draft,
      fallbackLocale: false,
      limit: Math.max(collection.gallery.length, 1),
      locale,
      ...(await getPayloadAccess(draft)),
      pagination: false,
      select: publicMediaSelect,
      where: { id: { in: collection.gallery } },
    }),
    payload.find({
      collection: "offers",
      depth: 0,
      draft,
      fallbackLocale: false,
      locale,
      ...(await getPayloadAccess(draft)),
      pagination: false,
      sort: "sortOrder",
      select: {
        id: true,
        sku: true,
        title: true,
        shortDescription: true,
        format: true,
        pricingMode: true,
        checkoutMode: true,
        commercialStatus: true,
        prices: true,
        durationMinutes: true,
        sessions: true,
        deposit: true,
        termsVersion: true,
      },
      where: { fashionCollection: { equals: collection.id } },
    }),
  ])
  const mediaByID = new Map(
    mediaResult.docs.map((media) => [
      media.id,
      payloadMediaToView(media as Media, locale),
    ])
  )

  const priceLabels = (await getSiteSettings(locale)).booking.pricing
  return {
    id: collection.id,
    slug: collection.slug,
    routeSegment: collection.slug,
    title: collection.title,
    eyebrow: collection.eyebrow ?? collection.title,
    summary: collection.summary,
    narrative: collection.narrative,
    stylingNotes: collection.stylingNotes ?? undefined,
    stylingTitle: collection.stylingTitle,
    styling: collection.styling ?? [],
    factsTitle: collection.factsTitle,
    facts: collection.facts ?? [],
    inquiryTitle: collection.inquiryTitle,
    inquirySteps: collection.inquirySteps ?? [],
    materialsTitle: collection.materialsTitle,
    availabilityTitle: collection.availabilityTitle,
    ctaTitle: collection.ctaTitle,
    ctaSummary: collection.ctaSummary,
    serviceLabel: collection.serviceLabel,
    collectionType: collection.collectionType,
    collaborationCredits: collection.collaborationCredits ?? undefined,
    materials: collection.materials?.map((material) => material.material) ?? [],
    pieces:
      collection.pieces?.map((piece) => ({
        name: piece.name,
        description: piece.description ?? undefined,
      })) ?? [],
    season: collection.season ?? undefined,
    year: collection.year ?? undefined,
    availability: collection.availability,
    commercialStatus:
      offersResult.docs.find((offer) => offer.commercialStatus === "active")
        ?.commercialStatus ?? collection.availability,
    priceNote:
      offersResult.docs.length > 0
        ? offersResult.docs
            .map(
              (offer) =>
                `${offer.title}: ${formatOfferPrice(offer, locale, priceLabels)}`
            )
            .join(" · ")
        : commerceLabel(locale, "status", collection.availability),
    mediaAssets: collection.gallery
      .map((id) => mediaByID.get(typeof id === "string" ? id : id.id))
      .filter((asset): asset is MediaAsset => Boolean(asset)),
    offers: offersResult.docs as ServiceOffer[],
    rightsAndCredits: collection.rightsAndCredits,
    cta: collection.cta,
    editorialBlocks: await findEditorialBlocks(
      collection.supplementaryLayout,
      locale,
      draft
    ),
    seo: {
      title:
        collection.meta?.title || `${collection.title} | PURITY Fashion Studio`,
      description: collection.meta?.description || collection.summary,
      image: await findSEOImage(collection.meta?.image, locale, draft),
    },
  }
}

function cachedPayloadFashionCollection(locale: Locale, slug: string) {
  return unstable_cache(
    () => findPayloadFashionCollection(locale, slug, false),
    [payloadCacheNamespace, "cms", "fashion-collection", locale, slug],
    {
      revalidate: 60,
      tags: [
        "cms:fashion-collections",
        "cms:offers",
        "cms:media",
        "cms:editorial",
        `cms:fashion-collections:${slug}`,
        "cms:site-settings",
      ],
    }
  )()
}

export async function getFashionCollectionBySlug(locale: Locale, slug: string) {
  const { isEnabled } = await draftMode()
  return isEnabled
    ? findPayloadFashionCollection(locale, slug, true)
    : cachedPayloadFashionCollection(locale, slug)
}

export async function getPublishedFashionCollectionSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "fashion-collections",
    depth: 0,
    fallbackLocale: false,
    limit: 1000,
    locale: "uk",
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
    sort: "sortOrder",
  })
  return result.docs.map((collection) => collection.slug)
}

export type FashionCollectionCategoryCard = Pick<
  FashionCollectionPageData,
  | "id"
  | "slug"
  | "routeSegment"
  | "title"
  | "summary"
  | "materials"
  | "commercialStatus"
  | "priceNote"
  | "mediaAssets"
>

async function findPublishedPayloadFashionCollectionCards(
  locale: Locale,
  draft: boolean
): Promise<FashionCollectionCategoryCard[]> {
  const payload = await getPayloadClient()
  const access = await getPayloadAccess(draft)
  const result = await payload.find({
    collection: "fashion-collections",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1000,
    locale,
    ...access,
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      materials: true,
      availability: true,
      gallery: true,
    },
    sort: "sortOrder",
  })
  const collectionIDs = result.docs.map((collection) => collection.id)
  const mediaIDs = [
    ...new Set(
      result.docs.flatMap((collection) => relationshipIDs(collection.gallery))
    ),
  ]
  const [offersResult, mediaByID] = await Promise.all([
    collectionIDs.length
      ? payload.find({
          collection: "offers",
          depth: 0,
          draft,
          fallbackLocale: false,
          limit: 1000,
          locale,
          ...access,
          pagination: false,
          select: {
            fashionCollection: true,
            title: true,
            pricingMode: true,
            prices: true,
            commercialStatus: true,
          },
          where: { fashionCollection: { in: collectionIDs } },
          sort: "sortOrder",
        })
      : Promise.resolve({ docs: [] }),
    findReadableMediaMap(locale, mediaIDs, draft),
  ])
  const priceLabels = (await getSiteSettings(locale)).booking.pricing
  const offersByCollectionID = new Map<
    string,
    { active: boolean; labels: string[] }
  >()
  for (const offer of offersResult.docs) {
    const collectionID = relationshipID(offer.fashionCollection)
    if (!collectionID) continue
    const current = offersByCollectionID.get(collectionID) ?? {
      active: false,
      labels: [],
    }
    current.active ||= offer.commercialStatus === "active"
    current.labels.push(
      `${offer.title}: ${formatOfferPrice(offer, locale, priceLabels)}`
    )
    offersByCollectionID.set(collectionID, current)
  }

  return result.docs.map((collection) => {
    const firstMediaIDs = relationshipIDs(collection.gallery)
    const offers = offersByCollectionID.get(collection.id)
    return {
      id: collection.id,
      slug: collection.slug,
      routeSegment: collection.slug,
      title: collection.title,
      summary: collection.summary,
      materials:
        collection.materials?.map((material) => material.material) ?? [],
      commercialStatus: offers?.active ? "active" : collection.availability,
      priceNote: offers?.labels.length
        ? offers.labels.join(" · ")
        : commerceLabel(locale, "status", collection.availability),
      mediaAssets: firstMediaIDs
        .map((id) => mediaByID.get(id))
        .filter((asset): asset is MediaAsset => Boolean(asset)),
    }
  })
}

export async function getPublishedFashionCollectionCards(locale: Locale) {
  const draft = await getDraftFlag()
  if (draft) return findPublishedPayloadFashionCollectionCards(locale, true)
  return unstable_cache(
    () => findPublishedPayloadFashionCollectionCards(locale, false),
    [payloadCacheNamespace, "cms", "fashion-collection-cards", locale],
    {
      revalidate: 60,
      tags: [
        "cms:fashion-collections",
        "cms:offers",
        "cms:media",
        "cms:site-settings",
      ],
    }
  )()
}

async function findPayloadPortfolioCase(
  locale: Locale,
  slug: string,
  draft: boolean
): Promise<PortfolioCasePageData | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "portfolio-cases",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      clientType: true,
      brief: true,
      constraints: true,
      research: true,
      process: true,
      result: true,
      media: true,
      hasBeforeAfter: true,
      meta: true,
    },
    where: { slug: { equals: slug } },
  })
  const portfolioCase = result.docs[0]
  if (!portfolioCase) return null

  const mediaResult = await payload.find({
    collection: "media",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: Math.max(portfolioCase.media.length, 1),
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: publicMediaSelect,
    where: { id: { in: portfolioCase.media } },
  })
  const mediaByID = new Map(
    mediaResult.docs.map((media) => [
      media.id,
      !draft && (media.source !== "client" || !media.isRealClientProof)
        ? undefined
        : payloadMediaToView(media as Media, locale),
    ])
  )

  const proofAssets = portfolioCase.media
    .map((id) => mediaByID.get(typeof id === "string" ? id : id.id))
    .filter((asset): asset is MediaAsset => Boolean(asset))
  if (!draft && !proofAssets.length) return null
  return {
    id: portfolioCase.id,
    slug: portfolioCase.slug,
    routeSegment: portfolioCase.slug,
    title: portfolioCase.title,
    summary: portfolioCase.summary,
    clientType: portfolioCase.clientType,
    brief: portfolioCase.brief,
    constraints: portfolioCase.constraints,
    research: portfolioCase.research,
    process: portfolioCase.process,
    result: portfolioCase.result,
    hasBeforeAfter: portfolioCase.hasBeforeAfter,
    mediaAssets: proofAssets,
    seo: {
      image: await findSEOImage(portfolioCase.meta?.image, locale, draft),
      title:
        portfolioCase.meta?.title ||
        `${portfolioCase.title} | PURITY Fashion Studio`,
      description: portfolioCase.meta?.description || portfolioCase.summary,
    },
  }
}

function cachedPayloadPortfolioCase(locale: Locale, slug: string) {
  return unstable_cache(
    () => findPayloadPortfolioCase(locale, slug, false),
    [payloadCacheNamespace, "cms", "portfolio-case", locale, slug],
    {
      revalidate: 60,
      tags: ["cms:portfolio-cases", "cms:media", `cms:portfolio-cases:${slug}`],
    }
  )()
}

export async function getPortfolioCaseBySlug(locale: Locale, slug: string) {
  const { isEnabled } = await draftMode()
  return isEnabled
    ? findPayloadPortfolioCase(locale, slug, true)
    : cachedPayloadPortfolioCase(locale, slug)
}

async function findPublishedPayloadPortfolioCases(locale: Locale) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "portfolio-cases",
    depth: 0,
    fallbackLocale: false,
    limit: 100,
    locale,
    overrideAccess: false,
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      clientType: true,
      brief: true,
      constraints: true,
      research: true,
      process: true,
      result: true,
      media: true,
      hasBeforeAfter: true,
      meta: true,
    },
    sort: "sortOrder",
  })
  const mediaIDs = [
    ...new Set(
      result.docs.flatMap((portfolioCase) =>
        relationshipIDs(portfolioCase.media)
      )
    ),
  ]
  const mediaByID = await findReadableMediaMap(locale, mediaIDs, false, true)

  const cases = result.docs.map((portfolioCase) => ({
    id: portfolioCase.id,
    slug: portfolioCase.slug,
    routeSegment: portfolioCase.slug,
    title: portfolioCase.title,
    summary: portfolioCase.summary,
    clientType: portfolioCase.clientType,
    brief: portfolioCase.brief,
    constraints: portfolioCase.constraints,
    research: portfolioCase.research,
    process: portfolioCase.process,
    result: portfolioCase.result,
    hasBeforeAfter: portfolioCase.hasBeforeAfter,
    mediaAssets: relationshipIDs(portfolioCase.media)
      .map((id) => mediaByID.get(id))
      .filter((asset): asset is MediaAsset => Boolean(asset)),
    seo: {
      title:
        portfolioCase.meta?.title ||
        `${portfolioCase.title} | PURITY Fashion Studio`,
      description: portfolioCase.meta?.description || portfolioCase.summary,
    },
  })) satisfies PortfolioCasePageData[]
  return cases.filter((portfolioCase) => portfolioCase.mediaAssets.length > 0)
}

export async function getPublishedPortfolioCases(locale: Locale) {
  return unstable_cache(
    () => findPublishedPayloadPortfolioCases(locale),
    [payloadCacheNamespace, "cms", "portfolio-cases", locale],
    { revalidate: 60, tags: ["cms:portfolio-cases", "cms:media"] }
  )()
}

export async function getPublishedPortfolioCaseSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "portfolio-cases",
    depth: 0,
    fallbackLocale: false,
    limit: 1000,
    locale: "uk",
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
    sort: "sortOrder",
  })
  return result.docs.map((portfolioCase) => portfolioCase.slug)
}

type HomeSelectionSlugs = Pick<
  HomeData,
  | "selectedServiceSlugs"
  | "selectedCourseSlugs"
  | "selectedCollectionSlugs"
  | "selectedPortfolioSlugs"
>

function selectInRelationshipOrder<T extends { slug: string }>(
  docs: T[],
  slugs: string[]
) {
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]))
  return slugs.flatMap((slug) => {
    const doc = bySlug.get(slug)
    return doc ? [doc] : []
  })
}

type HomeServiceSelection = {
  routeSegment: string
  title: string
  summary: string
  categoryTitle: string
  outcomes: string[]
  mediaAsset?: MediaAsset
}

type HomeCourseSelection = {
  routeSegment: string
  title: string
  summary: string
  audience: string
  lessons: string[]
  commercialStatus: string
  mediaAsset?: MediaAsset
}

type HomeCollectionSelection = {
  routeSegment: string
  title: string
  mediaAsset?: MediaAsset
}

type HomePortfolioSelection = {
  routeSegment: string
  title: string
}

async function findHomeServiceSelections(
  locale: Locale,
  slugs: string[],
  draft: boolean
): Promise<HomeServiceSelection[]> {
  if (!slugs.length) return []
  const payload = await getPayloadClient()
  const access = await getPayloadAccess(draft)
  const result = await payload.find({
    collection: "services",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: slugs.length,
    locale,
    ...access,
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      primaryDirection: true,
      outcomes: true,
      gallery: true,
    },
    where: { slug: { in: slugs } },
  })

  const directionIDs = [
    ...new Set(
      result.docs.flatMap(
        (service) => relationshipID(service.primaryDirection) ?? []
      )
    ),
  ]
  const mediaIDs = [
    ...new Set(
      result.docs.flatMap((service) => relationshipIDs(service.gallery))
    ),
  ]
  const [directionsResult, mediaByID] = await Promise.all([
    directionIDs.length
      ? payload.find({
          collection: "directions",
          depth: 0,
          draft,
          fallbackLocale: false,
          limit: directionIDs.length,
          locale,
          ...access,
          pagination: false,
          select: { id: true, title: true },
          where: { id: { in: directionIDs } },
        })
      : Promise.resolve({ docs: [] }),
    findReadableMediaMap(locale, mediaIDs, draft),
  ])
  const directionTitles = new Map(
    directionsResult.docs.map((direction) => [direction.id, direction.title])
  )

  return selectInRelationshipOrder(result.docs, slugs).map((service) => {
    const firstMediaID = relationshipIDs(service.gallery)[0]
    const directionID = relationshipID(service.primaryDirection)
    return {
      routeSegment: service.slug,
      title: service.title,
      summary: service.summary,
      categoryTitle: directionID
        ? (directionTitles.get(directionID) ?? "")
        : "",
      outcomes: service.outcomes?.map((item) => item.text) ?? [],
      mediaAsset: firstMediaID ? mediaByID.get(firstMediaID) : undefined,
    }
  })
}

async function findHomeCourseSelections(
  locale: Locale,
  slugs: string[],
  draft: boolean
): Promise<HomeCourseSelection[]> {
  if (!slugs.length) return []
  const payload = await getPayloadClient()
  const access = await getPayloadAccess(draft)
  const result = await payload.find({
    collection: "courses",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: slugs.length,
    locale,
    ...access,
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      audience: true,
      program: true,
      availability: true,
      media: true,
    },
    where: { slug: { in: slugs } },
  })
  const courseIDs = result.docs.map((course) => course.id)
  const mediaIDs = [
    ...new Set(result.docs.flatMap((course) => relationshipIDs(course.media))),
  ]
  const [offersResult, mediaByID] = await Promise.all([
    courseIDs.length
      ? payload.find({
          collection: "offers",
          depth: 0,
          draft,
          fallbackLocale: false,
          limit: 1000,
          locale,
          ...access,
          pagination: false,
          select: { course: true, commercialStatus: true },
          where: { course: { in: courseIDs } },
        })
      : Promise.resolve({ docs: [] }),
    findReadableMediaMap(locale, mediaIDs, draft),
  ])
  const offersByCourseID = new Map<string, string>()
  for (const offer of offersResult.docs) {
    const courseID = relationshipID(offer.course)
    if (courseID && offer.commercialStatus === "active") {
      offersByCourseID.set(courseID, offer.commercialStatus)
    }
  }

  return selectInRelationshipOrder(result.docs, slugs).map((course) => {
    const firstMediaID = relationshipIDs(course.media)[0]
    return {
      routeSegment: course.slug,
      title: course.title,
      summary: course.summary,
      audience: course.audience,
      lessons: course.program?.map((lesson) => lesson.title) ?? [],
      commercialStatus: offersByCourseID.get(course.id) ?? course.availability,
      mediaAsset: firstMediaID ? mediaByID.get(firstMediaID) : undefined,
    }
  })
}

async function findHomeCollectionSelections(
  locale: Locale,
  slugs: string[],
  draft: boolean
): Promise<HomeCollectionSelection[]> {
  if (!slugs.length) return []
  const payload = await getPayloadClient()
  const access = await getPayloadAccess(draft)
  const result = await payload.find({
    collection: "fashion-collections",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: slugs.length,
    locale,
    ...access,
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      availability: true,
      gallery: true,
    },
    where: { slug: { in: slugs } },
  })
  const mediaIDs = [
    ...new Set(
      result.docs.flatMap((collection) => relationshipIDs(collection.gallery))
    ),
  ]
  const mediaByID = await findReadableMediaMap(locale, mediaIDs, draft)

  return selectInRelationshipOrder(result.docs, slugs).map((collection) => {
    const firstMediaID = relationshipIDs(collection.gallery)[0]
    return {
      routeSegment: collection.slug,
      title: collection.title,
      mediaAsset: firstMediaID ? mediaByID.get(firstMediaID) : undefined,
    }
  })
}

async function findHomePortfolioSelections(
  locale: Locale,
  slugs: string[],
  draft: boolean
): Promise<HomePortfolioSelection[]> {
  if (!slugs.length) return []
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "portfolio-cases",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: slugs.length,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: { id: true, slug: true, title: true },
    where: { slug: { in: slugs } },
  })
  return selectInRelationshipOrder(result.docs, slugs).map((portfolioCase) => ({
    routeSegment: portfolioCase.slug,
    title: portfolioCase.title,
  }))
}

async function findPayloadHomeSelections(
  locale: Locale,
  selection: HomeSelectionSlugs,
  draft: boolean
) {
  const [services, courses, collections, portfolio] = await Promise.all([
    findHomeServiceSelections(locale, selection.selectedServiceSlugs, draft),
    findHomeCourseSelections(locale, selection.selectedCourseSlugs, draft),
    findHomeCollectionSelections(
      locale,
      selection.selectedCollectionSlugs,
      draft
    ),
    findHomePortfolioSelections(
      locale,
      selection.selectedPortfolioSlugs,
      draft
    ),
  ])
  return { services, courses, collections, portfolio }
}

export async function getHomeSelections(
  locale: Locale,
  selection: HomeSelectionSlugs
) {
  const draft = await getDraftFlag()
  if (draft) return findPayloadHomeSelections(locale, selection, true)

  const key = JSON.stringify([
    selection.selectedServiceSlugs,
    selection.selectedCourseSlugs,
    selection.selectedCollectionSlugs,
    selection.selectedPortfolioSlugs,
  ])
  return unstable_cache(
    () => findPayloadHomeSelections(locale, selection, false),
    [payloadCacheNamespace, "cms", "home-selections", locale, key],
    {
      revalidate: 60,
      tags: [
        "cms:home",
        "cms:services",
        "cms:courses",
        "cms:fashion-collections",
        "cms:portfolio-cases",
        "cms:offers",
        "cms:media",
      ],
    }
  )()
}

async function findPayloadServiceCards({
  draft,
  ids,
  locale,
  slugs,
}: {
  draft: boolean
  ids?: string[]
  locale: Locale
  slugs?: string[]
}): Promise<ServiceCardData[]> {
  if ((ids && !ids.length) || (slugs && !slugs.length)) return []
  const payload = await getPayloadClient()
  const and = []
  if (ids?.length) and.push({ id: { in: ids } })
  if (slugs?.length) and.push({ slug: { in: slugs } })
  const result = await payload.find({
    collection: "services",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 100,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      gallery: true,
    },
    sort: "sortOrder",
    where: and.length ? { and } : undefined,
  })
  const mediaIDs = [
    ...new Set(
      result.docs.flatMap(
        (service) =>
          service.gallery?.map((media) =>
            typeof media === "string" ? media : media.id
          ) ?? []
      )
    ),
  ]
  const mediaResult = mediaIDs.length
    ? await payload.find({
        collection: "media",
        depth: 0,
        draft,
        fallbackLocale: false,
        limit: mediaIDs.length,
        locale,
        ...(await getPayloadAccess(draft)),
        pagination: false,
        select: publicMediaSelect,
        where: { id: { in: mediaIDs } },
      })
    : { docs: [] }
  const mediaByID = new Map(
    mediaResult.docs.map((media) => [
      media.id,
      payloadMediaToView(media as Media, locale),
    ])
  )

  return result.docs
    .filter((service) => !slugs?.length || slugs.includes(service.slug))
    .map((service) => {
      const firstMedia = service.gallery?.[0]
      const mediaID =
        typeof firstMedia === "string" ? firstMedia : firstMedia?.id
      return {
        id: service.id,
        slug: service.slug,
        routeSegment: service.slug,
        title: service.title,
        summary: service.summary,
        mediaAsset: mediaID ? mediaByID.get(mediaID) : undefined,
      }
    })
}

export async function getPublishedServices(
  locale: Locale,
  filters: { ids?: string[]; slugs?: string[] } = {}
) {
  const key = JSON.stringify(filters)
  return unstable_cache(
    () => findPayloadServiceCards({ draft: false, locale, ...filters }),
    [payloadCacheNamespace, "cms", "services", locale, key],
    { revalidate: 60, tags: ["cms:services", "cms:media"] }
  )()
}

async function findPayloadDirection(
  locale: Locale,
  slug: string,
  draft: boolean
): Promise<DirectionPageData | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "directions",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      canonicalKey: true,
      title: true,
      summary: true,
      eyebrow: true,
      narrative: true,
      processTitle: true,
      formatsTitle: true,
      formatNotes: true,
      outcomesTitle: true,
      ctaTitle: true,
      ctaSummary: true,
      ctaService: true,
      ctaLabel: true,
      diagnosticLabel: true,
      faqTitle: true,
      faq: true,
      countLabel: true,
      availabilityValue: true,
      availabilityLabel: true,
      fittingValue: true,
      fittingLabel: true,
      catalogueTitle: true,
      catalogueSummary: true,
      materialsLabel: true,
      inquiryTitle: true,
      inquirySteps: true,
      heroMedia: true,
      processSteps: true,
      outcomes: true,
      relatedServices: true,
      meta: true,
      supplementaryLayout: true,
    },
    where: { slug: { equals: slug } },
  })
  const direction = result.docs[0]
  if (!direction) return null
  const serviceIDs =
    direction.relatedServices?.map((service) =>
      typeof service === "string" ? service : service.id
    ) ?? []
  const services = await findPayloadServiceCards({
    draft,
    ids: serviceIDs,
    locale,
  })
  let mediaAsset: MediaAsset | undefined
  const heroMediaID =
    typeof direction.heroMedia === "string"
      ? direction.heroMedia
      : direction.heroMedia?.id
  if (heroMediaID) {
    mediaAsset = await findReadableMediaByID(locale, heroMediaID, draft)
  }

  return toDirectionPageData(
    direction as unknown as PayloadDirection,
    services,
    mediaAsset,
    await findSEOImage(direction.meta?.image, locale, draft),
    await findEditorialBlocks(direction.supplementaryLayout, locale, draft)
  )
}

function toDirectionPageData(
  direction: PayloadDirection,
  services: ServiceCardData[],
  mediaAsset?: MediaAsset,
  seoImage?: MediaAsset,
  editorialBlocks?: EditorialBlock[]
): DirectionPageData {
  return {
    id: direction.id,
    slug: direction.slug,
    routeSegment: direction.slug,
    canonicalKey: direction.canonicalKey,
    editorialBlocks,
    title: direction.title,
    summary: direction.summary,
    eyebrow: direction.eyebrow ?? undefined,
    narrative: direction.narrative,
    processTitle: direction.processTitle,
    formatsTitle: direction.formatsTitle,
    formatNotes: direction.formatNotes?.map((item) => item.text) ?? [],
    outcomesTitle: direction.outcomesTitle,
    ctaTitle: direction.ctaTitle,
    ctaSummary: direction.ctaSummary,
    ctaService: direction.ctaService,
    ctaLabel: direction.ctaLabel,
    diagnosticLabel: direction.diagnosticLabel ?? undefined,
    faqTitle: direction.faqTitle ?? undefined,
    faq: direction.faq ?? [],
    countLabel: direction.countLabel ?? undefined,
    availabilityValue: direction.availabilityValue ?? undefined,
    availabilityLabel: direction.availabilityLabel ?? undefined,
    fittingValue: direction.fittingValue ?? undefined,
    fittingLabel: direction.fittingLabel ?? undefined,
    catalogueTitle: direction.catalogueTitle ?? undefined,
    catalogueSummary: direction.catalogueSummary ?? undefined,
    materialsLabel: direction.materialsLabel ?? undefined,
    inquiryTitle: direction.inquiryTitle ?? undefined,
    inquirySteps: direction.inquirySteps ?? [],
    process:
      direction.processSteps?.map((step) => ({
        title: step.title,
        description: step.description,
      })) ?? [],
    outcomes: direction.outcomes?.map((item) => item.text) ?? [],
    services,
    mediaAsset,
    seo: {
      title:
        direction.meta?.title || `${direction.title} | PURITY Fashion Studio`,
      description: direction.meta?.description || direction.summary,
      image: seoImage,
    },
  }
}

export async function getDirectionBySlug(locale: Locale, slug: string) {
  const { isEnabled } = await draftMode()
  if (isEnabled) return findPayloadDirection(locale, slug, true)
  return unstable_cache(
    () => findPayloadDirection(locale, slug, false),
    [payloadCacheNamespace, "cms", "direction", locale, slug],
    {
      revalidate: 60,
      tags: [
        "cms:directions",
        "cms:services",
        "cms:media",
        "cms:editorial",
        `cms:directions:${slug}`,
      ],
    }
  )()
}

export async function getPublishedDirectionSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "directions",
    depth: 0,
    fallbackLocale: false,
    limit: 1000,
    locale: "uk",
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
    sort: "sortOrder",
  })
  return result.docs.map((direction) => direction.slug)
}

async function findPublishedPayloadDirections(
  locale: Locale,
  draft: boolean
): Promise<DirectionPageData[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "directions",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1000,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      canonicalKey: true,
      title: true,
      summary: true,
      eyebrow: true,
      narrative: true,
      processTitle: true,
      formatsTitle: true,
      formatNotes: true,
      outcomesTitle: true,
      ctaTitle: true,
      ctaSummary: true,
      ctaService: true,
      ctaLabel: true,
      diagnosticLabel: true,
      faqTitle: true,
      faq: true,
      countLabel: true,
      availabilityValue: true,
      availabilityLabel: true,
      fittingValue: true,
      fittingLabel: true,
      catalogueTitle: true,
      catalogueSummary: true,
      materialsLabel: true,
      inquiryTitle: true,
      inquirySteps: true,
      heroMedia: true,
      processSteps: true,
      outcomes: true,
      relatedServices: true,
      meta: true,
    },
    sort: "sortOrder",
  })
  const serviceIDs = [
    ...new Set(
      result.docs.flatMap((direction) =>
        relationshipIDs(direction.relatedServices)
      )
    ),
  ]
  const heroMediaIDs = [
    ...new Set(
      result.docs.flatMap((direction) => {
        const id = relationshipID(direction.heroMedia)
        return id ? [id] : []
      })
    ),
  ]
  const [services, mediaByID] = await Promise.all([
    findPayloadServiceCards({ draft, ids: serviceIDs, locale }),
    findReadableMediaMap(locale, heroMediaIDs, draft),
  ])
  const servicesByID = new Map(services.map((service) => [service.id, service]))

  return result.docs.map((direction) => {
    const directionServices = relationshipIDs(
      direction.relatedServices
    ).flatMap((id) => {
      const service = servicesByID.get(id)
      return service ? [service] : []
    })
    const heroMediaID = relationshipID(direction.heroMedia)
    return toDirectionPageData(
      direction as unknown as PayloadDirection,
      directionServices,
      heroMediaID ? mediaByID.get(heroMediaID) : undefined
    )
  })
}

export async function getPublishedDirections(locale: Locale) {
  const draft = await getDraftFlag()
  if (draft) return findPublishedPayloadDirections(locale, true)

  return unstable_cache(
    () => findPublishedPayloadDirections(locale, false),
    [payloadCacheNamespace, "cms", "directions", locale],
    {
      revalidate: 60,
      tags: ["cms:directions", "cms:services", "cms:media"],
    }
  )()
}

async function findPayloadPage(
  locale: Locale,
  slug: string,
  draft: boolean
): Promise<PublicPageData | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "pages",
    depth: 0,
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    ...(await getPayloadAccess(draft)),
    pagination: false,
    select: {
      id: true,
      slug: true,
      pageType: true,
      layout: true,
      title: true,
      summary: true,
      eyebrow: true,
      body: true,
      studioSignals: true,
      methodEyebrow: true,
      methodTitle: true,
      methodSteps: true,
      clientsTitle: true,
      clientsSummary: true,
      privateTitle: true,
      corporateTitle: true,
      directionsTitle: true,
      ctaTitle: true,
      ctaSummary: true,
      formTitle: true,
      formSummary: true,
      heroMediaLabel: true,
      standardsTitle: true,
      standards: true,
      recordTitle: true,
      recordSummary: true,
      recordItems: true,
      currentTitle: true,
      currentItems: true,
      flowTitle: true,
      flowItems: true,
      secondaryCTALabel: true,
      emptyEyebrow: true,
      emptyTitle: true,
      emptySummary: true,
      emptyAction: true,
      sections: true,
      cta: true,
      legalVersion: true,
      contentsTitle: true,
      effectiveDateLabel: true,
      effectiveDate: true,
      meta: true,
    },
    where: { slug: { equals: slug } },
  })
  const page = result.docs[0]
  if (!page) return null
  const mediaIDs =
    page.sections
      ?.map((section) => section.media)
      .filter((id): id is string => typeof id === "string") ?? []
  const media = mediaIDs.length
    ? await payload.find({
        collection: "media",
        depth: 0,
        draft,
        fallbackLocale: false,
        limit: mediaIDs.length,
        locale,
        ...(await getPayloadAccess(draft)),
        pagination: false,
        select: publicMediaSelect,
        where: { id: { in: mediaIDs } },
      })
    : { docs: [] }
  const mediaByID = new Map(
    media.docs.map((item) => [
      item.id,
      payloadMediaToView(item as Media, locale),
    ])
  )
  return {
    id: page.id,
    slug: page.slug,
    routeSegment: page.slug,
    pageType: page.pageType,
    title: page.title,
    summary: page.summary,
    eyebrow: page.eyebrow ?? undefined,
    body: page.body,
    editorialBlocks: await findEditorialBlocks(page.layout, locale, draft),
    studioSignals: page.studioSignals ?? [],
    methodEyebrow: page.methodEyebrow ?? undefined,
    methodTitle: page.methodTitle ?? undefined,
    methodSteps: page.methodSteps ?? [],
    clientsTitle: page.clientsTitle ?? undefined,
    clientsSummary: page.clientsSummary ?? undefined,
    privateTitle: page.privateTitle ?? undefined,
    corporateTitle: page.corporateTitle ?? undefined,
    directionsTitle: page.directionsTitle ?? undefined,
    ctaTitle: page.ctaTitle ?? undefined,
    ctaSummary: page.ctaSummary ?? undefined,
    formTitle: page.formTitle ?? undefined,
    formSummary: page.formSummary ?? undefined,
    heroMediaLabel: page.heroMediaLabel ?? undefined,
    standardsTitle: page.standardsTitle ?? undefined,
    standards: page.standards ?? [],
    recordTitle: page.recordTitle ?? undefined,
    recordSummary: page.recordSummary ?? undefined,
    recordItems: page.recordItems?.map((item) => item.text) ?? [],
    currentTitle: page.currentTitle ?? undefined,
    currentItems: page.currentItems ?? [],
    flowTitle: page.flowTitle ?? undefined,
    flowItems: page.flowItems?.map((item) => item.text) ?? [],
    secondaryCTALabel: page.secondaryCTALabel ?? undefined,
    emptyEyebrow: page.emptyEyebrow ?? undefined,
    emptyTitle: page.emptyTitle ?? undefined,
    emptySummary: page.emptySummary ?? undefined,
    emptyAction: page.emptyAction ?? undefined,
    sections:
      page.sections?.map((section) => ({
        heading: section.heading,
        body: section.body,
        mediaAsset:
          typeof section.media === "string"
            ? mediaByID.get(section.media)
            : undefined,
      })) ?? [],
    mediaAsset: media.docs[0]
      ? payloadMediaToView(media.docs[0] as Media, locale)
      : undefined,
    cta: page.cta,
    legalVersion: page.legalVersion ?? undefined,
    contentsTitle: page.contentsTitle ?? undefined,
    effectiveDateLabel: page.effectiveDateLabel ?? undefined,
    effectiveDate: page.effectiveDate ?? undefined,
    seo: {
      title: page.meta?.title || `${page.title} | PURITY Fashion Studio`,
      description: page.meta?.description || page.summary,
      image: await findSEOImage(page.meta?.image, locale, draft),
    },
  }
}

export async function getPageBySlug(locale: Locale, slug: string) {
  const { isEnabled } = await draftMode()
  if (isEnabled) return findPayloadPage(locale, slug, true)
  return unstable_cache(
    () => findPayloadPage(locale, slug, false),
    [payloadCacheNamespace, "cms", "page", locale, slug],
    {
      revalidate: 60,
      tags: ["cms:editorial", "cms:pages", "cms:media", `cms:pages:${slug}`],
    }
  )()
}

export async function getPublishedPageSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "pages",
    depth: 0,
    fallbackLocale: false,
    limit: 1000,
    locale: "uk",
    overrideAccess: false,
    pagination: false,
    select: { slug: true, pageType: true },
    sort: "sortOrder",
  })
  return result.docs
    .filter((page) => page.pageType !== "service-state")
    .map((page) => page.slug)
}

async function getDraftFlag() {
  return (await draftMode()).isEnabled
}

async function findPayloadHeader(locale: Locale, draft: boolean) {
  const payload = await getPayloadClient()
  const header = await payload.findGlobal({
    slug: "header",
    depth: 0,
    draft,
    fallbackLocale: false,
    locale,
    ...(await getPayloadAccess(draft)),
    select: { navigation: true, bookingLabel: true },
  })
  return {
    navigation:
      header.navigation?.flatMap((item) => {
        const path = item.external ? safeExternalURL(item.path) : item.path
        return path
          ? [
              {
                label: item.label ?? item.path,
                path,
                visible: item.visible,
                external: item.external,
                accessibleLabel: item.accessibleLabel ?? undefined,
              },
            ]
          : []
      }) ?? [],
    bookingLabel: header.bookingLabel,
  } satisfies HeaderData
}

export async function getHeader(locale: Locale): Promise<HeaderData> {
  const draft = await getDraftFlag()
  if (draft) return findPayloadHeader(locale, true)
  return unstable_cache(
    () => findPayloadHeader(locale, false),
    [payloadCacheNamespace, "cms", "header", locale],
    { tags: ["cms:header", "cms:navigation"] }
  )()
}

async function findPayloadFooter(locale: Locale, draft: boolean) {
  const payload = await getPayloadClient()
  const footer = await payload.findGlobal({
    slug: "footer",
    depth: 0,
    draft,
    fallbackLocale: false,
    locale,
    ...(await getPayloadAccess(draft)),
    select: {
      email: true,
      phone: true,
      phones: true,
      address: true,
      hours: true,
      responseTime: true,
      socialLinks: true,
      legalNavigation: true,
      copyright: true,
    },
  })
  return {
    email: footer.email,
    phone: footer.phone,
    phones: footer.phones?.map((item) => item.number) ?? [footer.phone],
    address: footer.address,
    hours: footer.hours,
    responseTime: footer.responseTime,
    socialLinks:
      footer.socialLinks?.flatMap((item) => {
        const url = safeExternalURL(item.url)
        return url
          ? [
              {
                platform: item.platform,
                url,
                accessibleLabel: item.accessibleLabel,
              },
            ]
          : []
      }) ?? [],
    legalNavigation:
      footer.legalNavigation?.map((item) => ({
        label: item.label ?? item.path,
        path: item.path,
      })) ?? [],
    copyright: footer.copyright,
  } satisfies FooterData
}

export async function getFooter(locale: Locale): Promise<FooterData> {
  const draft = await getDraftFlag()
  if (draft) return findPayloadFooter(locale, true)
  return unstable_cache(
    () => findPayloadFooter(locale, false),
    [payloadCacheNamespace, "cms", "footer", locale],
    { tags: ["cms:footer", "cms:navigation"] }
  )()
}

async function findPayloadSiteSettings(locale: Locale) {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
    fallbackLocale: false,
    locale,
    overrideAccess: false,
    select: {
      brandName: true,
      canonicalOrigin: true,
      contacts: true,
      localeLabels: true,
      uiLabels: true,
      contactLabels: true,
      booking: true,
      maintenance: true,
    },
  })
  return {
    brandName: settings.brandName,
    canonicalOrigin: settings.canonicalOrigin,
    contacts: {
      ...settings.contacts,
      viberURL: safeExternalURL(settings.contacts.viberURL),
    },
    localeLabels: settings.localeLabels,
    uiLabels: settings.uiLabels,
    contactLabels: settings.contactLabels,
    booking: settings.booking,
    maintenance: {
      enabled: settings.maintenance.enabled,
      message: settings.maintenance.message ?? undefined,
    },
  } satisfies SiteSettingsData
}

export async function getSiteSettings(
  locale: Locale
): Promise<SiteSettingsData> {
  return unstable_cache(
    () => findPayloadSiteSettings(locale),
    [payloadCacheNamespace, "cms", "site-settings", locale],
    { tags: ["cms:site-settings", "cms:metadata"] }
  )()
}

async function findPayloadHome(locale: Locale, draft: boolean) {
  const payload = await getPayloadClient()
  const home = await payload.findGlobal({
    slug: "home",
    depth: 1,
    draft,
    fallbackLocale: false,
    locale,
    ...(await getPayloadAccess(draft)),
    select: {
      heroEyebrow: true,
      heroTitle: true,
      heroSummary: true,
      heroMedia: true,
      primaryCTA: true,
      secondaryCTA: true,
      method: true,
      studioIntro: true,
      serviceIntro: true,
      priceNote: true,
      methodEyebrow: true,
      methodTitle: true,
      methodDetails: true,
      studioEyebrow: true,
      studioTitle: true,
      serviceRailTitle: true,
      collectionRailTitle: true,
      portfolioNote: true,
      portfolioTitle: true,
      portfolioSummary: true,
      portfolioSignals: true,
      faqTitle: true,
      faq: true,
      sectionMedia: true,
      finalCTATitle: true,
      finalCTASummary: true,
      selectedServices: true,
      selectedCourses: true,
      selectedCollections: true,
      selectedPortfolio: true,
      meta: true,
    },
  })
  let heroMedia: MediaAsset | undefined
  const mediaID =
    typeof home.heroMedia === "string" ? home.heroMedia : home.heroMedia?.id
  if (mediaID) {
    heroMedia = await findReadableMediaByID(locale, mediaID, draft)
  }
  const sectionMediaEntries = Object.entries(home.sectionMedia ?? {}).filter(
    (entry): entry is [string, string | Media] => Boolean(entry[1])
  )
  const sectionMedia = Object.fromEntries(
    sectionMediaEntries.map(([key, value]) => [
      key,
      typeof value === "string"
        ? undefined
        : payloadMediaToView(value as Media, locale),
    ])
  ) as HomeData["sectionMedia"]
  return {
    heroEyebrow: home.heroEyebrow ?? undefined,
    heroTitle: home.heroTitle,
    heroSummary: home.heroSummary,
    heroMedia,
    primaryCTA: home.primaryCTA,
    secondaryCTA: home.secondaryCTA,
    method:
      home.method?.map((item) => ({
        label: item.label,
        description: item.description,
      })) ?? [],
    studioIntro: home.studioIntro,
    serviceIntro: home.serviceIntro,
    priceNote: home.priceNote,
    methodEyebrow: home.methodEyebrow,
    methodTitle: home.methodTitle,
    methodDetails: home.methodDetails?.map((item) => item.text) ?? [],
    studioEyebrow: home.studioEyebrow,
    studioTitle: home.studioTitle,
    serviceRailTitle: home.serviceRailTitle,
    collectionRailTitle: home.collectionRailTitle,
    portfolioNote: home.portfolioNote,
    portfolioTitle: home.portfolioTitle,
    portfolioSummary: home.portfolioSummary,
    portfolioSignals: home.portfolioSignals?.map((item) => item.text) ?? [],
    faqTitle: home.faqTitle,
    faq: home.faq ?? [],
    sectionMedia,
    finalCTATitle: home.finalCTATitle,
    finalCTASummary: home.finalCTASummary,
    selectedServiceSlugs:
      home.selectedServices?.flatMap((item) =>
        typeof item === "string" ? [] : [item.slug]
      ) ?? [],
    selectedCourseSlugs:
      home.selectedCourses?.flatMap((item) =>
        typeof item === "string" ? [] : [item.slug]
      ) ?? [],
    selectedCollectionSlugs:
      home.selectedCollections?.flatMap((item) =>
        typeof item === "string" ? [] : [item.slug]
      ) ?? [],
    selectedPortfolioSlugs:
      home.selectedPortfolio?.flatMap((item) =>
        typeof item === "string" ? [] : [item.slug]
      ) ?? [],
    seo: {
      title: home.meta?.title || home.heroTitle,
      description: home.meta?.description || home.heroSummary,
      image: await findSEOImage(home.meta?.image, locale, draft),
    },
  } satisfies HomeData
}

export async function getHome(locale: Locale): Promise<HomeData> {
  const draft = await getDraftFlag()
  if (draft) return findPayloadHome(locale, true)
  return unstable_cache(
    () => findPayloadHome(locale, false),
    [payloadCacheNamespace, "cms", "home", locale],
    { revalidate: 60, tags: ["cms:home", "cms:media"] }
  )()
}
