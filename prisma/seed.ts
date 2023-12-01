import { PrismaClient } from '../src/generated/client'
import { subDays } from 'date-fns'
const invariant = require('tiny-invariant')

const prisma = new PrismaClient()

const seed = async () => {
  await prisma.customer.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.area.deleteMany({})
  await prisma.expense.deleteMany({})

  await prisma.expense.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      description: `Expense ${i + 1}`,
      amount: 100 + i,
      date: subDays(new Date(), 15 + i),
    })),
  })

  await prisma.area.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      name: `Area ${i + 1}`,
    })),
  })

  await prisma.customer.create({
    data: {
      name: 'Khan Gul',
      phone: '1234567890',
      area: {
        create: {
          name: 'Korangi',
        },
      },
    },
  })

  await prisma.customer.createMany({
    data: [
      {
        name: 'Alice',
        phone: '1234567890',
      },
      {
        name: 'Bob',
        phone: '0987654321',
      },
      {
        name: 'Charlie',
        phone: '1230984567',
      },
    ],
  })

  await prisma.customer.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      name: `Customer ${i + 1}`,
      phone: `123456789${i}`,
    })),
  })

  const customers = await prisma.customer.findMany()
  invariant(customers.length > 0, 'No customer found')
  const firstCustomer = customers[0]
  const secondCustomer = customers[1]

  await prisma.product.createMany({
    data: [
      {
        name: 'Apple',
        price: 10,
        inventory: 100,
      },
      {
        name: 'Banana',
        price: 12,
        inventory: 100,
      },
      {
        name: 'Cherry',
        price: 14,
        inventory: 100,
      },
    ],
  })

  await prisma.product.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      name: `Product ${i + 1}`,
      price: 10 + i,
      inventory: 100,
    })),
  })

  const products = await prisma.product.findMany({ where: {}, take: 2 })
  invariant(products.length > 0, 'No product found')

  await prisma.order.create({
    data: {
      customerId: firstCustomer.id,
      createdAt: subDays(new Date(), 7),
      totalAmount: products[0].price * 5 + products[1].price * 6,
      amountDue: products[0].price * 5 + products[1].price * 6,
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 5,
            pricePerUnit: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 6,
            pricePerUnit: products[1].price,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      customerId: firstCustomer.id,
      totalAmount: products[0].price * 2 + products[1].price * 1,
      amountDue: products[0].price * 2 + products[1].price * 1,
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            pricePerUnit: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 1,
            pricePerUnit: products[1].price,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      customerId: firstCustomer.id,
      createdAt: subDays(new Date(), 5),
      totalAmount: products[0].price * 3 + products[1].price * 3,
      amountDue: products[0].price * 3 + products[1].price * 3,
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 3,
            pricePerUnit: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 3,
            pricePerUnit: products[1].price,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      customerId: secondCustomer.id,
      createdAt: subDays(new Date(), 5),
      totalAmount: products[0].price * 3 + products[1].price * 3,
      amountDue: products[0].price * 3 + products[1].price * 3,
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 3,
            pricePerUnit: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 3,
            pricePerUnit: products[1].price,
          },
        ],
      },
    },
  })

  await Promise.all(
    Array.from({ length: 20 })
      .map((_, i) => i + 1)
      .map((i) => {
        return prisma.order.create({
          data: {
            customerId: [secondCustomer.id, firstCustomer.id][i % 2],
            createdAt: subDays(new Date(), 36 + i),
            totalAmount: products[0].price * 1 + products[1].price * 2,
            amountDue: products[0].price * 1 + products[1].price * 2,
            orderProducts: {
              create: [
                {
                  productId: products[0].id,
                  quantity: 1,
                  pricePerUnit: products[0].price,
                },
                {
                  productId: products[1].id,
                  quantity: 2,
                  pricePerUnit: products[1].price,
                },
              ],
            },
          },
        })
      }),
  )
}

seed()
  .then(() => {
    console.log('Seeding complete')
  })
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    prisma.$disconnect()
  })
