import type { CollectionConfig } from "payload"

import { contentManagers, contentOrDeveloper, ownerOnly } from "../access"
import {
  commonPublicFields,
  ctaField,
  draftVersions,
  faqField,
  formatsField,
  localizedTextarea,
  localizedText,
  publicRead,
  stepsField,
} from "../fields/shared"
import { publicCollectionHooks } from "../hooks/revalidation"
import { supplementaryLayoutField } from "../blocks/editorial"

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "slug",
      "primaryDirection",
      "enabled",
      "updatedAt",
    ],
  },
  access: {
    create: contentManagers,
    delete: ownerOnly,
    read: publicRead,
    readVersions: contentOrDeveloper,
    update: contentManagers,
  },
  hooks: publicCollectionHooks({
    collectionTag: "services",
    pathPrefix: "/services",
  }),
  fields: [
    ...commonPublicFields,
    {
      name: "primaryDirection",
      type: "relationship",
      relationTo: "directions",
      required: true,
      index: true,
    },
    {
      name: "secondaryDirections",
      type: "relationship",
      relationTo: "directions",
      hasMany: true,
    },
    localizedTextarea("audience", "Audience"),
    localizedTextarea("intro", "Introduction"),
    localizedText("formatsTitle", "Formats title"),
    localizedText("processTitle", "Process title"),
    localizedText("outcomeTitle", "Outcome title"),
    localizedText("commercialTitle", "Commercial title"),
    localizedTextarea("commercialStatusCopy", "Commercial status copy"),
    localizedTextarea("priceNote", "Price note"),
    localizedText("nextStepTitle", "Next step title"),
    localizedTextarea("nextStepSummary", "Next step summary"),
    formatsField,
    {
      name: "formatPresentation",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    stepsField,
    {
      name: "benefits",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        {
          name: "description",
          type: "textarea",
          required: true,
          maxLength: 1200,
        },
      ],
    },
    {
      name: "outcomes",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true, maxLength: 300 }],
    },
    localizedTextarea("timingNote", "Timing note", {
      required: false,
      maxLength: 1000,
    }),
    localizedTextarea("qualification", "Qualification and limitations", {
      required: false,
      maxLength: 2000,
    }),
    {
      name: "gallery",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "relatedOffers",
      type: "relationship",
      relationTo: "offers",
      hasMany: true,
    },
    {
      name: "relatedPortfolio",
      type: "relationship",
      relationTo: "portfolio-cases",
      hasMany: true,
    },
    {
      name: "relatedServices",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
    },
    {
      name: "relatedCourses",
      type: "relationship",
      relationTo: "courses",
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
