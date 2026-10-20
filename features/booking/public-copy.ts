import type {
  BookingFormat,
  ContactMethod,
  InquiryType,
  PaymentCurrency,
  PaymentProvider,
} from "./schema"

export type PaymentStatus =
  | "success"
  | "pending"
  | "cancel"
  | "failure"
  | "refunded"

export type BookingPublicCopy = {
  eyebrow: string
  title: string
  summary: string
  privateInquiry: string
  corporateInquiry: string
  submit: string
  submitting: string
  emptyService: string
  successTitle: string
  successSummary: string
  errorTitle: string
  validationError: string
  checkout: string
  routingTitle: string
  routingSummary: string
  contactTitle: string
  paymentTitle: string
  stepsTitle: string
  stepDetails: string
  stepReview: string
  reviewTitle: string
  reviewSummary: string
  notSpecified: string
  labels: {
    inquiryType: string
    serviceSlug: string
    name: string
    email: string
    phone: string
    company: string
    format: string
    contactMethod: string
    budgetCurrency: string
    preferredAt: string
    message: string
    consent: string
  }
  inquiryTypes: Record<InquiryType, string>
  formats: Record<BookingFormat, string>
  contactMethods: Record<ContactMethod, string>
  currencies: Record<PaymentCurrency, string>
  providers: Record<PaymentProvider, string>
  errors: {
    required: string
    email: string
    message: string
    consent: string
    companyRequired: string
    phoneRequired: string
  }
  paymentStatus: {
    provider: string
    order: string
    notProvided: string
    referenceReceived: string
  }
  pricing: {
    from: string
    custom: string
  }
}

export function localizeBookingError(
  copy: BookingPublicCopy["errors"],
  message?: string
) {
  if (!message) return copy.required

  if (message in copy) {
    return copy[message as keyof typeof copy]
  }

  if (message.toLowerCase().includes("email")) return copy.email
  if (message.toLowerCase().includes("too small")) return copy.message

  return copy.required
}
