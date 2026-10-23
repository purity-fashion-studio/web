import { beforeEach, expect, it, vi } from "vitest"

const { payload } = vi.hoisted(() => ({
  payload: { findByID: vi.fn(), findGlobal: vi.fn() },
}))
vi.mock("@/lib/env", () => ({
  env: {
    EMAIL_FROM: "sender@example.com",
    SITE_MODE: "preview",
    VERCEL_ENV: undefined,
  },
}))
import { paymentNotificationMessages } from "@/features/booking/payment-notifications"

beforeEach(() => {
  vi.clearAllMocks()
  payload.findGlobal.mockResolvedValue({
    notificationRecipients: [
      { environment: "local", email: "support@example.com" },
    ],
  })
  payload.findByID.mockImplementation(async ({ collection }) =>
    collection === "booking-requests"
      ? {
          lead: "lead",
          submissionSnapshot: {
            inquiryType: "private",
            serviceSlug: "atelier-service",
            name: "Client",
            email: "original@example.com",
            format: "studio",
            contactMethod: "email",
            budgetCurrency: "EUR",
            message: "Original detailed booking request.",
            consent: true,
            locale: "en",
          },
        }
      : { email: "changed@example.com", locale: "ru" }
  )
})

it("sends payment updates to the booking contact, not a later edited lead", async () => {
  const messages = await paymentNotificationMessages({
    payload: payload as never,
    bookingRequestID: "booking",
    orderUUID: "reference",
    paymentOrderID: "order",
    status: "paid",
  })
  expect(
    messages.find((message) => message.recipientType === "client")?.recipient
  ).toBe("original@example.com")
  expect(
    messages.find((message) => message.recipientType === "internal")?.recipient
  ).toBe("support@example.com")
})
