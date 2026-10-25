import nextEnv from "@next/env"
import { existsSync } from "node:fs"
import path from "node:path"
import { getPayload, type CollectionSlug, type Where } from "payload"

import { locales, type Locale } from "../../i18n/routing"
import { assertTargetResourceIdentity } from "../../scripts/resource-identity"
import manifest from "./manifests/purity-content-manifest.v1.json"
import {
  definedIDs,
  localizedObject,
  mergeGlobalData,
  serviceFormatLabel,
  serviceFormats,
  type LocaleData,
} from "./import-transforms"

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

// Environment-dependent modules must evaluate after dotenv initialization.
const { getSiteURL } = await import("../../lib/site-url")

const force = process.argv.includes("--force")
const publish = !process.argv.includes("--draft")
const dryRun = process.argv.includes("--dry-run")
const bootstrap = process.argv.includes("--bootstrap")
const restore = process.argv.includes("--restore")
const verifyOnly = process.argv.includes("--verify")
const refreshMedia = process.argv.includes("--refresh-media")
const targetArg = process.argv.find((argument) =>
  argument.startsWith("--target=")
)
const target = targetArg?.split("=")[1]
const productionTarget = target === "production"
const counts = new Map<string, number>()

if (target === "local" || target === "preview" || target === "production") {
  assertTargetResourceIdentity(target)
}

if (verifyOnly && !["local", "preview", "production"].includes(target ?? "")) {
  throw new Error(
    "CMS verification requires --target=local|preview|production so resource identity can be checked."
  )
}

if (
  !dryRun &&
  !verifyOnly &&
  !["local", "preview", "production"].includes(target ?? "")
) {
  throw new Error(
    "CMS import writes require --target=local|preview|production."
  )
}

if (!dryRun && !verifyOnly && bootstrap === restore) {
  throw new Error("Choose exactly one write mode: --bootstrap or --restore.")
}

const expectedConfirmation = restore
  ? `RESTORE_${target?.toUpperCase()}`
  : `BOOTSTRAP_${target?.toUpperCase()}`

if (
  !dryRun &&
  !verifyOnly &&
  !process.argv.includes(`--confirm=${expectedConfirmation}`)
) {
  throw new Error(
    `Confirm the selected environment with --confirm=${expectedConfirmation}.`
  )
}

if (process.env.PAYLOAD_ENABLED !== "true") {
  throw new Error(
    "Set PAYLOAD_ENABLED=true before running the Payload seed importer."
  )
}

if (!verifyOnly && process.env.ALLOW_CMS_SEED !== "true") {
  throw new Error("Set ALLOW_CMS_SEED=true to acknowledge CMS seed writes.")
}

if (restore && (!force || process.env.ALLOW_CMS_RESTORE !== "true")) {
  throw new Error(
    "Restore requires ALLOW_CMS_RESTORE=true and the explicit --force flag."
  )
}

process.env.PAYLOAD_IMPORTING = "true"

const { default: config } = await import("../../payload.config")
const payload = await getPayload({ config })

type ID = string
type CategoryPageSpec =
  (typeof manifest.migrationCopy.categoryPageCopy)[keyof typeof manifest.migrationCopy.categoryPageCopy]

const {
  collections,
  courses,
  "media-assets": mediaAssets,
  "portfolio-cases": portfolioCases,
  pages: publicPages,
  "service-categories": serviceCategories,
  services,
  settings: [siteSettings],
} = manifest.source
const {
  beadedDressCopy,
  bookingCopy,
  bookingErrors,
  bookingLabels,
  capsuleCopy,
  categoryPageCopy,
  collectionsPageCopy,
  contactMethodLabels,
  coursePageCopy,
  currencyLabels,
  formatLabels,
  homePageCopy,
  inquiryTypeLabels,
  navigation,
  newYearPartyCopy,
  paymentStatusCopy,
  pricingLabels,
  portfolioPageCopy,
  providerLabels,
  serviceDetailCopy,
  studioPageCopy,
} = manifest.migrationCopy

if (!siteSettings) {
  throw new Error("Content manifest is missing site settings.")
}

const publicUiLabels = {
  menu: { uk: "Меню", ru: "Меню", en: "Menu" },
  footerDirections: { uk: "Напрями", ru: "Направления", en: "Directions" },
  footerContacts: { uk: "Контакти", ru: "Контакты", en: "Contacts" },
} as const

const contactLabels = {
  phone: { uk: "Телефон", ru: "Телефон", en: "Phone" },
  email: { uk: "Email", ru: "Email", en: "Email" },
  viber: { uk: "Viber", ru: "Viber", en: "Viber" },
  socials: {
    uk: "Соціальні канали",
    ru: "Социальные каналы",
    en: "Social channels",
  },
  direct: {
    uk: "Зв’язатися напряму",
    ru: "Связаться напрямую",
    en: "Contact directly",
  },
  address: {
    uk: "Адреса студії",
    ru: "Адрес студии",
    en: "Studio address",
  },
  hours: { uk: "Години роботи", ru: "Часы работы", en: "Opening hours" },
  request: {
    uk: "Надіслати запит",
    ru: "Отправить запрос",
    en: "Send an inquiry",
  },
  requestSummary: {
    uk: "Оберіть напрям і зручний спосіб зв’язку. Форма одразу покаже відповідний платіжний маршрут.",
    ru: "Выберите направление и удобный способ связи. Форма сразу покажет подходящий платежный маршрут.",
    en: "Choose a direction and preferred contact method. The form immediately shows the matching payment route.",
  },
} as const

const legalPageLabels = {
  contentsTitle: { uk: "Зміст", ru: "Содержание", en: "Contents" },
  effectiveDate: {
    uk: "Чинна редакція",
    ru: "Действующая редакция",
    en: "Effective date",
  },
} as const

function isCategoryPageKey(
  value: string
): value is keyof typeof categoryPageCopy {
  return value in categoryPageCopy
}

function increment(label: string) {
  counts.set(label, (counts.get(label) ?? 0) + 1)
}

function postgresErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined

  const candidate = error as { cause?: unknown; code?: unknown }
  if (typeof candidate.code === "string") return candidate.code

  return postgresErrorCode(candidate.cause)
}

async function retryDatabaseStage<T>(
  label: string,
  operation: () => Promise<T>
) {
  const attempts = 5

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      const code = postgresErrorCode(error)
      const retryable = code === "40P01" || code === "40001"

      if (!retryable || attempt === attempts - 1) throw error

      const delay = 500 * 2 ** attempt
      console.warn(
        `Retrying ${label} after PostgreSQL ${code} (${attempt + 1}/${attempts - 1}) in ${delay}ms.`
      )
      await new Promise<void>((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error(`Retry attempts exhausted for ${label}.`)
}

async function upsertLocalized({
  collection,
  key,
  value,
  common,
  localizedData,
  drafts = true,
  filePath,
}: {
  collection: CollectionSlug
  key: string
  value: string
  common: Record<string, unknown>
  localizedData: LocaleData
  drafts?: boolean
  filePath?: string
}): Promise<ID> {
  const where: Where = { [key]: { equals: value } }
  const existing = await payload.find({
    collection,
    depth: 0,
    fallbackLocale: false,
    limit: 1,
    locale: "uk",
    overrideAccess: true,
    where,
  })

  if (existing.docs[0] && productionTarget && !force) {
    increment(`${collection}:skipped`)
    return existing.docs[0].id
  }

  let id = existing.docs[0]?.id
  // Payload's Local API does not infer a transition from an existing draft to
  // published simply from `draft: false`. Persist the version status with the
  // import data so a deterministic published import is also publicly readable.
  const publicationStatus = drafts && publish ? { _status: "published" } : {}
  const initialData = { ...common, ...localizedData.uk, ...publicationStatus }

  if (id) {
    await payload.update({
      collection,
      data: initialData,
      draft: drafts ? !publish : undefined,
      // A storage reset can leave document metadata intact while removing its
      // Blob object. Re-submit upload files only when explicitly requested;
      // ordinary idempotent imports must not duplicate Blob writes.
      filePath: refreshMedia ? filePath : undefined,
      id,
      locale: "uk",
      overrideAccess: true,
      publishAllLocales: publish,
    } as never)
    increment(`${collection}:updated`)
  } else {
    const created = await payload.create({
      collection,
      data: initialData,
      draft: drafts ? !publish : undefined,
      filePath,
      locale: "uk",
      overrideAccess: true,
      publishAllLocales: publish,
    } as never)
    id = created.id
    increment(`${collection}:created`)
  }

  for (const locale of locales.filter((candidate) => candidate !== "uk")) {
    await payload.update({
      collection,
      data: localizedData[locale],
      draft: drafts ? !publish : undefined,
      id,
      locale,
      overrideAccess: true,
      publishAllLocales: publish,
    } as never)
  }

  return id
}

async function shouldPreserveGlobal(
  slug: "home" | "header" | "footer" | "site-settings" | "booking-settings"
) {
  if (!productionTarget || force) return false
  const existing = await payload.findGlobal({
    slug,
    depth: 0,
    draft: true,
    locale: "all",
    overrideAccess: true,
  })
  // Empty globals may contain schema defaults but have no persisted timestamp.
  if (!existing.updatedAt) return false
  increment(`${slug}:skipped`)
  return true
}

async function updateGlobalLocalized(
  slug: "home" | "header" | "footer" | "site-settings",
  common: Record<string, unknown>,
  localizedData: LocaleData,
  drafts: boolean
) {
  if (await shouldPreserveGlobal(slug)) return

  const publicationStatus = drafts && publish ? { _status: "published" } : {}

  for (const locale of locales) {
    await payload.updateGlobal({
      slug,
      data: {
        ...mergeGlobalData(common, localizedData[locale]),
        ...publicationStatus,
      },
      draft: drafts ? !publish : undefined,
      locale,
      overrideAccess: true,
      publishAllLocales: publish,
      // Global drafts use one publication status. Publish the imported locale
      // without replacing localized fields inside navigation array rows.
      publishSpecificLocale: locale,
    } as never)
  }
  increment(`${slug}:updated`)
}

function mediaPath(asset: (typeof mediaAssets)[number]): string {
  const candidates = [
    asset.src
      ? path.resolve(process.cwd(), "public", asset.src.replace(/^\//, ""))
      : "",
    asset.sourceFile ? path.resolve(process.cwd(), asset.sourceFile) : "",
  ].filter(Boolean)
  const filePath = candidates.find((candidate) => existsSync(candidate))

  if (!filePath) {
    throw new Error(
      `Missing media file for ${asset.id}: ${candidates.join(", ")}`
    )
  }

  return filePath
}

async function importMedia(): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()

  for (const asset of mediaAssets) {
    const generated = asset.source === "generated"
    const approvedForPublicUse = generated || asset.kind === "logo"
    const replacementPriority =
      asset.replacementPriority === "replace-before-launch"
        ? "replace-before-launch"
        : asset.replacementPriority === "replace-when-client-proof-arrives"
          ? "replace-when-approved"
          : "none"
    const localizedData = localizedObject((locale) => ({
      alt: asset.alt[locale],
    }))
    const id = await upsertLocalized({
      collection: "media",
      key: "internalLabel",
      value: asset.id,
      drafts: false,
      filePath: mediaPath(asset),
      common: {
        internalLabel: asset.id,
        source: asset.source,
        usageRightsStatus: approvedForPublicUse ? "approved" : "pending",
        modelReleaseStatus: "not-applicable",
        publicVisibility: approvedForPublicUse,
        isRealClientProof: false,
        replacementPriority,
        allowedUsageContexts: asset.usage
          .map((usage) => usage.split(" ")[0])
          .filter((usage) =>
            [
              "home",
              "service",
              "course",
              "collection",
              "portfolio",
              "studio",
            ].includes(usage)
          ),
        sourceMetadata: JSON.stringify(asset.sourceMetadata ?? {}),
      },
      localizedData,
    })
    ids.set(asset.id, id)
  }

  return ids
}

async function importDirections(): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()
  const canonical = new Set([
    "research",
    "realisation",
    "transformation",
    "corporate",
    "school",
    "collections",
  ])

  for (const direction of serviceCategories.filter((item) =>
    canonical.has(item.slug)
  )) {
    const spec: CategoryPageSpec | undefined = isCategoryPageKey(direction.slug)
      ? categoryPageCopy[direction.slug]
      : undefined
    const localizedData = localizedObject((locale) => ({
      title: direction.title[locale],
      summary: direction.summary[locale],
      eyebrow: direction.title[locale],
      narrative: spec?.heroNote[locale] ?? direction.summary[locale],
      processTitle: spec?.processTitle[locale] ?? direction.title[locale],
      formatsTitle: spec?.formatsTitle[locale] ?? direction.title[locale],
      formatNotes:
        spec?.formats.map((format) => ({ text: format[locale] })) ?? [],
      outcomesTitle: spec?.outcomesTitle[locale] ?? direction.title[locale],
      ctaTitle:
        direction.slug === "collections"
          ? collectionsPageCopy.ctaTitle[locale]
          : (spec?.ctaTitle[locale] ?? direction.title[locale]),
      ctaSummary:
        direction.slug === "collections"
          ? collectionsPageCopy.ctaSummary[locale]
          : (spec?.ctaSummary[locale] ?? direction.summary[locale]),
      ctaLabel:
        direction.slug === "collections"
          ? collectionsPageCopy.ctaLabel[locale]
          : siteSettings.home.primaryCta.label[locale],
      diagnosticLabel:
        spec && "diagnosticLabel" in spec
          ? (
              spec.diagnosticLabel as
                Partial<Record<Locale, string>> | undefined
            )?.[locale]
          : undefined,
      faqTitle: spec?.faqTitle?.[locale],
      faq:
        spec?.faq?.map((item) => ({
          question: item.question[locale],
          answer: item.answer[locale],
        })) ?? [],
      countLabel:
        direction.slug === "collections"
          ? collectionsPageCopy.countLabel[locale]
          : undefined,
      availabilityValue:
        direction.slug === "collections"
          ? collectionsPageCopy.availabilityValue[locale]
          : undefined,
      availabilityLabel:
        direction.slug === "collections"
          ? collectionsPageCopy.availabilityLabel[locale]
          : undefined,
      fittingValue:
        direction.slug === "collections"
          ? collectionsPageCopy.fittingValue[locale]
          : undefined,
      fittingLabel:
        direction.slug === "collections"
          ? collectionsPageCopy.fittingLabel[locale]
          : undefined,
      catalogueTitle:
        direction.slug === "collections"
          ? collectionsPageCopy.catalogueTitle[locale]
          : undefined,
      catalogueSummary:
        direction.slug === "collections"
          ? collectionsPageCopy.catalogueSummary[locale]
          : undefined,
      materialsLabel:
        direction.slug === "collections"
          ? collectionsPageCopy.materialsLabel[locale]
          : undefined,
      inquiryTitle:
        direction.slug === "collections"
          ? collectionsPageCopy.inquiryTitle[locale]
          : undefined,
      inquirySteps:
        direction.slug === "collections"
          ? collectionsPageCopy.inquirySteps.map((item) => ({
              title: item.title[locale],
              text: item.text[locale],
            }))
          : [],
      processSteps:
        spec?.processSteps.map((step) => ({
          title: step.title[locale],
          description: step.text[locale],
        })) ?? [],
      outcomes:
        spec?.outcomes.map((outcome) => ({ text: outcome[locale] })) ?? [],
      meta: {
        title: `${direction.title[locale]} | PURITY`,
        description: direction.summary[locale],
      },
    }))
    const id = await upsertLocalized({
      collection: "directions",
      key: "legacyKey",
      value: `direction:${direction.slug}`,
      common: {
        legacyKey: `direction:${direction.slug}`,
        slug: direction.routeSegment,
        canonicalKey: direction.slug,
        ctaService: spec?.ctaService ?? "capsule-collection",
        enabled: true,
        featured: true,
        sortOrder: serviceCategories.indexOf(direction) * 10,
        navigationVisible: true,
      },
      localizedData,
    })
    ids.set(direction.slug, id)
  }

  return ids
}

async function importServices(
  directionIDs: Map<string, ID>,
  mediaIDs: Map<string, ID>
): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()

  for (const service of services) {
    const directionKey =
      service.category === "atelier" ? "realisation" : service.category
    const directionID = directionIDs.get(directionKey)
    if (!directionID)
      throw new Error(`Missing direction ${directionKey} for ${service.slug}`)

    const spec =
      serviceDetailCopy[service.slug as keyof typeof serviceDetailCopy]
    const localizedData = localizedObject((locale) => ({
      title: service.title[locale],
      summary: service.summary[locale],
      audience: service.summary[locale],
      intro: spec?.intro[locale] ?? service.summary[locale],
      formatPresentation: serviceFormats(service.slug).map((format) => ({
        title: serviceFormatLabel(format, locale),
        text: service.summary[locale],
      })),
      formatsTitle:
        locale === "uk"
          ? "Формати роботи"
          : locale === "ru"
            ? "Форматы работы"
            : "Working formats",
      processTitle:
        locale === "uk"
          ? "Як проходить робота"
          : locale === "ru"
            ? "Как проходит работа"
            : "How the work proceeds",
      outcomeTitle: locale === "en" ? "Outcome" : "Результат",
      commercialTitle:
        locale === "uk"
          ? "Формат і вартість"
          : locale === "ru"
            ? "Формат и стоимость"
            : "Format and pricing",
      commercialStatusCopy:
        locale === "uk"
          ? "Актуальна доступність визначається повʼязаними пропозиціями."
          : locale === "ru"
            ? "Актуальная доступность определяется связанными предложениями."
            : "Current availability is defined by the linked offers.",
      priceNote:
        locale === "uk"
          ? "Вартість і режим оплати вказані у повʼязаних пропозиціях."
          : locale === "ru"
            ? "Стоимость и режим оплаты указаны в связанных предложениях."
            : "Pricing and checkout mode are defined by the linked offers.",
      nextStepTitle:
        locale === "uk"
          ? "Наступний крок"
          : locale === "ru"
            ? "Следующий шаг"
            : "Next step",
      nextStepSummary:
        locale === "uk"
          ? "Опишіть задачу, бажаний формат і строки. Команда підтвердить обсяг, актуальні умови та доступність."
          : locale === "ru"
            ? "Опишите задачу, желаемый формат и сроки. Команда подтвердит объём, актуальные условия и доступность."
            : "Describe the brief, preferred format, and timing. The team will confirm scope, current terms, and availability.",
      processSteps:
        spec?.process.map((step) => ({
          title: step.title[locale],
          description: step.text[locale],
        })) ?? [],
      benefits:
        spec?.formats.map((item) => ({
          title: item.title[locale],
          description: item.text[locale],
        })) ?? [],
      outcomes: service.outcomes[locale].map((text) => ({ text })),
      timingNote: service.commercialStatus[locale],
      qualification: service.priceNote[locale],
      faq: [],
      cta: {
        label:
          locale === "uk"
            ? "Надіслати запит"
            : locale === "ru"
              ? "Отправить запрос"
              : "Send inquiry",
        action: "inquiry",
      },
      meta: service.seo[locale],
    }))
    const id = await upsertLocalized({
      collection: "services",
      key: "legacyKey",
      value: `service:${service.slug}`,
      common: {
        legacyKey: `service:${service.slug}`,
        slug: service.routeSegment,
        primaryDirection: directionID,
        formats: serviceFormats(service.slug),
        gallery: definedIDs(
          service.mediaIds.map((mediaID) => mediaIDs.get(mediaID))
        ),
        enabled: service.visibleInMvp,
        featured: service.visibleInMvp,
        sortOrder: services.indexOf(service) * 10,
      },
      localizedData,
    })
    ids.set(service.slug, id)
  }

  return ids
}

async function importServiceOffers(
  serviceIDs: Map<string, ID>
): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()

  for (const service of services) {
    const serviceID = serviceIDs.get(service.slug)
    if (!serviceID) continue
    const localizedData = localizedObject((locale) => ({
      title: service.title[locale],
      shortDescription: service.priceNote[locale],
    }))
    const id = await upsertLocalized({
      collection: "offers",
      key: "legacyKey",
      value: `offer:${service.slug}:inquiry`,
      common: {
        legacyKey: `offer:${service.slug}:inquiry`,
        service: serviceID,
        sku: `PURITY-${service.slug.toUpperCase()}-INQUIRY`,
        format: serviceFormats(service.slug)[0],
        pricingMode: "custom",
        checkoutMode: "inquiry",
        commercialStatus: "active",
        prices: [{ currency: "EUR" }, { currency: "UAH" }],
        termsVersion: "seed-v1",
        enabled: service.visibleInMvp,
        sortOrder: 100,
      },
      localizedData,
    })
    ids.set(service.slug, id)
    await payload.update({
      collection: "services",
      id: serviceID,
      data: { relatedOffers: [id] },
      locale: "uk",
      overrideAccess: true,
    })
  }

  return ids
}

async function importCourses(
  directionIDs: Map<string, ID>,
  mediaIDs: Map<string, ID>
): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()
  const schoolID = directionIDs.get("school")
  if (!schoolID) throw new Error("Missing School direction")

  for (const course of courses) {
    const localizedData = localizedObject((locale) => ({
      title: course.title[locale],
      summary: course.summary[locale],
      description: course.summary[locale],
      eyebrow: coursePageCopy.eyebrow[locale],
      serviceLabel: coursePageCopy.serviceLabel[locale],
      audienceTitle: coursePageCopy.audienceTitle[locale],
      formatTitle: coursePageCopy.formatTitle[locale],
      methodTitle: coursePageCopy.methodTitle[locale],
      prerequisitesTitle: coursePageCopy.prerequisitesTitle[locale],
      curriculumTitle: coursePageCopy.curriculumTitle[locale],
      curriculumSummary: coursePageCopy.curriculumSummary[locale],
      outcomesTitle: coursePageCopy.outcomesTitle[locale],
      outcomesSummary: coursePageCopy.outcomesSummary[locale],
      commercialTitle: coursePageCopy.commercialTitle[locale],
      ctaTitle: coursePageCopy.ctaTitle[locale],
      ctaSummary: coursePageCopy.ctaSummary[locale],
      audience: course.audience[locale],
      prerequisites: coursePageCopy.prerequisites[locale],
      program: course.lessons[locale].map((lesson, index) => ({
        title: lesson,
        description:
          coursePageCopy.lessonDescriptions[locale][index] ??
          course.summary[locale],
      })),
      intakeNote: course.commercialStatus[locale],
      faq: [],
      cta: {
        label:
          locale === "uk"
            ? "Дізнатися про набір"
            : locale === "ru"
              ? "Узнать о наборе"
              : "Ask about intake",
        action: "inquiry",
      },
      meta: course.seo[locale],
    }))
    const id = await upsertLocalized({
      collection: "courses",
      key: "legacyKey",
      value: `course:${course.slug}`,
      common: {
        legacyKey: `course:${course.slug}`,
        slug: course.routeSegment,
        direction: schoolID,
        sessions: Math.max(course.lessons.uk.length, 1),
        formats: ["online", "studio"],
        media: definedIDs(
          course.mediaIds.map((mediaID) => mediaIDs.get(mediaID))
        ),
        availability: "coming-soon",
        enabled: course.visibleInMvp,
        featured: course.visibleInMvp,
        sortOrder: courses.indexOf(course) * 10,
      },
      localizedData,
    })
    ids.set(course.slug, id)

    const offerID = await upsertLocalized({
      collection: "offers",
      key: "legacyKey",
      value: `offer:${course.slug}:inquiry`,
      common: {
        legacyKey: `offer:${course.slug}:inquiry`,
        course: id,
        sku: `PURITY-${course.slug.toUpperCase()}-INQUIRY`,
        format: "online",
        pricingMode: "custom",
        checkoutMode: "inquiry",
        commercialStatus: "coming-soon",
        prices: [{ currency: "EUR" }, { currency: "UAH" }],
        sessions: Math.max(course.lessons.uk.length, 1),
        termsVersion: "seed-v1",
        enabled: course.visibleInMvp,
        sortOrder: 100,
      },
      localizedData: localizedObject((locale) => ({
        title: course.title[locale],
        shortDescription: course.priceNote[locale],
      })),
    })
    await payload.update({
      collection: "courses",
      id,
      data: { relatedOffers: [offerID] },
      locale: "uk",
      overrideAccess: true,
    })
  }

  return ids
}

async function importFashionCollections(
  mediaIDs: Map<string, ID>
): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()

  for (const item of collections) {
    const copy =
      item.slug === "purity-capsule"
        ? capsuleCopy
        : item.slug === "new-year-party-collection"
          ? newYearPartyCopy
          : beadedDressCopy
    const localizedData = localizedObject((locale) => ({
      title: item.title[locale],
      eyebrow: copy.eyebrow[locale],
      summary: item.summary[locale],
      narrative: copy.narrative[locale],
      stylingNotes: copy.narrative[locale],
      stylingTitle: copy.stylingTitle[locale],
      styling: copy.styling.map((entry) => ({
        title: entry.title[locale],
        text: entry.text[locale],
      })),
      factsTitle: copy.factsTitle[locale],
      facts: copy.facts.map((entry) => ({
        title: entry.title[locale],
        text: entry.text[locale],
      })),
      inquiryTitle: copy.inquiryTitle[locale],
      inquirySteps: copy.inquiry.map((entry) => ({
        title: entry.title[locale],
        text: entry.text[locale],
      })),
      materialsTitle: copy.materialsTitle[locale],
      availabilityTitle: copy.availabilityTitle[locale],
      ctaTitle: copy.ctaTitle[locale],
      ctaSummary: copy.ctaSummary[locale],
      serviceLabel: copy.serviceLabel[locale],
      collaborationCredits: item.sourceLabel ?? "PURITY",
      materials: item.materials[locale].map((material) => ({ material })),
      availability: "inquiry",
      rightsAndCredits: item.sourceLabel ?? "PURITY source archive",
      cta: {
        label:
          locale === "uk"
            ? "Запитати про колекцію"
            : locale === "ru"
              ? "Спросить о коллекции"
              : "Ask about the collection",
        action: "inquiry",
      },
      meta: item.seo[locale],
    }))
    const id = await upsertLocalized({
      collection: "fashion-collections",
      key: "legacyKey",
      value: `collection:${item.slug}`,
      common: {
        legacyKey: `collection:${item.slug}`,
        slug: item.routeSegment,
        collectionType: "capsule",
        gallery: definedIDs(
          item.mediaIds.map((mediaID) => mediaIDs.get(mediaID))
        ),
        enabled: item.visibleInMvp,
        featured: item.visibleInMvp,
        sortOrder: collections.indexOf(item) * 10,
      },
      localizedData,
    })
    ids.set(item.slug, id)

    const offerID = await upsertLocalized({
      collection: "offers",
      key: "legacyKey",
      value: `offer:${item.slug}:inquiry`,
      common: {
        legacyKey: `offer:${item.slug}:inquiry`,
        fashionCollection: id,
        sku: `PURITY-${item.slug.toUpperCase()}-INQUIRY`,
        format: "studio",
        pricingMode: "custom",
        checkoutMode: "inquiry",
        commercialStatus: "active",
        prices: [{ currency: "EUR" }, { currency: "UAH" }],
        termsVersion: "seed-v1",
        enabled: item.visibleInMvp,
        sortOrder: 100,
      },
      localizedData: localizedObject((locale) => ({
        title: item.title[locale],
        shortDescription: item.priceNote[locale],
      })),
    })
    await payload.update({
      collection: "fashion-collections",
      id,
      data: { relatedOffers: [offerID] },
      locale: "uk",
      overrideAccess: true,
    })
  }

  return ids
}

async function importPortfolioCases(
  mediaIDs: Map<string, ID>
): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()

  for (const item of portfolioCases) {
    const id = await upsertLocalized({
      collection: "portfolio-cases",
      key: "legacyKey",
      value: `portfolio:${item.slug}`,
      common: {
        legacyKey: `portfolio:${item.slug}`,
        slug: item.routeSegment,
        clientType: "editorial",
        services: [],
        media: definedIDs(
          item.mediaIds.map((mediaID) => mediaIDs.get(mediaID))
        ),
        hasBeforeAfter: false,
        consentReference: "migration-placeholder-no-client-proof",
        isRealClientProof: false,
        usageRightsStatus: "pending",
        approvalStatus: "pending",
        enabled: false,
        featured: false,
        sortOrder: portfolioCases.indexOf(item) * 10,
      },
      localizedData: localizedObject((locale) => ({
        title: item.title[locale],
        summary: item.summary[locale],
        brief: item.summary[locale],
        constraints: item.summary[locale],
        research: item.summary[locale],
        process: item.summary[locale],
        result: item.summary[locale],
        meta: item.seo[locale],
      })),
    })
    ids.set(item.slug, id)
  }

  return ids
}

async function importBookingSettings() {
  if (await shouldPreserveGlobal("booking-settings")) return
  await payload.updateGlobal({
    slug: "booking-settings",
    data: {
      timezone: "Europe/Kyiv",
      enabledModes: ["inquiry", "booking-request"],
      holdMinutes: 15,
      providerRouting: [
        { currency: "EUR", provider: "stripe", enabled: false },
        { currency: "UAH", provider: "liqpay", enabled: false },
      ],
      notificationRecipients: [],
    },
    overrideAccess: true,
  })
  increment("booking-settings:updated")
}

async function importPages(
  mediaIDs: Map<string, ID>
): Promise<Map<string, ID>> {
  const ids = new Map<string, ID>()
  const pageTypes = {
    studio: "studio",
    booking: "service-state",
    privacy: "privacy",
    terms: "terms",
  } as const

  for (const page of publicPages.filter(
    (
      candidate
    ): candidate is (typeof publicPages)[number] & {
      slug: keyof typeof pageTypes
    } => candidate.slug in pageTypes
  )) {
    const localizedData = localizedObject((locale) => ({
      title: page.title[locale],
      summary: page.summary[locale],
      eyebrow: page.eyebrow[locale],
      body: page.body[locale].join("\n\n"),
      sections: page.body[locale].map((body, index) => ({
        heading:
          index === 0
            ? page.title[locale]
            : `${page.title[locale]} ${index + 1}`,
        body,
        media:
          index === 0 && page.mediaIds?.[0]
            ? mediaIDs.get(page.mediaIds[0])
            : undefined,
      })),
      layout: page.body[locale].map((body, index) => ({
        blockType: "richText",
        heading:
          index === 0
            ? page.title[locale]
            : `${page.title[locale]} ${index + 1}`,
        body,
      })),
      ...(page.slug === "studio"
        ? {
            studioSignals: [
              studioPageCopy.signals.team,
              studioPageCopy.signals.space,
              studioPageCopy.signals.hours,
            ].map((signal) => ({
              label: signal.label[locale],
              value: signal.value,
            })),
            methodEyebrow: studioPageCopy.methodEyebrow[locale],
            methodTitle: studioPageCopy.methodTitle[locale],
            methodSteps: studioPageCopy.methodSteps.map((step) => ({
              title: step.title[locale],
              text: step.text[locale],
            })),
            clientsTitle: studioPageCopy.clientsTitle[locale],
            clientsSummary: studioPageCopy.clientsSummary[locale],
            privateTitle: studioPageCopy.privateTitle[locale],
            corporateTitle: studioPageCopy.corporateTitle[locale],
            directionsTitle: studioPageCopy.directionsTitle[locale],
            ctaTitle: studioPageCopy.ctaTitle[locale],
            ctaSummary: studioPageCopy.ctaSummary[locale],
          }
        : {}),
      ...(page.slug === "booking"
        ? {
            formTitle:
              locale === "uk"
                ? "Деталі заявки"
                : locale === "ru"
                  ? "Детали заявки"
                  : "Inquiry details",
            formSummary:
              locale === "uk"
                ? "Контакти, формат роботи й оплата — в одній послідовній формі."
                : locale === "ru"
                  ? "Контакты, формат работы и оплата — в одной последовательной форме."
                  : "Contacts, working format, and payment in one clear form.",
          }
        : {}),
      ...(page.slug === "privacy" || page.slug === "terms"
        ? {
            contentsTitle: legalPageLabels.contentsTitle[locale],
            effectiveDateLabel: legalPageLabels.effectiveDate[locale],
          }
        : {}),
      cta: page.cta
        ? { label: page.cta.label[locale], action: "contact" }
        : undefined,
      meta: page.seo[locale],
    }))
    const id = await upsertLocalized({
      collection: "pages",
      key: "legacyKey",
      value: `page:${page.slug}`,
      common: {
        legacyKey: `page:${page.slug}`,
        slug: page.routeSegment,
        pageType: pageTypes[page.slug],
        legalVersion:
          page.slug === "privacy" || page.slug === "terms"
            ? "seed-v1"
            : undefined,
        effectiveDate:
          page.slug === "privacy" || page.slug === "terms"
            ? "2026-07-10T00:00:00.000Z"
            : undefined,
        enabled: true,
        featured: page.slug === "studio",
        sortOrder: publicPages.indexOf(page) * 10,
      },
      localizedData,
    })
    ids.set(page.slug, id)
  }

  const contacts = serviceCategories.find(
    (category) => category.slug === "contacts"
  )
  if (contacts) {
    const id = await upsertLocalized({
      collection: "pages",
      key: "legacyKey",
      value: "page:contacts",
      common: {
        legacyKey: "page:contacts",
        slug: "contacts",
        pageType: "contacts",
        contactConfiguration: { showMap: false, corporateContext: true },
        enabled: true,
        featured: false,
        sortOrder: 90,
      },
      localizedData: localizedObject((locale) => ({
        title: contacts.title[locale],
        summary: contacts.summary[locale],
        eyebrow: "PURITY",
        body: `${siteSettings.contacts.address[locale]}\n\n${siteSettings.contacts.hours[locale]}\n\n${siteSettings.contacts.responseTime[locale]}`,
        sections: [
          {
            heading: contacts.title[locale],
            body: contacts.summary[locale],
            media: mediaIDs.get("editorial-contacts-studio"),
          },
        ],
        layout: [
          {
            blockType: "mediaText",
            heading: contacts.title[locale],
            body: contacts.summary[locale],
            media: mediaIDs.get("editorial-contacts-studio"),
            mediaPosition: "start",
          },
        ],
        cta: {
          label: siteSettings.contacts.actionLabel[locale],
          action: "booking-request",
        },
        meta: {
          title: `${contacts.title[locale]} | PURITY`,
          description: contacts.summary[locale],
        },
      })),
    })
    ids.set("contacts", id)
  }

  const portfolioID = await upsertLocalized({
    collection: "pages",
    key: "legacyKey",
    value: "page:portfolio",
    common: {
      legacyKey: "page:portfolio",
      slug: "portfolio",
      pageType: "portfolio",
      enabled: true,
      featured: false,
      sortOrder: 80,
    },
    localizedData: localizedObject((locale) => ({
      title: portfolioPageCopy.title[locale],
      summary: portfolioPageCopy.summary[locale],
      eyebrow: portfolioPageCopy.eyebrow[locale],
      body: portfolioPageCopy.summary[locale],
      heroMediaLabel: portfolioPageCopy.heroImageLabel[locale],
      standardsTitle: portfolioPageCopy.standardsTitle[locale],
      standards: portfolioPageCopy.standards.map((item) => ({
        title: item.title[locale],
        text: item.text[locale],
      })),
      recordTitle: portfolioPageCopy.recordTitle[locale],
      recordSummary: portfolioPageCopy.recordSummary[locale],
      recordItems: portfolioPageCopy.recordItems[locale].map((text) => ({
        text,
      })),
      currentTitle: portfolioPageCopy.currentTitle[locale],
      currentItems: portfolioPageCopy.current.map((item) => ({
        title: item.title[locale],
        text: item.text[locale],
      })),
      flowTitle: portfolioPageCopy.flowTitle[locale],
      flowItems: portfolioPageCopy.flow[locale].map((text) => ({ text })),
      ctaTitle: portfolioPageCopy.ctaTitle[locale],
      ctaSummary: portfolioPageCopy.ctaSummary[locale],
      secondaryCTALabel: portfolioPageCopy.bookingLabel[locale],
      emptyEyebrow: portfolioPageCopy.emptyEyebrow[locale],
      emptyTitle: portfolioPageCopy.emptyTitle[locale],
      emptySummary: portfolioPageCopy.emptySummary[locale],
      emptyAction: portfolioPageCopy.emptyAction[locale],
      sections: [
        {
          heading: portfolioPageCopy.title[locale],
          body: portfolioPageCopy.summary[locale],
          media: mediaIDs.get("editorial-portfolio-process"),
        },
      ],
      cta: { label: portfolioPageCopy.contactLabel[locale], action: "contact" },
      meta: {
        title: `${portfolioPageCopy.title[locale]} | PURITY Fashion Studio`,
        description: portfolioPageCopy.summary[locale],
      },
    })),
  })
  ids.set("portfolio", portfolioID)

  for (const status of [
    "success",
    "pending",
    "cancel",
    "failure",
    "refunded",
  ] as const) {
    const statusID = await upsertLocalized({
      collection: "pages",
      key: "legacyKey",
      value: `page:payment-${status}`,
      common: {
        legacyKey: `page:payment-${status}`,
        slug: `payment-${status}`,
        pageType: "service-state",
        enabled: true,
        featured: false,
        sortOrder: 110,
      },
      localizedData: localizedObject((locale) => ({
        title: paymentStatusCopy[status].title[locale],
        summary: paymentStatusCopy[status].summary[locale],
        eyebrow: paymentStatusCopy[status].eyebrow[locale],
        body: paymentStatusCopy[status].summary[locale],
        sections: [],
        cta: {
          label: paymentStatusCopy[status].action[locale],
          action: "booking-request",
        },
        meta: {
          title: `${paymentStatusCopy[status].title[locale]} | PURITY`,
          description: paymentStatusCopy[status].summary[locale],
        },
      })),
    })
    ids.set(`payment-${status}`, statusID)
  }

  return ids
}

async function importGlobals({
  directionIDs,
  serviceIDs,
  courseIDs,
  collectionIDs,
  mediaIDs,
}: {
  directionIDs: Map<string, ID>
  serviceIDs: Map<string, ID>
  courseIDs: Map<string, ID>
  collectionIDs: Map<string, ID>
  mediaIDs: Map<string, ID>
}) {
  await updateGlobalLocalized(
    "home",
    {
      // Open Graph artwork is intentionally separate from the public homepage
      // hero. Preserve the authored cinematic hero rather than promoting the
      // social-card logo into the rendered page.
      heroMedia: mediaIDs.get("generated-editorial-hero-flow"),
      primaryCTA: { path: siteSettings.home.primaryCta.path },
      secondaryCTA: { path: siteSettings.home.secondaryCta.path },
      selectedDirections: [...directionIDs.values()],
      selectedServices: definedIDs(
        services
          .filter((service) => service.visibleInMvp)
          .map((service) => serviceIDs.get(service.slug))
      ),
      selectedCourses: [...courseIDs.values()],
      selectedCollections: [...collectionIDs.values()],
      sectionMedia: {
        research: mediaIDs.get("generated-editorial-research"),
        imagine: mediaIDs.get("editorial-collections-flatlay"),
        create: mediaIDs.get("generated-editorial-create"),
        directions: mediaIDs.get("editorial-directions-texture"),
        studio: mediaIDs.get("editorial-studio-method"),
        portfolio: mediaIDs.get("editorial-portfolio-process"),
      },
    },
    localizedObject((locale) => ({
      heroEyebrow: siteSettings.home.eyebrow[locale],
      heroTitle: siteSettings.home.title[locale],
      heroSummary: siteSettings.home.summary[locale],
      primaryCTA: {
        label: siteSettings.home.primaryCta.label[locale],
        path: siteSettings.home.primaryCta.path,
      },
      secondaryCTA: {
        label: siteSettings.home.secondaryCta.label[locale],
        path: siteSettings.home.secondaryCta.path,
      },
      method: studioPageCopy.methodSteps.map((step) => ({
        label: step.title[locale],
        description: step.text[locale],
      })),
      serviceIntro: homePageCopy.serviceIntro[locale],
      priceNote: homePageCopy.priceNote[locale],
      methodEyebrow: homePageCopy.methodEyebrow[locale],
      methodTitle: homePageCopy.methodTitle[locale],
      methodDetails: homePageCopy.methodDetails[locale].map((text) => ({
        text,
      })),
      studioIntro: siteSettings.home.studioSummary[locale],
      studioEyebrow: siteSettings.home.studioEyebrow[locale],
      studioTitle: siteSettings.home.studioTitle[locale],
      serviceRailTitle: siteSettings.home.serviceRailTitle[locale],
      collectionRailTitle: siteSettings.home.collectionRailTitle[locale],
      portfolioNote: siteSettings.home.portfolioNote[locale],
      portfolioTitle: homePageCopy.portfolioTitle[locale],
      portfolioSummary: homePageCopy.portfolioSummary[locale],
      portfolioSignals: homePageCopy.portfolioSignals[locale].map((text) => ({
        text,
      })),
      faqTitle: homePageCopy.faqTitle[locale],
      faq: homePageCopy.faq[locale].map(([question, answer]) => ({
        question,
        answer,
      })),
      finalCTATitle: studioPageCopy.ctaTitle[locale],
      finalCTASummary: studioPageCopy.ctaSummary[locale],
      meta: siteSettings.seo[locale],
    })),
    true
  )

  await updateGlobalLocalized(
    "header",
    {},
    localizedObject((locale) => ({
      navigation: navigation
        .filter((item) => item.visibleInMvp)
        .map((item) => ({
          label: item.label[locale],
          path: item.path,
          visible: true,
          external: false,
          accessibleLabel: item.label[locale],
        })),
      bookingLabel:
        locale === "uk"
          ? "Записатися"
          : locale === "ru"
            ? "Записаться"
            : "Book now",
    })),
    true
  )

  await updateGlobalLocalized(
    "footer",
    {
      email: siteSettings.contacts.email ?? "voronina@purity-fashion.com",
      phone: siteSettings.contacts.phone ?? siteSettings.contacts.phones[0],
      phones: siteSettings.contacts.phones.map((number) => ({ number })),
      socialLinks: siteSettings.contacts.socials.map((social) => ({
        platform: social.label,
        url: social.url,
      })),
      legalNavigation: navigation
        .filter((item) => ["privacy", "terms"].includes(item.id))
        .map((item) => ({ path: item.path })),
    },
    localizedObject((locale) => ({
      address: siteSettings.contacts.address[locale],
      hours: siteSettings.contacts.hours[locale],
      responseTime: siteSettings.contacts.responseTime[locale],
      socialLinks: siteSettings.contacts.socials.map((social) => ({
        platform: social.label,
        url: social.url,
        accessibleLabel: social.label,
      })),
      legalNavigation: navigation
        .filter((item) => ["privacy", "terms"].includes(item.id))
        .map((item) => ({ label: item.label[locale], path: item.path })),
      copyright: `© ${new Date().getFullYear()} PURITY Fashion Studio`,
    })),
    true
  )

  await updateGlobalLocalized(
    "site-settings",
    {
      brandName: siteSettings.brandName,
      canonicalOrigin: getSiteURL(),
      defaultSocialImage: mediaIDs.get(siteSettings.defaultOgImageId),
      contacts: {
        email: siteSettings.contacts.email ?? "voronina@purity-fashion.com",
        phone: siteSettings.contacts.phone ?? siteSettings.contacts.phones[0],
        phones: siteSettings.contacts.phones.map((number) => ({ number })),
        actionPath: siteSettings.contacts.actionPath,
        viberURL: siteSettings.contacts.viberUrl,
      },
      localeLabels: { uk: "Українська", ru: "Русский", en: "English" },
      map: { provider: "none" },
      maintenance: { enabled: false },
      uiLabels: {},
    },
    localizedObject((locale) => ({
      contacts: {
        email: siteSettings.contacts.email ?? "voronina@purity-fashion.com",
        phone: siteSettings.contacts.phone ?? siteSettings.contacts.phones[0],
        address: siteSettings.contacts.address[locale],
        city: siteSettings.contacts.city[locale],
        hours: siteSettings.contacts.hours[locale],
        actionLabel: siteSettings.contacts.actionLabel[locale],
      },
      uiLabels: {
        language: siteSettings.languageLabel[locale],
        close: siteSettings.closeLabel[locale],
        externalLink: siteSettings.externalLinkLabel[locale],
        menu: publicUiLabels.menu[locale],
        footerDirections: publicUiLabels.footerDirections[locale],
        footerContacts: publicUiLabels.footerContacts[locale],
      },
      contactLabels: {
        phone: contactLabels.phone[locale],
        email: contactLabels.email[locale],
        viber: contactLabels.viber[locale],
        socials: contactLabels.socials[locale],
        direct: contactLabels.direct[locale],
        address: contactLabels.address[locale],
        hours: contactLabels.hours[locale],
        request: contactLabels.request[locale],
        requestSummary: contactLabels.requestSummary[locale],
      },
      booking: {
        eyebrow: bookingCopy.eyebrow[locale],
        title: bookingCopy.title[locale],
        summary: bookingCopy.summary[locale],
        privateInquiry: bookingCopy.privateInquiry[locale],
        corporateInquiry: bookingCopy.corporateInquiry[locale],
        submit: bookingCopy.submit[locale],
        submitting: bookingCopy.submitting[locale],
        emptyService: bookingCopy.emptyService[locale],
        successTitle: bookingCopy.successTitle[locale],
        successSummary: bookingCopy.successSummary[locale],
        errorTitle: bookingCopy.errorTitle[locale],
        validationError: bookingCopy.validationError[locale],
        checkout: bookingCopy.checkout[locale],
        routingTitle: bookingCopy.routingTitle[locale],
        routingSummary: bookingCopy.routingSummary[locale],
        contactTitle: bookingCopy.contactTitle[locale],
        paymentTitle: bookingCopy.paymentTitle[locale],
        stepsTitle: bookingCopy.stepsTitle[locale],
        stepDetails: bookingCopy.stepDetails[locale],
        stepReview: bookingCopy.stepReview[locale],
        reviewTitle: bookingCopy.reviewTitle[locale],
        reviewSummary: bookingCopy.reviewSummary[locale],
        notSpecified: bookingCopy.notSpecified[locale],
        labels: {
          inquiryType: bookingLabels.inquiryType[locale],
          serviceSlug: bookingLabels.serviceSlug[locale],
          name: bookingLabels.name[locale],
          email: bookingLabels.email[locale],
          phone: bookingLabels.phone[locale],
          company: bookingLabels.company[locale],
          format: bookingLabels.format[locale],
          contactMethod: bookingLabels.contactMethod[locale],
          budgetCurrency: bookingLabels.budgetCurrency[locale],
          preferredAt: bookingLabels.preferredAt[locale],
          message: bookingLabels.message[locale],
          consent: bookingLabels.consent[locale],
        },
        inquiryTypes: {
          private: inquiryTypeLabels.private[locale],
          corporate: inquiryTypeLabels.corporate[locale],
        },
        formats: {
          studio: formatLabels.studio[locale],
          online: formatLabels.online[locale],
          atelier: formatLabels.atelier[locale],
        },
        contactMethods: {
          email: contactMethodLabels.email[locale],
          phone: contactMethodLabels.phone[locale],
          viber: contactMethodLabels.viber[locale],
        },
        currencies: {
          EUR: currencyLabels.EUR[locale],
          UAH: currencyLabels.UAH[locale],
        },
        providers: {
          stripe: providerLabels.stripe[locale],
          liqpay: providerLabels.liqpay[locale],
        },
        errors: {
          required: bookingErrors.required[locale],
          email: bookingErrors.email[locale],
          message: bookingErrors.message[locale],
          consent: bookingErrors.consent[locale],
          companyRequired: bookingErrors.companyRequired[locale],
          phoneRequired: bookingErrors.phoneRequired[locale],
        },
        paymentStatus: {
          provider:
            locale === "uk"
              ? "Провайдер"
              : locale === "ru"
                ? "Провайдер"
                : "Provider",
          order:
            locale === "uk"
              ? "Замовлення"
              : locale === "ru"
                ? "Заказ"
                : "Order",
          notProvided:
            locale === "uk"
              ? "Не вказано"
              : locale === "ru"
                ? "Не указан"
                : "Not provided",
          referenceReceived:
            locale === "uk"
              ? "Отримано"
              : locale === "ru"
                ? "Получено"
                : "Reference received",
        },
        pricing: {
          from: pricingLabels.from[locale],
          custom: pricingLabels.custom[locale],
        },
      },
      maintenance: { enabled: false, message: "" },
    })),
    false
  )
}

async function linkDirections(
  directionIDs: Map<string, ID>,
  serviceIDs: Map<string, ID>,
  courseIDs: Map<string, ID>,
  collectionIDs: Map<string, ID>
) {
  for (const [directionKey, directionID] of directionIDs) {
    const relatedServices = definedIDs(
      services
        .filter((service) =>
          directionKey === "realisation"
            ? ["realisation", "atelier"].includes(service.category)
            : service.category === directionKey
        )
        .map((service) => serviceIDs.get(service.slug))
    )

    await payload.update({
      collection: "directions",
      id: directionID,
      data: {
        relatedServices,
        relatedCourses:
          directionKey === "school" ? [...courseIDs.values()] : [],
        relatedCollections:
          directionKey === "collections" ? [...collectionIDs.values()] : [],
      },
      locale: "uk",
      overrideAccess: true,
    })
  }
}

async function verifyPublishedContent() {
  if (!publish) return

  const expected = {
    directions: serviceCategories.filter((item) =>
      [
        "research",
        "realisation",
        "transformation",
        "corporate",
        "school",
        "collections",
      ].includes(item.slug)
    ).length,
    services: services.filter((item) => item.visibleInMvp).length,
    offers: services.length + courses.length + collections.length,
    courses: courses.filter((item) => item.visibleInMvp).length,
    "fashion-collections": collections.filter((item) => item.visibleInMvp)
      .length,
    pages: publicPages.length,
    media: mediaAssets.filter(
      (asset) => asset.source === "generated" || asset.kind === "logo"
    ).length,
  } satisfies Partial<Record<CollectionSlug, number>>

  for (const [collection, minimum] of Object.entries(expected) as Array<
    [CollectionSlug, number]
  >) {
    for (const locale of locales) {
      const result = await payload.find({
        collection,
        depth: 0,
        draft: false,
        fallbackLocale: false,
        limit: 1000,
        locale,
        overrideAccess: false,
        pagination: false,
        select: { id: true },
      } as never)

      if (result.docs.length < minimum) {
        throw new Error(
          `Published ${collection} mismatch for ${locale}: expected at least ${minimum}, found ${result.docs.length}.`
        )
      }
    }

    increment(`${collection}:published`)
  }
}

async function assertBootstrapDatabaseIsEmpty() {
  if (!bootstrap) return

  const collections: CollectionSlug[] = [
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
  ]

  for (const collection of collections) {
    const { totalDocs } = await payload.count({
      collection,
      overrideAccess: true,
    })
    if (totalDocs !== 0) {
      throw new Error(
        `CMS bootstrap requires an empty database; ${collection} contains ${totalDocs} document(s).`
      )
    }
  }
}

async function run() {
  if (dryRun) {
    for (const asset of mediaAssets) mediaPath(asset)
    console.log(
      JSON.stringify({
        target: target ?? "unspecified",
        publish,
        media: mediaAssets.length,
        directions: serviceCategories.length,
        services: services.length,
        courses: courses.length,
        collections: collections.length,
        portfolioCases: portfolioCases.length,
        pages: publicPages.length + 1,
      })
    )
    return
  }
  if (verifyOnly) {
    await verifyPublishedContent()
    return
  }
  await assertBootstrapDatabaseIsEmpty()
  console.log("Importing media")
  const mediaIDs = await retryDatabaseStage("media", importMedia)
  console.log("Importing directions")
  const directionIDs = await retryDatabaseStage("directions", importDirections)
  console.log("Importing services")
  const serviceIDs = await retryDatabaseStage("services", () =>
    importServices(directionIDs, mediaIDs)
  )
  console.log("Importing offers")
  await retryDatabaseStage("offers", () => importServiceOffers(serviceIDs))
  console.log("Importing courses")
  const courseIDs = await retryDatabaseStage("courses", () =>
    importCourses(directionIDs, mediaIDs)
  )
  console.log("Importing fashion collections")
  const collectionIDs = await retryDatabaseStage("fashion collections", () =>
    importFashionCollections(mediaIDs)
  )
  console.log("Importing portfolio cases")
  await retryDatabaseStage("portfolio cases", () =>
    importPortfolioCases(mediaIDs)
  )
  console.log("Importing pages")
  await retryDatabaseStage("pages", () => importPages(mediaIDs))
  console.log("Importing booking settings")
  await retryDatabaseStage("booking settings", importBookingSettings)
  console.log("Linking related content")
  await retryDatabaseStage("related content", () =>
    linkDirections(directionIDs, serviceIDs, courseIDs, collectionIDs)
  )
  console.log("Importing globals")
  await retryDatabaseStage("globals", () =>
    importGlobals({
      directionIDs,
      serviceIDs,
      courseIDs,
      collectionIDs,
      mediaIDs,
    })
  )
  console.log("Verifying published content")
  await verifyPublishedContent()

  for (const [label, count] of [...counts.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    console.log(`${label}: ${count}`)
  }
}

try {
  await run()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
