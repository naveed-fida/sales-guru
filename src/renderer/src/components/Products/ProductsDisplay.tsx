import type { Product } from '../../../../generated/client'
import { useEffect, useState } from 'react'
import ProductsTable from './ProductsTable'
import ProductAddDialog from './ProductAddDialog'
import { Pagination } from '@mui/material'

const PRODUCTS_PER_PAGE = 10

export const ProductsDisplay: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [currPage, setCurrPage] = useState<number>(1)
  const [productsCount, setProductsCount] = useState<number>(0)

  useEffect(() => {
    window.api
      .getProducts({
        skip: (currPage - 1) * 10,
        take: 10,
      })
      .then(({ products, count }) => {
        setProductsCount(count)
        setProducts(products)
      })
  }, [currPage])

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
      <div className="products-display__body mt-4 h-[calc(100%-60px)]">
        <ProductsTable products={products} />
        {products && productsCount > PRODUCTS_PER_PAGE && (
          <div className="mt-8 mb-2">
            <Pagination
              count={Math.ceil(productsCount / PRODUCTS_PER_PAGE)}
              onChange={(_, value) => {
                setCurrPage(value)
              }}
            />
          </div>
        )}
      </div>
      <ProductAddDialog isOpen={showAddDialog} setOpen={(open) => setShowAddDialog(open)} />
    </div>
  )
}
