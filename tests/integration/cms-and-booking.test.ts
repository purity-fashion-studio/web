import { spawn } from "node:child_process"
import { once } from "node:events"
import { fileURLToPath } from "node:url"
import { randomUUID } from "node:crypto"
import path from "node:path"
import { afterAll, beforeAll, expect, it, vi } from "vitest"
import { getPayload, type CollectionSlug, type Payload } from "payload"

import type { User } from "@/payload-types"
import {
  assertIsolatedDatabaseIdentity,
  assertIsolatedTestDatabase,
} from "@/scripts/test-database"

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
let databaseVerified = false
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
  assertIsolatedDatabaseIdentity(identity.rows[0])
  databaseVerified = true
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
    if (!databaseVerified) return
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

it("uses structured text editorial fields without a global rich-text editor", () => {
  const richText: string[] = []
  const editorialText: string[] = []
  const visit = (fields: readonly import("payload").Field[], scope: string) => {
    for (const field of fields) {
      const name = "name" in field ? `${scope}.${field.name}` : scope
      if (field.type === "richText") richText.push(name)
      if (field.type === "textarea" && scope.includes("richText"))
        editorialText.push(name)
      if ("fields" in field) visit(field.fields, name)
      if (field.type === "tabs")
        for (const tab of field.tabs) visit(tab.fields, name)
      if (field.type === "blocks")
        for (const block of field.blocks)
          if (typeof block !== "string")
            visit(block.fields, `${name}.${block.slug}`)
    }
  }
  for (const entity of [
    ...payload.config.collections,
    ...payload.config.globals,
  ])
    visit(entity.fields, entity.slug)
  expect(richText).toEqual([])
  expect(editorialText.length).toBeGreaterThan(0)
  expect(payload.config.editor).toBeUndefined()
})

it("protects saved global drafts through the real REST dispatcher, including disabled sessions", async () => {
  const { handleEndpoints } = await import("payload")
  const { default: config } = await import("@/payload.config")
  const tokens = new Map<string, string>()
  for (const role of ["owner", "editor", "developer", "support", "finance"]) {
    const session = await payload.login({
      collection: "users",
      data: { email: account(role).email, password },
    })
    tokens.set(role, session.token!)
  }
  const disabled = await payload.create({
    collection: "users",
    overrideAccess: true,
    user: account("owner"),
    data: {
      name: "Disabled preview account",
      email: `${prefix}-disabled@example.com`,
      password,
      roles: ["owner"],
      active: true,
    },
  })
  created.push({ collection: "users", id: disabled.id })
  const session = await payload.login({
    collection: "users",
    data: { email: disabled.email, password },
  })
  tokens.set("disabled", session.token!)
  await payload.update({
    collection: "users",
    id: disabled.id,
    overrideAccess: true,
    data: { active: false },
  })
  for (const [slug, field] of [
    ["home", "heroTitle"],
    ["header", "bookingLabel"],
    ["footer", "address"],
  ] as const) {
    const published = await payload.findGlobal({
      slug,
      locale: "en",
      depth: 0,
      overrideAccess: true,
    })
    const draft = await payload.findGlobal({
      slug,
      locale: "en",
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    try {
      await payload.updateGlobal({
        slug,
        locale: "en",
        overrideAccess: true,
        data: { [field]: `${prefix} published`, _status: "published" },
      })
      await payload.updateGlobal({
        slug,
        locale: "en",
        draft: true,
        overrideAccess: true,
        data: { [field]: `${prefix} secret draft`, _status: "draft" },
      })
      for (const role of [
        "anonymous",
        "disabled",
        "support",
        "finance",
        "owner",
        "editor",
        "developer",
      ]) {
        const headers = tokens.has(role)
          ? { authorization: `JWT ${tokens.get(role)}` }
          : undefined
        const request = (query: string) =>
          handleEndpoints({
            config,
            request: new Request(
              `http://localhost/api/globals/${slug}?locale=en&depth=0${query}`,
              { headers }
            ),
          })
        const publicRead = await request("")
        expect(publicRead.status).toBe(200)
        expect((await publicRead.json())[field]).toBe(`${prefix} published`)
        const draftRead = await request("&draft=true")
        if (["owner", "editor", "developer"].includes(role)) {
          expect(draftRead.status).toBe(200)
          expect((await draftRead.json())[field]).toBe(`${prefix} secret draft`)
        } else {
          expect(draftRead.status).toBe(403)
          expect(await draftRead.text()).not.toContain(`${prefix} secret draft`)
        }
      }
      const importer = await payload.findGlobal({
        slug,
        locale: "en",
        draft: true,
        overrideAccess: true,
      })
      expect(importer[field as keyof typeof importer]).toBe(
        `${prefix} secret draft`
      )
      expect(importer.updatedAt).toBeTruthy()
    } finally {
      await payload.updateGlobal({
        slug,
        locale: "en",
        overrideAccess: true,
        data: published,
      })
      await payload.updateGlobal({
        slug,
        locale: "en",
        overrideAccess: true,
        draft: true,
        data: draft,
      })
    }
  }
})

it("keeps outbox recipients private through the role-aware Local API", async () => {
  for (const recipientType of ["client", "internal"] as const) {
    const message = await payload.create({
      collection: "notification-outbox",
      overrideAccess: true,
      data: {
        deduplicationKey: `${prefix}:${recipientType}`,
        recipientType,
        status: "pending",
        attempts: 0,
        recipient: `${prefix}-${recipientType}@example.com`,
        subject: "Fixture notification",
        text: "Synthetic test only",
        nextAttemptAt: new Date(Date.now() + 86400000).toISOString(),
      },
    })
    created.push({ collection: "notification-outbox", id: message.id })
    await expect(
      payload.findByID({
        collection: "notification-outbox",
        id: message.id,
        overrideAccess: false,
        user: account("developer"),
      })
    ).rejects.toThrow()
    expect(
      (
        await payload.findByID({
          collection: "notification-outbox",
          id: message.id,
          overrideAccess: false,
          user: account("owner"),
        })
      ).recipient
    ).toBe(`${prefix}-${recipientType}@example.com`)
    expect(
      (
        await payload.findByID({
          collection: "notification-outbox",
          id: message.id,
          overrideAccess: false,
          user: account("support"),
        })
      ).recipient
    ).toBeUndefined()
  }
})

it("recovers persistent claims after a hard-killed publisher without stealing a live worker", async () => {
  const { GET } = await import("@/app/api/jobs/process-notifications/route")
  const jobs: string[] = []
  const pages: string[] = []
  for (let index = 0; index < 2; index++) {
    const slug = `${prefix}-interrupted-${index}`
    const page = await payload.create({
      collection: "pages",
      locale: "uk",
      draft: true,
      overrideAccess: true,
      data: {
        ...(cloneData(originalPage) as object),
        slug,
        legacyKey: slug,
        _status: "draft",
      } as never,
    })
    created.push({ collection: "pages", id: page.id })
    pages.push(page.id)
    const job = await payload.jobs.queue({
      task: "schedulePublish",
      waitUntil: new Date(Date.now() - 1000),
      input: {
        doc: { relationTo: "pages", value: page.id },
        locale: "uk",
        type: "publish",
        user: { relationTo: "users", value: account("editor").id },
      },
    })
    jobs.push(String(job.id))
  }
  const worker = spawn(
    process.execPath,
    [
      "--import",
      "tsx",
      fileURLToPath(
        new URL("./fixtures/interrupted-publisher.ts", import.meta.url)
      ),
    ],
    { env: process.env, stdio: ["ignore", "pipe", "pipe"] }
  )
  let output = ""
  worker.stdout.on("data", (data) => {
    output += data
  })
  worker.stderr.on("data", (data) => {
    output += data
  })
  try {
    await vi.waitFor(
      () => {
        if (worker.exitCode !== null)
          throw new Error(`Worker exited: ${output}`)
        expect(output).toContain("PUBLICATION_CLAIMED")
      },
      { timeout: 15000 }
    )
    const trigger = () =>
      GET(
        new Request("http://localhost/api/jobs/process-notifications", {
          headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        })
      )
    const busy = await trigger()
    expect(busy.status).toBe(200)
    expect((await busy.json()).publishing).toBe("busy")
    const claimed = await payload.find({
      collection: "payload-jobs",
      overrideAccess: true,
      where: { and: [{ id: { in: jobs } }, { processing: { equals: true } }] },
    })
    expect(claimed.totalDocs).toBe(1)
    worker.kill("SIGKILL")
    await once(worker, "exit")
    const recovered = await trigger()
    expect(recovered.status).toBe(200)
    for (const id of pages) {
      const published = await payload.find({
        collection: "pages",
        overrideAccess: false,
        where: { id: { equals: id } },
      })
      expect(published.totalDocs).toBe(1)
    }
    expect(
      (
        await payload.count({
          collection: "payload-jobs",
          overrideAccess: true,
          where: {
            and: [{ id: { in: jobs } }, { processing: { equals: true } }],
          },
        })
      ).totalDocs
    ).toBe(0)
  } finally {
    if (worker.exitCode === null && worker.signalCode === null) {
      worker.kill("SIGKILL")
      await once(worker, "exit")
    }
    await payload.delete({
      collection: "payload-jobs",
      overrideAccess: true,
      where: { id: { in: jobs } },
    })
  }
})

it("reports ordinary persistent publishing failures separately from a busy lock", async () => {
  const { GET } = await import("@/app/api/jobs/process-notifications/route")
  const job = await payload.jobs.queue({
    task: "schedulePublish",
    waitUntil: new Date(Date.now() - 1000),
    input: {
      doc: { relationTo: "pages", value: randomUUID() },
      type: "publish",
      user: { relationTo: "users", value: account("editor").id },
    },
  })
  try {
    const response = await GET(
      new Request("http://localhost/api/jobs/process-notifications", {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      })
    )
    expect(response.status).toBe(503)
    expect((await response.json()).publishing).toMatchObject({
      processed: 1,
      failed: 1,
    })
    const saved = await payload.findByID({
      collection: "payload-jobs",
      id: job.id,
      overrideAccess: true,
    })
    expect(saved.processing).toBe(false)
    expect(saved.completedAt).toBeFalsy()
    expect(saved.hasError).toBe(true)
  } finally {
    await payload.delete({
      collection: "payload-jobs",
      id: job.id,
      overrideAccess: true,
    })
  }
})

it("publishes due scheduled drafts through the authenticated deployed trigger while leaving future jobs queued", async () => {
  const { GET } = await import("@/app/api/jobs/process-notifications/route")
  const jobs: string[] = []
  try {
    for (const due of [true, false]) {
      const slug = `${prefix}-scheduled-${due}`
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
      const job = await payload.jobs.queue({
        task: "schedulePublish",
        waitUntil: new Date(Date.now() + (due ? -1000 : 86400000)),
        input: {
          doc: { relationTo: "pages", value: page.id },
          locale: "uk",
          type: "publish",
          user: { relationTo: "users", value: account("editor").id },
        },
      })
      jobs.push(String(job.id))
      const unauthorized = await GET(
        new Request("http://localhost/api/jobs/process-notifications")
      )
      expect(unauthorized.status).toBe(401)
      expect(
        (
          await payload.find({
            collection: "pages",
            overrideAccess: false,
            where: { id: { equals: page.id } },
          })
        ).docs
      ).toHaveLength(0)
    }
    const response = await GET(
      new Request("http://localhost/api/jobs/process-notifications", {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      })
    )
    expect(response.status).toBe(200)
    for (const due of [true, false]) {
      const records = await payload.find({
        collection: "pages",
        overrideAccess: false,
        where: { slug: { equals: `${prefix}-scheduled-${due}` } },
      })
      expect(records.docs).toHaveLength(due ? 1 : 0)
    }
  } finally {
    const remaining = await payload.find({
      collection: "payload-jobs",
      overrideAccess: true,
      where: { id: { in: jobs } },
    })
    for (const job of remaining.docs)
      await payload.delete({
        collection: "payload-jobs",
        id: job.id,
        overrideAccess: true,
      })
    expect(
      (
        await payload.count({
          collection: "payload-jobs",
          overrideAccess: true,
          where: { id: { in: jobs } },
        })
      ).totalDocs
    ).toBe(0)
  }
})

it("preserves a hybrid online selection through authoritative cart resolution and the booking snapshot", async () => {
  const offer = await payload.create({
    collection: "offers",
    overrideAccess: true,
    locale: "en",
    data: {
      sku: `${prefix}-hybrid`,
      legacyKey: `${prefix}-hybrid`,
      shortDescription: "Synthetic integration offer",
      title: "Hybrid fixture",
      service: serviceID,
      format: "hybrid",
      pricingMode: "fixed",
      prices: [{ currency: "EUR", amount: 1000 }],
      checkoutMode: "inquiry",
      commercialStatus: "active",
      enabled: true,
      sortOrder: 100,
      termsVersion: "fixture-v1",
      _status: "published",
    },
  })
  created.push({ collection: "offers", id: offer.id })
  const { resolveCart } = await import("@/features/cart/actions")
  const resolved = await resolveCart("en", [
    {
      kind: "service",
      slug: "atelier-service",
      offerId: offer.id,
      format: "online",
      currency: "EUR",
    },
  ])
  expect(resolved[0]).toMatchObject({
    available: true,
    selection: { format: "online" },
  })
  const { submitBooking } = await import("@/features/booking/actions")
  const result = await submitBooking(
    { status: "idle" },
    bookingForm("hybrid", {
      email: `${prefix}-hybrid@example.com`,
      phone: "+380501234568",
      offerId: offer.id,
      intent: "request",
      format: "online",
    })
  )
  expect(result.status).toBe("success")
  if (result.status !== "success") throw new Error("Hybrid booking failed")
  const saved = await payload.findByID({
    collection: "booking-requests",
    id: result.bookingRequestId!,
    overrideAccess: true,
  })
  expect(saved.format).toBe("online")
  expect(saved.submissionSnapshot).toMatchObject({
    format: "online",
    offerId: offer.id,
    intent: "request",
  })
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

it("returns actionable REST field errors for invalid media rights and generated priority", async () => {
  const { handleEndpoints } = await import("payload")
  const { default: config } = await import("@/payload.config")
  const { readFile } = await import("node:fs/promises")
  const login = await payload.login({
    collection: "users",
    data: { email: account("editor").email, password },
  })
  const headers = { authorization: `JWT ${login.token}` }
  const upload = new FormData()
  upload.set(
    "_payload",
    JSON.stringify({
      internalLabel: prefix,
      alt: "Validation fixture",
      source: "generated",
      replacementPriority: "none",
    })
  )
  upload.set(
    "file",
    new Blob([await readFile("public/brand/logo-mark-grey.png")], {
      type: "image/png",
    }),
    "invalid-generated.png"
  )
  const invalidCreate = await handleEndpoints({
    config,
    request: new Request("http://localhost/api/media?locale=en", {
      method: "POST",
      headers,
      body: upload,
    }),
  })
  expect(invalidCreate.status).toBe(400)
  expect((await invalidCreate.json()).errors[0].data.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path: "replacementPriority",
        message: expect.stringContaining("replacement priority"),
      }),
    ])
  )
  const media = await payload.create({
    collection: "media",
    overrideAccess: true,
    filePath: path.resolve("public/brand/logo-mark-grey.png"),
    data: {
      internalLabel: prefix,
      alt: "Validation fixture",
      source: "licensed",
      modelReleaseStatus: "not-applicable",
      usageRightsStatus: "pending",
      publicVisibility: false,
      isRealClientProof: false,
      replacementPriority: "none",
    },
  })
  created.push({ collection: "media", id: media.id })
  for (const [field, data] of [
    [
      "usageRightsStatus",
      { publicVisibility: true, usageRightsStatus: "pending" },
    ],
    [
      "rightsExpiry",
      {
        publicVisibility: true,
        usageRightsStatus: "approved",
        rightsExpiry: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    ["source", { source: "licensed", isRealClientProof: true }],
  ] as const) {
    const response = await handleEndpoints({
      config,
      request: new Request(`http://localhost/api/media/${media.id}`, {
        method: "PATCH",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(data),
      }),
    })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.errors[0].data.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: field, message: expect.any(String) }),
      ])
    )
  }
  const unchanged = await payload.findByID({
    collection: "media",
    id: media.id,
    overrideAccess: true,
  })
  expect(unchanged.publicVisibility).toBe(false)
  expect(unchanged.isRealClientProof).toBe(false)
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
