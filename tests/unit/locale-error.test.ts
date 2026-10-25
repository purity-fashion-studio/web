import * as React from "react"
import { afterEach, expect, it, vi } from "vitest"

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useEffect: () => {},
}))
vi.mock("next/navigation", () => ({ usePathname: () => "/uk/booking" }))
import LocaleError from "@/app/[locale]/error"
import { Button } from "@/components/ui/button"
afterEach(() => vi.unstubAllGlobals())
it("uses the framework server-data retry without replaying a stale boundary reset", () => {
  vi.stubGlobal("React", React)
  const retry = vi.fn()
  const reset = vi.fn()
  const page = LocaleError({
    error: new Error("transient fixture"),
    retry,
    reset,
  } as never)
  const content = page.props.children as React.ReactElement<{
    children: React.ReactNode
  }>
  const button = React.Children.toArray(content.props.children).find(
    (child) => React.isValidElement(child) && child.type === Button
  ) as React.ReactElement<{ onClick: () => void; children: string }>
  expect(button.props.children).toBe("Спробувати ще раз")
  button.props.onClick()
  expect(retry).toHaveBeenCalledOnce()
  expect(reset).not.toHaveBeenCalled()
})
