import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getLocalizedMetadata } from "@/content/metadata"
import { getPageBySlug } from "@/content/public-api"
import { hasLocale, type Locale } from "@/i18n/routing"

import { PaymentStatusPage } from "./payment-status-page"
import { getVerifiedPaymentStatus } from "./payment-status"

export type PaymentRouteStatus = "success" | "failure" | "cancel"

export type PaymentRouteProps = {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{
    provider?: string | string[]
    order?: string | string[]
  }>
}

export async function getPaymentRouteMetadata({
  params,
  searchParams,
  path,
}: {
  params: Promise<{ locale: string }>
  searchParams?: PaymentRouteProps["searchParams"]
  path: string
}): Promise<Metadata> {
  const { locale: rawLocale } = await params

  if (!hasLocale(rawLocale)) return {}

  const query = await searchParams
  const verified = await getVerifiedPaymentStatus(
    typeof query?.order === "string" ? query.order : undefined
  )
  const page = await getPageBySlug(rawLocale, `payment-${verified.status}`)
  if (!page) return {}

  return {
    ...(await getLocalizedMetadata({
      locale: rawLocale,
      path,
      title: page.seo.title,
      description: page.seo.description,
    })),
    robots: { index: false, follow: false },
  }
}

export async function renderPaymentRoute({
  params,
  searchParams,
  status,
}: PaymentRouteProps & { status: PaymentRouteStatus }) {
  const { locale: rawLocale } = await params
  if (!hasLocale(rawLocale)) notFound()

  const query = await searchParams

  return (
    <PaymentStatusPage
      locale={rawLocale as Locale}
      status={status}
      provider={
        typeof query?.provider === "string" ? query.provider : undefined
      }
      order={typeof query?.order === "string" ? query.order : undefined}
    />
  )
}
