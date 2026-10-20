import { AsyncLocalStorage } from "node:async_hooks"

import type { Payload } from "payload"

const lockPrefix = "purity"
const lockWaitTimeoutMs = 15_000
const lockPollIntervalMs = 50

type AdvisoryClient = {
  query: (
    text: string,
    values?: readonly unknown[]
  ) => Promise<{ rows: Array<Record<string, unknown>> }>
  release: () => void
}

type LockContext = {
  client: AdvisoryClient
  held: Map<string, number>
}

type PermitWaiter = {
  resolve: (release: (() => void) | null) => void
  timer: ReturnType<typeof setTimeout>
}

type PermitPool = {
  available: number
  waiters: PermitWaiter[]
}

const contextStorage = new AsyncLocalStorage<LockContext>()
const permitPools = new WeakMap<Payload, PermitPool>()

export class AdvisoryLockTimeoutError extends Error {
  constructor(namespace: string, key: string) {
    super(`Timed out acquiring advisory lock for ${namespace}:${key}.`)
    this.name = "AdvisoryLockTimeoutError"
  }
}

function lockID(namespace: string, key: string) {
  return [lockPrefix, namespace, key].join(":")
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function lockContextLimit(payload: Payload) {
  const pool = payload.db.pool as { options?: { max?: number } }
  const configuredMax = pool.options?.max ?? 10
  // A session-level advisory lock owns one pool connection while Payload may
  // need another for its transaction. Reserving at least half the pool for
  // application queries prevents lock waiters from starving the lock holder.
  return Math.max(1, Math.floor(configuredMax / 2))
}

function permitPool(payload: Payload) {
  const existing = permitPools.get(payload)
  if (existing) return existing
  const created: PermitPool = {
    available: lockContextLimit(payload),
    waiters: [],
  }
  permitPools.set(payload, created)
  return created
}

function permitRelease(pool: PermitPool) {
  const waiter = pool.waiters.shift()
  if (waiter) {
    clearTimeout(waiter.timer)
    waiter.resolve(() => permitRelease(pool))
    return
  }
  pool.available += 1
}

async function acquirePermit(payload: Payload, wait: boolean) {
  const pool = permitPool(payload)
  if (pool.available > 0) {
    pool.available -= 1
    return () => permitRelease(pool)
  }
  if (!wait) return null

  return new Promise<(() => void) | null>((resolve) => {
    const waiter: PermitWaiter = {
      resolve,
      timer: setTimeout(() => {
        const index = pool.waiters.indexOf(waiter)
        if (index >= 0) pool.waiters.splice(index, 1)
        resolve(null)
      }, lockWaitTimeoutMs),
    }
    pool.waiters.push(waiter)
  })
}

async function tryAcquire(client: AdvisoryClient, id: string, wait: boolean) {
  const deadline = Date.now() + lockWaitTimeoutMs

  while (true) {
    const result = await client.query(
      "SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired",
      [id]
    )
    if (result.rows[0]?.acquired === true) return true
    if (!wait || Date.now() >= deadline) return false
    await sleep(lockPollIntervalMs)
  }
}

async function unlock(client: AdvisoryClient, id: string) {
  await client.query("SELECT pg_advisory_unlock(hashtextextended($1, 0))", [id])
}

async function releaseResidualLocks(context: LockContext) {
  for (const [id, count] of context.held) {
    for (let index = 0; index < count; index += 1) {
      try {
        await unlock(context.client, id)
      } catch {
        // The connection is being discarded; there is no safe recovery path.
      }
    }
  }
  context.held.clear()
}

async function runWithContext<T>(
  context: LockContext,
  namespace: string,
  key: string,
  wait: boolean,
  operation: () => Promise<T>
): Promise<T | null> {
  const id = lockID(namespace, key)
  const heldCount = context.held.get(id) ?? 0
  const acquired = heldCount === 0

  if (acquired) {
    const lockAcquired = await tryAcquire(context.client, id, wait)
    if (!lockAcquired) return null
  }
  context.held.set(id, heldCount + 1)

  try {
    return await operation()
  } finally {
    const nextCount = (context.held.get(id) ?? 1) - 1
    // PostgreSQL session-level advisory locks are reference-counted only when
    // pg_advisory_lock is called again. Reentrant calls share one acquisition,
    // so an inner scope must not unlock the outer scope's lock.
    if (acquired) {
      await unlock(context.client, id)
      context.held.delete(id)
    } else if (nextCount === 0) context.held.delete(id)
    else context.held.set(id, nextCount)
  }
}

async function runWithNewContext<T>(
  payload: Payload,
  namespace: string,
  key: string,
  wait: boolean,
  operation: () => Promise<T>
): Promise<T | null> {
  const releasePermit = await acquirePermit(payload, wait)
  if (!releasePermit) return null
  let client: AdvisoryClient | undefined
  let context: LockContext | undefined

  try {
    client = (await payload.db.pool.connect()) as AdvisoryClient
    const createdContext: LockContext = { client, held: new Map() }
    context = createdContext
    return await contextStorage.run(createdContext, () =>
      runWithContext(createdContext, namespace, key, wait, operation)
    )
  } finally {
    if (context) await releaseResidualLocks(context)
    if (client) {
      client.release()
    }
    releasePermit()
  }
}

export async function withAdvisoryLock<T>(
  payload: Payload,
  namespace: string,
  key: string,
  operation: () => Promise<T>
): Promise<T> {
  const context = contextStorage.getStore()
  const result = context
    ? await runWithContext(context, namespace, key, true, operation)
    : await runWithNewContext(payload, namespace, key, true, operation)

  if (result === null) {
    throw new AdvisoryLockTimeoutError(namespace, key)
  }
  return result
}

export async function tryWithAdvisoryLock<T>(
  payload: Payload,
  namespace: string,
  key: string,
  operation: () => Promise<T>
): Promise<T | null> {
  const context = contextStorage.getStore()
  return context
    ? runWithContext(context, namespace, key, false, operation)
    : runWithNewContext(payload, namespace, key, false, operation)
}
