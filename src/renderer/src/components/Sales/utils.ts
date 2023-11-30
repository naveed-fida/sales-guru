import type { Prisma } from '@prisma/client'
import * as Yup from 'yup'
export type OrderDetails = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>

export const saleSchema = Yup.object().shape({
  customerId: Yup.number().required('Customer is required').moreThan(0, 'Customer is required'),
  createdAt: Yup.date().required('Date is required'),
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

export const getOrderCurrentTotal = (
  products: { productId: number | undefined; quantity: number; price: number }[],
) => {
  return products.reduce((sum, next) => {
    return sum + next.price * next.quantity
  }, 0)
}
