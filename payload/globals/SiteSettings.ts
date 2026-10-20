import type { Field, GlobalConfig } from "payload"

import { hasRole } from "../access"
import { localizedText } from "../fields/shared"
import { revalidateGlobal } from "../hooks/revalidation"

const ownerOrEditor = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, ["owner", "editor"])

const bookingCopyFields: Field[] = [
  localizedText("eyebrow", "Eyebrow"),
  localizedText("title", "Title"),
  localizedText("summary", "Summary"),
  localizedText("privateInquiry", "Private inquiry"),
  localizedText("corporateInquiry", "Corporate inquiry"),
  localizedText("submit", "Submit label"),
  localizedText("submitting", "Submitting label"),
  localizedText("emptyService", "Empty service label"),
  localizedText("successTitle", "Success title"),
  localizedText("successSummary", "Success summary"),
  localizedText("errorTitle", "Error title"),
  localizedText("validationError", "Validation error summary"),
  localizedText("checkout", "Checkout label"),
  localizedText("routingTitle", "Payment routing title"),
  localizedText("routingSummary", "Payment routing summary"),
  localizedText("contactTitle", "Contact details title"),
  localizedText("paymentTitle", "Format and payment title"),
  localizedText("stepsTitle", "Steps title"),
  localizedText("stepDetails", "Request details step"),
  localizedText("stepReview", "Review step"),
  localizedText("reviewTitle", "Review title"),
  localizedText("reviewSummary", "Review summary"),
  localizedText("notSpecified", "Not specified label"),
  {
    name: "labels",
    type: "group",
    fields: [
      localizedText("inquiryType", "Inquiry type"),
      localizedText("serviceSlug", "Direction"),
      localizedText("name", "Name"),
      localizedText("email", "Email"),
      localizedText("phone", "Phone"),
      localizedText("company", "Company"),
      localizedText("format", "Format"),
      localizedText("contactMethod", "Preferred contact"),
      localizedText("budgetCurrency", "Currency"),
      localizedText("preferredAt", "Preferred date and time"),
      localizedText("message", "Request"),
      localizedText("consent", "Consent"),
    ],
  },
  {
    name: "inquiryTypes",
    type: "group",
    fields: [
      localizedText("private", "Private inquiry label"),
      localizedText("corporate", "Corporate inquiry label"),
    ],
  },
  {
    name: "formats",
    type: "group",
    fields: [
      localizedText("studio", "Studio format"),
      localizedText("online", "Online format"),
      localizedText("atelier", "Atelier format"),
    ],
  },
  {
    name: "contactMethods",
    type: "group",
    fields: [
      localizedText("email", "Email contact method"),
      localizedText("phone", "Phone contact method"),
      localizedText("viber", "Viber contact method"),
    ],
  },
  {
    name: "currencies",
    type: "group",
    fields: [
      localizedText("EUR", "EUR label"),
      localizedText("UAH", "UAH label"),
    ],
  },
  {
    name: "providers",
    type: "group",
    fields: [
      localizedText("stripe", "Stripe label"),
      localizedText("liqpay", "LiqPay label"),
    ],
  },
  {
    name: "errors",
    type: "group",
    fields: [
      localizedText("required", "Required field error"),
      localizedText("email", "Email validation error"),
      localizedText("message", "Request validation error"),
      localizedText("consent", "Consent validation error"),
      localizedText("companyRequired", "Company validation error"),
      localizedText("phoneRequired", "Phone validation error"),
    ],
  },
  {
    name: "paymentStatus",
    type: "group",
    fields: [
      localizedText("provider", "Payment provider label"),
      localizedText("order", "Payment order label"),
      localizedText("notProvided", "Not provided label"),
      localizedText("referenceReceived", "Reference received label"),
    ],
  },
  {
    name: "pricing",
    type: "group",
    fields: [
      localizedText("from", "From price label"),
      localizedText("custom", "By-request price label"),
    ],
  },
]

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: { group: "Site" },
  access: { read: () => true, update: ownerOrEditor },
  hooks: { afterChange: [revalidateGlobal("site-settings")] },
  fields: [
    {
      name: "brandName",
      type: "text",
      required: true,
      defaultValue: "PURITY Fashion Studio",
    },
    { name: "canonicalOrigin", type: "text", required: true, maxLength: 500 },
    { name: "defaultSocialImage", type: "upload", relationTo: "media" },
    {
      name: "contacts",
      type: "group",
      fields: [
        { name: "email", type: "email", required: true },
        { name: "phone", type: "text", required: true, maxLength: 80 },
        {
          name: "phones",
          type: "array",
          minRows: 1,
          fields: [
            { name: "number", type: "text", required: true, maxLength: 80 },
          ],
        },
        localizedText("address", "Address"),
        localizedText("city", "City"),
        localizedText("hours", "Hours"),
        localizedText("actionLabel", "Contact action label"),
        { name: "actionPath", type: "text", required: true, maxLength: 500 },
        { name: "viberURL", type: "text", maxLength: 500 },
      ],
    },
    {
      name: "uiLabels",
      type: "group",
      fields: [
        localizedText("language", "Language label", { maxLength: 80 }),
        localizedText("close", "Close label", { maxLength: 80 }),
        localizedText("externalLink", "External link label", {
          maxLength: 120,
        }),
        localizedText("menu", "Menu label", { maxLength: 80 }),
        localizedText("footerDirections", "Footer directions label", {
          maxLength: 120,
        }),
        localizedText("footerContacts", "Footer contacts label", {
          maxLength: 120,
        }),
      ],
    },
    {
      name: "contactLabels",
      type: "group",
      fields: [
        localizedText("phone", "Phone label"),
        localizedText("email", "Email label"),
        localizedText("viber", "Viber label"),
        localizedText("socials", "Social channels label"),
        localizedText("direct", "Contact directly title"),
        localizedText("address", "Studio address label"),
        localizedText("hours", "Opening hours label"),
        localizedText("request", "Send inquiry title"),
        localizedText("requestSummary", "Send inquiry summary"),
      ],
    },
    {
      name: "booking",
      type: "group",
      fields: bookingCopyFields,
    },
    {
      name: "localeLabels",
      type: "group",
      fields: [
        {
          name: "uk",
          type: "text",
          required: true,
          defaultValue: "Українська",
        },
        { name: "ru", type: "text", required: true, defaultValue: "Русский" },
        { name: "en", type: "text", required: true, defaultValue: "English" },
      ],
    },
    { name: "ga4MeasurementID", type: "text", maxLength: 80 },
    {
      name: "map",
      type: "group",
      fields: [
        {
          name: "provider",
          type: "select",
          options: ["none", "google", "openstreetmap"],
        },
        { name: "latitude", type: "number", min: -90, max: 90 },
        { name: "longitude", type: "number", min: -180, max: 180 },
      ],
    },
    {
      name: "maintenance",
      type: "group",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          required: true,
          defaultValue: false,
        },
        localizedText("message", "Maintenance message", { required: false }),
      ],
    },
  ],
}
