import * as React from "react"
import { expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  result: { status: "success", checkoutUnavailable: false },
  submit: vi.fn(),
}))
vi.mock("react", async (original) => ({
  ...(await original<typeof React>()),
  useState: (initial: unknown) => [
    typeof initial === "object"
      ? state.result
      : typeof initial === "function"
        ? (initial as () => unknown)()
        : initial,
    vi.fn(),
  ],
  useEffect: vi.fn(),
  useRef: () => ({ current: null }),
  useTransition: () => [false, vi.fn()],
}))
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    formState: { errors: {} },
    register: () => ({}),
    handleSubmit: state.submit,
    reset: vi.fn(),
  }),
  useWatch: ({ name }: { name: string }) =>
    ({
      serviceSlug: "atelier-service",
      format: "studio",
      contactMethod: "email",
      budgetCurrency: "EUR",
    })[name],
  Controller: () => null,
}))
vi.mock("@/features/booking/actions", () => ({ submitBooking: vi.fn() }))
import { BookingForm } from "@/features/booking/booking-form"
import type { BookingPublicCopy } from "@/features/booking/public-copy"
function find(
  node: React.ReactNode,
  testid: string
):
  | React.ReactElement<{ disabled?: boolean; children?: React.ReactNode }>
  | undefined {
  if (
    !React.isValidElement<{
      children?: React.ReactNode
      "data-testid"?: string
    }>(node)
  )
    return
  if (node.props["data-testid"] === testid) return node
  return React.Children.toArray(node.props.children)
    .map((child) => find(child, testid))
    .find(Boolean)
}
it("disables a completed enquiry but keeps checkout-unavailable retries enabled", () => {
  vi.stubGlobal("React", React)
  const props = {
    locale: "en" as const,
    initialServiceSlug: "atelier-service",
    services: [{ slug: "atelier-service", title: "Atelier" }],
    copy: {
      labels: {},
      placeholders: {},
      inquiryTypes: {},
      formats: {},
      contactMethods: {},
      currencies: {},
      providers: {},
    } as unknown as BookingPublicCopy,
  }
  try {
    expect(find(BookingForm(props), "booking-submit")?.props.disabled).toBe(
      true
    )
    expect(find(BookingForm(props), "booking-new-request")).toBeDefined()
    state.result.checkoutUnavailable = true
    expect(find(BookingForm(props), "booking-submit")?.props.disabled).toBe(
      false
    )
  } finally {
    vi.unstubAllGlobals()
  }
})
