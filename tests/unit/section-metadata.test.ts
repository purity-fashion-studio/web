import { beforeEach, expect, it, vi } from "vitest"

const { directions, pages, services } = vi.hoisted(() => ({
  directions: vi.fn(),
  pages: vi.fn(),
  services: vi.fn(),
}))

vi.mock("@/content/public-api", () => ({
  getDirectionByCanonicalKey: vi.fn(),
  getDirectionBySlug: directions,
  getPageBySlug: pages,
  getPublishedCourseCards: vi.fn(),
  getPublishedDirections: vi.fn(),
  getPublishedFashionCollectionCards: vi.fn(),
  getPublishedServices: services,
}))
vi.mock("@/content/metadata", () => ({
  getLocalizedMetadata: vi.fn(async ({ title, path }) => ({
    title,
    alternates: { canonical: path },
  })),
}))
vi.mock("@/components/content-page", () => ({ ContentPage: () => null }))
vi.mock("@/app/[locale]/[section]/section-page-views", () => ({
  CollectionsPageView: () => null,
  LegalPageView: () => null,
  OfferCategoryPageView: () => null,
  StudioPageView: () => null,
}))

import { generateMetadata } from "@/app/[locale]/[section]/page"

beforeEach(() => {
  vi.clearAllMocks()
  directions.mockResolvedValue(null)
  pages.mockResolvedValue(null)
  services.mockResolvedValue([])
})

it.each(["uk", "ru", "en"])(
  "uses the atelier route canonical for its published service in %s",
  async (locale) => {
    services.mockResolvedValue([
      { title: "Atelier service", summary: "Atelier description" },
    ])
    const result = await generateMetadata({
      params: Promise.resolve({ locale, section: "atelier" }),
    })
    expect(services).toHaveBeenCalledWith(locale, {
      slugs: ["atelier-service"],
    })
    expect(result.alternates?.canonical).toBe("/atelier")
    expect(result.title).toBe("Atelier service")
  }
)

it("does not expose fallback service metadata without a published service", async () => {
  const result = await generateMetadata({
    params: Promise.resolve({ locale: "en", section: "atelier" }),
  })
  expect(result).toEqual({})
})

it("keeps a managed page's own route and metadata", async () => {
  pages.mockResolvedValue({
    routeSegment: "studio",
    seo: { title: "Studio", description: "Studio description" },
  })
  const result = await generateMetadata({
    params: Promise.resolve({ locale: "en", section: "studio" }),
  })
  expect(result.alternates?.canonical).toBe("/studio")
  expect(services).not.toHaveBeenCalled()
})
