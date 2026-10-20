import type { Metadata } from "next"
import { ArrowSquareOutIcon as ExternalLinkIcon } from "@phosphor-icons/react/dist/ssr"
import { notFound } from "next/navigation"

import { EditorialHero } from "@/components/purity"
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
import {
  getFooter,
  getPageBySlug,
  getPublishedServices,
  getSiteSettings,
} from "@/content/public-api"
import { BookingForm } from "@/features/booking/booking-form"
import { hasLocale, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type ContactsPageProps = {
  params: Promise<{ locale: string }>
}

const contactButtonClass =
  "h-auto min-h-11 w-full min-w-0 shrink justify-start overflow-hidden whitespace-normal px-4 text-left leading-5 sm:px-8"

type ContactDetails = {
  phones: string[]
  email?: string
  viberUrl?: string
  socials: Array<{ label: string; url: string }>
}

function ContactEntrypoints({
  details,
  externalLinkLabel,
  labels,
}: {
  details: ContactDetails
  externalLinkLabel: string
  labels: {
    phone: string
    email: string
    viber: string
    socials: string
    direct: string
  }
}) {
  return (
    <section aria-label={labels.socials} className="grid gap-5">
      <h2 className="text-2xl font-medium md:text-3xl">{labels.direct}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {details.phones.map((phone) => (
          <a
            key={phone}
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: contactButtonClass,
              })
            )}
          >
            {labels.phone}: {phone}
          </a>
        ))}
        {details.email && (
          <a
            href={`mailto:${details.email}`}
            aria-label={`${labels.email}: ${details.email}`}
            title={details.email}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: contactButtonClass,
              })
            )}
          >
            <span className="shrink-0">{labels.email}:</span>{" "}
            <span className="min-w-0 truncate">{details.email}</span>
          </a>
        )}
        {details.viberUrl && (
          <a
            href={details.viberUrl}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: contactButtonClass,
              })
            )}
          >
            {labels.viber}: {details.phones[0]}
          </a>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {details.socials.map((social) => (
          <a
            key={social.url}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            data-testid="contact-social-link"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: contactButtonClass,
              })
            )}
          >
            {social.label}
            <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
            <span className="sr-only">{externalLinkLabel}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export async function generateMetadata({
  params,
}: ContactsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const page = await getPageBySlug(rawLocale, "contacts")

  if (page) {
    return await getLocalizedMetadata({
      locale: rawLocale,
      path: "/contacts",
      title: page.seo.title,
      description: page.seo.description,
    })
  }

  return {}
}

export default async function ContactsPage({ params }: ContactsPageProps) {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const [page, payloadServices, footer, settings] = await Promise.all([
    getPageBySlug(locale, "contacts"),
    getPublishedServices(locale),
    getFooter(locale),
    getSiteSettings(locale),
  ])
  if (!page) notFound()
  const serviceOptions = payloadServices.map((service) => ({
    slug: service.slug,
    title: service.title,
  }))
  const details: ContactDetails = {
    phones: footer.phones,
    email: footer.email,
    viberUrl: settings.contacts.viberURL,
    socials: footer.socialLinks.map((item) => ({
      label: item.platform,
      url: item.url,
    })),
  }
  const mediaAsset = page.mediaAsset

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath="/contacts" />

      <main>
        <EditorialHero
          locale={locale}
          eyebrow={page.eyebrow ?? page.title}
          title={page.title}
          summary={page.summary}
          mediaAsset={mediaAsset}
          composition="editorial"
        >
          <p className="text-sm leading-7 text-background/75">
            {footer.responseTime}
          </p>
        </EditorialHero>

        <section className="bg-muted">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-14 lg:px-10">
            <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="min-w-0 border-border bg-background">
                  <CardHeader>
                    <CardTitle className="min-w-0 break-words">
                      {settings.contactLabels.address}
                    </CardTitle>
                    <CardDescription className="min-w-0 break-words">
                      {settings.contacts.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="border-t border-border pt-5 text-sm leading-7 text-muted-foreground">
                    {settings.contacts.address}
                  </CardContent>
                </Card>
                <Card className="min-w-0 border-border bg-background">
                  <CardHeader>
                    <CardTitle className="min-w-0 break-words">
                      {settings.contactLabels.hours}
                    </CardTitle>
                    <CardDescription className="min-w-0 break-words">
                      {settings.contacts.hours}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <ContactEntrypoints
                details={details}
                externalLinkLabel={settings.uiLabels.externalLink}
                labels={settings.contactLabels}
              />
            </div>

            <Card className="min-w-0 border-border bg-background">
              <CardHeader>
                <CardTitle className="min-w-0 break-words">
                  {settings.contactLabels.request}
                </CardTitle>
                <CardDescription className="min-w-0 break-words">
                  {settings.contactLabels.requestSummary}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-border pt-6">
                <BookingForm
                  locale={locale}
                  services={serviceOptions}
                  initialServiceSlug={serviceOptions[0]?.slug ?? ""}
                  copy={settings.booking}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} currentPath="/contacts" />
    </div>
  )
}
