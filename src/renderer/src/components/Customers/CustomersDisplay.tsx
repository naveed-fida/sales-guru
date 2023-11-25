import type { Customer } from '../../../../types'
import { useEffect, useState } from 'react'
import CustomersTable from './CustomersTable'
import CustomerAddDialog from './CustomerAddDialog'
import { Area } from '@prisma/client'

export const CustomersDisplay: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)

  const [allAreas, setAllAreas] = useState<Area[]>([])

  useEffect(() => {
    window.api.getCustomers().then((customers) => {
      setCustomers(customers)
    })
    window.api.getAreas().then(({ areas }) => {
      setAllAreas(areas)
    })
  }, [])

  return (
    <div className="customers-display h-[90%]">
      <div className="customers-display__header flex justify-between items-center">
        <h1 className="text-2xl">Customers</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="text-base py-2 px-4 bg-slate-800 text-slate-50 rounded-md shadow-md"
        >
          Add Customer
        </button>
      </div>
      <div className="customers-display__body mt-4 h-[100%] overflow-scroll">
        <CustomersTable areas={allAreas} people={customers} />
      </div>
      <CustomerAddDialog
        isOpen={showAddDialog}
        setOpen={(open) => setShowAddDialog(open)}
        areas={allAreas}
      />
    </div>
  )
}
