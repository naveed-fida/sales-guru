/* This example requires Tailwind CSS v2.0+ */
import {
  HomeIcon,
  UsersIcon,
  RectangleStackIcon,
  BanknotesIcon,
  MapIcon,
  TicketIcon,
} from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'

interface NavigationItem {
  name: string
  icon: any
  href: string
}

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, href: '/', current: true },
  { name: 'Customers', icon: UsersIcon, href: '/customers', current: false },
  { name: 'Products', icon: RectangleStackIcon, href: '/products', current: false },
  { name: 'Sales', icon: BanknotesIcon, href: '/sales', current: false },
  { name: 'Areas', icon: MapIcon, href: '/areas', current: false },
  { name: 'Expenses', icon: TicketIcon, href: '/expenses', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navigation() {
  const location = useLocation()

  const isCurrent = (item: NavigationItem) => {
    return location.pathname === item.href
  }

  return (
    <div className="w-[250px] flex flex-col bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 bg-gray-800 space-y-1" aria-label="Sidebar">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                isCurrent(item)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
              )}
            >
              <item.icon
                className={classNames(
                  isCurrent(item) ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                  'mr-3 flex-shrink-0 h-6 w-6',
                )}
                aria-hidden="true"
              />
              <span className="flex-1">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
