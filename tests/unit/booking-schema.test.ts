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
})
