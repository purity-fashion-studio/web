import type { Payload } from "payload"

import type { Locale } from "@/i18n/routing"
import type { PaymentOrder } from "@/payload-types"

import { withAdvisoryLock } from "./advisory-lock"
import { getPaymentAdapter } from "./payment"
import type { BookingValues } from "./schema"

// Provider requests are idempotent. Only the final persistence section shares
// the payment-order lock with verified webhooks and reconciliation.
export async function ensureCheckout({
  payload,
  order,
  booking,
  origin,
  locale,
}: {
  payload: Payload
  order: PaymentOrder
  booking: Pick<BookingValues, "email" | "budgetCurrency">
  origin: string
  locale: Locale
}): Promise<PaymentOrder> {
  if (order.provider !== "stripe" && order.provider !== "liqpay") return order
  let checkout: Awaited<
    ReturnType<ReturnType<typeof getPaymentAdapter>["createOrder"]>
  >
  try {
    checkout = await getPaymentAdapter(order.provider).createOrder({
      amount: order.amount,
      booking,
      idempotencyKey: order.idempotencyKey,
      origin,
      locale,
      orderUUID: order.orderUUID,
      title: order.commercialSnapshot.title,
    })
  } catch {
    return withAdvisoryLock(payload, "payment-order", order.id, async () => {
      const current = await payload.findByID({
        collection: "payment-orders",
        id: order.id,
        depth: 0,
        overrideAccess: true,
      })
      if (
        current.status !== "created" &&
        !(
          current.status === "failed" &&
          current.safeFailureCode === "checkout-creation-failed"
        )
      )
        return current
      return payload.update({
        collection: "payment-orders",
        id: current.id,
        context: { service: "public-booking" },
        overrideAccess: true,
        data: {
          status: "failed",
          safeFailureCode: "checkout-creation-failed",
          auditNote:
            "Checkout creation failed; request retained for follow-up.",
        },
      })
    })
  }
  return withAdvisoryLock(payload, "payment-order", order.id, async () => {
    const current = await payload.findByID({
      collection: "payment-orders",
      id: order.id,
      depth: 0,
      overrideAccess: true,
    })
    const recoverable =
      current.status === "created" ||
      (current.status === "failed" &&
        current.safeFailureCode === "checkout-creation-failed")
    return payload.update({
      collection: "payment-orders",
      id: current.id,
      context: { service: "public-booking" },
      overrideAccess: true,
      data: {
        checkoutURL: checkout.checkoutUrl,
        checkoutExpiresAt: checkout.expiresAt,
        providerOrderID: checkout.id,
        ...(recoverable
          ? {
              status: "pending",
              safeFailureCode: null,
              nextReconcileAt: new Date().toISOString(),
            }
          : {}),
      },
    })
  })
}
