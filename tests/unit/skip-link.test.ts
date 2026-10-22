import { afterEach, beforeEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  cleanup: undefined as (() => void) | undefined,
  mutation: undefined as (() => void) | undefined,
}))
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useEffect: (setup: () => (() => void) | undefined) => {
    state.cleanup = setup()
  },
}))
import { SkipLink } from "@/components/skip-link"

const focus = vi.fn()
const findMain = vi.fn()
const observe = vi.fn()
const disconnect = vi.fn()
const addEventListener = vi.fn()
const removeEventListener = vi.fn()
const location = { hash: "" }

beforeEach(() => {
  vi.clearAllMocks()
  location.hash = ""
  findMain.mockReturnValue(null)
  vi.stubGlobal("window", { location, addEventListener, removeEventListener })
  vi.stubGlobal("document", { getElementById: findMain, body: {} })
  vi.stubGlobal(
    "MutationObserver",
    class {
      observe = observe
      disconnect = disconnect
      constructor(callback: () => void) {
        state.mutation = callback
      }
    }
  )
})
afterEach(() => {
  state.cleanup?.()
  state.cleanup = undefined
  state.mutation = undefined
  vi.unstubAllGlobals()
})

it("keeps the native skip destination without moving focus on ordinary loads", () => {
  const link = SkipLink({ label: "Skip to main content" })
  expect(link.props.href).toBe("#main-content")
  expect(focus).not.toHaveBeenCalled()
  expect(observe).not.toHaveBeenCalled()
})

it("focuses a main boundary that arrives after the skip link was activated", () => {
  location.hash = "#main-content"
  SkipLink({ label: "Skip" })
  expect(observe).toHaveBeenCalled()
  expect(focus).not.toHaveBeenCalled()
  findMain.mockReturnValue({ focus })
  state.mutation?.()
  expect(focus).toHaveBeenCalledOnce()
  expect(disconnect).toHaveBeenCalled()
})

it("focuses an existing main boundary and cleans up its hash listener", () => {
  location.hash = "#main-content"
  findMain.mockReturnValue({ focus })
  SkipLink({ label: "Skip" })
  expect(focus).toHaveBeenCalledOnce()
  expect(observe).not.toHaveBeenCalled()
  state.cleanup?.()
  expect(removeEventListener).toHaveBeenCalledWith(
    "hashchange",
    addEventListener.mock.calls[0][1]
  )
})

it("waits for streamed content when the link is activated after hydration", () => {
  SkipLink({ label: "Skip" })
  location.hash = "#main-content"
  addEventListener.mock.calls[0][1]()
  expect(observe).toHaveBeenCalled()
  findMain.mockReturnValue({ focus })
  state.mutation?.()
  expect(focus).toHaveBeenCalledOnce()
})
