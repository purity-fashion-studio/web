import { expect, it } from "vitest"
import { StructuredData } from "@/components/structured-data"

it("preserves the real JSON-LD nonce while accounting for browser nonce-attribute hiding", () => {
  const element = StructuredData({
    data: { name: "</script>" },
    nonce: "request-nonce",
  })
  expect(element.props.nonce).toBe("request-nonce")
  expect(element.props.suppressHydrationWarning).toBe(true)
  expect(element.props.dangerouslySetInnerHTML.__html).toBe(
    '{"name":"\\u003c/script>"}'
  )
})
