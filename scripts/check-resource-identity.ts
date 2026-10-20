import assert from "node:assert/strict"

import {
  assertTargetResourceIdentity,
  blobStoreID,
  databaseIdentity,
} from "./resource-identity"
import { migrations } from "../payload/migrations"
import { migrationHead } from "../payload/migration-head"
import { enforcePublishedGlobalRead } from "../payload/access"

const targetArg = process.argv.find((argument) =>
  argument.startsWith("--target=")
)
const target = targetArg?.split("=")[1]

const preview = {
  VERCEL_ENV: "preview",
  DATABASE_URL: "postgresql://user:secret@preview.db.example/purity_preview",
  EXPECTED_DATABASE_HOST: "preview.db.example",
  EXPECTED_DATABASE_NAME: "purity_preview",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_previewstore_secret",
  EXPECTED_BLOB_STORE_ID: "previewstore",
}

assert.deepEqual(databaseIdentity(preview.DATABASE_URL), {
  host: "preview.db.example",
  name: "purity_preview",
})
assert.equal(blobStoreID(preview.BLOB_READ_WRITE_TOKEN), "previewstore")
assert.doesNotThrow(() => assertTargetResourceIdentity("preview", preview))
assert.throws(() =>
  assertTargetResourceIdentity("preview", {
    ...preview,
    DATABASE_URL: "postgresql://user:secret@production.db.example/purity",
  })
)
assert.equal(migrations.at(-1)?.name, migrationHead)
assert.deepEqual(
  await enforcePublishedGlobalRead({
    args: { draft: true },
    operation: "read",
    req: { user: null },
  } as never),
  { draft: false }
)
assert.deepEqual(
  await enforcePublishedGlobalRead({
    args: {},
    operation: "read",
    req: { user: null },
  } as never),
  { draft: false }
)
assert.deepEqual(
  await enforcePublishedGlobalRead({
    args: { draft: true },
    operation: "read",
    req: { user: { active: false, roles: ["editor"] } },
  } as never),
  { draft: false }
)
assert.deepEqual(
  await enforcePublishedGlobalRead({
    args: { draft: true },
    operation: "read",
    req: { user: { active: true, roles: ["editor"] } },
  } as never),
  { draft: true }
)
assert.throws(() =>
  assertTargetResourceIdentity("preview", {
    ...preview,
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_productionstore_secret",
  })
)
assert.throws(() =>
  assertTargetResourceIdentity("preview", { ...preview, VERCEL_ENV: undefined })
)

if (target) {
  if (target !== "preview" && target !== "production") {
    throw new Error("Resource identity target must be preview or production.")
  }
  assertTargetResourceIdentity(target)
  console.log(`Current ${target} resource identity ok.`)
}

console.log("Resource identity guards ok.")
