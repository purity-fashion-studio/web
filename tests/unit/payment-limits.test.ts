import { describe, expect, it } from "vitest"

import {
  isPaymentAmountAllowed,
  MAX_PAYMENT_AMOUNT_MINOR,
} from "../../lib/payment-limits"

describe("payment amount limits", () => {
  it("accepts positive integer minor units within the provider ceiling", () => {
    expect(isPaymentAmountAllowed(1)).toBe(true)
    expect(isPaymentAmountAllowed(MAX_PAYMENT_AMOUNT_MINOR)).toBe(true)
  })

  it("rejects zero, fractions, non-numbers and overflow", () => {
    expect(isPaymentAmountAllowed(0)).toBe(false)
    expect(isPaymentAmountAllowed(-1)).toBe(false)
    expect(isPaymentAmountAllowed(10.5)).toBe(false)
    expect(isPaymentAmountAllowed(MAX_PAYMENT_AMOUNT_MINOR + 1)).toBe(false)
    expect(isPaymentAmountAllowed("100")).toBe(false)
  })
})
