import { Dialog } from '@headlessui/react'
import type { Prisma, Customer, Product } from '../../../../generated/client'
import { useEffect, useState } from 'react'
import SaleForm from './SaleForm'
import { useNavigate } from 'react-router-dom'
export type Order = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>

interface SaleEditDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  order: Order | null
}

export default function SaleEditDialog({ isOpen, setOpen, order }: SaleEditDialogProps) {
  const navigate = useNavigate()
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    Promise.all([window.api.getCustomers(), window.api.getProducts()]).then(
      ([{ customers }, { products }]) => {
        setAllCustomers(customers)
        setAllProducts(products)
      },
    )
  }, [])

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-slate-100 p-4 rounded-md w-[600px] h-[500px] overflow-scroll">
          {order && (
            <>
              <Dialog.Title className="text-xl font-semibold text-slate-800">
                Edit Sale
              </Dialog.Title>
              {order.returned && (
                <p className=" text-orange-500 mt-2">
                  This is a returned order. You won&apos;t be able to save your changes.
                </p>
              )}
            </>
          )}

          {order && (
            <SaleForm
              order={order}
              allCustomers={allCustomers}
              allProducts={allProducts}
              onSubmit={(values) => {
                if (order.returned) return
                window.api.updateOrder(order.id, values).then(() => {
                  navigate(0)
                })
              }}
              onDeleteClick={() => {
                window.api.deleteOrder(order.id).then(() => {
                  navigate(0)
                })
              }}
              onReturnClick={() => {
                if (order.returned) {
                  navigate(0)
                  return
                }
                window.api.returnOrder(order.id).then(() => {
                  navigate(0)
                })
              }}
              onReReturnClick={() => {
                if (!order.returned) {
                  navigate(0)
                  return
                }
                window.api.reReturnOrder(order.id).then(() => {
                  navigate(0)
                })
              }}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
