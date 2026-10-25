import { afterEach, beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  find: vi.fn(async () => ({ docs: [] })),
  count: vi.fn(async () => ({ totalDocs: 0 })),
  create: vi.fn(async () => ({ id: "fixture" })),
  update: vi.fn(async () => ({ id: "fixture" })),
  findGlobal: vi.fn(async () => ({})),
  updateGlobal: vi.fn<(args: unknown) => Promise<object>>(async () => ({})),
  getPayload: vi.fn(),
}))
vi.mock("payload", () => ({ getPayload: state.getPayload }))
vi.mock("@/payload.config", () => ({ default: {} }))
vi.mock("@/lib/site-url", () => ({ getSiteURL: () => "https://example.com" }))

it.each([
  {
    DATABASE_URL:
      "postgresql://fixture:fixture@127.0.0.1/db?host=remote.example",
    VERCEL_ENV: "",
  },
  {
    DATABASE_URL: "postgresql://fixture:fixture@remote.example/db",
    VERCEL_ENV: "",
  },
  {
    DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1/db",
    VERCEL_ENV: "production",
  },
  {
    DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1/db",
    VERCEL_ENV: "",
    BLOB_READ_WRITE_TOKEN: "remote-token",
  },
])(
  "rejects a mislabeled local restore before constructing Payload: %j",
  async (environment) => {
    vi.stubEnv("VERCEL_ENV", undefined)
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined)
    for (const [key, value] of Object.entries(environment))
      vi.stubEnv(key, value || undefined)
    vi.stubEnv("ALLOW_CMS_RESTORE", "true")
    process.argv = [
      "node",
      "import-seed.ts",
      "--restore",
      "--target=local",
      "--force",
      "--confirm=RESTORE_LOCAL",
    ]
    await expect(import("@/payload/seed/import-seed")).rejects.toThrow(
      "Local CMS"
    )
    expect(state.getPayload).not.toHaveBeenCalled()
  }
)

it("allows isolated loopback bootstrap", async () => {
  vi.stubEnv("VERCEL_ENV", undefined)
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined)
  vi.stubEnv("DATABASE_URL", "postgresql://fixture:fixture@127.0.0.1/fixture")
  process.argv = [
    "node",
    "import-seed.ts",
    "--bootstrap",
    "--target=local",
    "--draft",
    "--confirm=BOOTSTRAP_LOCAL",
  ]
  await import("@/payload/seed/import-seed")
  expect(state.getPayload).toHaveBeenCalledOnce()
  expect(process.exit).toHaveBeenCalledWith(0)
})

const originalArgv = process.argv
beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  state.getPayload.mockResolvedValue(state)
  vi.stubEnv("PAYLOAD_ENABLED", "true")
  vi.stubEnv("PAYLOAD_IMPORTING", undefined)
  vi.stubEnv("ALLOW_CMS_SEED", "true")
  vi.stubEnv("VERCEL_ENV", "production")
  vi.stubEnv("DATABASE_URL", "postgresql://fixture:fixture@db.example/test")
  vi.stubEnv("EXPECTED_DATABASE_HOST", "db.example")
  vi.stubEnv("EXPECTED_DATABASE_NAME", "test")
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_fixture_secret")
  vi.stubEnv("EXPECTED_BLOB_STORE_ID", "fixture")
  process.argv = [
    "node",
    "import-seed.ts",
    "--bootstrap",
    "--target=production",
    "--confirm=BOOTSTRAP_PRODUCTION",
    "--draft",
  ]
  vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
  vi.spyOn(console, "log").mockImplementation(() => {})
})
afterEach(() => {
  process.argv = originalArgv
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

it("initializes every localized global on an empty production bootstrap without overwrite permission", async () => {
  state.findGlobal.mockResolvedValue({})
  await import("@/payload/seed/import-seed")
  expect(process.exit).toHaveBeenCalledWith(0)
  for (const slug of ["home", "header", "footer", "site-settings"]) {
    for (const locale of ["uk", "ru", "en"]) {
      expect(state.updateGlobal).toHaveBeenCalledWith(
        expect.objectContaining({ slug, locale, data: expect.any(Object) })
      )
    }
  }
})
it("preserves existing production globals even if collections are empty", async () => {
  state.findGlobal.mockResolvedValue({
    updatedAt: "2026-01-01T00:00:00Z",
  } as never)
  await import("@/payload/seed/import-seed")
  expect(process.exit).toHaveBeenCalledWith(0)
  expect(
    state.updateGlobal.mock.calls.filter(([args]) =>
      [
        "home",
        "header",
        "footer",
        "site-settings",
        "booking-settings",
      ].includes((args as { slug: string }).slug)
    )
  ).toHaveLength(0)
})
