import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

const links = vi.hoisted(
  () => [] as Array<{ href: string; prefetch?: boolean }>
)
vi.mock("next/link", () => ({
  default: ({
    children,
    prefetch,
    href,
    ...props
  }: React.ComponentProps<"a"> & { href: string; prefetch?: boolean }) => {
    links.push({ href, prefetch })
    return React.createElement("a", { ...props, href }, children)
  },
}))

import { ShellLink } from "@/components/site-shell-links"
import { LanguageSwitcher } from "@/components/purity"
import { CartLink } from "@/features/cart/cart-controls"

beforeEach(() => {
  links.length = 0
  vi.stubGlobal("React", React)
})
afterEach(() => vi.unstubAllGlobals())
it("loads global CMS navigation and locale/cart destinations on demand", () => {
  renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      ShellLink({
        href: "/en/studio",
        children: "Studio",
      }),
      React.createElement(LanguageSwitcher, {
        currentLocale: "en",
        currentPath: "/booking?offer=selected",
      }),
      React.createElement(CartLink, { locale: "en" })
    )
  )
  expect(links).toHaveLength(5)
  expect(links.every((link) => link.prefetch === false)).toBe(true)
  expect(links.map((link) => link.href)).toContain("/uk/booking?offer=selected")
})
