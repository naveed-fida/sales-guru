import type { Customer } from '../../../../types'
import { useEffect, useState } from 'react'
import CustomersTable from './CustomersTable'
import CustomerAddDialog from './CustomerAddDialog'
import { Area } from '../../../../generated/client'
import { Pagination } from '@mui/material'
import { useDebounce } from 'usehooks-ts'

const CUSTOMERS_PER_PAGE = 10

export const CustomersDisplay: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [currPage, setCurrPage] = useState<number>(1)
  const [customerCount, setCustomerCount] = useState<number>(0)
  const [searchInput, setSearchInput] = useState<string>('')
  const query = useDebounce(searchInput, 500)

  const [allAreas, setAllAreas] = useState<Area[]>([])

  useEffect(() => {
    window.api.getAreas().then(({ areas }) => {
      setAllAreas(areas)
    })
  }, [])

  useEffect(() => {
    window.api
      .getCustomers({
        ...(query ? { query } : {}),
        skip: (currPage - 1) * 10,
        take: 10,
      })
      .then(({ customers, count }) => {
        setCustomerCount(count)
        setCustomers(customers)
      })
  }, [currPage, query])

  return (
    <div className="customers-display h-[90%]">
      <div className="customers-display__header flex justify-between items-center">
        <h1 className="text-2xl">Customers</h1>
        <div className="search-area">
          <input
            className="search-area__input py-1 px-2"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
            }}
          />
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="text-base py-2 px-4 bg-slate-800 text-slate-50 rounded-md shadow-md"
        >
          Add Customer
        </button>
      </div>
      <div className="customers-display__body mt-4 h-[calc(100%-60px)]">
        <CustomersTable areas={allAreas} people={customers} />
        {customers && customerCount > CUSTOMERS_PER_PAGE && (
          <div className="mt-8 mb-2">
            <Pagination
              count={Math.ceil(customerCount / CUSTOMERS_PER_PAGE)}
              onChange={(_, value) => {
                setCurrPage(value)
              }}
            />
          </div>
        )}
      </div>
      <CustomerAddDialog
        isOpen={showAddDialog}
        setOpen={(open) => setShowAddDialog(open)}
        areas={allAreas}
      />
    </div>
  )
}
