import type { CollectionConfig } from "payload"

import { hasRole, ownerOnly } from "../access"

const auditReaders = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, ["owner", "finance", "developer"])

export const WebhookEvents: CollectionConfig = {
  slug: "webhook-events",
  admin: {
    group: "Operations",
    useAsTitle: "providerEventID",
    defaultColumns: [
      "provider",
      "providerEventID",
      "eventType",
      "processingStatus",
      "receivedAt",
    ],
  },
  access: {
    create: () => false,
    delete: ownerOnly,
    read: auditReaders,
    update: () => false,
  },
  fields: [
    {
      name: "provider",
      type: "select",
      required: true,
      options: ["stripe", "liqpay", "fondy"],
    },
    {
      name: "providerEventID",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "deduplicationKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    { name: "eventType", type: "text", required: true, index: true },
    { name: "receivedAt", type: "date", required: true },
    {
      name: "processingStatus",
      type: "select",
      required: true,
      defaultValue: "received",
      options: ["received", "processed", "ignored", "failed"],
    },
    {
      name: "paymentOrder",
      type: "relationship",
      relationTo: "payment-orders",
      index: true,
    },
    { name: "normalizedPayload", type: "json", required: true },
    {
      name: "attempts",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
    },
    { name: "nextRetryAt", type: "date", index: true },
    { name: "lockedAt", type: "date", index: true },
    { name: "sanitizedError", type: "textarea", maxLength: 2000 },
    { name: "payloadHash", type: "text", required: true, maxLength: 128 },
  ],
  timestamps: true,
}
