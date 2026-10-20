import type { CollectionConfig } from "payload"

import { contentManagers, contentOrDeveloper, ownerOnly } from "../access"
import {
  commonPublicFields,
  ctaField,
  draftVersions,
  localizedText,
  localizedTextarea,
  publicRead,
} from "../fields/shared"
import { publicCollectionHooks } from "../hooks/revalidation"
import { supplementaryLayoutField } from "../blocks/editorial"

export const FashionCollections: CollectionConfig = {
  slug: "fashion-collections",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "slug",
      "collectionType",
      "availability",
      "enabled",
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
    collectionTag: "fashion-collections",
    pathPrefix: "/collections",
  }),
  fields: [
    ...commonPublicFields,
    localizedText("eyebrow", "Eyebrow", { required: false, maxLength: 100 }),
    localizedTextarea("narrative", "Narrative"),
    localizedTextarea("stylingNotes", "Styling notes", { required: false }),
    localizedText("stylingTitle", "Styling section title"),
    {
      name: "styling",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    localizedText("factsTitle", "Facts section title"),
    {
      name: "facts",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    localizedText("inquiryTitle", "Inquiry section title"),
    {
      name: "inquirySteps",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    localizedText("materialsTitle", "Materials section title"),
    localizedText("availabilityTitle", "Availability section title"),
    localizedText("ctaTitle", "CTA title"),
    localizedTextarea("ctaSummary", "CTA summary", { maxLength: 1000 }),
    localizedText("serviceLabel", "Related service label", { maxLength: 120 }),
    {
      name: "collectionType",
      type: "select",
      required: true,
      options: [
        "editorial",
        "commercial",
        "capsule",
        "collaboration",
        "seasonal",
      ],
    },
    localizedTextarea("collaborationCredits", "Collaboration credits", {
      required: false,
    }),
    {
      name: "materials",
      type: "array",
      localized: true,
      fields: [
        { name: "material", type: "text", required: true, maxLength: 160 },
      ],
    },
    {
      name: "pieces",
      type: "array",
      localized: true,
      fields: [
        { name: "name", type: "text", required: true, maxLength: 160 },
        { name: "description", type: "textarea", maxLength: 1000 },
      ],
    },
    { name: "season", type: "text", maxLength: 80 },
    { name: "year", type: "number", min: 2000, max: 2200 },
    {
      name: "gallery",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
    },
    {
      name: "videoURL",
      type: "text",
      maxLength: 500,
      admin: {
        description:
          "Approved privacy-aware video URL; poster remains required in Media.",
      },
    },
    {
      name: "availability",
      type: "select",
      required: true,
      defaultValue: "inquiry",
      options: ["available", "inquiry", "coming-soon", "sold-out", "archived"],
    },
    {
      name: "relatedOffers",
      type: "relationship",
      relationTo: "offers",
      hasMany: true,
    },
    {
      name: "relatedServices",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
    },
    {
      name: "relatedCourse",
      type: "relationship",
      relationTo: "courses",
    },
    localizedText("rightsAndCredits", "Rights and image credits", {
      required: true,
    }),
    ctaField,
    supplementaryLayoutField,
  ],
  versions: draftVersions,
  timestamps: true,
}
