type Environment = Record<string, string | undefined>

export function databaseIdentity(connectionString: string) {
  const url = new URL(connectionString)
  return {
    host: url.hostname.toLowerCase(),
    name: decodeURIComponent(url.pathname.slice(1)),
  }
}

export function blobStoreID(token: string) {
  return token.split("_")[3] ?? ""
}

export function assertTargetResourceIdentity(
  target: "preview" | "production",
  environment: Environment = process.env
) {
  if (environment.VERCEL_ENV !== target) {
    throw new Error(`Resource operation requires VERCEL_ENV=${target}.`)
  }

  const databaseURL = environment.DATABASE_URL
  const expectedHost = environment.EXPECTED_DATABASE_HOST?.toLowerCase()
  const expectedName = environment.EXPECTED_DATABASE_NAME
  const blobToken = environment.BLOB_READ_WRITE_TOKEN
  const expectedStoreID = environment.EXPECTED_BLOB_STORE_ID

  if (!databaseURL || !expectedHost || !expectedName) {
    throw new Error("Expected database identity is not fully configured.")
  }
  if (!blobToken || !expectedStoreID) {
    throw new Error("Expected Blob store identity is not fully configured.")
  }

  const database = databaseIdentity(databaseURL)
  if (database.host !== expectedHost || database.name !== expectedName) {
    throw new Error(
      "Database identity does not match the selected environment."
    )
  }
  if (blobStoreID(blobToken) !== expectedStoreID) {
    throw new Error(
      "Blob store identity does not match the selected environment."
    )
  }
}
