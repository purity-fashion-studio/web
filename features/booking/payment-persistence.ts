import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
} from "payload"

import type { PaymentOrder } from "@/payload-types"

import { withAdvisoryLock } from "./advisory-lock"
import { enqueueNotifications } from "./notification-outbox"
import { paymentNotificationMessages } from "./payment-notifications"
import { internalNotificationMessages } from "./notification-recipients"
import {
  canTransitionPaymentStatus,
  type PaymentOrderStatus,
} from "./payment-transitions"

type PaymentService =
  "stripe-webhook" | "liqpay-webhook" | "payment-reconciliation"

type TransitionInput = {
  auditNote?: string
  paidAmount?: number
  providerOrderID?: string | null
  providerPaymentID?: string | null
  refundedAmount?: number
  safeFailureCode?: string | null
  status: PaymentOrderStatus
}

class RetryablePaymentTransitionError extends Error {
  constructor(
    readonly current: PaymentOrderStatus,
    readonly next: PaymentOrderStatus
  ) {
    super(`Payment transition ${current} -> ${next} requires reconciliation.`)
    this.name = "RetryablePaymentTransitionError"
  }
}

function bookingRequestID(order: PaymentOrder) {
  return typeof order.bookingRequest === "string"
    ? order.bookingRequest
    : order.bookingRequest.id
}

export async function transitionPayment({
  payload,
  orderID,
  service,
  transition,
  notificationStatus,
  notificationDedupe,
}: {
  payload: Payload
  orderID: string
  service: PaymentService
  transition: TransitionInput
  notificationStatus?: "paid" | "failed" | "refunded"
  notificationDedupe?: string
}) {
  return withAdvisoryLock(payload, "payment-order", orderID, async () => {
    const order = await payload.findByID({
      collection: "payment-orders",
      id: orderID,
      depth: 0,
      overrideAccess: true,
    })
    const isRefund = ["partially-refunded", "refunded"].includes(
      transition.status
    )
    if (isRefund) {
      transition = {
        ...transition,
        // A refund records money movement, not an authoritative dispute resolution.
        status:
          order.status === "disputed"
            ? "disputed"
            : (order.refundedAmount ?? 0) >= order.amount
              ? "refunded"
              : transition.status,
        refundedAmount: Math.max(
          order.refundedAmount ?? 0,
          transition.refundedAmount ?? 0
        ),
      }
    }
    const canTransition = canTransitionPaymentStatus(
      order.status,
      transition.status
    )
    if (!canTransition) {
      const terminalStatuses: PaymentOrderStatus[] = [
        "paid",
        "partially-refunded",
        "refunded",
        "disputed",
      ]
      const staleFailureStatuses: PaymentOrderStatus[] = [
        "created",
        "pending",
        "requires-action",
        "failed",
        "cancelled",
        "expired",
      ]
      if (
        terminalStatuses.includes(order.status) &&
        (staleFailureStatuses.includes(transition.status) ||
          transition.status === "paid")
      ) {
        return { applied: false as const, order }
      }
      throw new RetryablePaymentTransitionError(order.status, transition.status)
    }
    const statusChanged = order.status !== transition.status
    const refundAdvanced =
      transition.refundedAmount != null &&
      transition.refundedAmount > (order.refundedAmount ?? 0)
    const shouldUpdateOrder = statusChanged || refundAdvanced
    if (!shouldUpdateOrder) return { applied: false as const, order }

    const req = await createLocalReq({ context: { service } }, payload)
    await initTransaction(req)
    try {
      const now = new Date().toISOString()
      const updated = shouldUpdateOrder
        ? await payload.update({
            collection: "payment-orders",
            id: order.id,
            context: { service },
            depth: 0,
            data: {
              ...transition,
              ...(transition.status === "paid" && statusChanged
                ? { paidAt: now }
                : {}),
              ...(isRefund && refundAdvanced ? { refundedAt: now } : {}),
            },
            overrideAccess: true,
            req,
          })
        : order

      const bookingID = bookingRequestID(order)
      if (transition.status === "paid" && statusChanged) {
        await payload.update({
          collection: "booking-requests",
          id: bookingID,
          context: { service },
          depth: 0,
          data: { status: "confirmed" },
          overrideAccess: true,
          req,
        })
      }

      if (notificationStatus) {
        const messages = await paymentNotificationMessages({
          payload,
          bookingRequestID: bookingID,
          orderUUID: order.orderUUID,
          paymentOrderID: order.id,
          status: notificationStatus,
          deduplicationSuffix: notificationDedupe,
          req,
        })
        await enqueueNotifications({ payload, messages, req })
      }

      if (transition.status === "disputed" && statusChanged) {
        await enqueueNotifications({
          payload,
          req,
          messages: await internalNotificationMessages(
            payload,
            {
              bookingRequest: bookingID,
              deduplicationKey: `payment:${order.id}:disputed:internal`,
              paymentOrder: order.id,
              subject: "PURITY — payment disputed",
              text: `Order ${order.orderUUID} is disputed. Review the verified provider record in Payload Admin.`,
            },
            req
          ),
        })
      }

      await commitTransaction(req)
      return { applied: shouldUpdateOrder, order: updated }
    } catch (error) {
      await killTransaction(req)
      throw error
    }
  })
}
