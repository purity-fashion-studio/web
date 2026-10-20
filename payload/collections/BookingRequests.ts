import type { CollectionConfig } from "payload"

import { hasRole, operationsTeam, ownerOnly } from "../access"

export const BookingRequests: CollectionConfig = {
  slug: "booking-requests",
  admin: {
    group: "Operations",
    useAsTitle: "id",
    defaultColumns: [
      "lead",
      "service",
      "offer",
      "inquiryType",
      "status",
      "createdAt",
    ],
  },
  access: {
    create: operationsTeam,
    delete: ownerOnly,
    read: operationsTeam,
    update: operationsTeam,
  },
  fields: [
    {
      name: "idempotencyKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "requestFingerprint",
      type: "text",
      required: true,
      index: true,
      maxLength: 128,
      admin: {
        description: "One-way request fingerprint used for abuse controls.",
      },
      access: {
        read: ({ req }) => hasRole(req.user, ["owner", "developer"]),
      },
    },
    {
      name: "lead",
      type: "relationship",
      relationTo: "leads",
      required: true,
      index: true,
    },
    {
      name: "service",
      type: "relationship",
      relationTo: "services",
      required: true,
      index: true,
    },
    { name: "offer", type: "relationship", relationTo: "offers", index: true },
    {
      name: "course",
      type: "relationship",
      relationTo: "courses",
      index: true,
    },
    {
      name: "fashionCollection",
      type: "relationship",
      relationTo: "fashion-collections",
      index: true,
    },
    {
      name: "inquiryType",
      type: "select",
      required: true,
      options: ["private", "corporate"],
    },
    {
      name: "requestMode",
      type: "select",
      required: true,
      options: [
        "inquiry",
        "booking-request",
        "deposit",
        "instant-payment",
        "waitlist",
      ],
    },
    {
      name: "format",
      type: "select",
      required: true,
      options: ["online", "studio", "remote-atelier", "in-person", "hybrid"],
    },
    {
      name: "preferredDates",
      type: "array",
      maxRows: 5,
      fields: [{ name: "preferredAt", type: "date", required: true }],
    },
    { name: "message", type: "textarea", maxLength: 10000 },
    { name: "currency", type: "select", options: ["EUR", "UAH"] },
    { name: "sourcePage", type: "text", required: true, maxLength: 1000 },
    { name: "referrer", type: "text", maxLength: 1000 },
    {
      name: "attribution",
      type: "group",
      fields: [
        { name: "utmSource", type: "text", maxLength: 200 },
        { name: "utmMedium", type: "text", maxLength: 200 },
        { name: "utmCampaign", type: "text", maxLength: 200 },
        { name: "utmContent", type: "text", maxLength: 200 },
        { name: "utmTerm", type: "text", maxLength: 200 },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      index: true,
      options: [
        "new",
        "qualified",
        "waiting-for-client",
        "awaiting-schedule",
        "awaiting-payment",
        "confirmed",
        "completed",
        "cancelled",
        "closed",
      ],
    },
    {
      name: "internalNotes",
      type: "textarea",
      maxLength: 10000,
      access: { read: ({ req }) => hasRole(req.user, ["owner", "support"]) },
    },
    {
      name: "paymentOrder",
      type: "relationship",
      relationTo: "payment-orders",
      access: {
        read: ({ req }) => hasRole(req.user, ["owner", "support", "finance"]),
      },
    },
    { name: "consentVersion", type: "text", required: true, maxLength: 80 },
    { name: "consentAcceptedAt", type: "date", required: true },
    {
      name: "notificationStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: ["pending", "sent", "failed"],
    },
    {
      name: "notificationError",
      type: "text",
      maxLength: 500,
      access: {
        read: ({ req }) => hasRole(req.user, ["owner", "developer"]),
      },
    },
  ],
  timestamps: true,
}
