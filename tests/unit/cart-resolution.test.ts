import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  find: vi.fn(),
  findGlobal: vi.fn(),
  offerAvailable: true,
  entityAvailable: true,
}))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("payload", () => ({ getPayload: async () => state }))
import { resolveCart } from "@/features/cart/actions"

const selection = {
  kind: "service",
  slug: "atelier-service",
  offerId: "offer",
  format: "studio",
  currency: "EUR",
}
beforeEach(() => {
  vi.clearAllMocks()
  state.offerAvailable = true
  state.entityAvailable = true
  state.findGlobal.mockResolvedValue({
    enabledModes: ["instant-payment", "booking-request"],
    providerRouting: [{ currency: "EUR", provider: "stripe", enabled: true }],
  })
  state.find.mockImplementation(async ({ collection }) => ({
    docs:
      collection === "offers"
        ? state.offerAvailable
          ? [
              {
                id: "offer",
                title: "Verified studio offer",
                service: "service",
                _status: "published",
                enabled: true,
                commercialStatus: "active",
                format: "studio",
                pricingMode: "fixed",
                checkoutMode: "instant-payment",
                prices: [{ currency: "EUR", amount: 12000 }],
              },
            ]
          : []
        : state.entityAvailable
          ? [
              {
                id: "service",
                title: "Atelier",
                slug: "atelier-service",
                _status: "published",
                enabled: true,
              },
            ]
          : [],
  }))
})

it("resolves authoritative prices and explicit checkout from published CMS records", async () => {
  const [item] = await resolveCart("en", [
    { ...selection, amount: 1, title: "Forged" },
  ])
  expect(item).toMatchObject({
    title: "Atelier",
    offerTitle: "Verified studio offer",
    available: true,
    requiresQuote: false,
  })
  expect(item?.price).toContain("120.00")
  expect(item?.bookingPath).toContain("offer=offer")
  expect(state.find).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: "offers",
      overrideAccess: false,
      where: {
        and: [{ service: { equals: "service" } }, { id: { equals: "offer" } }],
      },
    })
  )
})

it("does not turn missing or foreign offers into a different paid selection", async () => {
  state.offerAvailable = false
  const [item] = await resolveCart("en", [selection])
  expect(item?.available).toBe(false)
  expect(item?.bookingPath).toBeUndefined()
})

it("keeps unknown prices as an inquiry, never a fabricated total", async () => {
  const [item] = await resolveCart("en", [{ ...selection, offerId: undefined }])
  expect(item).toMatchObject({ available: true, requiresQuote: true })
  expect(item?.bookingPath).toContain("intent=request")
  expect(item?.price).toBeUndefined()
})

it("preserves course identity in a quote-only path", async () => {
  const [item] = await resolveCart("en", [
    {
      ...selection,
      kind: "course",
      slug: "wardrobe-management-course",
      offerId: undefined,
    },
  ])
  expect(item?.bookingPath).toContain("course=wardrobe-management-course")
})

it("excludes unpublished or removed entities from checkout", async () => {
  state.entityAvailable = false
  expect((await resolveCart("en", [selection]))[0]?.available).toBe(false)
})
