import { Prisma } from '@prisma/client'

export type Order = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>

export type Customer = Prisma.CustomerGetPayload<{
  include: { area: true }
}>

export interface OrderInput {
  customerId?: number
  products: { productId?: number; quantity: number; price: number }[]
  discount: number
  amountReceived: number
}

export interface CustomerFormInput {
  name: string
  phone?: string | null
  area?: number | null
}

export interface GetOrdersOptions {
  skip?: number
  take?: number
  salesPeriod?: { from: Date; to: Date }
  customerId?: number
  status?: 'due' | 'paid' | 'all'
}

export interface GetExpensesOptions {
  skip?: number
  take?: number
  expensesPeriod?: { from: Date; to: Date }
}