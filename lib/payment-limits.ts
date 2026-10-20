// Stripe's Checkout unit_amount is bounded to eight digits in minor units.
// Keep the same ceiling for every provider so a CMS value cannot overflow one
// adapter or be represented differently between checkout and reconciliation.
export const MAX_PAYMENT_AMOUNT_MINOR = 99_999_999

export function isPaymentAmountAllowed(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_PAYMENT_AMOUNT_MINOR
  )
}
