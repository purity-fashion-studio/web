import {
  getPaymentRouteMetadata,
  renderPaymentRoute,
  type PaymentRouteProps,
} from "@/features/booking/payment-route"

type Props = PaymentRouteProps

export function generateMetadata({ params, searchParams }: Props) {
  return getPaymentRouteMetadata({
    params,
    searchParams,
    path: "/payment/cancel",
  })
}

export default function PaymentCancelPage(props: Props) {
  return renderPaymentRoute({ ...props, status: "cancel" })
}
