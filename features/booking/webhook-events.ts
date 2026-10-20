import type { Payload } from "payload"

import { withAdvisoryLock } from "./advisory-lock"
import {
  processNormalizedPaymentWebhook,
  type NormalizedWebhookPayload,
  type PaymentWebhookProvider,
} from "./payment-webhook-processing"

type WebhookProvider = PaymentWebhookProvider
type WebhookOutcome = {
  paymentOrder?: string
  status: "processed" | "ignored"
}

const maxWebhookAttempts = 8

function normalizedRecord(value: unknown): NormalizedWebhookPayload {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as NormalizedWebhookPayload)
    : {}
}

function retryAt(attempts: number) {
  const delay = Math.min(60 * 60_000, 5_000 * 2 ** Math.max(0, attempts - 1))
  return new Date(Date.now() + delay).toISOString()
}

export async function processWebhookEvent({
  payload,
  provider,
  providerEventID,
  eventType,
  payloadHash,
  normalizedPayload,
  process,
}: {
  payload: Payload
  provider: WebhookProvider
  providerEventID: string
  eventType: string
  payloadHash: string
  normalizedPayload: NormalizedWebhookPayload
  process: () => Promise<WebhookOutcome>
}) {
  const deduplicationKey = `${provider}:${providerEventID}`
  return withAdvisoryLock(payload, "webhook", deduplicationKey, async () => {
    const found = await payload.find({
      collection: "webhook-events",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { deduplicationKey: { equals: deduplicationKey } },
    })
    const existing = found.docs[0]
    if (
      existing?.processingStatus === "processed" ||
      existing?.processingStatus === "ignored"
    ) {
      return { duplicate: true as const, status: existing.processingStatus }
    }

    const attempts = (existing?.attempts ?? 0) + 1
    const webhook = existing
      ? await payload.update({
          collection: "webhook-events",
          id: existing.id,
          context: { service: `${provider}-webhook` },
          data: {
            attempts,
            eventType,
            lockedAt: new Date().toISOString(),
            nextRetryAt: null,
            normalizedPayload,
            payloadHash,
            processingStatus: "received",
            receivedAt: new Date().toISOString(),
            sanitizedError: null,
          },
          overrideAccess: true,
        })
      : await payload.create({
          collection: "webhook-events",
          context: { service: `${provider}-webhook` },
          data: {
            attempts,
            deduplicationKey,
            eventType,
            lockedAt: new Date().toISOString(),
            normalizedPayload,
            payloadHash,
            processingStatus: "received",
            provider,
            providerEventID,
            receivedAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })

    try {
      const outcome = await process()
      await payload.update({
        collection: "webhook-events",
        id: webhook.id,
        context: { service: `${provider}-webhook` },
        data: {
          lockedAt: null,
          paymentOrder: outcome.paymentOrder,
          processingStatus: outcome.status,
        },
        overrideAccess: true,
      })
      return { duplicate: false as const, status: outcome.status }
    } catch (error) {
      await payload.update({
        collection: "webhook-events",
        id: webhook.id,
        context: { service: `${provider}-webhook` },
        data: {
          lockedAt: null,
          nextRetryAt: retryAt(attempts),
          processingStatus: "failed",
          sanitizedError:
            error instanceof Error
              ? error.message.slice(0, 500)
              : "Processing failed",
        },
        overrideAccess: true,
      })
      throw error
    }
  })
}

export async function retryDueWebhookEvents(payload: Payload, limit = 100) {
  const now = new Date().toISOString()
  const exhausted = await payload.count({
    collection: "webhook-events",
    overrideAccess: true,
    where: {
      and: [
        { processingStatus: { equals: "failed" } },
        { attempts: { greater_than_equal: maxWebhookAttempts } },
      ],
    },
  })
  const due = await payload.find({
    collection: "webhook-events",
    depth: 0,
    limit,
    overrideAccess: true,
    pagination: false,
    sort: "nextRetryAt",
    where: {
      and: [
        { processingStatus: { equals: "failed" } },
        { nextRetryAt: { less_than_equal: now } },
        { attempts: { less_than: maxWebhookAttempts } },
      ],
    },
  })
  const counts = {
    checked: 0,
    processed: 0,
    ignored: 0,
    failed: 0,
    exhausted: exhausted.totalDocs,
  }

  for (const event of due.docs) {
    counts.checked += 1
    if (event.provider !== "stripe" && event.provider !== "liqpay") {
      counts.ignored += 1
      continue
    }
    const provider = event.provider

    try {
      const result = await processWebhookEvent({
        payload,
        provider,
        providerEventID: event.providerEventID,
        eventType: event.eventType,
        payloadHash: event.payloadHash,
        normalizedPayload: normalizedRecord(event.normalizedPayload),
        process: () =>
          processNormalizedPaymentWebhook({
            payload,
            provider,
            eventType: event.eventType,
            normalizedPayload: normalizedRecord(event.normalizedPayload),
          }),
      })
      if (result.status === "processed") counts.processed += 1
      else counts.ignored += 1
    } catch {
      counts.failed += 1
    }
  }

  return counts
}
