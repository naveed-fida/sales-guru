import type { Prisma, Product } from '@prisma/client'
import * as Yup from 'yup'
export type OrderDetails = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>

export const saleSchema = Yup.object().shape({
  customerId: Yup.number().required('Customer is required'),
  products: Yup.array()
    .of(
      Yup.object().shape({
        productId: Yup.number().required('Product is required'),
        quantity: Yup.number()
          .min(1, 'Quantity cannot be less than 1')
          .required('Quantity is required'),
        price: Yup.number().required(),
      }),
    )
    .required('Products are required')
    .min(1, 'Order must have at least one product'),
  discount: Yup.number().min(0, 'Discount cannot be less than 0').required('Discount is required'),
  amountReceived: Yup.number()
    .min(0, 'Amount received cannot be less than 0')
    .required('Amount received is required'),
})

export const getOrderTotal = (order: OrderDetails) => {
  const total = order.orderProducts.reduce((acc, curr) => {
    return acc + curr.quantity * curr.product.price
  }, 0)
  return total
}

export const getOrderCurrentTotal = (
  products: { productId: number | undefined; quantity: number }[],
  allProducts: Product[],
) => {
  return products.reduce((sum, next) => {
    const product = allProducts.find((p) => p.id === Number(next.productId))
    if (!product) return sum
    return sum + product.price * next.quantity
  }, 0)
}
