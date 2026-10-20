import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { EditorialHero } from "@/components/purity"
import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { getLocalizedMetadata } from "@/content/metadata"
import { getPageBySlug, getPublishedPortfolioCases } from "@/content/public-api"
import { portfolioCasePath } from "@/content/routes"
import { hasLocale, localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type PortfolioPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const page = await getPageBySlug(rawLocale, "portfolio")
  if (!page) return {}

  return await getLocalizedMetadata({
    locale: rawLocale,
    path: "/portfolio",
    title: page.seo.title,
    description: page.seo.description,
  })
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const [page, portfolioCases] = await Promise.all([
    getPageBySlug(locale, "portfolio"),
    getPublishedPortfolioCases(locale),
  ])
  if (!page) notFound()
  const mediaAsset = page.mediaAsset ?? portfolioCases[0]?.mediaAssets[0]

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath="/portfolio" />

      <main>
        <EditorialHero
          locale={locale}
          eyebrow={page.eyebrow ?? page.title}
          title={page.title}
          summary={page.summary}
          mediaAsset={mediaAsset}
          composition="editorial"
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizePath(locale, "/contacts")}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" })
              )}
            >
              {page.cta?.label ?? page.title}
            </Link>
            <Link
              href={localizePath(locale, "/booking")}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {page.secondaryCTALabel ?? page.title}
            </Link>
          </div>
          <p
            className="text-xs tracking-[0.12em] text-background/70 uppercase"
            data-testid="portfolio-editorial-label"
          >
            {page.heroMediaLabel}
          </p>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto max-w-6xl min-w-0 px-6 py-14 md:px-10">
            {portfolioCases.length === 0 ? (
              <Empty data-testid="portfolio-empty-state">
                <EmptyHeader>
                  <Badge variant="outline">{page.emptyEyebrow}</Badge>
                  <EmptyTitle>{page.emptyTitle}</EmptyTitle>
                  <EmptyDescription>{page.emptySummary}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    href={localizePath(locale, "/contacts")}
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" })
                    )}
                  >
                    {page.emptyAction}
                  </Link>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
                {portfolioCases.map((portfolioCase) => (
                  <Card
                    key={portfolioCase.id}
                    className="h-full min-w-0 border-border bg-background"
                  >
                    <CardHeader>
                      <Badge variant="outline" className="w-fit">
                        {portfolioCase.clientType}
                      </Badge>
                      <CardTitle>{portfolioCase.title}</CardTitle>
                      <CardDescription>{portfolioCase.summary}</CardDescription>
                      <Link
                        href={localizePath(
                          locale,
                          portfolioCasePath(portfolioCase.routeSegment)
                        )}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" })
                        )}
                      >
                        {portfolioCase.title}
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-muted">
          <div className="mx-auto max-w-6xl min-w-0 px-6 py-16 md:px-10">
            <h2 className="mb-8 text-3xl leading-tight font-medium md:text-5xl">
              {page.standardsTitle}
            </h2>
            <div className="grid auto-rows-fr gap-3 md:grid-cols-3">
              {page.standards.map((item) => (
                <Card
                  key={item.title}
                  className="h-full border-border bg-background"
                >
                  <CardHeader>
                    <CardTitle className="min-w-0 break-words">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="min-w-0 break-words">
                      {item.text}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl min-w-0 gap-8 px-6 py-14 md:grid-cols-[0.8fr_1.2fr] md:px-10">
          <div className="min-w-0">
            <h2 className="text-3xl leading-tight font-medium md:text-5xl">
              {page.recordTitle}
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {page.recordSummary}
            </p>
          </div>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
            {page.recordItems.map((item, index) => (
              <Card
                key={item}
                className="h-full min-w-0 border-border bg-background"
              >
                <CardHeader>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <CardTitle className="min-w-0 break-words">{item}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted">
          <div className="mx-auto max-w-6xl min-w-0 px-6 py-16 md:px-10">
            <h2 className="mb-8 text-3xl leading-tight font-medium md:text-5xl">
              {page.currentTitle}
            </h2>
            <div className="grid auto-rows-fr gap-3 md:grid-cols-3">
              {page.currentItems.map((item) => (
                <Card
                  key={item.title}
                  className="h-full border-border bg-background"
                >
                  <CardHeader>
                    <CardTitle className="min-w-0 break-words">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="min-w-0 break-words">
                      {item.text}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <h2 className="mb-8 text-3xl leading-tight font-medium md:text-5xl">
            {page.flowTitle}
          </h2>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {page.flowItems.map((item, index) => (
              <Card
                key={item}
                className="h-full min-w-0 border-border bg-background"
              >
                <CardHeader>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <CardTitle className="min-w-0 break-words">{item}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-6xl min-w-0 gap-6 px-6 py-14 md:grid-cols-[1fr_auto] md:items-end md:px-10">
            <div>
              <h2 className="text-3xl leading-tight font-medium md:text-5xl">
                {page.ctaTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
                {page.ctaSummary}
              </p>
            </div>
            <Link
              href={localizePath(locale, "/contacts")}
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "lg",
                })
              )}
            >
              {page.cta?.label ?? page.title}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} currentPath="/portfolio" />
    </div>
  )
}
