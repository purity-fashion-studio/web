import type { Metadata } from "next"
import { draftMode } from "next/headers"

import { env } from "@/lib/env"
import { getSiteURL } from "@/lib/site-url"

import { locales, localizePath, type Locale } from "../i18n/routing"
import type { MediaAsset } from "./media"

function localizedAlternates(locale: Locale, path = "/") {
  return {
    canonical: localizePath(locale, path),
    languages: Object.fromEntries(
      locales.map((alternateLocale) => [
        alternateLocale,
        localizePath(alternateLocale, path),
      ])
    ),
  }
}

export async function getLocalizedMetadata({
  locale,
  path = "/",
  title,
  description,
  image,
}: {
  locale: Locale
  path?: string
  title: string
  description: string
  image?: Pick<MediaAsset, "src" | "alt">
}): Promise<Metadata> {
  const preview = (await draftMode()).isEnabled
  const indexable = env.NEXT_PUBLIC_INDEXING_ENABLED === "true" && !preview

  return {
    metadataBase: new URL(getSiteURL()),
    title,
    description,
    robots: {
      index: indexable,
      follow: indexable,
      ...(preview ? { noarchive: true } : {}),
    },
    alternates: localizedAlternates(locale, path),
    openGraph: {
      title,
      description,
      siteName: "PURITY Fashion Studio",
      locale,
      alternateLocale: locales.filter(
        (alternateLocale) => alternateLocale !== locale
      ),
      images: image?.src
        ? [{ url: image.src, alt: image.alt[locale] }]
        : [{ url: "/brand/logo-og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image?.src ?? "/brand/logo-og.png"],
    },
  }
}
