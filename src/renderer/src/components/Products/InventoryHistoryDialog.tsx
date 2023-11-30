import { Dialog } from '@headlessui/react'
import type { InventroyRecord, Product } from '@prisma/client'
import { format as dateFmt } from 'date-fns'
import { useEffect, useState } from 'react'
import { Pagination } from '@mui/material'

const RECORDS_PER_PAGE = 10

interface InventoryHistoryDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  product: Product
}

export default function InventoryHistoryDialog({
  isOpen,
  setOpen,
  product,
}: InventoryHistoryDialogProps) {
  const [currPage, setCurrPage] = useState<number>(1)
  const [count, setCount] = useState<number>(0)
  const [inventoryRecords, setInventoryRecords] = useState<InventroyRecord[]>([])

  useEffect(() => {
    window.api
      .getInventoryHistory(product.id, {
        skip: (currPage - 1) * RECORDS_PER_PAGE,
        take: RECORDS_PER_PAGE,
      })
      .then(({ records, count }) => {
        setCount(count)
        setInventoryRecords(records)
      })
  }, [currPage, product])

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-slate-100 p-4 rounded-md w-[400px]">
          <Dialog.Title className="text-xl font-semibold text-slate-800">
            Inventory Record for {product.name}
          </Dialog.Title>
          <div>
            {
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Quantity Added</th>
                    <th className="text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="text-left">{record.quantity}</td>
                      <td className="text-left">{dateFmt(record.createdAt, 'dd/MM/yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            {count && count > RECORDS_PER_PAGE && (
              <Pagination
                className="mt-4"
                count={Math.ceil(count / RECORDS_PER_PAGE)}
                page={currPage}
                onChange={(_, page) => setCurrPage(page)}
              />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
