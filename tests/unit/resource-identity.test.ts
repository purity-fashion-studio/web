import { describe, expect, it } from "vitest"

import {
  assertTargetResourceIdentity,
  blobStoreID,
  databaseIdentity,
} from "@/scripts/resource-identity"

const preview = {
  VERCEL_ENV: "preview",
  DATABASE_URL: "postgresql://user:secret@preview.db.example/purity_preview",
  EXPECTED_DATABASE_HOST: "preview.db.example",
  EXPECTED_DATABASE_NAME: "purity_preview",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_previewstore_secret",
  EXPECTED_BLOB_STORE_ID: "previewstore",
}

describe("resource identity guard", () => {
  it.each([
    "host=other.example",
    "h%6fst=other.example",
    "hostaddr=203.0.113.2",
    "port=6543",
  ])("rejects connection-string identity overrides: %s", (query) => {
    expect(() =>
      assertTargetResourceIdentity("preview", {
        ...preview,
        DATABASE_URL: `${preview.DATABASE_URL}?${query}`,
      })
    ).toThrow("identity overrides")
  })
  it.each([
    "socket://preview.db.example/var/run/postgresql?db=other_database",
    "socket://preview.db.example/%2Fvar%2Frun%2Fpostgresql?db=other_database",
    "https://preview.db.example/purity_preview",
  ])("rejects non-PostgreSQL remote schemes: %s", (url) => {
    expect(() => databaseIdentity(url)).toThrow("PostgreSQL")
  })
  it("preserves ordinary remote TLS options", () => {
    expect(() =>
      assertTargetResourceIdentity("preview", {
        ...preview,
        DATABASE_URL: `${preview.DATABASE_URL}?sslmode=require&channel_binding=require`,
      })
    ).not.toThrow()
  })
  it("normalizes database and Blob identities", () => {
    expect(databaseIdentity(preview.DATABASE_URL)).toEqual({
      host: "preview.db.example",
      name: "purity_preview",
    })
    expect(blobStoreID(preview.BLOB_READ_WRITE_TOKEN)).toBe("previewstore")
    expect(() => assertTargetResourceIdentity("preview", preview)).not.toThrow()
  })

  it("fails closed on a mismatched database or target", () => {
    expect(() =>
      assertTargetResourceIdentity("preview", {
        ...preview,
        DATABASE_URL: "postgresql://user:secret@production.db.example/purity",
      })
    ).toThrow()
    expect(() => assertTargetResourceIdentity("production", preview)).toThrow()
  })
})
