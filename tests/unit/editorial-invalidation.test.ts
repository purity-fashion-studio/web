import { afterEach, beforeEach, expect, it, vi } from "vitest"

const { revalidateTag, revalidatePath } = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))
vi.mock("next/cache", () => ({ revalidateTag, revalidatePath }))
import {
  publicCollectionHooks,
  revalidateTestimonials,
  revalidateDeletedTestimonial,
  revalidateGlobal,
} from "@/payload/hooks/revalidation"

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("PAYLOAD_IMPORTING", "false")
})
afterEach(() => vi.unstubAllEnvs())

it.each(["services", "courses", "fashion-collections", "portfolio-cases"])(
  "invalidates supplementary references after %s publication changes and deletion",
  async (collectionTag) => {
    const hooks = publicCollectionHooks({ collectionTag, pathPrefix: "/test" })
    await hooks.afterChange[0]!({
      doc: { id: "test", slug: "same", _status: "draft" },
      previousDoc: { slug: "same", _status: "published" },
      req: {},
    } as never)
    expect(revalidateTag).toHaveBeenCalledWith("cms:editorial", { expire: 0 })
    vi.clearAllMocks()
    await hooks.afterDelete[0]!({ doc: { id: "test", slug: "same" } } as never)
    expect(revalidateTag).toHaveBeenCalledWith("cms:editorial", { expire: 0 })
  }
)

it("invalidates the cached shared maintenance notice on Site Settings changes", async () => {
  await revalidateGlobal("site-settings")({
    doc: { maintenance: { enabled: true, message: "Maintenance" } },
  } as never)
  expect(revalidateTag).toHaveBeenCalledWith("cms:site-settings", { expire: 0 })
})

it("invalidates supplementary testimonials when consent changes or a testimonial is deleted", async () => {
  for (const hook of [revalidateTestimonials, revalidateDeletedTestimonial]) {
    vi.clearAllMocks()
    await hook({ doc: { id: "test" } } as never)
    expect(revalidateTag).toHaveBeenCalledWith("cms:editorial", { expire: 0 })
  }
})
