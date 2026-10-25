import { timingSafeEqual } from "node:crypto"

import { env } from "@/lib/env"

export function isAuthorizedCron(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return false
  const supplied = authorization.slice(7)
  if (!env.CRON_SECRET || !supplied) return false
  const expectedBuffer = Buffer.from(env.CRON_SECRET)
  const suppliedBuffer = Buffer.from(supplied)
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  )
}
