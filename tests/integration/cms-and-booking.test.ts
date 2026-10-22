import { randomUUID } from "node:crypto"
import path from "node:path"
import { afterAll, beforeAll, expect, it, vi } from "vitest"
import { getPayload, type CollectionSlug, type Payload } from "payload"

import type { User } from "@/payload-types"
import { assertIsolatedTestDatabase } from "@/scripts/test-database"

const requestState = vi.hoisted(() => ({ ip: 1 }))
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ "x-real-ip": `198.51.100.${requestState.ip++}` }),
}))
vi.mock("next/server", () => ({ after: vi.fn() }))

assertIsolatedTestDatabase()
// Local API tests have no Next request store to invalidate. Browser lifecycle
// tests exercise the real HTTP hooks separately.
process.env.PAYLOAD_IMPORTING = "true"

const prefix = `qa-${randomUUID()}`
const created: Array<{ collection: CollectionSlug; id: string }> = []
const accounts = new Map<string, User & { collection: "users" }>()
let payload: Payload
let serviceID: string
let originalPage: Record<string, unknown>
const password = `${randomUUID()}-Local-QA-only`

function account(role: string) {
  const user = accounts.get(role)
  if (!user) throw new Error("Missing test account")
  return user
}
function cloneData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneData)
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key]) =>
            !["id", "createdAt", "updatedAt", "publishedAt"].includes(key)
        )
        .map(([key, child]) => [key, cloneData(child)])
    )
  return value
}
function bookingForm(key: string, extra: Record<string, string> = {}) {
  const data = new FormData()
  const values = {
    inquiryType: "private",
    serviceSlug: "atelier-service",
    name: "Integration Client",
    email: `${prefix}@example.com`,
    phone: "+380001234567",
    format: "studio",
    contactMethod: "email",
    budgetCurrency: "EUR",
    message: "Isolated integration request, not a real customer booking.",
    consent: "on",
    locale: "en",
    sourcePage: "/integration",
    idempotencyKey: `${prefix}:${key}`,
    submissionStartedAt: String(Date.now() - 5000),
    ...extra,
  }
  for (const [name, value] of Object.entries(values)) data.set(name, value)
  return data
}

beforeAll(async () => {
  const { default: config } = await import("@/payload.config")
  payload = await getPayload({ config })
  const identity = await payload.db.pool.query<{
    name: string
    address: string
  }>("SELECT current_database() AS name, host(inet_server_addr()) AS address")
  expect(identity.rows[0]?.name).toBe(process.env.PURITY_TEST_DATABASE)
  expect(["127.0.0.1", "::1"]).toContain(identity.rows[0]?.address)
  const owner = await payload.create({
    collection: "users",
    overrideAccess: true,
    data: {
      name: "Integration Owner",
      email: `${prefix}-owner@example.com`,
      password,
      roles: ["owner"],
      active: true,
    },
  })
  created.push({ collection: "users", id: owner.id })
  accounts.set("owner", { ...owner, collection: "users" })
  for (const role of ["editor", "support", "finance", "developer"] as const) {
    const user = await payload.create({
      collection: "users",
      user: account("owner"),
      overrideAccess: false,
      data: {
        name: `Integration ${role}`,
        email: `${prefix}-${role}@example.com`,
        password,
        roles: [role],
        active: true,
      },
    })
    created.push({ collection: "users", id: user.id })
    accounts.set(role, { ...user, collection: "users" })
  }
  const service = await payload.find({
    collection: "services",
    overrideAccess: false,
    depth: 0,
    limit: 1,
    where: { slug: { equals: "atelier-service" } },
  })
  serviceID = service.docs[0]!.id
  const page = await payload.find({
    collection: "pages",
    overrideAccess: true,
    depth: 0,
    limit: 1,
    locale: "uk",
    where: { slug: { equals: "studio" } },
  })
  originalPage = page.docs[0]! as unknown as Record<string, unknown>
})

afterAll(async () => {
  if (!payload) return
  try {
    const bookings = await payload.find({
      collection: "booking-requests",
      overrideAccess: true,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { idempotencyKey: { contains: prefix } },
    })
    for (const booking of bookings.docs) {
      for (const collection of [
        "notification-outbox",
        "payment-orders",
      ] as const) {
        const records = await payload.find({
          collection,
          overrideAccess: true,
          depth: 0,
          limit: 1000,
          pagination: false,
          where: { bookingRequest: { equals: booking.id } },
        })
        for (const record of records.docs)
          await payload.delete({
            collection,
            id: record.id,
            overrideAccess: true,
          })
      }
      await payload.delete({
        collection: "booking-requests",
        id: booking.id,
        overrideAccess: true,
      })
    }
    const leads = await payload.find({
      collection: "leads",
      overrideAccess: true,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { email: { contains: prefix } },
    })
    for (const lead of leads.docs)
      await payload.delete({
        collection: "leads",
        id: lead.id,
        overrideAccess: true,
      })
    const redirects = await payload.find({
      collection: "redirects",
      overrideAccess: true,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { from: { contains: prefix } },
    })
    for (const redirect of redirects.docs)
      await payload.delete({
        collection: "redirects",
        id: redirect.id,
        overrideAccess: true,
      })
    for (const record of created.reverse())
      await payload.delete({ ...record, overrideAccess: true })
    expect(
      (
        await payload.count({
          collection: "users",
          overrideAccess: true,
          where: { email: { contains: prefix } },
        })
      ).totalDocs
    ).toBe(0)
    expect(
      (
        await payload.count({
          collection: "booking-requests",
          overrideAccess: true,
          where: { idempotencyKey: { contains: prefix } },
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

it("supports localized draft, publish, slug redirect and unpublish through real editor permissions", async () => {
  const slug = `${prefix}-page`
  const page = await payload.create({
    collection: "pages",
    locale: "uk",
    draft: true,
    overrideAccess: false,
    user: account("editor"),
    data: {
      ...(cloneData(originalPage) as object),
      slug,
      legacyKey: slug,
      _status: "draft",
    } as never,
  })
  created.push({ collection: "pages", id: page.id })
  expect(
    (
      await payload.find({
        collection: "pages",
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
    ).docs
  ).toHaveLength(0)
  for (const locale of ["uk", "ru", "en"] as const) {
    const seed = await payload.findByID({
      collection: "pages",
      id: String(originalPage.id),
      locale,
      depth: 0,
      overrideAccess: true,
    })
    await payload.update({
      collection: "pages",
      id: page.id,
      locale,
      draft: true,
      overrideAccess: false,
      user: account("editor"),
      data: {
        ...(cloneData(seed) as object),
        slug,
        legacyKey: slug,
        title: `${locale} ${prefix}`,
        _status: "draft",
      } as never,
    })
  }
  await payload.update({
    collection: "pages",
    id: page.id,
    locale: "uk",
    draft: false,
    publishAllLocales: true,
    overrideAccess: false,
    user: account("editor"),
    data: { _status: "published" },
  })
  for (const locale of ["uk", "ru", "en"] as const) {
    const published = await payload.find({
      collection: "pages",
      locale,
      fallbackLocale: false,
      overrideAccess: false,
      depth: 0,
      where: { slug: { equals: slug } },
    })
    expect(published.docs[0]?.title).toBe(`${locale} ${prefix}`)
  }
  const renamed = `${slug}-renamed`
  await payload.update({
    collection: "pages",
    id: page.id,
    overrideAccess: false,
    user: account("editor"),
    data: { slug: renamed },
  })
  const redirects = await payload.find({
    collection: "redirects",
    overrideAccess: true,
    depth: 0,
    where: { from: { contains: slug } },
  })
  expect(redirects.docs).toHaveLength(3)
  for (const locale of ["uk", "ru", "en"])
    expect(redirects.docs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: `/${locale}/${slug}`,
          to: expect.objectContaining({ url: `/${locale}/${renamed}` }),
        }),
      ])
    )
  await payload.update({
    collection: "pages",
    id: page.id,
    overrideAccess: false,
    user: account("editor"),
    draft: false,
    data: { _status: "draft" },
  })
  expect(
    (
      await payload.find({
        collection: "pages",
        overrideAccess: false,
        where: { slug: { equals: renamed } },
      })
    ).docs
  ).toHaveLength(0)
})

it.each(["support", "finance", "developer"])(
  "does not allow %s to publish content or escalate roles",
  async (role) => {
    await expect(
      payload.update({
        collection: "pages",
        id: String(originalPage.id),
        overrideAccess: false,
        user: account(role),
        data: { title: "Unauthorized title" },
      })
    ).rejects.toThrow()
    const updated = await payload.update({
      collection: "users",
      id: account(role).id,
      overrideAccess: false,
      user: account(role),
      data: { roles: ["owner"] },
    })
    expect(updated.roles).toEqual([role])
  }
)

it("separates support operations from finance and blocks inactive login", async () => {
  await expect(
    payload.find({
      collection: "payment-orders",
      overrideAccess: false,
      user: account("support"),
    })
  ).rejects.toThrow()
  await expect(
    payload.find({
      collection: "leads",
      overrideAccess: false,
      user: account("finance"),
    })
  ).rejects.toThrow()
  expect(
    (
      await payload.find({
        collection: "payment-orders",
        overrideAccess: false,
        user: account("finance"),
      })
    ).docs
  ).toBeInstanceOf(Array)
  expect(
    (
      await payload.find({
        collection: "leads",
        overrideAccess: false,
        user: account("support"),
      })
    ).docs
  ).toBeInstanceOf(Array)
  await payload.update({
    collection: "users",
    id: account("developer").id,
    user: account("owner"),
    overrideAccess: false,
    data: { active: false },
  })
  await expect(
    payload.login({
      collection: "users",
      data: { email: account("developer").email, password },
    })
  ).rejects.toThrow()
})

it("enforces real local upload, rights, private metadata and generated-proof exclusions", async () => {
  const media = await payload.create({
    collection: "media",
    overrideAccess: false,
    user: account("editor"),
    locale: "uk",
    filePath: path.resolve("public/brand/logo-mark-grey.png"),
    data: {
      internalLabel: prefix,
      alt: "Isolated integration image",
      source: "generated",
      usageRightsStatus: "pending",
      modelReleaseStatus: "not-applicable",
      publicVisibility: false,
      isRealClientProof: true,
      replacementPriority: "replace-before-launch",
      sourceMetadata: "Private test provenance",
    },
  })
  created.push({ collection: "media", id: media.id })
  expect(media.isRealClientProof).toBe(false)
  expect(
    (
      await payload.find({
        collection: "media",
        overrideAccess: false,
        where: { id: { equals: media.id } },
      })
    ).docs
  ).toHaveLength(0)
  await payload.update({
    collection: "media",
    id: media.id,
    user: account("editor"),
    overrideAccess: false,
    data: { usageRightsStatus: "approved", publicVisibility: true },
  })
  const visible = await payload.findByID({
    collection: "media",
    id: media.id,
    overrideAccess: false,
  })
  expect(visible.sourceMetadata).toBeUndefined()
  expect(visible.isRealClientProof).toBe(false)
  await expect(
    payload.update({
      collection: "media",
      id: media.id,
      user: account("editor"),
      overrideAccess: false,
      data: { rightsExpiry: new Date(Date.now() - 1000).toISOString() },
    })
  ).rejects.toThrow()
  await payload.update({
    collection: "media",
    id: media.id,
    user: account("editor"),
    overrideAccess: false,
    data: { publicVisibility: false, usageRightsStatus: "restricted" },
  })
  expect(
    (
      await payload.find({
        collection: "media",
        overrideAccess: false,
        where: { id: { equals: media.id } },
      })
    ).docs
  ).toHaveLength(0)
})

it("commits concurrent requests for one new identity without unique-key failures", async () => {
  const { submitBooking } = await import("@/features/booking/actions")
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      submitBooking({ status: "idle" }, bookingForm(`concurrent-${index}`))
    )
  )
  expect(results.every((result) => result.status === "success")).toBe(true)
  const leadIDs = results.flatMap((result) =>
    result.status === "success" ? [result.leadId] : []
  )
  expect(new Set(leadIDs).size).toBe(1)
  expect(
    (
      await payload.count({
        collection: "booking-requests",
        overrideAccess: true,
        where: { idempotencyKey: { contains: `${prefix}:concurrent-` } },
      })
    ).totalDocs
  ).toBe(12)
  expect(
    (
      await payload.count({
        collection: "notification-outbox",
        overrideAccess: true,
        where: { recipient: { equals: `${prefix}@example.com` } },
      })
    ).totalDocs
  ).toBe(12)
})

it("replays immutable submission details after a lead edit and rejects cross-email phone merging", async () => {
  const { submitBooking } = await import("@/features/booking/actions")
  const first = await submitBooking({ status: "idle" }, bookingForm("replay"))
  expect(first.status).toBe("success")
  if (first.status !== "success") throw new Error("Booking did not persist")
  await payload.update({
    collection: "leads",
    id: first.leadId,
    overrideAccess: true,
    data: { name: "Corrected by support", company: "Support correction" },
  })
  const replay = await submitBooking({ status: "idle" }, bookingForm("replay"))
  expect(replay).toMatchObject({
    status: "success",
    bookingRequestId: first.bookingRequestId,
  })
  const conflict = await submitBooking(
    { status: "idle" },
    bookingForm("phone-conflict", { email: `${prefix}-different@example.com` })
  )
  expect(conflict.status).toBe("error")
  expect(
    (
      await payload.count({
        collection: "booking-requests",
        overrideAccess: true,
        where: { idempotencyKey: { equals: `${prefix}:phone-conflict` } },
      })
    ).totalDocs
  ).toBe(0)
  const stored = await payload.findByID({
    collection: "booking-requests",
    id: first.bookingRequestId!,
    overrideAccess: true,
  })
  expect(stored.submissionSnapshot).toMatchObject({
    name: "Integration Client",
    locale: "en",
  })
  expect(serviceID).toBeTruthy()
})
