import { PrismaClient } from '@prisma/client'
import { subDays } from 'date-fns'
const invariant = require('tiny-invariant')

const prisma = new PrismaClient()

const seed = async () => {
  await prisma.customer.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.area.deleteMany({})
  await prisma.expense.deleteMany({})

  await prisma.expense.createMany({
    data: [
      {
        description: 'Electricity',
        amount: 1000,
        date: subDays(new Date(), 3),
      },
      {
        description: 'Water',
        amount: 500,
        date: subDays(new Date(), 8),
      },
      {
        description: 'Gas',
        amount: 500,
        date: subDays(new Date(), 5),
      },
      {
        description: 'Internet',
        amount: 600,
        date: subDays(new Date(), 10),
      },
      {
        description: 'Rent',
        amount: 10000,
        date: subDays(new Date(), 15),
      },
      {
        description: 'Maintenance',
        amount: 1000,
        date: subDays(new Date(), 40),
      },
      {
        description: 'Misc',
        amount: 500,
        date: subDays(new Date(), 36),
      },
    ],
  })

  await prisma.area.createMany({
    data: [
      {
        name: 'Metroville',
      },
      {
        name: 'Landhi',
      },
      {
        name: 'Malir',
      },
    ],
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

  const products = await prisma.product.findMany({ where: {}, take: 2 })
  invariant(products.length > 0, 'No product found')

  await prisma.order.create({
    data: {
      customerId: firstCustomer.id,
      createdAt: subDays(new Date(), 7),
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 5,
          },
          {
            productId: products[1].id,
            quantity: 6,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      customerId: firstCustomer.id,
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
          },
          {
            productId: products[1].id,
            quantity: 1,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      customerId: firstCustomer.id,
      createdAt: subDays(new Date(), 5),
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 3,
          },
          {
            productId: products[1].id,
            quantity: 3,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      customerId: secondCustomer.id,
      createdAt: subDays(new Date(), 5),
      orderProducts: {
        create: [
          {
            productId: products[0].id,
            quantity: 3,
          },
          {
            productId: products[1].id,
            quantity: 3,
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
            orderProducts: {
              create: [
                {
                  productId: products[0].id,
                  quantity: 1,
                },
                {
                  productId: products[1].id,
                  quantity: 2,
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
