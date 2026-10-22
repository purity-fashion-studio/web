import { expect, it } from "vitest"

import { assertIsolatedTestDatabase } from "@/scripts/test-database"

const environment = {
  DATABASE_URL: "postgresql://test:local@127.0.0.1:5432/purity_test",
  PURITY_TEST_DATABASE: "purity_test",
  EMAIL_MODE: "disabled",
  PAYMENT_MODE: "test",
  PAYLOAD_DISABLE_BLOB_STORAGE: "true",
}
it("accepts only an explicitly identified isolated local test destination", () => {
  expect(() => assertIsolatedTestDatabase(environment)).not.toThrow()
})
it.each([
  { DATABASE_URL: "postgresql://test:local@remote.example/purity_test" },
  {
    DATABASE_URL:
      "postgresql://test:local@127.0.0.1/purity_test?host=remote.example",
  },
  { DATABASE_URL: "postgresql://test:local@127.0.0.1/business" },
  { PURITY_TEST_DATABASE: undefined },
  { EMAIL_MODE: "resend" },
  { PAYMENT_MODE: "live" },
  { PAYLOAD_DISABLE_BLOB_STORAGE: "false" },
])("rejects unsafe test environment %#", (override) => {
  expect(() =>
    assertIsolatedTestDatabase({ ...environment, ...override })
  ).toThrow()
})

it("rejects a remote browser target even when the local database is isolated", () => {
  expect(() =>
    assertIsolatedTestDatabase(environment, "https://preview.example.test")
  ).toThrow(/loopback/)
})

it("rejects external-server reuse for mutating browser tests", () => {
  expect(() =>
    assertIsolatedTestDatabase(
      { ...environment, PLAYWRIGHT_BASE_URL: "http://localhost:3000" },
      "http://localhost:3000"
    )
  ).toThrow(/managed/)
})

it("accepts the managed loopback browser with the isolated database", () => {
  expect(() =>
    assertIsolatedTestDatabase(environment, "http://localhost:3000")
  ).not.toThrow()
})

it("serializes browser files that temporarily create and remove CMS owners", async () => {
  const { default: configuration } = await import("../../playwright.config")
  expect(configuration.workers).toBe(1)
})
