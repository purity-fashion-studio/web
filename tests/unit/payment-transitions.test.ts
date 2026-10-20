import { describe, expect, it } from "vitest"

import { canTransitionPaymentStatus } from "@/features/booking/payment-transitions"

describe("payment status transitions", () => {
  it("allows idempotent repeats and valid forward transitions", () => {
    expect(canTransitionPaymentStatus("created", "created")).toBe(true)
    expect(canTransitionPaymentStatus("created", "pending")).toBe(true)
    expect(canTransitionPaymentStatus("paid", "refunded")).toBe(true)
  })

  it("rejects invalid and regressive transitions", () => {
    expect(canTransitionPaymentStatus("paid", "created")).toBe(false)
    expect(canTransitionPaymentStatus("refunded", "paid")).toBe(false)
    expect(canTransitionPaymentStatus("failed", "cancelled")).toBe(false)
  })
})
