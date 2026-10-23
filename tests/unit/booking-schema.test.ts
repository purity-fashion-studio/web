import { describe, expect, it } from "vitest"

import { bookingSchema, routePaymentProvider } from "@/features/booking/schema"

const validBooking = {
  inquiryType: "private" as const,
  serviceSlug: "research",
  name: "Test Client",
  email: "client@example.com",
  phone: "",
  company: "",
  format: "studio" as const,
  contactMethod: "email" as const,
  budgetCurrency: "EUR" as const,
  preferredAt: "",
  message: "A sufficiently detailed consultation request.",
  consent: true,
}

describe("booking input contract", () => {
  it("accepts a valid private email booking", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true)
  })

  it("requires company and phone in their conditional modes", () => {
    expect(
      bookingSchema.safeParse({
        ...validBooking,
        inquiryType: "corporate",
        contactMethod: "phone",
      }).success
    ).toBe(false)
  })

  it("routes currencies to the correct provider", () => {
    expect(routePaymentProvider("EUR")).toBe("stripe")
    expect(routePaymentProvider("UAH")).toBe("liqpay")
  })

  it.each(["not-a-date", "2026-02-31T12:00:00Z", "2026-13-01T12:00:00Z"])(
    "rejects invalid appointment %s",
    (preferredAt) => {
      expect(
        bookingSchema.safeParse({ ...validBooking, preferredAt }).success
      ).toBe(false)
    }
  )

  it("accepts an explicit appointment offset", () => {
    expect(
      bookingSchema.safeParse({
        ...validBooking,
        preferredAt: "2026-11-20T12:00:00+02:00",
      }).success
    ).toBe(true)
  })
})
