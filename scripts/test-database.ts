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
