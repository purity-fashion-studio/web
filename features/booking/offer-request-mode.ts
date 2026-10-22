import type { Offer } from "@/payload-types"

type OfferMode = Offer["checkoutMode"]
type RequestMode = Exclude<OfferMode, "instant-payment" | "deposit">

// Explicit operational intent is not interchangeable with a generic quote.
// A paid selection can fall back to a request, but a disabled waitlist cannot.
export function selectedRequestMode(
  offer: Pick<Offer, "checkoutMode"> | undefined,
  enabledModes: readonly OfferMode[]
): RequestMode | undefined {
  const explicit = offer?.checkoutMode
  if (explicit && explicit !== "instant-payment" && explicit !== "deposit") {
    return enabledModes.includes(explicit) ? explicit : undefined
  }
  return enabledModes.includes("booking-request")
    ? "booking-request"
    : enabledModes.includes("inquiry")
      ? "inquiry"
      : undefined
}
