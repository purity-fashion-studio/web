import { afterEach, beforeAll, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

function localStorageEnvironment() {
  const values = {
    NODE_ENV: "production",
    VERCEL_ENV: undefined,
    SITE_MODE: "preview",
    EMAIL_MODE: "disabled",
    PAYLOAD_ENABLED: "true",
    PAYLOAD_SECRET: "local-test-payload-secret-at-least-32-characters",
    PREVIEW_SECRET: "local-test-preview-secret-at-least-32-characters",
    CRON_SECRET: "local-test-cron-secret-at-least-32-characters",
    DATABASE_URL: "postgresql://localhost:5432/purity_test",
    NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3102",
    NEXT_PUBLIC_PAYLOAD_URL: "http://127.0.0.1:3102",
    NEXT_PUBLIC_INDEXING_ENABLED: "false",
    NEXT_PUBLIC_ANALYTICS_ENABLED: "false",
    PAYLOAD_DISABLE_BLOB_STORAGE: "true",
    BLOB_READ_WRITE_TOKEN: undefined,
    PAYMENT_MODE: "test",
    EMAIL_FROM: undefined,
    EMAIL_OVERRIDE_RECIPIENT: undefined,
    RESEND_API_KEY: undefined,
  }
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value)
}

let localConfig: Awaited<(typeof import("@/payload.config"))["default"]>

beforeAll(async () => {
  localStorageEnvironment()
  const { default: config } = await import("@/payload.config")
  localConfig = await config
})

it("builds local Payload with actual filesystem media and no Blob credential", async () => {
  localStorageEnvironment()
  const { env } = await import("@/lib/env")
  expect(env.PAYLOAD_DISABLE_BLOB_STORAGE).toBe("true")
  expect(env.BLOB_READ_WRITE_TOKEN).toBeUndefined()
  const media = localConfig.collections.find(({ slug }) => slug === "media")
  expect(media?.upload).toMatchObject({ staticDir: ".payload-media" })
  expect(media?.upload).not.toMatchObject({ disableLocalStorage: true })
})

it("does not rewrite tracked generated contracts outside local development", () => {
  expect(localConfig.typescript.autoGenerate).toBe(false)
})

it.each(["development", "preview", "production"])(
  "rejects local media storage in Vercel %s",
  async (target) => {
    localStorageEnvironment()
    vi.stubEnv("VERCEL_ENV", target)
    await expect(import("@/lib/env")).rejects.toThrow(/Local media storage/)
  }
)

it.each([
  "https://purity-fashion-studio.vercel.app",
  "https://example.com",
  "http://localhost.evil.example",
  "http://user@localhost:3102",
  "ftp://127.0.0.1:3102",
])("rejects public or unsafe storage origin %s", async (url) => {
  localStorageEnvironment()
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", url)
  await expect(import("@/lib/env")).rejects.toThrow(/Local media storage/)
})

it("still requires real Blob credentials when filesystem media is not selected", async () => {
  localStorageEnvironment()
  vi.stubEnv("PAYLOAD_DISABLE_BLOB_STORAGE", "false")
  await expect(import("@/lib/env")).rejects.toThrow(/Missing Vercel Blob/)
})
