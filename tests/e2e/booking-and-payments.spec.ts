import { expect, test } from "@playwright/test"
import { assertIsolatedTestDatabase } from "../../scripts/test-database"

const colorSchemes = ["light"] as const

test("booking form validates and records inquiry-only requests", async ({
  page,
  baseURL,
}) => {
  assertIsolatedTestDatabase(process.env, baseURL ?? "http://localhost:3000")
  await page.goto("/uk/services/atelier-service")
  const bookingHref = "/uk/booking?service=atelier-service"
  const serviceBookingCta = page.locator(`main a[href="${bookingHref}"]`)
  await expect(serviceBookingCta).toHaveCount(1)
  await serviceBookingCta.click()
  await expect(page).toHaveURL(/\/uk\/booking\?service=atelier-service$/)
  await expect(page.getByTestId("booking-service-trigger")).toContainText(
    "Ательє-сервіс"
  )
  await expect(page.getByText("Заповніть поле.")).toHaveCount(0)

  await page.getByTestId("booking-submit").click()
  await expect(page.getByText("Перевірте поля")).toBeVisible()
  await expect(page.getByText("Вкажіть коректний email.")).toBeVisible()

  await page.getByTestId("booking-currency-trigger").click()
  await page.getByText("UAH — оплата в Україні", { exact: true }).click()
  await page.locator("#booking-name").fill("PURITY Test")
  await page.locator("#booking-email").fill("purity-test@example.com")
  await page
    .locator("#booking-message")
    .fill("Тестовий запит для перевірки booking payment flow.")
  await page.locator('[data-slot="checkbox"]').click()
  await page.getByTestId("booking-submit").click()

  await expect(page.getByText("Заявку прийнято")).toBeVisible()
  await expect(
    page.locator('a[href*="/uk/payment/success?provider=liqpay"]')
  ).toHaveCount(0)
  await expect(page.getByText("Заповніть поле.")).toHaveCount(0)
})

test("booking form exposes keyboard, invalid, review, and submitting contracts", async ({
  page,
}) => {
  test.setTimeout(180_000)

  const widths = [320, 375, 768, 1024, 1440, 1920]
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  for (const scheme of colorSchemes) {
    await page.emulateMedia({ colorScheme: scheme })

    for (const locale of ["uk", "ru", "en"] as const) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(`/${locale}/booking?service=atelier-service`, {
          waitUntil: "load",
        })
        await page.waitForLoadState("networkidle")

        const form = page.getByTestId("booking-form")
        await expect(form).toHaveAttribute("data-state", "idle")
        await expect(form).toHaveAttribute("aria-busy", "false")
        await expect(page.getByTestId("booking-review")).toBeVisible()

        const name = page.locator("#booking-name")
        const email = page.locator("#booking-email")
        await name.focus()
        await expect(name).toBeFocused()
        await page.keyboard.press("Tab")
        await expect(email).toBeFocused()

        await page.getByTestId("booking-submit").click()
        await expect(
          page.getByText(/Перевірте поля|Проверьте поля|Check the fields/)
        ).toBeVisible()
        await expect(form.locator('[aria-invalid="true"]')).not.toHaveCount(0)
        const invalidCount = await form.locator('[aria-invalid="true"]').count()
        await expect(
          form.locator('[aria-invalid="true"][aria-describedby]')
        ).toHaveCount(invalidCount)
        await expect(form.locator('[id$="-error"]')).toHaveCount(invalidCount)
        await expect(form).toHaveAttribute("data-state", "idle")
        await expect(page.getByTestId("booking-submit")).toBeEnabled()
      }
    }
  }

  expect(errors).toEqual([])
})

test("service CTAs preselect the requested booking direction", async ({
  page,
}) => {
  const serviceDirections = [
    ["personal-lookbook", "Персональний лукбук"],
    ["realisation-support", "Супровід реалізації"],
    ["atelier-service", "Ательє-сервіс"],
    ["wardrobe-transformation", "Трансформація гардероба"],
    ["corporate-image", "Корпоративний імідж"],
    ["wardrobe-management", "Управління гардеробом"],
    ["capsule-collection", "Капсульна колекція"],
  ] as const

  for (const [serviceRoute, serviceTitle] of serviceDirections) {
    const bookingHref = `/uk/booking?service=${serviceRoute}`

    await page.goto(`/uk/services/${serviceRoute}`)
    await expect(page.locator(`a[href="${bookingHref}"]`)).toHaveCount(1)

    await page.locator(`a[href="${bookingHref}"]`).click()
    await expect(page).toHaveURL(
      new RegExp(`/uk/booking\\?service=${serviceRoute}$`)
    )
    await expect(page.getByTestId("booking-service-trigger")).toContainText(
      serviceTitle
    )
  }
})

test("course page retains its unconfirmed commercial status", async ({
  page,
}) => {
  await page.goto("/uk/courses/wardrobe-management-course")

  await expect(
    page.getByText("Фіксована пропозиція", { exact: true })
  ).toBeVisible()
  await expect(page.getByText("Незабаром", { exact: true })).toBeVisible()
  await expect(
    page.getByText(/Курс управління гардеробом: за запитом/)
  ).toBeVisible()
  await expect(
    page.getByText(
      /пряма оплата зʼявиться лише для погодженої фіксованої пропозиції/
    )
  ).toBeVisible()
  await expect(
    page.locator(
      'a[href="/uk/booking?service=wardrobe-management&course=wardrobe-management-course"]'
    )
  ).toHaveCount(2)
})

test("collection details keep distinct stories, facts, and hero media", async ({
  page,
}) => {
  const collectionStories = [
    ["purity-capsule", "Як працює капсула", "Факти капсули"],
    [
      "new-year-party-collection",
      "Вечірній сценарій",
      "Факти вечірньої добірки",
    ],
    ["beaded-dress-signal", "Дизайн і посадка", "Факти сукні-сигналу"],
  ] as const
  const heroSources = new Set<string>()

  for (const [slug, storyTitle, factsTitle] of collectionStories) {
    await page.goto(`/uk/collections/${slug}`)
    await expect(
      page.getByRole("heading", { name: storyTitle }).first()
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: factsTitle }).first()
    ).toBeVisible()
    heroSources.add(
      (await page
        .getByTestId("editorial-hero")
        .locator("img")
        .getAttribute("src")) ?? ""
    )
  }

  expect(heroSources.size).toBe(collectionStories.length)
})

test("contacts keep direct channels separate and email intact", async ({
  page,
}) => {
  await page.goto("/uk/contacts")

  await expect(
    page.getByRole("heading", { name: "Зв’язатися напряму" })
  ).toBeVisible()
  const emailLink = page.locator(
    'section[aria-label="Соціальні канали"] a[href="mailto:voronina@purity-fashion.com"]'
  )
  await expect(emailLink).toHaveAttribute(
    "aria-label",
    "Email: voronina@purity-fashion.com"
  )
  const emailMetrics = await emailLink.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)

    return {
      width: rect.width,
      height: rect.height,
      overflowWrap: style.overflowWrap,
      wordBreak: style.wordBreak,
    }
  })

  expect(emailMetrics.width).toBeGreaterThanOrEqual(44)
  expect(emailMetrics.height).toBeGreaterThanOrEqual(44)
  expect(emailMetrics.overflowWrap).not.toBe("anywhere")
  expect(emailMetrics.wordBreak).not.toBe("break-all")
})

test("booking review keeps the service query preselected across locales", async ({
  page,
}) => {
  const localizedServiceTitles = {
    uk: "Ательє-сервіс",
    ru: "Ателье-сервис",
    en: "Atelier Service",
  } as const

  for (const [locale, serviceTitle] of Object.entries(localizedServiceTitles)) {
    await page.goto(`/${locale}/booking?service=atelier-service`)
    await expect(page.getByTestId("booking-contact-fields")).toBeVisible()
    await expect(page.getByTestId("booking-payment-fields")).toBeVisible()
    await expect(page.getByTestId("booking-routing-note")).toBeVisible()
    await expect(page.getByTestId("booking-review")).toContainText(serviceTitle)
    await expect(page.getByTestId("booking-service-trigger")).toContainText(
      serviceTitle
    )
  }
})

test("payment and legal utility pages expose trustworthy utility surfaces", async ({
  page,
}) => {
  const utilityRoutes = [
    "/uk/payment/success?provider=stripe&order=purity-test",
    "/uk/payment/failure?provider=liqpay&order=purity-test",
    "/uk/payment/cancel?provider=stripe&order=purity-test",
    "/uk/privacy",
    "/uk/terms",
  ]

  for (const route of utilityRoutes) {
    const response = await page.goto(route)
    expect(response?.ok(), route).toBe(true)
    await expect(page.locator("main h1")).toHaveCount(1)
    await expect(page.locator("main a").first()).toBeVisible()
    const bodyText = await page.locator("main").innerText()

    expect(bodyText).not.toMatch(/\b(test|mock|adapter)\b/i)
    if (route.includes("privacy") || route.includes("terms")) {
      await expect(page.getByRole("heading", { name: "Зміст" })).toBeVisible()
      await expect(
        page.getByText("Чинна редакція: 10 липня 2026")
      ).toBeVisible()
    }
  }
})

test("payment status pages keep unverified redirects pending across locales and widths", async ({
  page,
}) => {
  const widths = [320, 375, 768, 1024, 1440, 1920]
  const locales = ["uk", "ru", "en"] as const
  // A return URL alone cannot establish an order's payment state.
  const routes = [
    ["success", "?provider=stripe&order=purity-order", "pending"],
    ["success", "", "pending"],
    ["failure", "?provider=liqpay&order=purity-order", "pending"],
    ["failure", "?provider=unknown", "pending"],
    ["cancel", "?provider=stripe&order=purity-order", "pending"],
    ["cancel", "", "pending"],
  ] as const
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

  const assertPaymentPage = async ({
    url,
    expectedStatus,
  }: {
    url: string
    expectedStatus: (typeof routes)[number][2]
  }) => {
    await page.goto(url, { waitUntil: "load" })
    await page.waitForLoadState("networkidle")
    await expect(page.locator("main h1")).toHaveCount(1)
    await expect(page.getByTestId("payment-status-alert")).toHaveAttribute(
      "data-status",
      expectedStatus
    )
    await expect(
      page.locator('main > section a[href*="/booking"]')
    ).toHaveCount(1)

    const action = page.locator('main > section a[href*="/booking"]')
    await action.focus()
    await expect(action).toBeFocused()

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

      return {
        clipped,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }
    })

    expect(metrics.clipped).toEqual([])
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  }

  await page.setViewportSize({ width: 768, height: 844 })
  for (const locale of locales) {
    for (const [status, query, expectedStatus] of routes) {
      await assertPaymentPage({
        url: `/${locale}/payment/${status}${query}`,
        expectedStatus,
      })
    }
  }

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 })
    await assertPaymentPage({
      url: "/uk/payment/success?provider=stripe&order=purity-order",
      expectedStatus: "pending",
    })
  }

  expect(errors).toEqual([])
})
