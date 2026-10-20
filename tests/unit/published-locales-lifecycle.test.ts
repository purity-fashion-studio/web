import { afterEach, beforeEach, expect, it, vi } from "vitest"

const { destroy, end, find, config } = vi.hoisted(() => ({
  destroy: vi.fn(async () => {}),
  end: vi.fn(async () => {}),
  find: vi.fn(async () => ({ docs: [] as Array<Record<string, unknown>> })),
  config: {
    collections: [] as Array<{
      slug: string
      fields: Array<{ name: string; localized: boolean; required: boolean }>
    }>,
    globals: [],
  },
}))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("payload", () => ({
  getPayload: async () => ({ config, db: { pool: { end } }, destroy, find }),
}))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  config.collections = []
  find.mockResolvedValue({ docs: [] })
  end.mockResolvedValue(undefined)
  vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
})
afterEach(() => vi.restoreAllMocks())

it("published-locales CLI closes both Payload and the PostgreSQL pool", async () => {
  await import("../../scripts/check-published-locales")
  expect(destroy).toHaveBeenCalledOnce()
  expect(end).toHaveBeenCalledOnce()
  expect(destroy.mock.invocationCallOrder[0]).toBeLessThan(
    end.mock.invocationCallOrder[0]!
  )
})

it("published-locales CLI closes the pool when a collection query fails", async () => {
  config.collections = [{ slug: "directions", fields: [] }]
  find.mockRejectedValueOnce(new Error("locale query failed"))
  await expect(import("../../scripts/check-published-locales")).rejects.toThrow(
    "locale query failed"
  )
  expect(destroy).toHaveBeenCalledOnce()
  expect(end).toHaveBeenCalledOnce()
  expect(process.exit).not.toHaveBeenCalled()
})

it("CLI preserves integrity failure as exit code 1", async () => {
  const oldExitCode = process.exitCode
  const errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
  try {
    config.collections = [
      {
        slug: "directions",
        fields: [{ name: "title", localized: true, required: true }],
      },
    ]
    find.mockResolvedValueOnce({
      docs: [{ id: "missing-locales", title: { uk: "Valid" } }],
    })
    await import("../../scripts/check-published-locales")
    expect(process.exit).toHaveBeenCalledWith(1)
    expect(errorLog).toHaveBeenCalled()
  } finally {
    process.exitCode = oldExitCode
  }
})

it("CLI propagates destroy errors without a success exit", async () => {
  destroy.mockRejectedValueOnce(new Error("destroy failed"))
  await expect(import("../../scripts/check-published-locales")).rejects.toThrow(
    "destroy failed"
  )
  expect(end).toHaveBeenCalledOnce()
  expect(process.exit).not.toHaveBeenCalled()
})

it("CLI exits normally after scan cleanup even when the startup client keeps pool.end pending", async () => {
  end.mockImplementationOnce(() => new Promise<void>(() => {}))
  await import("../../scripts/check-published-locales")
  expect(destroy).toHaveBeenCalledOnce()
  expect(end).toHaveBeenCalledOnce()
  expect(process.exit).toHaveBeenCalledWith(0)
})
