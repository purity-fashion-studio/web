import { beforeEach, expect, it, vi } from "vitest"
import type { Payload } from "payload"

vi.mock("@/features/booking/advisory-lock", () => ({
  withAdvisoryLock: async (
    _payload: unknown,
    _namespace: string,
    _id: string,
    operation: () => Promise<unknown>
  ) => operation(),
}))
vi.mock("payload", () => ({
  getPayload: async () => payload,
  createLocalReq: async () => ({}),
  initTransaction: async () => {},
  commitTransaction: async () => {},
  killTransaction: async () => {},
}))
vi.mock("@/features/booking/notification-outbox", () => ({
  enqueueNotifications: async () => {},
}))
vi.mock("@/features/booking/payment-notifications", () => ({
  paymentNotificationMessages: async () => [],
}))
vi.mock("@/features/booking/notification-recipients", () => ({
  internalNotificationMessages: async () => [],
}))

vi.mock("server-only", () => ({}))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("@/lib/env", () => ({ env: { PAYLOAD_ENABLED: "true" } }))
import { getVerifiedPaymentStatus } from "@/features/booking/payment-status"
import { processNormalizedPaymentWebhook } from "@/features/booking/payment-webhook-processing"

const order = {
  id: "order",
  orderUUID: "uuid",
  bookingRequest: "booking",
  provider: "stripe",
  status: "paid",
  amount: 1000,
  currency: "EUR",
  refundedAmount: 0,
}
const booking = { status: "confirmed" }
const payload = {
  find: async () => ({ docs: [{ ...order }] }),
  findByID: async () => ({ ...order }),
  update: vi.fn(async ({ collection, data }) => {
    if (collection === "payment-orders") Object.assign(order, data)
    if (collection === "booking-requests") Object.assign(booking, data)
    return { ...order }
  }),
} as unknown as Payload
const event = (eventType: string, amount = 1000) =>
  processNormalizedPaymentWebhook({
    payload,
    provider: "stripe",
    eventType,
    normalizedPayload: {
      orderUUID: "uuid",
      paymentStatus: "paid",
      amount,
      currency: "EUR",
    },
  })
beforeEach(() => {
  order.status = "paid"
  order.refundedAmount = 0
  booking.status = "confirmed"
  vi.clearAllMocks()
})

it.each([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
])("keeps a dispute through duplicate dispute and late %s", async (type) => {
  await event("charge.dispute.created")
  await event("charge.dispute.created")
  expect(order.status).toBe("disputed")
  await event(type)
  expect(order.status).toBe("disputed")
})
it("keeps an unresolved dispute through delayed refunds and checkout without regressing accounting or re-confirming a booking", async () => {
  await event("charge.dispute.created")
  booking.status = "cancelled" // A separate operator decision is not reversed by delivery order.
  for (const [amount, expectedRefund] of [
    [400, 400],
    [200, 400],
    [1000, 1000],
    [400, 1000],
  ]) {
    await event("charge.refunded", amount)
    expect(order.status).toBe("disputed")
    expect(order.refundedAmount).toBe(expectedRefund)
    for (const type of [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ]) {
      await event(type)
      expect(order.status).toBe("disputed")
      expect(booking.status).toBe("cancelled")
      expect(
        (await getVerifiedPaymentStatus("00000000-0000-4000-8000-000000000001"))
          .status
      ).toBe("failure")
    }
  }
})
it.each(["cancelled", "expired"])(
  "still accepts late payment from %s",
  async (status) => {
    order.status = status
    await event("checkout.session.async_payment_succeeded")
    expect(order.status).toBe("paid")
  }
)
it("does not infer dispute resolution from an unrecognized close event", async () => {
  order.status = "disputed"
  await event("charge.dispute.closed")
  expect(order.status).toBe("disputed")
})
