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
    path: "/payment/failure",
  })
}

export default function PaymentFailurePage(props: Props) {
  return renderPaymentRoute({ ...props, status: "failure" })
}
