import type { Payload, PayloadRequest } from "payload"

import { env } from "@/lib/env"
import { hasLocale } from "@/i18n/routing"

import { paymentStatusEmail } from "./email-copy"
import type { OutboxMessage } from "./notification-outbox"

export async function paymentNotificationMessages({
  payload,
  bookingRequestID,
  orderUUID,
  paymentOrderID,
  status,
  deduplicationSuffix = status,
  req,
}: {
  payload: Payload
  bookingRequestID: string
  orderUUID: string
  paymentOrderID: string
  status: "paid" | "failed" | "refunded"
  deduplicationSuffix?: string
  req?: PayloadRequest
}): Promise<OutboxMessage[]> {
  const booking = await payload.findByID({
    collection: "booking-requests",
    id: bookingRequestID,
    // Keep transaction reads serial on the single PostgreSQL client. The lead
    // is loaded explicitly below, so relationship population adds no value and
    // can issue overlapping queries through the transaction connection.
    depth: 0,
    overrideAccess: true,
    req,
    select: { lead: true },
  })
  const lead =
    typeof booking.lead === "string"
      ? await payload.findByID({
          collection: "leads",
          id: booking.lead,
          depth: 0,
          overrideAccess: true,
          req,
          select: { email: true, locale: true },
        })
      : booking.lead
  if (!lead.email || !hasLocale(lead.locale)) {
    throw new Error("Payment notification recipient is unavailable")
  }

  const copy = paymentStatusEmail(lead.locale, status, orderUUID)
  const base = `payment:${paymentOrderID}:${deduplicationSuffix}`
  return [
    {
      bookingRequest: bookingRequestID,
      deduplicationKey: `${base}:client`,
      paymentOrder: paymentOrderID,
      recipient: lead.email,
      recipientType: "client",
      ...copy,
    },
    {
      bookingRequest: bookingRequestID,
      deduplicationKey: `${base}:internal`,
      paymentOrder: paymentOrderID,
      recipient: env.EMAIL_FROM ?? "disabled@invalid.local",
      recipientType: "internal",
      subject: `PURITY — payment ${status}`,
      text: `Order ${orderUUID} is ${status}. Review the verified record in Payload Admin.`,
    },
  ]
}
