import { defineRouting } from "next-intl/routing"

export const locales = ["uk", "ru", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "uk"

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export function hasLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

function stripLocalePrefix(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`
  const [, maybeLocale, ...segments] = normalized.split("/")

  if (!hasLocale(maybeLocale)) {
    return normalized
  }

  const path = `/${segments.join("/")}`

  return path === "/" ? "/" : path.replace(/\/$/, "")
}

export function localizePath(locale: Locale, pathname = "/") {
  const path = stripLocalePrefix(pathname)

  return `/${locale}${path === "/" ? "" : path}`
}
