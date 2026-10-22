import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ pathname: "/en" }))
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }))
import GlobalError from "@/app/global-error"

it.each([
  ["/en", "temporarily unavailable"],
  ["/uk", "тимчасово недоступний"],
  ["/ru", "временно недоступен"],
])("renders a CMS-independent recovery document for %s", (path, expected) => {
  state.pathname = path
  const html = renderToStaticMarkup(
    createElement(GlobalError, { retry: () => {} })
  )
  expect(html).toContain("<html")
  expect(html).toContain("<body")
  expect(html).toContain(expected)
  expect(html).not.toContain("DATABASE_URL")
})
