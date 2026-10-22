import type { Metadata } from "next"
import { EditorialSections } from "@/components/editorial-sections"
import { notFound } from "next/navigation"

import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { getLocalizedMetadata } from "@/content/metadata"
import {
  getPageBySlug,
  getPublishedServices,
  getSiteSettings,
} from "@/content/public-api"
import { EditorialHero } from "@/components/purity"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookingForm } from "@/features/booking/booking-form"
import { resolveCart } from "@/features/cart/actions"
import { cartSelectionSchema } from "@/features/cart/selection"
import { getInterfaceCopy } from "@/i18n/messages"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { hasLocale, type Locale } from "@/i18n/routing"

type BookingPageProps = {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{
    service?: string | string[]
    offer?: string | string[]
    course?: string | string[]
    collection?: string | string[]
    format?: string | string[]
    currency?: string | string[]
    intent?: string | string[]
  }>
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const page = await getPageBySlug(rawLocale, "booking")

  if (!page) {
    return {}
  }

  return {
    ...(await getLocalizedMetadata({
      locale: rawLocale,
      path: "/booking",
      title: page.seo.title,
      description: page.seo.description,
      image: page.seo.image,
    })),
    robots: { index: false, follow: false },
  }
}

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const [page, settings] = await Promise.all([
    getPageBySlug(locale, "booking"),
    getSiteSettings(locale),
  ])

  if (!page) {
    notFound()
  }

  const query = await searchParams
  const requestedServiceParam =
    typeof query?.service === "string" ? query.service : undefined
  const requestedOfferId =
    typeof query?.offer === "string" ? query.offer : undefined
  const courseSlug =
    typeof query?.course === "string" ? query.course : undefined
  const collectionSlug =
    typeof query?.collection === "string" ? query.collection : undefined
  const requestedFormat =
    typeof query?.format === "string" ? query.format : "studio"
  const requestedCurrency =
    typeof query?.currency === "string" ? query.currency : "EUR"
  const targetService =
    requestedServiceParam ??
    (courseSlug
      ? "wardrobe-management"
      : collectionSlug
        ? "capsule-collection"
        : undefined)
  const visibleServices = await getPublishedServices(locale)
  const requestedService = visibleServices.find(
    (service) =>
      service.slug === targetService || service.routeSegment === targetService
  )
  const serviceOptions = visibleServices.map((service) => ({
    slug: service.slug,
    title: service.title,
  }))
  const initialServiceSlug = requestedService?.slug ?? serviceOptions[0]?.slug
  const explicitSelection = Boolean(
    requestedOfferId ||
    courseSlug ||
    collectionSlug ||
    query?.format ||
    query?.currency
  )
  const parsedSelection = cartSelectionSchema.safeParse({
    kind: courseSlug ? "course" : collectionSlug ? "collection" : "service",
    slug: courseSlug ?? collectionSlug ?? initialServiceSlug,
    offerId: requestedOfferId,
    format: requestedFormat,
    currency: requestedCurrency,
  })
  const selection =
    explicitSelection &&
    parsedSelection.success &&
    !(courseSlug && collectionSlug)
      ? (await resolveCart(locale, [parsedSelection.data]))[0]
      : undefined
  const selectionUnavailable =
    (explicitSelection && !selection?.available) ||
    (Boolean(targetService) && !requestedService)
  const currentQuery = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (
      [
        "service",
        "offer",
        "course",
        "collection",
        "format",
        "currency",
        "intent",
      ].includes(key) &&
      typeof value === "string"
    )
      currentQuery.set(key, value)
  }
  const currentPath = currentQuery.size
    ? `/booking?${currentQuery}`
    : "/booking"
  const mediaAsset = page.mediaAsset
  const body = page.sections.length
    ? page.sections.map((section) => section.body)
    : page.body.split(/\n\n+/).filter(Boolean)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath={currentPath} />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={page.eyebrow ?? page.title}
          title={page.title}
          summary={page.summary}
          mediaAsset={mediaAsset}
          composition="cinematic"
        >
          <ol className="grid max-w-3xl gap-8 border-t border-background/25 pt-6 sm:grid-cols-2 sm:gap-10">
            {body.map((item, index) => (
              <li
                key={item}
                className="grid min-w-0 gap-3 sm:grid-cols-[3rem_minmax(0,1fr)]"
              >
                <span className="font-heading text-3xl leading-none text-background/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-7 text-background/75">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto w-full max-w-screen-xl px-6 py-16 md:px-10 md:py-24">
            <Card className="bg-background shadow-sm">
              <CardHeader className="justify-items-center text-center">
                <CardTitle>{page.formTitle ?? page.title}</CardTitle>
                <CardDescription className="max-w-2xl">
                  {page.formSummary ?? page.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectionUnavailable ? (
                  <Alert>
                    <AlertDescription>
                      {
                        getInterfaceCopy(locale).BookingMessages
                          .selectionUnavailable
                      }
                    </AlertDescription>
                  </Alert>
                ) : (
                  <BookingForm
                    key={currentPath}
                    locale={locale}
                    services={serviceOptions}
                    initialServiceSlug={initialServiceSlug ?? ""}
                    initialOfferId={requestedOfferId}
                    initialCourseSlug={courseSlug}
                    initialCollectionSlug={collectionSlug}
                    initialFormat={
                      parsedSelection.success
                        ? parsedSelection.data.format
                        : undefined
                    }
                    initialCurrency={
                      parsedSelection.success
                        ? parsedSelection.data.currency
                        : undefined
                    }
                    initialIntent={
                      selection?.requiresQuote
                        ? "request"
                        : requestedOfferId
                          ? "checkout"
                          : "request"
                    }
                    selection={selection}
                    copy={settings.booking}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        <EditorialSections blocks={page.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  )
}
