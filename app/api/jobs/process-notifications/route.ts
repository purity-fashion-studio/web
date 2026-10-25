import { getPayload } from "payload"

import config from "@payload-config"
import { runScheduledPublishing } from "@/features/booking/scheduled-publishing"
import { isAuthorizedCron } from "@/features/booking/cron-auth"
import { deliverNotificationBatch } from "@/features/booking/notification-outbox"
import { correlationID } from "@/features/booking/operation-log"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  const requestCorrelationID = correlationID(request)
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (env.PAYLOAD_ENABLED !== "true") {
    return Response.json({ error: "CMS unavailable" }, { status: 503 })
  }

  const payload = await getPayload({ config })
  const publishing = await runScheduledPublishing(payload)
  const failedPublications = publishing?.failed ?? 0
  if (failedPublications) {
    payload.logger.error({
      correlationID: requestCorrelationID,
      operation: "scheduled-publishing",
      code: "scheduled-publishing-failed",
      count: failedPublications,
    })
  }
  const counts = await deliverNotificationBatch(payload)
  if (counts.dead > 0) {
    payload.logger.error({
      correlationID: requestCorrelationID,
      operation: "notification-outbox",
      code: "notification-delivery-exhausted",
      count: counts.dead,
    })
  }
  return Response.json(
    {
      ...counts,
      publishing: publishing ?? "busy",
    },
    {
      status: failedPublications ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    }
  )
}

export const GET = POST
