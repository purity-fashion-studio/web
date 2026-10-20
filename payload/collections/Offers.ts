import type { CollectionConfig } from "payload"

import { MAX_PAYMENT_AMOUNT_MINOR } from "@/lib/payment-limits"
import { contentManagers, contentOrDeveloper, ownerOnly } from "../access"
import {
  draftVersions,
  enabledField,
  localizedText,
  localizedTextarea,
  publishedAtField,
  publicRead,
  sortOrderField,
} from "../fields/shared"
import {
  revalidateDeletedOffer,
  revalidateOffers,
  setPublishedAt,
} from "../hooks/revalidation"

export const Offers: CollectionConfig = {
  slug: "offers",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "sku",
      "service",
      "course",
      "fashionCollection",
      "pricingMode",
      "checkoutMode",
      "commercialStatus",
    ],
  },
  access: {
    create: contentManagers,
    delete: ownerOnly,
    read: publicRead,
    readVersions: contentOrDeveloper,
    update: contentManagers,
  },
  hooks: {
    afterChange: [revalidateOffers],
    afterDelete: [revalidateDeletedOffer],
    beforeChange: [setPublishedAt],
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        const owners = [
          data.service,
          data.course,
          data.fashionCollection,
        ].filter(Boolean)
        if (owners.length !== 1) {
          throw new Error(
            "Offer must belong to exactly one service, course or fashion collection."
          )
        }

        const prices = Array.isArray(data.prices) ? data.prices : []
        const currencies = new Set<string>()

        for (const price of prices) {
          if (!price || typeof price !== "object") continue
          const currency = String(price.currency ?? "")
          if (currencies.has(currency)) {
            throw new Error(`Offer contains duplicate ${currency} price.`)
          }
          currencies.add(currency)

          for (const key of ["amount", "minAmount", "maxAmount"] as const) {
            const amount = price[key]
            if (amount != null && (!Number.isInteger(amount) || amount < 0)) {
              throw new Error(
                `${key} must be a non-negative integer in minor units.`
              )
            }
            if (amount != null && amount > MAX_PAYMENT_AMOUNT_MINOR) {
              throw new Error(
                `${key} exceeds the provider-safe maximum of ${MAX_PAYMENT_AMOUNT_MINOR} minor units.`
              )
            }
          }

          if (data.pricingMode === "fixed" && price.amount == null) {
            throw new Error("Fixed pricing requires amount for every currency.")
          }
          if (data.pricingMode === "from" && price.minAmount == null) {
            throw new Error(
              "From pricing requires minAmount for every currency."
            )
          }
          if (
            data.pricingMode === "range" &&
            (price.minAmount == null ||
              price.maxAmount == null ||
              price.maxAmount < price.minAmount)
          ) {
            throw new Error(
              "Range pricing requires valid minAmount and maxAmount."
            )
          }
        }

        if (
          data.checkoutMode === "instant-payment" &&
          data.pricingMode !== "fixed"
        ) {
          throw new Error("Instant payment is allowed only for fixed pricing.")
        }

        if (
          data.checkoutMode === "deposit" &&
          !data.deposit?.amount &&
          !data.deposit?.percentage
        ) {
          throw new Error("Deposit checkout requires an amount or percentage.")
        }

        if (
          data.deposit?.amount != null &&
          (data.deposit.amount <= 0 ||
            data.deposit.amount > MAX_PAYMENT_AMOUNT_MINOR)
        ) {
          throw new Error("Deposit amount must fit the provider-safe limit.")
        }
        if (
          data.deposit?.percentage != null &&
          (!Number.isFinite(data.deposit.percentage) ||
            data.deposit.percentage <= 0 ||
            data.deposit.percentage > 100)
        ) {
          throw new Error("Deposit percentage must be between 0 and 100.")
        }

        if (
          data.effectiveFrom &&
          data.effectiveUntil &&
          new Date(data.effectiveUntil) <= new Date(data.effectiveFrom)
        ) {
          throw new Error("effectiveUntil must be after effectiveFrom.")
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: "legacyKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "service",
      type: "relationship",
      relationTo: "services",
      index: true,
    },
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
      name: "sku",
      type: "text",
      required: true,
      unique: true,
      index: true,
      maxLength: 80,
    },
    localizedText("title", "Title"),
    localizedTextarea("shortDescription", "Short description", {
      maxLength: 1000,
    }),
    {
      name: "format",
      type: "select",
      required: true,
      options: ["online", "studio", "remote-atelier", "in-person", "hybrid"],
    },
    {
      name: "pricingMode",
      type: "select",
      required: true,
      options: ["fixed", "from", "range", "custom"],
    },
    {
      name: "checkoutMode",
      type: "select",
      required: true,
      options: [
        "instant-payment",
        "deposit",
        "booking-request",
        "inquiry",
        "waitlist",
      ],
    },
    {
      name: "commercialStatus",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        "active",
        "coming-soon",
        "waitlist",
        "paused",
        "sold-out",
        "retired",
      ],
    },
    {
      name: "prices",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "currency",
          type: "select",
          required: true,
          options: ["EUR", "UAH"],
        },
        {
          name: "amount",
          type: "number",
          min: 0,
          max: MAX_PAYMENT_AMOUNT_MINOR,
          admin: { description: "Fixed amount in integer minor units." },
        },
        {
          name: "minAmount",
          type: "number",
          min: 0,
          admin: { description: "Minimum amount in integer minor units." },
        },
        {
          name: "maxAmount",
          type: "number",
          min: 0,
          admin: { description: "Maximum amount in integer minor units." },
        },
      ],
    },
    {
      name: "durationMinutes",
      type: "number",
      min: 1,
    },
    {
      name: "sessions",
      type: "number",
      min: 1,
    },
    {
      name: "deposit",
      type: "group",
      fields: [
        { name: "amount", type: "number", min: 0 },
        { name: "percentage", type: "number", min: 1, max: 100 },
      ],
    },
    {
      name: "effectiveFrom",
      type: "date",
    },
    {
      name: "effectiveUntil",
      type: "date",
    },
    {
      name: "termsVersion",
      type: "text",
      required: true,
      maxLength: 80,
    },
    enabledField,
    sortOrderField,
    publishedAtField,
  ],
  versions: draftVersions,
  timestamps: true,
}
