import Link from "next/link"
import { EditorialSections } from "@/components/editorial-sections"
import { notFound } from "next/navigation"

import { EditorialHero } from "@/components/purity"
import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { buttonVariants } from "@/components/ui/button"
import type { PaymentStatus } from "@/features/booking/public-copy"
import { getPageBySlug, getSiteSettings } from "@/content/public-api"
import {
  paymentProviders,
  type PaymentProvider,
} from "@/features/booking/schema"
import { getVerifiedPaymentStatus } from "@/features/booking/payment-status"
import { hasLocale, localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type PaymentStatusPageProps = {
  locale: Locale
  status: PaymentStatus
  provider?: string
  order?: string
}

function isPaymentProvider(provider?: string): provider is PaymentProvider {
  return paymentProviders.includes(provider as PaymentProvider)
}

async function PaymentStatusPage({
  locale,
  status,
  provider,
  order,
}: PaymentStatusPageProps) {
  if (!hasLocale(locale)) {
    notFound()
  }

  const [verified, settings] = await Promise.all([
    getVerifiedPaymentStatus(order),
    getSiteSettings(locale),
  ])
  const page = await getPageBySlug(locale, `payment-${verified.status}`)
  if (!page) notFound()
  // The verified payment state can be pending or refunded while the browser
  // remains on one of the three public status routes. Navigation must retain
  // that physical route so Next never prefetches an unimplemented
  // /payment/pending or /payment/refunded page.
  const receiptQuery = new URLSearchParams()
  if (verified.orderReference)
    receiptQuery.set("order", verified.orderReference)
  const currentPath = `/payment/${status}${receiptQuery.size ? `?${receiptQuery}` : ""}`
  const verifiedProvider = verified.provider ?? provider
  const providerValue = isPaymentProvider(verifiedProvider)
    ? settings.booking.providers[verifiedProvider]
    : settings.booking.paymentStatus.notProvided
  const orderValue =
    verified.orderReference &&
    !/(test|mock|adapter)/i.test(verified.orderReference)
      ? verified.orderReference
      : verified.orderReference
        ? settings.booking.paymentStatus.referenceReceived
        : settings.booking.paymentStatus.notProvided
  const detailLabels = settings.booking.paymentStatus

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath={currentPath} />
      <main id="main-content" tabIndex={-1}>
        <EditorialHero
          locale={locale}
          eyebrow={page.eyebrow ?? detailLabels.provider}
          title={page.title}
          summary={page.summary}
          composition="quiet"
        >
          <dl
            role="status"
            data-testid="payment-status-alert"
            data-status={verified.status}
            className="grid max-w-2xl gap-4 border-y border-background/25 py-5 text-background sm:grid-cols-2"
          >
            <div>
              <dt className="text-xs tracking-widest text-background/70 uppercase">
                {detailLabels.provider}
              </dt>
              <dd className="mt-2 text-sm">{providerValue}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-background/70 uppercase">
                {detailLabels.order}
              </dt>
              <dd className="mt-2 text-sm">{orderValue}</dd>
            </div>
          </dl>
          <Link
            href={localizePath(locale, "/booking")}
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "w-fit",
              })
            )}
          >
            {page.cta?.label ?? page.title}
          </Link>
        </EditorialHero>
        <EditorialSections blocks={page.editorialBlocks} locale={locale} />
      </main>
      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  )
}

export { PaymentStatusPage }
