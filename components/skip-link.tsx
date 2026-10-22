"use client"

import { useEffect } from "react"

export function SkipLink({ label }: { label: string }) {
  useEffect(() => {
    let observer: MutationObserver | undefined
    const focusMain = () => {
      if (window.location.hash !== "#main-content") {
        observer?.disconnect()
        return
      }
      const main = document.getElementById("main-content")
      if (main) {
        main.focus()
        if (document.activeElement === main) {
          observer?.disconnect()
          return
        }
      }
      // Streamed markup may exist inside a hidden staging container before
      // React reveals it. Presence alone does not prove focus succeeded.
      observer ??= new MutationObserver(focusMain)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["hidden", "inert", "style"],
      })
    }
    focusMain()
    window.addEventListener("hashchange", focusMain)
    return () => {
      observer?.disconnect()
      window.removeEventListener("hashchange", focusMain)
    }
  }, [])

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-3 focus:text-foreground focus:ring-2 focus:ring-ring"
    >
      {label}
    </a>
  )
}
