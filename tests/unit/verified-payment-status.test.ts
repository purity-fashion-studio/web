import { beforeEach, expect, it, vi } from "vitest"

const { find, environment, loadPayload } = vi.hoisted(() => {
  const find = vi.fn()
  return {
    find,
    environment: { PAYLOAD_ENABLED: "true" },
    loadPayload: vi.fn(async () => ({ find })),
  }
})
vi.mock("server-only", () => ({}))
vi.mock("payload", () => ({ getPayload: loadPayload }))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("@/lib/env", () => ({ env: environment }))

import { getVerifiedPaymentStatus } from "@/features/booking/payment-status"

const order = "73b80da9-947f-40bc-a80d-07a91a76a8d7"
beforeEach(() => {
  vi.clearAllMocks()
  environment.PAYLOAD_ENABLED = "true"
  find.mockResolvedValue({ docs: [] })
})

it.each([undefined, "", "not-an-order", "paid", "a".repeat(10000)])(
  "never confirms payment for missing or malformed reference case %#",
  async (reference) => {
    expect(await getVerifiedPaymentStatus(reference)).toEqual({
      status: "pending",
    })
    expect(loadPayload).not.toHaveBeenCalled()
  }
)

it("does not treat disabled persistence as payment proof", async () => {
  environment.PAYLOAD_ENABLED = "false"
  expect(await getVerifiedPaymentStatus(order)).toEqual({ status: "pending" })
  expect(loadPayload).not.toHaveBeenCalled()
})

it("keeps an unknown order pending", async () => {
  expect(await getVerifiedPaymentStatus(order)).toEqual({ status: "pending" })
})

it.each([
  ["pending", "pending"],
  ["paid", "success"],
  ["partially-refunded", "success"],
  ["refunded", "refunded"],
  ["cancelled", "cancel"],
  ["expired", "cancel"],
  ["failed", "failure"],
  ["disputed", "failure"],
])(
  "uses stored %s state, not a redirect, to show %s",
  async (stored, expected) => {
    find.mockResolvedValue({
      docs: [{ orderUUID: order, provider: "stripe", status: stored }],
    })
    expect(await getVerifiedPaymentStatus(order)).toEqual({
      status: expected,
      provider: "stripe",
      orderReference: order,
    })
  }
)
