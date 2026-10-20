import { Badge } from "@medusajs/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="green" className={className}>
      <span className="font-semibold">Cash on Delivery</span> — Pay at doorstep
    </Badge>
  )
}

export default PaymentTest
