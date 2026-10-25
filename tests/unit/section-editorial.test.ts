import * as React from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

import type { EditorialBlock } from "@/content/editorial"

const { pages, service, directionByKey } = vi.hoisted(() => ({
  pages: vi.fn(),
  service: vi.fn(),
  directionByKey: vi.fn(),
}))
vi.mock("@/content/public-api", () => ({
  getDirectionByCanonicalKey: directionByKey,
  getServiceBySlug: service,
  getDirectionBySlug: vi.fn(async () => null),
  getPageBySlug: pages,
  getPublishedCourseCards: vi.fn(),
  getPublishedDirections: vi.fn(),
  getPublishedFashionCollectionCards: vi.fn(),
  getPublishedServices: async () => [await service()],
}))
vi.mock("@/content/metadata", () => ({ getLocalizedMetadata: vi.fn() }))
vi.mock("@/components/content-page", () => ({ ContentPage: () => null }))
vi.mock("@/app/[locale]/[section]/section-page-views", () => ({
  CollectionsPageView: () => null,
  LegalPageView: () => null,
  OfferCategoryPageView: () => null,
  StudioPageView: () => null,
}))

import SectionPage, { generateMetadata } from "@/app/[locale]/[section]/page"

it.each(
  ["uk", "ru", "en"].flatMap((locale) =>
    ["success", "pending", "failure", "cancel", "refunded"].map((status) => ({
      locale,
      slug: `payment-${status}`,
    }))
  )
)(
  "does not render $slug as a generic page in $locale",
  async ({ locale, slug }) => {
    pages.mockResolvedValue({
      pageType: "service-state",
      slug,
      routeSegment: slug,
      title: "Payment confirmed",
      sections: [],
      body: "Payment received",
      cta: { label: "Book", action: "booking" },
      seo: { title: "Payment confirmed" },
    })
    const props = {
      params: Promise.resolve({ locale, section: slug }),
    }
    await expect(SectionPage(props)).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404"
    )
    expect(await generateMetadata(props)).toEqual({})
  }
)

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("React", React)
})
afterEach(() => vi.unstubAllGlobals())

it.each(["uk", "ru", "en"])(
  "uses actual Atelier service editorial content without a dedicated direction in %s",
  async (locale) => {
    pages.mockResolvedValue(null)
    const atelier = {
      slug: "atelier-service",
      routeSegment: "atelier-service",
      title: `${locale} Atelier`,
      summary: `${locale} summary`,
      intro: `${locale} atelier hero`,
      processTitle: `${locale} atelier process`,
      process: [{ title: `${locale} fitting`, text: `${locale} garment work` }],
      formatsTitle: `${locale} formats`,
      formats: [{ title: `${locale} studio`, text: `${locale} tailoring` }],
      outcomeTitle: `${locale} outcomes`,
      outcomes: [`${locale} fitted garment`],
      nextStepTitle: `${locale} consultation`,
      nextStepSummary: `${locale} fitting next step`,
      cta: { label: `${locale} book atelier` },
    }
    service.mockResolvedValue(atelier)
    directionByKey.mockResolvedValue({
      narrative: "Shopping trip",
      ctaService: "realisation-support",
      outcomes: ["Shopping bag"],
      process: [],
      faq: [],
    })
    const element = await SectionPage({
      params: Promise.resolve({ locale, section: "atelier" }),
    })
    const props = (
      element as React.ReactElement<{
        copy: Record<string, unknown>
        ctaLabel: string
      }>
    ).props
    expect(props.copy).toMatchObject({
      ctaService: "atelier-service",
      heroNote: atelier.intro,
      processTitle: atelier.processTitle,
      processSteps: atelier.process,
      outcomes: atelier.outcomes,
      outcomesTitle: atelier.outcomeTitle,
      ctaTitle: atelier.nextStepTitle,
      ctaSummary: atelier.nextStepSummary,
    })
    expect(props.ctaLabel).toBe(atelier.cta.label)
    expect(directionByKey).not.toHaveBeenCalled()
  }
)

it.each([
  "cookies",
  "payments",
  "cancellation-refunds",
  "consent",
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
