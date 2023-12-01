import { Dialog } from '@headlessui/react'
import type { Product } from '../../../../generated/client'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useNavigate } from 'react-router-dom'
import { BriefcaseIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { productSchema } from './product-schema'

interface ProductEditDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  product: Product | null
}

export default function ProductEditDialog({ isOpen, setOpen, product }: ProductEditDialogProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-slate-100 p-4 rounded-md w-[400px]">
          {product && (
            <Dialog.Title className="text-xl font-semibold text-slate-800">
              Edit Product
            </Dialog.Title>
          )}

          {product && (
            <Formik
              initialValues={{
                name: product.name,
                inventory: product.inventory,
                price: product.price,
              }}
              onSubmit={(values) => {
                const castValues = productSchema.cast(values)
                window.api.updateProduct(product.id, castValues).then(() => {
                  navigate(0)
                })
              }}
              validationSchema={productSchema}
            >
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
                  <label htmlFor="inventory" className="block text-sm font-medium text-gray-700">
                    Quantity in Stock
                  </label>
                  <div className="mt-1">
                    <Field
                      name="inventory"
                      id="inventory"
                      step="0.5"
                      type="number"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="50"
                    />
                    <div className="text-red-700">
                      <ErrorMessage name="inventory" />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price per Unit
                  </label>
                  <div className="mt-1">
                    <Field
                      name="price"
                      id="price"
                      type="number"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="1600"
                    />
                    <div className="text-red-700">
                      <ErrorMessage name="price" />
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
                      window.api.deleteProduct(product.id).then(() => {
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
            </Formik>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
