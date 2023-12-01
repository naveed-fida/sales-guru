import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Prisma } from '../generated/client'
import type {
  CustomerFormInput,
  GetExpensesOptions,
  GetOrdersOptions,
  InventoryRecordInput,
  PaginationOpts,
} from '../types'

// Custom APIs for renderer
const api = {
  getCustomers: (opts?: PaginationOpts) => ipcRenderer.invoke('get-customers', opts),
  saveCustomer: (customer: CustomerFormInput) => ipcRenderer.invoke('save-customer', customer),
  updateCustomer: (id: number, data: CustomerFormInput) =>
    ipcRenderer.invoke('update-customer', id, data),
  deleteCustomer: (id: number) => ipcRenderer.invoke('delete-customer', id),
  getProducts: (opts?: PaginationOpts) => ipcRenderer.invoke('get-products', opts),
  saveProduct: (data: Prisma.ProductCreateInput) => ipcRenderer.invoke('save-product', data),
  updateProduct: (id: number, data: Prisma.ProductUpdateInput) =>
    ipcRenderer.invoke('update-product', id, data),
  deleteProduct: (id: number) => ipcRenderer.invoke('delete-product', id),
  getOrders: (opts?: GetOrdersOptions) => ipcRenderer.invoke('get-orders', opts),
  createOrder: (data) => ipcRenderer.invoke('create-order', data),
  updateOrder: (id, data) => ipcRenderer.invoke('update-order', id, data),
  deleteOrder: (id) => ipcRenderer.invoke('delete-order', id),
  getAreas: (opts?: PaginationOpts) => ipcRenderer.invoke('get-areas', opts),
  deleteArea: (id) => ipcRenderer.invoke('delete-area', id),
  saveArea: (data) => ipcRenderer.invoke('save-area', data),
  getExpenses: (opts?: GetExpensesOptions) => ipcRenderer.invoke('get-expenses', opts),
  deleteExpense: (id) => ipcRenderer.invoke('delete-expense', id),
  saveExpense: (data: Prisma.ExpenseCreateInput) => ipcRenderer.invoke('save-expense', data),
  getSalesCount: () => ipcRenderer.invoke('get-sales-count'),
  getExpensesStats: (period: { from: Date; to: Date }) =>
    ipcRenderer.invoke('get-expenses-stats', period),
  getSalesStats: (period: { from: Date; to: Date }) =>
    ipcRenderer.invoke('get-sales-stats', period),
  returnOrder: (id: number) => ipcRenderer.invoke('return-order', id),
  addInventory: (id: number, data: InventoryRecordInput) =>
    ipcRenderer.invoke('add-inventory', id, data),
  reReturnOrder: (id: number) => ipcRenderer.invoke('re-return-order', id),
  getInventoryHistory: (id: number, opts?: PaginationOpts) =>
    ipcRenderer.invoke('get-inventory-history', id, opts),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
