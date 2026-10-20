import { afterEach, expect, it, vi } from "vitest"
import { localStageTimeout } from "../support/local-stage-timeout"

afterEach(() => vi.unstubAllEnvs())

it("retains the original stage deadline by default", () => {
  vi.stubEnv("PURITY_LOCAL_STAGE_TIMEOUT_MS", undefined)
  expect(localStageTimeout(180_000)).toBe(180_000)
})

it("allows an explicit longer budget only for isolated offline loopback execution", () => {
  vi.stubEnv("PURITY_LOCAL_STAGE_TIMEOUT_MS", "900000")
  vi.stubEnv("EMAIL_MODE", "offline")
  vi.stubEnv("PAYMENT_MODE", "test")
  vi.stubEnv("PLAYWRIGHT_BASE_URL", "http://127.0.0.1:3102")
  vi.stubEnv("VERCEL_ENV", undefined)
  expect(localStageTimeout(180_000)).toBe(900_000)
})

it.each(["1000", "NaN", "3600000", "900000.5"])(
  "rejects an unbounded, shortened, or malformed local deadline: %s",
  (value) => {
    vi.stubEnv("PURITY_LOCAL_STAGE_TIMEOUT_MS", value)
    vi.stubEnv("EMAIL_MODE", "offline")
    vi.stubEnv("PAYMENT_MODE", "test")
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "http://127.0.0.1:3102")
    vi.stubEnv("VERCEL_ENV", undefined)
    expect(() => localStageTimeout(180_000)).toThrow(/bounded/)
  }
)

it.each(["https://production.example", "http://localhost.evil.example:3102"])(
  "refuses a local deadline override on %s",
  (url) => {
    vi.stubEnv("PURITY_LOCAL_STAGE_TIMEOUT_MS", "900000")
    vi.stubEnv("EMAIL_MODE", "offline")
    vi.stubEnv("PAYMENT_MODE", "test")
    vi.stubEnv("PLAYWRIGHT_BASE_URL", url)
    expect(() => localStageTimeout(180_000)).toThrow(/isolated/)
  }
)
