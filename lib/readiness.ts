import { getPayload } from "payload"

import config from "@payload-config"
import { env } from "@/lib/env"
import { migrationHead } from "@/payload/migration-head"

export async function checkReadiness() {
  if (env.PAYLOAD_ENABLED !== "true") {
    throw new Error("payload-disabled")
  }

  const payload = await getPayload({ config })
  const [migration, home, settings, pages, media] = await Promise.all([
    payload.count({
      collection: "payload-migrations",
      overrideAccess: true,
      where: { name: { equals: migrationHead } },
    }),
    payload.findGlobal({
      slug: "home",
      draft: false,
      fallbackLocale: false,
      locale: "uk",
      overrideAccess: false,
    }),
    payload.findGlobal({
      slug: "site-settings",
      fallbackLocale: false,
      locale: "uk",
      overrideAccess: false,
    }),
    payload.count({ collection: "pages", overrideAccess: false }),
    payload.find({
      collection: "media",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { usageRightsStatus: { equals: "approved" } },
          { publicVisibility: { equals: true } },
        ],
      },
    }),
  ])

  const mediaURLs = media.docs
    .filter(
      (item) =>
        !item.rightsExpiry || new Date(item.rightsExpiry).valueOf() > Date.now()
    )
    .flatMap((item) => [
      item.url,
      ...Object.values(item.sizes ?? {}).map((size) => size?.url),
    ])
    .filter((url): url is string => Boolean(url))
  if (migration.totalDocs !== 1) throw new Error("migration-head")
  if (!home.heroTitle) throw new Error("home-global")
  if (!settings.brandName) throw new Error("site-settings")
  if (pages.totalDocs === 0) throw new Error("published-pages")
  if (!mediaURLs.length) throw new Error("published-media")

  let mediaReady = false
  for (const mediaURL of mediaURLs) {
    try {
      const response = await fetch(
        new URL(mediaURL, env.NEXT_PUBLIC_SITE_URL),
        {
          headers: { Range: "bytes=0-0" },
          signal: AbortSignal.timeout(3000),
        }
      )
      await response.body?.cancel()
      if (response.ok) {
        mediaReady = true
        break
      }
    } catch {
      // Try the next derivative; readiness only needs one public media object.
    }
  }
  if (!mediaReady) throw new Error("media-backend")
}
