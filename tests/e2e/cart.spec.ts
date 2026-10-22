import { expect, test } from "@playwright/test"

test("cart has a real localized empty state", async ({ page }) => {
  const response = await page.goto("/en/cart")
  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole("heading", { name: "Your selection", exact: true })
  ).toBeVisible()
  await expect(
    page.getByText("Your cart is empty.", { exact: true })
  ).toBeVisible()
})

test("skip link reaches the real main boundary on existing pages", async ({
  page,
}) => {
  for (const route of ["/en", "/en/booking"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    const skip = page.getByRole("link", { name: "Skip to main content" })
    await skip.focus()
    await page.keyboard.press("Enter")
    await expect(page.locator("main#main-content")).toBeFocused()
  }
})

test("cart persists distinct selections, switches locale and removes an item", async ({
  page,
}) => {
  await page.goto("/en/services/atelier-service")
  await page.getByTestId("add-to-cart").first().click()
  await page.goto("/en/collections/purity-capsule")
  await page.getByTestId("add-to-cart").first().click()
  await page.getByTestId("view-cart").first().click()
  await expect(page).toHaveURL(/\/en\/cart$/)
  await expect(page.getByTestId("cart-item")).toHaveCount(2)
  await page.reload()
  await expect(page.getByTestId("cart-item")).toHaveCount(2)
  await page.goto("/uk/cart")
  await expect(
    page.getByRole("heading", { name: "Ваш вибір", exact: true })
  ).toBeVisible()
  await expect(page.getByTestId("cart-item")).toHaveCount(2)
  await page
    .getByTestId("cart-item")
    .first()
    .getByRole("button", { name: "Видалити" })
    .click()
  await expect(page.getByTestId("cart-item")).toHaveCount(1)
  await page.reload()
  await expect(page.getByTestId("cart-item")).toHaveCount(1)
  await page.getByTestId("cart-continue").click()
  await expect(page).toHaveURL(/collection=purity-capsule/)
  await expect(page.getByTestId("booking-selection")).toContainText(
    /PURITY|капсул/i
  )
  const languageLink = page.locator('a[hreflang="en"]').first()
  await languageLink.click()
  await expect(page).toHaveURL(/collection=purity-capsule/)
  await expect(page.getByTestId("booking-selection")).toBeVisible()
})

test("course inquiry preserves its identity without promising payment or a reservation", async ({
  page,
}) => {
  await page.goto("/en/courses/wardrobe-management-course")
  await page.getByTestId("add-to-cart").first().click()
  await page.getByTestId("view-cart").first().click()
  const item = page.getByTestId("cart-item")
  await expect(item).toContainText("Price and availability need confirmation")
  await item.getByTestId("cart-continue").click()
  await expect(page).toHaveURL(/course=wardrobe-management-course/)
  await expect(page.getByTestId("booking-selection")).toContainText(/wardrobe/i)
  await expect(page.getByTestId("booking-service-trigger")).toBeDisabled()
})

for (const [kind, slug] of [
  ["course", "wardrobe-management-course"],
  ["collection", "purity-capsule"],
] as const) {
  test(`${kind} offers preserve an explicit offer through the cart`, async ({
    page,
  }) => {
    await page.goto(
      `/en/${kind === "course" ? "courses" : "collections"}/${slug}`
    )
    const offer = page.getByTestId("offer-selection").first()
    await expect(offer).toBeVisible()
    const id = await offer.getAttribute("data-offer-id")
    expect(id).toBeTruthy()
    await offer.getByTestId("add-to-cart").click()
    await offer.getByTestId("view-cart").click()
    await expect(page.getByTestId("cart-item")).toHaveCount(1)
    await page.getByTestId("cart-continue").click()
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/en/booking" &&
        url.searchParams.get(kind) === slug &&
        url.searchParams.get("offer") === id
    )
    await expect(page.getByTestId("booking-selection")).toBeVisible()
  })
}

test("cart and skip-link controls remain usable at mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto("/en/cart")
  await page.keyboard.press("Tab")
  await expect(
    page.getByRole("link", { name: "Skip to main content" })
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.locator("main#main-content")).toBeFocused()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    )
  ).toBe(true)
})
