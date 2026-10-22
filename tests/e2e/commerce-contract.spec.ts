import { randomUUID } from "node:crypto"
import { expect, test, type Page } from "@playwright/test"
import { getPayload, type Payload } from "payload"
import { tsImport } from "tsx/esm/api"

import type { BookingSetting, Offer } from "../../payload-types"
import {
  assertIsolatedDatabaseIdentity,
  assertIsolatedTestDatabase,
} from "../../scripts/test-database"

const prefix = `qa-commerce-${randomUUID()}`
let payload: Payload
let originalSettings: BookingSetting
let serviceID: string
let verified = false
const offers: string[] = []

test.beforeAll(async () => {
  assertIsolatedTestDatabase(process.env, "http://localhost:3000")
  expect(process.env.PAYMENT_MODE).toBe("test")
  expect(process.env.EMAIL_MODE).toBe("disabled")
  process.env.PAYLOAD_IMPORTING = "true"
  const { default: config } = (await tsImport(
    "../../payload.config.ts",
    import.meta.url
  )) as typeof import("../../payload.config")
  payload = await getPayload({ config })
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
  deposit?: Offer["deposit"]
) {
  const key = `${prefix}-${offers.length}`
  const doc = await payload.create({
    collection: "offers",
    locale: "uk",
    overrideAccess: true,
    data: {
      legacyKey: key,
      sku: key,
      service: serviceID,
      title: key,
      shortDescription: "Synthetic isolated commerce contract.",
      format: "studio",
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

async function submit(page: Page, marker: string) {
  await page.getByTestId("cart-continue").click()
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
