import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContentPage } from "@/components/content-page"
import { getLocalizedMetadata } from "@/content/metadata"
import { getPortfolioCaseBySlug } from "@/content/public-api"
import { portfolioCasePath } from "@/content/routes"
import { hasLocale, type Locale } from "@/i18n/routing"

type PortfolioCasePageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: PortfolioCasePageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const portfolioCase = await getPortfolioCaseBySlug(rawLocale, slug)

  if (!portfolioCase) {
    return {}
  }

  return await getLocalizedMetadata({
    locale: rawLocale,
    path: portfolioCasePath(portfolioCase.routeSegment),
    title: portfolioCase.seo.title,
    description: portfolioCase.seo.description,
  })
}

export default async function PortfolioCasePage({
  params,
}: PortfolioCasePageProps) {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const portfolioCase = await getPortfolioCaseBySlug(locale, slug)

  if (!portfolioCase) {
    notFound()
  }

  return (
    <ContentPage
      locale={locale}
      currentPath={portfolioCasePath(portfolioCase.routeSegment)}
      eyebrow={portfolioCase.title}
      title={portfolioCase.title}
      summary={portfolioCase.summary}
      items={[
        portfolioCase.brief,
        portfolioCase.constraints,
        portfolioCase.research,
        portfolioCase.process,
        portfolioCase.result,
      ].filter(Boolean)}
      mediaAsset={portfolioCase.mediaAssets[0]}
    />
  )
}
