import { expect, it, vi } from "vitest"

import { Services } from "@/payload/collections/Services"
import { Courses } from "@/payload/collections/Courses"

it.each([
  [Services, "primaryDirection"],
  [Courses, "direction"],
] as const)(
  "public %s reads require a published direction without hiding drafts from editors",
  async (collection, field) => {
    const find = vi.fn(async () => ({ docs: [{ id: "published-direction" }] }))
    const req = { user: undefined, payload: { find } }
    const read = collection.access?.read
    if (!read) throw new Error("Missing read policy")
    expect(await read({ req } as never)).toMatchObject({
      and: expect.arrayContaining([
        { [field]: { in: ["published-direction"] } },
      ]),
    })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "directions",
        overrideAccess: false,
      })
    )
    find.mockClear()
    expect(
      await read({
        req: {
          ...req,
          user: { id: "editor", roles: ["editor"], active: true },
        },
      } as never)
    ).toBe(true)
    expect(find).not.toHaveBeenCalled()
  }
)
