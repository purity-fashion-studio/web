import { readFileSync } from "node:fs"
import { inflateSync } from "node:zlib"

type Bounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

const assets = {
  "public/brand/purity/wordmark-black.png": [2212, 1079],
  "public/brand/purity/wordmark-white.png": [2218, 1085],
  "public/brand/purity/lockup-black.png": [2245, 1103],
  "public/brand/purity/lockup-white.png": [2238, 1103],
  "public/brand/purity/mark-black.png": [487, 808],
  "public/brand/purity/mark-grey.png": [487, 808],
  "public/brand/purity/mark-white.png": [487, 808],
} as const

function inspectRgbaPng(path: string) {
  const png = readFileSync(path)
  const signature = png.subarray(0, 8).toString("hex")

  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${path}: expected a PNG signature`)
  }

  let offset = 8
  let width = 0
  let height = 0
  const idat: Buffer[] = []

  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.subarray(offset + 4, offset + 8).toString("ascii")
    const data = png.subarray(offset + 8, offset + 8 + length)
    offset += length + 12

    if (type === "IHDR") {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) {
        throw new Error(`${path}: expected an 8-bit, non-interlaced RGBA PNG`)
      }
    } else if (type === "IDAT") {
      idat.push(data)
    }
  }

  const bytesPerPixel = 4
  const stride = width * bytesPerPixel
  const encoded = inflateSync(Buffer.concat(idat))
  const rows: Buffer[] = []
  let cursor = 0

  for (let y = 0; y < height; y += 1) {
    const filter = encoded[cursor]
    const source = encoded.subarray(cursor + 1, cursor + 1 + stride)
    const row = Buffer.allocUnsafe(stride)
    const previous = rows[y - 1]
    cursor += stride + 1

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0
      const up = previous?.[x] ?? 0
      const upLeft =
        x >= bytesPerPixel ? (previous?.[x - bytesPerPixel] ?? 0) : 0
      const predictor = (() => {
        if (filter === 0) return 0
        if (filter === 1) return left
        if (filter === 2) return up
        if (filter === 3) return Math.floor((left + up) / 2)
        if (filter === 4) {
          const p = left + up - upLeft
          const pa = Math.abs(p - left)
          const pb = Math.abs(p - up)
          const pc = Math.abs(p - upLeft)
          return pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft
        }
        throw new Error(`${path}: unsupported PNG filter ${filter}`)
      })()
      row[x] = (source[x] + predictor) & 0xff
    }
    rows.push(row)
  }

  const bounds: Bounds = {
    minX: width,
    minY: height,
    maxX: -1,
    maxY: -1,
  }

  rows.forEach((row, y) => {
    for (let x = 0; x < width; x += 1) {
      if (row[x * bytesPerPixel + 3] === 0) continue
      bounds.minX = Math.min(bounds.minX, x)
      bounds.minY = Math.min(bounds.minY, y)
      bounds.maxX = Math.max(bounds.maxX, x)
      bounds.maxY = Math.max(bounds.maxY, y)
    }
  })

  return { width, height, bounds }
}

for (const [path, expectedSize] of Object.entries(assets)) {
  const { width, height, bounds } = inspectRgbaPng(path)
  const [expectedWidth, expectedHeight] = expectedSize

  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(
      `${path}: expected ${expectedWidth}x${expectedHeight}, received ${width}x${height}`
    )
  }
  if (bounds.minX !== 0 || bounds.maxX !== width - 1) {
    throw new Error(
      `${path}: horizontal alpha bounds ${bounds.minX}..${bounds.maxX} do not meet the canvas edges`
    )
  }
  if (bounds.minY < 0 || bounds.maxY < 0) {
    throw new Error(`${path}: no visible pixels found`)
  }
}

console.log(
  `Brand assets ok: ${Object.keys(assets).length} RGBA exports have canonical dimensions and flush horizontal alpha bounds`
)
