import { expect, test } from "@playwright/test"
import { assertIsolatedTestDatabase } from "../../scripts/test-database"

test("contact form validates and records inquiry-only requests", async ({
  page,
  baseURL,
}) => {
  assertIsolatedTestDatabase(process.env, baseURL ?? "http://localhost:3000")
  await page.goto("/uk/contacts")
  await expect(
    page
      .locator('a[href="tel:+380660044066"]')
      .filter({ hasText: "Телефон: +38 066 00 44 066" })
  ).toHaveCount(1)
  await expect(
    page
      .locator('a[href="tel:+380676561912"]')
      .filter({ hasText: "Телефон: +38 067 656 19 12" })
  ).toHaveCount(1)
  await expect(
    page
      .locator('a[href="mailto:voronina@purity-fashion.com"]')
      .filter({ hasText: "Email: voronina@purity-fashion.com" })
  ).toHaveCount(1)
  await expect(
    page.locator('a[href="viber://chat?number=%2B380676561912"]')
  ).not.toHaveCount(0)
  await expect(
    page
      .locator('a[href="https://www.instagram.com/purity_fashion_studio/"]')
      .first()
  ).toContainText("Instagram")
  await expect(
    page
      .locator(
        'a[href="https://www.facebook.com/PURITY-Fashion-Studio-370149113069285/?fref=ts"]'
      )
      .first()
  ).toContainText("Facebook")
  await expect(page.getByTestId("booking-form")).toHaveCount(1)
  await expect(page.getByText("Заповніть поле.")).toHaveCount(0)

  await page.getByTestId("booking-submit").click()
  await expect(page.getByText("Перевірте поля")).toBeVisible()

  await page.locator("#booking-name").fill("PURITY Contact")
  await page.locator("#booking-email").fill("purity-contact@example.com")
  await page
    .locator("#booking-message")
    .fill("Контактний запит для перевірки форми перед запуском.")
  await page.locator('[data-slot="checkbox"]').click()
  await page.getByTestId("booking-submit").click()

  await expect(page.getByText("Заявку прийнято")).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.locator('a[href*="/uk/payment/success?provider=stripe"]')
  ).toHaveCount(0)
  await expect(page.getByText("Заповніть поле.")).toHaveCount(0)
})

test("operations, indexing, and payment endpoints fail closed", async ({
  page,
  request,
}) => {
  const health = await request.get("/api/health")
  const healthBody = await health.json()
  expect(health.status(), JSON.stringify(healthBody)).toBe(200)
  expect(healthBody).toEqual({ status: "ok", content: "payload" })

  const stripe = await request.post("/api/payments/webhooks/stripe", {
    data: "{}",
    headers: { "stripe-signature": "invalid" },
  })
  expect(stripe.status()).toBe(400)

  const liqpay = await request.post("/api/payments/webhooks/liqpay", {
    form: { data: "invalid", signature: "invalid" },
  })
  expect(liqpay.status()).toBe(400)

  const reconciliation = await request.post("/api/jobs/reconcile-payments")
  expect(reconciliation.status()).toBe(401)

  const robots = await request.get("/robots.txt")
  expect(await robots.text()).toContain("Disallow: /")

  await page.goto("/uk")
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent()
  expect(structuredData).toContain("PURITY Fashion Studio")
  await page.goto("/uk/booking")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  )
})

test("Viber contact preference requires a localized phone number", async ({
  page,
}) => {
  const localizedPhoneErrors = {
    uk: "Для телефону або Viber вкажіть номер.",
    ru: "Для телефона или Viber укажите номер.",
    en: "Enter a phone number for phone or Viber.",
  } as const

  for (const [locale, phoneError] of Object.entries(localizedPhoneErrors)) {
    await page.goto(`/${locale}/booking?service=atelier-service`)
    await page.locator("#booking-name").fill("PURITY Viber")
    await page.locator("#booking-email").fill("purity-viber@example.com")
    await page
      .locator("#booking-message")
      .fill("Booking validation request for the Viber contact preference.")
    await page
      .getByTestId("booking-form")
      .getByText("Viber", { exact: true })
      .click()
    await page.locator('[data-slot="checkbox"]').click()
    await page.getByTestId("booking-submit").click()

    await expect(page.getByText(phoneError)).toBeVisible()
  }
})

test("interactive controls have accessible names and fit mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })

  for (const route of ["/uk/booking?service=atelier-service", "/uk/contacts"]) {
    await page.goto(route)

    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      unnamedControls: [
        ...document.querySelectorAll(
          'input:not([type="hidden"]), textarea, [role="combobox"], [role="radio"], [role="checkbox"]'
        ),
      ]
        .filter((element) => {
          if (element.id.includes("hidden-input")) {
            return false
          }

          const id = element.getAttribute("id")
          const hasLabel =
            Boolean(element.getAttribute("aria-label")) ||
            Boolean(element.closest("label")) ||
            Boolean(id && document.querySelector(`label[for="${id}"]`))

          return !hasLabel
        })
        .map((element) => element.outerHTML.slice(0, 120)),
      unnamedLinks: [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
        .filter((link) => !link.textContent?.trim())
        .filter((link) => !link.getAttribute("aria-label"))
        .map((link) => link.outerHTML.slice(0, 120)),
      unnamedButtons: [
        ...document.querySelectorAll<HTMLButtonElement>("button"),
      ]
        .filter((button) => !button.textContent?.trim())
        .filter((button) => !button.getAttribute("aria-label"))
        .map((button) => button.outerHTML.slice(0, 120)),
      unnamedNavs: [...document.querySelectorAll("nav")]
        .filter((nav) => !nav.getAttribute("aria-label"))
        .filter((nav) => !nav.getAttribute("aria-labelledby"))
        .map((nav) => nav.outerHTML.slice(0, 120)),
    }))

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
    expect(metrics.unnamedControls).toEqual([])
    expect(metrics.unnamedLinks).toEqual([])
    expect(metrics.unnamedButtons).toEqual([])
    expect(metrics.unnamedNavs).toEqual([])
  }
})
