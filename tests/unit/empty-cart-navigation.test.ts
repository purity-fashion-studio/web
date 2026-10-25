import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

vi.mock("@/features/cart/actions", () => ({ resolveCart: vi.fn() }))

import { CartView } from "@/features/cart/cart-view"

beforeEach(() => vi.stubGlobal("React", React))
afterEach(() => vi.unstubAllGlobals())

it.each([
  ["uk", "Переглянути послуги"],
  ["ru", "Посмотреть услуги"],
  ["en", "Explore services"],
] as const)(
  "links the empty cart to the published catalogue in %s",
  (locale, browse) => {
    const html = renderToStaticMarkup(
      React.createElement(CartView, {
        locale,
        formatLabels: {
          online: "Online",
          studio: "Studio",
          atelier: "Atelier",
        },
      })
    )
    expect(html).toContain(browse)
    expect(html).toContain(`href="/${locale}/stylist"`)
    expect(html).not.toContain(`href="/${locale}/research"`)
  }
)
