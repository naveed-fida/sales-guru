import type { Prisma } from '@prisma/client'
export type OrderDetails = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>
import { useState } from 'react'
import SaleEditDialog from './SaleEditDialog'
import { format as dateFmt } from 'date-fns'
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid'

interface SalesTableProps {
  orders: OrderDetails[]
}

export default function SalesTable({ orders }: SalesTableProps) {
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sale #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Products
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Discount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount Recieved
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount Due
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  return (
                    <tr className="relative" key={order.id}>
                      <td className="relative px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.returned && (
                          <span className="absolute p-1 top-1 left-1 rounded-full bg-orange-600">
                            <ArrowUturnLeftIcon className="h-2 w-2 text-white" aria-hidden />
                          </span>
                        )}
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dateFmt(order.createdAt, 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <ul>
                          {order.orderProducts.map((orderProduct) => (
                            <li key={orderProduct.id}>
                              {orderProduct.product.name} x {orderProduct.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.discount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">
                        {order.totalAmount}
                      </td>
                      <td className="px-6 py-4 font-medium whitespace-nowrap text-sm">
                        {order.amountReceived}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-medium ${
                          order.amountDue > 0 ? 'text-red-700' : ''
                        } text-sm`}
                      >
                        {order.amountDue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          onClick={() => {
                            setSelectedOrder(order)
                            setModalOpen(true)
                          }}
                          href="#"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SaleEditDialog
        isOpen={isModalOpen}
        setOpen={(open) => setModalOpen(open)}
        order={selectedOrder}
      />
    </div>
  )
}
