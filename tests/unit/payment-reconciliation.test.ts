import { beforeEach, expect, it, vi } from "vitest"

const { payload, getPaymentStatus } = vi.hoisted(() => ({
  payload: {
    count: vi.fn(async () => ({ totalDocs: 0 })),
    find: vi.fn(),
    findByID: vi.fn(),
    update: vi.fn(async () => ({})),
    logger: { error: vi.fn() },
  },
  getPaymentStatus: vi.fn(async () => ({ status: "pending" })),
}))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("payload", () => ({ getPayload: async () => payload }))
vi.mock("@/lib/env", () => ({ env: { PAYLOAD_ENABLED: "true" } }))
vi.mock("@/features/booking/cron-auth", () => ({
  isAuthorizedCron: () => true,
}))
vi.mock("@/features/booking/advisory-lock", () => ({
  tryWithAdvisoryLock: async (
    _payload: unknown,
    _namespace: string,
    _id: string,
    operation: () => Promise<unknown>
  ) => operation(),
}))
vi.mock("@/features/booking/payment", () => ({
  getPaymentAdapter: () => ({ getPaymentStatus }),
}))
vi.mock("@/features/booking/webhook-events", () => ({
  retryDueWebhookEvents: async () => ({ exhausted: 0 }),
}))
vi.mock("@/features/booking/notification-outbox", () => ({
  deliverNotificationBatch: async () => ({ dead: 0 }),
}))

import { POST } from "@/app/api/jobs/reconcile-payments/route"

beforeEach(() => {
  vi.clearAllMocks()
  const order = {
    id: "order",
    status: "pending",
    provider: "stripe",
    reconciliationAttempts: 7,
    orderUUID: "reference",
    amount: 1000,
    currency: "EUR",
    mode: "test",
  }
  payload.find.mockResolvedValue({ docs: [order] })
  payload.findByID.mockResolvedValue(order)
})

it("successful pending lookups reset consecutive failures instead of exhausting reconciliation", async () => {
  const response = await POST(
    new Request("http://localhost/api/jobs/reconcile-payments")
  )
  expect(response.status).toBe(200)
  expect(payload.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        reconciliationAttempts: 0,
        nextReconcileAt: expect.any(String),
      }),
    })
  )
})

it("provider errors still exhaust a bounded consecutive failure budget", async () => {
  getPaymentStatus.mockRejectedValueOnce(new Error("provider unavailable"))
  await POST(new Request("http://localhost/api/jobs/reconcile-payments"))
  expect(payload.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        reconciliationAttempts: 8,
        nextReconcileAt: null,
      }),
    })
  )
})
