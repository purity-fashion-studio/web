import type { CollectionConfig } from "payload"

import { contentManagers, contentOrDeveloper, ownerOnly } from "../access"
import {
  commonPublicFields,
  draftVersions,
  localizedText,
  localizedTextarea,
  publicRead,
  stepsField,
} from "../fields/shared"
import { publicCollectionHooks } from "../hooks/revalidation"
import { supplementaryLayoutField } from "../blocks/editorial"

export const Directions: CollectionConfig = {
  slug: "directions",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "canonicalKey", "enabled", "updatedAt"],
  },
  access: {
    create: contentManagers,
    delete: ownerOnly,
    read: publicRead,
    readVersions: contentOrDeveloper,
    update: contentManagers,
  },
  hooks: publicCollectionHooks({
    collectionTag: "directions",
    pathPrefix: "",
    revalidateNavigation: true,
  }),
  fields: [
    ...commonPublicFields,
    {
      name: "canonicalKey",
      type: "select",
      required: true,
      unique: true,
      index: true,
      options: [
        "research",
        "realisation",
        "transformation",
        "corporate",
        "school",
        "collections",
      ],
    },
    localizedText("eyebrow", "Eyebrow", { required: false, maxLength: 100 }),
    localizedTextarea("narrative", "Narrative"),
    localizedText("processTitle", "Process section title"),
    localizedText("formatsTitle", "Formats section title"),
    {
      name: "formatNotes",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true, maxLength: 300 }],
    },
    localizedText("outcomesTitle", "Outcomes section title"),
    localizedText("ctaTitle", "CTA title"),
    localizedTextarea("ctaSummary", "CTA summary", { maxLength: 1200 }),
    { name: "ctaService", type: "text", required: true, maxLength: 160 },
    localizedText("ctaLabel", "CTA label", { maxLength: 100 }),
    localizedText("diagnosticLabel", "Diagnostic label", { required: false }),
    localizedText("faqTitle", "FAQ title", { required: false }),
    {
      name: "faq",
      type: "array",
      localized: true,
      fields: [
        { name: "question", type: "text", required: true, maxLength: 240 },
        { name: "answer", type: "textarea", required: true, maxLength: 2000 },
      ],
    },
    localizedText("countLabel", "Catalogue count label", { required: false }),
    localizedText("availabilityValue", "Availability value", {
      required: false,
    }),
    localizedText("availabilityLabel", "Availability label", {
      required: false,
    }),
    localizedText("fittingValue", "Fitting value", { required: false }),
    localizedText("fittingLabel", "Fitting label", { required: false }),
    localizedText("catalogueTitle", "Catalogue title", { required: false }),
    localizedTextarea("catalogueSummary", "Catalogue summary", {
      required: false,
    }),
    localizedText("materialsLabel", "Materials label", { required: false }),
    localizedText("inquiryTitle", "Inquiry title", { required: false }),
    {
      name: "inquirySteps",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    {
      name: "heroMedia",
      type: "upload",
      relationTo: "media",
    },
    stepsField,
    {
      name: "outcomes",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true, maxLength: 240 }],
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
    {
      name: "navigationVisible",
      type: "checkbox",
      required: true,
      defaultValue: true,
    },
    supplementaryLayoutField,
  ],
  versions: draftVersions,
  timestamps: true,
}
