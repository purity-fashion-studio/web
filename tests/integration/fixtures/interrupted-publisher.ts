import { getPayload } from "payload"

import config from "../../../payload.config"
import { GET } from "../../../app/api/jobs/process-notifications/route"
import {
  assertIsolatedDatabaseIdentity,
  assertIsolatedTestDatabase,
} from "../../../scripts/test-database"

assertIsolatedTestDatabase()
process.env.PAYLOAD_IMPORTING = "true"
const payload = await getPayload({ config })
const identity = await payload.db.pool.query(
  "SELECT current_database() AS name, host(inet_server_addr()) AS address"
)
assertIsolatedDatabaseIdentity(identity.rows[0])
const task = payload.config.jobs.tasks?.find(
  (item) => item.slug === "schedulePublish"
)
if (!task) throw new Error("Missing scheduled publication task")
// Pause only after the real framework persists its claim. The test kills this
// process, so no finally/unlock or in-memory cleanup can repair the job store.
task.handler = async () => {
  process.stdout.write("PUBLICATION_CLAIMED\n")
  await new Promise(() => setInterval(() => {}, 1000))
  return { output: {} }
}
await GET(
  new Request("http://localhost/api/jobs/process-notifications", {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
)
throw new Error("Interrupted worker unexpectedly completed")
