import type { CollectionConfig } from "payload"

import { hasRole, operationsTeam, ownerOnly } from "../access"

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    group: "Operations",
    useAsTitle: "email",
    defaultColumns: [
      "name",
      "email",
      "phone",
      "locale",
      "sourceType",
      "updatedAt",
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
      name: "identityKey",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
      access: { read: ({ req }) => hasRole(req.user, ["owner", "developer"]) },
    },
    {
      name: "phoneIdentityKey",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
      access: { read: ({ req }) => hasRole(req.user, ["owner", "developer"]) },
    },
    { name: "name", type: "text", required: true, maxLength: 160 },
    { name: "email", type: "email", index: true },
    { name: "phone", type: "text", index: true, maxLength: 80 },
    { name: "company", type: "text", maxLength: 200 },
    {
      name: "preferredContactMethod",
      type: "select",
      required: true,
      options: ["email", "phone", "viber", "telegram", "whatsapp"],
    },
    {
      name: "locale",
      type: "select",
      required: true,
      options: ["uk", "ru", "en"],
    },
    {
      name: "sourceType",
      type: "select",
      required: true,
      options: [
        "contact",
        "booking",
        "corporate",
        "course",
        "collection",
        "atelier",
      ],
    },
    {
      name: "consent",
      type: "group",
      fields: [
        { name: "version", type: "text", required: true, maxLength: 80 },
        { name: "acceptedAt", type: "date", required: true },
      ],
    },
    {
      name: "firstTouch",
      type: "group",
      fields: [
        { name: "landingPage", type: "text", maxLength: 1000 },
        { name: "referrer", type: "text", maxLength: 1000 },
        { name: "utmSource", type: "text", maxLength: 200 },
        { name: "utmMedium", type: "text", maxLength: 200 },
        { name: "utmCampaign", type: "text", maxLength: 200 },
        { name: "utmContent", type: "text", maxLength: 200 },
        { name: "utmTerm", type: "text", maxLength: 200 },
      ],
    },
    {
      name: "lastTouch",
      type: "group",
      fields: [
        { name: "landingPage", type: "text", maxLength: 1000 },
        { name: "referrer", type: "text", maxLength: 1000 },
        { name: "utmSource", type: "text", maxLength: 200 },
        { name: "utmMedium", type: "text", maxLength: 200 },
        { name: "utmCampaign", type: "text", maxLength: 200 },
        { name: "utmContent", type: "text", maxLength: 200 },
        { name: "utmTerm", type: "text", maxLength: 200 },
      ],
    },
    {
      name: "duplicateState",
      type: "select",
      required: true,
      defaultValue: "unique",
      options: ["unique", "possible-duplicate", "merged"],
    },
    {
      name: "mergedInto",
      type: "relationship",
      relationTo: "leads",
    },
    {
      name: "assignee",
      type: "relationship",
      relationTo: "users",
      filterOptions: { roles: { contains: "support" } },
    },
    {
      name: "internalNotes",
      type: "textarea",
      maxLength: 10000,
      access: { read: ({ req }) => hasRole(req.user, ["owner", "support"]) },
    },
  ],
  timestamps: true,
}
