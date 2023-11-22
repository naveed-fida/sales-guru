import { Dialog } from '@headlessui/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useNavigate } from 'react-router-dom'
import { BriefcaseIcon } from '@heroicons/react/20/solid'
import { expenseSchema } from './expense-schema'
import { format as dateFmt, parseISO } from 'date-fns'

interface ExpenseAddDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
}

export default function ExpenseAddDialog({ isOpen, setOpen }: ExpenseAddDialogProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-slate-100 p-4 rounded-md w-[400px]">
          <Dialog.Title className="text-xl font-semibold text-slate-800">Add Expense</Dialog.Title>

          <Formik
            initialValues={{
              description: '',
              amount: 0,
              date: new Date(),
            }}
            onSubmit={(values) => {
              const castValues = expenseSchema.cast(values)
              window.api.saveExpense(castValues).then(() => {
                navigate(0)
              })
              console.log(values)
            }}
            validationSchema={expenseSchema}
          >
            <Form>
              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <Field
                    name="description"
                    id="description"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    placeholder="Electricity Bill"
                  />
                </div>
                <div className="text-red-700">
                  <ErrorMessage name="description" />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <div className="mt-1">
                  <Field
                    name="amount"
                    id="amount"
                    type="number"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    placeholder="5000"
                  />
                  <div className="text-red-700">
                    <ErrorMessage name="amount" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1">
                  <Field name="date">
                    {({ field, form }: { field: any; form: any }) => (
                      <input
                        type="date"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                        value={dateFmt(field.value, 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const date = parseISO(e.target.value)
                          form.setFieldValue('date', date)
                        }}
                      />
                    )}
                  </Field>
                  <div className="text-red-700">
                    <ErrorMessage name="date" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-2 bg-slate-800 text-slate-50 rounded-md shadow-md"
                >
                  <span>
                    <BriefcaseIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>Create Expense</span>
                </button>
              </div>
            </Form>
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
