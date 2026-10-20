import type { Offer } from "@/payload-types"

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
