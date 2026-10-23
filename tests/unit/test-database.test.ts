import { expect, it } from "vitest"

import {
  assertIsolatedDatabaseIdentity,
  assertIsolatedTestDatabase,
} from "@/scripts/test-database"

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

it.each(["127.0.0.1", "::1"])(
  "verifies the actual local database at %s",
  (address) => {
    expect(() =>
      assertIsolatedDatabaseIdentity(
        { name: "purity_test", address },
        environment
      )
    ).not.toThrow()
  }
)

const containerEnvironment = {
  ...environment,
  CI: "true",
  GITHUB_ACTIONS: "true",
  PURITY_TEST_DATABASE_SERVER_ADDRESS: "172.18.0.2",
}

it("matches a port-forwarded CI service against its explicitly discovered address", () => {
  expect(() =>
    assertIsolatedDatabaseIdentity(
      { name: "purity_test", address: "172.18.0.2" },
      containerEnvironment
    )
  ).not.toThrow()
})

it.each(["172.18.0.3", "127.0.0.1", "203.0.113.5"])(
  "rejects the wrong server even inside CI: %s",
  (address) => {
    expect(() =>
      assertIsolatedDatabaseIdentity(
        { name: "purity_test", address },
        containerEnvironment
      )
    ).toThrow(/server/)
  }
)

it.each([
  { CI: undefined },
  { GITHUB_ACTIONS: undefined },
  { PURITY_TEST_DATABASE_SERVER_ADDRESS: "203.0.113.5" },
  { PURITY_TEST_DATABASE_SERVER_ADDRESS: "172.18.999.2" },
])("rejects untrusted CI service identity overrides %#", (override) => {
  expect(() =>
    assertIsolatedDatabaseIdentity(
      { name: "purity_test", address: "172.18.0.2" },
      { ...containerEnvironment, ...override }
    )
  ).toThrow(/service/)
})

it("rejects missing or mismatched connected database identity", () => {
  expect(() => assertIsolatedDatabaseIdentity(undefined, environment)).toThrow()
  expect(() =>
    assertIsolatedDatabaseIdentity(
      { name: "business", address: "127.0.0.1" },
      environment
    )
  ).toThrow(/dedicated/)
})
