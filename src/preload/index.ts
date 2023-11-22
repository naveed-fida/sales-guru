import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Prisma } from '@prisma/client'
import type { CustomerFormInput, GetExpensesOptions, GetOrdersOptions } from '../types'

// Custom APIs for renderer
const api = {
  getCustomers: () => ipcRenderer.invoke('get-customers'),
  saveCustomer: (customer: CustomerFormInput) => ipcRenderer.invoke('save-customer', customer),
  updateCustomer: (id: number, data: CustomerFormInput) =>
    ipcRenderer.invoke('update-customer', id, data),
  deleteCustomer: (id: number) => ipcRenderer.invoke('delete-customer', id),
  getProducts: () => ipcRenderer.invoke('get-products'),
  saveProduct: (data: Prisma.ProductCreateInput) => ipcRenderer.invoke('save-product', data),
  updateProduct: (id: number, data: Prisma.ProductUpdateInput) =>
    ipcRenderer.invoke('update-product', id, data),
  deleteProduct: (id: number) => ipcRenderer.invoke('delete-product', id),
  getOrders: (opts?: GetOrdersOptions) => ipcRenderer.invoke('get-orders', opts),
  createOrder: (data) => ipcRenderer.invoke('create-order', data),
  updateOrder: (id, data) => ipcRenderer.invoke('update-order', id, data),
  deleteOrder: (id) => ipcRenderer.invoke('delete-order', id),
  getAreas: () => ipcRenderer.invoke('get-areas'),
  deleteArea: (id) => ipcRenderer.invoke('delete-area', id),
  saveArea: (data) => ipcRenderer.invoke('save-area', data),
  getExpenses: (opts?: GetExpensesOptions) => ipcRenderer.invoke('get-expenses', opts),
  deleteExpense: (id) => ipcRenderer.invoke('delete-expense', id),
  saveExpense: (data: Prisma.ExpenseCreateInput) => ipcRenderer.invoke('save-expense', data),
  getSalesCount: () => ipcRenderer.invoke('get-sales-count'),
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
