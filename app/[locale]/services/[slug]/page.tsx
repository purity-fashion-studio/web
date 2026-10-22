import type { Metadata } from "next"
import { EditorialSections } from "@/components/editorial-sections"

import { notFound } from "next/navigation"

import { EditorialFaq, EditorialHero, FeatureList } from "@/components/purity"

import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatOfferPrice, type OfferPriceLabels } from "@/content/commerce"
import { getLocalizedMetadata } from "@/content/metadata"
import {
  getServiceBySlug,
  getSiteSettings,
  type ServicePageData,
} from "@/content/public-api"
import { servicePath } from "@/content/routes"
import { BookingStartCta } from "@/features/booking/booking-start-cta"
import { ProductCartControls } from "@/features/cart/product-cart-controls"
import { defaultOfferFormat } from "@/features/booking/offer-eligibility"
import { hasLocale, localizePath, type Locale } from "@/i18n/routing"

const faqTitles = {
  uk: "Поширені запитання",
  ru: "Частые вопросы",
  en: "FAQ",
} as const

type ServicePageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const service = await getServiceBySlug(rawLocale, slug)

  if (!service) {
    return {}
  }

  return await getLocalizedMetadata({
    locale: rawLocale,
    path: servicePath(service.routeSegment),
    title: service.seo.title,
    description: service.seo.description,
    image: service.seo.image,
  })
}

function ServiceDetailPage({
  locale,
  service,
  pricingLabels,
}: {
  locale: Locale
  service: ServicePageData
  pricingLabels: OfferPriceLabels
}) {
  const currentPath = servicePath(service.routeSegment)
  const bookingHref = localizePath(
    locale,
    `/booking?service=${service.routeSegment}`
  )

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath={currentPath} />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={service.eyebrow}
          title={service.title}
          summary={service.summary}
          mediaAsset={service.mediaAsset}
          composition="cinematic"
        >
          <ol className="grid border-t border-border">
            {service.outcomes.map((outcome, index) => (
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
          <div className="flex max-w-full flex-wrap gap-3">
            <BookingStartCta
              href={bookingHref}
              label={service.cta.label}
              serviceSlug={service.slug}
              variant="secondary"
            />
            <ProductCartControls
              locale={locale}
              selection={{
                kind: "service",
                slug: service.slug,
                format: "studio",
                currency: "EUR",
              }}
            />
          </div>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto grid max-w-6xl min-w-0 gap-10 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div className="min-w-0">
              <p className="mb-4 text-xs tracking-normal text-muted-foreground uppercase">
                {service.formatsTitle}
              </p>
              <h2 className="text-3xl leading-tight font-medium text-balance md:text-6xl">
                {service.formatsTitle}
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {service.intro}
              </p>
            </div>
            <div className="grid min-w-0 auto-rows-fr grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {service.formats.map((format) => (
                <Card
                  key={format.title}
                  size="sm"
                  className="h-full border-border bg-background"
                >
                  <CardHeader>
                    <CardTitle className="min-w-0 break-words">
                      {format.title}
                    </CardTitle>
                    <CardDescription className="min-w-0 break-words">
                      {format.text}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <h2 className="mb-8 text-3xl leading-tight font-medium md:text-5xl">
            {service.processTitle}
          </h2>
          <div className="grid min-w-0 auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <Card
                key={step.title}
                size="sm"
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
          <div className="mx-auto grid max-w-6xl min-w-0 gap-4 px-6 py-16 md:px-10">
            <div className="grid min-w-0 auto-rows-fr gap-4 md:grid-cols-2">
              <Card className="h-full min-w-0 border-primary-foreground/20 bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="min-w-0 break-words">
                    {service.outcomeTitle}
                  </CardTitle>
                  <CardDescription className="text-secondary">
                    {service.outcomeSummary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="border-t border-primary-foreground/20 pt-5">
                  <FeatureList
                    items={service.outcomes}
                    className="text-primary-foreground/80"
                  />
                </CardContent>
              </Card>
              <Card className="h-full min-w-0 border-border bg-background">
                <CardHeader>
                  <CardTitle className="min-w-0 break-words">
                    {service.commercialTitle}
                  </CardTitle>
                  <CardDescription className="min-w-0 break-words">
                    {service.commercialStatus}
                  </CardDescription>
                </CardHeader>
                <CardContent className="border-t border-border pt-5 text-sm leading-7 text-muted-foreground">
                  {service.priceNote}
                </CardContent>
              </Card>
            </div>
            {service.offers.length > 0 && (
              <div className="grid min-w-0 auto-rows-fr gap-4 md:grid-cols-2">
                {service.offers.map((offer) => (
                  <Card
                    key={offer.id}
                    className="h-full min-w-0 border-border bg-background"
                  >
                    <CardHeader>
                      <CardTitle className="min-w-0 break-words">
                        {offer.title}
                      </CardTitle>
                      <CardDescription>
                        {offer.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 border-t border-border pt-5">
                      <p className="text-2xl font-medium">
                        {formatOfferPrice(offer, locale, pricingLabels)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {offer.format} · {offer.checkoutMode} ·{" "}
                        {offer.commercialStatus}
                      </p>
                      <BookingStartCta
                        href={localizePath(
                          locale,
                          `/booking?service=${service.routeSegment}&offer=${offer.id}&format=${defaultOfferFormat(offer)}`
                        )}
                        label={service.cta.label}
                        serviceSlug={service.slug}
                      />
                      <ProductCartControls
                        locale={locale}
                        selection={{
                          kind: "service",
                          slug: service.slug,
                          offerId: offer.id,
                          format: defaultOfferFormat(offer),
                          currency: "EUR",
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <Card className="min-w-0 border-border bg-background">
            <CardHeader>
              <CardTitle className="min-w-0 break-words">
                {service.nextStepTitle}
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl">
                {service.nextStepSummary}
              </CardDescription>
            </CardHeader>
            {(service.timingNote || service.qualification) && (
              <CardContent className="grid gap-3 border-t border-border pt-5 text-sm leading-7 text-muted-foreground">
                {service.timingNote && <p>{service.timingNote}</p>}
                {service.qualification && <p>{service.qualification}</p>}
              </CardContent>
            )}
          </Card>
        </section>
        {service.faq.length > 0 && (
          <EditorialFaq
            title={faqTitles[locale]}
            items={service.faq.map(
              (item) => [item.question, item.answer] as const
            )}
          />
        )}
        <EditorialSections blocks={service.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  )
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const [service, settings] = await Promise.all([
    getServiceBySlug(locale, slug),
    getSiteSettings(locale),
  ])

  if (!service) {
    notFound()
  }

  return (
    <ServiceDetailPage
      locale={locale}
      service={service}
      pricingLabels={settings.booking.pricing}
    />
  )
}
