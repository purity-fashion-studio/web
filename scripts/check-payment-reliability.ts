import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { getPayload } from "payload"

import config from "../payload.config"
import { transitionPayment } from "../features/booking/payment-persistence"
import { processWebhookEvent } from "../features/booking/webhook-events"

const configuredDatabaseURL = process.env.DATABASE_URL
assert.ok(
  configuredDatabaseURL,
  "Payment integration checks require DATABASE_URL for local PostgreSQL"
)
let databaseURL: URL
try {
  databaseURL = new URL(configuredDatabaseURL)
} catch {
  throw new Error("Payment integration checks require a valid DATABASE_URL")
}
assert.ok(
  ["127.0.0.1", "localhost", "::1"].includes(databaseURL.hostname),
  "Payment integration checks only run against local PostgreSQL"
)

const payload = await getPayload({ config })
const suffix = randomUUID()
const created = {
  bookingRequest: "",
  lead: "",
  paymentOrder: "",
  webhookEvents: [] as string[],
}
let failure: unknown

try {
  const services = await payload.find({
    collection: "services",
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const service = services.docs[0]
  assert.ok(service, "Seeded service is required")

  const lead = await payload.create({
    collection: "leads",
    context: { service: "payment-integration-check" },
    data: {
      identityKey: `email:payment-${suffix}@example.com`,
      name: "Payment integration",
      email: `payment-${suffix}@example.com`,
      preferredContactMethod: "email",
      locale: "en",
      sourceType: "booking",
      consent: {
        version: "payment-integration-v1",
        acceptedAt: new Date().toISOString(),
      },
      duplicateState: "unique",
    },
    overrideAccess: true,
  })
  created.lead = lead.id

  const booking = await payload.create({
    collection: "booking-requests",
    context: { service: "payment-integration-check" },
    data: {
      idempotencyKey: `integration:${suffix}`,
      requestFingerprint: suffix.replaceAll("-", ""),
      lead: lead.id,
      service: service.id,
      inquiryType: "private",
      requestMode: "instant-payment",
      format: "online",
      sourcePage: "/integration",
      status: "awaiting-payment",
      consentVersion: "payment-integration-v1",
      consentAcceptedAt: new Date().toISOString(),
      notificationStatus: "pending",
    },
    overrideAccess: true,
  })
  created.bookingRequest = booking.id

  const order = await payload.create({
    collection: "payment-orders",
    context: { service: "payment-integration-check" },
    data: {
      orderUUID: suffix,
      bookingRequest: booking.id,
      commercialSnapshot: {
        offerID: "integration",
        title: "Payment integration",
        sku: `integration-${suffix}`,
        termsVersion: "integration-v1",
      },
      provider: "stripe",
      amount: 1_000,
      currency: "EUR",
      mode: "test",
      status: "pending",
      idempotencyKey: `payment:integration:${suffix}`,
      notificationStatus: "pending",
      reconciliationAttempts: 0,
    },
    overrideAccess: true,
  })
  created.paymentOrder = order.id
  await payload.update({
    collection: "booking-requests",
    id: booking.id,
    data: { paymentOrder: order.id },
    overrideAccess: true,
  })

  const transitions = await Promise.all(
    Array.from({ length: 20 }, () =>
      transitionPayment({
        payload,
        orderID: order.id,
        service: "stripe-webhook",
        transition: { status: "paid", paidAmount: 1_000 },
        notificationStatus: "paid",
      })
    )
  )
  assert.equal(transitions.filter((result) => result.applied).length, 1)

  const paidOrder = await payload.findByID({
    collection: "payment-orders",
    id: order.id,
    depth: 0,
    overrideAccess: true,
  })
  const confirmedBooking = await payload.findByID({
    collection: "booking-requests",
    id: booking.id,
    depth: 0,
    overrideAccess: true,
  })
  assert.equal(paidOrder.status, "paid")
  assert.equal(paidOrder.paidAmount, 1_000)
  assert.equal(confirmedBooking.status, "confirmed")

  const paidOutbox = await payload.find({
    collection: "notification-outbox",
    depth: 0,
    limit: 10,
    overrideAccess: true,
    where: { paymentOrder: { equals: order.id } },
  })
  assert.equal(paidOutbox.totalDocs, 2)

  await transitionPayment({
    payload,
    orderID: order.id,
    service: "stripe-webhook",
    transition: { status: "partially-refunded", refundedAmount: 100 },
    notificationStatus: "refunded",
    notificationDedupe: "partially-refunded:100",
  })
  await transitionPayment({
    payload,
    orderID: order.id,
    service: "stripe-webhook",
    transition: { status: "partially-refunded", refundedAmount: 200 },
    notificationStatus: "refunded",
    notificationDedupe: "partially-refunded:200",
  })
  await transitionPayment({
    payload,
    orderID: order.id,
    service: "stripe-webhook",
    transition: { status: "refunded", refundedAmount: 1_000 },
    notificationStatus: "refunded",
    notificationDedupe: "refunded:1000",
  })
  const staleFailure = await transitionPayment({
    payload,
    orderID: order.id,
    service: "stripe-webhook",
    transition: { status: "failed", safeFailureCode: "out-of-order" },
  })
  assert.equal(staleFailure.applied, false)
  const refundedOrder = await payload.findByID({
    collection: "payment-orders",
    id: order.id,
    depth: 0,
    overrideAccess: true,
  })
  assert.equal(refundedOrder.status, "refunded")
  assert.equal(refundedOrder.refundedAmount, 1_000)

  let concurrentExecutions = 0
  const concurrentEventID = `evt-concurrent-${suffix}`
  const concurrentResults = await Promise.all(
    Array.from({ length: 20 }, () =>
      processWebhookEvent({
        payload,
        provider: "stripe",
        providerEventID: concurrentEventID,
        eventType: "integration.concurrent",
        payloadHash: suffix.replaceAll("-", ""),
        normalizedPayload: { orderUUID: suffix },
        process: async () => {
          concurrentExecutions += 1
          return { paymentOrder: order.id, status: "processed" }
        },
      })
    )
  )
  assert.equal(concurrentExecutions, 1)
  assert.equal(
    concurrentResults.filter((result) => result.duplicate).length,
    19
  )

  const concurrentEvent = await payload.find({
    collection: "webhook-events",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      deduplicationKey: { equals: `stripe:${concurrentEventID}` },
    },
  })
  assert.ok(concurrentEvent.docs[0])
  created.webhookEvents.push(concurrentEvent.docs[0].id)

  const retryEventID = `evt-retry-${suffix}`
  await assert.rejects(
    processWebhookEvent({
      payload,
      provider: "stripe",
      providerEventID: retryEventID,
      eventType: "integration.retry",
      payloadHash: suffix.replaceAll("-", ""),
      normalizedPayload: { orderUUID: suffix },
      process: async () => {
        throw new Error("Injected processing failure")
      },
    })
  )
  await processWebhookEvent({
    payload,
    provider: "stripe",
    providerEventID: retryEventID,
    eventType: "integration.retry",
    payloadHash: suffix.replaceAll("-", ""),
    normalizedPayload: { orderUUID: suffix },
    process: async () => ({ paymentOrder: order.id, status: "processed" }),
  })
  const retryEvent = await payload.find({
    collection: "webhook-events",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { deduplicationKey: { equals: `stripe:${retryEventID}` } },
  })
  assert.equal(retryEvent.docs[0]?.processingStatus, "processed")
  assert.equal(retryEvent.docs[0]?.attempts, 2)
  if (retryEvent.docs[0]) created.webhookEvents.push(retryEvent.docs[0].id)

  console.log(
    "Payment reliability ok: 20-way transition/event concurrency, replay, outbox dedupe and monotonic refunds"
  )
} catch (error) {
  failure = error
} finally {
  try {
    if (created.paymentOrder) {
      const outbox = await payload.find({
        collection: "notification-outbox",
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: { paymentOrder: { equals: created.paymentOrder } },
      })
      for (const message of outbox.docs) {
        await payload.delete({
          collection: "notification-outbox",
          id: message.id,
          overrideAccess: true,
        })
      }
    }
    for (const id of created.webhookEvents) {
      await payload.delete({
        collection: "webhook-events",
        id,
        overrideAccess: true,
      })
    }
    if (created.paymentOrder) {
      await payload.delete({
        collection: "payment-orders",
        id: created.paymentOrder,
        overrideAccess: true,
      })
    }
    if (created.bookingRequest) {
      await payload.delete({
        collection: "booking-requests",
        id: created.bookingRequest,
        overrideAccess: true,
      })
    }
    if (created.lead) {
      await payload.delete({
        collection: "leads",
        id: created.lead,
        overrideAccess: true,
      })
    }
  } catch (error) {
    failure ??= error
  }
  if (failure) console.error(failure)
  process.exit(failure ? 1 : 0)
}
