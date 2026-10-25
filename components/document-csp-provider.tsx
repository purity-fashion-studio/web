"use client"

import { CSPProvider } from "@base-ui/react/csp-provider"
import type { ReactNode } from "react"

// A client layout can remount during a soft locale transition. Key by the
// browser Document, not the React instance; a true reload gets a fresh nonce.
const documentNonces = new WeakMap<Document, string | undefined>()

export function DocumentCSPProvider({
  children,
  nonce,
}: {
  children: ReactNode
  nonce?: string
}) {
  // Next's nonce-bearing bootstrap scripts belong to the HTML document, not
  // later RSC requests. Read the nonce property: browsers hide the attribute.
  let documentNonce = nonce
  if (typeof document !== "undefined") {
    if (!documentNonces.has(document)) {
      documentNonces.set(
        document,
        document.querySelector<HTMLScriptElement>("script[src][nonce]")
          ?.nonce || nonce
      )
    }
    documentNonce = documentNonces.get(document)
  }

  return <CSPProvider nonce={documentNonce}>{children}</CSPProvider>
}
