import { createRequire } from "node:module"

import type { ContentRoute } from "../../content/routes"
import type { Locale } from "../../i18n/routing"

const require = createRequire(import.meta.url)
const manifest =
  require("./manifests/purity-content-manifest.v1.json") as typeof import("./manifests/purity-content-manifest.v1.json")

/**
 * Frozen migration/parity fixture. It is consumed by the importer and test
 * tooling only; the public application reads business content from Payload.
 */
export const purityContentManifest = manifest

export function getManifestRoutes(locale: Locale): ContentRoute[] {
  return purityContentManifest.routes[locale].map((route) => ({
    ...route,
  })) as ContentRoute[]
}
