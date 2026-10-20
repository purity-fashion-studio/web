import type { Block, Field } from "payload"

const heading = (): Field => ({
  name: "heading",
  type: "text",
  required: true,
  maxLength: 240,
})

const body = (): Field => ({
  name: "body",
  type: "textarea",
  required: true,
  maxLength: 6000,
})

const itemList = (name: string): Field => ({
  name,
  type: "array",
  required: true,
  minRows: 1,
  maxRows: 12,
  fields: [
    { name: "title", type: "text", required: true, maxLength: 240 },
    { name: "text", type: "textarea", required: true, maxLength: 2000 },
  ],
})

export const editorialBlocks: Block[] = [
  { slug: "richText", fields: [heading(), body()] },
  {
    slug: "mediaText",
    fields: [
      heading(),
      body(),
      { name: "media", type: "upload", relationTo: "media", required: true },
      {
        name: "mediaPosition",
        type: "select",
        required: true,
        defaultValue: "start",
        options: ["start", "end"],
      },
    ],
  },
  { slug: "featureGrid", fields: [heading(), itemList("items")] },
  { slug: "steps", fields: [heading(), itemList("items")] },
  {
    slug: "relationGrid",
    fields: [
      heading(),
      {
        name: "items",
        type: "relationship",
        relationTo: [
          "services",
          "courses",
          "fashion-collections",
          "portfolio-cases",
        ],
        hasMany: true,
        maxRows: 12,
      },
    ],
  },
  {
    slug: "gallery",
    fields: [
      heading(),
      {
        name: "media",
        type: "upload",
        relationTo: "media",
        hasMany: true,
        required: true,
        maxRows: 12,
      },
    ],
  },
  {
    slug: "testimonials",
    fields: [
      heading(),
      {
        name: "items",
        type: "relationship",
        relationTo: "testimonials",
        hasMany: true,
        maxRows: 6,
      },
    ],
  },
  {
    slug: "faq",
    fields: [
      heading(),
      {
        name: "items",
        type: "array",
        required: true,
        minRows: 1,
        maxRows: 12,
        fields: [
          { name: "question", type: "text", required: true, maxLength: 240 },
          { name: "answer", type: "textarea", required: true, maxLength: 2000 },
        ],
      },
    ],
  },
  {
    slug: "cta",
    fields: [
      heading(),
      body(),
      { name: "label", type: "text", required: true, maxLength: 80 },
      { name: "path", type: "text", required: true, maxLength: 500 },
    ],
  },
]

export const supplementaryLayoutField: Field = {
  name: "supplementaryLayout",
  label: "Supplementary editorial sections",
  type: "blocks",
  localized: true,
  blocks: editorialBlocks,
  maxRows: 8,
  admin: {
    description:
      "Controlled sections inside the fixed PURITY template. No raw HTML or CSS.",
  },
}
