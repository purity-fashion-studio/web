import * as React from "react"
import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ resolve: vi.fn() }))
vi.mock("@/content/public-api", () => ({
  getPageBySlug: async () => ({
    title: "Booking",
    summary: "Book",
    body: "Steps",
    sections: [],
  }),
  getSiteSettings: async () => ({ booking: {} }),
  getPublishedServices: async () => [
    {
      slug: "atelier-service",
      routeSegment: "atelier-service",
      title: "Atelier",
    },
  ],
}))
vi.mock("@/content/metadata", () => ({ getLocalizedMetadata: vi.fn() }))
vi.mock("@/features/cart/actions", () => ({ resolveCart: state.resolve }))
vi.mock("@/features/booking/booking-form", () => ({ BookingForm: () => null }))
vi.mock("@/components/cms-site-shell", () => ({
  SiteHeader: () => null,
  SiteFooter: () => null,
}))
vi.mock("@/components/purity", () => ({ EditorialHero: () => null }))
vi.mock("@/components/editorial-sections", () => ({
  EditorialSections: () => null,
}))
import BookingPage from "@/app/[locale]/booking/page"
import { BookingForm } from "@/features/booking/booking-form"

function formProps(
  node: React.ReactNode
): { initialIntent?: string } | undefined {
  if (
    !React.isValidElement<{
      children?: React.ReactNode
      initialIntent?: string
    }>(node)
  )
    return
  if (node.type === BookingForm) return node.props
  return React.Children.toArray(node.props.children)
    .map(formProps)
    .find(Boolean)
}
beforeEach(() => {
  vi.stubGlobal("React", React)
})
it.each([
  ["request", false, "request"],
  ["checkout", false, "checkout"],
  ["request", true, "request"],
  ["checkout", true, "request"],
  ["unsupported", false, "checkout"],
] as const)(
  "honors %s intent with quote=%s as %s",
  async (intent, requiresQuote, expected) => {
    state.resolve.mockResolvedValue([{ available: true, requiresQuote }])
    const page = await BookingPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({
        service: "atelier-service",
        offer: "offer",
        intent,
      }),
    })
    expect(formProps(page)?.initialIntent).toBe(expected)
  }
)
it.each(["request", "checkout"])(
  "never offers a stale selection form for %s",
  async (intent) => {
    state.resolve.mockResolvedValue([{ available: false, requiresQuote: true }])
    const page = await BookingPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({
        service: "atelier-service",
        offer: "stale",
        intent,
      }),
    })
    expect(formProps(page)).toBeUndefined()
  }
)
