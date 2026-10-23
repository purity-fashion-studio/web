import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => {
  const payload = {
    find: vi.fn(),
    findGlobal: vi.fn(),
    findByID: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    logger: { error: vi.fn() },
  }
  return {
    payload,
    held: new Set<string>(),
    commit: vi.fn(),
    existingLead: undefined as Record<string, unknown> | undefined,
    existingBooking: undefined as Record<string, unknown> | undefined,
    offer: undefined as Record<string, unknown> | undefined,
    parentAvailable: true,
    settings: {
      enabledModes: [
        "inquiry",
        "booking-request",
        "instant-payment",
        "deposit",
      ],
      providerRouting: [{ currency: "EUR", provider: "stripe", enabled: true }],
      notificationRecipients: [],
    },
    createOrder: vi.fn(),
    environment: {
      PAYLOAD_ENABLED: "true",
      PAYMENT_MODE: "test",
      EMAIL_MODE: "disabled",
      EMAIL_FROM: "qa@example.com",
      PAYLOAD_SECRET: "test-only-fingerprint-secret",
    },
  }
})
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("payload", () => ({
  getPayload: async () => state.payload,
  createLocalReq: async () => ({}),
  initTransaction: async () => {},
  commitTransaction: state.commit,
  killTransaction: async () => {},
}))
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-real-ip": "127.0.0.1" }),
}))
vi.mock("next/server", () => ({ after: vi.fn() }))
vi.mock("@/lib/env", () => ({ env: state.environment }))
vi.mock("@/lib/site-url", () => ({ getSiteURL: () => "http://localhost:3000" }))
vi.mock("@/features/booking/notification-outbox", () => ({
  enqueueNotifications: vi.fn(),
  deliverNotificationBatch: vi.fn(),
}))
vi.mock("@/features/booking/payment", () => ({
  getPaymentAdapter: () => ({ createOrder: state.createOrder }),
}))
vi.mock("@/features/booking/advisory-lock", () => ({
  AdvisoryLockTimeoutError: class extends Error {},
  withAdvisoryLock: async (
    _payload: unknown,
    namespace: string,
    key: string,
    operation: () => Promise<unknown>
  ) => {
    const id = `${namespace}:${key}`
    state.held.add(id)
    try {
      return await operation()
    } finally {
      state.held.delete(id)
    }
  },
}))

import { submitBooking } from "@/features/booking/actions"
import { resolveCart } from "@/features/cart/actions"

const values = {
  inquiryType: "private",
  serviceSlug: "atelier-service",
  name: "New Name",
  email: "client@example.com",
  phone: "+380 123 456 789",
  company: "New Company",
  format: "studio",
  contactMethod: "email",
  budgetCurrency: "EUR",
  preferredAt: "",
  message: "A sufficiently detailed consultation request.",
  consent: "on",
}
function form(overrides: Record<string, string> = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({
    ...values,
    locale: "en",
    idempotencyKey: "request-one",
    submissionStartedAt: String(Date.now() - 5000),
    ...overrides,
  }))
    data.set(key, value)
  return data
}
const paidOffer = {
  id: "offer",
  enabled: true,
  _status: "published",
  commercialStatus: "active",
  service: "service",
  title: "Studio consultation",
  sku: "studio",
  termsVersion: "v1",
  format: "studio",
  pricingMode: "fixed",
  checkoutMode: "instant-payment",
  prices: [{ currency: "EUR", amount: 1000 }],
}

beforeEach(() => {
  vi.clearAllMocks()
  state.held.clear()
  state.environment.PAYLOAD_ENABLED = "true"
  state.existingLead = undefined
  state.existingBooking = undefined
  state.offer = undefined
  state.parentAvailable = true
  state.settings.enabledModes = [
    "inquiry",
    "booking-request",
    "instant-payment",
    "deposit",
  ]
  state.settings.providerRouting = [
    { currency: "EUR", provider: "stripe", enabled: true },
  ]
  state.payload.count.mockResolvedValue({ totalDocs: 0 })
  state.payload.findGlobal.mockImplementation(async () => state.settings)
  state.payload.find.mockImplementation(async ({ collection }) => ({
    docs:
      collection === "services"
        ? [
            {
              id: "service",
              slug: "atelier-service",
              title: "Atelier",
              enabled: true,
              _status: "published",
            },
          ]
        : collection === "offers"
          ? state.offer
            ? [state.offer]
            : []
          : collection === "booking-requests"
            ? state.existingBooking
              ? [state.existingBooking]
              : []
            : collection === "leads"
              ? state.existingLead
                ? [state.existingLead]
                : []
              : state.parentAvailable
                ? [
                    {
                      id: "parent",
                      enabled: true,
                      _status: "published",
                      commercialStatus: "active",
                    },
                  ]
                : [],
  }))
  state.payload.findByID.mockImplementation(async ({ collection }) =>
    collection === "leads"
      ? state.existingLead
      : state.parentAvailable
        ? {
            id: "parent",
            enabled: true,
            _status: "published",
            commercialStatus: "active",
          }
        : null
  )
  state.payload.create.mockImplementation(async ({ collection, data }) => ({
    id: collection,
    ...data,
  }))
  state.payload.update.mockImplementation(async ({ id, data }) => ({
    id,
    ...data,
  }))
  state.commit.mockResolvedValue(undefined)
  state.createOrder.mockResolvedValue({
    id: "provider-order",
    checkoutUrl: "http://localhost:3000/en/payment/success",
    currency: "EUR",
  })
})

it("uses a normalized phone value, never a function, in the identity query", async () => {
  expect((await submitBooking({ status: "idle" }, form())).status).toBe(
    "success"
  )
  expect(state.payload.find).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: "leads",
      where: {
        or: expect.arrayContaining([{ phone: { equals: "+380123456789" } }]),
      },
    })
  )
})

it("does not attach another email's phone identity to a new booking", async () => {
  state.existingLead = {
    id: "other-person",
    email: "other@example.com",
    phone: "+380123456789",
  }
  expect((await submitBooking({ status: "idle" }, form())).status).toBe("error")
  expect(state.payload.create).not.toHaveBeenCalledWith(
    expect.objectContaining({ collection: "booking-requests" })
  )
})

it("preserves the submitted contact and locale independently of mutable lead data", async () => {
  state.existingLead = {
    id: "lead",
    email: values.email,
    name: "Old Name",
    phone: "+380123456789",
    company: "Old Company",
  }
  expect((await submitBooking({ status: "idle" }, form())).status).toBe(
    "success"
  )
  expect(state.payload.create).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: "booking-requests",
      data: expect.objectContaining({
        submissionSnapshot: expect.objectContaining({
          name: values.name,
          email: values.email,
          company: values.company,
          locale: "en",
        }),
      }),
    })
  )
})

it("holds identity locks through transaction commit", async () => {
  state.commit.mockImplementationOnce(async () => {
    expect(state.held.has(`lead-identity:email:${values.email}`)).toBe(true)
    expect(state.held.has("lead-identity:phone:+380123456789")).toBe(true)
  })
  expect((await submitBooking({ status: "idle" }, form())).status).toBe(
    "success"
  )
})

it("refuses a paid mode disabled in booking settings", async () => {
  state.offer = paidOffer
  state.settings.enabledModes = ["inquiry", "booking-request"]
  expect(
    (await submitBooking({ status: "idle" }, form({ offerId: "offer" }))).status
  ).toBe("error")
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("refuses a disabled payment provider", async () => {
  state.offer = paidOffer
  state.settings.providerRouting[0]!.enabled = false
  expect(
    (await submitBooking({ status: "idle" }, form({ offerId: "offer" }))).status
  ).toBe("error")
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("does not charge a studio offer for an online request", async () => {
  state.offer = paidOffer
  expect(
    (
      await submitBooking(
        { status: "idle" },
        form({ offerId: "offer", format: "online" })
      )
    ).status
  ).toBe("error")
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("replays a saved submission after staff correct the linked lead", async () => {
  state.existingLead = {
    id: "lead",
    name: "Corrected by support",
    email: values.email,
    phone: "+380123456789",
  }
  state.existingBooking = {
    id: "booking",
    lead: "lead",
    service: "service",
    inquiryType: "private",
    format: "studio",
    currency: "EUR",
    message: values.message,
    submissionSnapshot: { ...values, consent: true, locale: "en" },
  }
  expect((await submitBooking({ status: "idle" }, form())).status).toBe(
    "success"
  )
  expect(
    (
      await submitBooking(
        { status: "idle" },
        form({ company: "A different request" })
      )
    ).status
  ).toBe("error")
})

it("rejects unavailable course parents even when their paid offer remains published", async () => {
  state.offer = { ...paidOffer, service: undefined, course: "parent" }
  state.parentAvailable = false
  state.payload.find.mockImplementation(async ({ collection }) => ({
    docs:
      collection === "services"
        ? [{ id: "service", slug: "wardrobe-management", title: "School" }]
        : collection === "offers"
          ? [state.offer]
          : [],
  }))
  expect(
    (
      await submitBooking(
        { status: "idle" },
        form({ serviceSlug: "wardrobe-management", offerId: "offer" })
      )
    ).status
  ).toBe("error")
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("never invents a successful booking or a price when persistence is disabled", async () => {
  state.environment.PAYLOAD_ENABLED = "false"
  expect(await submitBooking({ status: "idle" }, form())).toEqual({
    status: "error",
    message: "serviceUnavailable",
  })
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("rejects an ambiguous timezone-free appointment at the server boundary", async () => {
  expect(
    (
      await submitBooking(
        { status: "idle" },
        form({ preferredAt: "2026-11-20T12:00" })
      )
    ).status
  ).toBe("error")
})

it("records a requested course identity even without a payable offer", async () => {
  state.payload.find.mockImplementation(async ({ collection }) => ({
    docs:
      collection === "services"
        ? [{ id: "service", slug: "wardrobe-management", title: "School" }]
        : collection === "courses"
          ? [
              {
                id: "parent",
                enabled: true,
                _status: "published",
                availability: "coming-soon",
              },
            ]
          : [],
  }))
  expect(
    (
      await submitBooking(
        { status: "idle" },
        form({
          serviceSlug: "wardrobe-management",
          courseSlug: "wardrobe-management-course",
        })
      )
    ).status
  ).toBe("success")
  expect(state.payload.create).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: "booking-requests",
      data: expect.objectContaining({ course: "parent" }),
    })
  )
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("never charges an automatically selected offer without an explicit selection", async () => {
  state.offer = paidOffer
  expect((await submitBooking({ status: "idle" }, form())).status).toBe(
    "success"
  )
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("does not restart checkout through replay after the owner disables its provider", async () => {
  state.existingBooking = {
    id: "booking",
    lead: "lead",
    service: "service",
    offer: "offer",
    requestMode: "instant-payment",
    inquiryType: "private",
    format: "studio",
    currency: "EUR",
    message: values.message,
    paymentOrder: "order",
    submissionSnapshot: {
      ...values,
      consent: true,
      locale: "en",
      intent: "checkout",
      offerId: "offer",
    },
  }
  state.payload.findByID.mockResolvedValue({
    id: "order",
    status: "created",
    provider: "stripe",
    currency: "EUR",
    amount: 1000,
    commercialSnapshot: { title: "Consultation" },
  })
  state.settings.providerRouting[0]!.enabled = false
  expect(
    (await submitBooking({ status: "idle" }, form({ offerId: "offer" }))).status
  ).toBe("error")
  expect(state.createOrder).not.toHaveBeenCalled()
})

it("keeps a persisted paid request retryable when checkout is unavailable", async () => {
  state.offer = paidOffer
  state.payload.findByID.mockResolvedValue({
    id: "order",
    status: "created",
    provider: "stripe",
    currency: "EUR",
    amount: 1000,
    commercialSnapshot: { title: "Consultation" },
  })
  state.createOrder.mockRejectedValueOnce(new Error("Provider unavailable"))
  expect(
    await submitBooking({ status: "idle" }, form({ offerId: "offer" }))
  ).toMatchObject({ status: "success", checkoutUnavailable: true })
})

it("retains an explicit coming-soon offer as a quote request, not a payment", async () => {
  state.offer = { ...paidOffer, commercialStatus: "coming-soon" }
  expect(
    (
      await submitBooking(
        { status: "idle" },
        form({ offerId: "offer", intent: "request" })
      )
    ).status
  ).toBe("success")
  expect(state.createOrder).not.toHaveBeenCalled()
})

it.each([
  { deposit: { amount: 300 }, expected: 300 },
  { deposit: { percentage: 25 }, expected: 250 },
])(
  "keeps cart and server deposit currency contracts aligned: $deposit",
  async ({ deposit, expected }) => {
    state.offer = { ...paidOffer, checkoutMode: "deposit", deposit }
    const selection = {
      kind: "service",
      slug: "atelier-service",
      offerId: "offer",
      format: "studio",
      currency: "EUR",
    }
    const [supported] = await resolveCart("en", [selection])
    expect(supported).toMatchObject({ available: true, requiresQuote: false })
    expect(supported?.price).toContain((expected / 100).toFixed(2))
    const query = new URL(supported!.bookingPath!, "http://localhost")
      .searchParams
    expect(
      (
        await submitBooking(
          { status: "idle" },
          form({ offerId: query.get("offer")!, intent: query.get("intent")! })
        )
      ).status
    ).toBe("success")
    expect(state.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "payment-orders",
        data: expect.objectContaining({ amount: expected, currency: "EUR" }),
      })
    )
    vi.clearAllMocks()
    state.settings.providerRouting.push({
      currency: "UAH",
      provider: "liqpay",
      enabled: true,
    })
    const [unsupported] = await resolveCart("en", [
      { ...selection, currency: "UAH" },
    ])
    expect(unsupported?.requiresQuote).toBe(true)
    expect(unsupported?.price).toBeUndefined()
    expect(unsupported?.bookingPath).toContain("intent=request")
    expect(
      await submitBooking(
        { status: "idle" },
        form({
          offerId: "offer",
          intent: "checkout",
          budgetCurrency: "UAH",
          amount: "1",
        })
      )
    ).toMatchObject({ status: "error", message: "validation" })
    expect(state.payload.create).not.toHaveBeenCalled()
  }
)

it.each([
  { mode: "waitlist", enabled: ["waitlist"] },
  { mode: "waitlist", enabled: ["waitlist", "booking-request"] },
  { mode: "booking-request", enabled: ["booking-request"] },
  { mode: "inquiry", enabled: ["inquiry", "booking-request"] },
])(
  "preserves explicit $mode from cart continuation to saved booking with $enabled",
  async ({ mode, enabled }) => {
    state.offer = {
      ...paidOffer,
      checkoutMode: mode,
      pricingMode: "custom",
      prices: [],
    }
    state.settings.enabledModes = enabled
    const [item] = await resolveCart("en", [
      {
        kind: "service",
        slug: "atelier-service",
        offerId: "offer",
        format: "studio",
        currency: "EUR",
      },
    ])
    expect(item).toMatchObject({ available: true, requiresQuote: true })
    const query = new URL(item!.bookingPath!, "http://localhost").searchParams
    expect(
      (
        await submitBooking(
          { status: "idle" },
          form({ offerId: query.get("offer")!, intent: query.get("intent")! })
        )
      ).status
    ).toBe("success")
    expect(state.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "booking-requests",
        data: expect.objectContaining({ requestMode: mode, offer: "offer" }),
      })
    )
    expect(state.payload.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ collection: "payment-orders" })
    )
  }
)

it("does not offer a continuation for a disabled explicit waitlist mode", async () => {
  state.offer = { ...paidOffer, checkoutMode: "waitlist" }
  const [item] = await resolveCart("en", [
    {
      kind: "service",
      slug: "atelier-service",
      offerId: "offer",
      format: "studio",
      currency: "EUR",
    },
  ])
  expect(item?.available).toBe(false)
  expect(item?.bookingPath).toBeUndefined()
  expect(
    (
      await submitBooking(
        { status: "idle" },
        form({ offerId: "offer", intent: "request" })
      )
    ).status
  ).toBe("error")
  expect(state.payload.create).not.toHaveBeenCalled()
})

it("does not advertise a generic request when both fallback modes are disabled", async () => {
  state.settings.enabledModes = ["waitlist"]
  const [item] = await resolveCart("en", [
    {
      kind: "service",
      slug: "atelier-service",
      format: "studio",
      currency: "EUR",
    },
  ])
  expect(item?.available).toBe(false)
  expect(item?.bookingPath).toBeUndefined()
})
