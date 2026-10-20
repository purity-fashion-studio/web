import { locales, type Locale } from "../../i18n/routing"

export type LocaleData = Record<Locale, Record<string, unknown>>

export function localizedObject(
  builder: (locale: Locale) => Record<string, unknown>
): LocaleData {
  return Object.fromEntries(
    locales.map((locale) => [locale, builder(locale)])
  ) as LocaleData
}

export function definedIDs<ID extends string>(values: Array<ID | undefined>) {
  return values.filter((value): value is ID => Boolean(value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

export function mergeGlobalData(
  common: Record<string, unknown>,
  localized: Record<string, unknown>
) {
  const data = { ...common, ...localized }

  for (const [key, localizedValue] of Object.entries(localized)) {
    const commonValue = common[key]
    if (isRecord(commonValue) && isRecord(localizedValue)) {
      data[key] = { ...commonValue, ...localizedValue }
    }
  }

  return data
}

export function serviceFormats(slug: string): string[] {
  if (slug.includes("atelier")) return ["studio", "remote-atelier"]
  if (slug.includes("corporate")) return ["in-person", "hybrid"]
  return ["online", "studio"]
}

const serviceFormatLabels: Record<string, Record<Locale, string>> = {
  online: { uk: "Онлайн", ru: "Онлайн", en: "Online" },
  studio: { uk: "У студії", ru: "В студии", en: "Studio" },
  "remote-atelier": {
    uk: "Дистанційне ательє",
    ru: "Дистанционное ателье",
    en: "Remote atelier",
  },
  "in-person": { uk: "Особисто", ru: "Лично", en: "In person" },
  hybrid: { uk: "Гібридно", ru: "Гибридно", en: "Hybrid" },
}

export function serviceFormatLabel(format: string, locale: Locale): string {
  return serviceFormatLabels[format]?.[locale] ?? format
}
