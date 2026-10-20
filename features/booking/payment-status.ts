import "server-only"

import { getPayload } from "payload"

import config from "@payload-config"
import { env } from "@/lib/env"

import type { PaymentStatus } from "./public-copy"
import type { PaymentProvider } from "./schema"

export type VerifiedPaymentStatus = {
  status: PaymentStatus
  provider?: PaymentProvider
  orderReference?: string
}

export async function getVerifiedPaymentStatus(
  orderUUID: string | undefined
): Promise<VerifiedPaymentStatus> {
  if (
    env.PAYLOAD_ENABLED !== "true" ||
    !orderUUID ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderUUID
    )
  ) {
    return { status: "pending" }
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "payment-orders",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    select: { orderUUID: true, provider: true, status: true },
    where: { orderUUID: { equals: orderUUID } },
  })
  const order = result.docs[0]
  if (!order) return { status: "pending" }

  const status: PaymentStatus =
    order.status === "paid" || order.status === "partially-refunded"
      ? "success"
      : order.status === "refunded"
        ? "refunded"
        : order.status === "cancelled" || order.status === "expired"
          ? "cancel"
          : order.status === "failed" || order.status === "disputed"
            ? "failure"
            : "pending"
  return {
    status,
    provider:
      order.provider === "stripe" || order.provider === "liqpay"
        ? order.provider
        : undefined,
    orderReference: order.orderUUID,
  }
}
