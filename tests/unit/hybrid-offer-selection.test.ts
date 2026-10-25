import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import type { ServiceOffer } from "@/content/public-api"

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
    items,
  }: {
    children: React.ReactNode
    value: string
    onValueChange: (value: string) => void
    items: { value: string; label: string }[]
  }) =>
    React.createElement(
      "select",
      {
        value,
        "aria-label": "Choice",
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange(event.target.value),
      },
      items.map((item) =>
        React.createElement(
          "option",
          { key: item.value, value: item.value },
          item.label
        )
      ),
      React.createElement("optgroup", { hidden: true }, children)
    ),
  SelectContent: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectItem: () => null,
}))
vi.mock("next/link", () => ({
  default: ({
    children,
    prefetch: _prefetch,
    ...props
  }: {
    children: React.ReactNode
    prefetch?: boolean
  }) => {
    void _prefetch
    return React.createElement("a", props, children)
  },
}))
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant: _v,
    size: _s,
    ...props
  }: {
    children: React.ReactNode
    variant?: string
    size?: string
  }) => {
    void _v
    void _s
    return React.createElement("button", props, children)
  },
  buttonVariants: () => "",
}))
import { ProductOfferSelection } from "@/features/cart/product-offer-selection"
import { ProductCartControls } from "@/features/cart/product-cart-controls"
vi.mock("@/content/public-api", () => ({
  getServiceBySlug: async () => ({
    slug: "atelier-service",
    routeSegment: "atelier-service",
    title: "Service",
    cta: { label: "Book" },
    outcomes: [],
    formats: [],
    process: [],
    faq: [],
    offers: [
      {
        id: "hybrid-offer",
        title: "Hybrid",
        format: "hybrid",
        pricingMode: "fixed",
        prices: [{ currency: "EUR", amount: 1000 }],
        checkoutMode: "inquiry",
        commercialStatus: "active",
      },
    ],
  }),
  getSiteSettings: async () => ({
    booking: {
      formats: { online: "Online", studio: "Studio", atelier: "Atelier" },
      labels: { format: "Format", budgetCurrency: "Currency" },
    },
  }),
}))

vi.mock("@/components/cms-site-shell", () => ({
  SiteHeader: () => null,
  SiteFooter: () => null,
}))
vi.mock("@/components/purity", () => ({
  EditorialHero: () => null,
  EditorialFaq: () => null,
  FeatureList: () => null,
}))
vi.mock("@/components/editorial-sections", () => ({
  EditorialSections: () => null,
}))
vi.mock("@/content/metadata", () => ({ getLocalizedMetadata: () => ({}) }))
import ServicePage from "@/app/[locale]/services/[slug]/page"

function offerControls(
  node: React.ReactNode
): React.ReactElement<{ allowedFormats: string[] }> | undefined {
  if (
    !React.isValidElement<{
      children?: React.ReactNode
      selection?: { offerId?: string }
    }>(node)
  )
    return
  if (node.type === ProductCartControls && node.props.selection?.offerId)
    return node as React.ReactElement<{ allowedFormats: string[] }>
  return React.Children.toArray(node.props.children)
    .map(offerControls)
    .find(Boolean)
}
it("also exposes compatible hybrid formats on the separate service offer controls", async () => {
  const wrapper = await ServicePage({
    params: Promise.resolve({ locale: "en", slug: "atelier-service" }),
  })
  const page = (wrapper.type as (props: unknown) => React.ReactElement)(
    wrapper.props
  )
  const controls = offerControls(page)
  expect(controls?.props).toMatchObject({
    bookingCTA: { label: "Book", serviceSlug: "atelier-service" },
  })
  expect(new Set(controls?.props.allowedFormats)).toEqual(
    new Set(["online", "studio", "atelier"])
  )
})

beforeEach(() => {
  vi.stubGlobal("React", React)
})
afterEach(() => vi.unstubAllGlobals())

it.each([
  ["hybrid", ["online", "studio", "atelier"]],
  ["online", ["online"]],
  ["in-person", ["studio"]],
  ["remote-atelier", ["atelier"]],
] as const)(
  "offers only compatible choices for %s",
  async (format, expected) => {
    const offer = {
      id: "offer",
      title: "Offer",
      format,
      prices: [],
    } as unknown as ServiceOffer
    const element = ProductOfferSelection({
      locale: "en",
      kind: "service",
      slug: "atelier-service",
      offer,
      priceLabels: { from: "From", custom: "Custom" },
    })
    const controls = React.Children.toArray(element.props.children).find(
      (node) => React.isValidElement(node) && node.type === ProductCartControls
    ) as React.ReactElement<{ allowedFormats: string[] }>
    expect(new Set(controls.props.allowedFormats)).toEqual(new Set(expected))
  }
)

it.each([
  [["online", "studio", "atelier"], true],
  [["studio"], false],
] as const)(
  "renders compatible format choices without unlocking fixed offers: %j",
  async (allowedFormats, selectable) => {
    const controls = await ProductCartControls({
      locale: "en",
      selection: {
        kind: "service",
        slug: "atelier-service",
        offerId: "offer",
        format: "studio",
        currency: "EUR",
      },
      allowedFormats,
    })
    const html = renderToStaticMarkup(controls)
    expect(html.includes('value="online"')).toBe(selectable)
    expect(html).toContain('data-testid="add-to-cart"')
  }
)
