import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  refresh: vi.fn(),
  renderPreview: vi.fn<
    (props: { serverURL: string; refresh: () => void }) => null
  >(() => null),
}))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: state.refresh }),
}))
vi.mock("@payloadcms/live-preview-react", () => ({
  RefreshRouteOnSave: state.renderPreview,
}))

import { LivePreviewRefresh } from "@/components/live-preview-refresh"

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})
it("wires saved drafts to the router using Payload's documented live-preview component", () => {
  vi.stubGlobal("React", React)
  renderToStaticMarkup(
    React.createElement(LivePreviewRefresh, {
      serverURL: "http://localhost:3000",
    })
  )
  const props = state.renderPreview.mock.calls[0]![0]
  expect(props.serverURL).toBe("http://localhost:3000")
  props.refresh()
  expect(state.refresh).toHaveBeenCalledOnce()
})

it.each([
  "https://payload.example.test/",
  "https://payload.example.test/console?section=pages#editor",
])("uses the CMS origin for document events from %s", (serverURL) => {
  vi.stubGlobal("React", React)
  renderToStaticMarkup(React.createElement(LivePreviewRefresh, { serverURL }))
  expect(state.renderPreview.mock.calls[0]![0].serverURL).toBe(
    "https://payload.example.test"
  )
})
