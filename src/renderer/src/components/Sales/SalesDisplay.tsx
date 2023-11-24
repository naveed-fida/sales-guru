import { useEffect, useState } from 'react'
import SalesTable, { OrderDetails } from './SalesTable'
import SaleAddDialog from './SaleAddDialog'
import { Customer } from '../../../../types'
import { Pagination } from '@mui/material'
import { format as dateFmt, parseISO, startOfMonth, endOfDay, getTime, startOfDay } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { validDateRange } from '../utils'

const SALES_PER_PAGE = 10

export const SalesDisplay: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const statusFromParam = params.get('status')
  const customerIdFromParam = params.get('customerId')
  const [orders, setOrders] = useState<OrderDetails[]>([])
  const [salesCount, setSalesCount] = useState<number | null>(null)
  const [currPage, setCurrPage] = useState<number>(1)
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const defaultStartDate = startOfMonth(new Date())
  const defaultEndDate = endOfDay(new Date())
  const [salesPeriod, setSalesPeriod] = useState<{ from: Date; to: Date }>({
    from: customerIdFromParam ? startOfDay(parseISO('2000-01-01')) : defaultStartDate,
    to: defaultEndDate,
  })
  const [statusFilter, setStatusFilter] = useState<'due' | 'paid' | 'all'>(
    (statusFromParam as any) || 'all',
  )

  const [customerId, setCustomerId] = useState<number | 'none'>(
    customerIdFromParam ? Number(customerIdFromParam) : 'none',
  )

  const [showReturnedOnly, setShowReturnedOnly] = useState<boolean>(false)

  const currentDateDiff = getTime(salesPeriod.to) - getTime(salesPeriod.from)
  const isSalesPeriodDefault =
    getTime(defaultEndDate) - getTime(defaultStartDate) === currentDateDiff

  useEffect(() => {
    window.api.getCustomers().then((customers) => {
      setAllCustomers(customers)
    })
  }, [])

  useEffect(() => {
    window.api
      .getOrders({
        ...(statusFilter === 'all' ? {} : { status: statusFilter }),
        ...(validDateRange(salesPeriod)
          ? { salesPeriod }
          : { salesPeriod: { from: defaultStartDate, to: defaultEndDate } }),
        ...(customerId === 'none' || !customerId ? {} : { customerId }),
        ...(showReturnedOnly ? { returned: true } : {}),
        skip: (currPage - 1) * SALES_PER_PAGE,
        take: SALES_PER_PAGE,
      })
      .then(({ orders, count }) => {
        setSalesCount(count)
        setOrders(orders)
      })
  }, [currPage, salesPeriod, statusFilter, customerId, showReturnedOnly])

  const showClearFiltersButton =
    customerId !== 'none' ||
    statusFilter !== 'all' ||
    !validDateRange(salesPeriod) ||
    !isSalesPeriodDefault ||
    showReturnedOnly

  return (
    <div className="sales-display h-full">
      <div className="sales-display__header flex justify-between items-center ">
        <h1 className="text-2xl">Sales</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="text-base py-2 px-4 bg-slate-800 text-slate-50 rounded-md shadow-md"
        >
          Add Order
        </button>
      </div>
      <div className="sales-display__filters mt-4">
        <h2 className="text-lg">Filters</h2>
        <div className="flex gap-4 items-top mt-2">
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
              By Customer
            </label>
            <select
              name="customer"
              id="customer"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 mt-4"
              placeholder="1600"
              value={customerId}
              onChange={(e) => {
                setCurrPage(1)
                setCustomerId(e.target.value ? parseInt(e.target.value) : 'none')
              }}
            >
              <option value="none">All Customers</option>
              {allCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="block text-sm font-medium text-gray-700">By Date</div>
            <div className="flex">
              <div className="flex items-center gap-4 mt-4">
                <label className="text-sm" htmlFor="date-from">
                  From
                </label>
                <input
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  name="date-from"
                  id="date-from"
                  value={dateFmt(salesPeriod.from, 'yyyy-MM-dd')}
                  type="date"
                  onChange={(e) => {
                    setCurrPage(1)
                    setSalesPeriod((prd) => ({
                      ...prd,
                      from: startOfDay(parseISO(e.target.value)),
                    }))
                  }}
                />
              </div>
              <div className="flex items-center gap-4 ml-4 mt-4">
                <label className="text-sm" htmlFor="date-to">
                  To
                </label>
                <input
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  name="date-to"
                  id="date-to"
                  onChange={(e) => {
                    setCurrPage(1)
                    setSalesPeriod((prd) => ({ ...prd, to: endOfDay(parseISO(e.target.value)) }))
                  }}
                  value={dateFmt(salesPeriod.to, 'yyyy-MM-dd')}
                  type="date"
                />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              By Status
            </label>
            <select
              name="status"
              id="status"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 mt-4"
              placeholder="1600"
              value={statusFilter}
              onChange={(e) => {
                setCurrPage(1)
                setStatusFilter(e.target.value as any)
              }}
            >
              <option value="all">All</option>
              <option value="due">Due</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex items-center ml-4 align-middle gap-4 mt-4">
            <label className="text-sm" htmlFor="returned-only">
              Returned Only
            </label>
            <input
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              name="returned-only"
              id="returned-only"
              type="checkbox"
              checked={showReturnedOnly}
              onChange={() => {
                setCurrPage(1)
                setShowReturnedOnly(!showReturnedOnly)
              }}
            />
          </div>
          {showClearFiltersButton && (
            <button
              className="text-sm text-red-700 mt-8 border-red-700 border-2 rounded-md px-2 py-1 self-center"
              onClick={() => {
                setParams({})
                setSalesPeriod({
                  from: defaultStartDate,
                  to: defaultEndDate,
                })
                setStatusFilter('all')
                setCustomerId('none')
                setShowReturnedOnly(false)
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      <div className="sales-display__body mt-4 h-[calc(100%-250px)]">
        {validDateRange(salesPeriod) ? (
          <>
            {isSalesPeriodDefault ? (
              <p className="my-2 text-sm text-green-700">Showing sales for current month.</p>
            ) : (
              <p className="my-2 text-sm text-green-700">
                Showing sales from {dateFmt(salesPeriod.from, 'dd/MM/yyyy')} to{' '}
                {dateFmt(salesPeriod.to, 'dd/MM/yyy')}
              </p>
            )}
          </>
        ) : (
          <p className="my-2 text-sm text-red-700">
            Date range invalid. Showing sales for current month.
          </p>
        )}
        <SalesTable orders={orders} />

        {salesCount && salesCount > SALES_PER_PAGE && (
          <div className="mt-4 mb-2">
            <Pagination
              count={Math.ceil(salesCount / SALES_PER_PAGE)}
              onChange={(_, value) => {
                setCurrPage(value)
              }}
            />
          </div>
        )}
      </div>
      <SaleAddDialog isOpen={showAddDialog} setOpen={(open) => setShowAddDialog(open)} />
    </div>
  )
}
