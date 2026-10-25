import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ enabled: true, message: "Maintenance" }))
vi.mock("@/content/public-api", () => ({
  getHeader: async () => ({}),
  getSiteSettings: async () => ({
    maintenance: { enabled: state.enabled, message: state.message },
  }),
}))
vi.mock("@/components/site-shell", () => ({
  SiteHeaderClient: ({ overlay }: { overlay: boolean }) =>
    React.createElement("header", { "data-overlay": String(overlay) }),
}))
vi.mock("@/components/site-footer", () => ({ SiteFooter: () => null }))
import { SiteHeader } from "@/components/cms-site-shell"
beforeEach(() => {
  vi.stubGlobal("React", React)
  state.enabled = true
})
it.each([
  ["uk", "Технічні роботи"],
  ["ru", "Технические работы"],
  ["en", "Scheduled maintenance"],
] as const)(
  "displays the enabled CMS message accessibly in %s",
  async (locale, message) => {
    state.message = message
    const html = renderToStaticMarkup(await SiteHeader({ locale }))
    expect(html).toContain('role="status"')
    expect(html).toContain(message)
    expect(html).toContain('data-overlay="false"')
  }
)
it("escapes CMS notice markup rather than executing it", async () => {
  state.message = '<script>alert("unsafe")</script>'
  const html = renderToStaticMarkup(await SiteHeader({ locale: "en" }))
  expect(html).toContain("&lt;script&gt;")
  expect(html).not.toContain("<script>")
})
it.each([
  [false, "Hidden notice"],
  [true, "   "],
])("does not show disabled or blank notices %#", async (enabled, message) => {
  state.enabled = Boolean(enabled)
  state.message = String(message)
  const html = renderToStaticMarkup(await SiteHeader({ locale: "en" }))
  expect(html).not.toContain('role="status"')
  expect(html).toContain('data-overlay="true"')
})
