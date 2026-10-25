import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ pathname: "/en/missing" }))
vi.mock("next-intl/server", () => ({
  getLocale: async () => state.pathname.split("/")[1],
}))
import LocaleNotFound from "@/app/[locale]/not-found"
it.each([
  ["uk", "Сторінку не знайдено", "На головну"],
  ["ru", "Страница не найдена", "На главную"],
  ["en", "Page not found", "Back to home"],
])(
  "renders a localized CSP-safe not-found boundary in %s",
  async (locale, title, back) => {
    vi.stubGlobal("React", React)
    try {
      state.pathname = `/${locale}/services/missing`
      const html = renderToStaticMarkup(await LocaleNotFound())
      expect(html).toContain(title)
      expect(html).toContain(back)
      expect(html).toContain(`href="/${locale}"`)
      expect(html).toContain('id="main-content"')
      expect(html).not.toContain("style=")
    } finally {
      vi.unstubAllGlobals()
    }
  }
)
