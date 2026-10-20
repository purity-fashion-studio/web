import type { GlobalConfig } from "payload"

import {
  contentOrDeveloper,
  enforcePublishedGlobalRead,
  hasRole,
} from "../access"
import { draftVersions, localizedText } from "../fields/shared"
import { revalidateGlobal } from "../hooks/revalidation"

const canManage = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, ["owner", "editor"])

export const Header: GlobalConfig = {
  slug: "header",
  admin: { group: "Site" },
  access: {
    read: () => true,
    readVersions: contentOrDeveloper,
    update: canManage,
  },
  hooks: {
    afterChange: [revalidateGlobal("header")],
    beforeOperation: [enforcePublishedGlobalRead],
  },
  fields: [
    {
      name: "navigation",
      type: "array",
      fields: [
        localizedText("label", "Label", { maxLength: 80 }),
        { name: "path", type: "text", required: true, maxLength: 500 },
        {
          name: "visible",
          type: "checkbox",
          required: true,
          defaultValue: true,
        },
        {
          name: "external",
          type: "checkbox",
          required: true,
          defaultValue: false,
        },
        localizedText("accessibleLabel", "Accessible label", {
          required: false,
          maxLength: 160,
        }),
      ],
    },
    localizedText("bookingLabel", "Book now label", { maxLength: 80 }),
  ],
  versions: draftVersions,
}
