import * as React from "react"
import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  availability: "coming-soon",
  formats: ["in-person", "hybrid"],
}))
vi.mock("@/content/public-api", () => ({
  getCourseBySlug: async () => ({
    slug: "course",
    routeSegment: "course",
    title: "Course",
    formats: state.formats,
    commercialStatus: state.availability,
    cta: { label: "Book" },
    offers: [],
    program: [],
    sessions: 2,
  }),
  getSiteSettings: async () => ({
    booking: { pricing: { from: "From", custom: "Custom" } },
  }),
}))
vi.mock("@/content/metadata", () => ({ getLocalizedMetadata: vi.fn() }))
vi.mock("@/components/cms-site-shell", () => ({
  SiteHeader: () => null,
  SiteFooter: () => null,
}))
vi.mock("@/components/purity", () => ({
  EditorialHero: () => null,
  FeatureList: () => null,
  ImageFrame: () => null,
  EditorialFaq: () => null,
}))
vi.mock("@/components/editorial-sections", () => ({
  EditorialSections: () => null,
}))
vi.mock("@/features/cart/product-cart-controls", () => ({
  ProductCartControls: () => null,
}))
import CoursePage from "@/app/[locale]/courses/[slug]/page"
import { CollectionsPageView } from "@/app/[locale]/[section]/section-page-views"

import { commerceLabel } from "@/content/commerce"

it.each(["uk", "ru", "en"] as const)(
  "covers every public commerce enum without changing serialized values in %s",
  (locale) => {
    const groups = {
      status: [
        "active",
        "available",
        "coming-soon",
        "waitlist",
        "paused",
        "sold-out",
        "retired",
        "archived",
        "inquiry",
      ],
      format: ["online", "studio", "remote-atelier", "in-person", "hybrid"],
      checkout: [
        "instant-payment",
        "deposit",
        "booking-request",
        "inquiry",
        "waitlist",
      ],
    } as const
    for (const group of ["status", "format", "checkout"] as const) {
      for (const token of groups[group]) {
        const label = commerceLabel(locale, group, token)
        expect(label.trim().length).toBeGreaterThan(0)
        expect(label).not.toBe(token)
      }
    }
    expect(
      commerceLabel(locale, "status", "Studio-approved custom availability")
    ).toBe("Studio-approved custom availability")
  }
)

function text(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return ""
  return React.Children.toArray(node.props.children).map(text).join(" ")
}
beforeEach(() => {
  vi.stubGlobal("React", React)
  state.availability = "coming-soon"
})
it.each([
  ["uk", "Незабаром", "Особисто", "Гібридно"],
  ["ru", "Скоро", "Лично", "Гибридно"],
  ["en", "Coming soon", "In person", "Hybrid"],
] as const)(
  "renders customer-facing status and format meanings in %s",
  async (locale, status, format, hybrid) => {
    const output = text(
      await CoursePage({ params: Promise.resolve({ locale, slug: "course" }) })
    )
    expect(output).toContain(status)
    expect(output).toContain(`${format} · ${hybrid}`)
    expect(output).not.toContain("coming-soon")
    expect(output).not.toContain("in-person")
  }
)
it.each([
  ["uk", "Незабаром"],
  ["ru", "Скоро"],
  ["en", "Coming soon"],
] as const)("localizes collection card availability in %s", (locale, label) => {
  const page = CollectionsPageView({
    locale,
    category: {
      slug: "collections",
      routeSegment: "collections",
      title: "Collections",
      summary: "Summary",
    },
    collections: [
      {
        routeSegment: "capsule",
        title: "Capsule",
        summary: "Summary",
        materials: [],
        commercialStatus: "coming-soon",
        priceNote: "",
      },
    ],
    direction: { inquirySteps: [] } as never,
  })
  expect(text(page)).toContain(label)
  expect(text(page)).not.toContain("coming-soon")
})
