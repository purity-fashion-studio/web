import type { Metadata } from "next"
import { draftMode } from "next/headers"

import { env } from "@/lib/env"
import { getSiteURL } from "@/lib/site-url"

import { locales, localizePath, type Locale } from "../i18n/routing"

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
}: {
  locale: Locale
  path?: string
  title: string
  description: string
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
      images: [
        {
          url: "/brand/logo-og.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/logo-og.png"],
    },
  }
}
