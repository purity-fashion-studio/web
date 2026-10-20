import { readFileSync } from "node:fs"
import { join } from "node:path"

import { locales } from "../i18n/routing"

type JsonObject = Record<string, unknown>

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : []
  }

  return Object.entries(value as JsonObject).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key)
  )
}

function readMessages(locale: string) {
  return JSON.parse(
    readFileSync(join(process.cwd(), "messages", `${locale}.json`), "utf8")
  ) as JsonObject
}

const [baseLocale, ...otherLocales] = locales
const baseKeys = new Set(flattenKeys(readMessages(baseLocale)))

for (const locale of otherLocales) {
  const keys = new Set(flattenKeys(readMessages(locale)))
  const missing = [...baseKeys].filter((key) => !keys.has(key))
  const extra = [...keys].filter((key) => !baseKeys.has(key))

  if (missing.length || extra.length) {
    throw new Error(
      [
        `${locale} messages do not match ${baseLocale}.`,
        missing.length ? `Missing: ${missing.join(", ")}` : "",
        extra.length ? `Extra: ${extra.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
  }
}

console.log(`i18n ok: ${locales.join(", ")}`)
