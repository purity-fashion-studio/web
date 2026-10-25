import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"
import { commerceLabel } from "@/content/commerce"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  BookingCTA,
  BrandLogo,
  EditorialFaq,
  ImageFrame,
} from "@/components/purity"
import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { buttonVariants } from "@/components/ui/button"
import { getHome, getHomeSelections, getPageBySlug } from "@/content/public-api"
import {
  collectionPath,
  coursePath,
  portfolioCasePath,
  servicePath,
} from "@/content/routes"
import { hasLocale, localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type HomePageProps = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const home = await getHome(locale)
  const [selections, cmsBooking] = await Promise.all([
    getHomeSelections(locale, home),
    getPageBySlug(locale, "booking"),
  ])
  const visibleServices = selections.services
  const visibleCourses = selections.courses
  const visibleCollections = selections.collections
  const heroImage = home.heroMedia
  const researchImage = home.sectionMedia.research
  const imagineImage = home.sectionMedia.imagine
  const createImage = home.sectionMedia.create
  const directionsTexture = home.sectionMedia.directions
  const studioImage = home.sectionMedia.studio
  const portfolioImage = home.sectionMedia.portfolio
  const atelierService = visibleServices.find(
    (service) => service.routeSegment === "atelier-service"
  )
  const atelierImage = atelierService?.mediaAsset
  const bookingPage = cmsBooking
    ? { title: cmsBooking.title, summary: cmsBooking.summary }
    : undefined
  const portfolioCase = selections.portfolio[0]
  const researchLabel = home.secondaryCTA.label
  const researchPath = home.secondaryCTA.path
  const studioLabel = home.studioEyebrow
  const studioDetails = home.methodDetails
  const filmSteps = home.method.slice(0, 3).map((item, index) => ({
    title: item.label,
    text: item.description,
    image: [researchImage, imagineImage, createImage][index],
  }))

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} />

      <main id="main-content" tabIndex={-1}>
        <section
          className="relative min-h-svh overflow-hidden bg-foreground text-background"
          data-testid="editorial-hero"
        >
          <figure className="absolute inset-0">
            {heroImage?.src && (
              <Image
                alt={heroImage.alt[locale]}
                src={heroImage.src}
                unoptimized
                fill
                priority
                sizes="100vw"
                className="object-cover object-[62%_center] md:object-center"
              />
            )}
          </figure>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-foreground/45"
          />
          <div className="relative mx-auto flex min-h-svh w-full max-w-screen-2xl items-end px-6 pt-32 pb-12 md:px-10 md:pb-16 lg:px-16 lg:pb-20">
            <div className="grid max-w-5xl gap-6">
              <p className="text-xs tracking-[0.18em] text-background/70 uppercase">
                {home.heroEyebrow}
              </p>
              <h1 className="max-w-[13ch] text-[clamp(3rem,8vw,7.5rem)] leading-[0.86] font-medium text-pretty">
                {home.heroTitle}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-background/75 md:text-base">
                {home.heroSummary}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={localizePath(locale, home.primaryCTA.path)}
                  className={cn(
                    buttonVariants({
                      variant: "secondary",
                      size: "lg",
                    })
                  )}
                >
                  {home.primaryCTA.label}
                </Link>
                <Link
                  href={localizePath(locale, home.secondaryCTA.path)}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "lg",
                    })
                  )}
                >
                  {home.secondaryCTA.label}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section data-editorial-sequence="home-method" className="w-full">
          {filmSteps.map((step, index) => (
            <article key={step.title} className="grid min-w-0 md:grid-cols-2">
              <ImageFrame
                alt={step.image?.alt[locale] ?? step.title}
                src={step.image?.src}
                ratio={3 / 2}
                eager={index === 0}
                className={cn("rounded-none", index % 2 === 1 && "md:order-2")}
              />
              <div
                className={cn(
                  "flex min-h-80 flex-col justify-center gap-5 px-6 py-12 md:px-12 lg:px-20",
                  index === 1 && "bg-muted"
                )}
              >
                <p className="text-xs text-muted-foreground">0{index + 1}</p>
                <h2 className="text-4xl leading-none font-medium text-pretty lg:text-6xl">
                  {step.title}
                </h2>
                <p className="max-w-lg text-sm leading-7 text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </article>
          ))}
        </section>

        <section
          aria-hidden="true"
          className="flex min-h-40 items-center justify-center bg-background px-6 py-10"
        >
          <BrandLogo
            locale={locale}
            variant="mark"
            decorative
            className="w-8 opacity-55"
          />
        </section>

        <section className="relative px-6 py-16 md:px-10 md:py-24">
          {directionsTexture?.src && (
            <Image
              alt=""
              src={directionsTexture.src}
              unoptimized
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-background/85"
          />
          <div className="relative mx-auto grid max-w-screen-2xl gap-12 lg:grid-cols-[0.65fr_1.35fr]">
            <div className="grid content-start gap-6 lg:sticky lg:top-32 lg:self-start">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {home.serviceRailTitle}
              </p>
              <h2 className="text-5xl leading-[0.94] font-medium text-balance md:text-7xl">
                {home.methodTitle}
              </h2>
              <p className="max-w-lg text-sm leading-7 text-muted-foreground">
                {home.serviceIntro}
              </p>
              <Link
                href={localizePath(locale, researchPath)}
                className={cn(
                  buttonVariants({
                    variant: "default",
                    size: "lg",
                    className: "w-fit max-w-full",
                  })
                )}
              >
                {researchLabel}
              </Link>
            </div>
            <nav aria-label={home.serviceRailTitle}>
              {visibleServices.map((service, index) => {
                return (
                  <Link
                    key={service.routeSegment}
                    href={localizePath(
                      locale,
                      servicePath(service.routeSegment)
                    )}
                    className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 border-t border-border py-7 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span className="text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                    <span className="grid min-w-0 gap-2">
                      <span className="font-heading text-3xl leading-none md:text-5xl">
                        {service.title}
                      </span>
                      <span className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
                        {service.categoryTitle}
                      </span>
                    </span>
                    <ArrowRightIcon
                      aria-hidden="true"
                      data-icon="inline-end"
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                )
              })}
            </nav>
          </div>
        </section>

        <section className="grid min-w-0 bg-foreground text-background lg:grid-cols-2">
          {studioImage?.src && (
            <ImageFrame
              alt={studioImage.alt[locale]}
              src={studioImage.src}
              ratio={3 / 2}
              className="lg:aspect-auto lg:min-h-[44rem]"
            />
          )}
          <div className="grid min-w-0 content-center gap-8 px-6 py-16 md:px-10 lg:px-16">
            <div className="grid content-start gap-6">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {home.methodEyebrow}
              </p>
              <h2 className="text-[clamp(2.5rem,12vw,4.5rem)] leading-[0.94] font-medium text-balance">
                {home.studioTitle}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-background/70">
                {home.studioIntro}
              </p>
              <Link
                href={localizePath(locale, "/studio")}
                className={cn(
                  buttonVariants({
                    variant: "secondary",
                    size: "lg",
                    className: "w-fit max-w-full",
                  })
                )}
              >
                {studioLabel}
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {studioDetails.map((detail, index) => (
                <div key={detail} className="grid content-start gap-5">
                  <p className="font-heading text-6xl text-background/25">
                    0{index + 1}
                  </p>
                  <p className="text-sm leading-7 text-background/70">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {atelierService && (
          <section className="grid min-w-0 bg-primary text-primary-foreground lg:grid-cols-2">
            {atelierImage?.src && (
              <ImageFrame
                alt={atelierImage.alt[locale]}
                src={atelierImage.src}
                ratio={3 / 2}
                eager
                className="rounded-none lg:aspect-auto lg:min-h-[42rem]"
              />
            )}
            <div className="flex flex-col justify-center gap-7 px-6 py-16 md:px-10 lg:px-16">
              <p className="text-xs tracking-[0.16em] text-primary-foreground/65 uppercase">
                {atelierService.categoryTitle}
              </p>
              <h2 className="text-5xl leading-[0.94] font-medium text-balance md:text-7xl">
                {atelierService.title}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-primary-foreground/70">
                {atelierService.summary}
              </p>
              <ol className="grid gap-4 border-t border-primary-foreground/20 pt-6 text-sm text-primary-foreground/70">
                {atelierService.outcomes.map((outcome, index) => (
                  <li key={outcome} className="grid grid-cols-[auto_1fr] gap-4">
                    <span>0{index + 1}</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ol>
              <Link
                href={localizePath(
                  locale,
                  servicePath(atelierService.routeSegment)
                )}
                className={cn(
                  buttonVariants({
                    variant: "secondary",
                    size: "lg",
                    className: "w-fit max-w-full",
                  })
                )}
              >
                {atelierService.title}
              </Link>
            </div>
          </section>
        )}

        <section className="w-full py-16 md:py-24">
          <div className="grid gap-6 px-6 pb-10 md:grid-cols-[0.8fr_1.2fr] md:items-start md:px-10 lg:px-16">
            <h2 className="text-5xl leading-[0.94] font-medium md:text-7xl">
              {home.collectionRailTitle}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:justify-self-end">
              {home.portfolioNote}
            </p>
          </div>
          <div className="grid lg:grid-cols-2">
            {visibleCourses.map((course) => {
              const courseImage = course.mediaAsset

              return (
                <Link
                  key={course.routeSegment}
                  href={localizePath(locale, coursePath(course.routeSegment))}
                  className="group grid min-w-0 gap-6 pb-10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:border-r lg:border-border"
                >
                  {courseImage?.src && (
                    <ImageFrame
                      alt={courseImage.alt[locale]}
                      src={courseImage.src}
                      ratio={3 / 2}
                      eager
                      className="rounded-none"
                    />
                  )}
                  <h3 className="px-6 text-4xl leading-none font-medium md:px-10 md:text-5xl lg:px-16">
                    {course.title}
                  </h3>
                  <p className="px-6 text-sm leading-7 text-muted-foreground md:px-10 lg:px-16">
                    {course.summary}
                  </p>
                  <p className="px-6 text-sm leading-7 text-muted-foreground md:px-10 lg:px-16">
                    {course.audience}
                  </p>
                  <ol className="grid grid-cols-2 gap-x-6 gap-y-3 px-6 text-xs tracking-[0.12em] uppercase md:px-10 lg:px-16">
                    {course.lessons.map((lesson, index) => (
                      <li
                        key={lesson}
                        className="grid grid-cols-[auto_1fr] gap-3"
                      >
                        <span className="text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ol>
                  <span className="flex items-center gap-3 px-6 text-xs tracking-[0.14em] uppercase md:px-10 lg:px-16">
                    {commerceLabel(locale, "status", course.commercialStatus)}
                    <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
                  </span>
                </Link>
              )
            })}
            <div className="grid min-w-0">
              {visibleCollections.map((collection, index) => {
                const collectionImage = collection.mediaAsset

                return (
                  <Link
                    key={collection.routeSegment}
                    href={localizePath(
                      locale,
                      collectionPath(collection.routeSegment)
                    )}
                    className="group grid min-w-0 grid-cols-[minmax(0,1fr)_7rem] gap-5 px-6 py-8 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_12rem] md:px-10 lg:px-12"
                  >
                    <span className="grid min-w-0 content-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        0{index + 1}
                      </span>
                      <span className="font-heading text-3xl leading-none md:text-4xl">
                        {collection.title}
                      </span>
                      <span className="text-xs leading-5 text-muted-foreground">
                        {home.priceNote}
                      </span>
                    </span>
                    {collectionImage?.src && (
                      <ImageFrame
                        alt={collectionImage.alt[locale]}
                        src={collectionImage.src}
                        ratio={4 / 5}
                        className="rounded-none"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative min-h-[44rem] overflow-hidden px-6 py-16 text-background md:px-10 md:py-24 lg:px-16">
          {portfolioImage?.src && (
            <Image
              alt={portfolioImage.alt[locale]}
              src={portfolioImage.src}
              unoptimized
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-foreground/55"
          />
          <div className="relative mx-auto flex min-h-[32rem] max-w-screen-2xl min-w-0 flex-col justify-between gap-16">
            <div className="grid min-w-0 content-start gap-5">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Portfolio / 01
              </p>
            </div>
            <div className="grid min-w-0 items-end gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.7fr)] lg:gap-20">
              <h2 className="max-w-[11ch] text-5xl leading-[0.94] font-medium text-balance md:text-7xl">
                {home.portfolioTitle}
              </h2>
              <div className="grid min-w-0 gap-8">
                <p className="max-w-2xl text-sm leading-7 text-background/75">
                  {home.portfolioSummary}
                </p>
                <div className="grid gap-6 sm:grid-cols-3">
                  {home.portfolioSignals.map((signal, index) => (
                    <div key={signal} className="grid gap-2">
                      <span className="text-xs text-background/60">
                        0{index + 1}
                      </span>
                      <span className="text-xs font-semibold tracking-[0.12em] uppercase">
                        {signal}
                      </span>
                    </div>
                  ))}
                </div>
                {portfolioCase && (
                  <Link
                    href={localizePath(
                      locale,
                      portfolioCasePath(portfolioCase.routeSegment)
                    )}
                    className={cn(
                      buttonVariants({
                        variant: "secondary",
                        size: "lg",
                        className: "w-fit max-w-full",
                      })
                    )}
                  >
                    {portfolioCase.title}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <EditorialFaq
          title={home.faqTitle}
          items={home.faq.map(
            ({ question, answer }) => [question, answer] as const
          )}
        />

        <BookingCTA
          eyebrow={home.studioEyebrow}
          title={bookingPage?.title ?? home.finalCTATitle}
          summary={bookingPage?.summary ?? home.finalCTASummary}
          action={home.primaryCTA.label}
          href={localizePath(locale, "/booking")}
        />
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}
