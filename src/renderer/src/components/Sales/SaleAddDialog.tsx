import { Dialog } from '@headlessui/react'
import type { Prisma, Customer, Product } from '@prisma/client'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SaleForm from './SaleForm'
export type Order = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>

interface SaleAddDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
}

export default function SaleAddDialog({ isOpen, setOpen }: SaleAddDialogProps) {
  const navigate = useNavigate()
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    Promise.all([window.api.getCustomers(), window.api.getProducts()]).then(
      ([customers, products]) => {
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
          <Dialog.Title className="text-xl font-semibold text-slate-800">
            Add Sale Order
          </Dialog.Title>

          <SaleForm
            onSubmit={(values) => {
              window.api.createOrder(values).then(() => {
                navigate(0)
              })
            }}
            allCustomers={allCustomers}
            allProducts={allProducts}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
