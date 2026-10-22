import type { Payload, TypedUser } from "payload"

import type { Service } from "@/payload-types"
import type { Locale } from "@/i18n/routing"
import type { MediaAsset } from "./media"
import {
  collectionPath,
  coursePath,
  portfolioCasePath,
  servicePath,
} from "./routes"

type StoredBlocks = Service["supplementaryLayout"]
type TextItem = { title: string; text: string }
type RelatedItem = { id: string; title: string; summary: string; path: string }
type TestimonialItem = { quote: string; attribution: string; role?: string }
export type EditorialBlock = { heading: string } & (
  | { blockType: "richText"; body: string }
  | {
      blockType: "mediaText"
      body: string
      media?: MediaAsset
      mediaPosition: "start" | "end"
    }
  | { blockType: "featureGrid" | "steps"; items: TextItem[] }
  | { blockType: "relationGrid"; items: RelatedItem[] }
  | { blockType: "gallery"; media: MediaAsset[] }
  | { blockType: "testimonials"; items: TestimonialItem[] }
  | { blockType: "faq"; items: Array<{ question: string; answer: string }> }
  | { blockType: "cta"; body: string; label: string; path: string }
)

function id(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : (value?.id ?? "")
}
const relationPaths = {
  services: servicePath,
  courses: coursePath,
  "fashion-collections": collectionPath,
  "portfolio-cases": portfolioCasePath,
}

// The CMS stores relations at depth zero. Batch by collection and let the
// existing publication/parent/consent access policies decide what may render.
export async function resolveEditorialBlocks({
  blocks,
  payload,
  locale,
  draft,
  access,
  readMedia,
}: {
  blocks: StoredBlocks
  payload: Payload
  locale: Locale
  draft: boolean
  access: { overrideAccess: false; user?: TypedUser }
  readMedia: (ids: string[]) => Promise<Map<string, MediaAsset | undefined>>
}): Promise<EditorialBlock[]> {
  if (!blocks?.length) return []
  const mediaIDs = new Set<string>()
  const groups = new Map<
    keyof typeof relationPaths | "testimonials",
    Set<string>
  >()
  for (const block of blocks) {
    if (block.blockType === "mediaText") mediaIDs.add(id(block.media))
    if (block.blockType === "gallery")
      for (const media of block.media) mediaIDs.add(id(media))
    if (block.blockType === "relationGrid")
      for (const item of block.items ?? []) {
        const ids = groups.get(item.relationTo) ?? new Set<string>()
        ids.add(id(item.value))
        groups.set(item.relationTo, ids)
      }
    if (block.blockType === "testimonials") {
      const ids = groups.get("testimonials") ?? new Set<string>()
      for (const item of block.items ?? []) ids.add(id(item))
      groups.set("testimonials", ids)
    }
  }
  // Deleted foreign keys can be null despite authoring-time required fields.
  mediaIDs.delete("")
  for (const ids of groups.values()) ids.delete("")
  const relations = new Map<string, RelatedItem>()
  const testimonials = new Map<string, TestimonialItem>()
  const [media] = await Promise.all([
    mediaIDs.size
      ? readMedia([...mediaIDs])
      : Promise.resolve(new Map<string, MediaAsset | undefined>()),
    ...[...groups].map(async ([collection, ids]) => {
      if (!ids.size) return
      const result = await payload.find({
        collection,
        locale,
        draft,
        ...access,
        depth: 0,
        fallbackLocale: false,
        pagination: false,
        limit: ids.size,
        where: { id: { in: [...ids] } },
      })
      for (const document of result.docs) {
        if (
          collection === "testimonials" &&
          "quote" in document &&
          "attribution" in document
        ) {
          testimonials.set(document.id, {
            quote: document.quote,
            attribution: document.attribution,
            role: document.roleOrCompany ?? undefined,
          })
        } else if (
          collection !== "testimonials" &&
          "slug" in document &&
          "summary" in document
        ) {
          relations.set(`${collection}:${document.id}`, {
            id: document.id,
            title: document.title,
            summary: document.summary,
            path: relationPaths[collection](document.slug),
          })
        }
      }
    }),
  ])
  const resolved: EditorialBlock[] = []
  for (const block of blocks) {
    const heading = block.heading
    switch (block.blockType) {
      case "richText":
        resolved.push({ blockType: block.blockType, heading, body: block.body })
        break
      case "mediaText":
        resolved.push({
          blockType: block.blockType,
          heading,
          body: block.body,
          mediaPosition: block.mediaPosition,
          media: media.get(id(block.media)),
        })
        break
      case "featureGrid":
      case "steps":
        resolved.push({
          blockType: block.blockType,
          heading,
          items: block.items.map(({ title, text }) => ({ title, text })),
        })
        break
      case "relationGrid": {
        const items = (block.items ?? []).flatMap((item) => {
          const visible = relations.get(`${item.relationTo}:${id(item.value)}`)
          return visible ? [visible] : []
        })
        if (items.length)
          resolved.push({ blockType: block.blockType, heading, items })
        break
      }
      case "gallery": {
        const visible = block.media.flatMap((item) => {
          const image = media.get(id(item))
          return image ? [image] : []
        })
        if (visible.length)
          resolved.push({ blockType: block.blockType, heading, media: visible })
        break
      }
      case "testimonials": {
        const items = (block.items ?? []).flatMap((item) => {
          const visible = testimonials.get(id(item))
          return visible ? [visible] : []
        })
        if (items.length)
          resolved.push({ blockType: block.blockType, heading, items })
        break
      }
      case "faq":
        resolved.push({
          blockType: block.blockType,
          heading,
          items: block.items.map(({ question, answer }) => ({
            question,
            answer,
          })),
        })
        break
      case "cta":
        if (/^\/(?![/\\])[^\u0000-\u001f\u007f]*$/.test(block.path))
          resolved.push({
            blockType: block.blockType,
            heading,
            body: block.body,
            label: block.label,
            path: block.path,
          })
        break
    }
  }
  return resolved
}
