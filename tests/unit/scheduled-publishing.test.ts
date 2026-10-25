import { beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  run: vi.fn(async () => ({
    noJobsRemaining: true,
    remainingJobsFromQueried: 0,
  })),
  load: vi.fn(),
  update: vi.fn(async () => ({ docs: [], errors: [] })),
  count: vi.fn(async () => ({ totalDocs: 1 })),
  env: {
    PAYLOAD_ENABLED: "true",
    CRON_SECRET: "scheduler-unit-secret-at-least-32-characters",
  },
}))
vi.mock("@payload-config", () => ({ default: {} }))
vi.mock("payload", () => ({ getPayload: state.load }))
vi.mock("@/lib/env", () => ({ env: state.env }))
vi.mock("@/features/booking/notification-outbox", () => ({
  deliverNotificationBatch: async () => ({ dead: 0 }),
}))
vi.mock("@/features/booking/advisory-lock", () => ({
  tryWithAdvisoryLock: async (
    _p: unknown,
    _n: string,
    _k: string,
    run: () => Promise<unknown>
  ) => run(),
}))
import { GET } from "@/app/api/jobs/process-notifications/route"

beforeEach(() => {
  vi.clearAllMocks()
  state.load.mockResolvedValue({
    jobs: { run: state.run },
    update: state.update,
    count: state.count,
    logger: { error: vi.fn() },
  })
})
it("runs a bounded scheduled-publishing batch through the deployed authenticated cron trigger", async () => {
  const response = await GET(
    new Request(
      "http://localhost/api/jobs/process-notifications?limit=999999&allQueues=true",
      { headers: { authorization: `Bearer ${state.env.CRON_SECRET}` } }
    )
  )
  expect(response.status).toBe(200)
  expect(state.run).toHaveBeenCalledWith({
    queue: "default",
    limit: 1,
    sequential: true,
    overrideAccess: true,
    where: { taskSlug: { equals: "schedulePublish" } },
  })
  expect(response.headers.get("cache-control")).toBe("no-store")
})
it("claims at most ten jobs one at a time", async () => {
  state.run.mockResolvedValue({
    remainingJobsFromQueried: 0,
    jobStatus: { job: { status: "success" } },
  } as never)
  const response = await GET(
    new Request("http://localhost/api/jobs/process-notifications", {
      headers: { authorization: `Bearer ${state.env.CRON_SECRET}` },
    })
  )
  expect(state.run).toHaveBeenCalledTimes(10)
  expect((await response.json()).publishing).toMatchObject({
    processed: 10,
    remaining: 1,
  })
  state.run.mockResolvedValue({
    noJobsRemaining: true,
    remainingJobsFromQueried: 0,
  })
})
it("does not start another claim after a slow task exhausts the cooperative budget", async () => {
  let now = 0
  const clock = vi.spyOn(Date, "now").mockImplementation(() => now)
  state.run.mockImplementationOnce(async () => {
    now = 46000
    return {
      remainingJobsFromQueried: 0,
      jobStatus: { job: { status: "success" } },
    } as never
  })
  try {
    const response = await GET(
      new Request("http://localhost/api/jobs/process-notifications", {
        headers: { authorization: `Bearer ${state.env.CRON_SECRET}` },
      })
    )
    expect(state.run).toHaveBeenCalledTimes(1)
    expect((await response.json()).publishing).toMatchObject({
      processed: 1,
      remaining: 1,
      budgetExhausted: true,
    })
  } finally {
    clock.mockRestore()
  }
})
it("reports failed publishing without returning job inputs or stopping notifications", async () => {
  state.run.mockResolvedValueOnce({
    remainingJobsFromQueried: 0,
    jobStatus: { privateJobID: { status: "error-reached-max-retries" } },
  } as never)
  const response = await GET(
    new Request("http://localhost/api/jobs/process-notifications", {
      headers: { authorization: `Bearer ${state.env.CRON_SECRET}` },
    })
  )
  expect(response.status).toBe(503)
  expect(await response.json()).toMatchObject({
    dead: 0,
    publishing: { failed: 1 },
  })
})

it.each([
  undefined,
  "Bearer wrong",
  "scheduler-unit-secret-at-least-32-characters",
])(
  "rejects unauthorized scheduler access %# before loading Payload",
  async (authorization) => {
    const response = await GET(
      new Request("http://localhost/api/jobs/process-notifications", {
        headers: authorization ? { authorization } : {},
      })
    )
    expect(response.status).toBe(401)
    expect(state.load).not.toHaveBeenCalled()
    expect(state.run).not.toHaveBeenCalled()
  }
)
