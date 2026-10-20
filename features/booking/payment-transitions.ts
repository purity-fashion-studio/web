import type { PaymentOrder } from "@/payload-types"

export type PaymentOrderStatus = PaymentOrder["status"]

const transitions: Record<PaymentOrderStatus, readonly PaymentOrderStatus[]> = {
  created: [
    "pending",
    "requires-action",
    "paid",
    "failed",
    "cancelled",
    "expired",
  ],
  pending: ["requires-action", "paid", "failed", "cancelled", "expired"],
  "requires-action": ["pending", "paid", "failed", "cancelled", "expired"],
  paid: ["partially-refunded", "refunded", "disputed"],
  failed: ["pending", "paid"],
  cancelled: ["paid"],
  expired: ["paid"],
  "partially-refunded": ["refunded", "disputed"],
  refunded: ["disputed"],
  disputed: ["paid", "partially-refunded", "refunded"],
}

export function canTransitionPaymentStatus(
  current: PaymentOrderStatus,
  next: PaymentOrderStatus
) {
  return current === next || transitions[current].includes(next)
}
