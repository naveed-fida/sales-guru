import { Dialog } from '@headlessui/react'
import type { Product } from '@prisma/client'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useNavigate } from 'react-router-dom'
import { BriefcaseIcon } from '@heroicons/react/20/solid'
import { inventoryRecordSchema } from './product-schema'
import { format as dateFmt, parseISO } from 'date-fns'

interface ProductEditDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  product: Product | null
}

export default function InventoryUpdateDialog({
  isOpen,
  setOpen,
  product,
}: ProductEditDialogProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-slate-100 p-4 rounded-md w-[400px]">
          {product && (
            <Dialog.Title className="text-xl font-semibold text-slate-800">
              Add Inventory for {product.name}
            </Dialog.Title>
          )}

          {product && (
            <Formik
              initialValues={{
                quantity: 0,
                date: new Date(),
              }}
              onSubmit={(values) => {
                const castValues = inventoryRecordSchema.cast(values)
                console.log(product.id, product.name, castValues)
                window.api.addInventory(product.id, castValues).then(() => {
                  navigate(0)
                })
              }}
              validationSchema={inventoryRecordSchema}
            >
              <Form>
                <div className="mt-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity to Add
                  </label>
                  <div className="mt-1">
                    <Field
                      name="quantity"
                      type="number"
                      step="0.5"
                      id="quantity"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="Gul Khan"
                    />
                    <div className="text-red-700">
                      <ErrorMessage name="quantity" />
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
                    <span>Save</span>
                  </button>
                </div>
              </Form>
            </Formik>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
