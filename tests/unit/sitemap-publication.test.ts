import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  services: [] as string[],
  pages: [] as string[],
  directions: [] as string[],
}))
vi.mock("@/content/public-api", () => ({
  getPublishedCourseSlugs: async () => [],
  getPublishedFashionCollectionSlugs: async () => [],
  getPublishedPortfolioCaseSlugs: async () => [],
  getPublishedServiceSlugs: async () => state.services,
  getPublishedPageSlugs: async () => state.pages,
  getPublishedDirectionSlugs: async () => state.directions,
}))
vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_INDEXING_ENABLED: "true" } }))
vi.mock("@/lib/site-url", () => ({ getSiteURL: () => "https://example.com" }))
import sitemap from "@/app/sitemap"

beforeEach(() => {
  state.services = []
  state.pages = []
  state.directions = []
})
it("does not advertise unpublished portfolio or atelier routes", async () => {
  const urls = (await sitemap()).map((entry) => entry.url)
  expect(urls).not.toContain("https://example.com/en/portfolio")
  expect(urls).not.toContain("https://example.com/en/atelier")
})
it("includes the atelier fallback only while its published service exists", async () => {
  state.services = ["atelier-service"]
  expect((await sitemap()).map((entry) => entry.url)).toContain(
    "https://example.com/en/atelier"
  )
})
