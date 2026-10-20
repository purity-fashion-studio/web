import type { Access, CollectionConfig, Where } from "payload"

import {
  contentManagers,
  contentOrDeveloper,
  hasRole,
  ownerOnly,
} from "../access"
import {
  draftVersions,
  enabledField,
  localizedText,
  localizedTextarea,
  publishedAtField,
} from "../fields/shared"
import {
  revalidateDeletedTestimonial,
  revalidateTestimonials,
  setPublishedAt,
} from "../hooks/revalidation"

const approvedTestimonialRead: Access = ({ req }) => {
  if (hasRole(req.user, ["owner", "editor", "developer"])) return true

  const filter: Where = {
    and: [
      { _status: { equals: "published" } },
      { enabled: { equals: true } },
      { consentStatus: { equals: "approved" } },
    ],
  }

  return filter
}

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    group: "Content",
    useAsTitle: "attribution",
    defaultColumns: ["attribution", "consentStatus", "enabled", "updatedAt"],
  },
  access: {
    create: contentManagers,
    delete: ownerOnly,
    read: approvedTestimonialRead,
    readVersions: contentOrDeveloper,
    update: contentManagers,
  },
  hooks: {
    afterChange: [revalidateTestimonials],
    afterDelete: [revalidateDeletedTestimonial],
    beforeChange: [setPublishedAt],
  },
  fields: [
    {
      name: "legacyKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    localizedTextarea("quote", "Quote", { maxLength: 2000 }),
    localizedText("attribution", "Attribution"),
    localizedText("roleOrCompany", "Role or company", { required: false }),
    { name: "relatedService", type: "relationship", relationTo: "services" },
    {
      name: "relatedCase",
      type: "relationship",
      relationTo: "portfolio-cases",
    },
    {
      name: "consentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: ["pending", "approved", "revoked"],
    },
    {
      name: "proofReference",
      type: "text",
      required: true,
      maxLength: 240,
      access: {
        read: ({ req }) => hasRole(req.user, ["owner", "editor", "developer"]),
      },
    },
    enabledField,
    publishedAtField,
  ],
  versions: draftVersions,
  timestamps: true,
}
