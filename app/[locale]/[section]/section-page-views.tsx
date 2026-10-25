import Link from "next/link"
import { commerceLabel } from "@/content/commerce"
import { EditorialSections } from "@/components/editorial-sections"

import {
  EditorialFaq,
  EditorialHero,
  FeatureList,
  ImageFrame,
} from "@/components/purity"
import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { MediaAsset } from "@/content/media"
import type { DirectionPageData, PublicPageData } from "@/content/public-api"
import { collectionPath, sectionPath } from "@/content/routes"
import { localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type {
  CategoryPagePresentation,
  CategoryPresentation,
  CollectionCardView,
  PublicPagePresentation,
} from "./_types"

function SectionActionCard({
  title,
  summary,
  label,
  href,
}: {
  title: string
  summary: string
  label: string
  href: string
}) {
  return (
    <Card className="min-h-64 min-w-0 border-border bg-background">
      <CardHeader className="flex flex-1 flex-col gap-8 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:grid-rows-[1fr_auto]">
        <div className="grid content-start gap-3 md:col-start-1 md:row-start-1">
          <CardTitle className="min-w-0 break-words">{title}</CardTitle>
          <CardDescription className="max-w-3xl">{summary}</CardDescription>
        </div>
        <Link
          href={href}
          className={cn(
            buttonVariants({
              variant: "default",
              size: "lg",
              className:
                "mt-auto h-auto min-h-11 w-full max-w-full whitespace-normal md:col-start-2 md:row-start-2 md:w-fit md:justify-self-end",
            })
          )}
        >
          {label}
        </Link>
      </CardHeader>
    </Card>
  )
}

export function StudioPageView({
  locale,
  publicPage,
  pageData,
  privateServices,
  corporateServices,
  directions,
  mediaAsset: mediaAssetOverride,
}: {
  locale: Locale
  publicPage: PublicPagePresentation
  pageData: PublicPageData
  privateServices: Array<{ title: string; summary: string }>
  corporateServices: Array<{ title: string; summary: string }>
  directions: DirectionPageData[]
  mediaAsset?: MediaAsset
}) {
  const mediaAsset = mediaAssetOverride
  const signalCards = pageData.studioSignals

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath="/studio" />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={publicPage.eyebrow}
          title={publicPage.title}
          summary={publicPage.summary}
          mediaAsset={mediaAsset}
          composition="cinematic"
          titleClassName="max-w-none"
        >
          <dl className="grid grid-cols-3 border-y border-border py-5">
            {signalCards.map((signal) => (
              <div key={signal.label} className="grid content-start gap-2 pr-4">
                <dt className="text-xs text-muted-foreground">
                  {signal.label}
                </dt>
                <dd className="text-lg font-medium">{signal.value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={localizePath(locale, "/booking")}
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "w-fit max-w-full",
              })
            )}
          >
            {publicPage.cta?.label ?? pageData.title}
          </Link>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto grid max-w-6xl min-w-0 gap-10 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <p className="mb-4 text-xs tracking-normal text-muted-foreground uppercase">
                {pageData.methodEyebrow}
              </p>
              <h2 className="text-[clamp(2rem,9vw,3.75rem)] leading-tight font-medium text-balance">
                {pageData.methodTitle}
              </h2>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                {publicPage.body.map((item) => (
                  <Card
                    key={item}
                    size="sm"
                    className="border-border bg-background"
                  >
                    <CardContent className="text-sm leading-7 text-muted-foreground">
                      {item}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pageData.methodSteps.map((step) => (
                  <Card
                    key={step.title}
                    size="sm"
                    className="border-border bg-background"
                  >
                    <CardHeader>
                      <CardTitle className="min-w-0 break-words">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="min-w-0 break-words">
                        {step.text}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <div className="mb-8 grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-start">
            <h2 className="text-3xl leading-tight font-medium md:text-5xl">
              {pageData.clientsTitle}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground md:self-center">
              {pageData.clientsSummary}
            </p>
          </div>
          <div className="grid min-w-0 auto-rows-fr gap-4 md:grid-cols-2">
            <Card className="min-w-0 border-border bg-background">
              <CardHeader>
                <CardTitle className="min-w-0 break-words">
                  {pageData.privateTitle}
                </CardTitle>
                <CardDescription className="min-w-0 break-words">
                  {privateServices
                    .slice(0, 2)
                    .map((service) => service.summary)
                    .join(" ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-border pt-5">
                <FeatureList
                  items={privateServices
                    .slice(0, 4)
                    .map((service) => service.title)}
                />
              </CardContent>
            </Card>
            <Card className="min-w-0 border-primary-foreground/20 bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="min-w-0 break-words">
                  {pageData.corporateTitle}
                </CardTitle>
                <CardDescription className="text-secondary">
                  {corporateServices[0]?.summary ?? pageData.clientsSummary}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-primary-foreground/20 pt-5">
                <FeatureList
                  items={
                    corporateServices.map((service) => service.title).length
                      ? corporateServices.map((service) => service.title)
                      : [pageData.corporateTitle ?? pageData.title]
                  }
                  className="text-primary-foreground/80"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-muted">
          <div className="mx-auto max-w-6xl min-w-0 px-6 py-16 md:px-10">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="text-3xl leading-tight font-medium md:text-5xl">
                {pageData.directionsTitle}
              </h2>
              <Link
                href={localizePath(locale, "/booking")}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" })
                )}
              >
                {publicPage.cta?.label ?? pageData.title}
              </Link>
            </div>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {directions.map((category) => (
                <Link
                  key={category.slug}
                  href={localizePath(
                    locale,
                    sectionPath(category.routeSegment)
                  )}
                  className="block h-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <Card
                    size="sm"
                    className="h-full border-border bg-background"
                  >
                    <CardHeader>
                      <CardTitle className="min-w-0 break-words">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="min-w-0 break-words">
                        {category.summary}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <SectionActionCard
            title={pageData.ctaTitle ?? pageData.title}
            summary={pageData.ctaSummary ?? pageData.summary}
            label={publicPage.cta?.label ?? pageData.title}
            href={localizePath(locale, publicPage.cta?.path ?? "/booking")}
          />
        </section>
        <EditorialSections blocks={pageData.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter locale={locale} currentPath="/studio" />
    </div>
  )
}

export function LegalPageView({
  locale,
  publicPage,
  pageData,
}: {
  locale: Locale
  publicPage: PublicPagePresentation
  pageData: PublicPageData
}) {
  const currentPath = sectionPath(publicPage.routeSegment)
  const sectionTitles = pageData.sections.map((section) => section.heading)
  const effectiveDate = pageData.effectiveDate
    ? `${pageData.effectiveDateLabel ?? pageData.legalVersion ?? ""}: ${new Intl.DateTimeFormat(
        locale === "uk" ? "uk-UA" : locale,
        { dateStyle: "long" }
      ).format(new Date(pageData.effectiveDate))}`
    : pageData.legalVersion

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath={currentPath} />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={publicPage.eyebrow}
          title={publicPage.title}
          summary={publicPage.summary}
          mediaAsset={pageData.mediaAsset}
          composition="quiet"
        >
          <p className="text-xs tracking-widest text-background/70 uppercase">
            {effectiveDate}
          </p>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto grid w-full max-w-4xl min-w-0 gap-12 px-6 py-16 md:px-10 md:py-24">
            <div>
              <h2 className="text-2xl font-medium md:text-3xl">
                {pageData.contentsTitle}
              </h2>
              <ol className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {sectionTitles.map((title, index) => (
                  <li key={title}>
                    <a
                      href={`#legal-section-${index + 1}`}
                      className="underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {String(index + 1).padStart(2, "0")} {title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid gap-12">
              {pageData.sections.map((section, index) => (
                <article
                  key={`${section.heading}-${index}`}
                  id={`legal-section-${index + 1}`}
                  className="grid scroll-mt-24 gap-4"
                >
                  <p className="text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-3xl font-medium text-pretty md:text-4xl">
                    {sectionTitles[index] ?? pageData.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-foreground px-6 py-14 text-background md:px-10 md:py-20">
          <div className="mx-auto max-w-4xl md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8">
            <div>
              <h2 className="text-3xl font-medium text-pretty">
                {publicPage.cta?.label}
              </h2>
              <p className="mt-3 text-sm leading-7 text-background/70">
                {publicPage.summary}
              </p>
            </div>
            {publicPage.cta && (
              <Link
                href={localizePath(locale, publicPage.cta.path)}
                className={cn(
                  buttonVariants({
                    variant: "secondary",
                    size: "lg",
                  })
                )}
              >
                {publicPage.cta.label}
              </Link>
            )}
          </div>
        </section>
        <EditorialSections blocks={pageData.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  )
}

export function CollectionsPageView({
  locale,
  category,
  collections,
  direction,
}: {
  locale: Locale
  category: CategoryPresentation
  collections: CollectionCardView[]
  direction: DirectionPageData
}) {
  const heroMedia = collections[0]?.mediaAsset
  const inquiryHref = localizePath(
    locale,
    "/booking?service=capsule-collection"
  )

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader
        locale={locale}
        currentPath={sectionPath(category.routeSegment)}
      />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={category.title}
          title={category.title}
          summary={direction.narrative}
          mediaAsset={heroMedia}
          composition="editorial"
        >
          <dl className="grid grid-cols-3 border-y border-border py-5">
            {[
              [collections.length, direction.countLabel ?? ""],
              [
                direction.availabilityValue ?? "",
                direction.availabilityLabel ?? "",
              ],
              [direction.fittingValue ?? "", direction.fittingLabel ?? ""],
            ].map(([value, label]) => (
              <div key={label} className="grid gap-2 pr-4">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-lg font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={inquiryHref}
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "w-fit max-w-full",
              })
            )}
          >
            {direction.ctaLabel}
          </Link>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
            <div className="mb-8 grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-start">
              <h2 className="text-4xl leading-tight font-medium text-balance md:text-6xl">
                {direction.catalogueTitle}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {direction.catalogueSummary}
              </p>
            </div>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => {
                const mediaAsset = collection.mediaAsset

                return (
                  <Link
                    key={collection.routeSegment}
                    href={localizePath(
                      locale,
                      collectionPath(collection.routeSegment)
                    )}
                    className="block h-full min-w-0 text-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <Card className="h-full min-w-0 overflow-hidden border-border bg-background pt-0">
                      <ImageFrame
                        alt={mediaAsset?.alt[locale] ?? collection.title}
                        src={mediaAsset?.src}
                        className="border-x-0 border-t-0"
                      />
                      <CardHeader className="flex-1">
                        <CardTitle className="min-w-0 break-words">
                          {collection.title}
                        </CardTitle>
                        <CardDescription className="min-w-0 break-words">
                          {collection.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto grid gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                        <p className="text-muted-foreground uppercase">
                          {direction.materialsLabel}
                        </p>
                        <p>{collection.materials.join(" · ")}</p>
                        <p>
                          {commerceLabel(
                            locale,
                            "status",
                            collection.commercialStatus
                          )}
                        </p>
                        <p>{collection.priceNote}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <div className="mb-8 grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-start">
            <h2 className="text-3xl leading-tight font-medium md:text-5xl">
              {direction.inquiryTitle}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {direction.ctaSummary}
            </p>
          </div>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {direction.inquirySteps.map((step) => (
              <Card
                key={step.title}
                size="sm"
                className="h-full border-border bg-background"
              >
                <CardHeader>
                  <CardTitle className="min-w-0 break-words">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="min-w-0 break-words">
                    {step.text}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-14 md:px-10">
          <SectionActionCard
            title={direction.ctaTitle}
            summary={direction.ctaSummary}
            label={direction.ctaLabel}
            href={inquiryHref}
          />
        </section>
        <EditorialSections blocks={direction.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter
        locale={locale}
        currentPath={sectionPath(category.routeSegment)}
      />
    </div>
  )
}

export function OfferCategoryPageView({
  locale,
  category,
  entries,
  mediaAsset,
  copy,
  ctaLabel,
}: {
  locale: Locale
  category: CategoryPresentation
  entries: Array<{
    href: string
    title: string
    summary: string
    status: string
    priceNote: string
  }>
  mediaAsset?: MediaAsset
  copy: CategoryPagePresentation
  ctaLabel: string
}) {
  const relatedEntries = entries
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader
        locale={locale}
        currentPath={sectionPath(category.routeSegment)}
      />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={category.title}
          title={category.title}
          summary={copy.heroNote}
          mediaAsset={mediaAsset}
          composition={category.slug === "atelier" ? "editorial" : "cinematic"}
        >
          <ol className="grid border-t border-border">
            {copy.outcomes.map((outcome, index) => (
              <li
                key={outcome}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-border py-3 text-sm"
              >
                <span className="text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {outcome}
              </li>
            ))}
          </ol>
          <Link
            href={localizePath(locale, `/booking?service=${copy.ctaService}`)}
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "w-fit max-w-full",
              })
            )}
          >
            {ctaLabel}
          </Link>
          {copy.diagnosticLabel && (
            <p className="text-xs leading-5 text-muted-foreground">
              {copy.diagnosticLabel}
            </p>
          )}
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto grid max-w-6xl min-w-0 gap-10 px-6 py-16 md:px-10 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)]">
            <div className="min-w-0">
              <p className="mb-4 text-xs tracking-normal text-muted-foreground uppercase">
                {copy.processTitle}
              </p>
              <h2 className="max-w-[13ch] text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] font-medium text-pretty">
                {copy.processTitle}
              </h2>
            </div>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
              <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {copy.processSteps.map((step) => (
                  <Card
                    key={step.title}
                    size="sm"
                    className="border-border bg-background"
                  >
                    <CardHeader>
                      <CardTitle className="min-w-0 break-words">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="min-w-0 break-words">
                        {step.text}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="min-w-0 border-border bg-background">
                  <CardHeader>
                    <CardTitle className="min-w-0 break-words">
                      {copy.formatsTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="border-t border-border pt-5">
                    <FeatureList items={copy.formats} />
                  </CardContent>
                </Card>
                <Card className="min-w-0 border-primary-foreground/20 bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="min-w-0 break-words">
                      {copy.outcomesTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="border-t border-primary-foreground/20 pt-5">
                    <FeatureList
                      items={copy.outcomes}
                      className="text-primary-foreground/80"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {copy.faq && copy.faqTitle && (
          <EditorialFaq
            title={copy.faqTitle}
            items={copy.faq.map(
              (item) => [item.question, item.answer] as const
            )}
            className="bg-muted"
          />
        )}

        <section className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
          <div className="mb-8 grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-start">
            <h2 className="text-3xl leading-tight font-medium md:text-5xl">
              {category.title}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {category.summary}
            </p>
          </div>
          <div className="grid min-w-0 auto-rows-fr gap-4 md:grid-cols-2">
            {relatedEntries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className={cn(
                  "block h-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  relatedEntries.length === 1 &&
                    "mx-auto w-full max-w-xl md:col-span-2"
                )}
              >
                <Card className="h-full min-w-0 border-border bg-background">
                  <CardHeader className="flex-1">
                    <CardTitle className="min-w-0 break-words">
                      {entry.title}
                    </CardTitle>
                    <CardDescription className="min-w-0 break-words">
                      {entry.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto grid gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                    <p>{entry.status}</p>
                    <p>{entry.priceNote}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <SectionActionCard
            title={copy.ctaTitle}
            summary={copy.ctaSummary}
            label={ctaLabel}
            href={localizePath(locale, `/booking?service=${copy.ctaService}`)}
          />
        </section>
        <EditorialSections blocks={copy.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter
        locale={locale}
        currentPath={sectionPath(category.routeSegment)}
      />
    </div>
  )
}
