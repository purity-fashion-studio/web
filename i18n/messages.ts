import en from "@/messages/en.json"
import ru from "@/messages/ru.json"
import uk from "@/messages/uk.json"

import type { Locale } from "./routing"

const messages: Record<Locale, typeof en> = { en, ru, uk }

export function getInterfaceCopy(locale: Locale) {
  return messages[locale]
}
