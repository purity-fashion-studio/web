import { createHash } from "node:crypto"

import { env } from "@/lib/env"
import { isPaymentAmountAllowed } from "@/lib/payment-limits"

import type { BookingValues, PaymentCurrency, PaymentProvider } from "./schema"
import type { Locale } from "@/i18n/routing"

type PaymentOrder = {
  id: string
  provider: PaymentProvider
  currency: PaymentCurrency
  checkoutUrl: string
  expiresAt?: string
  mode: "test" | "live"
}

type CreatePaymentOrderInput = {
  amount: number
  booking: Pick<BookingValues, "email" | "budgetCurrency">
  idempotencyKey: string
  locale: Locale
  orderUUID: string
  origin: string
  title: string
}

interface PaymentAdapter {
  provider: PaymentProvider
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>
  getPaymentStatus(input: {
    amount: number
    currency: PaymentCurrency
    mode: "test" | "live"
    orderUUID: string
    providerOrderID?: string
  }): Promise<{
    status: "pending" | "paid" | "failed" | "expired"
    paidAmount?: number
  }>
}

function paymentReturnUrl(
  origin: string,
  locale: Locale,
  status: "success" | "cancel" | "failure"
) {
  return `${origin}/${locale}/payment/${status}`
}

async function createStripeOrder({
  amount,
  booking,
  idempotencyKey,
  locale,
  orderUUID,
  origin,
  title,
}: CreatePaymentOrderInput): Promise<PaymentOrder> {
  if (!isPaymentAmountAllowed(amount)) {
    throw new Error("Payment amount exceeds the provider-safe limit")
  }
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured")

  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${paymentReturnUrl(origin, locale, "success")}?order=${orderUUID}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${paymentReturnUrl(origin, locale, "cancel")}?order=${orderUUID}`,
    client_reference_id: orderUUID,
    customer_email: booking.email,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": booking.budgetCurrency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(amount),
    "line_items[0][price_data][product_data][name]": title,
    "metadata[order_uuid]": orderUUID,
    "payment_intent_data[metadata][order_uuid]": orderUUID,
  })
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey,
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })
  const session = (await response.json()) as {
    id?: string
    url?: string
    expires_at?: number
    error?: { message?: string }
  }
  if (!response.ok || !session.id || !session.url) {
    throw new Error(session.error?.message ?? "Stripe checkout creation failed")
  }
  return {
    id: session.id,
    provider: "stripe",
    currency: booking.budgetCurrency,
    checkoutUrl: session.url,
    expiresAt: session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : undefined,
    mode: "live",
  }
}

const stripeAdapter: PaymentAdapter = {
  provider: "stripe",
  async createOrder(input) {
    if (!isPaymentAmountAllowed(input.amount)) {
      throw new Error("Payment amount exceeds the provider-safe limit")
    }
    if (env.PAYMENT_MODE === "live") return createStripeOrder(input)
    return {
      id: `stripe-test-${input.orderUUID}`,
      provider: "stripe",
      currency: input.booking.budgetCurrency,
      checkoutUrl: `${paymentReturnUrl(input.origin, input.locale, "success")}?provider=stripe&order=${input.orderUUID}`,
      mode: "test",
    }
  },
  async getPaymentStatus(input) {
    if (!isPaymentAmountAllowed(input.amount)) {
      throw new Error("Payment amount exceeds the provider-safe limit")
    }
    if (input.mode === "test") return { status: "pending" }
    if (!env.STRIPE_SECRET_KEY || !input.providerOrderID) {
      throw new Error("Stripe reconciliation is not configured")
    }
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(input.providerOrderID)}`,
      {
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      }
    )
    const session = (await response.json()) as {
      amount_total?: number | null
      currency?: string | null
      payment_status?: string | null
      status?: string | null
    }
    if (!response.ok) throw new Error("Stripe status lookup failed")
    if (session.payment_status === "paid") {
      if (
        session.amount_total !== input.amount ||
        session.currency?.toUpperCase() !== input.currency
      ) {
        throw new Error("Stripe reconciliation amount mismatch")
      }
      return { status: "paid", paidAmount: session.amount_total }
    }
    if (session.status === "expired") return { status: "expired" }
    return { status: "pending" }
  },
}

const liqpayAdapter: PaymentAdapter = {
  provider: "liqpay",
  async createOrder(input) {
    if (!isPaymentAmountAllowed(input.amount)) {
      throw new Error("Payment amount exceeds the provider-safe limit")
    }
    if (
      env.PAYMENT_MODE === "live" &&
      (!env.LIQPAY_PUBLIC_KEY || !env.LIQPAY_PRIVATE_KEY)
    ) {
      throw new Error("LiqPay is not configured")
    }
    return {
      id: input.orderUUID,
      provider: "liqpay",
      currency: input.booking.budgetCurrency,
      checkoutUrl:
        env.PAYMENT_MODE === "live"
          ? `${input.origin}/api/payments/liqpay/start?order=${input.orderUUID}&locale=${input.locale}`
          : `${paymentReturnUrl(input.origin, input.locale, "success")}?provider=liqpay&order=${input.orderUUID}`,
      mode: env.PAYMENT_MODE,
    }
  },
  async getPaymentStatus(input) {
    if (!isPaymentAmountAllowed(input.amount)) {
      throw new Error("Payment amount exceeds the provider-safe limit")
    }
    if (input.mode === "test") return { status: "pending" }
    if (!env.LIQPAY_PUBLIC_KEY || !env.LIQPAY_PRIVATE_KEY) {
      throw new Error("LiqPay reconciliation is not configured")
    }
    const data = Buffer.from(
      JSON.stringify({
        action: "status",
        version: 3,
        public_key: env.LIQPAY_PUBLIC_KEY,
        order_id: input.orderUUID,
      })
    ).toString("base64")
    const signature = createHash("sha3-256")
      .update(`${env.LIQPAY_PRIVATE_KEY}${data}${env.LIQPAY_PRIVATE_KEY}`)
      .digest("base64")
    const response = await fetch("https://www.liqpay.ua/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data, signature }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    const result = (await response.json()) as {
      status?: string
      amount?: number
      currency?: string
    }
    if (!response.ok || !result.status) {
      throw new Error("LiqPay status lookup failed")
    }
    if (result.status === "success") {
      const amount = Math.round((result.amount ?? -1) * 100)
      if (amount !== input.amount || result.currency !== input.currency) {
        throw new Error("LiqPay reconciliation amount mismatch")
      }
      return { status: "paid", paidAmount: amount }
    }
    if (["failure", "error", "reversed"].includes(result.status)) {
      return { status: "failed" }
    }
    return { status: "pending" }
  },
}

export function getPaymentAdapter(provider: PaymentProvider) {
  return provider === "liqpay" ? liqpayAdapter : stripeAdapter
}
