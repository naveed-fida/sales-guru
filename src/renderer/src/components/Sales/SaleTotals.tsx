import type { Product } from '@prisma/client'
import { getOrderCurrentTotal } from './utils'

interface SaleTotalsProps {
  products: { productId: number | undefined; quantity: number }[]
  discount: number
  amountReceived: number
  allProducts: Product[]
}

export default function SaleTotals({
  products,
  allProducts,
  discount,
  amountReceived,
}: SaleTotalsProps) {
  const total = getOrderCurrentTotal(products, allProducts)

  return (
    <div>
      <p>
        <span className="font-medium text-base">Total:</span> {total}
      </p>
      <p>
        <span className="font-medium text-base">Total After Discount:</span>{' '}
        {total - Number(discount)}
      </p>
      <p>
        <span className="font-medium text-base">Amount Due:</span>{' '}
        {total - Number(discount) - Number(amountReceived)}
      </p>
    </div>
  )
}
