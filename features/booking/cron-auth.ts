import { timingSafeEqual } from "node:crypto"

import { env } from "@/lib/env"

export function isAuthorizedCron(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "")
  if (!env.CRON_SECRET || !supplied) return false
  const expectedBuffer = Buffer.from(env.CRON_SECRET)
  const suppliedBuffer = Buffer.from(supplied)
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  )
}
