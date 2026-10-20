import { getLocale } from "next-intl/server"

const loadingLabels = {
  uk: "Завантаження вмісту",
  ru: "Загрузка содержимого",
  en: "Loading content",
} as const

export default async function LocaleLoading() {
  const locale = await getLocale()
  const label =
    loadingLabels[locale as keyof typeof loadingLabels] ?? loadingLabels.en

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex min-h-svh w-full max-w-screen-2xl items-center px-6 py-24 md:px-10"
    >
      <div className="grid w-full max-w-3xl gap-6" aria-hidden="true">
        <div className="h-3 w-32 rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-16 w-full max-w-2xl rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-4 w-full max-w-xl rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-11 w-40 rounded bg-muted motion-safe:animate-pulse" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}
