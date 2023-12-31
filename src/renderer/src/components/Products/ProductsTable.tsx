import { useState } from 'react'
import ProductEditDialog from './ProductEditDialog'
import InventoryUpdateDialog from './InventoryUpdateDialog'
import InventoryHistoryDialog from './InventoryHistoryDialog'
import { Product } from '../../../../generated/client'

interface TableProps {
  products: Product[]
}

export default function ProductsTable({ products }: TableProps) {
  const [isModalOpen, setModalOpen] = useState(false)
  const [modelType, setModalType] = useState<'update' | 'edit' | 'history'>('edit')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <div className="flex flex-col h-full">
      <div className="-my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block">
          <div className="shadow border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price per unit
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Available Inventory
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  ></th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  ></th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.inventory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedProduct(product)
                          setModalType('update')
                          setModalOpen(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Update Inventory
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product)
                          setModalType('history')
                          setModalOpen(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View History
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product)
                          setModalType('edit')
                          setModalOpen(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selectedProduct && (
        <>
          <ProductEditDialog
            isOpen={isModalOpen && modelType === 'edit'}
            setOpen={(open) => setModalOpen(open)}
            product={selectedProduct}
          />
          <InventoryUpdateDialog
            isOpen={isModalOpen && modelType === 'update'}
            setOpen={(open) => setModalOpen(open)}
            product={selectedProduct}
          />
          <InventoryHistoryDialog
            isOpen={isModalOpen && modelType === 'history'}
            setOpen={(open) => setModalOpen(open)}
            product={selectedProduct as Product}
          />
        </>
      )}
    </div>
  )
}
