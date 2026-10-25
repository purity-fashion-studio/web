import { ValidationError, type CollectionConfig, type Where } from "payload"

import {
  contentManagers,
  contentOrDeveloper,
  hasRole,
  ownerOnly,
} from "../access"
import { revalidateDeletedMedia, revalidateMedia } from "../hooks/revalidation"

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Site",
    useAsTitle: "internalLabel",
    defaultColumns: [
      "internalLabel",
      "filename",
      "source",
      "usageRightsStatus",
      "isRealClientProof",
      "updatedAt",
    ],
  },
  access: {
    create: contentManagers,
    delete: ownerOnly,
    read: ({ req }) => {
      if (hasRole(req.user, ["owner", "editor", "developer"])) return true

      const publicMediaFilter: Where = {
        and: [
          { usageRightsStatus: { equals: "approved" } },
          { publicVisibility: { equals: true } },
          {
            or: [
              { rightsExpiry: { exists: false } },
              { rightsExpiry: { greater_than: new Date().toISOString() } },
            ],
          },
        ],
      }

      return publicMediaFilter
    },
    update: contentOrDeveloper,
  },
  hooks: {
    afterChange: [revalidateMedia],
    afterDelete: [revalidateDeletedMedia],
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        const errors: Array<{ message: string; path: string }> = []

        if (data.source === "generated") {
          data.isRealClientProof = false
          if (
            !data.replacementPriority ||
            data.replacementPriority === "none"
          ) {
            errors.push({
              path: "replacementPriority",
              message: "Generated media requires a replacement priority.",
            })
          }
        }

        if (data.publicVisibility && data.usageRightsStatus !== "approved") {
          errors.push({
            path: "usageRightsStatus",
            message: "Public media requires approved usage rights.",
          })
        }

        if (
          data.publicVisibility &&
          data.rightsExpiry &&
          new Date(data.rightsExpiry).valueOf() <= Date.now()
        ) {
          errors.push({
            path: "rightsExpiry",
            message: "Public media cannot use expired rights.",
          })
        }

        if (data.isRealClientProof && data.source !== "client") {
          errors.push({
            path: "source",
            message: "Real client proof must use source=client.",
          })
        }

        if (errors.length)
          throw new ValidationError({ collection: "media", errors, req }, req.t)
        return data
      },
    ],
  },
  upload: {
    // Local files use Payload's access-controlled delivery route, never Next's
    // startup-only public-file inventory. Blob disables local storage remotely.
    staticDir: ".payload-media",
    focalPoint: true,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    pasteURL: false,
    imageSizes: [
      { name: "thumbnail", width: 320, height: 320, position: "centre" },
      { name: "card", width: 768, height: 960, position: "centre" },
      { name: "editorial", width: 1440, height: 1800, position: "centre" },
      { name: "hero", width: 2400, height: 1600, position: "centre" },
    ],
  },
  fields: [
    {
      name: "internalLabel",
      type: "text",
      required: true,
      maxLength: 160,
      admin: { description: "Internal searchable asset name." },
    },
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
      maxLength: 240,
      admin: {
        description: "Required human-reviewed alt text in UK, RU and EN.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "source",
          type: "select",
          required: true,
          options: ["client", "generated", "licensed", "editorial"],
        },
        {
          name: "usageRightsStatus",
          type: "select",
          required: true,
          defaultValue: "pending",
          options: ["pending", "approved", "restricted", "expired"],
          admin: {
            description:
              "Public visibility requires approved, unexpired usage rights.",
          },
        },
        {
          name: "modelReleaseStatus",
          type: "select",
          required: true,
          defaultValue: "not-applicable",
          options: ["not-applicable", "pending", "approved", "restricted"],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "publicVisibility",
          type: "checkbox",
          required: true,
          defaultValue: false,
        },
        {
          name: "isRealClientProof",
          type: "checkbox",
          admin: {
            description:
              "Only client-source images may be real client proof; generated images never qualify.",
          },
          required: true,
          defaultValue: false,
        },
        {
          name: "replacementPriority",
          type: "select",
          required: true,
          defaultValue: "none",
          options: ["none", "replace-before-launch", "replace-when-approved"],
          admin: {
            description:
              "Generated images require a replacement priority other than none.",
          },
        },
      ],
    },
    {
      name: "creator",
      type: "text",
      maxLength: 160,
    },
    {
      name: "creditLine",
      type: "text",
      localized: true,
      maxLength: 240,
    },
    {
      name: "allowedUsageContexts",
      type: "select",
      hasMany: true,
      options: [
        "home",
        "service",
        "course",
        "collection",
        "portfolio",
        "studio",
        "social",
      ],
    },
    {
      name: "rightsExpiry",
      type: "date",
      admin: {
        date: { pickerAppearance: "dayOnly" },
        description: "Leave empty only for approved no-expiry usage rights.",
      },
    },
    {
      name: "sourceMetadata",
      type: "textarea",
      maxLength: 2000,
      admin: {
        description:
          "Internal provenance, license, prompt or release reference. Never public.",
      },
      access: {
        read: ({ req }) => hasRole(req.user, ["owner", "editor", "developer"]),
      },
    },
  ],
  timestamps: true,
}
