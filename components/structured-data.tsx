type StructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>
  nonce?: string
}

export function StructuredData({ data, nonce }: StructuredDataProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c")
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // Browsers hide nonce content attributes (but retain script.nonce).
      // React otherwise compares the hidden empty attribute with the real
      // request nonce. Scope the escape hatch to this inert JSON-LD node only;
      // keep the nonce and escaped server-rendered JSON intact.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
