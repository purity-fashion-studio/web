import { expect, test } from "@playwright/test"

import { getManifestRoutes } from "../../payload/seed/manifest"
import { localStageTimeout } from "../support/local-stage-timeout"

const colorSchemes = ["light"] as const

const criticalRoutes = [
  "/uk",
  "/uk/studio",
  "/uk/services/atelier-service",
  "/uk/booking?service=atelier-service",
  "/uk/contacts",
  "/uk/payment/success?provider=stripe&order=purity-test",
]

const pageTicketRoutes = [
  "/uk",
  "/uk/stylist",
  "/uk/shopping",
  "/uk/atelier",
  "/uk/wardrobe",
  "/uk/corporate",
  "/uk/school",
  "/uk/collections",
  "/uk/studio",
  "/uk/privacy",
  "/uk/services/atelier-service",
  "/uk/courses/wardrobe-management-course",
  "/uk/collections/purity-capsule",
  "/uk/portfolio",
  "/uk/contacts",
  "/uk/booking?service=atelier-service",
  "/uk/payment/success?provider=stripe&order=purity-responsive",
  "/uk/payment/cancel",
  "/uk/payment/failure",
]

const utilityRoutes = new Set([
  "/uk/privacy",
  "/uk/terms",
  "/uk/payment/success?provider=stripe&order=purity-responsive",
  "/uk/payment/cancel",
  "/uk/payment/failure",
])

test("Payload admin renders the first-owner bootstrap", async ({ page }) => {
  const response = await page.goto("/admin/create-first-user", {
    waitUntil: "load",
  })

  expect(response?.ok()).toBe(true)
  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible()
  await expect(
    page.getByText("To begin, create your first user.")
  ).toBeVisible()
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('input[name="password"]')).toBeVisible()
})

test("single theme ignores OS and persisted dark preferences", async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: "dark" })
  const page = await context.newPage()
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const locale of ["uk", "ru", "en"] as const) {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"))
    await page.goto(`/${locale}`, { waitUntil: "load" })
    await expect(page.locator("main h1").first()).toBeVisible()
    await expect(page.locator("script#purity-theme-init")).toHaveCount(0)
    await expect
      .poll(() =>
        page.locator("html").evaluate((html) => html.classList.contains("dark"))
      )
      .toBe(false)

    await page.locator(`a[href="/${locale}/studio"]`).first().click()
    await page.waitForURL(`**/${locale}/studio`)
    await expect
      .poll(() =>
        page.locator("html").evaluate((html) => html.classList.contains("dark"))
      )
      .toBe(false)
  }

  expect(errors).toEqual([])
  await context.close()
})

test("editorial shell keeps full-screen heroes and canonical control geometry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1386, height: 870 })
  await page.goto("/uk", { waitUntil: "load" })
  await expect(page.getByTestId("editorial-hero")).toBeVisible()

  const shellMetrics = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(
      '[data-testid="editorial-hero"]'
    )
    const header = document.querySelector<HTMLElement>("header")
    const logo = header?.querySelector<HTMLElement>("a")
    const navigation = header?.querySelector<HTMLElement>(
      '[data-testid="desktop-navigation"]'
    )
    const utilities = header?.querySelector<HTMLElement>(
      '[data-testid="header-utilities"]'
    )
    const h1 = hero?.querySelector<HTMLElement>("h1")
    const rect = (element?: HTMLElement | null) =>
      element?.getBoundingClientRect() ?? null

    return {
      hero: rect(hero),
      heroMinHeight: hero ? getComputedStyle(hero).minHeight : "",
      header: rect(header),
      logo: rect(logo),
      navigation: rect(navigation),
      utilities: rect(utilities),
      h1OverflowWrap: h1 ? getComputedStyle(h1).overflowWrap : "",
      h1WordBreak: h1 ? getComputedStyle(h1).wordBreak : "",
    }
  })

  expect(shellMetrics.hero?.height).toBe(870)
  expect(shellMetrics.heroMinHeight).toBe("870px")
  expect(shellMetrics.header?.width).toBe(1386)
  expect(shellMetrics.logo?.right).toBeLessThan(
    shellMetrics.navigation?.left ?? 0
  )
  expect(shellMetrics.navigation?.right).toBeLessThan(
    shellMetrics.utilities?.left ?? 0
  )
  expect(shellMetrics.h1OverflowWrap).toBe("normal")
  expect(shellMetrics.h1WordBreak).toBe("normal")

  await page.goto("/uk/collections", { waitUntil: "load" })
  const collectionCard = page.locator('main [data-slot="card"]').first()
  await expect(collectionCard).toBeVisible()
  const cardCount = await page.locator('main [data-slot="card"]').count()
  expect(cardCount).toBeGreaterThan(0)
  const flushMetrics = await collectionCard.evaluate((card) => {
    const image = card.querySelector("img")
    const cardRect = card.getBoundingClientRect()
    const imageContainerRect = image?.parentElement?.getBoundingClientRect()

    return {
      top: imageContainerRect?.top ?? Number.NaN,
      left: imageContainerRect?.left ?? Number.NaN,
      right: imageContainerRect?.right ?? Number.NaN,
      cardTop: cardRect.top,
      cardLeft: cardRect.left,
      cardRight: cardRect.right,
    }
  })
  expect(flushMetrics.top).toBeCloseTo(flushMetrics.cardTop, 0)
  expect(flushMetrics.left).toBeCloseTo(flushMetrics.cardLeft, 0)
  expect(flushMetrics.right).toBeCloseTo(flushMetrics.cardRight, 0)

  await page.goto("/uk/booking", { waitUntil: "load" })
  const checkedLabel = page.locator(
    '[data-slot="field-label"]:has([data-slot="radio-group-item"][data-checked])'
  )
  await expect(checkedLabel.first()).toBeVisible()
  expect(await checkedLabel.count()).toBeGreaterThan(0)
  const selectedBackgrounds = await checkedLabel
    .all()
    .then((labels) =>
      Promise.all(
        labels.map((label) =>
          label.evaluate((element) => getComputedStyle(element).backgroundColor)
        )
      )
    )
  expect(
    selectedBackgrounds.every((value) => value === "rgba(0, 0, 0, 0)")
  ).toBe(true)
})

test("typography stays distinct and contained across the locale viewport matrix", async ({
  page,
}) => {
  const widths = [320, 375, 768, 1024, 1440, 1920]
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const locale of ["uk", "ru", "en"] as const) {
    for (const colorScheme of colorSchemes) {
      await page.emulateMedia({ colorScheme })

      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(`/${locale}`, { waitUntil: "load" })
        await page.locator("main h1").waitFor()

        const metrics = await page.evaluate(() => ({
          bodyFontFamily: window.getComputedStyle(document.body).fontFamily,
          headingFontFamily: window.getComputedStyle(
            document.querySelector("main h1") ?? document.body
          ).fontFamily,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          fontsReady:
            document.fonts.check('16px "Noto Sans"') &&
            document.fonts.check('32px "Noto Serif"'),
        }))

        expect(metrics.bodyFontFamily).toContain("Noto Sans")
        expect(metrics.headingFontFamily).toContain("Noto Serif")
        expect(metrics.bodyFontFamily).not.toBe(metrics.headingFontFamily)
        expect(metrics.fontsReady).toBe(true)
        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
      }
    }
  }

  expect(errors).toEqual([])
})

test("single-theme semantic tokens stay stable across locales and widths", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(180_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const routes = [
    "/",
    "/corporate",
    "/services/wardrobe-transformation",
    "/services/corporate-image",
  ]
  const errors: string[] = []
  const themeSnapshots = new Map<string, Set<string>>()

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const locale of ["uk", "ru", "en"] as const) {
    for (const colorScheme of colorSchemes) {
      await page.emulateMedia({ colorScheme })

      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 })
        for (const route of routes) {
          await page.goto(`/${locale}${route}`, {
            waitUntil: "load",
          })
          await page.locator("main h1").waitFor()
          await expect
            .poll(() =>
              page.evaluate(
                () => getComputedStyle(document.documentElement).colorScheme
              )
            )
            .toBe(colorScheme)

          const metrics = await page.evaluate(() => {
            const cta = document.querySelector<HTMLElement>(
              'main a[class*="group/button"], main button[data-slot="button"]'
            )
            const bodyStyle = window.getComputedStyle(document.body)
            const ctaStyle = cta ? window.getComputedStyle(cta) : null

            return {
              bodyBackground: bodyStyle.backgroundColor,
              bodyColor: bodyStyle.color,
              ctaBackground: ctaStyle?.backgroundColor ?? "",
              ctaColor: ctaStyle?.color ?? "",
              ring: getComputedStyle(document.documentElement)
                .getPropertyValue("--ring")
                .trim(),
              dark: document.documentElement.classList.contains("dark"),
              colorScheme: getComputedStyle(document.documentElement)
                .colorScheme,
              clientWidth: document.documentElement.clientWidth,
              scrollWidth: document.documentElement.scrollWidth,
            }
          })

          expect(metrics.dark).toBe(false)
          expect(metrics.colorScheme).toBe(colorScheme)
          expect(metrics.bodyBackground).not.toBe(metrics.bodyColor)
          expect(metrics.ctaBackground).not.toBe(metrics.ctaColor)
          expect(metrics.ring).not.toBe("")
          expect(metrics.scrollWidth).toBeLessThanOrEqual(
            metrics.clientWidth + 1
          )

          const key = `${locale}:${colorScheme}`
          const values = themeSnapshots.get(key) ?? new Set<string>()
          values.add(`${metrics.bodyBackground}|${metrics.bodyColor}`)
          themeSnapshots.set(key, values)
        }
      }
    }
  }

  for (const values of themeSnapshots.values()) {
    expect(values.size).toBe(1)
  }

  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/uk", { waitUntil: "load" })
  const reducedMotion = await page
    .locator("main a")
    .first()
    .evaluate((element) => {
      const style = window.getComputedStyle(element)
      return {
        transitionDuration: style.transitionDuration,
        animationDuration: style.animationDuration,
      }
    })
  expect(Number.parseFloat(reducedMotion.transitionDuration)).toBeLessThan(
    0.001
  )
  expect(Number.parseFloat(reducedMotion.animationDuration)).toBeLessThan(0.001)
  expect(errors).toEqual([])
})

test("public pages keep global landmarks and semantic theme tokens", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(180_000))

  const routes = [
    "/",
    "/studio",
    "/services/wardrobe-transformation",
    "/booking?service=atelier-service",
    "/payment/success?provider=stripe&order=purity-test",
  ]
  const widths = [320, 375, 768, 1024, 1440, 1920]

  for (const locale of ["uk", "ru", "en"] as const) {
    for (const colorScheme of colorSchemes) {
      await page.emulateMedia({ colorScheme })

      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })

        for (const route of routes) {
          await page.goto(`/${locale}${route}`, {
            waitUntil: "load",
          })

          const metrics = await page.evaluate(() => {
            const rootStyle = getComputedStyle(document.documentElement)
            const semanticTokens = [
              "--background",
              "--foreground",
              "--muted",
              "--muted-foreground",
              "--primary",
              "--primary-foreground",
            ]

            return {
              mainCount: document.querySelectorAll("main").length,
              headerCount: document.querySelectorAll("header").length,
              footerCount: document.querySelectorAll("footer").length,
              headerInsideMain: Boolean(document.querySelector("main header")),
              footerInsideMain: Boolean(document.querySelector("main footer")),
              semanticTokensPresent: semanticTokens.every((token) =>
                rootStyle.getPropertyValue(token).trim()
              ),
            }
          })

          expect(
            metrics.mainCount,
            `${locale} ${colorScheme} ${width} ${route}`
          ).toBe(1)
          expect(
            metrics.headerCount,
            `${locale} ${colorScheme} ${width} ${route}`
          ).toBe(1)
          expect(
            metrics.footerCount,
            `${locale} ${colorScheme} ${width} ${route}`
          ).toBe(1)
          expect(
            metrics.headerInsideMain,
            `${locale} ${colorScheme} ${width} ${route}`
          ).toBe(false)
          expect(
            metrics.footerInsideMain,
            `${locale} ${colorScheme} ${width} ${route}`
          ).toBe(false)
          expect(
            metrics.semanticTokensPresent,
            `${locale} ${colorScheme} ${width} ${route}`
          ).toBe(true)
        }
      }
    }
  }
})

test("critical routes expose metadata and no broken first-party links", async ({
  page,
}) => {
  for (const route of criticalRoutes) {
    const response = await page.goto(route)

    expect(response?.ok(), route).toBe(true)
    expect(await page.title()).not.toBe("")
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /.+/
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${route.split("?")[0]}$`)
    )

    const brokenLinks = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
        .map((link) => link.getAttribute("href") ?? "")
        .filter((href) => href.startsWith("/"))
        .filter((href) => !href.startsWith("/uk"))
        .filter((href) => !href.startsWith("/ru"))
        .filter((href) => !href.startsWith("/en"))
    )

    expect(brokenLinks).toEqual([])
  }
})

test("language switch keeps the booking path", async ({ page }) => {
  await page.goto("/uk/booking?service=atelier-service")

  await expect(
    page.locator('a[href="/ru/booking?service=atelier-service"]')
  ).not.toHaveCount(0)
  await expect(
    page.locator('a[href="/en/booking?service=atelier-service"]')
  ).not.toHaveCount(0)
})

test("header navigation keeps booking, locale, and mobile controls coherent", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(180_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  const closeLabels = { uk: "Закрити", ru: "Закрыть", en: "Close" } as const
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto("/uk", { waitUntil: "load" })

    for (const locale of locales) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(`/${locale}/booking?service=atelier-service`, {
          waitUntil: "load",
        })
        await expect
          .poll(() =>
            page
              .locator("html")
              .evaluate((html) => html.classList.contains("dark"))
          )
          .toBe(false)

        await expect(page.locator("header")).toBeVisible()
        await expect(
          page.locator('a[aria-current="page"]:visible').first()
        ).toHaveAttribute("href", `/${locale}/booking?service=atelier-service`)
        const pageWidth = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }))
        expect(pageWidth.scrollWidth).toBeLessThanOrEqual(
          pageWidth.clientWidth + 1
        )
        const clippedElements = await page.evaluate(() => {
          const visible = (element: HTMLElement) => {
            const style = window.getComputedStyle(element)
            const rect = element.getBoundingClientRect()

            return (
              rect.width > 1 &&
              rect.height > 1 &&
              style.display !== "none" &&
              style.visibility !== "hidden"
            )
          }

          return [
            ...document.querySelectorAll<HTMLElement>("header, main, footer"),
          ]
            .flatMap((section) => [
              section,
              ...section.querySelectorAll<HTMLElement>("*"),
            ])
            .filter(visible)
            .filter((element) => {
              const rect = element.getBoundingClientRect()

              return rect.left < -1 || rect.right > window.innerWidth + 1
            })
            .slice(0, 5)
            .map((element) => element.textContent?.trim() || element.outerHTML)
        })
        expect(clippedElements).toEqual([])

        const menuTrigger = page.getByTestId("mobile-menu-trigger")
        const desktopCta = page.getByTestId("header-booking-cta")

        if (width < 1280) {
          await expect(menuTrigger).toBeVisible()
          await expect(menuTrigger).toHaveAttribute("data-interactive", "true")
          await expect(desktopCta).toBeHidden()
          const triggerBox = await menuTrigger.boundingBox()
          expect(triggerBox?.width).toBeGreaterThanOrEqual(44)
          expect(triggerBox?.height).toBeGreaterThanOrEqual(44)

          await menuTrigger.focus()
          await page.keyboard.press("Enter")
          const sheet = page.locator('[data-slot="sheet-content"]')
          await expect(sheet).toBeVisible()
          await expect(
            page.getByRole("button", { name: closeLabels[locale] })
          ).toBeVisible()
          await expect(
            page.getByTestId("mobile-navigation").locator("a")
          ).toHaveCount(8)
          await expect(page.getByTestId("mobile-booking-cta")).toHaveAttribute(
            "href",
            `/${locale}/booking`
          )
          const mobileCtaBox = await page
            .getByTestId("mobile-booking-cta")
            .boundingBox()
          expect(mobileCtaBox?.width).toBeGreaterThanOrEqual(44)
          expect(mobileCtaBox?.height).toBeGreaterThanOrEqual(44)

          await page.keyboard.press("Escape")
          await expect(sheet).toBeHidden()

          await menuTrigger.click()
          await expect(sheet).toBeVisible()
          await expect(menuTrigger).toHaveAttribute("aria-expanded", "true")
          await page.getByRole("button", { name: closeLabels[locale] }).click()
          await expect(sheet).toBeHidden()
        } else {
          await expect(menuTrigger).toBeHidden()
          await expect(desktopCta).toBeVisible()
          await expect(desktopCta).toHaveAttribute("href", `/${locale}/booking`)
          const ctaBox = await desktopCta.boundingBox()
          expect(ctaBox?.width).toBeGreaterThanOrEqual(44)
          expect(ctaBox?.height).toBeGreaterThanOrEqual(44)
        }
      }
    }
  }

  expect(errors).toEqual([])
})

test("footer actions keep source-backed contact facts and external affordances", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(180_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  const addressLabels = {
    uk: "Предславинська",
    ru: "Предславинская",
    en: "Predslavynska",
  } as const
  const externalLabels = {
    uk: "Відкривається в новій вкладці",
    ru: "Открывается в новой вкладке",
    en: "Opens in a new tab",
  } as const
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto("/uk/contacts", { waitUntil: "load" })

    for (const locale of locales) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(`/${locale}/contacts`, {
          waitUntil: "load",
        })
        await expect
          .poll(() =>
            page
              .locator("html")
              .evaluate((html) => html.classList.contains("dark"))
          )
          .toBe(false)

        const footer = page.locator("footer")
        await expect(footer).toContainText(addressLabels[locale])
        await expect(footer).toContainText("+38 067 656 19 12")
        await expect(footer).toContainText("voronina@purity-fashion.com")

        const footerBooking = page.getByTestId("footer-booking-cta")
        await expect(footerBooking).toHaveAttribute(
          "href",
          `/${locale}/booking`
        )
        await expect(footerBooking).toHaveClass(/bg-secondary/)

        const footerSocials = footer.getByTestId("footer-social-link")
        await expect(footerSocials).toHaveCount(4)
        for (let index = 0; index < 4; index += 1) {
          const social = footerSocials.nth(index)
          await expect(social).toHaveAttribute("target", "_blank")
          await expect(social).toHaveAttribute("rel", /noreferrer/)
          await expect(social).toHaveClass(/border-border/)
          await expect(social.locator("svg")).toHaveCount(1)
          await expect(social.locator(".sr-only")).toContainText(
            externalLabels[locale]
          )
        }

        const contactSocials = page.getByTestId("contact-social-link")
        await expect(contactSocials).toHaveCount(4)
        await expect(contactSocials.first().locator("svg")).toHaveCount(1)
        await expect(contactSocials.first().locator(".sr-only")).toContainText(
          externalLabels[locale]
        )
        const pageWidth = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }))
        expect(pageWidth.scrollWidth).toBeLessThanOrEqual(
          pageWidth.clientWidth + 1
        )
      }
    }
  }

  expect(errors).toEqual([])
})

test("home hierarchy keeps editorial rhythm and a visible conversion path", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(180_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto("/uk", { waitUntil: "load" })

    for (const locale of locales) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(`/${locale}`, { waitUntil: "load" })
        await expect(page.getByTestId("editorial-hero")).toBeVisible()
        await expect(page.locator("main h1")).toBeVisible()
        await expect(page.locator("main [data-slot=accordion]")).toHaveCount(1)
        await expect(
          page.locator(`main a[href="/${locale}/booking"]`)
        ).not.toHaveCount(0)
        await expect(
          page.locator(`main a[href="/${locale}/stylist"]`)
        ).not.toHaveCount(0)
        expect(await page.locator("main h2").count()).toBeGreaterThanOrEqual(6)
        await expect(
          page.locator('[data-editorial-sequence="home-method"] article')
        ).toHaveCount(3)
        expect(
          await page.locator("main [data-slot=card]").count()
        ).toBeLessThanOrEqual(4)

        const metrics = await page.evaluate(() => {
          const visible = (element: HTMLElement) => {
            const style = window.getComputedStyle(element)
            const rect = element.getBoundingClientRect()

            return (
              rect.width > 1 &&
              rect.height > 1 &&
              style.display !== "none" &&
              style.visibility !== "hidden"
            )
          }
          const clipped = [
            ...document.querySelectorAll<HTMLElement>("main, main *"),
          ]
            .filter(visible)
            .filter((element) => {
              const rect = element.getBoundingClientRect()

              return rect.left < -1 || rect.right > innerWidth + 1
            })
            .slice(0, 5)
            .map((element) => element.textContent?.trim() || element.outerHTML)
          const firstViewportText = [
            ...document.querySelectorAll<HTMLElement>(
              "main h1, main h2, main p, main a, main button"
            ),
          ]
            .filter((element) => {
              if (!visible(element)) return false
              const rect = element.getBoundingClientRect()
              return rect.bottom > 0 && rect.top < innerHeight
            })
            .map((element) => element.innerText.trim())
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()

          return {
            clipped,
            firstViewportTextLength: firstViewportText.length,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            heroImages: document.querySelectorAll(
              '[data-testid="editorial-hero"] img'
            ).length,
          }
        })

        expect(metrics.clipped).toEqual([])
        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
        expect(metrics.firstViewportTextLength).toBeGreaterThan(75)
        expect(metrics.heroImages).toBeGreaterThan(0)
      }
    }
  }

  expect(errors).toEqual([])
})

test("studio and legal pages keep route-specific hierarchy and scanning", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(180_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  const legalContents = {
    uk: "Зміст",
    ru: "Содержание",
    en: "Contents",
  } as const
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto("/uk/studio", { waitUntil: "load" })

    for (const locale of locales) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })

        for (const route of ["studio", "privacy", "terms"] as const) {
          await page.goto(`/${locale}/${route}`, {
            waitUntil: "load",
          })
          await expect(page.locator("main h1")).toHaveCount(1)
          await expect(page.locator("footer")).toBeVisible()

          if (route === "studio") {
            expect(
              await page.locator("main h2").count()
            ).toBeGreaterThanOrEqual(3)
            expect(
              await page.locator("main [data-slot=card]").count()
            ).toBeGreaterThan(8)
            await expect(
              page.locator(`main a[href="/${locale}/booking"]`)
            ).not.toHaveCount(0)
          } else {
            await expect(
              page.getByRole("heading", { name: legalContents[locale] })
            ).toBeVisible()
            await expect(page.locator('[id^="legal-section-"]')).toHaveCount(2)
            await expect(
              page.locator('a[href^="#legal-section-"]')
            ).toHaveCount(2)
            await expect(page.locator(".scroll-mt-24")).toHaveCount(2)
          }

          const metrics = await page.evaluate(() => {
            const visible = (element: HTMLElement) => {
              const style = window.getComputedStyle(element)
              const rect = element.getBoundingClientRect()

              return (
                rect.width > 1 &&
                rect.height > 1 &&
                style.display !== "none" &&
                style.visibility !== "hidden"
              )
            }
            const clipped = [
              ...document.querySelectorAll<HTMLElement>("main, main *"),
            ]
              .filter(visible)
              .filter((element) => {
                const rect = element.getBoundingClientRect()

                return rect.left < -1 || rect.right > innerWidth + 1
              })
              .slice(0, 5)
              .map(
                (element) => element.textContent?.trim() || element.outerHTML
              )

            return {
              clipped,
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth,
              textLength:
                document.querySelector("main")?.textContent?.length ?? 0,
            }
          })

          expect(metrics.clipped).toEqual([])
          expect(metrics.scrollWidth).toBeLessThanOrEqual(
            metrics.clientWidth + 1
          )
          expect(metrics.textLength).toBeGreaterThan(300)
        }
      }
    }
  }

  expect(errors).toEqual([])
})

test("category landings keep one content-specific layout contract", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(240_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  const routes = [
    "stylist",
    "shopping",
    "atelier",
    "wardrobe",
    "corporate",
    "school",
    "collections",
  ] as const
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto("/uk/stylist", { waitUntil: "load" })

    for (const locale of locales) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })

        for (const route of routes) {
          await page.goto(`/${locale}/${route}`, {
            waitUntil: "load",
          })
          await expect(page.locator("main h1")).toHaveCount(1)
          await expect(page.locator("footer")).toBeVisible()
          await expect(
            page.locator('main a[href*="/booking"]')
          ).not.toHaveCount(0)
          expect(await page.locator("main h2").count()).toBeGreaterThanOrEqual(
            2
          )
          expect(
            await page.locator("main [data-slot=card]").count()
          ).toBeGreaterThan(2)

          const metrics = await page.evaluate(() => {
            const visible = (element: HTMLElement) => {
              const style = window.getComputedStyle(element)
              const rect = element.getBoundingClientRect()

              return (
                rect.width > 1 &&
                rect.height > 1 &&
                style.display !== "none" &&
                style.visibility !== "hidden"
              )
            }
            const clipped = [
              ...document.querySelectorAll<HTMLElement>("main, main *"),
            ]
              .filter(visible)
              .filter((element) => {
                const rect = element.getBoundingClientRect()

                return rect.left < -1 || rect.right > innerWidth + 1
              })
              .slice(0, 5)
              .map(
                (element) => element.textContent?.trim() || element.outerHTML
              )

            return {
              clipped,
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth,
              textLength:
                document.querySelector("main")?.textContent?.length ?? 0,
            }
          })

          expect(metrics.clipped).toEqual([])
          expect(metrics.scrollWidth).toBeLessThanOrEqual(
            metrics.clientWidth + 1
          )
          expect(metrics.textLength).toBeGreaterThan(400)
        }
      }
    }
  }

  expect(errors).toEqual([])
})

test("detail routes keep canonical hero, status, process, and booking anatomy", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(300_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  const detailPaths = getManifestRoutes("uk")
    .filter((route) => ["service", "course", "collection"].includes(route.kind))
    .map((route) => route.path)
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto("/uk/services/atelier-service", {
      waitUntil: "load",
    })

    for (const locale of locales) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })

        for (const path of detailPaths) {
          await page.goto(`/${locale}${path}`, {
            waitUntil: "load",
          })
          await expect(page.locator("main h1")).toHaveCount(1)
          await expect(page.locator("footer")).toBeVisible()
          await expect(
            page.locator('main a[href*="/booking"]')
          ).not.toHaveCount(0)
          expect(
            await page.locator("main [data-slot=card]").count()
          ).toBeGreaterThan(0)

          if (path.startsWith("/courses/")) {
            await expect(
              page.locator('main [data-slot="accordion"]')
            ).toHaveCount(1)
          }
          if (path.startsWith("/collections/")) {
            expect(
              await page.locator("main figure img").count()
            ).toBeGreaterThan(0)
          }

          const metrics = await page.evaluate(() => {
            const visible = (element: HTMLElement) => {
              const style = window.getComputedStyle(element)
              const rect = element.getBoundingClientRect()

              return (
                rect.width > 1 &&
                rect.height > 1 &&
                style.display !== "none" &&
                style.visibility !== "hidden"
              )
            }
            const clipped = [
              ...document.querySelectorAll<HTMLElement>("main, main *"),
            ]
              .filter(visible)
              .filter((element) => {
                const rect = element.getBoundingClientRect()

                return rect.left < -1 || rect.right > innerWidth + 1
              })
              .slice(0, 5)
              .map(
                (element) => element.textContent?.trim() || element.outerHTML
              )

            return {
              clipped,
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth,
              textLength:
                document.querySelector("main")?.textContent?.length ?? 0,
            }
          })

          expect(metrics.clipped).toEqual([])
          expect(metrics.scrollWidth).toBeLessThanOrEqual(
            metrics.clientWidth + 1
          )
          expect(metrics.textLength).toBeGreaterThan(400)
        }
      }
    }
  }

  expect(errors).toEqual([])
})

test("school, collections, and portfolio indices expose honest catalog states", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(180_000))

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto("/uk/portfolio", { waitUntil: "load" })

    for (const locale of locales) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })

        for (const route of ["school", "collections", "portfolio"] as const) {
          await page.goto(`/${locale}/${route}`, {
            waitUntil: "load",
          })
          await expect(page.locator("main h1")).toHaveCount(1)
          await expect(
            page.locator('main a[href*="/booking"]')
          ).not.toHaveCount(0)
          expect(
            await page.locator("main [data-slot=card]").count()
          ).toBeGreaterThan(2)

          if (route === "portfolio") {
            await expect(
              page.getByTestId("portfolio-empty-state")
            ).toBeVisible()
            await expect(
              page.locator('main a[href*="/portfolio/"]')
            ).toHaveCount(0)
            await expect(
              page.getByTestId("portfolio-editorial-label")
            ).toContainText(
              locale === "uk"
                ? "не клієнтський кейс"
                : locale === "ru"
                  ? "не клиентский кейс"
                  : "not a client case"
            )
          }

          const metrics = await page.evaluate(() => {
            const visible = (element: HTMLElement) => {
              const style = window.getComputedStyle(element)
              const rect = element.getBoundingClientRect()

              return (
                rect.width > 1 &&
                rect.height > 1 &&
                style.display !== "none" &&
                style.visibility !== "hidden"
              )
            }
            const clipped = [
              ...document.querySelectorAll<HTMLElement>("main, main *"),
            ]
              .filter(visible)
              .filter((element) => {
                const rect = element.getBoundingClientRect()

                return rect.left < -1 || rect.right > innerWidth + 1
              })
              .slice(0, 5)
              .map(
                (element) => element.textContent?.trim() || element.outerHTML
              )

            return {
              clipped,
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth,
            }
          })

          expect(metrics.clipped).toEqual([])
          expect(metrics.scrollWidth).toBeLessThanOrEqual(
            metrics.clientWidth + 1
          )
        }
      }
    }
  }

  expect(errors).toEqual([])
})

test("page-ticket routes stay responsive across required widths", async ({
  page,
}) => {
  test.setTimeout(localStageTimeout(240_000))

  const viewports = [
    { name: "narrow", width: 320, height: 720 },
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet-small", width: 768, height: 900 },
    { name: "tablet-review", width: 934, height: 979 },
    { name: "desktop-small", width: 1024, height: 900 },
    { name: "desktop", width: 1440, height: 1000 },
  ] as const

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)

    for (const route of pageTicketRoutes) {
      const isUtilityRoute = utilityRoutes.has(route)
      const isPaymentRoute = route.includes("/payment/")
      const isEditorialHome = route === "/uk"
      const response = await page.goto(route, { waitUntil: "load" })

      expect(response?.ok(), `${viewport.name} ${route}`).toBe(true)
      await expect(page.locator("header img").first()).toBeVisible()
      await expect(page.locator("main h1").first()).toBeVisible()
      if (!isUtilityRoute) {
        const heroImage = page.getByTestId("editorial-hero").locator("img")
        await expect(heroImage).toBeVisible()
        await heroImage.scrollIntoViewIfNeeded()
        await expect
          .poll(
            () =>
              heroImage.evaluate((element) => {
                const image = element as HTMLImageElement

                return image.complete && image.naturalWidth > 0
              }),
            { timeout: 15_000 }
          )
          .toBe(true)
      }
      await expect(page.locator("footer")).toContainText("Предславинська 44")
      await expect(page.locator("footer")).toContainText("+38 067 656 19 12")
      await expect(page.locator("footer")).toContainText(
        "voronina@purity-fashion.com"
      )

      const metrics = await page.evaluate(() => {
        const visible = (element: Element) => {
          const rect = element.getBoundingClientRect()
          const style = window.getComputedStyle(element)

          return (
            rect.width > 1 &&
            rect.height > 1 &&
            style.visibility !== "hidden" &&
            style.display !== "none"
          )
        }
        const textLength = (element: Element | null | undefined) =>
          element?.textContent?.replace(/\s+/g, " ").trim().length ?? 0
        const isTransparentBorder = (color: string) =>
          color === "transparent" || /^rgba\(.+,\s*0\)$/.test(color)
        const header = document.querySelector("header")
        const hero = document.querySelector<HTMLElement>(
          '[data-testid="editorial-hero"]'
        )
        const headerLogo = header?.querySelector<HTMLImageElement>("img")
        const headerLogoBox = headerLogo?.getBoundingClientRect()
        const headerControls = header?.querySelector<HTMLElement>(
          '[data-testid="header-utilities"]'
        )
        const headerControlsBox = headerControls?.getBoundingClientRect()
        const editorialButtons = [
          ...document.querySelectorAll<HTMLElement>(
            "main a, main button, footer a, footer button"
          ),
        ].filter((element) => {
          const className = element.getAttribute("class") ?? ""

          return (
            visible(element) &&
            className.includes("group/button") &&
            (className.includes("border-border") ||
              className.includes("border-primary-foreground"))
          )
        })
        const editorialButtonBorderIssues = editorialButtons
          .filter((element) => {
            const style = window.getComputedStyle(element)

            return (
              Number.parseFloat(style.borderTopWidth) < 1 ||
              isTransparentBorder(style.borderTopColor)
            )
          })
          .map((element) => element.textContent?.trim() || element.outerHTML)
        const clippedElements = [
          ...document.querySelectorAll<HTMLElement>("main *"),
        ]
          .filter(visible)
          .filter((element) => {
            const rect = element.getBoundingClientRect()

            return rect.left < -1 || rect.right > innerWidth + 1
          })
          .slice(0, 10)
          .map((element) => element.textContent?.trim() || element.outerHTML)
        const primaryTargets = [
          ...document.querySelectorAll<HTMLElement>(
            'header a, header button, footer a, footer button, main a[class*="group/button"], main button[data-slot="button"]'
          ),
        ].filter(visible)
        const smallPrimaryTargets = primaryTargets
          .filter((element) => {
            const rect = element.getBoundingClientRect()

            return rect.width < 44 || rect.height < 44
          })
          .slice(0, 10)
          .map((element) => {
            const rect = element.getBoundingClientRect()

            return `${element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName} ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`
          })
        const figureGaps = [
          ...document.querySelectorAll<HTMLElement>("main figure"),
        ]
          .filter(visible)
          .map((figure) => {
            const image = figure.querySelector<HTMLImageElement>("img")

            if (!image || !visible(image)) {
              return null
            }

            const figureRect = figure.getBoundingClientRect()
            const imageRect = image.getBoundingClientRect()

            return {
              alt: image.alt,
              widthGap: Math.abs(figureRect.width - imageRect.width),
              heightGap: Math.abs(figureRect.height - imageRect.height),
            }
          })
          .filter((gap): gap is NonNullable<typeof gap> =>
            Boolean(gap && (gap.widthGap > 2 || gap.heightGap > 2))
          )
        const cardGridIssues: string[] = []

        for (const [gridIndex, grid] of [
          ...document.querySelectorAll<HTMLElement>("main .grid"),
        ].entries()) {
          const columns = window
            .getComputedStyle(grid)
            .gridTemplateColumns.split(" ")
            .filter((track) => track && track !== "none")

          if (columns.length < 2) {
            continue
          }

          const cards = [
            ...grid.querySelectorAll<HTMLElement>("[data-slot='card']"),
          ].filter(visible)

          if (cards.length < 2) {
            continue
          }

          const rows: HTMLElement[][] = []

          for (const card of cards) {
            const cardTop = card.getBoundingClientRect().top
            let row = rows.find(
              (candidate) =>
                Math.abs(candidate[0].getBoundingClientRect().top - cardTop) <=
                2
            )

            if (!row) {
              row = []
              rows.push(row)
            }

            row.push(card)
          }

          for (const row of rows.filter((candidate) => candidate.length > 1)) {
            const heights = row.map(
              (card) => card.getBoundingClientRect().height
            )
            const heightDelta = Math.max(...heights) - Math.min(...heights)

            if (heightDelta > 3) {
              cardGridIssues.push(
                `grid ${gridIndex} row delta ${heightDelta.toFixed(1)}`
              )
            }
          }
        }

        return {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          mainTextLength: textLength(document.querySelector("main")),
          bodyFontFamily: window.getComputedStyle(document.body).fontFamily,
          headingFontFamily: window.getComputedStyle(
            document.querySelector("main h1") ?? document.body
          ).fontFamily,
          headerLogoSrc: headerLogo?.getAttribute("src") ?? "",
          headerLogoTransform: headerLogo
            ? window.getComputedStyle(headerLogo).transform
            : "",
          headerLogoCenterY: headerLogoBox
            ? headerLogoBox.top + headerLogoBox.height / 2
            : null,
          headerControlsCenterY: headerControlsBox
            ? headerControlsBox.top + headerControlsBox.height / 2
            : null,
          contentCards: document.querySelectorAll("main [data-slot='card']")
            .length,
          cardGridIssues,
          clippedElements,
          smallPrimaryTargets,
          figureGaps,
          visibleH1: [...document.querySelectorAll("main h1")].filter(visible)
            .length,
          editorialButtonCount: editorialButtons.length,
          editorialButtonBorderIssues,
          footerLinks: document.querySelectorAll("footer a[href]").length,
          footerTextLength: textLength(document.querySelector("footer")),
          footerPhones: document.querySelectorAll("footer a[href^='tel:']")
            .length,
          footerEmail: document.querySelectorAll("footer a[href^='mailto:']")
            .length,
          footerViber: document.querySelectorAll("footer a[href^='viber:']")
            .length,
          footerSocials: document.querySelectorAll("footer a[target='_blank']")
            .length,
          heroMinHeight: hero ? getComputedStyle(hero).minHeight : "",
          loadedHeroImages: [
            ...document.querySelectorAll<HTMLImageElement>(
              '[data-testid="editorial-hero"] img'
            ),
          ].filter((image) => visible(image) && image.naturalWidth > 0).length,
        }
      })
      const screenshot = await page.screenshot()

      expect(
        metrics.scrollWidth,
        `${viewport.name} ${route}`
      ).toBeLessThanOrEqual(metrics.clientWidth + 1)
      expect(metrics.bodyFontFamily, `${viewport.name} ${route}`).toMatch(
        /Noto Sans/
      )
      expect(metrics.headingFontFamily, `${viewport.name} ${route}`).toMatch(
        /Noto Serif/
      )
      expect(metrics.headerLogoSrc, `${viewport.name} ${route}`).toContain(
        "wordmark-black.png"
      )
      expect(metrics.headerLogoTransform, `${viewport.name} ${route}`).toBe(
        "none"
      )
      if (viewport.width >= 1280) {
        expect(
          Math.abs(
            (metrics.headerLogoCenterY ?? 0) -
              (metrics.headerControlsCenterY ?? 0)
          ),
          `${viewport.name} ${route}`
        ).toBeLessThanOrEqual(6)
      }
      expect(
        metrics.loadedHeroImages,
        `${viewport.name} ${route}`
      ).toBeGreaterThanOrEqual(isUtilityRoute ? 0 : 1)
      if (!isUtilityRoute) {
        expect(
          Number.parseFloat(metrics.heroMinHeight),
          `${viewport.name} ${route}`
        ).toBe(viewport.height)
      }
      expect(
        metrics.mainTextLength,
        `${viewport.name} ${route}`
      ).toBeGreaterThan(isPaymentRoute ? 120 : isUtilityRoute ? 450 : 600)
      if (!isPaymentRoute && !isEditorialHome && !isUtilityRoute) {
        expect(
          metrics.contentCards,
          `${viewport.name} ${route}`
        ).toBeGreaterThan(0)
      }
      if (isEditorialHome) {
        await expect(
          page.locator('[data-editorial-sequence="home-method"] article')
        ).toHaveCount(3)
      }
      expect(metrics.cardGridIssues, `${viewport.name} ${route}`).toEqual([])
      expect(metrics.clippedElements, `${viewport.name} ${route}`).toEqual([])
      expect(metrics.figureGaps, `${viewport.name} ${route}`).toEqual([])
      expect(metrics.visibleH1, `${viewport.name} ${route}`).toBe(1)
      expect(metrics.smallPrimaryTargets, `${viewport.name} ${route}`).toEqual(
        []
      )
      expect(
        metrics.editorialButtonCount,
        `${viewport.name} ${route}`
      ).toBeGreaterThan(0)
      expect(
        metrics.editorialButtonBorderIssues,
        `${viewport.name} ${route}`
      ).toEqual([])
      expect(metrics.footerLinks, `${viewport.name} ${route}`).toBeGreaterThan(
        12
      )
      expect(
        metrics.footerTextLength,
        `${viewport.name} ${route}`
      ).toBeGreaterThan(300)
      expect(metrics.footerPhones, `${viewport.name} ${route}`).toBe(2)
      expect(metrics.footerEmail, `${viewport.name} ${route}`).toBe(1)
      expect(metrics.footerViber, `${viewport.name} ${route}`).toBe(1)
      expect(metrics.footerSocials, `${viewport.name} ${route}`).toBe(4)
      expect(screenshot.length, `${viewport.name} ${route}`).toBeGreaterThan(
        15_000
      )
    }
  }
})
