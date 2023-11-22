const stats = [
  {
    name: 'Total Subscribers',
    stat: '71,897',
  },
  {
    name: 'Avg. Open Rate',
    stat: '58.16%',
  },
  {
    name: 'Avg. Click Rate',
    stat: '24.57%',
  },
]

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="text-2xl">Dashboard</h1>
      </div>

      <div className="dashboard__body">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Last 30 days</h3>
        <dl className="mt-5 grid grid-cols-1 rounded-lg bg-white overflow-hidden shadow divide-y divide-gray-200 md:grid-cols-3 md:divide-y-0 md:divide-x">
          {stats.map((item) => (
            <div key={item.name} className="px-4 py-5 sm:p-6">
              <dt className="text-base font-normal text-gray-900">{item.name}</dt>
              <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                  {item.stat}
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
