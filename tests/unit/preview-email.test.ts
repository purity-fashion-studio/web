import { afterEach, expect, it, vi } from "vitest"

vi.mock("@payloadcms/db-postgres", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@payloadcms/db-postgres")>()
  return { ...actual, postgresAdapter: vi.fn(actual.postgresAdapter) }
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.resetModules()
})

const developmentOrigin = "https://purity-fashion-studio.vercel.app"

function previewEnvironment() {
  const values = {
    NODE_ENV: "production",
    VERCEL_ENV: "production",
    SITE_MODE: "preview",
    EMAIL_MODE: "disabled",
    PAYLOAD_ENABLED: "true",
    PAYLOAD_SECRET: "unit-test-payload-secret-at-least-32-characters",
    PREVIEW_SECRET: "unit-test-preview-secret-at-least-32-characters",
    DATABASE_URL: "postgresql://localhost:5432/purity_test",
    NEXT_PUBLIC_SITE_URL: developmentOrigin,
    NEXT_PUBLIC_PAYLOAD_URL: developmentOrigin,
    NEXT_PUBLIC_INDEXING_ENABLED: "false",
    NEXT_PUBLIC_ANALYTICS_ENABLED: "false",
    NEXT_PUBLIC_GA4_ID: undefined,
    RESEND_API_KEY: undefined,
    EMAIL_FROM: undefined,
    EMAIL_OVERRIDE_RECIPIENT: undefined,
    RESEND_DOMAIN_VERIFIED: "false",
    CRON_SECRET: "unit-test-cron-secret-at-least-32-characters",
    // Configuration fixtures only: these tests never connect to storage or DB.
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_unittest_notarealcredential",
    PAYLOAD_DISABLE_BLOB_STORAGE: "false",
    PAYMENT_MODE: "test",
    PAYMENT_MERCHANT_READY: "false",
    STRIPE_SECRET_KEY: undefined,
    STRIPE_WEBHOOK_SECRET: undefined,
    LIQPAY_PUBLIC_KEY: undefined,
    LIQPAY_PRIVATE_KEY: undefined,
  }
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value)
}

it.each([undefined, "development", "preview", "production"])(
  "allows explicit safe preview in deployment environment %s without email credentials or sender",
  async (vercelEnv) => {
    previewEnvironment()
    vi.stubEnv("VERCEL_ENV", vercelEnv)
    const { env } = await import("@/lib/env")
    expect(env.SITE_MODE).toBe("preview")
    expect(env.EMAIL_MODE).toBe("disabled")
    expect(env.EMAIL_FROM).toBeUndefined()
    expect(env.RESEND_API_KEY).toBeUndefined()
    expect(env.RESEND_DOMAIN_VERIFIED).toBe("false")
  }
)

it.each([
  "http://localhost:3000",
  "http://127.0.0.1:3102",
  "http://[::1]:3000",
])("allows a local production build of explicit preview at %s", async (url) => {
  previewEnvironment()
  vi.stubEnv("VERCEL_ENV", undefined)
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", url)
  vi.stubEnv("NEXT_PUBLIC_PAYLOAD_URL", url)
  await expect(import("@/lib/env")).resolves.toHaveProperty(
    "env.SITE_MODE",
    "preview"
  )
})

it.each([
  [{ PAYMENT_MODE: "live" }, /PAYMENT_MODE=test/],
  [
    { NEXT_PUBLIC_INDEXING_ENABLED: "true" },
    /NEXT_PUBLIC_INDEXING_ENABLED=false/,
  ],
  [
    { NEXT_PUBLIC_ANALYTICS_ENABLED: "true" },
    /NEXT_PUBLIC_ANALYTICS_ENABLED=false/,
  ],
  [{ EMAIL_MODE: "resend" }, /requires EMAIL_MODE=disabled/],
  [{ EMAIL_MODE: "offline" }, /requires EMAIL_MODE=disabled/],
  [{ EMAIL_MODE: undefined }, /requires EMAIL_MODE=disabled/],
  [
    { SITE_MODE: "production" },
    /EMAIL_MODE=disabled requires SITE_MODE=preview/,
  ],
  [{ SITE_MODE: undefined }, /EMAIL_MODE=disabled requires SITE_MODE=preview/],
  [{ SITE_MODE: "development" }, /Invalid option/],
  [{ BLOB_READ_WRITE_TOKEN: undefined }, /Missing Vercel Blob media variables/],
  [
    { CRON_SECRET: undefined },
    /Missing Payload runtime variables: CRON_SECRET/,
  ],
] as const)(
  "rejects unsafe or incomplete preview configuration: %j",
  async (override, error) => {
    previewEnvironment()
    for (const [key, value] of Object.entries(override)) vi.stubEnv(key, value)
    await expect(import("@/lib/env")).rejects.toThrow(error)
  }
)

it.each(["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_PAYLOAD_URL"])(
  "rejects an arbitrary public origin for %s even with Payload disabled",
  async (key) => {
    previewEnvironment()
    vi.stubEnv("PAYLOAD_ENABLED", "false")
    vi.stubEnv(key, "https://purity-fashion-studio.ua")
    await expect(import("@/lib/env")).rejects.toThrow(key)
  }
)

it("disabled delivery rejects without network requests or logging private content", async () => {
  previewEnvironment()
  const fetchSpy = vi.spyOn(globalThis, "fetch")
  const logSpy = vi.spyOn(console, "log")
  const { sendOutboxEmail } = await import("@/features/booking/resend-email")
  await expect(
    sendOutboxEmail({
      deduplicationKey: "preview-only",
      recipient: "private@purity.invalid",
      subject: "Private subject",
      text: "Private message",
    })
  ).rejects.toThrow("Email delivery disabled in preview mode")
  expect(fetchSpy).not.toHaveBeenCalled()
  expect(logSpy).not.toHaveBeenCalled()
})

it("preview outbox persists pending messages and never attempts batch delivery", async () => {
  previewEnvironment()
  const { enqueueNotifications, deliverNotificationBatch } =
    await import("@/features/booking/notification-outbox")
  const find = vi.fn(async () => ({ docs: [] }))
  const create = vi.fn(async () => ({}))
  const update = vi.fn()
  const payload = { find, create, update } as never
  await enqueueNotifications({
    payload,
    messages: [
      {
        deduplicationKey: "preview-pending",
        recipient: "private@purity.invalid",
        recipientType: "client",
        subject: "Private subject",
        text: "Private message",
      },
    ],
  })
  expect(create).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: "pending", attempts: 0 }),
    })
  )
  find.mockClear()
  expect(await deliverNotificationBatch(payload)).toEqual({
    checked: 0,
    sent: 0,
    retryable: 0,
    dead: 0,
    disabled: true,
  })
  expect(find).not.toHaveBeenCalled()
  expect(update).not.toHaveBeenCalled()
})

it("Payload preview adapter has no sender and explicitly refuses delivery", async () => {
  previewEnvironment()
  const fetchSpy = vi.spyOn(globalThis, "fetch")
  const { default: config } = await import("@/payload.config")
  const resolved = await config
  const factory = resolved.email
  if (typeof factory !== "function") throw new Error("Missing email adapter")
  const adapter = factory({ payload: {} as never })
  expect(adapter.name).toBe("preview-no-send")
  expect(adapter.defaultFromAddress).toBe("")
  await expect(
    adapter.sendEmail({
      to: "private@purity.invalid",
      subject: "Private subject",
      text: "Private message",
    })
  ).rejects.toThrow("Email delivery disabled in preview mode")
  expect(fetchSpy).not.toHaveBeenCalled()
})

it("default commercial mode still requires Resend credentials", async () => {
  previewEnvironment()
  vi.stubEnv("SITE_MODE", undefined)
  vi.stubEnv("EMAIL_MODE", "resend")
  await expect(import("@/lib/env")).rejects.toThrow(
    "Missing Payload runtime variables: RESEND_API_KEY, EMAIL_FROM"
  )
})

it("standard Vercel preview still requires a recipient override for Resend", async () => {
  previewEnvironment()
  vi.stubEnv("SITE_MODE", undefined)
  vi.stubEnv("VERCEL_ENV", "preview")
  vi.stubEnv("EMAIL_MODE", "resend")
  vi.stubEnv("RESEND_API_KEY", "unit-test-only-resend-key")
  vi.stubEnv("EMAIL_FROM", "unit-test@purity.invalid")
  await expect(import("@/lib/env")).rejects.toThrow(
    "EMAIL_OVERRIDE_RECIPIENT is required in Vercel Preview"
  )
  vi.stubEnv("EMAIL_OVERRIDE_RECIPIENT", "unit-test@purity.invalid")
  vi.resetModules()
  await expect(import("@/lib/env")).resolves.toHaveProperty(
    "env.SITE_MODE",
    "production"
  )
})

it("commercial Vercel production still requires verified Resend", async () => {
  previewEnvironment()
  vi.stubEnv("SITE_MODE", "production")
  vi.stubEnv("EMAIL_MODE", "resend")
  vi.stubEnv("RESEND_API_KEY", "unit-test-only-resend-key")
  vi.stubEnv("EMAIL_FROM", "unit-test@purity.invalid")
  await expect(import("@/lib/env")).rejects.toThrow(
    "RESEND_DOMAIN_VERIFIED must be true in Production"
  )
})

it("accepts blank optional example values without weakening required credentials", async () => {
  previewEnvironment()
  vi.stubEnv("NEXT_PUBLIC_GA4_ID", "")
  vi.stubEnv("EMAIL_OVERRIDE_RECIPIENT", "")
  vi.stubEnv("EMAIL_FROM", "")
  const { env } = await import("@/lib/env")
  expect(env.NEXT_PUBLIC_GA4_ID).toBeUndefined()
  expect(env.EMAIL_OVERRIDE_RECIPIENT).toBeUndefined()
  expect(env.EMAIL_FROM).toBeUndefined()
})

it("never enables development schema push on a deployed runtime", async () => {
  previewEnvironment()
  vi.stubEnv("NODE_ENV", "development")
  vi.stubEnv("VERCEL_ENV", "preview")
  const { postgresAdapter } = await import("@payloadcms/db-postgres")
  vi.mocked(postgresAdapter).mockClear()
  await import("@/payload.config")
  expect(postgresAdapter).toHaveBeenCalledWith(
    expect.objectContaining({ push: false })
  )
})
