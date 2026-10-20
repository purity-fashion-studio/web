import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { after } from "next/server"
import { getPayload } from "payload"

import config from "@payload-config"
import { deliverNotificationBatch } from "@/features/booking/notification-outbox"
import { correlationID } from "@/features/booking/operation-log"
import { processNormalizedPaymentWebhook } from "@/features/booking/payment-webhook-processing"
import { processWebhookEvent } from "@/features/booking/webhook-events"
import { env } from "@/lib/env"

type StripeEvent = {
  id: string
  type: string
  data: {
    object: {
      id?: string
      amount_total?: number | null
      currency?: string | null
      payment_status?: string | null
      payment_intent?: string | null
      amount_refunded?: number | null
      client_reference_id?: string | null
      metadata?: { order_uuid?: string }
    }
  }
}

const maxWebhookBytes = 256 * 1024

function verifyStripeSignature(body: string, header: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) return false
  const parts = header.split(",")
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2)
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
  if (!timestamp || signatures.length === 0) return false
  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300)
    return false
  const expected = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${body}`)
    .digest("hex")
  return signatures.some((signature) => {
    const left = Buffer.from(expected)
    const right = Buffer.from(signature)
    return left.length === right.length && timingSafeEqual(left, right)
  })
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
  const body = await request.text()
  if (Buffer.byteLength(body, "utf8") > maxWebhookBytes) {
    return Response.json(
      { error: "Payload too large", correlationID: requestCorrelationID },
      { status: 413 }
    )
  }
  const signature = request.headers.get("stripe-signature")
  if (!signature || !verifyStripeSignature(body, signature)) {
    return Response.json(
      { error: "Invalid signature", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }

  let event: StripeEvent
  try {
    event = JSON.parse(body) as StripeEvent
  } catch {
    return Response.json(
      { error: "Invalid payload", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }
  if (!event.id || !event.type || !event.data?.object) {
    return Response.json(
      { error: "Invalid event", correlationID: requestCorrelationID },
      { status: 400 }
    )
  }

  const payload = await getPayload({ config })
  const object = event.data.object
  const orderUUID = object.metadata?.order_uuid ?? object.client_reference_id
  const normalizedPayload = {
    amount:
      event.type === "charge.refunded"
        ? (object.amount_refunded ?? null)
        : (object.amount_total ?? null),
    currency: object.currency?.toUpperCase() ?? null,
    objectID: object.id ?? null,
    orderUUID: orderUUID ?? null,
    paymentIntentID: object.payment_intent ?? null,
    paymentStatus: object.payment_status ?? null,
  }

  try {
    await processWebhookEvent({
      payload,
      provider: "stripe",
      providerEventID: event.id,
      eventType: event.type,
      payloadHash: createHash("sha256").update(body).digest("hex"),
      normalizedPayload,
      process: () =>
        processNormalizedPaymentWebhook({
          payload,
          provider: "stripe",
          eventType: event.type,
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
      operation: "stripe-webhook",
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
