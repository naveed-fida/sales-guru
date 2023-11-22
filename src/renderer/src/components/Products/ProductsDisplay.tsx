import type { Product } from '@prisma/client'
import { useEffect, useState } from 'react'
import ProductsTable from './ProductsTable'
import ProductAddDialog from './ProductAddDialog'

export const ProductsDisplay: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)

  useEffect(() => {
    window.api.getProducts().then((products) => {
      setProducts(products)
    })
  }, [])

  return (
    <div className="products-display h-[90%]">
      <div className="products-display__header flex justify-between items-center">
        <h1 className="text-2xl">Products</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="text-base py-2 px-4 bg-slate-800 text-slate-50 rounded-md shadow-md"
        >
          Add Product
        </button>
      </div>
      <div className="products-display__body mt-4 h-[100%] overflow-scroll">
        <ProductsTable products={products} />
      </div>
      <ProductAddDialog isOpen={showAddDialog} setOpen={(open) => setShowAddDialog(open)} />
    </div>
  )
}
