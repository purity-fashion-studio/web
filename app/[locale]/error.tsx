"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"

type LocaleErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const copy = {
  uk: {
    title: "Сторінку не вдалося завантажити",
    description:
      "Спробуйте ще раз. Якщо проблема повторюється, поверніться пізніше.",
    retry: "Спробувати ще раз",
  },
  ru: {
    title: "Страницу не удалось загрузить",
    description:
      "Попробуйте ещё раз. Если проблема повторяется, вернитесь позже.",
    retry: "Попробовать ещё раз",
  },
  en: {
    title: "This page could not load",
    description: "Try again. If the problem continues, please come back later.",
    retry: "Try again",
  },
} as const

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const pathname = usePathname()

  useEffect(() => {
    console.error(error)
  }, [error])

  const locale = pathname?.split("/")[1] ?? "en"
  const text = copy[locale as keyof typeof copy] ?? copy.en

  return (
    <main
      id="main-content"
      tabIndex={-1}
      role="alert"
      className="mx-auto flex min-h-svh w-full max-w-screen-2xl items-center px-6 py-24 md:px-10"
    >
      <div className="grid max-w-xl gap-4">
        <h1 className="font-heading text-4xl leading-tight">{text.title}</h1>
        <p className="text-muted-foreground">{text.description}</p>
        <Button type="button" onClick={() => reset()} className="w-fit">
          {text.retry}
        </Button>
      </div>
    </main>
  )
}
