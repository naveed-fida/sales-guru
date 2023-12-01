import { Dialog } from '@headlessui/react'
import type { Customer } from '../../../../types'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useNavigate } from 'react-router-dom'
import { BriefcaseIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { customerSchema } from './customer-schema'
import { Area } from '../../../../generated/client'

interface CustomerEditDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  customer: Customer | null
  areas: Area[]
}

export default function CustomerEditDialog({
  isOpen,
  setOpen,
  customer,
  areas,
}: CustomerEditDialogProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-slate-100 p-4 rounded-md w-[400px]">
          {customer && (
            <Dialog.Title className="text-xl font-semibold text-slate-800">
              Edit Customer
            </Dialog.Title>
          )}

          {customer && (
            <Formik
              initialValues={{
                name: customer.name,
                area: customer.area?.id,
                phone: customer.phone || undefined,
              }}
              onSubmit={(values) => {
                const castValues = customerSchema.cast(values)
                window.api.updateCustomer(customer.id, castValues).then(() => {
                  navigate(0)
                })
              }}
              validationSchema={customerSchema}
            >
              {({ values }) => {
                return (
                  <Form>
                    <div className="mt-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1">
                        <Field
                          name="name"
                          id="name"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                          placeholder="Gul Khan"
                        />
                        <div className="text-red-700">
                          <ErrorMessage name="name" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label
                        htmlFor="customerId"
                        className="block text-md font-medium text-gray-700"
                      >
                        Area
                      </label>
                      <div className="mt-1">
                        <Field
                          id="area"
                          name="area"
                          as="select"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={values.area}
                          defaultValue={undefined}
                        >
                          <option value={undefined}>Select An Area</option>
                          {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.name}
                            </option>
                          ))}
                        </Field>
                        <div className="text-red-700">
                          <ErrorMessage name="area" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <div className="mt-1">
                        <Field
                          name="phone"
                          type="tel"
                          id="phone"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                          placeholder="03331112223"
                        />
                        <div className="text-red-700">
                          <ErrorMessage name="phone" />
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
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        className="flex gap-3 items-center px-4 py-2 bg-red-800 text-slate-50 rounded-md shadow-md"
                        onClick={() => {
                          window.api.deleteCustomer(customer.id).then(() => {
                            navigate(0)
                          })
                        }}
                      >
                        <span>
                          <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </Form>
                )
              }}
            </Formik>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
