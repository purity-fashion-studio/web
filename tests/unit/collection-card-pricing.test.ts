import { beforeEach, expect, it, vi } from "vitest"
import type { Locale } from "@/i18n/routing"
import { commerceLabel, formatOfferPrice } from "@/content/commerce"

const state = vi.hoisted(() => ({ find: vi.fn(), findGlobal: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("payload", () => ({ getPayload: async () => state }))
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }))
vi.mock("next/headers", () => ({
  draftMode: async () => ({ isEnabled: false }),
  headers: async () => new Headers(),
}))
vi.mock("react", () => ({ cache: (fn: unknown) => fn }))
import {
  getPublishedFashionCollectionCards,
  getFashionCollectionBySlug,
} from "@/content/public-api"

beforeEach(() => vi.clearAllMocks())
it.each(["uk", "ru", "en"] as const)(
  "formats real collection card and detail pricing in %s",
  async (locale: Locale) => {
    const labels = {
      from: `${locale} from label`,
      custom: `${locale} quote label`,
    }
    state.findGlobal.mockResolvedValue({
      contacts: {},
      maintenance: {},
      booking: { pricing: labels },
    })
    for (const mode of ["fixed", "from", "range", "custom", "none"] as const) {
      const offer = {
        id: "offer",
        fashionCollection: "collection",
        title: "Offer",
        pricingMode: mode,
        commercialStatus: "active",
        prices: [
          { currency: "EUR", amount: 10000, minAmount: 5000, maxAmount: 15000 },
        ],
      }
      state.find.mockImplementation(async ({ collection, select }) => {
        const docs =
          collection === "fashion-collections"
            ? [
                {
                  id: "collection",
                  slug: "capsule",
                  title: "Capsule",
                  summary: "Summary",
                  availability: "coming-soon",
                  gallery: [],
                  materials: [],
                  cta: {},
                },
              ]
            : collection === "offers" && mode !== "none"
              ? [offer]
              : []
        // Emulate the actual database projection, so omitted price fields are visible.
        return {
          docs: select
            ? docs.map((doc) =>
                Object.fromEntries(
                  Object.entries(doc).filter(([key]) => select[key])
                )
              )
            : docs,
        }
      })
      const expected =
        mode === "none"
          ? commerceLabel(locale, "status", "coming-soon")
          : `Offer: ${formatOfferPrice(offer as never, locale, labels)}`
      const [card] = await getPublishedFashionCollectionCards(locale)
      const detail = await getFashionCollectionBySlug(locale, "capsule")
      expect(card.priceNote).toBe(expected)
      expect(detail?.priceNote).toBe(expected)
      expect(card.priceNote).not.toMatch(
        /: (fixed|from|range|custom)$|coming-soon/
      )
    }
  }
)
