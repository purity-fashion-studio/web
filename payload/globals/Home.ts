import type { GlobalConfig } from "payload"

import {
  contentOrDeveloper,
  enforcePublishedGlobalRead,
  hasRole,
} from "../access"
import {
  draftVersions,
  localizedText,
  localizedTextarea,
} from "../fields/shared"
import { revalidateGlobal } from "../hooks/revalidation"

const canManage = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, ["owner", "editor"])

export const Home: GlobalConfig = {
  slug: "home",
  admin: { group: "Site" },
  access: {
    read: () => true,
    readVersions: contentOrDeveloper,
    update: canManage,
  },
  hooks: {
    afterChange: [revalidateGlobal("home")],
    beforeOperation: [enforcePublishedGlobalRead],
  },
  fields: [
    localizedText("heroEyebrow", "Hero eyebrow", {
      required: false,
      maxLength: 100,
    }),
    localizedText("heroTitle", "Hero title"),
    localizedTextarea("heroSummary", "Hero summary", { maxLength: 1000 }),
    { name: "heroMedia", type: "upload", relationTo: "media" },
    {
      name: "primaryCTA",
      type: "group",
      fields: [
        localizedText("label", "Label", { maxLength: 80 }),
        { name: "path", type: "text", required: true, maxLength: 500 },
      ],
    },
    {
      name: "secondaryCTA",
      type: "group",
      fields: [
        localizedText("label", "Label", { maxLength: 80 }),
        { name: "path", type: "text", required: true, maxLength: 500 },
      ],
    },
    {
      name: "method",
      type: "array",
      localized: true,
      minRows: 3,
      maxRows: 3,
      fields: [
        { name: "label", type: "text", required: true, maxLength: 80 },
        {
          name: "description",
          type: "textarea",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      name: "selectedDirections",
      type: "relationship",
      relationTo: "directions",
      hasMany: true,
    },
    {
      name: "selectedServices",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
    },
    {
      name: "selectedOffers",
      type: "relationship",
      relationTo: "offers",
      hasMany: true,
    },
    {
      name: "selectedCourses",
      type: "relationship",
      relationTo: "courses",
      hasMany: true,
    },
    {
      name: "selectedCollections",
      type: "relationship",
      relationTo: "fashion-collections",
      hasMany: true,
    },
    {
      name: "selectedPortfolio",
      type: "relationship",
      relationTo: "portfolio-cases",
      hasMany: true,
    },
    localizedTextarea("studioIntro", "Studio and method section"),
    localizedTextarea("serviceIntro", "Services introduction"),
    localizedText("priceNote", "Fallback price note"),
    localizedText("methodEyebrow", "Method eyebrow"),
    localizedText("methodTitle", "Method title"),
    {
      name: "methodDetails",
      type: "array",
      localized: true,
      minRows: 2,
      maxRows: 2,
      fields: [
        { name: "text", type: "textarea", required: true, maxLength: 1200 },
      ],
    },
    localizedText("studioEyebrow", "Studio eyebrow"),
    localizedText("studioTitle", "Studio title"),
    localizedText("serviceRailTitle", "Services section title"),
    localizedText("collectionRailTitle", "Collections section title"),
    localizedTextarea("portfolioNote", "Portfolio note", { maxLength: 1000 }),
    localizedText("portfolioTitle", "Portfolio title"),
    localizedTextarea("portfolioSummary", "Portfolio summary"),
    {
      name: "portfolioSignals",
      type: "array",
      localized: true,
      minRows: 3,
      maxRows: 3,
      fields: [{ name: "text", type: "text", required: true, maxLength: 160 }],
    },
    localizedText("faqTitle", "FAQ title"),
    {
      name: "faq",
      type: "array",
      localized: true,
      fields: [
        { name: "question", type: "text", required: true, maxLength: 240 },
        { name: "answer", type: "textarea", required: true, maxLength: 2000 },
      ],
    },
    {
      name: "sectionMedia",
      type: "group",
      fields: [
        { name: "research", type: "upload", relationTo: "media" },
        { name: "imagine", type: "upload", relationTo: "media" },
        { name: "create", type: "upload", relationTo: "media" },
        { name: "directions", type: "upload", relationTo: "media" },
        { name: "studio", type: "upload", relationTo: "media" },
        { name: "portfolio", type: "upload", relationTo: "media" },
      ],
    },
    localizedText("finalCTATitle", "Final CTA title"),
    localizedTextarea("finalCTASummary", "Final CTA summary", {
      maxLength: 1000,
    }),
  ],
  versions: draftVersions,
}
