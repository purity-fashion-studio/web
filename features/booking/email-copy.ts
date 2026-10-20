import type { Locale } from "@/i18n/routing"

const requestReceived = {
  uk: {
    subject: "PURITY — запит отримано",
    text: "Ваш запит {id} збережено. Команда окремо підтвердить формат, час і наступний крок. Це повідомлення не є підтвердженням запису.",
  },
  ru: {
    subject: "PURITY — запрос получен",
    text: "Ваш запрос {id} сохранён. Команда отдельно подтвердит формат, время и следующий шаг. Это сообщение не является подтверждением записи.",
  },
  en: {
    subject: "PURITY — request received",
    text: "Your request {id} has been saved. The team will confirm the format, timing, and next step separately. This message does not confirm an appointment.",
  },
} satisfies Record<Locale, { subject: string; text: string }>

const paymentMessages = {
  paid: {
    uk: "Оплату за замовлення {id} підтверджено платіжним провайдером. Команда окремо підтвердить наступний крок.",
    ru: "Оплата заказа {id} подтверждена платёжным провайдером. Команда отдельно подтвердит следующий шаг.",
    en: "Payment for order {id} was confirmed by the payment provider. The team will confirm the next step separately.",
  },
  failed: {
    uk: "Оплату за замовлення {id} не підтверджено. Не повторюйте платіж без перевірки статусу; за потреби зверніться до PURITY.",
    ru: "Оплата заказа {id} не подтверждена. Не повторяйте платёж без проверки статуса; при необходимости свяжитесь с PURITY.",
    en: "Payment for order {id} was not confirmed. Do not retry without checking its status; contact PURITY if needed.",
  },
  refunded: {
    uk: "Повернення за замовленням {id} зафіксовано платіжним провайдером. Термін зарахування залежить від банку.",
    ru: "Возврат по заказу {id} зафиксирован платёжным провайдером. Срок зачисления зависит от банка.",
    en: "A refund for order {id} was recorded by the payment provider. Bank settlement timing may vary.",
  },
} satisfies Record<"paid" | "failed" | "refunded", Record<Locale, string>>

function withID(value: string, id: string) {
  return value.replace("{id}", id)
}

export function requestReceivedEmail(locale: Locale, id: string) {
  const copy = requestReceived[locale]
  return { subject: copy.subject, text: withID(copy.text, id) }
}

export function paymentStatusEmail(
  locale: Locale,
  status: "paid" | "failed" | "refunded",
  id: string
) {
  const subjects = {
    paid: {
      uk: "Оплату підтверджено",
      ru: "Оплата подтверждена",
      en: "Payment confirmed",
    },
    failed: {
      uk: "Оплата потребує уваги",
      ru: "Оплата требует внимания",
      en: "Payment needs attention",
    },
    refunded: {
      uk: "Повернення зафіксовано",
      ru: "Возврат зафиксирован",
      en: "Refund recorded",
    },
  } as const
  return {
    subject: `PURITY — ${subjects[status][locale]}`,
    text: withID(paymentMessages[status][locale], id),
  }
}
