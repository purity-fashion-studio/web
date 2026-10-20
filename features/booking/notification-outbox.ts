import type { Payload, PayloadRequest } from "payload"

import type { NotificationOutbox } from "@/payload-types"
import { env } from "@/lib/env"

import { tryWithAdvisoryLock } from "./advisory-lock"
import { sendOutboxEmail } from "./resend-email"

export type OutboxMessage = {
  bookingRequest?: string
  deduplicationKey: string
  paymentOrder?: string
  recipient: string
  recipientType: "client" | "internal"
  subject: string
  text: string
}

const maxAttempts = 10

function nextAttempt(attempts: number) {
  const delay = Math.min(
    24 * 60 * 60_000,
    30_000 * 2 ** Math.max(0, attempts - 1)
  )
  return new Date(Date.now() + delay).toISOString()
}

export async function enqueueNotifications({
  payload,
  messages,
  req,
}: {
  payload: Payload
  messages: OutboxMessage[]
  req?: PayloadRequest
}) {
  for (const message of messages) {
    const existing = await payload.find({
      collection: "notification-outbox",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: { deduplicationKey: { equals: message.deduplicationKey } },
    })
    if (existing.docs[0]) continue

    await payload.create({
      collection: "notification-outbox",
      context: { service: "notification-outbox" },
      depth: 0,
      data: {
        ...message,
        attempts: 0,
        nextAttemptAt: new Date().toISOString(),
        status: "pending",
      },
      overrideAccess: true,
      req,
    })
  }
}

function providerMessageID(response: unknown) {
  if (
    response &&
    typeof response === "object" &&
    "id" in response &&
    typeof response.id === "string"
  ) {
    return response.id.slice(0, 500)
  }
  return undefined
}

function relationshipID(value: unknown) {
  if (typeof value === "string") return value
  if (
    value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string"
  ) {
    return value.id
  }
  return undefined
}

async function syncNotificationSummary(
  payload: Payload,
  message: NotificationOutbox
) {
  const paymentOrder = relationshipID(message.paymentOrder)
  const bookingRequest = relationshipID(message.bookingRequest)
  if (!paymentOrder && !bookingRequest) return

  const related = await payload.find({
    collection: "notification-outbox",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: paymentOrder
      ? { paymentOrder: { equals: paymentOrder } }
      : {
          and: [
            { bookingRequest: { equals: bookingRequest } },
            { paymentOrder: { exists: false } },
          ],
        },
  })
  const status = related.docs.every((item) => item.status === "sent")
    ? "sent"
    : related.docs.some((item) => item.status === "dead")
      ? "failed"
      : "pending"
  const notificationError =
    related.docs.find((item) => item.status === "dead")?.sanitizedError ?? null

  if (paymentOrder) {
    await payload.update({
      collection: "payment-orders",
      id: paymentOrder,
      context: { service: "notification-outbox" },
      data: { notificationError, notificationStatus: status },
      overrideAccess: true,
    })
  } else if (bookingRequest) {
    await payload.update({
      collection: "booking-requests",
      id: bookingRequest,
      context: { service: "notification-outbox" },
      data: { notificationError, notificationStatus: status },
      overrideAccess: true,
    })
  }
}

async function deliverOne(payload: Payload, candidate: NotificationOutbox) {
  return tryWithAdvisoryLock(
    payload,
    "notification",
    candidate.id,
    async () => {
      const current = await payload.findByID({
        collection: "notification-outbox",
        id: candidate.id,
        depth: 0,
        overrideAccess: true,
      })
      if (
        current.status === "sent" ||
        current.status === "dead" ||
        new Date(current.nextAttemptAt).getTime() > Date.now()
      ) {
        return "skipped" as const
      }

      const attempts = current.attempts + 1
      await payload.update({
        collection: "notification-outbox",
        id: current.id,
        context: { service: "notification-outbox" },
        data: {
          attempts,
          lockedAt: new Date().toISOString(),
          sanitizedError: null,
          status: "processing",
        },
        overrideAccess: true,
      })

      try {
        const response = await sendOutboxEmail({
          deduplicationKey: current.deduplicationKey,
          recipient: current.recipient,
          subject: current.subject,
          text: current.text,
        })
        await payload.update({
          collection: "notification-outbox",
          id: current.id,
          context: { service: "notification-outbox" },
          data: {
            lockedAt: null,
            providerMessageID: providerMessageID(response),
            status: "sent",
          },
          overrideAccess: true,
        })
        await syncNotificationSummary(payload, current)
        return "sent" as const
      } catch (error) {
        const dead = attempts >= maxAttempts
        await payload.update({
          collection: "notification-outbox",
          id: current.id,
          context: { service: "notification-outbox" },
          data: {
            lockedAt: null,
            nextAttemptAt: nextAttempt(attempts),
            sanitizedError:
              error instanceof Error
                ? error.message.slice(0, 500)
                : "Email delivery failed",
            status: dead ? "dead" : "retryable",
          },
          overrideAccess: true,
        })
        await syncNotificationSummary(payload, current)
        return dead ? ("dead" as const) : ("retryable" as const)
      }
    }
  )
}

export async function deliverNotificationBatch(payload: Payload, limit = 100) {
  if (env.EMAIL_MODE === "offline" || env.EMAIL_MODE === "disabled") {
    return { checked: 0, sent: 0, retryable: 0, dead: 0, disabled: true }
  }
  const due = await payload.find({
    collection: "notification-outbox",
    depth: 0,
    limit,
    overrideAccess: true,
    sort: "nextAttemptAt",
    where: {
      and: [
        { status: { in: ["pending", "processing", "retryable"] } },
        { nextAttemptAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
  })
  const counts = { checked: due.docs.length, sent: 0, retryable: 0, dead: 0 }
  for (const item of due.docs) {
    const result = await deliverOne(payload, item)
    if (result === "sent") counts.sent += 1
    if (result === "retryable") counts.retryable += 1
    if (result === "dead") counts.dead += 1
  }
  return counts
}
