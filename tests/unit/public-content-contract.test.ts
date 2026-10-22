import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ find: vi.fn(), findByID: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("payload", () => ({ getPayload: async () => state }))
vi.mock("next/cache", () => ({
  unstable_cache: (operation: () => unknown) => operation,
}))
vi.mock("next/headers", () => ({
  draftMode: async () => ({ isEnabled: false }),
  headers: async () => new Headers(),
}))
vi.mock("react", () => ({ cache: (operation: unknown) => operation }))
import {
  getServiceBySlug,
  getPortfolioCaseBySlug,
  getPublishedPortfolioCases,
  getPublishedServices,
  getHomeSelections,
} from "@/content/public-api"

beforeEach(() => {
  vi.clearAllMocks()
  state.find.mockImplementation(async ({ collection }) => ({
    docs:
      collection === "services"
        ? [
            {
              id: "service",
              slug: "atelier-service",
              title: "Atelier",
              primaryDirection: "direction",
              gallery: [],
            },
          ]
        : [],
  }))
  state.findByID.mockRejectedValue(
    new Error("The requested direction is not readable")
  )
})

it("treats an unpublished parent direction as unavailable instead of throwing", async () => {
  await expect(getServiceBySlug("en", "atelier-service")).resolves.toBeNull()
})

it("does not turn an empty relationship selection into every public service", async () => {
  expect(await getPublishedServices("en", { ids: [] })).toEqual([])
  expect(state.find).not.toHaveBeenCalled()
})

it("applies slug selection in the database before loading media", async () => {
  await getPublishedServices("en", { slugs: ["atelier-service"] })
  expect(state.find).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: "services",
      where: { and: [{ slug: { in: ["atelier-service"] } }] },
    })
  )
})

it("does not load technical pricing modes for homepage collection cards", async () => {
  state.find.mockImplementation(async ({ collection }) => ({
    docs:
      collection === "fashion-collections"
        ? [
            {
              id: "collection",
              slug: "capsule",
              title: "Capsule",
              availability: "inquiry",
              gallery: [],
            },
          ]
        : [],
  }))
  const result = await getHomeSelections("en", {
    selectedServiceSlugs: [],
    selectedCourseSlugs: [],
    selectedCollectionSlugs: ["capsule"],
    selectedPortfolioSlugs: [],
  })
  expect(result.collections[0]).not.toHaveProperty("priceNote")
  expect(
    state.find.mock.calls.some(([query]) => query.collection === "offers")
  ).toBe(false)
})

it("excludes legacy portfolio records whose media is generated rather than real proof", async () => {
  state.find.mockImplementation(async ({ collection }) => ({
    docs:
      collection === "portfolio-cases"
        ? [
            {
              id: "case",
              slug: "case",
              title: "Case",
              media: ["media"],
              isRealClientProof: true,
              approvalStatus: "approved",
              usageRightsStatus: "approved",
            },
          ]
        : collection === "media"
          ? [
              {
                id: "media",
                source: "generated",
                isRealClientProof: false,
                usageRightsStatus: "approved",
                publicVisibility: true,
                url: "/generated.png",
                filename: "generated.png",
                alt: "Generated",
                replacementPriority: "replace-before-launch",
              },
            ]
          : [],
  }))
  expect(await getPortfolioCaseBySlug("en", "case")).toBeNull()
  expect(await getPublishedPortfolioCases("en")).toEqual([])
})
