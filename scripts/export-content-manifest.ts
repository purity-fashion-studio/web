import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { locales } from "../i18n/routing"
import {
  getManifestRoutes,
  purityContentManifest,
} from "../payload/seed/manifest"

const manifestPath = "payload/seed/manifests/purity-content-manifest.v1.json"
const absoluteManifestPath = resolve(manifestPath)

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`
  }
  return JSON.stringify(value)
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex")
}

function recordID(record: unknown): string {
  if (record && typeof record === "object" && "id" in record) {
    return String(record.id)
  }

  return sha256(canonical(record)).slice(0, 12)
}

function verifyManifest() {
  const issues: string[] = []

  if (!existsSync(absoluteManifestPath)) {
    issues.push(`Missing versioned migration manifest: ${absoluteManifestPath}`)
  }
  if (purityContentManifest.version !== 1) {
    issues.push(
      `Unsupported content manifest version: ${purityContentManifest.version}`
    )
  }
  if (
    JSON.stringify(purityContentManifest.locales) !== JSON.stringify(locales)
  ) {
    issues.push("Manifest locales must remain uk, ru, en without fallback")
  }

  for (const locale of locales) {
    const routes = getManifestRoutes(locale)
    const routeKeys = new Set<string>()

    if (!routes.length) {
      issues.push(`Manifest contains no routes for ${locale}`)
    }

    for (const route of routes) {
      if (!route.href.startsWith(`/${locale}`)) {
        issues.push(`Manifest route does not preserve ${locale}: ${route.href}`)
      }

      const key = `${route.kind}:${route.href}`
      if (route.kind !== "navigation" && routeKeys.has(key)) {
        issues.push(`Manifest duplicates content route: ${key}`)
      }
      routeKeys.add(key)
    }
  }

  for (const collection of Object.keys(purityContentManifest.source) as Array<
    keyof typeof purityContentManifest.source
  >) {
    const records = purityContentManifest.source[collection] as unknown[]
    const checksums = purityContentManifest.checksums.records[
      collection
    ] as Array<{
      id: string
      checksum: string
    }>

    if (!checksums) {
      issues.push(`Manifest lacks record checksums for ${collection}`)
      continue
    }
    if (checksums.length !== records.length) {
      issues.push(`Manifest record checksum count drifted for ${collection}`)
      continue
    }

    const expectedByID = new Map(
      checksums.map((entry) => [entry.id, entry.checksum])
    )
    for (const record of records) {
      const id = recordID(record)
      const expected = expectedByID.get(id)
      const actual = sha256(canonical(record))

      if (!expected) {
        issues.push(`Manifest checksum lacks ${collection}:${id}`)
      } else if (expected !== actual) {
        issues.push(`Manifest checksum drifted for ${collection}:${id}`)
      }
    }
  }

  const mediaByID = new Map(
    purityContentManifest.checksums.media.map((entry) => [entry.id, entry])
  )
  for (const asset of purityContentManifest.source["media-assets"]) {
    const expected = mediaByID.get(asset.id)
    const sourceFile = asset.sourceFile ?? asset.src ?? null
    const filePath = asset.src
      ? resolve("public", asset.src.replace(/^\//, ""))
      : asset.sourceFile
        ? resolve(asset.sourceFile)
        : undefined
    const checksum =
      filePath && existsSync(filePath) ? sha256(readFileSync(filePath)) : null

    if (!expected) {
      issues.push(`Manifest media checksum lacks ${asset.id}`)
      continue
    }
    if (expected.sourceFile !== sourceFile) {
      issues.push(`Manifest media source drifted for ${asset.id}`)
    }
    if (expected.checksum !== checksum) {
      issues.push(`Manifest media checksum drifted for ${asset.id}`)
    }
  }

  if (mediaByID.size !== purityContentManifest.source["media-assets"].length) {
    issues.push("Manifest has an unexpected media checksum entry")
  }

  const migrationCopyChecksum = sha256(
    canonical(purityContentManifest.migrationCopy)
  )
  if (purityContentManifest.checksums.migrationCopy !== migrationCopyChecksum) {
    issues.push("Manifest migration copy checksum drifted")
  }

  if (issues.length) {
    throw new Error(`Content manifest invalid:\n${issues.join("\n")}`)
  }
}

if (process.argv.includes("--out")) {
  throw new Error(
    "The migration manifest is immutable. Update it only through a reviewed migration change."
  )
}

if (process.argv.includes("--stdout")) {
  process.stdout.write(readFileSync(absoluteManifestPath, "utf8"))
} else {
  verifyManifest()
  console.log(
    `Verified immutable content manifest v1 at ${absoluteManifestPath}`
  )
}
