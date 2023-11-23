import { ElectronAPI } from '@electron-toolkit/preload'
import type { Prisma, Area } from '@prisma/client'
import type { Product, Expense } from '@prisma/client'
import type {
  Order,
  Customer,
  OrderInput,
  CustomerFormInput,
  GetOrdersOptions,
  GetExpensesOptions,
} from '../types'

interface API {
  getCustomers: () => Promise<Customer[]>
  saveCustomer: (data: CustomerFormInput) => Promise<Customer>
  updateCustomer: (id: int, data: CustomerFormInput) => Promise<Customer>
  deleteCustomer: (id: int) => Promise<Customer>
  getProducts: () => Promise<Product[]>
  saveProduct: (data: Prisma.ProductCreateInput) => Promise<Product>
  updateProduct: (id: int, data: Prisma.ProductUpdateInput) => Promise<Product>
  deleteProduct: (id: int) => Promise<Product>
  getOrders: (opts?: GetOrdersOptions) => Promise<{ orders: Order[]; count: number }>
  getSalesCount: () => Promise<number>
  createOrder: (data: OrderInput) => Promise<Order>
  updateOrder: (id: int, data: OrderInput) => Promise<Order>
  deleteOrder: (id: int) => Promise<Order>
  getAreas: () => Promise<Area[]>
  deleteArea: (id: number) => Promise<Area>
  saveArea: (data: Prisma.AreaCreateInput) => Promise<Area>
  getExpenses: (opts?: GetExpensesOptions) => Promise<{ expenses: Expense[]; count: number }>
  deleteExpense: (id: number) => Promise<Expense>
  saveExpense: (data: Prisma.ExpenseCreateInput) => Promise<Expense>
  getExpensesStats: (period: { from: Date; to: Date }) => Promise<{ total: number }>
  getSalesStats: (period: {
    from: Date
    to: Date
  }) => Promise<{ total: number; outstanding: number }>
  returnOrder: (id: number) => Promise<Order>
  reReturnOrder: (id: number) => Promise<Order>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
