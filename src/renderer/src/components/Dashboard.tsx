import { endOfDay, getTime, parseISO, startOfDay, startOfMonth, format as dateFmt } from 'date-fns'
import { useEffect, useState } from 'react'
import { validDateRange } from './utils'

export const Dashboard: React.FC = () => {
  const defaultStartDate = startOfMonth(new Date())
  const defaultEndDate = endOfDay(new Date())
  const [period, setPeriod] = useState<{ from: Date; to: Date }>({
    from: defaultStartDate,
    to: defaultEndDate,
  })
  const [salesStats, setSalesStats] = useState<{
    total: number
    outstanding: number
  } | null>(null)

  const [expensesStats, setExpensesStats] = useState<{
    total: number
  } | null>(null)

  const stats = [
    {
      name: 'Total Sales',
      stat: 'PKR ' + (salesStats?.total || 0),
    },
    {
      name: 'Outstanding Invoices',
      stat: 'PKR ' + (salesStats?.outstanding || 0),
    },
    {
      name: 'Total Expenses',
      stat: 'PKR ' + (expensesStats?.total || 0),
    },
  ]

  const currentDateDiff = getTime(period.to) - getTime(period.from)
  const isPeriodDefault = getTime(defaultEndDate) - getTime(defaultStartDate) === currentDateDiff

  useEffect(() => {
    window.api
      .getSalesStats(
        validDateRange(period) ? period : { from: defaultStartDate, to: defaultEndDate },
      )
      .then((stats) => {
        setSalesStats(stats)
      })
    window.api
      .getExpensesStats(
        validDateRange(period) ? period : { from: defaultStartDate, to: defaultEndDate },
      )
      .then((stats) => {
        setExpensesStats(stats)
      })
  }, [period])

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="text-2xl">Dashboard</h1>
      </div>

      <div className="m-4">
        <div className="block text-lg font-medium text-gray-700">Filter By Date</div>
        <div className="flex">
          <div className="flex items-center gap-4 mt-2">
            <label className="text-sm" htmlFor="date-from">
              From
            </label>
            <input
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              name="date-from"
              id="date-from"
              value={dateFmt(period.from, 'yyyy-MM-dd')}
              type="date"
              onChange={(e) => {
                setPeriod((prd) => ({
                  ...prd,
                  from: startOfDay(parseISO(e.target.value)),
                }))
              }}
            />
          </div>
          <div className="flex items-center gap-4 ml-4 mt-2">
            <label className="text-sm" htmlFor="date-to">
              To
            </label>
            <input
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              name="date-to"
              id="date-to"
              onChange={(e) => {
                setPeriod((prd) => ({ ...prd, to: endOfDay(parseISO(e.target.value)) }))
              }}
              value={dateFmt(period.to, 'yyyy-MM-dd')}
              type="date"
            />
          </div>
          {!isPeriodDefault && (
            <button
              className="text-sm text-red-700 mt-2 ml-4 border-red-700 border-2 rounded-md px-2 py-1 self-center"
              onClick={() => {
                setPeriod({
                  from: defaultStartDate,
                  to: defaultEndDate,
                })
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="dashboard__body">
        {validDateRange(period) ? (
          <>
            {isPeriodDefault ? (
              <p className="my-2 text-sm text-green-700">Showing statistics for current month.</p>
            ) : (
              <p className="my-2 text-sm text-green-700">
                Showing statistics from {dateFmt(period.from, 'dd/MM/yyyy')} to{' '}
                {dateFmt(period.to, 'dd/MM/yyy')}
              </p>
            )}
          </>
        ) : (
          <p className="my-2 text-sm text-red-700">
            Date range invalid. Showing statistics for current month.
          </p>
        )}
        <dl className="mt-5 grid grid-cols-1 rounded-lg bg-white overflow-hidden shadow divide-y divide-gray-200 md:grid-cols-3 md:divide-y-0 md:divide-x">
          {stats.map((item) => (
            <div key={item.name} className="px-4 py-5 sm:p-6">
              <dt className="text-base font-normal text-gray-900">{item.name}</dt>
              <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                  {item.stat}
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
