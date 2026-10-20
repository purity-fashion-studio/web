import type { Access, Field, SelectField, TextField, Where } from "payload"

import { hasRole } from "../access"

export const draftVersions = {
  drafts: {
    autosave: { interval: 1500 },
    schedulePublish: true,
    validate: true,
  },
  maxPerDoc: 50,
} as const

export const publicRead: Access = ({ req }) => {
  if (hasRole(req.user, ["owner", "editor", "developer"])) return true

  const filter: Where = {
    and: [{ _status: { equals: "published" } }, { enabled: { equals: true } }],
  }

  return filter
}

export function localizedText(
  name: string,
  label: string,
  options: {
    admin?: TextField["admin"]
    maxLength?: number
    minLength?: number
    required?: boolean
  } = {}
): TextField {
  return {
    name,
    label,
    type: "text",
    localized: true,
    required: true,
    maxLength: 240,
    ...options,
  }
}

export function localizedTextarea(
  name: string,
  label: string,
  options: Partial<Field> = {}
): Field {
  return {
    name,
    label,
    type: "textarea",
    localized: true,
    required: true,
    maxLength: 5000,
    ...options,
  } as Field
}

const legacyKeyField: TextField = {
  name: "legacyKey",
  type: "text",
  required: true,
  unique: true,
  index: true,
  maxLength: 160,
  admin: {
    description: "Stable migration key. Never reuse for another entity.",
  },
}

const slugField: TextField = {
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  maxLength: 160,
  admin: { description: "Stable, non-localized public route segment." },
}

export const enabledField: Field = {
  name: "enabled",
  type: "checkbox",
  required: true,
  defaultValue: true,
}

const featuredField: Field = {
  name: "featured",
  type: "checkbox",
  required: true,
  defaultValue: false,
}

export const sortOrderField: Field = {
  name: "sortOrder",
  type: "number",
  required: true,
  defaultValue: 100,
  min: 0,
  index: true,
}

export const publishedAtField: Field = {
  name: "publishedAt",
  type: "date",
  index: true,
  admin: {
    readOnly: true,
    description: "Set automatically on first publication.",
  },
}

export const formatsField: SelectField = {
  name: "formats",
  type: "select",
  hasMany: true,
  required: true,
  options: ["online", "studio", "remote-atelier", "in-person", "hybrid"],
}

export const stepsField: Field = {
  name: "processSteps",
  label: "Process steps",
  type: "array",
  localized: true,
  minRows: 1,
  fields: [
    { name: "title", type: "text", required: true, maxLength: 160 },
    { name: "description", type: "textarea", required: true, maxLength: 1200 },
  ],
}

export const faqField: Field = {
  name: "faq",
  type: "array",
  localized: true,
  fields: [
    { name: "question", type: "text", required: true, maxLength: 240 },
    { name: "answer", type: "textarea", required: true, maxLength: 2000 },
  ],
}

export const ctaField: Field = {
  name: "cta",
  type: "group",
  fields: [
    localizedText("label", "Label", { maxLength: 80 }),
    {
      name: "action",
      type: "select",
      required: true,
      defaultValue: "booking-request",
      options: [
        "inquiry",
        "booking-request",
        "deposit",
        "instant-payment",
        "waitlist",
        "contact",
      ],
    },
  ],
}

export const commonPublicFields: Field[] = [
  legacyKeyField,
  slugField,
  localizedText("title", "Title"),
  localizedTextarea("summary", "Summary", { maxLength: 600 }),
  enabledField,
  featuredField,
  sortOrderField,
  publishedAtField,
]
