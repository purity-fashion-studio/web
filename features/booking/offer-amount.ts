import type { Offer } from "@/payload-types"

import type { PaymentCurrency } from "./schema"

// A deposit is denominated by an explicitly configured currency price, never
// by the customer's currency alone. No conversion or fallback price is implied.
export function selectedAmount(
  offer: Pick<Offer, "pricingMode" | "checkoutMode" | "prices" | "deposit">,
  currency: PaymentCurrency
): number | null {
  const price = offer.prices?.find((item) => item.currency === currency)
  if (!price) return null
  if (offer.checkoutMode === "instant-payment") {
    return offer.pricingMode === "fixed" ? (price.amount ?? null) : null
  }
  if (offer.checkoutMode !== "deposit") return null
  if (offer.deposit?.amount != null) return offer.deposit.amount
  if (
    offer.deposit?.percentage != null &&
    offer.pricingMode === "fixed" &&
    price.amount != null
  ) {
    return Math.round((price.amount * offer.deposit.percentage) / 100)
  }
  return null
}
