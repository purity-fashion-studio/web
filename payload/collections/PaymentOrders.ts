import type { CollectionConfig } from "payload"

import { MAX_PAYMENT_AMOUNT_MINOR } from "@/lib/payment-limits"
import { financeTeam, hasRole, ownerOnly } from "../access"

const financialFieldAccess = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, ["owner", "finance"])

export const PaymentOrders: CollectionConfig = {
  slug: "payment-orders",
  admin: {
    group: "Operations",
    useAsTitle: "orderUUID",
    defaultColumns: [
      "orderUUID",
      "provider",
      "amount",
      "currency",
      "status",
      "createdAt",
    ],
  },
  access: {
    // Payment orders are created by verified booking/provider workflows with
    // overrideAccess. Finance can inspect and operate on approved records but
    // must not manufacture a machine-owned order from Admin or REST.
    create: () => false,
    delete: ownerOnly,
    read: financeTeam,
    update: financeTeam,
  },
  fields: [
    {
      name: "orderUUID",
      type: "text",
      required: true,
      unique: true,
      index: true,
      access: { update: () => false },
    },
    {
      name: "bookingRequest",
      type: "relationship",
      relationTo: "booking-requests",
      required: true,
      index: true,
      access: { update: () => false },
    },
    {
      name: "commercialSnapshot",
      type: "group",
      access: { read: financialFieldAccess, update: () => false },
      fields: [
        { name: "offerID", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "sku", type: "text", required: true },
        { name: "termsVersion", type: "text", required: true },
      ],
    },
    {
      name: "provider",
      type: "select",
      required: true,
      options: ["stripe", "liqpay", "fondy"],
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "providerOrderID",
      type: "text",
      index: true,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "providerPaymentID",
      type: "text",
      index: true,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "amount",
      type: "number",
      required: true,
      min: 0,
      max: MAX_PAYMENT_AMOUNT_MINOR,
      access: { read: financialFieldAccess, update: () => false },
      admin: {
        description: "Integer minor units, immutable after order creation.",
      },
    },
    {
      name: "currency",
      type: "select",
      required: true,
      options: ["EUR", "UAH"],
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "mode",
      type: "select",
      required: true,
      options: ["test", "live"],
      access: { update: () => false },
    },
    {
      name: "checkoutURL",
      type: "text",
      maxLength: 2000,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "checkoutExpiresAt",
      type: "date",
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "created",
      index: true,
      access: { read: financialFieldAccess, update: () => false },
      options: [
        "created",
        "pending",
        "requires-action",
        "paid",
        "failed",
        "cancelled",
        "expired",
        "partially-refunded",
        "refunded",
        "disputed",
      ],
    },
    {
      name: "idempotencyKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "paidAmount",
      type: "number",
      min: 0,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "refundedAmount",
      type: "number",
      min: 0,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "safeFailureCode",
      type: "text",
      maxLength: 160,
      access: { update: () => false },
    },
    { name: "paidAt", type: "date", access: { update: () => false } },
    { name: "refundedAt", type: "date", access: { update: () => false } },
    {
      name: "notificationStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: ["pending", "sent", "failed"],
      access: { update: () => false },
    },
    {
      name: "notificationError",
      type: "text",
      maxLength: 500,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "auditNote",
      type: "textarea",
      maxLength: 4000,
      access: { read: financialFieldAccess, update: () => false },
    },
    {
      name: "lastReconciledAt",
      type: "date",
      index: true,
      access: { update: () => false },
    },
    {
      name: "nextReconcileAt",
      type: "date",
      index: true,
      access: { update: () => false },
    },
    {
      name: "reconciliationAttempts",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
      access: { update: () => false },
    },
  ],
  timestamps: true,
}
