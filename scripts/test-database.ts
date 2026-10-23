import { isIP } from "node:net"

export function assertIsolatedTestDatabase(
  environment: Record<string, string | undefined> = process.env,
  browserBaseURL?: string
) {
  const configured = environment.DATABASE_URL
  if (!configured || !environment.PURITY_TEST_DATABASE) {
    throw new Error(
      "Database tests require DATABASE_URL and the exact dedicated PURITY_TEST_DATABASE name."
    )
  }
  const url = new URL(configured)
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.search ||
    decodeURIComponent(url.pathname.slice(1)) !==
      environment.PURITY_TEST_DATABASE
  ) {
    throw new Error(
      "Database tests require the identified local database without connection-string overrides."
    )
  }
  if (
    !["disabled", "offline"].includes(environment.EMAIL_MODE ?? "") ||
    environment.PAYMENT_MODE !== "test" ||
    environment.PAYLOAD_DISABLE_BLOB_STORAGE !== "true"
  ) {
    throw new Error(
      "Database tests require disabled/offline email, test payments and local media storage."
    )
  }
  if (browserBaseURL !== undefined) {
    const browser = new URL(browserBaseURL)
    if (
      browser.protocol !== "http:" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(browser.hostname)
    ) {
      throw new Error("Mutating browser tests require a loopback HTTP target.")
    }
    if (environment.PLAYWRIGHT_BASE_URL !== undefined) {
      throw new Error(
        "Mutating browser tests require Playwright's managed local server."
      )
    }
  }
}

export function assertIsolatedDatabaseIdentity(
  identity: { name: string; address: string | null } | undefined,
  environment: Record<string, string | undefined> = process.env
) {
  assertIsolatedTestDatabase(environment)
  if (!identity || identity.name !== environment.PURITY_TEST_DATABASE) {
    throw new Error(
      "The connected database is not the dedicated test database."
    )
  }
  const serviceAddress = environment.PURITY_TEST_DATABASE_SERVER_ADDRESS
  if (serviceAddress) {
    const [first, second] = serviceAddress.split(".").map(Number)
    const privateIPv4 =
      isIP(serviceAddress) === 4 &&
      (first === 10 ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168))
    if (
      environment.CI !== "true" ||
      environment.GITHUB_ACTIONS !== "true" ||
      !privateIPv4
    ) {
      throw new Error(
        "A database service address requires the isolated CI service."
      )
    }
  }
  // A port-forwarded CI container reports its own address, not the client's
  // loopback endpoint. CI supplies the exact address from its service container.
  const allowed = serviceAddress ? [serviceAddress] : ["127.0.0.1", "::1"]
  if (!allowed.includes(identity.address ?? "")) {
    throw new Error(
      "The connected database server does not match the isolated target."
    )
  }
}
