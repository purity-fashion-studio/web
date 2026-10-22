import type { Payload, PayloadRequest } from "payload"

import { hasLocale } from "@/i18n/routing"

import { paymentStatusEmail } from "./email-copy"
import type { OutboxMessage } from "./notification-outbox"
import { internalNotificationMessages } from "./notification-recipients"
import { readSubmissionSnapshot } from "./submission-snapshot"

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
    select: { lead: true, submissionSnapshot: true },
  })
  const snapshot = readSubmissionSnapshot(booking.submissionSnapshot)
  const lead =
    snapshot ??
    (typeof booking.lead === "string"
      ? await payload.findByID({
          collection: "leads",
          id: booking.lead,
          depth: 0,
          overrideAccess: true,
          req,
          select: { email: true, locale: true },
        })
      : booking.lead)
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
    ...(await internalNotificationMessages(
      payload,
      {
        bookingRequest: bookingRequestID,
        deduplicationKey: `${base}:internal`,
        paymentOrder: paymentOrderID,
        subject: `PURITY — payment ${status}`,
        text: `Order ${orderUUID} is ${status}. Review the verified record in Payload Admin.`,
      },
      req
    )),
  ]
}
