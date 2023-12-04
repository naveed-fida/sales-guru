import { ElectronAPI } from '@electron-toolkit/preload'
import type { Prisma, Area } from '../generated/client'
import type { Product, Expense } from '../generated/client'
import type {
  Order,
  Customer,
  OrderInput,
  CustomerFormInput,
  GetOrdersOptions,
  GetExpensesOptions,
  PaginationOpts,
  InventoryRecordInput,
} from '../types'

interface API {
  getCustomers: (
    opts?: PaginationOpts & { query?: string },
  ) => Promise<{ customers: Customer[]; count: number }>
  saveCustomer: (data: CustomerFormInput) => Promise<Customer>
  updateCustomer: (id: int, data: CustomerFormInput) => Promise<Customer>
  deleteCustomer: (id: int) => Promise<Customer>
  getProducts: (opts?: PaginationOpts) => Promise<{ products: Product[]; count: number }>
  saveProduct: (data: Prisma.ProductCreateInput) => Promise<Product>
  updateProduct: (id: int, data: Prisma.ProductUpdateInput) => Promise<Product>
  deleteProduct: (id: int) => Promise<Product>
  getOrders: (opts?: GetOrdersOptions) => Promise<{ orders: Order[]; count: number }>
  getSalesCount: () => Promise<number>
  createOrder: (data: OrderInput) => Promise<Order>
  updateOrder: (id: int, data: OrderInput) => Promise<Order>
  deleteOrder: (id: int) => Promise<Order>
  getAreas: (opts?: PaginationOpts) => Promise<{ areas: Area[]; count: number }>
  deleteArea: (id: number) => Promise<Area>
  saveArea: (data: Prisma.AreaCreateInput) => Promise<Area>
  getExpenses: (opts?: GetExpensesOptions) => Promise<{ expenses: Expense[]; count: number }>
  deleteExpense: (id: number) => Promise<Expense>
  saveExpense: (data: Prisma.ExpenseCreateInput) => Promise<Expense>
  getExpensesStats: (period: { from: Date; to: Date }) => Promise<{ total: number }>
  addInventory: (id: number, data: InventoryRecordInput) => Promise<Product>
  getSalesStats: (period: {
    from: Date
    to: Date
  }) => Promise<{ total: number; outstanding: number }>
  returnOrder: (id: number) => Promise<Order>
  reReturnOrder: (id: number) => Promise<Order>
  getInventoryHistory: (
    id: number,
    opts?: PaginationOpts,
  ) => Promise<{ records: Prisma.InventoryRecord[]; count: number }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
