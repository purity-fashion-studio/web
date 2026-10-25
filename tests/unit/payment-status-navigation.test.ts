import * as React from "react"
import { beforeEach, expect, it, vi } from "vitest"
import { localizePath } from "@/i18n/routing"

const state = vi.hoisted(() => ({ verified: vi.fn() }))
vi.mock("@/features/booking/payment-status", () => ({
  getVerifiedPaymentStatus: state.verified,
}))
vi.mock("@/content/public-api", () => ({
  getPageBySlug: async () => ({
    title: "Receipt",
    summary: "State",
    cta: { label: "Book" },
  }),
  getSiteSettings: async () => ({
    booking: {
      providers: { stripe: "Stripe" },
      paymentStatus: {
        notProvided: "None",
        provider: "Provider",
        order: "Order",
      },
    },
  }),
}))
vi.mock("@/components/cms-site-shell", () => ({
  SiteHeader: () => null,
  SiteFooter: () => null,
}))
vi.mock("@/components/purity", () => ({ EditorialHero: () => null }))
vi.mock("@/components/editorial-sections", () => ({
  EditorialSections: () => null,
}))
import { PaymentStatusPage } from "@/features/booking/payment-status-page"
const order = "73b80da9-947f-40bc-a80d-07a91a76a8d7"
beforeEach(() => {
  vi.stubGlobal("React", React)
})

it.each(["success", "pending", "cancel"] as const)(
  "preserves verified %s context and the physical route when changing locale",
  async (status) => {
    state.verified.mockResolvedValue({
      status,
      orderReference: order,
      provider: "stripe",
    })
    const element = await PaymentStatusPage({
      locale: "en",
      status: "success",
      order,
      provider: "malicious&token=secret",
    })
    const children = React.Children.toArray(
      element.props.children
    ) as React.ReactElement<{ currentPath: string }>[]
    for (const shell of [children[0], children[2]]) {
      for (const locale of ["uk", "ru", "en"] as const) {
        const url = new URL(
          localizePath(locale, shell.props.currentPath),
          "http://localhost"
        )
        expect(url.pathname).toBe(`/${locale}/payment/success`)
        expect(url.searchParams.get("order")).toBe(order)
        expect([...url.searchParams.keys()]).toEqual(["order"])
      }
    }
  }
)
it("does not propagate arbitrary unverified receipt query values", async () => {
  state.verified.mockResolvedValue({ status: "pending" })
  const element = await PaymentStatusPage({
    locale: "en",
    status: "success",
    order: "bad&token=secret",
    provider: "bad",
  })
  const children = React.Children.toArray(
    element.props.children
  ) as React.ReactElement<{ currentPath: string }>[]
  expect(children[0].props.currentPath).toBe("/payment/success")
})
