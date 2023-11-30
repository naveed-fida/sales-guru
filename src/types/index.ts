import { Prisma } from '@prisma/client'

export type Order = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>

export type Customer = Prisma.CustomerGetPayload<{
  include: { area: true }
}>

export type PaginationOpts = {
  skip?: number
  take?: number
}

export interface OrderInput {
  customerId: number
  billNumber: string | null
  createdAt: Date
  products: { productId: number; quantity: number; price: number }[]
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
  returned?: boolean
}

export interface GetExpensesOptions {
  skip?: number
  take?: number
  expensesPeriod?: { from: Date; to: Date }
}
