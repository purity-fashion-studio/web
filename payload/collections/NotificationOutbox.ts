import type { CollectionConfig } from "payload"

import { hasRole, ownerOnly } from "../access"

const operationsReaders = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, ["owner", "support", "finance", "developer"])

export const NotificationOutbox: CollectionConfig = {
  slug: "notification-outbox",
  admin: {
    group: "Operations",
    useAsTitle: "deduplicationKey",
    defaultColumns: [
      "deduplicationKey",
      "recipientType",
      "status",
      "attempts",
      "nextAttemptAt",
    ],
  },
  access: {
    create: () => false,
    delete: ownerOnly,
    read: operationsReaders,
    update: () => false,
  },
  fields: [
    {
      name: "deduplicationKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "recipientType",
      type: "select",
      required: true,
      options: ["client", "internal"],
    },
    {
      name: "recipient",
      type: "email",
      required: true,
      access: { read: ({ req }) => hasRole(req.user, ["owner", "developer"]) },
    },
    { name: "subject", type: "text", required: true, maxLength: 500 },
    { name: "text", type: "textarea", required: true, maxLength: 20_000 },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: ["pending", "processing", "retryable", "sent", "dead"],
    },
    {
      name: "attempts",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
    },
    { name: "nextAttemptAt", type: "date", required: true, index: true },
    { name: "lockedAt", type: "date", index: true },
    { name: "providerMessageID", type: "text", index: true, maxLength: 500 },
    { name: "sanitizedError", type: "text", maxLength: 500 },
    {
      name: "bookingRequest",
      type: "relationship",
      relationTo: "booking-requests",
      index: true,
    },
    {
      name: "paymentOrder",
      type: "relationship",
      relationTo: "payment-orders",
      index: true,
    },
  ],
  timestamps: true,
}
