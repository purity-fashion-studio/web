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
    path: "/payment/success",
  })
}

export default function PaymentSuccessPage(props: Props) {
  return renderPaymentRoute({ ...props, status: "success" })
}
