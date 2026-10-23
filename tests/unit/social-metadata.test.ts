import { expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({
  draftMode: async () => ({ isEnabled: false }),
}))
vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_INDEXING_ENABLED: "false" } }))
vi.mock("@/lib/site-url", () => ({ getSiteURL: () => "http://localhost:3000" }))
import { getLocalizedMetadata } from "@/content/metadata"

it("uses a resolved CMS social image in both Open Graph and Twitter metadata", async () => {
  const result = await getLocalizedMetadata({
    locale: "en",
    path: "/services/atelier",
    title: "Atelier",
    description: "Description",
    image: {
      src: "/media/approved.webp",
      alt: { en: "Approved editorial", uk: "Фото", ru: "Фото" },
    },
  })
  expect(result.openGraph).toMatchObject({
    images: [{ url: "/media/approved.webp", alt: "Approved editorial" }],
  })
  expect(result.twitter).toMatchObject({ images: ["/media/approved.webp"] })
})

it("retains the real brand image when no approved CMS image is resolved", async () => {
  const result = await getLocalizedMetadata({
    locale: "en",
    title: "Atelier",
    description: "Description",
  })
  expect(result.openGraph).toMatchObject({
    images: [{ url: "/brand/logo-og.png", width: 1200, height: 630 }],
  })
})
