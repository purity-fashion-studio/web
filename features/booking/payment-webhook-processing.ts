import type { Payload } from "payload"

import { isPaymentAmountAllowed } from "@/lib/payment-limits"
import { transitionPayment } from "./payment-persistence"

export type PaymentWebhookProvider = "stripe" | "liqpay"
export type NormalizedWebhookPayload = Record<string, unknown>
export type PaymentWebhookOutcome = {
  paymentOrder?: string
  status: "processed" | "ignored"
}

function stringValue(payload: NormalizedWebhookPayload, key: string) {
  const value = payload[key]
  return typeof value === "string" && value ? value : undefined
}

function numberValue(payload: NormalizedWebhookPayload, key: string) {
  const value = payload[key]
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function currencyValue(payload: NormalizedWebhookPayload) {
  const value = stringValue(payload, "currency")
  return value?.toUpperCase()
}

async function findOrder(
  payload: Payload,
  provider: PaymentWebhookProvider,
  orderUUID: string | undefined,
  providerPaymentID: string | undefined
) {
  if (!orderUUID && !providerPaymentID) return undefined

  const result = await payload.find({
    collection: "payment-orders",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: orderUUID
      ? { orderUUID: { equals: orderUUID } }
      : { providerPaymentID: { equals: providerPaymentID } },
  })
  const order = result.docs[0]
  return order?.provider === provider ? order : undefined
}

async function processStripeWebhook({
  payload,
  eventType,
  normalizedPayload,
}: {
  payload: Payload
  eventType: string
  normalizedPayload: NormalizedWebhookPayload
}): Promise<PaymentWebhookOutcome> {
  const orderUUID = stringValue(normalizedPayload, "orderUUID")
  const paymentIntentID = stringValue(normalizedPayload, "paymentIntentID")
  const order = await findOrder(payload, "stripe", orderUUID, paymentIntentID)
  if (!order) return { status: "ignored" }

  const amount = numberValue(normalizedPayload, "amount")
  const currency = currencyValue(normalizedPayload)
  const objectID = stringValue(normalizedPayload, "objectID")
  const paymentStatus = stringValue(normalizedPayload, "paymentStatus")
  const paymentOrder = order.id
  const paid =
    [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(eventType) && paymentStatus === "paid"

  if (paid) {
    if (
      !isPaymentAmountAllowed(amount) ||
      !isPaymentAmountAllowed(order.amount) ||
      amount !== order.amount ||
      currency !== order.currency
    ) {
      throw new Error("Provider amount or currency mismatch")
    }
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "stripe-webhook",
      transition: {
        status: "paid",
        paidAmount: amount,
        providerOrderID: objectID,
        providerPaymentID: paymentIntentID,
      },
      notificationStatus: "paid",
    })
  } else if (eventType === "charge.refunded") {
    if (
      amount == null ||
      currency !== order.currency ||
      !isPaymentAmountAllowed(amount) ||
      amount > order.amount
    ) {
      throw new Error("Provider refund amount or currency mismatch")
    }
    const status =
      amount === order.amount
        ? ("refunded" as const)
        : ("partially-refunded" as const)
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "stripe-webhook",
      transition: { status, refundedAmount: amount },
      notificationStatus: "refunded",
      notificationDedupe: `${status}:${amount}`,
    })
  } else if (eventType === "charge.dispute.created") {
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "stripe-webhook",
      transition: { status: "disputed", safeFailureCode: "disputed" },
    })
  } else if (eventType === "checkout.session.expired") {
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "stripe-webhook",
      transition: { status: "expired", safeFailureCode: "expired" },
      notificationStatus: "failed",
      notificationDedupe: "expired",
    })
  } else if (eventType === "checkout.session.async_payment_failed") {
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "stripe-webhook",
      transition: {
        status: "failed",
        safeFailureCode: "async-payment-failed",
      },
      notificationStatus: "failed",
    })
  } else {
    return { paymentOrder, status: "ignored" }
  }

  return { paymentOrder, status: "processed" }
}

async function processLiqPayWebhook({
  payload,
  eventType,
  normalizedPayload,
}: {
  payload: Payload
  eventType: string
  normalizedPayload: NormalizedWebhookPayload
}): Promise<PaymentWebhookOutcome> {
  const orderUUID = stringValue(normalizedPayload, "orderUUID")
  const order = await findOrder(payload, "liqpay", orderUUID, undefined)
  if (!order) return { status: "ignored" }

  const amount = numberValue(normalizedPayload, "amount")
  const currency = currencyValue(normalizedPayload)
  const paymentID = stringValue(normalizedPayload, "paymentID")
  const transactionID = stringValue(normalizedPayload, "transactionID")
  const paymentOrder = order.id
  const paid =
    eventType === "success" ||
    (eventType === "sandbox" && order.mode === "test")

  if (paid) {
    if (
      !isPaymentAmountAllowed(amount) ||
      !isPaymentAmountAllowed(order.amount) ||
      amount !== order.amount ||
      currency !== order.currency
    ) {
      throw new Error("Provider amount or currency mismatch")
    }
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "liqpay-webhook",
      transition: {
        status: "paid",
        paidAmount: amount,
        providerOrderID: transactionID ?? paymentID ?? order.orderUUID,
        providerPaymentID: paymentID,
      },
      notificationStatus: "paid",
    })
  } else if (["failure", "error"].includes(eventType)) {
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "liqpay-webhook",
      transition: { status: "failed", safeFailureCode: eventType },
      notificationStatus: "failed",
    })
  } else if (["reversed", "refund"].includes(eventType)) {
    const refundedAmount = amount && amount > 0 ? amount : order.amount
    if (
      !isPaymentAmountAllowed(refundedAmount) ||
      !isPaymentAmountAllowed(order.amount) ||
      refundedAmount > order.amount
    ) {
      throw new Error("Provider refund amount mismatch")
    }
    const status =
      refundedAmount === order.amount
        ? ("refunded" as const)
        : ("partially-refunded" as const)
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "liqpay-webhook",
      transition: { status, refundedAmount },
      notificationStatus: "refunded",
      notificationDedupe: `${status}:${refundedAmount}`,
    })
  } else if (["expired", "unsubscribed"].includes(eventType)) {
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "liqpay-webhook",
      transition: { status: "expired", safeFailureCode: eventType },
      notificationStatus: "failed",
      notificationDedupe: "expired",
    })
  } else if (eventType === "chargeback") {
    await transitionPayment({
      payload,
      orderID: order.id,
      service: "liqpay-webhook",
      transition: { status: "disputed", safeFailureCode: "disputed" },
    })
  } else if (eventType === "hold_wait") {
    await payload.update({
      collection: "payment-orders",
      id: order.id,
      context: { service: "liqpay-webhook" },
      data: {
        auditNote:
          "LiqPay hold_wait confirms funds are held; dispute state requires a chargeback event.",
        nextReconcileAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
  } else if (
    !["wait_secure", "processing", "prepared", "3ds_verify"].includes(eventType)
  ) {
    return { paymentOrder, status: "ignored" }
  }

  return { paymentOrder, status: "processed" }
}

export function processNormalizedPaymentWebhook({
  payload,
  provider,
  eventType,
  normalizedPayload,
}: {
  payload: Payload
  provider: PaymentWebhookProvider
  eventType: string
  normalizedPayload: NormalizedWebhookPayload
}) {
  return provider === "stripe"
    ? processStripeWebhook({ payload, eventType, normalizedPayload })
    : processLiqPayWebhook({ payload, eventType, normalizedPayload })
}
