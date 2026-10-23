import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { getLocalizedMetadata } from "@/content/metadata"
import { getSiteSettings } from "@/content/public-api"
import { CartView } from "@/features/cart/cart-view"
import { getInterfaceCopy } from "@/i18n/messages"
import { hasLocale } from "@/i18n/routing"

type CartPageProps = { params: Promise<{ locale: string }> }
export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(locale)) return {}
  const copy = getInterfaceCopy(locale).Cart
  return {
    ...(await getLocalizedMetadata({
      locale,
      path: "/cart",
      title: copy.title,
      description: copy.summary,
    })),
    robots: { index: false, follow: false },
  }
}
export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const copy = getInterfaceCopy(locale).Cart
  const settings = await getSiteSettings(locale)
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath="/cart" overlay={false} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto grid max-w-4xl gap-8 px-6 pt-32 pb-20 md:px-10"
      >
        <h1 className="font-heading text-4xl md:text-6xl">{copy.title}</h1>
        <p className="leading-7 text-muted-foreground">{copy.summary}</p>
        <CartView locale={locale} formatLabels={settings.booking.formats} />
      </main>
      <SiteFooter locale={locale} currentPath="/cart" />
    </div>
  )
}
