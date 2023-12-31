import { useNavigate } from 'react-router-dom'
import type { Area } from '../../../../generated/client'

interface TableProps {
  areas: Area[]
}

export default function CustomersTable({ areas }: TableProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      <div className="-my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block">
          <div className="shadow border-b border-gray-200 sm:rounded-lg">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Area Name
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {areas.map((area) => (
                  <tr key={area.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {area.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          window.api.deleteArea(area.id).then(() => {
                            navigate(0)
                          })
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
