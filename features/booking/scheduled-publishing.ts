import type { Payload, Where } from "payload"

import { tryWithAdvisoryLock } from "./advisory-lock"

const taskFilter: Where = {
  and: [
    { queue: { equals: "default" } },
    { taskSlug: { equals: "schedulePublish" } },
    { completedAt: { exists: false } },
    { hasError: { not_equals: true } },
  ],
}

export async function runScheduledPublishing(payload: Payload) {
  // Leave headroom for notifications and response serialization. This is a
  // cooperative claim budget, not a cancellation of an already-running task.
  const deadline = Date.now() + 45_000
  return tryWithAdvisoryLock(
    payload,
    "payload-jobs",
    "schedule-publish",
    async () => {
      // This lock is the only permitted runner. Owning it proves the prior worker
      // has exited; reclaim unfinished claims without stealing from a live pass.
      const recovered = await payload.update({
        collection: "payload-jobs",
        overrideAccess: true,
        limit: 10,
        where: { and: [taskFilter, { processing: { equals: true } }] },
        data: { processing: false },
      })
      if (recovered.errors.length)
        throw new Error("Scheduled publication recovery failed")
      let processed = 0
      let failed = 0
      while (processed < 10 && Date.now() < deadline) {
        const result = await payload.jobs.run({
          queue: "default",
          limit: 1,
          sequential: true,
          overrideAccess: true,
          where: { taskSlug: { equals: "schedulePublish" } },
        })
        const statuses = Object.values(result.jobStatus ?? {})
        processed += statuses.length
        failed += statuses.filter((job) => job.status !== "success").length
        if (!statuses.length || failed) break
      }
      const remaining = await payload.count({
        collection: "payload-jobs",
        overrideAccess: true,
        where: {
          and: [
            taskFilter,
            {
              or: [
                { waitUntil: { exists: false } },
                { waitUntil: { less_than: new Date().toISOString() } },
              ],
            },
          ],
        },
      })
      return {
        processed,
        failed,
        recovered: recovered.docs.length,
        remaining: remaining.totalDocs,
        budgetExhausted: Date.now() >= deadline && remaining.totalDocs > 0,
      }
    }
  )
}
