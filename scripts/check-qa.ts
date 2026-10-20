import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

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

const requiredPreset = "b59jufTOPg"
const requiredFiles = [
  "app/robots.ts",
  "app/sitemap.ts",
  "playwright.config.ts",
  "tests/e2e/purity.spec.ts",
  "docs/qa-checklist.md",
]

const forbiddenPatterns = [
  /\bLouis\s+Vuitton\b/i,
  /\bLouisVuitton\b/i,
  /louisvuitton/i,
  /\bmonogram\b/i,
  /\bLV\b/,
]
const forbiddenProjectPatterns = [/\bnova\b/i, /\bПрага\b/i, /\bPrague\b/i]
const genericPublicCopyPatterns = [
  /\blorem\b/i,
  /\bipsum\b/i,
  /\btbd\b/i,
  /\btodo\b/i,
  /\bcoming soon\b/i,
  /\bplaceholder\b/i,
  /\bempty\b/i,
  /\bgeneric\b/i,
  /\bплейсхолдер\b/i,
  /\bзаглуш/i,
]
const scaffoldPublicCopyPatterns = [
  /\bMVP\b/i,
  /\bPURITY-\d+\b/i,
  /\bcomponent exists\b/i,
  /\blive booking routes? arrive\b/i,
  /\btyped and ready\b/i,
  /\broute ready\b/i,
  /маршрут готов/i,
  /типізовано[\s\S]{0,80}готов/i,
  /типизирован[\s\S]{0,80}готов/i,
  /жив[а-яёіїєʼ'\s-]*маршрут[а-яёіїєʼ'\s-]*PURITY-\d+/i,
]
const forbiddenWrapperAliases = [
  "PathwaySection",
  "ProcessSection",
  "PricingSection",
  "PortfolioSection",
  "BookingSection",
]

type LocalizedText = Record<(typeof locales)[number], string | string[]>
type LocalizedSeo = Record<
  (typeof locales)[number],
  { title: string; description: string }
>

function listFiles(root: string): string[] {
  if (!existsSync(root)) {
    return []
  }

  return readdirSync(root)
    .flatMap((entry) => {
      const path = join(root, entry)
      const stat = statSync(path)

      return stat.isDirectory() ? listFiles(path) : [path]
    })
    .filter((path) => /\.(css|json|ts|tsx|md)$/.test(path))
}

function listAllFiles(root: string): string[] {
  if (!existsSync(root)) {
    return []
  }

  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    const stat = statSync(path)

    return stat.isDirectory() ? listAllFiles(path) : [path]
  })
}

function localizedCopy(value: LocalizedText): string[] {
  return locales.flatMap((locale) => value[locale])
}

function localizedSeoCopy(value: LocalizedSeo): string[] {
  return locales.flatMap((locale) => [
    value[locale].title,
    value[locale].description,
  ])
}

function flattenJsonText(value: unknown): string[] {
  if (typeof value === "string") {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonText)
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenJsonText)
  }

  return []
}

function assertNoPublicScaffoldCopy(label: string, fields: string[]) {
  const text = fields.join(" ").replace(/\s+/g, " ").trim()

  for (const pattern of scaffoldPublicCopyPatterns) {
    if (pattern.test(text)) {
      issues.push(`Scaffold/MVP copy ${pattern} found in ${label}`)
    }
  }
}

function assertMeaningfulPublicCopy(
  label: string,
  fields: string[],
  options: { allowExplicitPlaceholder?: boolean } = {}
) {
  const text = fields.join(" ").replace(/\s+/g, " ").trim()

  if (text.length < 160) {
    issues.push(`Public content is too thin or empty: ${label}`)
  }

  if (!options.allowExplicitPlaceholder) {
    for (const pattern of genericPublicCopyPatterns) {
      if (pattern.test(text)) {
        issues.push(`Generic placeholder copy ${pattern} found in ${label}`)
      }
    }
  }

  assertNoPublicScaffoldCopy(label, fields)
}

const issues: string[] = []

if (existsSync("components/ui/button-variants.ts")) {
  issues.push(
    "Duplicate button variants wrapper found; keep the canonical contract in components/ui/button.tsx"
  )
}

for (const file of ["app", "components", "features", "lib"].flatMap(
  listFiles
)) {
  const source = readFileSync(file, "utf8")

  if (source.includes("lucide-react")) {
    issues.push(`Lucide runtime icon import found in ${file}`)
  }

  if (
    /purity-(?:ink|graphite|stone|line|paper|ivory|silk|taupe|burgundy|gold-muted)\b/.test(
      source
    )
  ) {
    issues.push(`Custom PURITY palette usage found in ${file}`)
  }
}

const requiredLogoIds = [
  "logo-wordmark-black",
  "logo-lockup-black",
  "logo-mark-grey",
  "logo-wordmark-reversed",
  "logo-lockup-reversed",
]

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    issues.push(`Missing QA artifact: ${file}`)
  }
}

for (const file of ["scripts/setup-project.ts", "README.md"]) {
  if (!existsSync(file)) {
    issues.push(`Missing preset guard file: ${file}`)
    continue
  }

  const text = readFileSync(file, "utf8")

  if (!text.includes(requiredPreset)) {
    issues.push(`Requested shadcn preset ${requiredPreset} missing in ${file}`)
  }

  if (/\bnova\b/i.test(text)) {
    issues.push(`Forbidden shadcn preset reference "nova" found in ${file}`)
  }
}

const localeLayout = readFileSync("app/[locale]/layout.tsx", "utf8")
const globalsCss = readFileSync("app/globals.css", "utf8")

for (const required of [
  "Noto_Sans",
  "Noto_Serif",
  'variable: "--font-sans"',
  'variable: "--font-heading"',
]) {
  if (!localeLayout.includes(required)) {
    issues.push(`Missing preset typography wiring: ${required}`)
  }
}

if ((localeLayout.match(/display: "swap"/g) ?? []).length < 2) {
  issues.push(
    "PURITY typography must use display: swap for both primary font families"
  )
}

for (const subset of ['"cyrillic"', '"cyrillic-ext"', '"latin"']) {
  if (!localeLayout.includes(subset)) {
    issues.push(`PURITY typography is missing the ${subset} font subset`)
  }
}

if (/\bGeist(?:_Mono)?\b/.test(localeLayout)) {
  issues.push("PURITY typography must not use Geist as the primary font family")
}

if (
  !/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*{[\s\S]*?font-family:\s*var\(--font-heading\)/.test(
    globalsCss
  )
) {
  issues.push("HTML headings must use font-heading globally")
}

if (
  !/body\s*{[\s\S]*?font-family:\s*var\(--font-sans\),\s*Arial,\s*sans-serif/.test(
    globalsCss
  )
) {
  issues.push("Body copy must use --font-sans with a neutral sans fallback")
}

if (
  !/\.font-heading\s*{[\s\S]*?font-family:\s*var\(--font-heading\)/.test(
    globalsCss
  )
) {
  issues.push(
    "font-heading utility must resolve to the preset heading variable"
  )
}

if (
  !/\.font-sans\s*{[\s\S]*?font-family:\s*var\(--font-sans\),\s*Arial,\s*sans-serif/.test(
    globalsCss
  )
) {
  issues.push("font-sans utility must resolve to the Noto Sans variable")
}

const routes = locales.flatMap((locale) => getManifestRoutes(locale))
const routeHrefs = new Set(routes.map((route) => route.href))

for (const route of routes) {
  if (!route.href.startsWith(`/${route.href.split("/")[1]}`)) {
    issues.push(`Route href is malformed: ${route.href}`)
  }
}

const qaMediaAssets: Array<{
  id: string
  kind: string
  source: string
  generated: boolean
  fileName: string
  aspectRatio: string
  sourceMetadata?: {
    origin?: string
    disclosure?: string
  }
  src?: string
  usage: string[]
  isRealClientProof: boolean
}> = mediaAssets
const mediaById = new Map(qaMediaAssets.map((asset) => [asset.id, asset]))
const mediaIdsWithFiles = new Set(
  qaMediaAssets
    .filter((asset) => {
      if (!asset.src) {
        return false
      }

      const filePath = `public/${asset.src.replace(/^\//, "")}`

      return existsSync(filePath) && statSync(filePath).size > 0
    })
    .map((asset) => asset.id)
)

function assertMediaCoverage(label: string, mediaIds: string[] = []) {
  if (!mediaIds.some((id) => mediaIdsWithFiles.has(id))) {
    issues.push(`Missing rendered media coverage: ${label}`)
  }
}

for (const logoId of requiredLogoIds) {
  const logo = mediaById.get(logoId)

  if (!logo) {
    issues.push(`Missing logo media record: ${logoId}`)
    continue
  }

  if (logo.kind !== "logo" || logo.source !== "client") {
    issues.push(`Logo media record must use client logo kind: ${logoId}`)
  }

  if (!logo.src || !existsSync(`public/${logo.src.replace(/^\//, "")}`)) {
    issues.push(`Logo media record points at missing file: ${logoId}`)
  }

  if (!logo.usage.length) {
    issues.push(`Logo media record is missing usage metadata: ${logoId}`)
  }
}

for (const mediaAsset of qaMediaAssets) {
  if (mediaAsset.generated !== (mediaAsset.source === "generated")) {
    issues.push(`Generated flag does not match source: ${mediaAsset.id}`)
  }

  if (!mediaAsset.fileName || !mediaAsset.aspectRatio) {
    issues.push(`Media asset missing file metadata: ${mediaAsset.id}`)
  }

  if (mediaAsset.src) {
    const filePath = `public/${mediaAsset.src.replace(/^\//, "")}`

    if (!existsSync(filePath)) {
      issues.push(`Media asset points at missing file: ${mediaAsset.id}`)
    } else if (statSync(filePath).size === 0) {
      issues.push(`Media asset points at an empty file: ${mediaAsset.id}`)
    }

    if (!mediaAsset.src.endsWith(`/${mediaAsset.fileName}`)) {
      issues.push(`Media asset fileName does not match src: ${mediaAsset.id}`)
    }
  }

  if (mediaAsset.source === "generated") {
    if (!mediaAsset.src) {
      issues.push(`Generated media missing real file: ${mediaAsset.id}`)
    } else {
      const filePath = `public/${mediaAsset.src.replace(/^\//, "")}`

      if (existsSync(filePath) && statSync(filePath).size === 0) {
        issues.push(`Generated media file is empty: ${mediaAsset.id}`)
      }
    }

    if (
      mediaAsset.sourceMetadata?.origin !== "generated" ||
      !mediaAsset.sourceMetadata.disclosure
    ) {
      issues.push(`Generated media missing source metadata: ${mediaAsset.id}`)
    }

    if (mediaAsset.isRealClientProof) {
      issues.push(`Generated media marked as real proof: ${mediaAsset.id}`)
    }
  }
}

const requiredContacts = [
  "03150",
  "Предславинська 44",
  "French Quarter 2",
  "11:00-20:00",
  "+38 067 656 19 12",
  "+38 066 00 44 066",
  "voronina@purity-fashion.com",
  "viber://chat?number=%2B380676561912",
  "https://www.instagram.com/purity_fashion_studio/",
  "https://www.facebook.com/PURITY-Fashion-Studio-370149113069285/?fref=ts",
  "https://www.youtube.com/channel/UCVTLImOTCrlad07TufNaJYw",
  "https://www.pinterest.com/purityfashionst/",
]
const serializedContacts = JSON.stringify(siteSettings.contacts)

for (const contact of requiredContacts) {
  if (!serializedContacts.includes(contact)) {
    issues.push(`Missing source-backed contact/social fact: ${contact}`)
  }
}

for (const portfolioCase of portfolioCases) {
  if (portfolioCase.visibleInMvp && !portfolioCase.isRealClientProof) {
    issues.push(
      `Portfolio case visible without real proof: ${portfolioCase.slug}`
    )
  }
}

for (const file of listFiles("app")
  .concat(listFiles("components"))
  .concat(listFiles("features"))
  .concat(listFiles("content"))
  .concat(listFiles("messages"))) {
  const text = readFileSync(file, "utf8")

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      issues.push(`Protected reference pattern ${pattern} found in ${file}`)
    }
  }

  for (const pattern of forbiddenProjectPatterns) {
    if (pattern.test(text)) {
      issues.push(`Forbidden project pattern ${pattern} found in ${file}`)
    }
  }
}

for (const file of listFiles("messages")) {
  const text = readFileSync(file, "utf8")

  assertNoPublicScaffoldCopy(
    `runtime messages:${file}`,
    flattenJsonText(JSON.parse(text))
  )
}

for (const file of listAllFiles("public")) {
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(file)) {
      issues.push(`Protected asset name pattern ${pattern} found in ${file}`)
    }
  }
}

for (const file of listFiles("app")
  .concat(listFiles("components"))
  .concat(listFiles("features"))) {
  const text = readFileSync(file, "utf8")

  if (/(useFormField|FormField|FormItem|FormControl)/.test(text)) {
    issues.push(`Custom form primitive duplicate found in ${file}`)
  }

  for (const alias of forbiddenWrapperAliases) {
    if (text.includes(alias)) {
      issues.push(`Wrapper alias ${alias} should be deleted from ${file}`)
    }
  }
}

for (const category of serviceCategories) {
  assertMeaningfulPublicCopy(`category:${category.slug}`, [
    ...localizedCopy(category.title),
    ...localizedCopy(category.summary),
  ])
}

for (const service of services.filter((item) => item.visibleInMvp)) {
  assertMediaCoverage(`service:${service.slug}`, service.mediaIds)
  assertNoPublicScaffoldCopy(
    `service-seo:${service.slug}`,
    localizedSeoCopy(service.seo)
  )
  assertMeaningfulPublicCopy(`service:${service.slug}`, [
    ...localizedCopy(service.title),
    ...localizedCopy(service.summary),
    ...localizedCopy(service.commercialStatus),
    ...localizedCopy(service.priceNote),
    ...localizedCopy(service.outcomes),
  ])
}

for (const course of courses.filter((item) => item.visibleInMvp)) {
  assertMediaCoverage(`course:${course.slug}`, course.mediaIds)
  assertNoPublicScaffoldCopy(
    `course-seo:${course.slug}`,
    localizedSeoCopy(course.seo)
  )
  assertMeaningfulPublicCopy(
    `course:${course.slug}`,
    [
      ...localizedCopy(course.title),
      ...localizedCopy(course.summary),
      ...localizedCopy(course.commercialStatus),
      ...localizedCopy(course.priceNote),
      ...localizedCopy(course.audience),
      ...localizedCopy(course.lessons),
    ],
    { allowExplicitPlaceholder: true }
  )
}

for (const collection of collections.filter((item) => item.visibleInMvp)) {
  assertMediaCoverage(`collection:${collection.slug}`, collection.mediaIds)
  assertNoPublicScaffoldCopy(
    `collection-seo:${collection.slug}`,
    localizedSeoCopy(collection.seo)
  )
  assertMeaningfulPublicCopy(`collection:${collection.slug}`, [
    ...localizedCopy(collection.title),
    ...localizedCopy(collection.summary),
    ...localizedCopy(collection.commercialStatus),
    ...localizedCopy(collection.priceNote),
    ...localizedCopy(collection.materials),
  ])
}

for (const page of publicPages) {
  if (["studio", "booking"].includes(page.slug)) {
    assertMediaCoverage(`page:${page.slug}`, page.mediaIds)
  }

  assertNoPublicScaffoldCopy(
    `page-seo:${page.slug}`,
    localizedSeoCopy(page.seo)
  )
  assertMeaningfulPublicCopy(`page:${page.slug}`, [
    ...localizedCopy(page.title),
    ...localizedCopy(page.eyebrow),
    ...localizedCopy(page.summary),
    ...localizedCopy(page.body),
  ])
}

assertMeaningfulPublicCopy("site:home", [
  ...localizedCopy(siteSettings.home.title),
  ...localizedCopy(siteSettings.home.summary),
  ...localizedCopy(siteSettings.home.studioTitle),
  ...localizedCopy(siteSettings.home.studioSummary),
])

assertMeaningfulPublicCopy("site:contacts", [
  ...localizedCopy(siteSettings.contacts.city),
  ...localizedCopy(siteSettings.contacts.address),
  ...localizedCopy(siteSettings.contacts.hours),
  ...localizedCopy(siteSettings.contacts.responseTime),
  ...siteSettings.contacts.phones,
  siteSettings.contacts.email ?? "",
])

assertNoPublicScaffoldCopy("site-seo", localizedSeoCopy(siteSettings.seo))

if (!routeHrefs.has("/uk/booking") || !routeHrefs.has("/en/contacts")) {
  issues.push("Expected localized booking/contact routes are missing")
}

if (issues.length) {
  throw new Error(`QA checks failed:\n${issues.join("\n")}`)
}

console.log(`QA static ok: ${routes.length} content routes checked`)
