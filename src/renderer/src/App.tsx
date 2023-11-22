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
      <div className="header h-[57px] bg-slate-700 text-slate-100">
        <h1 className="text-3xl mb-6 px-4 py-2">The Sales Guru</h1>
      </div>
      <div className="h-[92%] mx-auto flex">
        <Navigation />
        <div className="flex-1 bg-slate-100 text-slate-700 p-4 text-lg">
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
