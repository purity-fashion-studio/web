import type { GlobalConfig } from "payload"

import { hasRole, isActiveUser } from "../access"
import { localizedText } from "../fields/shared"
import { revalidateGlobal } from "../hooks/revalidation"

const ownerOnly = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, ["owner"])

export const BookingSettings: GlobalConfig = {
  slug: "booking-settings",
  admin: { group: "Site" },
  access: { read: ({ req }) => isActiveUser(req.user), update: ownerOnly },
  hooks: { afterChange: [revalidateGlobal("booking-settings")] },
  fields: [
    {
      name: "timezone",
      type: "text",
      required: true,
      defaultValue: "Europe/Kyiv",
    },
    {
      name: "enabledModes",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["inquiry", "booking-request"],
      options: [
        "inquiry",
        "booking-request",
        "deposit",
        "instant-payment",
        "waitlist",
      ],
    },
    { name: "holdMinutes", type: "number", min: 5, max: 60, defaultValue: 15 },
    { name: "cancellationWindowHours", type: "number", min: 0 },
    {
      name: "providerRouting",
      type: "array",
      fields: [
        {
          name: "currency",
          type: "select",
          required: true,
          options: ["EUR", "UAH"],
        },
        {
          name: "provider",
          type: "select",
          required: true,
          options: ["stripe", "liqpay", "fondy"],
        },
        {
          name: "enabled",
          type: "checkbox",
          required: true,
          defaultValue: false,
        },
        localizedText("publicLabel", "Public label", {
          required: false,
          maxLength: 100,
        }),
      ],
    },
    {
      name: "notificationRecipients",
      type: "array",
      admin: {
        description:
          "Environment-specific public recipient identifiers; never credentials.",
      },
      fields: [
        {
          name: "environment",
          type: "select",
          required: true,
          options: ["local", "preview", "production"],
        },
        { name: "email", type: "email", required: true },
      ],
    },
  ],
}
