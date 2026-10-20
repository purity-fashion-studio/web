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
import { editorialBlocks } from "../blocks/editorial"

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "pageType", "enabled", "updatedAt"],
  },
  access: {
    create: contentManagers,
    delete: ownerOnly,
    read: publicRead,
    readVersions: contentOrDeveloper,
    update: contentManagers,
  },
  hooks: publicCollectionHooks({
    collectionTag: "pages",
    pathPrefix: "",
    revalidateNavigation: true,
  }),
  fields: [
    ...commonPublicFields,
    {
      name: "pageType",
      type: "select",
      required: true,
      options: [
        "studio",
        "portfolio",
        "contacts",
        "privacy",
        "terms",
        "cookies",
        "payments",
        "cancellation-refunds",
        "consent",
        "service-state",
      ],
    },
    localizedText("eyebrow", "Eyebrow", { required: false, maxLength: 100 }),
    localizedTextarea("body", "Body"),
    {
      name: "studioSignals",
      type: "array",
      localized: true,
      maxRows: 3,
      admin: {
        condition: (_, siblingData) => siblingData?.pageType === "studio",
      },
      fields: [
        { name: "label", type: "text", required: true, maxLength: 100 },
        { name: "value", type: "text", required: true, maxLength: 100 },
      ],
    },
    localizedText("methodEyebrow", "Method eyebrow", { required: false }),
    localizedText("methodTitle", "Method title", { required: false }),
    {
      name: "methodSteps",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    localizedText("clientsTitle", "Clients title", { required: false }),
    localizedTextarea("clientsSummary", "Clients summary", { required: false }),
    localizedText("privateTitle", "Private clients title", { required: false }),
    localizedText("corporateTitle", "Corporate clients title", {
      required: false,
    }),
    localizedText("directionsTitle", "Directions title", { required: false }),
    localizedText("ctaTitle", "CTA title", { required: false }),
    localizedTextarea("ctaSummary", "CTA summary", { required: false }),
    localizedText("formTitle", "Form title", { required: false }),
    localizedTextarea("formSummary", "Form summary", { required: false }),
    localizedText("heroMediaLabel", "Hero media label", { required: false }),
    localizedText("standardsTitle", "Standards title", { required: false }),
    {
      name: "standards",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    localizedText("recordTitle", "Record structure title", { required: false }),
    localizedTextarea("recordSummary", "Record structure summary", {
      required: false,
    }),
    {
      name: "recordItems",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true, maxLength: 240 }],
    },
    localizedText("currentTitle", "Current evidence title", {
      required: false,
    }),
    {
      name: "currentItems",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true, maxLength: 160 },
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    localizedText("flowTitle", "Publication flow title", { required: false }),
    {
      name: "flowItems",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true, maxLength: 240 }],
    },
    localizedText("secondaryCTALabel", "Secondary CTA label", {
      required: false,
    }),
    localizedText("emptyEyebrow", "Empty state eyebrow", { required: false }),
    localizedText("emptyTitle", "Empty state title", { required: false }),
    localizedTextarea("emptySummary", "Empty state summary", {
      required: false,
    }),
    localizedText("emptyAction", "Empty state action", { required: false }),
    {
      name: "layout",
      type: "blocks",
      localized: true,
      blocks: editorialBlocks,
      maxRows: 16,
      admin: {
        description:
          "Controlled PURITY sections. Raw HTML, CSS and arbitrary components are not supported.",
      },
    },
    {
      name: "sections",
      type: "array",
      localized: true,
      fields: [
        { name: "heading", type: "text", required: true, maxLength: 240 },
        { name: "body", type: "textarea", required: true, maxLength: 6000 },
        { name: "media", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "contactConfiguration",
      type: "group",
      admin: {
        condition: (_, siblingData) => siblingData?.pageType === "contacts",
      },
      fields: [
        { name: "showMap", type: "checkbox", defaultValue: false },
        { name: "corporateContext", type: "checkbox", defaultValue: true },
      ],
    },
    {
      name: "legalVersion",
      type: "text",
      maxLength: 80,
      admin: {
        condition: (_, siblingData) => siblingData?.pageType !== "studio",
      },
    },
    localizedText("contentsTitle", "Table of contents title", {
      required: false,
      maxLength: 120,
      admin: {
        condition: (_, siblingData) =>
          [
            "privacy",
            "terms",
            "cookies",
            "payments",
            "cancellation-refunds",
            "consent",
          ].includes(siblingData?.pageType),
      },
    }),
    localizedText("effectiveDateLabel", "Effective date label", {
      required: false,
      maxLength: 120,
      admin: {
        condition: (_, siblingData) =>
          [
            "privacy",
            "terms",
            "cookies",
            "payments",
            "cancellation-refunds",
            "consent",
          ].includes(siblingData?.pageType),
      },
    }),
    {
      name: "effectiveDate",
      type: "date",
      admin: {
        condition: (_, siblingData) => siblingData?.pageType !== "studio",
      },
    },
    ctaField,
  ],
  versions: draftVersions,
  timestamps: true,
}
