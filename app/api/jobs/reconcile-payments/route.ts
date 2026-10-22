import { getPayload } from "payload"

import config from "@payload-config"
import { tryWithAdvisoryLock } from "@/features/booking/advisory-lock"
import { isAuthorizedCron } from "@/features/booking/cron-auth"
import { deliverNotificationBatch } from "@/features/booking/notification-outbox"
import { correlationID } from "@/features/booking/operation-log"
import { transitionPayment } from "@/features/booking/payment-persistence"
import { getPaymentAdapter } from "@/features/booking/payment"
import { retryDueWebhookEvents } from "@/features/booking/webhook-events"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

const activeStatuses = ["created", "pending", "requires-action"] as const
const maxReconciliationAttempts = 8

function nextReconcileAt(attempts: number, failed: boolean) {
  if (failed && attempts >= maxReconciliationAttempts) return null
  const delay = failed
    ? Math.min(60 * 60_000, 30_000 * 2 ** Math.max(0, attempts - 1))
    : 5 * 60_000
  return new Date(Date.now() + delay).toISOString()
}

export async function POST(request: Request) {
  const requestCorrelationID = correlationID(request)
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (env.PAYLOAD_ENABLED !== "true") {
    return Response.json({ error: "CMS unavailable" }, { status: 503 })
  }

  const payload = await getPayload({ config })
  const now = new Date().toISOString()
  const exhausted = await payload.count({
    collection: "payment-orders",
    overrideAccess: true,
    where: {
      and: [
        { status: { in: [...activeStatuses] } },
        {
          reconciliationAttempts: {
            greater_than_equal: maxReconciliationAttempts,
          },
        },
      ],
    },
  })
  const result = await payload.find({
    collection: "payment-orders",
    depth: 0,
    // Process a full scheduled batch so a short-lived backlog does not take
    // several days to drain. The query remains bounded for provider safety.
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    sort: "nextReconcileAt",
    where: {
      and: [
        { status: { in: [...activeStatuses] } },
        {
          or: [
            { nextReconcileAt: { exists: false } },
            { nextReconcileAt: { less_than_equal: now } },
          ],
        },
        { reconciliationAttempts: { less_than: maxReconciliationAttempts } },
      ],
    },
  })
  const counts = {
    checked: 0,
    paid: 0,
    failed: 0,
    pending: 0,
    errors: 0,
    skipped: 0,
    exhausted: exhausted.totalDocs,
  }

  for (const candidate of result.docs) {
    const reconciliation = await tryWithAdvisoryLock(
      payload,
      "reconciliation",
      candidate.id,
      async () => {
        const order = await payload.findByID({
          collection: "payment-orders",
          id: candidate.id,
          depth: 0,
          overrideAccess: true,
        })
        if (
          !activeStatuses.includes(
            order.status as (typeof activeStatuses)[number]
          ) ||
          (order.nextReconcileAt &&
            new Date(order.nextReconcileAt).getTime() > Date.now()) ||
          (order.provider !== "stripe" && order.provider !== "liqpay")
        ) {
          counts.skipped += 1
          return
        }

        counts.checked += 1
        const attempts = order.reconciliationAttempts + 1
        try {
          const providerStatus = await getPaymentAdapter(
            order.provider
          ).getPaymentStatus({
            amount: order.amount,
            currency: order.currency,
            mode: order.mode,
            orderUUID: order.orderUUID,
            providerOrderID: order.providerOrderID ?? undefined,
          })
          if (
            providerStatus.status === "paid" &&
            providerStatus.paidAmount != null
          ) {
            await transitionPayment({
              payload,
              orderID: order.id,
              service: "payment-reconciliation",
              transition: {
                status: "paid",
                paidAmount: providerStatus.paidAmount,
                auditNote: "Paid status confirmed by reconciliation.",
              },
              notificationStatus: "paid",
            })
            counts.paid += 1
          } else if (
            providerStatus.status === "failed" ||
            providerStatus.status === "expired"
          ) {
            await transitionPayment({
              payload,
              orderID: order.id,
              service: "payment-reconciliation",
              transition: {
                status: providerStatus.status,
                safeFailureCode: `reconciled-${providerStatus.status}`,
                auditNote: "Provider status confirmed by reconciliation.",
              },
              notificationStatus: "failed",
              notificationDedupe: providerStatus.status,
            })
            counts.failed += 1
          } else {
            counts.pending += 1
          }
          await payload.update({
            collection: "payment-orders",
            id: order.id,
            context: { service: "payment-reconciliation" },
            data: {
              lastReconciledAt: now,
              nextReconcileAt: nextReconcileAt(0, false),
              // This is a consecutive failure budget, not a polling limit.
              reconciliationAttempts: 0,
            },
            overrideAccess: true,
          })
        } catch (error) {
          counts.errors += 1
          await payload.update({
            collection: "payment-orders",
            id: order.id,
            context: { service: "payment-reconciliation" },
            data: {
              lastReconciledAt: now,
              nextReconcileAt: nextReconcileAt(attempts, true),
              reconciliationAttempts: attempts,
              ...(attempts >= maxReconciliationAttempts
                ? {
                    auditNote:
                      "Automatic reconciliation exhausted; manual provider review required.",
                  }
                : {}),
            },
            overrideAccess: true,
          })
          payload.logger.error({
            correlationID: requestCorrelationID,
            operation: "payment-reconciliation",
            code: "provider-status-failed",
            err: {
              name: error instanceof Error ? error.name : "UnknownError",
              message: "provider-status-failed",
            },
          })
        }
      }
    )
    if (reconciliation === null) {
      counts.skipped += 1
    }
  }

  const webhookRetries = await retryDueWebhookEvents(payload, 100)
  if (counts.exhausted > 0) {
    payload.logger.error({
      correlationID: requestCorrelationID,
      operation: "payment-reconciliation",
      code: "reconciliation-exhausted",
      count: counts.exhausted,
    })
  }
  if (webhookRetries.exhausted > 0) {
    payload.logger.error({
      correlationID: requestCorrelationID,
      operation: "payment-webhook-retry",
      code: "webhook-retry-exhausted",
      count: webhookRetries.exhausted,
    })
  }
  const notifications = await deliverNotificationBatch(payload, 100)
  if (notifications.dead > 0) {
    payload.logger.error({
      correlationID: requestCorrelationID,
      operation: "notification-outbox",
      code: "notification-delivery-exhausted",
      count: notifications.dead,
    })
  }
  return Response.json(
    { ...counts, webhookRetries, notifications },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export const GET = POST
