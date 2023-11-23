import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PrismaClient, Prisma } from '@prisma/client'
import type { CustomerFormInput, GetExpensesOptions, GetOrdersOptions } from '../types'

interface OrderInput {
  customerId: number
  products?: { productId: number; quantity: number; price: number }[]
  discount: number
  amountReceived: number
}

const prisma = new PrismaClient()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.handle('get-customers', async () => {
    const customers = await prisma.customer.findMany({
      include: {
        area: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return customers
  })

  ipcMain.handle('save-customer', async (_, customer: CustomerFormInput) => {
    let result
    if (!customer.area) {
      result = await prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
        },
      })
    } else {
      result = await prisma.customer.create({
        data: Object.assign(customer, {
          area: {
            connect: {
              id: customer.area,
            },
          },
        }),
      })
    }
    return result
  })

  ipcMain.handle('update-customer', async (_, id, data: CustomerFormInput) => {
    if (!data.area) {
      const result = await prisma.customer.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          phone: data.phone,
          area: {
            disconnect: true,
          },
        },
      })
      return result
    }
    const result = await prisma.customer.update({
      where: {
        id,
      },
      data: Object.assign(data, {
        area: {
          connect: {
            id: data.area,
          },
        },
      }),
    })
    return result
  })

  ipcMain.handle('delete-customer', async (_, id) => {
    const result = await prisma.customer.delete({
      where: {
        id,
      },
    })
    return result
  })

  ipcMain.handle('get-products', async () => {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return products
  })

  ipcMain.handle('save-product', async (_, product) => {
    const result = await prisma.product.create({
      data: product,
    })
    return result
  })

  ipcMain.handle('update-product', async (_, id, data) => {
    const result = await prisma.product.update({
      where: {
        id,
      },
      data,
    })
    return result
  })

  ipcMain.handle('delete-product', async (_, id) => {
    const result = await prisma.product.delete({
      where: {
        id,
      },
    })
    return result
  })

  ipcMain.handle('get-orders', async (_, opts: GetOrdersOptions) => {
    const whereObj = {
      ...(opts.customerId ? { customerId: opts.customerId } : {}),
      ...(opts.salesPeriod
        ? { createdAt: { gte: opts.salesPeriod.from, lte: opts.salesPeriod.to } }
        : {}),
      ...(opts.status === 'due' ? { amountDue: { gt: 0 } } : {}),
      ...(opts.status === 'paid' ? { amountDue: { equals: 0 } } : {}),
    }

    const count = await prisma.order.count({
      where: whereObj,
    })

    const orders = await prisma.order.findMany({
      where: whereObj,
      include: {
        customer: true,
        orderProducts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: opts.skip,
      take: opts.take,
    })

    return { orders, count }
  })

  ipcMain.handle('update-order', async (_, id, data: OrderInput) => {
    await prisma.$transaction(async (prisma) => {
      const orderProducts = await prisma.orderProduct.findMany({
        where: {
          orderId: id,
        },
      })

      await Promise.all(
        orderProducts.map((op) => {
          return prisma.product.update({
            where: {
              id: op.productId,
            },
            data: {
              inventory: {
                increment: op.quantity,
              },
            },
          })
        }),
      )

      await prisma.orderProduct.deleteMany({
        where: {
          orderId: id,
        },
      })

      const prices = data.products?.map((p) => p.price * p.quantity) || []
      const total = prices.reduce((a, b) => a + b, 0)
      const amountDue = total - data.discount - data.amountReceived

      await prisma.order.update({
        where: {
          id,
        },
        data: {
          customerId: data.customerId,
          discount: data.discount,
          amountReceived: data.amountReceived,
          amountDue,
          totalAmount: total,
          orderProducts: {
            create: data.products?.map((p) => ({
              productId: p.productId,
              quantity: p.quantity,
              pricePerUnit: p.price,
            })),
          },
        },
      })

      return await Promise.all(
        (data.products || []).map((prod) => {
          return prisma.product.update({
            where: {
              id: prod.productId,
            },
            data: {
              inventory: {
                decrement: prod.quantity,
              },
            },
          })
        }),
      )
    })
  })

  ipcMain.handle('delete-order', async (_, id) => {
    const result = await prisma.order.delete({
      where: {
        id,
      },
    })
    return result
  })

  ipcMain.handle('create-order', async (_, data: OrderInput) => {
    return await prisma.$transaction(async (prisma) => {
      const prices = data.products?.map((p) => p.price * p.quantity) || []
      const total = prices.reduce((a, b) => a + b, 0)
      const amountDue = total - data.discount - data.amountReceived

      await prisma.order.create({
        data: {
          customerId: data.customerId,
          discount: data.discount,
          amountReceived: data.amountReceived,
          amountDue,
          totalAmount: total,
          orderProducts: {
            create: data.products?.map((p) => ({
              productId: p.productId,
              quantity: p.quantity,
              pricePerUnit: p.price,
            })),
          },
        },
      })

      return await Promise.all(
        (data.products || []).map((prod) => {
          return prisma.product.update({
            where: {
              id: prod.productId,
            },
            data: {
              inventory: {
                decrement: prod.quantity,
              },
            },
          })
        }),
      )
    })
  })

  ipcMain.handle('get-areas', async () => {
    const areas = await prisma.area.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return areas
  })

  ipcMain.handle('save-area', async (_, area) => {
    const result = await prisma.area.create({
      data: area,
    })
    return result
  })

  ipcMain.handle('delete-area', async (_, id) => {
    const result = await prisma.area.delete({
      where: {
        id,
      },
    })
    return result
  })

  ipcMain.handle('get-expenses', async (_, opts: GetExpensesOptions) => {
    const whereObj = opts.expensesPeriod
      ? { date: { gte: opts.expensesPeriod.from, lte: opts.expensesPeriod.to } }
      : {}

    const expenses = await prisma.expense.findMany({
      where: whereObj,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const count = await prisma.expense.count({
      where: whereObj,
    })
    return { expenses, count }
  })

  ipcMain.handle('delete-expense', async (_, id) => {
    const result = await prisma.expense.delete({
      where: {
        id,
      },
    })
    return result
  })

  ipcMain.handle('save-expense', async (_, expense: Prisma.ExpenseCreateInput) => {
    const result = await prisma.expense.create({
      data: expense,
    })
    return result
  })

  ipcMain.handle('get-sales-count', async () => {
    const count = await prisma.order.count()
    return count
  })

  ipcMain.handle('get-expenses-stats', async (_, period: { from: Date; to: Date }) => {
    const total = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: period.from,
          lte: period.to,
        },
      },
    })
    return { total: total._sum.amount }
  })

  ipcMain.handle('get-sales-stats', async (_, period: { from: Date; to: Date }) => {
    const total = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: period.from,
          lte: period.to,
        },
      },
    })

    const outstanding = await prisma.order.aggregate({
      _sum: {
        amountDue: true,
      },
      where: {
        createdAt: {
          gte: period.from,
          lte: period.to,
        },
      },
    })

    return { total: total._sum.totalAmount, outstanding: outstanding._sum.amountDue }
  })

  ipcMain.handle('return-order', async (_, id: number) => {
    await prisma.$transaction(async (prisma) => {
      const orderProducts = await prisma.orderProduct.findMany({
        where: {
          orderId: id,
        },
      })

      await Promise.all(
        orderProducts.map((op) => {
          return prisma.product.update({
            where: {
              id: op.productId,
            },
            data: {
              inventory: {
                increment: op.quantity,
              },
            },
          })
        }),
      )

      await prisma.order.update({
        where: {
          id,
        },
        data: {
          returned: true,
        },
      })
    })
  })

  ipcMain.handle('re-return-order', async (_, id: number) => {
    await prisma.$transaction(async (prisma) => {
      const orderProducts = await prisma.orderProduct.findMany({
        where: {
          orderId: id,
        },
      })

      await Promise.all(
        orderProducts.map((op) => {
          return prisma.product.update({
            where: {
              id: op.productId,
            },
            data: {
              inventory: {
                decrement: op.quantity,
              },
            },
          })
        }),
      )

      await prisma.order.update({
        where: {
          id,
        },
        data: {
          returned: false,
        },
      })
    })
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
