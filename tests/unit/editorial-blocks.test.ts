import { expect, it, vi } from "vitest"
import type { Payload } from "payload"

import { resolveEditorialBlocks } from "@/content/editorial"
import type { MediaAsset } from "@/content/media"

const fixture = () => {
  const find = vi.fn(async ({ collection }: { collection: string }) => ({
    docs:
      collection === "services"
        ? [
            {
              id: "visible",
              slug: "atelier",
              title: "Atelier",
              summary: "Published description",
            },
          ]
        : collection === "testimonials"
          ? [
              {
                id: "consented",
                quote: "Approved quotation",
                attribution: "Client",
                roleOrCompany: "Public role",
                proofReference: "Never expose",
              },
            ]
          : [],
  }))
  const readMedia = vi.fn(
    async () => new Map([["approved", { id: "approved" } as MediaAsset]])
  )
  return {
    find,
    readMedia,
    context: {
      payload: { find } as unknown as Payload,
      locale: "en" as const,
      draft: false,
      access: { overrideAccess: false as const, user: undefined },
      readMedia,
    },
  }
}

it("does not query an empty supplementary layout", async () => {
  const state = fixture()
  expect(
    await resolveEditorialBlocks({ ...state.context, blocks: undefined })
  ).toEqual([])
  expect(state.find).not.toHaveBeenCalled()
  expect(state.readMedia).not.toHaveBeenCalled()
})

it("resolves all supported block types and filters unreadable relations and media", async () => {
  const state = fixture()
  const blocks = [
    { blockType: "richText" as const, heading: "Story", body: "Text" },
    {
      blockType: "mediaText" as const,
      heading: "Image story",
      body: "Body",
      media: "approved",
      mediaPosition: "end" as const,
    },
    {
      blockType: "featureGrid" as const,
      heading: "Features",
      items: [{ title: "One", text: "Detail" }],
    },
    {
      blockType: "steps" as const,
      heading: "Process",
      items: [{ title: "Step", text: "Detail" }],
    },
    {
      blockType: "relationGrid" as const,
      heading: "Related",
      items: [
        { relationTo: "services" as const, value: "visible" },
        { relationTo: "services" as const, value: "private" },
        { relationTo: "courses" as const, value: "unpublished" },
      ],
    },
    {
      blockType: "gallery" as const,
      heading: "Gallery",
      media: ["approved", "restricted"],
    },
    {
      blockType: "testimonials" as const,
      heading: "Testimonials",
      items: ["consented", "revoked"],
    },
    {
      blockType: "faq" as const,
      heading: "Questions",
      items: [{ question: "Question", answer: "Answer" }],
    },
  ]
  const resolved = await resolveEditorialBlocks({ ...state.context, blocks })
  expect(resolved).toHaveLength(8)
  expect(
    resolved.find((block) => block.blockType === "relationGrid")
  ).toMatchObject({ items: [{ title: "Atelier", path: "/services/atelier" }] })
  expect(resolved.find((block) => block.blockType === "gallery")).toMatchObject(
    { media: [{ id: "approved" }] }
  )
  expect(
    resolved.find((block) => block.blockType === "testimonials")
  ).toMatchObject({
    items: [{ quote: "Approved quotation", attribution: "Client" }],
  })
  expect(JSON.stringify(resolved)).not.toContain("Never expose")
  expect(state.readMedia).toHaveBeenCalledTimes(1)
  for (const [query] of state.find.mock.calls)
    expect(query).toMatchObject({
      overrideAccess: false,
      depth: 0,
      fallbackLocale: false,
      locale: "en",
      draft: false,
    })
})

it("tolerates deleted media relations without an invalid query or a broken page", async () => {
  const state = fixture()
  const blocks = [
    {
      blockType: "mediaText" as const,
      heading: "Story",
      body: "Text remains available",
      media: null as never,
      mediaPosition: "start" as const,
    },
  ]
  expect(
    await resolveEditorialBlocks({ ...state.context, blocks })
  ).toMatchObject([{ body: "Text remains available", media: undefined }])
  expect(state.readMedia).not.toHaveBeenCalled()
})

it("only renders internal CTA paths, not executable or protocol-relative links", async () => {
  const state = fixture()
  const blocks = [
    "javascript:alert(1)",
    "//foreign.example",
    "/\\foreign.example",
    "/booking",
  ].map((path) => ({
    blockType: "cta" as const,
    heading: "Contact",
    body: "Details",
    label: "Contact",
    path,
  }))
  expect(await resolveEditorialBlocks({ ...state.context, blocks })).toEqual([
    {
      blockType: "cta",
      heading: "Contact",
      body: "Details",
      label: "Contact",
      path: "/booking",
    },
  ])
})
