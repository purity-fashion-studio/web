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

export const Footer: GlobalConfig = {
  slug: "footer",
  admin: { group: "Site" },
  access: {
    read: () => true,
    readVersions: contentOrDeveloper,
    update: canManage,
  },
  hooks: {
    afterChange: [revalidateGlobal("footer")],
    beforeOperation: [enforcePublishedGlobalRead],
  },
  fields: [
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text", required: true, maxLength: 80 },
    {
      name: "phones",
      type: "array",
      minRows: 1,
      fields: [{ name: "number", type: "text", required: true, maxLength: 80 }],
    },
    localizedText("address", "Address"),
    localizedText("hours", "Hours"),
    localizedText("responseTime", "Expected response time"),
    {
      name: "socialLinks",
      type: "array",
      fields: [
        { name: "platform", type: "text", required: true, maxLength: 80 },
        { name: "url", type: "text", required: true, maxLength: 500 },
        localizedText("accessibleLabel", "Accessible label", {
          maxLength: 160,
        }),
      ],
    },
    {
      name: "legalNavigation",
      type: "array",
      fields: [
        localizedText("label", "Label", { maxLength: 100 }),
        { name: "path", type: "text", required: true, maxLength: 500 },
      ],
    },
    localizedTextarea("copyright", "Copyright and credits", {
      maxLength: 1000,
    }),
  ],
  versions: draftVersions,
}
