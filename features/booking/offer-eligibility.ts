import type { Offer } from "@/payload-types"

import { formats, type BookingFormat } from "./schema"

export function defaultOfferFormat(
  offer: Pick<Offer, "format">
): BookingFormat {
  return offer.format === "online"
    ? "online"
    : offer.format === "remote-atelier"
      ? "atelier"
      : "studio"
}

export function isOfferFormatCompatible(
  offer: Pick<Offer, "format">,
  format: BookingFormat
) {
  const requested = format === "atelier" ? "remote-atelier" : format
  return (
    offer.format === requested ||
    offer.format === "hybrid" ||
    (offer.format === "in-person" && format === "studio")
  )
}

export function supportedOfferFormats(offer: Pick<Offer, "format">) {
  return formats.filter((format) => isOfferFormatCompatible(offer, format))
}

export function isOfferCheckoutEligible(offer: Offer, now = Date.now()) {
  const startsAt = offer.effectiveFrom
    ? new Date(offer.effectiveFrom).getTime()
    : undefined
  const endsAt = offer.effectiveUntil
    ? new Date(offer.effectiveUntil).getTime()
    : undefined

  return (
    offer.enabled &&
    offer._status !== "draft" &&
    offer.commercialStatus === "active" &&
    (startsAt == null || (Number.isFinite(startsAt) && startsAt <= now)) &&
    (endsAt == null || (Number.isFinite(endsAt) && endsAt > now))
  )
}
