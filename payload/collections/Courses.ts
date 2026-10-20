import type { CollectionConfig } from "payload"

import { contentManagers, contentOrDeveloper, ownerOnly } from "../access"
import {
  commonPublicFields,
  ctaField,
  draftVersions,
  faqField,
  formatsField,
  localizedText,
  localizedTextarea,
  publicRead,
} from "../fields/shared"
import { publicCollectionHooks } from "../hooks/revalidation"
import { supplementaryLayoutField } from "../blocks/editorial"

export const Courses: CollectionConfig = {
  slug: "courses",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "availability", "enabled", "updatedAt"],
  },
  access: {
    create: contentManagers,
    delete: ownerOnly,
    read: publicRead,
    readVersions: contentOrDeveloper,
    update: contentManagers,
  },
  hooks: publicCollectionHooks({
    collectionTag: "courses",
    pathPrefix: "/courses",
  }),
  fields: [
    ...commonPublicFields,
    {
      name: "direction",
      type: "relationship",
      relationTo: "directions",
      required: true,
    },
    localizedTextarea("description", "Description"),
    localizedText("eyebrow", "Eyebrow"),
    localizedText("serviceLabel", "Related service label"),
    localizedText("audienceTitle", "Audience title"),
    localizedText("formatTitle", "Format title"),
    localizedText("methodTitle", "Method title"),
    localizedText("prerequisitesTitle", "Prerequisites title"),
    localizedText("curriculumTitle", "Curriculum title"),
    localizedTextarea("curriculumSummary", "Curriculum summary"),
    localizedText("outcomesTitle", "Outcomes title"),
    localizedTextarea("outcomesSummary", "Outcomes summary"),
    localizedText("commercialTitle", "Commercial title"),
    localizedText("ctaTitle", "CTA title"),
    localizedTextarea("ctaSummary", "CTA summary"),
    localizedTextarea("audience", "Audience"),
    localizedTextarea("prerequisites", "Prerequisites", { required: false }),
    { name: "sessions", type: "number", required: true, min: 1 },
    formatsField,
    {
      name: "program",
      type: "array",
      localized: true,
      minRows: 1,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 200 },
        {
          name: "description",
          type: "textarea",
          required: true,
          maxLength: 2000,
        },
      ],
    },
    localizedText("instructor", "Instructor", { required: false }),
    localizedTextarea("credentials", "Confirmed credentials", {
      required: false,
    }),
    localizedTextarea("intakeNote", "Dates or intake note", {
      required: false,
    }),
    {
      name: "relatedOffers",
      type: "relationship",
      relationTo: "offers",
      hasMany: true,
    },
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "availability",
      type: "select",
      required: true,
      defaultValue: "coming-soon",
      options: ["available", "coming-soon", "waitlist", "sold-out", "archived"],
    },
    {
      name: "relatedServices",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
    },
    {
      name: "relatedCollections",
      type: "relationship",
      relationTo: "fashion-collections",
      hasMany: true,
    },
    faqField,
    ctaField,
    supplementaryLayoutField,
  ],
  versions: draftVersions,
  timestamps: true,
}
