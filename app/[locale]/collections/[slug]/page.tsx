import type { Metadata } from "next"
import { EditorialSections } from "@/components/editorial-sections"
import Link from "next/link"
import { notFound } from "next/navigation"

import { EditorialHero, FeatureList, ImageFrame } from "@/components/purity"
import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { getLocalizedMetadata } from "@/content/metadata"
import type { OfferPriceLabels } from "@/content/commerce"
import {
  getFashionCollectionBySlug,
  getSiteSettings,
  type FashionCollectionPageData,
} from "@/content/public-api"
import { collectionPath } from "@/content/routes"
import { BookingStartCta } from "@/features/booking/booking-start-cta"
import { ProductCartControls } from "@/features/cart/product-cart-controls"
import { ProductOfferSelection } from "@/features/cart/product-offer-selection"
import { hasLocale, localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type CollectionPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const collection = await getFashionCollectionBySlug(rawLocale, slug)

  if (!collection) {
    return {}
  }

  return await getLocalizedMetadata({
    locale: rawLocale,
    path: collectionPath(collection.routeSegment),
    title: collection.seo.title,
    description: collection.seo.description,
    image: collection.seo.image,
  })
}

function CollectionDetailPage({
  locale,
  collection,
  pricingLabels,
}: {
  locale: Locale
  collection: FashionCollectionPageData
  pricingLabels: OfferPriceLabels
}) {
  const currentPath = collectionPath(collection.routeSegment)
  const mediaAsset = collection.mediaAssets[0]
  const storyAssets = collection.mediaAssets.slice(1)
  const bookingHref = localizePath(
    locale,
    `/booking?service=capsule-collection&collection=${collection.slug}`
  )

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath={currentPath} />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={collection.eyebrow}
          title={collection.title}
          summary={collection.summary}
          mediaAsset={mediaAsset}
          composition="cinematic"
        >
          <p className="border-y border-border py-4 text-sm leading-7 text-muted-foreground">
            {collection.materials.join(" · ")}
          </p>
          <div className="flex max-w-full flex-wrap gap-3">
            <BookingStartCta
              href={bookingHref}
              label={collection.cta.label}
              serviceSlug="capsule-collection"
              variant="secondary"
            />
            <ProductCartControls
              locale={locale}
              selection={{
                kind: "collection",
                slug: collection.slug,
                format: "studio",
                currency: "EUR",
              }}
            />
            <Link
              href={localizePath(locale, "/services/capsule-collection")}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-auto min-h-11 max-w-full whitespace-normal",
                })
              )}
            >
              {collection.serviceLabel}
            </Link>
          </div>
        </EditorialHero>

        {storyAssets.length > 0 && (
          <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
            <div className="mb-8 grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-start">
              <h2 className="text-3xl leading-tight font-medium md:text-5xl">
                {collection.stylingTitle}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {collection.narrative}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {storyAssets.map((asset) => (
                <ImageFrame
                  key={asset.id}
                  alt={asset.alt[locale]}
                  src={asset.src}
                  label={collection.stylingTitle}
                  ratio={4 / 3}
                />
              ))}
            </div>
          </section>
        )}

        <section className="bg-muted">
          <div className="mx-auto grid max-w-6xl min-w-0 gap-10 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <p className="mb-4 text-xs tracking-normal text-muted-foreground uppercase">
                {collection.stylingTitle}
              </p>
              <h2 className="text-3xl leading-tight font-medium text-balance md:text-6xl">
                {collection.stylingTitle}
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {collection.narrative}
              </p>
            </div>
            <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {collection.styling.map((item) => (
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
            {collection.factsTitle}
          </h2>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-3">
            {collection.facts.map((fact) => (
              <Card
                key={fact.title}
                className="h-full border-border bg-background"
              >
                <CardHeader>
                  <CardTitle className="min-w-0 break-words">
                    {fact.title}
                  </CardTitle>
                  <CardDescription className="min-w-0 break-words">
                    {fact.text}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <h2 className="mb-8 text-3xl leading-tight font-medium md:text-5xl">
            {collection.inquiryTitle}
          </h2>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {collection.inquirySteps.map((step, index) => (
              <Card
                key={step.title}
                className="h-full border-border bg-background"
              >
                <CardHeader>
                  <p className="mb-4 text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
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

        <section className="bg-muted">
          <div className="mx-auto grid max-w-6xl min-w-0 auto-rows-fr gap-4 px-6 py-16 md:grid-cols-2 md:px-10">
            <Card className="h-full min-w-0 border-primary-foreground/20 bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="min-w-0 break-words">
                  {collection.materialsTitle}
                </CardTitle>
                <CardDescription className="text-secondary">
                  {collection.narrative}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-primary-foreground/20 pt-5">
                <FeatureList
                  items={collection.materials}
                  className="text-primary-foreground/80"
                />
              </CardContent>
            </Card>
            <Card className="h-full min-w-0 border-border bg-background">
              <CardHeader>
                <CardTitle className="min-w-0 break-words">
                  {collection.availabilityTitle}
                </CardTitle>
                <CardDescription className="min-w-0 break-words">
                  {collection.availability}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-border pt-5 text-sm leading-7 text-muted-foreground">
                {collection.offers.length ? (
                  <div className="grid gap-6">
                    {collection.offers.map((offer) => (
                      <ProductOfferSelection
                        key={offer.id}
                        kind="collection"
                        slug={collection.slug}
                        offer={offer}
                        locale={locale}
                        priceLabels={pricingLabels}
                      />
                    ))}
                  </div>
                ) : (
                  collection.narrative
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <Card className="min-w-0 border-border bg-background">
            <CardHeader>
              <CardTitle className="min-w-0 break-words">
                {collection.ctaTitle}
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl">
                {collection.ctaSummary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingStartCta
                href={bookingHref}
                label={collection.cta.label}
                serviceSlug="capsule-collection"
              />
            </CardContent>
          </Card>
        </section>
        <EditorialSections
          blocks={collection.editorialBlocks}
          locale={locale}
        />
      </main>
      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  )
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const [collection, settings] = await Promise.all([
    getFashionCollectionBySlug(locale, slug),
    getSiteSettings(locale),
  ])

  if (!collection) {
    notFound()
  }

  return (
    <CollectionDetailPage
      locale={locale}
      collection={collection}
      pricingLabels={settings.booking.pricing}
    />
  )
}
