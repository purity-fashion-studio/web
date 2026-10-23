import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
  findByID: vi.fn(),
  update: vi.fn(),
  createOrder: vi.fn(),
  locks: [] as string[],
}))
vi.mock("@/features/booking/advisory-lock", () => ({
  withAdvisoryLock: async (
    _payload: unknown,
    namespace: string,
    id: string,
    operation: () => Promise<unknown>
  ) => {
    state.locks.push(`${namespace}:${id}`)
    return operation()
  },
}))
vi.mock("@/features/booking/payment", () => ({
  getPaymentAdapter: () => ({ createOrder: state.createOrder }),
}))
import { ensureCheckout } from "@/features/booking/checkout-persistence"

beforeEach(() => {
  vi.clearAllMocks()
  state.locks = []
  state.current = {
    id: "order",
    orderUUID: "reference",
    provider: "stripe",
    status: "created",
    amount: 1000,
    idempotencyKey: "one",
    commercialSnapshot: { title: "Consultation" },
  }
  state.findByID.mockImplementation(async () => ({ ...state.current }))
  state.update.mockImplementation(async ({ data }) =>
    Object.assign(state.current, data)
  )
})

const run = () =>
  ensureCheckout({
    payload: { findByID: state.findByID, update: state.update } as never,
    order: { ...state.current } as never,
    booking: { email: "client@example.com", budgetCurrency: "EUR" } as never,
    origin: "http://localhost:3000",
    locale: "en",
  })

it("preserves verified paid state when a webhook wins the checkout persistence race", async () => {
  state.createOrder.mockImplementationOnce(async () => {
    state.current.status = "paid"
    return {
      id: "provider-order",
      checkoutUrl: "https://checkout.example/session",
    }
  })
  const order = await run()
  expect(order.status).toBe("paid")
  expect(state.current.status).toBe("paid")
  expect(state.locks).toContain("payment-order:order")
})

it("does not downgrade a verified order when checkout creation fails", async () => {
  state.createOrder.mockImplementationOnce(async () => {
    state.current.status = "paid"
    throw new Error("network failed")
  })
  expect((await run()).status).toBe("paid")
})

it("records a recoverable failure without claiming successful checkout", async () => {
  state.createOrder.mockRejectedValueOnce(new Error("network failed"))
  expect(await run()).toMatchObject({
    status: "failed",
    safeFailureCode: "checkout-creation-failed",
  })
})
