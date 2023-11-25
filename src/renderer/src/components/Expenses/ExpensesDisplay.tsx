import { useEffect, useState } from 'react'
import ExpensesTable from './ExpensesTable'
import ExpenseAddDialog from './ExpenseAddDialog'
import { Expense } from '@prisma/client'
import { endOfDay, getTime, parseISO, startOfDay, startOfMonth, format as dateFmt } from 'date-fns'
import { Pagination } from '@mui/material'
import { validDateRange } from '../utils'

const EXPENSES_PER_PAGE = 10

export const ExpensesDisplay: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [currPage, setCurrPage] = useState<number>(1)
  const [expensesCount, setExpensesCount] = useState<number | null>(null)

  const defaultStartDate = startOfMonth(new Date())
  const defaultEndDate = endOfDay(new Date())
  const [expensesPeriod, setExpensesPeriod] = useState<{ from: Date; to: Date }>({
    from: defaultStartDate,
    to: defaultEndDate,
  })

  const currentDateDiff = getTime(expensesPeriod.to) - getTime(expensesPeriod.from)
  const isExpensesPeriodDefault =
    getTime(defaultEndDate) - getTime(defaultStartDate) === currentDateDiff

  useEffect(() => {
    window.api
      .getExpenses({
        ...(validDateRange(expensesPeriod)
          ? { expensesPeriod }
          : { expensesPeriod: { from: defaultStartDate, to: defaultEndDate } }),
        skip: (currPage - 1) * EXPENSES_PER_PAGE,
        take: EXPENSES_PER_PAGE,
      })
      .then(({ expenses, count }) => {
        setExpensesCount(count)
        setExpenses(expenses)
      })
  }, [expensesPeriod, currPage])

  return (
    <div className="expenses-display h-full">
      <div className="expenses-display__header flex justify-between items-center">
        <h1 className="text-2xl">Expenses</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="text-base py-2 px-4 bg-slate-800 text-slate-50 rounded-md shadow-md"
        >
          Add Expense
        </button>
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
              value={dateFmt(expensesPeriod.from, 'yyyy-MM-dd')}
              type="date"
              onChange={(e) => {
                setCurrPage(1)
                setExpensesPeriod((prd) => ({
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
                setCurrPage(1)
                setExpensesPeriod((prd) => ({ ...prd, to: endOfDay(parseISO(e.target.value)) }))
              }}
              value={dateFmt(expensesPeriod.to, 'yyyy-MM-dd')}
              type="date"
            />
          </div>
          {!isExpensesPeriodDefault && (
            <button
              className="text-sm text-red-700 mt-2 ml-4 border-red-700 border-2 rounded-md px-2 py-1 self-center"
              onClick={() => {
                setCurrPage(1)
                setExpensesPeriod({
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
      <div className="expenses-display__body mt-4 h-[calc(100%-220px)]">
        {validDateRange(expensesPeriod) ? (
          <>
            {isExpensesPeriodDefault ? (
              <p className="my-2 text-sm text-green-700">Showing expenses for current month.</p>
            ) : (
              <p className="my-2 text-sm text-green-700">
                Showing expenses from {dateFmt(expensesPeriod.from, 'dd/MM/yyyy')} to{' '}
                {dateFmt(expensesPeriod.to, 'dd/MM/yyy')}
              </p>
            )}
          </>
        ) : (
          <p className="my-2 text-sm text-red-700">
            Date range invalid. Showing expenses for current month.
          </p>
        )}
        <ExpensesTable expenses={expenses} />
        {expensesCount && expensesCount > EXPENSES_PER_PAGE && (
          <div className="mt-4 mb-2">
            <Pagination
              count={Math.ceil(expensesCount / EXPENSES_PER_PAGE)}
              onChange={(_, value) => {
                setCurrPage(value)
              }}
            />
          </div>
        )}
      </div>
      <ExpenseAddDialog isOpen={showAddDialog} setOpen={(open) => setShowAddDialog(open)} />
    </div>
  )
}
