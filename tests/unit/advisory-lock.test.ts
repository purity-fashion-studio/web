import { describe, expect, it } from "vitest"

import { withAdvisoryLock } from "@/features/booking/advisory-lock"

describe("advisory lock scopes", () => {
  it("keeps a reentrant lock held until the outer scope finishes", async () => {
    const queries: string[] = []
    let releases = 0
    const client = {
      query: async (query: string) => {
        queries.push(query)
        return query.includes("pg_try_advisory_lock")
          ? { rows: [{ acquired: true }] }
          : { rows: [] }
      },
      release: () => {
        releases += 1
      },
    }
    const payload = {
      db: { pool: { connect: async () => client } },
    } as never
    const events: string[] = []

    await withAdvisoryLock(payload, "test", "same-key", async () => {
      events.push("outer:start")
      await withAdvisoryLock(payload, "test", "same-key", async () => {
        events.push("inner")
      })
      events.push("outer:end")
    })

    expect(events).toEqual(["outer:start", "inner", "outer:end"])
    expect(
      queries.filter((query) => query.includes("pg_advisory_unlock"))
    ).toHaveLength(1)
    expect(releases).toBe(1)
  })

  it("reserves pool capacity for work performed inside lock scopes", async () => {
    let activeClients = 0
    let peakClients = 0
    const pool = {
      options: { max: 4 },
      connect: async () => {
        activeClients += 1
        peakClients = Math.max(peakClients, activeClients)
        return {
          query: async (query: string) =>
            query.includes("pg_try_advisory_lock")
              ? { rows: [{ acquired: true }] }
              : { rows: [] },
          release: () => {
            activeClients -= 1
          },
        }
      },
    }
    const payload = { db: { pool } } as never

    await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        withAdvisoryLock(payload, "test", String(index), async () => {
          await new Promise((resolve) => setTimeout(resolve, 5))
        })
      )
    )

    expect(peakClients).toBeLessThanOrEqual(2)
    expect(activeClients).toBe(0)
  })
})
