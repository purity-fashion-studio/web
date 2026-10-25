import { randomUUID } from "node:crypto"
import { expect, test, type Page, type Response } from "@playwright/test"
import { getPayload, type Payload } from "payload"
import { tsImport } from "tsx/esm/api"

import type { BookingSetting, Offer } from "../../payload-types"
import {
  assertIsolatedDatabaseIdentity,
  assertIsolatedTestDatabase,
} from "../../scripts/test-database"

// Exercise real inset scrollbars instead of Playwright hiding them in headless Chromium.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } })

const prefix = `qa-commerce-${randomUUID()}`
let payload: Payload
let originalSettings: BookingSetting
let serviceID: string
let verified = false
const offers: string[] = []
const services: string[] = []
const previewUsers: string[] = []

test.beforeAll(async () => {
  assertIsolatedTestDatabase(process.env, "http://localhost:3000")
  expect(process.env.PAYMENT_MODE).toBe("test")
  expect(process.env.EMAIL_MODE).toBe("disabled")
  process.env.PAYLOAD_IMPORTING = "true"
  const { default: config } = (await tsImport(
    "../../payload.config.ts",
    import.meta.url
  )) as typeof import("../../payload.config")
  // This file owns and closes its pool; never reuse another suite's singleton.
  payload = await getPayload({ config, key: prefix })
  const identity = await payload.db.pool.query<{
    name: string
    address: string
  }>("SELECT current_database() AS name, host(inet_server_addr()) AS address")
  assertIsolatedDatabaseIdentity(identity.rows[0])
  verified = true
  originalSettings = await payload.findGlobal({
    slug: "booking-settings",
    depth: 0,
    overrideAccess: true,
  })
  const services = await payload.find({
    collection: "services",
    depth: 0,
    overrideAccess: false,
    where: { slug: { equals: "atelier-service" } },
  })
  serviceID = services.docs[0]!.id
})

test.afterAll(async () => {
  if (!payload) return
  try {
    if (!verified) return
    if (originalSettings)
      await payload.updateGlobal({
        slug: "booking-settings",
        overrideAccess: true,
        data: {
          enabledModes: originalSettings.enabledModes,
          providerRouting: originalSettings.providerRouting,
        },
      })
    const bookings = await payload.find({
      collection: "booking-requests",
      pagination: false,
      depth: 0,
      overrideAccess: true,
      where: { message: { contains: prefix } },
    })
    for (const booking of bookings.docs) {
      for (const collection of [
        "notification-outbox",
        "payment-orders",
      ] as const)
        await payload.delete({
          collection,
          overrideAccess: true,
          where: { bookingRequest: { equals: booking.id } },
        })
      await payload.delete({
        collection: "booking-requests",
        id: booking.id,
        overrideAccess: true,
      })
    }
    await payload.delete({
      collection: "leads",
      overrideAccess: true,
      where: { email: { contains: prefix } },
    })
    for (const id of offers.reverse())
      await payload.delete({ collection: "offers", id, overrideAccess: true })
    for (const id of services.reverse())
      await payload.delete({ collection: "services", id, overrideAccess: true })
    for (const id of previewUsers.reverse())
      await payload.delete({ collection: "users", id, overrideAccess: true })
    expect(
      (
        await payload.count({
          collection: "booking-requests",
          overrideAccess: true,
          where: { message: { contains: prefix } },
        })
      ).totalDocs
    ).toBe(0)
    expect(
      (
        await payload.count({
          collection: "leads",
          overrideAccess: true,
          where: { email: { contains: prefix } },
        })
      ).totalDocs
    ).toBe(0)
  } finally {
    await payload.destroy()
    await Promise.race([
      payload.db.pool.end(),
      new Promise((resolve) => setTimeout(resolve, 100)),
    ])
  }
})

async function createOffer(
  checkoutMode: Offer["checkoutMode"],
  deposit?: Offer["deposit"],
  options: { format?: Offer["format"]; serviceID?: string } = {}
) {
  const key = `${prefix}-${offers.length}`
  const doc = await payload.create({
    collection: "offers",
    locale: "uk",
    overrideAccess: true,
    data: {
      legacyKey: key,
      sku: key,
      service: options.serviceID ?? serviceID,
      title: key,
      shortDescription: "Synthetic isolated commerce contract.",
      format: options.format ?? "studio",
      pricingMode: deposit ? "fixed" : "custom",
      checkoutMode,
      commercialStatus: "active",
      enabled: true,
      sortOrder: 0,
      termsVersion: "qa-v1",
      prices: [{ currency: "EUR", ...(deposit ? { amount: 1000 } : {}) }],
      deposit,
      _status: "draft",
    },
  })
  offers.push(doc.id)
  for (const locale of ["ru", "en"] as const)
    await payload.update({
      collection: "offers",
      id: doc.id,
      locale,
      overrideAccess: true,
      data: {
        title: key,
        shortDescription: "Synthetic isolated commerce contract.",
      },
    })
  await payload.update({
    collection: "offers",
    id: doc.id,
    locale: "en",
    overrideAccess: true,
    data: { _status: "published" },
  })
  return doc.id
}

async function configure(enabledModes: BookingSetting["enabledModes"]) {
  await payload.updateGlobal({
    slug: "booking-settings",
    overrideAccess: true,
    data: {
      enabledModes,
      providerRouting: [
        { currency: "EUR", provider: "stripe", enabled: true },
        { currency: "UAH", provider: "liqpay", enabled: true },
      ],
    },
  })
}

async function cart(page: Page, offerId: string, currency = "EUR") {
  // Model independent clients without exhausting the real per-IP limiter.
  // These headers are sent only to the guarded, managed loopback test server.
  await page.setExtraHTTPHeaders({
    "x-real-ip": `198.51.100.${200 + offers.length}`,
  })
  await page.goto("/en/cart")
  await page.evaluate(
    (selection) => {
      localStorage.setItem("purity-cart-v1", JSON.stringify([selection]))
      window.dispatchEvent(new Event("purity-cart-change"))
    },
    {
      kind: "service",
      slug: "atelier-service",
      offerId,
      format: "studio",
      currency,
    }
  )
  await expect(page.getByTestId("cart-item")).toHaveCount(1)
}

async function submit(page: Page, marker: string, fromCart = true) {
  if (fromCart) await page.getByTestId("cart-continue").click()
  await expect(page.getByTestId("booking-selection")).toBeVisible()
  await page.locator("#booking-name").fill("Commerce Contract")
  await page.locator("#booking-email").fill(`${marker}@example.com`)
  await page
    .locator("#booking-message")
    .fill(`${marker} isolated commerce request.`)
  await page.locator('[data-slot="checkbox"]').click()
  await page.getByTestId("booking-submit").click()
  await expect(page.getByTestId("booking-form")).toHaveAttribute(
    "data-state",
    "success",
    { timeout: 15000 }
  )
  const saved = await payload.find({
    collection: "booking-requests",
    overrideAccess: true,
    depth: 0,
    where: { message: { contains: marker } },
  })
  expect(saved.docs).toHaveLength(1)
  return saved.docs[0]!
}

test("Atelier uses its CMS service editorial content and both booking targets in every locale", async ({
  page,
}) => {
  for (const locale of ["uk", "ru", "en"] as const) {
    const service = await payload.findByID({
      collection: "services",
      id: serviceID,
      locale,
      depth: 0,
      overrideAccess: true,
    })
    const response = await page.goto(`/${locale}/atelier`)
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", { level: 1, name: service.title, exact: true })
    ).toBeVisible()
    const main = page.getByRole("main")
    await expect(main).toContainText(service.intro)
    await expect(
      main.getByRole("heading", { name: service.processTitle, exact: true })
    ).toBeVisible()
    for (const outcome of service.outcomes ?? [])
      await expect(main).toContainText(outcome.text)
    await expect(
      main.locator(`a[href="/${locale}/booking?service=atelier-service"]`)
    ).toHaveCount(2)
    await expect(
      main.locator('a[href*="service=realisation-support"]')
    ).toHaveCount(0)
  }
})

test("hybrid offers allow online selection through the product UI, cart reload and saved booking", async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.setViewportSize({ width: 390, height: 844 })
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.stack ?? error.message))
  await configure(["booking-request"])
  // A fresh slug avoids a previously cached product without bypassing cache policy.
  const slug = `${prefix}-hybrid-service`
  let fixtureID = ""
  for (const locale of ["uk", "ru", "en"] as const) {
    const source = await payload.findByID({
      collection: "services",
      id: serviceID,
      locale,
      depth: 0,
      overrideAccess: true,
    })
    const data = JSON.parse(
      JSON.stringify(source, (key, value) =>
        ["id", "createdAt", "updatedAt", "publishedAt"].includes(key)
          ? undefined
          : value
      )
    )
    Object.assign(data, { slug, legacyKey: slug, _status: "draft" })
    if (!fixtureID) {
      const fixture = await payload.create({
        collection: "services",
        locale,
        draft: true,
        overrideAccess: true,
        data,
      })
      fixtureID = fixture.id
      services.push(fixtureID)
    } else
      await payload.update({
        collection: "services",
        id: fixtureID,
        locale,
        draft: true,
        overrideAccess: true,
        data,
      })
  }
  await payload.update({
    collection: "services",
    id: fixtureID,
    locale: "en",
    publishAllLocales: true,
    overrideAccess: true,
    data: { _status: "published" },
  })
  const hybrid = await createOffer("booking-request", undefined, {
    format: "hybrid",
    serviceID: fixtureID,
  })
  const fixed = await createOffer("booking-request", undefined, {
    format: "studio",
    serviceID: fixtureID,
  })
  const scheduled = await payload.jobs.queue({
    task: "schedulePublish",
    waitUntil: new Date(Date.now() - 1000),
    input: {
      doc: { relationTo: "services", value: fixtureID },
      type: "publish",
    },
  })
  try {
    const published = await page.request.get(
      "/api/jobs/process-notifications",
      {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }
    )
    expect(published.status()).toBe(200)
  } finally {
    await payload.delete({
      collection: "payload-jobs",
      overrideAccess: true,
      where: { id: { equals: scheduled.id } },
    })
  }
  const hybridTitle = (
    await payload.findByID({
      collection: "offers",
      id: hybrid,
      locale: "en",
      overrideAccess: true,
    })
  ).title
  const fixedTitle = (
    await payload.findByID({
      collection: "offers",
      id: fixed,
      locale: "en",
      overrideAccess: true,
    })
  ).title
  const settings = await payload.findGlobal({
    slug: "site-settings",
    locale: "en",
    overrideAccess: true,
  })
  // Use the existing CMS preview integration to invoke the real router.refresh,
  // without a test endpoint, a browser-global patch or framework internals.
  // Draft mode also requires an authenticated content reader; the preview
  // secret alone deliberately does not grant access to unpublished globals.
  const previewEmail = `${prefix}-preview@example.com`
  const previewPassword = randomUUID()
  const previewUser = await payload.create({
    collection: "users",
    overrideAccess: true,
    data: {
      name: "Isolated preview reader",
      email: previewEmail,
      password: previewPassword,
      roles: ["owner"],
      active: true,
    },
  })
  previewUsers.push(previewUser.id)
  const login = await page.request.post("/api/users/login", {
    data: { email: previewEmail, password: previewPassword },
  })
  expect(login.status()).toBe(200)
  expect((await login.json()).user.roles).toContain("owner")
  expect(process.env.PREVIEW_SECRET).toBeTruthy()
  const preview = await page.request.get(
    `/api/preview?${new URLSearchParams({
      secret: process.env.PREVIEW_SECRET!,
      path: `/en/services/${slug}`,
    })}`,
    { maxRedirects: 0 }
  )
  expect(preview.status()).toBe(307)
  const isRouteRefresh = (response: Response) =>
    new URL(response.url()).pathname === `/en/services/${slug}` &&
    response.request().headers()["rsc"] === "1" &&
    !response.request().headers()["next-router-prefetch"]
  // RefreshRouteOnSave refreshes once on mount. Await it so the subsequent
  // saved-document message cannot be confused with that initial request.
  const mountedRefresh = page.waitForResponse(isRouteRefresh)
  const response = await page.goto(`/en/services/${slug}`)
  expect(response?.status()).toBe(200)
  expect((await mountedRefresh).ok()).toBe(true)
  await expect(
    page.getByText("Draft preview is enabled", { exact: true })
  ).toBeVisible()
  const policy = response!.headers()["content-security-policy"]
  const stylePolicy = policy
    .split(";")
    .find((directive) => directive.trim().startsWith("style-src "))
  const nonce = stylePolicy?.match(/'nonce-([^']+)'/)?.[1]
  expect(nonce).toBeTruthy()
  const hybridCard = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText(hybridTitle, { exact: true }) })
  const fixedCard = page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText(fixedTitle, { exact: true }) })
  await expect(hybridCard.getByRole("combobox")).toHaveCount(2)
  await expect(fixedCard.getByRole("combobox")).toHaveCount(1)
  const format = hybridCard.getByRole("combobox").first()
  await expect(format).toBeVisible()
  const scrollbarStyle = page.locator(
    'style[data-href="base-ui-disable-scrollbar"]'
  )
  await expect(scrollbarStyle).toHaveCount(0)
  const documentTimeOrigin = await page.evaluate(() => performance.timeOrigin)
  const refreshedTitle = `${prefix} refreshed service`
  await payload.update({
    collection: "services",
    id: fixtureID,
    locale: "en",
    draft: true,
    overrideAccess: true,
    data: { _status: "draft", title: refreshedTitle },
  })
  const savedRefresh = page.waitForResponse(isRouteRefresh)
  await page.evaluate(() => {
    window.postMessage({ type: "payload-document-event" }, location.origin)
  })
  const refreshed = await savedRefresh
  expect(refreshed.ok()).toBe(true)
  const rscNonce = refreshed
    .headers()
    ["content-security-policy"]?.match(/'nonce-([^']+)'/)?.[1]
  expect(rscNonce).toBeTruthy()
  expect(rscNonce).not.toBe(nonce)
  // A changed draft heading proves React committed this refresh, rather than
  // merely receiving a response while the old provider still remains mounted.
  await expect(
    page.getByRole("heading", { level: 1, name: refreshedTitle, exact: true })
  ).toBeVisible()
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(
    documentTimeOrigin
  )
  await expect(scrollbarStyle).toHaveCount(0)
  expect(
    await page.evaluate(() => innerWidth - document.documentElement.clientWidth)
  ).toBeGreaterThan(0)
  const initialFormat = await format.textContent()
  await format.click()
  await expect(scrollbarStyle).toHaveCount(1)
  // Report every console/page error, including CSP refusals, before inspecting
  // the stylesheet; the final assertion also covers the rest of commerce.
  expect(errors).toEqual([])
  expect(
    await scrollbarStyle.evaluate((style: HTMLStyleElement) => ({
      nonce: style.nonce,
      rules: style.sheet?.cssRules.length ?? 0,
    }))
  ).toEqual({ nonce, rules: 2 })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await expect(format).toHaveText(initialFormat!)
  await format.click()
  await page
    .getByRole("option", { name: settings.booking.formats.online, exact: true })
    .click()
  await expect(format).toContainText(settings.booking.formats.online)
  await format.click()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await expect(format).toContainText(settings.booking.formats.online)
  const exitPreview = await page.request.post("/api/exit-preview", {
    maxRedirects: 0,
  })
  expect(exitPreview.status()).toBe(303)
  expect(
    (await page.context().cookies()).some(
      (cookie) => cookie.name === "__prerender_bypass"
    )
  ).toBe(false)
  const logout = await page.evaluate(async () => {
    const before = await fetch("/api/users/me")
    const previousUser = (await before.json()).user
    const response = await fetch("/api/users/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
    const after = await fetch("/api/users/me")
    return {
      previousUserID: previousUser?.id,
      status: response.status,
      user: (await after.json()).user,
    }
  })
  expect(logout.previousUserID).toBe(previewUser.id)
  expect(logout.status).toBe(200)
  expect(logout.user).toBeNull()
  await hybridCard.getByTestId("add-to-cart").click()
  await hybridCard.getByTestId("view-cart").click()
  await expect(page.getByTestId("cart-item")).toHaveCount(1)
  await page.reload()
  await expect(page.getByTestId("cart-item")).toContainText(
    settings.booking.formats.online
  )
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("purity-cart-v1") ?? "[]")
    )
  ).toEqual([
    {
      kind: "service",
      slug,
      offerId: hybrid,
      format: "online",
      currency: "EUR",
    },
  ])
  const saved = await submit(page, `${prefix}-hybrid`)
  expect(saved.format).toBe("online")
  expect(saved.offer).toBe(hybrid)
  expect(saved.submissionSnapshot).toMatchObject({
    format: "online",
    offerId: hybrid,
  })
  await page.goto(`/en/services/${slug}`)
  await hybridCard.getByRole("combobox").first().click()
  await page
    .getByRole("option", { name: settings.booking.formats.online, exact: true })
    .click()
  const direct = hybridCard.locator(`a[href*="offer=${hybrid}"]`)
  await expect(direct).toHaveAttribute("href", /format=online/)
  await direct.click()
  const directSaved = await submit(page, `${prefix}-direct-hybrid`, false)
  expect(directSaved.format).toBe("online")
  expect(directSaved.offer).toBe(hybrid)
  expect(directSaved.submissionSnapshot).toMatchObject({
    format: "online",
    offerId: hybrid,
  })
  await expect(page.getByTestId("booking-submit")).toBeDisabled()
  await page
    .getByTestId("booking-form")
    .evaluate((form) => (form as HTMLFormElement).requestSubmit())
  await page.getByTestId("booking-new-request").click()
  const deliberate = await submit(page, `${prefix}-deliberate-new`, false)
  expect(deliberate.id).not.toBe(directSaved.id)
  expect(
    (
      await payload.count({
        collection: "booking-requests",
        overrideAccess: true,
        where: { message: { contains: `${prefix}-direct-hybrid` } },
      })
    ).totalDocs
  ).toBe(1)
  expect(errors).toEqual([])
})

for (const mode of ["waitlist", "booking-request"] as const) {
  test(`${mode}-only settings preserve the selected mode through cart, UI and PostgreSQL`, async ({
    page,
  }) => {
    await configure([mode])
    const offerID = await createOffer(mode)
    await cart(page, offerID)
    await expect(page.getByTestId("cart-continue")).toHaveAttribute(
      "href",
      /intent=request/
    )
    const saved = await submit(page, `${prefix}-${mode}`)
    expect(saved.requestMode).toBe(mode)
    expect(saved.offer).toBe(offerID)
    expect(saved.paymentOrder).toBeFalsy()
    await configure([mode === "waitlist" ? "booking-request" : "waitlist"])
    await cart(page, offerID)
    await expect(page.getByTestId("cart-continue")).toHaveCount(0)
  })
}

for (const [kind, deposit, expected] of [
  ["fixed", { amount: 300 }, 300],
  ["percentage", { percentage: 25 }, 250],
] as const) {
  test(`${kind} deposit requires a currency price from cart through saved order`, async ({
    page,
  }) => {
    test.setTimeout(60000)
    await configure(["deposit", "booking-request"])
    const offerID = await createOffer("deposit", deposit)
    for (const currency of ["EUR", "UAH"] as const) {
      await cart(page, offerID, currency)
      const supported = currency === "EUR"
      const item = page.getByTestId("cart-item")
      if (supported)
        await expect(item).toContainText((expected / 100).toFixed(2))
      else
        await expect(item).toContainText(
          "Price and availability need confirmation"
        )
      const saved = await submit(page, `${prefix}-${kind}-${currency}`)
      expect(saved.requestMode).toBe(supported ? "deposit" : "booking-request")
      if (supported) {
        expect(typeof saved.paymentOrder).toBe("string")
        const order = await payload.findByID({
          collection: "payment-orders",
          id: saved.paymentOrder as string,
          overrideAccess: true,
          depth: 0,
        })
        expect(order.amount).toBe(expected)
        expect(order.currency).toBe(currency)
        expect(order.mode).toBe("test")
      } else expect(saved.paymentOrder).toBeFalsy()
    }
  })
}
