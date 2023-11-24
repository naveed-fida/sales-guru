import { Routes, Route } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import Navigation from './components/Navigation'
import { CustomersDisplay } from './components/Customers/CustomersDisplay'
import { SalesDisplay } from './components/Sales/SalesDisplay'
import { ProductsDisplay } from './components/Products/ProductsDisplay'
import { AreasDisplay } from './components/Areas/AreasDisplay'
import { ExpensesDisplay } from './components/Expenses/ExpensesDisplay'

function App(): JSX.Element {
  return (
    <div className="wrapper h-full">
      <div className="mx-auto flex">
        <Navigation />
        <div className="flex-1 bg-slate-100 text-slate-700 p-4 text-lg h-[100vh]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersDisplay />} />
            <Route path="/sales" element={<SalesDisplay />} />
            <Route path="/products" element={<ProductsDisplay />} />
            <Route path="/areas" element={<AreasDisplay />} />
            <Route path="/expenses" element={<ExpensesDisplay />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
