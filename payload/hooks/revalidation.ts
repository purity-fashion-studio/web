import { revalidatePath, revalidateTag } from "next/cache"
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload"

import { locales } from "../../i18n/routing"

type PublicDocument = {
  id: string
  slug?: string | null
  _status?: "draft" | "published" | null
  publishedAt?: string | null
}

type PublicHookOptions = {
  collectionTag: string
  pathPrefix: string
  revalidateNavigation?: boolean
}

function invalidate(tags: Iterable<string>, paths: Iterable<string>) {
  // Payload Local API scripts run outside a Next request/static-generation
  // store. The subsequent deployment builds a fresh cache, so invalidation is
  // neither available nor necessary during a deterministic content import.
  if (process.env.PAYLOAD_IMPORTING === "true") return

  for (const tag of new Set(tags)) {
    revalidateTag(tag, { expire: 0 })
  }
  for (const path of new Set(paths)) {
    revalidatePath(path)
  }
}

function localizedPaths(prefix: string, slug?: string | null) {
  if (!slug) return []
  return locales.map((locale) => `/${locale}${prefix}/${slug}`)
}

async function upsertSlugRedirects({
  newSlug,
  oldSlug,
  pathPrefix,
  req,
}: {
  newSlug: string
  oldSlug: string
  pathPrefix: string
  req: PayloadRequest
}) {
  await Promise.all(
    locales.map(async (locale) => {
      const from = `/${locale}${pathPrefix}/${oldSlug}`
      const to = `/${locale}${pathPrefix}/${newSlug}`
      const existing = await req.payload.find({
        collection: "redirects",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { from: { equals: from } },
      })
      const data = {
        from,
        to: { type: "custom" as const, url: to },
        type: "301" as const,
      }

      if (existing.docs[0]) {
        await req.payload.update({
          collection: "redirects",
          id: existing.docs[0].id,
          data,
          overrideAccess: true,
        })
      } else {
        await req.payload.create({
          collection: "redirects",
          data,
          overrideAccess: true,
        })
      }
    })
  )
}

export function publicCollectionHooks({
  collectionTag,
  pathPrefix,
  revalidateNavigation = false,
}: PublicHookOptions) {
  const afterChange: CollectionAfterChangeHook<PublicDocument> = async ({
    doc,
    previousDoc,
    req,
  }) => {
    const wasPublished = previousDoc?._status === "published"
    const isPublished = doc._status === "published"
    if (!wasPublished && !isPublished) return doc

    const previousSlug = previousDoc?.slug
    const currentSlug = doc.slug
    const tags = [
      `cms:${collectionTag}`,
      "cms:metadata",
      "cms:sitemap",
    ]
    if (currentSlug) tags.push(`cms:${collectionTag}:${currentSlug}`)
    if (previousSlug) tags.push(`cms:${collectionTag}:${previousSlug}`)
    if (revalidateNavigation) tags.push("cms:navigation")

    invalidate(tags, [
      ...localizedPaths(pathPrefix, currentSlug),
      ...localizedPaths(pathPrefix, previousSlug),
      "/sitemap.xml",
    ])

    if (
      isPublished &&
      previousSlug &&
      currentSlug &&
      previousSlug !== currentSlug
    ) {
      await upsertSlugRedirects({
        newSlug: currentSlug,
        oldSlug: previousSlug,
        pathPrefix,
        req,
      })
    }

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<PublicDocument> = ({ doc }) => {
    const tags = [`cms:${collectionTag}`, "cms:metadata", "cms:sitemap"]
    if (doc.slug) tags.push(`cms:${collectionTag}:${doc.slug}`)
    if (revalidateNavigation) tags.push("cms:navigation")
    invalidate(tags, [...localizedPaths(pathPrefix, doc.slug), "/sitemap.xml"])
    return doc
  }

  return {
    beforeChange: [setPublishedAt],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  }
}

export const setPublishedAt: CollectionBeforeChangeHook<PublicDocument> = ({
  data,
  originalDoc,
}) => {
  if (
    data._status === "published" &&
    originalDoc?._status !== "published" &&
    !data.publishedAt
  ) {
    data.publishedAt = new Date().toISOString()
  }
  return data
}

export const revalidateMedia: CollectionAfterChangeHook = ({ doc }) => {
  invalidate(["cms:media", "cms:metadata"], [])
  return doc
}

export const revalidateDeletedMedia: CollectionAfterDeleteHook = ({ doc }) => {
  invalidate(["cms:media", "cms:metadata"], [])
  return doc
}

export const revalidateOffers: CollectionAfterChangeHook = ({ doc }) => {
  invalidate(["cms:offers", "cms:services", `cms:offers:${doc.id}`], [])
  return doc
}

export const revalidateDeletedOffer: CollectionAfterDeleteHook = ({ doc }) => {
  invalidate(["cms:offers", "cms:services", `cms:offers:${doc.id}`], [])
  return doc
}

export const revalidateTestimonials: CollectionAfterChangeHook = ({ doc }) => {
  invalidate(["cms:testimonials", "cms:home"], [])
  return doc
}

export const revalidateDeletedTestimonial: CollectionAfterDeleteHook = ({
  doc,
}) => {
  invalidate(["cms:testimonials", "cms:home"], [])
  return doc
}

export function revalidateGlobal(tag: string): GlobalAfterChangeHook {
  return ({ doc }) => {
    invalidate([`cms:${tag}`, "cms:metadata", "cms:navigation"], [
      ...locales.map((locale) => `/${locale}`),
      "/sitemap.xml",
    ])
    return doc
  }
}
