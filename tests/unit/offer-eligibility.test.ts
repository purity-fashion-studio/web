import { describe, expect, it } from "vitest"

import { isOfferCheckoutEligible } from "@/features/booking/offer-eligibility"
import type { Offer } from "@/payload-types"

const now = Date.parse("2026-08-12T12:00:00.000Z")

function offer(overrides: Partial<Offer> = {}) {
  return {
    enabled: true,
    _status: "published" as const,
    commercialStatus: "active" as const,
    effectiveFrom: null,
    effectiveUntil: null,
    ...overrides,
  } as Offer
}

describe("offer checkout eligibility", () => {
  it("accepts a published active offer in its effective window", () => {
    expect(
      isOfferCheckoutEligible(
        offer({
          effectiveFrom: "2026-08-12T11:00:00.000Z",
          effectiveUntil: "2026-08-12T13:00:00.000Z",
        }),
        now
      )
    ).toBe(true)
  })

  it.each([
    ["disabled", { enabled: false }],
    ["draft", { _status: "draft" as const }],
    ["paused", { commercialStatus: "paused" as const }],
    ["future", { effectiveFrom: "2026-08-12T13:00:00.000Z" }],
    ["expired", { effectiveUntil: "2026-08-12T11:00:00.000Z" }],
  ])("rejects %s offers", (_, overrides) => {
    expect(isOfferCheckoutEligible(offer(overrides), now)).toBe(false)
  })
})
