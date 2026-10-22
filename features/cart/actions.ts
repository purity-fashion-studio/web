"use server"

import { getPayload } from "payload"

import config from "@payload-config"
import {
  isOfferCheckoutEligible,
  isOfferFormatCompatible,
} from "@/features/booking/offer-eligibility"
import { routePaymentProvider } from "@/features/booking/schema"
import { hasLocale } from "@/i18n/routing"
import { isPaymentAmountAllowed } from "@/lib/payment-limits"
import type { Locale } from "@/i18n/routing"

import { cartSchema, cartSelectionKey, type CartSelection } from "./selection"

export type ResolvedCartItem = {
  key: string
  selection: CartSelection
  available: boolean
  requiresQuote: boolean
  title?: string
  offerTitle?: string
  price?: string
  bookingPath?: string
}

export async function resolveCart(
  locale: Locale,
  input: unknown
): Promise<ResolvedCartItem[]> {
  if (!hasLocale(locale)) throw new Error("Unsupported locale")
  const selections = cartSchema.parse(input)
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: "booking-settings",
    depth: 0,
    overrideAccess: true,
  })
  const items: ResolvedCartItem[] = []
  for (const selection of selections) {
    const unavailable: ResolvedCartItem = {
      key: cartSelectionKey(selection),
      selection,
      available: false,
      requiresQuote: true,
    }
    const collection =
      selection.kind === "service"
        ? "services"
        : selection.kind === "course"
          ? "courses"
          : "fashion-collections"
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 1,
      locale,
      fallbackLocale: false,
      overrideAccess: false,
      select: {
        id: true,
        title: true,
        slug: true,
        enabled: true,
        _status: true,
        ...(collection !== "services" ? { availability: true } : {}),
      },
      where: { slug: { equals: selection.slug } },
    })
    const entity = result.docs[0]
    if (!entity || entity._status !== "published" || !entity.enabled) {
      items.push(unavailable)
      continue
    }
    const ownerField =
      selection.kind === "service"
        ? "service"
        : selection.kind === "course"
          ? "course"
          : "fashionCollection"
    const offers = selection.offerId
      ? await payload.find({
          collection: "offers",
          depth: 0,
          limit: 1,
          locale,
          fallbackLocale: false,
          overrideAccess: false,
          where: {
            and: [
              { [ownerField]: { equals: entity.id } },
              { id: { equals: selection.offerId } },
            ],
          },
        })
      : undefined
    const offer = offers?.docs[0]
    if (
      selection.offerId &&
      (!offer || !isOfferFormatCompatible(offer, selection.format))
    ) {
      items.push({ ...unavailable, title: entity.title })
      continue
    }
    const price = offer?.prices?.find(
      (price) => price.currency === selection.currency
    )
    const amount =
      offer?.checkoutMode === "deposit"
        ? (offer.deposit?.amount ??
          (offer.pricingMode === "fixed" &&
          price?.amount != null &&
          offer.deposit?.percentage != null
            ? Math.round((price.amount * offer.deposit.percentage) / 100)
            : null))
        : offer?.pricingMode === "fixed"
          ? price?.amount
          : null
    const requiresQuote =
      !offer ||
      !isOfferCheckoutEligible(offer) ||
      !["instant-payment", "deposit"].includes(offer.checkoutMode) ||
      !isPaymentAmountAllowed(amount) ||
      !settings.enabledModes.includes(offer.checkoutMode) ||
      ("availability" in entity && entity.availability !== "available") ||
      !settings.providerRouting?.some(
        (route) =>
          route.currency === selection.currency &&
          route.enabled &&
          route.provider === routePaymentProvider(selection.currency)
      )
    const query = new URLSearchParams({
      service:
        selection.kind === "service"
          ? selection.slug
          : selection.kind === "course"
            ? "wardrobe-management"
            : "capsule-collection",
      format: selection.format,
      currency: selection.currency,
      intent: requiresQuote ? "request" : "checkout",
    })
    if (selection.kind !== "service") query.set(selection.kind, selection.slug)
    if (selection.offerId) query.set("offer", selection.offerId)
    items.push({
      key: unavailable.key,
      selection,
      available: true,
      requiresQuote,
      title: entity.title,
      offerTitle: offer?.title,
      price:
        !requiresQuote && amount != null
          ? new Intl.NumberFormat(
              locale === "en" ? "en-IE" : locale === "uk" ? "uk-UA" : "ru-RU",
              { style: "currency", currency: selection.currency }
            ).format(amount / 100)
          : undefined,
      bookingPath: `/booking?${query}`,
    })
  }
  return items
}
