import { afterEach, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

function localEnvironment() {
  vi.stubEnv("NODE_ENV", "test")
  vi.stubEnv("SITE_MODE", "production")
  vi.stubEnv("VERCEL_ENV", undefined)
  vi.stubEnv("EMAIL_MODE", "offline")
  vi.stubEnv("PAYLOAD_ENABLED", "true")
  vi.stubEnv("PAYLOAD_SECRET", "local-test-secret-with-at-least-32-characters")
  vi.stubEnv(
    "PREVIEW_SECRET",
    "local-preview-secret-with-at-least-32-characters"
  )
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/purity_test")
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://127.0.0.1:3102")
  vi.stubEnv("NEXT_PUBLIC_PAYLOAD_URL", "http://127.0.0.1:3102")
  vi.stubEnv("RESEND_API_KEY", undefined)
  vi.stubEnv("CRON_SECRET", "local-cron-test-secret-at-least-32-characters")
  vi.stubEnv("EMAIL_FROM", "local@purity.invalid")
  vi.stubEnv("PAYMENT_MODE", "test")
  vi.stubEnv("EMAIL_OVERRIDE_RECIPIENT", undefined)
  vi.stubEnv("RESEND_DOMAIN_VERIFIED", "false")
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined)
}

it("allows explicit offline local CMS without a Resend credential", async () => {
  localEnvironment()
  const { env } = await import("@/lib/env")
  expect(env).toHaveProperty("EMAIL_MODE", "offline")
  expect(env.RESEND_API_KEY).toBeUndefined()
})

it.each([
  { NODE_ENV: "production" },
  { VERCEL_ENV: "preview" },
  { VERCEL_ENV: "production" },
  { VERCEL_ENV: "development" },
  { NEXT_PUBLIC_SITE_URL: "https://preview.example" },
  { NEXT_PUBLIC_PAYLOAD_URL: "https://preview.example" },
  { PAYMENT_MODE: "live" },
  { NEXT_PUBLIC_SITE_URL: "http://localhost.evil.example" },
  { NEXT_PUBLIC_SITE_URL: "http://user@localhost:3102" },
  { NEXT_PUBLIC_PAYLOAD_URL: "ftp://127.0.0.1:3102" },
  { NODE_ENV: "production", PAYLOAD_ENABLED: "false" },
])("rejects offline email outside local dev/test: %j", async (override) => {
  localEnvironment()
  for (const [key, value] of Object.entries(override)) vi.stubEnv(key, value)
  await expect(import("@/lib/env")).rejects.toThrow(/Offline email/)
})

it("offline booking delivery rejects without logging content or using fetch", async () => {
  localEnvironment()
  const fetchSpy = vi.spyOn(globalThis, "fetch")
  const logSpy = vi.spyOn(console, "log")
  try {
    const { sendOutboxEmail } = await import("@/features/booking/resend-email")
    await expect(
      sendOutboxEmail({
        deduplicationKey: "local-only",
        recipient: "sensitive@purity.invalid",
        subject: "Sensitive subject",
        text: "Private message",
      })
    ).rejects.toThrow("Email delivery disabled in offline mode")
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(logSpy).not.toHaveBeenCalled()
  } finally {
    vi.restoreAllMocks()
  }
})

it("offline outbox draining leaves persisted messages pending without reads or attempts", async () => {
  localEnvironment()
  const { deliverNotificationBatch } =
    await import("@/features/booking/notification-outbox")
  const find = vi.fn(async () => ({ docs: [] }))
  const result = await deliverNotificationBatch({ find } as never)
  expect(result).toEqual({
    checked: 0,
    sent: 0,
    retryable: 0,
    dead: 0,
    disabled: true,
  })
  expect(find).not.toHaveBeenCalled()
})

it("Payload offline adapter refuses delivery and exposes no provider message ID", async () => {
  localEnvironment()
  const { default: config } = await import("@/payload.config")
  const resolved = await config
  const factory = resolved.email
  expect(typeof factory).toBe("function")
  if (typeof factory !== "function") throw new Error("Missing email adapter")
  const adapter = factory({ payload: {} as never })
  expect(adapter.name).toBe("offline-no-send")
  await expect(
    adapter.sendEmail({
      to: "private@purity.invalid",
      subject: "Private",
      text: "Private",
    })
  ).rejects.toThrow("Email delivery disabled in offline mode")
})
