import type { Payload, PayloadRequest } from "payload"
import { createHash } from "node:crypto"

import { env } from "@/lib/env"
import type { OutboxMessage } from "./notification-outbox"

export async function internalNotificationMessages(
  payload: Payload,
  message: Omit<OutboxMessage, "recipient" | "recipientType">,
  req?: PayloadRequest
): Promise<OutboxMessage[]> {
  const settings = await payload.findGlobal({
    slug: "booking-settings",
    depth: 0,
    overrideAccess: true,
    req,
  })
  const environment =
    env.VERCEL_ENV === undefined
      ? "local"
      : env.SITE_MODE === "preview" || env.VERCEL_ENV !== "production"
        ? "preview"
        : "production"
  const recipients =
    settings.notificationRecipients
      ?.filter((recipient) => recipient.environment === environment)
      .map((recipient) => recipient.email) ?? []
  return [
    ...new Set(
      recipients.length
        ? recipients
        : [env.EMAIL_FROM ?? "disabled@invalid.local"]
    ),
  ].map((recipient) => ({
    ...message,
    deduplicationKey: `${message.deduplicationKey}:${createHash("sha256").update(recipient.toLowerCase()).digest("hex").slice(0, 16)}`,
    recipient,
    recipientType: "internal",
  }))
}
