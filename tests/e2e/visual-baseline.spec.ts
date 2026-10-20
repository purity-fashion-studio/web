import { expect, test, type Page } from "@playwright/test"

async function waitForHeroMedia(page: Page) {
  const heroImage = page.locator('[data-testid="editorial-hero"] img')

  await expect(heroImage).toBeVisible()
  await expect
    .poll(() =>
      heroImage.evaluate(
        (image) =>
          (image as HTMLImageElement).complete &&
          (image as HTMLImageElement).naturalWidth > 0
      )
    )
    .toBe(true)
}

test.describe("canonical visual baselines", () => {
  test("home light mobile baseline stays approved", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.setViewportSize({ width: 320, height: 844 })
    await page.goto("/en", { waitUntil: "load" })
    await expect(page.locator("main h1").first()).toBeVisible()
    await waitForHeroMedia(page)

    await expect(page).toHaveScreenshot("home-light-mobile.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.04,
    })
  })

  test("home light desktop baseline stays approved", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/en", { waitUntil: "load" })
    await expect(page.locator("main h1").first()).toBeVisible()
    await expect(page.locator("html")).not.toHaveClass(/dark/)
    await waitForHeroMedia(page)

    await expect(page).toHaveScreenshot("home-light-desktop.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.02,
    })
  })
})
