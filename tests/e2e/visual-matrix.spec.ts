import { expect, test } from "@playwright/test"

const colorSchemes = ["light"] as const
const viewports = [320, 1440] as const
const routes = [
  "/",
  "/stylist",
  "/shopping",
  "/atelier",
  "/wardrobe",
  "/corporate",
  "/school",
  "/collections",
  "/studio",
  "/privacy",
  "/services/atelier-service",
  "/courses/wardrobe-management-course",
  "/collections/purity-capsule",
  "/portfolio",
  "/contacts",
  "/booking?service=atelier-service",
  "/payment/success?provider=stripe&order=purity-visual",
  "/payment/cancel",
  "/payment/failure",
]

test("visual matrix captures every public route family", async ({ page }) => {
  test.setTimeout(900_000)
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text())
    }
  })
  page.on("pageerror", (error) => errors.push(error.message))

  for (const colorScheme of colorSchemes) {
    await page.emulateMedia({ colorScheme })

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 })

      for (const route of routes) {
        const localizedRoute = `/uk${route}`
        const response = await page.goto(localizedRoute, {
          waitUntil: "load",
        })

        expect(response?.ok(), `${colorScheme} ${width} ${route}`).toBe(true)
        await expect(page.locator("main h1").first()).toBeVisible()
        await expect
          .poll(
            () =>
              page.evaluate(
                () =>
                  [...document.images].filter((image) => {
                    const rect = image.getBoundingClientRect()
                    const style = getComputedStyle(image)

                    return (
                      rect.width > 1 &&
                      rect.height > 1 &&
                      style.visibility !== "hidden" &&
                      style.display !== "none" &&
                      image.complete &&
                      image.naturalWidth > 0
                    )
                  }).length
              ),
            { message: `${colorScheme} ${width} ${route}` }
          )
          .toBeGreaterThan(0)

        const metrics = await page.evaluate(() => {
          const isVisible = (element: Element | null) => {
            if (!element) {
              return false
            }

            const rect = element.getBoundingClientRect()
            const style = getComputedStyle(element)

            return (
              rect.width > 1 &&
              rect.height > 1 &&
              style.visibility !== "hidden" &&
              style.display !== "none"
            )
          }

          return {
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            visibleHeader: isVisible(document.querySelector("header")),
            visibleFooter: isVisible(document.querySelector("footer")),
            mainTextLength:
              document.querySelector("main")?.textContent?.trim().length ?? 0,
            loadedImages: [...document.images].filter(
              (image) =>
                isVisible(image) && image.complete && image.naturalWidth > 0
            ).length,
          }
        })
        const screenshot = await page.screenshot({
          animations: "disabled",
          caret: "initial",
        })

        expect(metrics.visibleHeader, `${colorScheme} ${width} ${route}`).toBe(
          true
        )
        expect(metrics.visibleFooter, `${colorScheme} ${width} ${route}`).toBe(
          true
        )
        expect(
          metrics.scrollWidth,
          `${colorScheme} ${width} ${route}`
        ).toBeLessThanOrEqual(metrics.clientWidth + 1)
        expect(
          screenshot.length,
          `${colorScheme} ${width} ${route}`
        ).toBeGreaterThan(15_000)
        expect(
          metrics.mainTextLength,
          `${colorScheme} ${width} ${route}`
        ).toBeGreaterThan(120)
        expect(
          metrics.loadedImages,
          `${colorScheme} ${width} ${route}`
        ).toBeGreaterThan(0)
      }
    }
  }

  expect(errors).toEqual([])
})
