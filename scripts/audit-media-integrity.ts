import { list } from "@vercel/blob"
import { getPayload } from "payload"

import config from "@payload-config"

type MediaDoc = {
  id: string
  url?: string | null
  mimeType?: string | null
  filesize?: number | null
  sizes?: Record<
    string,
    { url?: string | null; filesize?: number | null; mimeType?: string | null }
  >
}

type MediaAsset = {
  id: string
  url: string
  mimeType?: string | null
  filesize?: number | null
}

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is required")

const payload = await getPayload({ config })
const media = await payload.find({
  collection: "media",
  depth: 0,
  limit: 10_000,
  overrideAccess: true,
  pagination: false,
  select: { id: true, url: true, mimeType: true, filesize: true, sizes: true },
})

const expected = new Map<string, MediaAsset>()
for (const doc of media.docs as MediaDoc[]) {
  const assets: MediaAsset[] = []
  if (doc.url) {
    assets.push({
      id: doc.id,
      url: doc.url,
      mimeType: doc.mimeType,
      filesize: doc.filesize,
    })
  }
  for (const size of Object.values(doc.sizes ?? {})) {
    if (size.url) {
      assets.push({
        id: doc.id,
        url: size.url,
        mimeType: size.mimeType ?? doc.mimeType,
        filesize: size.filesize,
      })
    }
  }
  for (const asset of assets) {
    expected.set(asset.url, asset)
  }
}

const assetName = (url: string) => {
  try {
    const pathname = new URL(url).pathname
    return decodeURIComponent(pathname.slice(pathname.lastIndexOf("/") + 1))
  } catch {
    return decodeURIComponent(url.split("?")[0].split("/").pop() ?? url)
  }
}

const errors: string[] = []
const verifyAsset = async ([url, asset]: [string, MediaAsset]) => {
  const assetErrors: string[] = []
  try {
    let response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    })
    let usedRangeFallback = false
    if (!response.ok) {
      response = await fetch(url, {
        headers: { Range: "bytes=0-0" },
        signal: AbortSignal.timeout(5000),
      })
      usedRangeFallback = true
    }
    if (!response.ok) {
      assetErrors.push(`${asset.id}: ${response.status} ${url}`)
      return assetErrors
    }
    const contentType = response.headers.get("content-type")?.split(";", 1)[0]
    if (asset.mimeType && contentType && contentType !== asset.mimeType) {
      assetErrors.push(`${asset.id}: mime ${contentType} != ${asset.mimeType}`)
    }
    const length = Number(response.headers.get("content-length"))
    if (
      !usedRangeFallback &&
      asset.filesize &&
      Number.isFinite(length) &&
      length !== asset.filesize
    ) {
      assetErrors.push(`${asset.id}: size ${length} != ${asset.filesize}`)
    }
    if (usedRangeFallback) await response.body?.cancel()
  } catch (error) {
    assetErrors.push(
      `${asset.id}: ${error instanceof Error ? error.message : "media check failed"} ${url}`
    )
  }
  return assetErrors
}

const entries = [...expected.entries()]
for (let index = 0; index < entries.length; index += 8) {
  const results = await Promise.all(
    entries.slice(index, index + 8).map(verifyAsset)
  )
  errors.push(...results.flat())
}

const blobURLs = new Set<string>()
let cursor: string | undefined
do {
  const page = await list({ token, cursor, limit: 1000 })
  page.blobs.forEach((blob) => blobURLs.add(blob.url))
  cursor = page.hasMore ? page.cursor : undefined
} while (cursor)

const dbNames = new Set([...expected.keys()].map(assetName))
const blobNames = new Set([...blobURLs].map(assetName))
const orphaned = [...blobNames].filter((name) => !dbNames.has(name))
const missing = [...dbNames].filter((name) => !blobNames.has(name))

if (orphaned.length) {
  errors.push(`orphaned Blob objects: ${orphaned.length}`)
  errors.push(`orphaned names: ${orphaned.join(", ")}`)
}
if (missing.length)
  errors.push(`DB media without Blob objects: ${missing.length}`)

if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
} else {
  console.log(
    `Media integrity ok: ${expected.size} assets, ${blobURLs.size} blobs.`
  )
  process.exit(0)
}
