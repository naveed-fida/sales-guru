import type { Customer, Prisma, Product } from '@prisma/client'
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik'
import { getOrderCurrentTotal, saleSchema } from './utils'
import SaleTotals from './SaleTotals'
import { BriefcaseIcon, XCircleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'

export type Order = Prisma.OrderGetPayload<{
  include: { customer: true; orderProducts: { include: { product: true } } }
}>

interface FormValues {
  customerId: number | undefined
  products: { productId: number; quantity: number; price: number }[]
  discount: number
  amountReceived: number
}

interface SaleForm {
  order?: Order
  onReturnClick?: () => void
  allCustomers: Customer[]
  allProducts: Product[]
  onSubmit: (values: FormValues) => void
  onDeleteClick?: () => void
  onReReturnClick?: () => void
}

export default function SaleForm({
  order,
  allCustomers,
  allProducts,
  onSubmit,
  onDeleteClick,
  onReturnClick,
  onReReturnClick,
}: SaleForm) {
  return (
    <Formik<FormValues>
      initialValues={
        order
          ? {
              customerId: order.customerId,
              products: order.orderProducts.map((op) => ({
                productId: op.productId,
                quantity: op.quantity,
                price: op.pricePerUnit,
              })),
              discount: order.discount,
              amountReceived: order.amountReceived,
            }
          : {
              customerId: undefined,
              products: [],
              discount: 0,
              amountReceived: 0,
            }
      }
      onSubmit={(values) => {
        const castValues = saleSchema.cast(values)
        onSubmit(castValues)
      }}
      validationSchema={saleSchema}
    >
      {({ values }) => {
        console.log(values)
        return (
          <Form>
            <div className="mt-4">
              <label htmlFor="customerId" className="block text-md font-medium text-gray-700">
                Customer
              </label>
              <div className="mt-1">
                <Field
                  id="customerId"
                  name="customerId"
                  as="select"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={values.customerId}
                  defaultValue={undefined}
                >
                  <option value={undefined}>Select A customer</option>
                  {allCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Field>
                <div className="text-red-700">
                  <ErrorMessage name="customerId" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="block text-md font-medium text-slate-700">Products & Quantities</p>
              <div className="mt-1">
                <FieldArray
                  name="products"
                  render={(arrayHelpers) => (
                    <>
                      {values.products.map((productObj, index) => {
                        return (
                          <div key={index}>
                            <div className="mt-2 flex gap-4 items-end">
                              <div>
                                <label
                                  className="text-sm font-medium text-slate-700"
                                  htmlFor={`products.${index}.productId`}
                                >
                                  Product
                                </label>
                                <Field
                                  id={`products.${index}.productId`}
                                  name={`products.${index}.productId`}
                                  as="select"
                                  className="mt-1 block w-[250px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                  onChange={(e) => {
                                    if (!e.target.value || e.target.value === 'undefined') return
                                    const productId = Number(e.target.value)
                                    const product = allProducts.find((p) => p.id === productId)
                                    if (product) {
                                      arrayHelpers.replace(index, {
                                        productId: product.id,
                                        quantity:
                                          productObj.quantity === 0 ? 1 : productObj.quantity,
                                        price: product.price,
                                      })
                                    }
                                  }}
                                >
                                  <option className="bg-gray-400" value={0}>
                                    Select A Product
                                  </option>
                                  {allProducts.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {product.name}
                                    </option>
                                  ))}
                                </Field>
                              </div>
                              <div>
                                <label
                                  className="text-sm font-medium text-slate-700"
                                  htmlFor={`products.${index}.quantity`}
                                >
                                  Quantity
                                </label>
                                <Field
                                  type="number"
                                  id={`products.${index}.quantity`}
                                  name={`products.${index}.quantity`}
                                  className="mt-1 block w-full p-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                />
                              </div>
                              <div>
                                <label
                                  className="text-sm font-medium text-slate-700"
                                  htmlFor={`products.${index}.price`}
                                >
                                  Price
                                </label>
                                <Field
                                  type="number"
                                  id={`products.${index}.price`}
                                  name={`products.${index}.price`}
                                  className="mt-1 block w-full p-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-slate-700">
                                  Subtotal
                                </span>
                                <span className="mt-1 block w-full p-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                  {productObj.price
                                    ? Number(productObj.price) * Number(productObj.quantity)
                                    : undefined}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                                className="bg-red-700 text-white rounded-md px-2 py-1"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="text-red-700 flex gap-4">
                              <ErrorMessage
                                name={`products.${index}.productId`}
                                render={(msg) => <div>{msg}</div>}
                              />
                              <ErrorMessage
                                name={`products.${index}.quantity`}
                                render={(msg) => <div>{msg}</div>}
                              />
                            </div>
                          </div>
                        )
                      })}
                      <div className="text-red-700">
                        <ErrorMessage
                          name="products"
                          render={(msg) => (typeof msg === 'string' ? <div>{msg}</div> : null)}
                        />
                      </div>
                      <button
                        type="button"
                        className="bg-green-700 text-white rounded-md px-2 py-1 block mt-4"
                        onClick={() => arrayHelpers.push({ productId: 0, quantity: 0, price: 0 })}
                      >
                        Add Product
                      </button>
                    </>
                  )}
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="discount" className="block text-md font-medium text-gray-700">
                Discount
              </label>
              <div className="mt-1">
                <Field
                  id="discount"
                  name="discount"
                  type="number"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  placeholder="50"
                  validate={(value) => {
                    const total = getOrderCurrentTotal(values.products)
                    if (Number(value) > total) {
                      return 'Discount cannot be greater than total'
                    }
                    return
                  }}
                />
                <div className="text-red-700">
                  <ErrorMessage name="discount" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="amountReceived" className="block text-md font-medium text-gray-700">
                Amount Received
              </label>
              <div className="mt-1">
                <Field
                  name="amountReceived"
                  type="number"
                  id="amountReceived"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                  placeholder="500"
                  validate={(value) => {
                    const total = getOrderCurrentTotal(values.products)
                    if (Number(value) > total - Number(values.discount)) {
                      return 'Amount received cannot be greater than total after discount'
                    }
                    return
                  }}
                />
                <div className="text-red-700">
                  <ErrorMessage name="amountReceived" />
                </div>
              </div>
            </div>
            <div className="mt-4 text-slate-700">
              <SaleTotals
                products={values.products}
                discount={values.discount}
                amountReceived={values.amountReceived}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2 bg-slate-800 text-slate-50 rounded-md shadow-md"
              >
                <span>
                  <BriefcaseIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>Save Order</span>
              </button>
              {order && onDeleteClick ? (
                <button
                  type="button"
                  className="flex gap-3 items-center px-4 py-2 bg-red-800 text-slate-50 rounded-md shadow-md"
                  onClick={() => {
                    onDeleteClick()
                  }}
                >
                  <span>
                    <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>Delete Order</span>
                </button>
              ) : (
                ''
              )}
              {order && !order.returned && onReturnClick && (
                <button
                  type="button"
                  className="flex gap-3 items-center px-4 py-2 bg-red-800 text-slate-50 rounded-md shadow-md"
                  onClick={() => {
                    onReturnClick()
                  }}
                >
                  <span>
                    <ArrowUturnLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>Return Order</span>
                </button>
              )}
              {order && order.returned && onReReturnClick && (
                <button
                  type="button"
                  className="flex gap-3 items-center px-4 py-2 bg-orange-500 text-slate-50 rounded-md shadow-md"
                  onClick={() => {
                    onReReturnClick()
                  }}
                >
                  <span>
                    <ArrowUturnLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>Unreturn Order</span>
                </button>
              )}
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}
