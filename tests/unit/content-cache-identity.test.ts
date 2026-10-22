import { expect, it } from "vitest"

import { contentCacheIdentity } from "@/content/cache-identity"

it("retires cached static-media views when switching to protected upload delivery", () => {
  expect(contentCacheIdentity({ localMedia: true })).toMatch(
    /^purity-payload-cache-v5:/
  )
})

it("isolates caches for separate databases and media delivery modes", () => {
  const common = {
    databaseURL: "postgresql://user:secret@localhost:5432/first",
    localMedia: true,
  }
  expect(contentCacheIdentity(common)).not.toBe(
    contentCacheIdentity({
      ...common,
      databaseURL: "postgresql://user:secret@localhost:5432/second",
    })
  )
  expect(contentCacheIdentity(common)).not.toBe(
    contentCacheIdentity({ ...common, localMedia: false })
  )
})

it("does not expose credentials or invalidate content solely on password rotation", () => {
  const first = contentCacheIdentity({
    databaseURL: "postgresql://user:secret@localhost:5432/first",
    localMedia: true,
  })
  expect(first).not.toMatch(/secret|postgresql|user/)
  expect(first).toBe(
    contentCacheIdentity({
      databaseURL: "postgresql://other:rotated@localhost:5432/first",
      localMedia: true,
    })
  )
})
