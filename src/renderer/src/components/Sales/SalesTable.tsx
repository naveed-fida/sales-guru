export type OrderDetails = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>
import { useState } from 'react'
import SaleEditDialog from './SaleEditDialog'
import { format as dateFmt } from 'date-fns'
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid'
import { Prisma } from '../../../../generated/client'

interface SalesTableProps {
  orders: OrderDetails[]
}

export default function SalesTable({ orders }: SalesTableProps) {
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)

  const thClasses = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'

  return (
    <div className="flex flex-col h-full">
      <div className="my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="w-full divide-y divide-gray-200 ">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className={thClasses}>
                    Sale #
                  </th>
                  <th scope="col" className={thClasses}>
                    Date
                  </th>
                  <th scope="col" className={thClasses}>
                    Customer
                  </th>
                  <th scope="col" className={thClasses}>
                    Products
                  </th>
                  <th scope="col" className={thClasses}>
                    Discount
                  </th>
                  <th scope="col" className={thClasses}>
                    Total
                  </th>
                  <th scope="col" className={thClasses}>
                    Amount Recieved
                  </th>
                  <th scope="col" className={thClasses}>
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
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order)
                            setModalOpen(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
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
