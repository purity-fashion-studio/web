import { createHash, timingSafeEqual } from "node:crypto"
import { after } from "next/server"
import { getPayload } from "payload"

import config from "@payload-config"
import { deliverNotificationBatch } from "@/features/booking/notification-outbox"
import { correlationID } from "@/features/booking/operation-log"
import { processNormalizedPaymentWebhook } from "@/features/booking/payment-webhook-processing"
import { processWebhookEvent } from "@/features/booking/webhook-events"
import { env } from "@/lib/env"

type LiqPayCallback = {
  order_id?: string
  payment_id?: number
  transaction_id?: number
  status?: string
  amount?: number
  currency?: string
}

const maxWebhookBytes = 256 * 1024

function liqpaySignature(data: string) {
  if (!env.LIQPAY_PRIVATE_KEY) return undefined
  return createHash("sha3-256")
    .update(`${env.LIQPAY_PRIVATE_KEY}${data}${env.LIQPAY_PRIVATE_KEY}`)
    .digest("base64")
}

export async function POST(request: Request) {
  const requestCorrelationID = correlationID(request)
  const declaredLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(declaredLength) && declaredLength > maxWebhookBytes) {
    return Response.json(
      { error: "Payload too large", correlationID: requestCorrelationID },
      { status: 413 }
    )
  }
  const form = await request.formData()
  const data = form.get("data")
  const signature = form.get("signature")
  if (typeof data !== "string" || typeof signature !== "string") {
    return Response.json(
      { error: "Invalid callback", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }
  if (Buffer.byteLength(data, "utf8") > maxWebhookBytes) {
    return Response.json(
      { error: "Payload too large", correlationID: requestCorrelationID },
      { status: 413 }
    )
  }
  if (!env.LIQPAY_PRIVATE_KEY) {
    return Response.json(
      { error: "Invalid signature", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }
  const expected = Buffer.from(liqpaySignature(data) ?? "")
  const supplied = Buffer.from(signature)
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    return Response.json(
      { error: "Invalid signature", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }

  let callback: LiqPayCallback
  try {
    callback = JSON.parse(Buffer.from(data, "base64").toString("utf8"))
  } catch {
    return Response.json(
      { error: "Invalid data", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }
  if (!callback.order_id || !callback.status) {
    return Response.json(
      { error: "Invalid event", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }

  const callbackStatus = callback.status
  const providerEventID = `${callback.order_id}:${callbackStatus}:${callback.transaction_id ?? callback.payment_id ?? "none"}`
  const payload = await getPayload({ config })
  const amount = Math.round((callback.amount ?? -1) * 100)
  const normalizedPayload = {
    amount,
    currency: callback.currency?.toUpperCase() ?? null,
    orderUUID: callback.order_id,
    paymentID: callback.payment_id == null ? null : String(callback.payment_id),
    status: callbackStatus,
    transactionID:
      callback.transaction_id == null ? null : String(callback.transaction_id),
  }

  try {
    await processWebhookEvent({
      payload,
      provider: "liqpay",
      providerEventID,
      eventType: callbackStatus,
      payloadHash: createHash("sha256").update(data).digest("hex"),
      normalizedPayload,
      process: () =>
        processNormalizedPaymentWebhook({
          payload,
          provider: "liqpay",
          eventType: callbackStatus,
          normalizedPayload,
        }),
    })
    after(() => deliverNotificationBatch(payload, 10))
    return Response.json({
      received: true,
      correlationID: requestCorrelationID,
    })
  } catch (error) {
    payload.logger.error({
      correlationID: requestCorrelationID,
      operation: "liqpay-webhook",
      code: "webhook-processing-failed",
      err: {
        name: error instanceof Error ? error.name : "UnknownError",
        message: "webhook-processing-failed",
      },
    })
    return Response.json(
      { error: "Event processing failed", correlationID: requestCorrelationID },
      { status: 500 }
    )
  }
}
