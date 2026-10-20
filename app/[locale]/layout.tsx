import type { Metadata } from "next"
import { Noto_Sans, Noto_Serif } from "next/font/google"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type * as React from "react"

import "../globals.css"
import { Analytics } from "@/components/analytics"
import { StructuredData } from "@/components/structured-data"
import { getLocalizedMetadata } from "@/content/metadata"
import { getHome, getSiteSettings } from "@/content/public-api"
import { hasLocale, locales } from "@/i18n/routing"
import { getSiteURL } from "@/lib/site-url"
import { cn } from "@/lib/utils"

// Public content is read from Payload at request time. This avoids baking a
// database snapshot into a build and lets revalidation hooks publish changes.
export const dynamic = "force-dynamic"

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: "variable",
  display: "swap",
})

const notoSerif = Noto_Serif({
  variable: "--font-heading",
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: "variable",
  display: "swap",
})

const skipToContentLabels = {
  uk: "Перейти до основного вмісту",
  ru: "Перейти к основному содержимому",
  en: "Skip to main content",
} as const

type LocaleParams = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(locale)) {
    return {}
  }

  const home = await getHome(locale)
  const metadata = await getLocalizedMetadata({
    locale,
    title: home.seo.title,
    description: home.seo.description,
  })

  return {
    ...metadata,
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<
  {
    children: React.ReactNode
  } & LocaleParams
>) {
  const { locale } = await params

  if (!hasLocale(locale)) {
    notFound()
  }

  const settings = await getSiteSettings(locale)
  const siteURL = settings.canonicalOrigin || getSiteURL()
  const nonce = (await headers()).get("x-nonce") ?? undefined

  return (
    <html
      lang={locale}
      className={cn(
        "font-sans antialiased",
        notoSans.variable,
        notoSerif.variable
      )}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-3 focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          {skipToContentLabels[locale]}
        </a>
        <StructuredData
          nonce={nonce}
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PURITY Fashion Studio",
              url: siteURL,
              email: settings.contacts.email,
              telephone: settings.contacts.phone,
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "PURITY Fashion Studio",
              url: siteURL,
              inLanguage: locales,
            },
          ]}
        />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Analytics nonce={nonce} />
      </body>
    </html>
  )
}
