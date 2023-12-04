import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { dbPath, dbUrl, latestMigration, Migration } from './constants'
import { prisma, runPrismaCommand } from './prisma'
import fs from 'fs'
import path from 'path'
import { format as formatURL } from 'url'

import type {
  CustomerFormInput,
  GetExpensesOptions,
  GetOrdersOptions,
  PaginationOpts,
  OrderInput,
  InventoryRecordInput,
} from '../types'
import log from 'electron-log'

async function createWindow(): Promise<void> {
  let needsMigration
  const dbExists = fs.existsSync(dbPath)
  if (!dbExists) {
    needsMigration = true
    // prisma for whatever reason has trouble if the database file does not exist yet.
    // So just touch it here
    fs.closeSync(fs.openSync(dbPath, 'w'))
  } else {
    try {
      const latest: Migration[] =
        await prisma.$queryRaw`select * from _prisma_migrations order by finished_at`
      needsMigration = latest[latest.length - 1]?.migration_name !== latestMigration
    } catch (e) {
      log.error(e)
      needsMigration = true
    }
  }

  if (needsMigration) {
    try {
      const schemaPath = path.join(
        app.getAppPath().replace('app.asar', 'app.asar.unpacked'),
        'prisma',
        'schema.prisma',
      )
      log.info(`Needs a migration. Running prisma migrate with schema path ${schemaPath}`)

      // first create or migrate the database! If you were deploying prisma to a cloud service, this migrate deploy
      // command you would run as part of your CI/CD deployment. Since this is an electron app, it just needs
      // to run every time the production app is started. That way if the user updates the app and the schema has
      // changed, it will transparently migrate their DB.
      await runPrismaCommand({
        command: ['migrate', 'deploy', '--schema', schemaPath],
        dbUrl,
      })
      log.info('Migration done.')
    } catch (e) {
      log.error(e)
      process.exit(1)
    }
  } else {
    log.info('Does not need migration')
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })
  mainWindow.loadURL(
    formatURL({
      pathname: path.join(__dirname, '../renderer/index.html'), // relative path to the HTML-file
      protocol: 'file:',
      slashes: true,
    }),
  )

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
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

  ipcMain.handle('get-customers', async (_, opts?: PaginationOpts & { query?: string }) => {
    const customers = await prisma.customer.findMany({
      where: {
        name: {
          contains: opts?.query || '',
        },
      },
      include: {
        area: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: opts?.skip,
      take: opts?.take,
    })

    const count = await prisma.customer.count()
    return { customers, count }
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

  ipcMain.handle('get-products', async (_, opts?: { take?: number; skip?: number }) => {
    const products = await prisma.product.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      skip: opts?.skip,
      take: opts?.take,
    })
    const count = await prisma.product.count()
    return { products, count }
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
      returned: opts.returned,
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
          createdAt: data.createdAt,
          amountReceived: data.amountReceived,
          amountDue,
          billNumber: data.billNumber,
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
          createdAt: data.createdAt,
          discount: data.discount,
          amountReceived: data.amountReceived,
          billNumber: data.billNumber,
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

  ipcMain.handle('add-inventory', async (_, id, data: InventoryRecordInput) => {
    await prisma.$transaction(async (prisma) => {
      await prisma.inventroyRecord.create({
        data: {
          productId: id,
          quantity: data.quantity,
          createdAt: data.date,
        },
      })
      await prisma.product.update({
        where: {
          id,
        },
        data: {
          inventory: {
            increment: data.quantity,
          },
        },
      })
    })
  })

  ipcMain.handle('get-inventory-history', async (_, id, opts?: PaginationOpts) => {
    const [records, count] = await Promise.all([
      prisma.inventroyRecord.findMany({
        where: {
          productId: id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: opts?.skip,
        take: opts?.take,
      }),
      prisma.inventroyRecord.count({
        where: {
          productId: id,
        },
      }),
    ])
    return { records, count }
  })

  ipcMain.handle('get-areas', async (_, opts?: { skip?: number; take?: number }) => {
    const areas = await prisma.area.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip: opts?.skip,
      take: opts?.take,
    })
    const count = await prisma.area.count()
    return { areas, count }
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
      take: opts.take,
      skip: opts.skip,
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

  ipcMain.handle('save-expense', async (_, expense: any) => {
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
    prisma.$disconnect()
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
