import { z } from "zod/v4"

export const inquiryTypes = ["private", "corporate"] as const
export const formats = ["studio", "online", "atelier"] as const
export const paymentCurrencies = ["EUR", "UAH"] as const
export const paymentProviders = ["stripe", "liqpay"] as const
export const contactMethods = ["email", "phone", "viber"] as const

export type InquiryType = (typeof inquiryTypes)[number]
export type BookingFormat = (typeof formats)[number]
export type PaymentCurrency = (typeof paymentCurrencies)[number]
export type PaymentProvider = (typeof paymentProviders)[number]
export type ContactMethod = (typeof contactMethods)[number]

export const bookingSchema = z
  .object({
    inquiryType: z.enum(inquiryTypes),
    serviceSlug: z
      .string()
      .trim()
      .min(1, { message: "required" })
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "required" }),
    name: z.string().trim().min(2, { message: "required" }).max(120),
    email: z.string().trim().email({ message: "email" }).max(160),
    phone: z.string().trim().max(60).optional(),
    company: z.string().trim().max(160).optional(),
    format: z.enum(formats),
    contactMethod: z.enum(contactMethods),
    budgetCurrency: z.enum(paymentCurrencies),
    preferredAt: z.string().trim().max(80).optional(),
    message: z.string().trim().min(20, { message: "message" }).max(1200),
    consent: z.boolean().refine(Boolean, { message: "consent" }),
  })
  .superRefine((value, context) => {
    if (value.inquiryType === "corporate" && !value.company?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["company"],
        message: "companyRequired",
      })
    }

    if (
      (value.contactMethod === "phone" || value.contactMethod === "viber") &&
      !value.phone?.trim()
    ) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "phoneRequired",
      })
    }
  })

export type BookingInput = z.input<typeof bookingSchema>
export type BookingValues = z.output<typeof bookingSchema>
export type BookingFieldErrors = Partial<Record<keyof BookingInput, string>>

export type BookingResult =
  | {
      status: "idle"
    }
  | {
      status: "success"
      leadId: string
      bookingRequestId?: string
      checkoutUrl?: string
      provider?: PaymentProvider
      currency?: PaymentCurrency
    }
  | {
      status: "error"
      message: string
      fieldErrors?: BookingFieldErrors
    }

export function routePaymentProvider(
  currency: PaymentCurrency
): PaymentProvider {
  return currency === "UAH" ? "liqpay" : "stripe"
}

export function createLeadId() {
  return `purity-${Date.now().toString(36)}`
}
