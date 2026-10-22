import { expect, it } from "vitest"

import {
  cartSelectionKey,
  parseStoredCart,
  addSelection,
  cartSelectionSchema,
} from "@/features/cart/selection"

const service = {
  kind: "service" as const,
  slug: "atelier-service",
  format: "studio" as const,
  currency: "EUR" as const,
}

it("persists validated selections without trusting browser-supplied prices or titles", () => {
  const stored = JSON.stringify([
    { ...service, amount: 1, title: "Forged price" },
  ])
  expect(parseStoredCart(stored)).toEqual([service])
})

it("deduplicates the same offer/options but retains distinct entities and currencies", () => {
  const first = addSelection([], service)
  expect(addSelection(first, service)).toEqual(first)
  const second = addSelection(first, {
    ...service,
    kind: "collection",
    slug: "purity-capsule",
  })
  expect(addSelection(second, { ...service, currency: "UAH" })).toHaveLength(3)
  expect(new Set(second.map(cartSelectionKey)).size).toBe(2)
})

it.each([
  "not-json",
  "{}",
  '[{"kind":"script","slug":"evil"}]',
  JSON.stringify(Array.from({ length: 21 }, () => service)),
])("rejects malformed or oversized persisted cart %#", (stored) => {
  expect(parseStoredCart(stored)).toEqual([])
})

it("rejects unsafe route slugs and unsupported options", () => {
  expect(
    cartSelectionSchema.safeParse({ ...service, slug: "../admin" }).success
  ).toBe(false)
  expect(
    cartSelectionSchema.safeParse({ ...service, currency: "USD" }).success
  ).toBe(false)
})
