import { del, list } from "@vercel/blob"

import { assertTargetResourceIdentity } from "./resource-identity"

assertTargetResourceIdentity("preview")

if (!process.argv.includes("--confirm=RESET_PREVIEW")) {
  throw new Error("Confirm Preview Blob deletion with --confirm=RESET_PREVIEW.")
}

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  throw new Error("BLOB_READ_WRITE_TOKEN is required to reset Preview Blob.")
}

let cursor: string | undefined
let deleted = 0

do {
  const page = await list({ cursor, limit: 1000, token })
  if (page.blobs.length) {
    await del(
      page.blobs.map((blob) => blob.url),
      { token }
    )
    deleted += page.blobs.length
  }
  cursor = page.hasMore ? page.cursor : undefined
} while (cursor)

console.log(`Deleted ${deleted} Preview Blob objects.`)
