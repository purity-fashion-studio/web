import type { PostgresAdapter } from "@payloadcms/db-postgres"
import { getPayload, type Field } from "payload"

import config from "@payload-config"

const locales = ["uk", "ru", "en"] as const
const publicCollections = [
  "directions",
  "services",
  "offers",
  "courses",
  "fashion-collections",
  "portfolio-cases",
  "testimonials",
  "pages",
] as const

function requiredLocalizedFields(
  fields: readonly Field[],
  prefix = ""
): string[] {
  return fields.flatMap((field) => {
    if (field.type === "tabs") {
      return field.tabs.flatMap((tab) =>
        requiredLocalizedFields(
          tab.fields,
          "name" in tab && tab.name ? `${prefix}${tab.name}.` : prefix
        )
      )
    }
    if (!("name" in field) || !field.name) {
      return "fields" in field
        ? requiredLocalizedFields(field.fields, prefix)
        : []
    }
    const nested =
      !("localized" in field && field.localized) &&
      "fields" in field &&
      field.fields
        ? requiredLocalizedFields(field.fields, `${prefix}${field.name}.`)
        : []
    return "localized" in field &&
      field.localized &&
      "required" in field &&
      field.required
      ? [`${prefix}${field.name}`, ...nested]
      : nested
  })
}

function valueAtPath(value: Record<string, unknown>, path: string): unknown {
  const [key, ...rest] = path.split(".")
  if (!key) return value
  if (!value || typeof value !== "object") return undefined
  if (locales.every((locale) => locale in value)) {
    return Object.fromEntries(
      locales.map((locale) => [
        locale,
        valueAtPath(value[locale] as Record<string, unknown>, path),
      ])
    )
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      item && typeof item === "object"
        ? valueAtPath(item as Record<string, unknown>, path)
        : undefined
    )
  }
  const next = value[key]
  if (!rest.length) return next
  return next && typeof next === "object"
    ? valueAtPath(next as Record<string, unknown>, rest.join("."))
    : undefined
}

function missingLocale(value: unknown): string[] {
  if (Array.isArray(value)) {
    return locales.filter(
      (locale) =>
        value.length === 0 ||
        value.some((item) => {
          if (!item || typeof item !== "object") return !hasContent(item)
          const localizedItem = item as Record<string, unknown>
          return !hasContent(
            locales.some((candidate) => candidate in localizedItem)
              ? localizedItem[locale]
              : item
          )
        })
    )
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return locales.slice()
  }
  const localized = value as Record<string, unknown>
  return locales.filter((locale) => {
    return !hasContent(localized[locale])
  })
}

function hasContent(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0 && value.every(hasContent)
  return value !== undefined && value !== null && value !== ""
}

const payload = await getPayload({ config })
try {
  const issues: string[] = []

  for (const slug of publicCollections) {
    const collection = payload.config.collections.find(
      (item) => item.slug === slug
    )
    if (!collection) continue
    const fields = requiredLocalizedFields(collection.fields)
    const result = await payload.find({
      collection: slug,
      depth: 0,
      draft: false,
      fallbackLocale: false,
      limit: 10_000,
      locale: "all",
      overrideAccess: true,
      pagination: false,
      where: { _status: { equals: "published" } },
    })
    for (const doc of result.docs as unknown as Array<
      Record<string, unknown>
    >) {
      for (const field of fields) {
        const missing = missingLocale(valueAtPath(doc, field))
        if (missing.length)
          issues.push(`${slug}:${doc.id}:${field}:${missing.join(",")}`)
      }
    }
  }

  for (const global of payload.config.globals) {
    const fields = requiredLocalizedFields(global.fields)
    if (!fields.length) continue
    const doc = (await payload.findGlobal({
      slug: global.slug,
      draft: false,
      fallbackLocale: false,
      locale: "all",
      overrideAccess: true,
    })) as unknown as Record<string, unknown>
    for (const field of fields) {
      const missing = missingLocale(valueAtPath(doc, field))
      if (missing.length)
        issues.push(`global:${global.slug}:${field}:${missing.join(",")}`)
    }
  }

  if (issues.length) {
    console.error(`Published locale integrity failed (${issues.length}):`)
    console.error(issues.join("\n"))
    process.exitCode = 1
  } else {
    console.log("Published localization integrity ok: UK/RU/EN complete.")
  }
} finally {
  try {
    await payload.destroy()
  } finally {
    // Drizzle destroy leaves the pool open, and db-postgres 3.88 retains its
    // startup client. Request graceful shutdown, but do not hang this owned CLI.
    const pool = (payload.db as unknown as PostgresAdapter).pool
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        pool?.end(),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 100)
        }),
      ])
    } finally {
      if (timer) clearTimeout(timer)
    }
  }
}
// Only reached after all checks and cleanup succeeded. Query/destroy errors
// propagate instead; an integrity failure preserves process.exitCode=1.
process.exit(process.exitCode ?? 0)
