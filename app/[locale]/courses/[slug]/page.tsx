import type { Metadata } from "next"
import { EditorialSections } from "@/components/editorial-sections"
import Link from "next/link"
import { notFound } from "next/navigation"

import { EditorialHero, FeatureList } from "@/components/purity"
import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { getLocalizedMetadata } from "@/content/metadata"
import { getCourseBySlug, getSiteSettings } from "@/content/public-api"
import { coursePath } from "@/content/routes"
import { BookingStartCta } from "@/features/booking/booking-start-cta"
import { ProductCartControls } from "@/features/cart/product-cart-controls"
import { ProductOfferSelection } from "@/features/cart/product-offer-selection"
import { hasLocale, localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const sessionLabels = {
  uk: "занять",
  ru: "занятий",
  en: "sessions",
} as const

type CoursePageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const course = await getCourseBySlug(rawLocale, slug)
  if (!course) return {}

  return await getLocalizedMetadata({
    locale: rawLocale,
    path: coursePath(course.routeSegment),
    title: course.seo.title,
    description: course.seo.description,
    image: course.seo.image,
  })
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { locale: rawLocale, slug } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const [course, settings] = await Promise.all([
    getCourseBySlug(locale, slug),
    getSiteSettings(locale),
  ])

  if (!course) {
    notFound()
  }

  const currentPath = coursePath(course.routeSegment)
  const bookingHref = localizePath(
    locale,
    `/booking?service=wardrobe-management&course=${course.slug}`
  )

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath={currentPath} />

      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={course.eyebrow}
          title={course.title}
          summary={course.description}
          mediaAsset={course.mediaAsset}
          composition="editorial"
        >
          <div className="flex max-w-full flex-wrap gap-3">
            <BookingStartCta
              href={bookingHref}
              label={course.cta.label}
              serviceSlug="wardrobe-management"
              variant="secondary"
            />
            <ProductCartControls
              locale={locale}
              selection={{
                kind: "course",
                slug: course.slug,
                format: "studio",
                currency: "EUR",
              }}
            />
            <Link
              href={localizePath(locale, "/services/wardrobe-management")}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-auto min-h-11 max-w-full whitespace-normal",
                })
              )}
            >
              {course.serviceLabel}
            </Link>
          </div>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto grid max-w-6xl min-w-0 auto-rows-fr gap-4 px-6 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-3">
            {[
              [course.audienceTitle, course.audience],
              [course.formatTitle, course.formats.join(" · ")],
              [course.methodTitle, course.description],
              [
                course.prerequisitesTitle,
                course.prerequisites ?? course.description,
              ],
              [
                course.curriculumTitle,
                `${course.sessions} ${sessionLabels[locale]}${course.intakeNote ? ` · ${course.intakeNote}` : ""}`,
              ],
            ].map(([title, text]) => (
              <Card
                key={title}
                className="h-full min-w-0 border-border bg-background"
              >
                <CardHeader>
                  <CardTitle className="min-w-0 break-words">{title}</CardTitle>
                  <CardDescription className="min-w-0 break-words">
                    {text}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl min-w-0 gap-8 px-6 py-14 md:grid-cols-[0.72fr_1.28fr] md:px-10">
          <div className="min-w-0">
            <h2 className="text-3xl leading-tight font-medium md:text-5xl">
              {course.curriculumTitle}
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {course.curriculumSummary}
            </p>
          </div>
          <Card className="min-w-0 border-border bg-background">
            <CardContent>
              <Accordion defaultValue={[course.program[0]?.title ?? ""]}>
                {course.program.map((lesson, index) => (
                  <AccordionItem key={lesson.title} value={lesson.title}>
                    <AccordionTrigger>
                      <span className="mr-3 text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {lesson.title}
                    </AccordionTrigger>
                    <AccordionContent className="pl-9 leading-7 text-muted-foreground">
                      {lesson.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section className="bg-muted">
          <div className="mx-auto grid max-w-6xl min-w-0 auto-rows-fr gap-4 px-6 py-16 md:grid-cols-2 md:px-10">
            <Card className="h-full min-w-0 border-primary-foreground/20 bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="min-w-0 break-words">
                  {course.outcomesTitle}
                </CardTitle>
                <CardDescription className="text-secondary">
                  {course.outcomesSummary}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-primary-foreground/20 pt-5">
                <FeatureList
                  items={course.program.map((lesson) => lesson.title)}
                  className="text-primary-foreground/80"
                />
              </CardContent>
            </Card>
            <Card className="h-full min-w-0 border-border bg-background">
              <CardHeader>
                <CardTitle className="min-w-0 break-words">
                  {course.commercialTitle}
                </CardTitle>
                <CardDescription className="min-w-0 break-words">
                  {course.commercialStatus}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-border pt-5 text-sm leading-7 text-muted-foreground">
                {course.priceNote && <p>{course.priceNote}</p>}
                <div className="grid gap-6">
                  {course.offers.map((offer) => (
                    <ProductOfferSelection
                      key={offer.id}
                      kind="course"
                      slug={course.slug}
                      offer={offer}
                      locale={locale}
                      priceLabels={settings.booking.pricing}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl min-w-0 px-6 py-14 md:px-10">
          <Card className="min-w-0 border-border bg-background">
            <CardHeader>
              <CardTitle className="min-w-0 break-words">
                {course.ctaTitle}
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl">
                {course.ctaSummary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingStartCta
                href={bookingHref}
                label={course.cta.label}
                serviceSlug="wardrobe-management"
              />
            </CardContent>
          </Card>
        </section>
        <EditorialSections blocks={course.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  )
}
