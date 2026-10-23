import * as React from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

import type { EditorialBlock } from "@/content/editorial"

const { pages } = vi.hoisted(() => ({ pages: vi.fn() }))
vi.mock("@/content/public-api", () => ({
  getDirectionByCanonicalKey: vi.fn(),
  getDirectionBySlug: vi.fn(async () => null),
  getPageBySlug: pages,
  getPublishedCourseCards: vi.fn(),
  getPublishedDirections: vi.fn(),
  getPublishedFashionCollectionCards: vi.fn(),
  getPublishedServices: vi.fn(),
}))
vi.mock("@/content/metadata", () => ({ getLocalizedMetadata: vi.fn() }))
vi.mock("@/components/content-page", () => ({ ContentPage: () => null }))
vi.mock("@/app/[locale]/[section]/section-page-views", () => ({
  CollectionsPageView: () => null,
  LegalPageView: () => null,
  OfferCategoryPageView: () => null,
  StudioPageView: () => null,
}))

import SectionPage from "@/app/[locale]/[section]/page"

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("React", React)
})
afterEach(() => vi.unstubAllGlobals())

it.each([
  "cookies",
  "payments",
  "cancellation-refunds",
  "consent",
  "service-state",
  "contacts",
  "portfolio",
])(
  "forwards managed editorial sections for the generic %s template",
  async (pageType) => {
    const editorialBlocks: EditorialBlock[] = [
      {
        blockType: "richText",
        heading: "QA section",
        body: "Synthetic local test content.",
      },
    ]
    pages.mockResolvedValue({
      pageType,
      slug: "qa-managed-page",
      routeSegment: "qa-managed-page",
      title: "QA managed page",
      summary: "Synthetic local test content.",
      body: "QA body",
      sections: [],
      cta: { label: "QA action", action: "booking" },
      editorialBlocks,
    })
    const element = await SectionPage({
      params: Promise.resolve({ locale: "en", section: "qa-managed-page" }),
    })
    if (!React.isValidElement<{ editorialBlocks?: EditorialBlock[] }>(element))
      throw new Error("Expected a managed content page")
    expect(element.props.editorialBlocks).toBe(editorialBlocks)
  }
)
