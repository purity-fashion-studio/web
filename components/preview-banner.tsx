import { draftMode } from "next/headers"

import { Button } from "@/components/ui/button"
import { LivePreviewRefresh } from "@/components/live-preview-refresh"
import { getPayloadURL } from "@/lib/site-url"

const copy = {
  uk: { status: "Увімкнено preview чернетки", exit: "Вийти з preview" },
  ru: { status: "Включён preview черновика", exit: "Выйти из preview" },
  en: { status: "Draft preview is enabled", exit: "Exit preview" },
} as const

export async function PreviewBanner({ locale }: { locale: keyof typeof copy }) {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null

  return (
    <>
      <LivePreviewRefresh serverURL={getPayloadURL()} />
      <aside
        role="status"
        className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2 text-sm text-foreground"
      >
        <span>{copy[locale].status}</span>
        <form action="/api/exit-preview" method="post">
          <Button type="submit" size="sm" variant="outline">
            {copy[locale].exit}
          </Button>
        </form>
      </aside>
    </>
  )
}
