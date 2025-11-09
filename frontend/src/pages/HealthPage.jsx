import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { api } from '../api'

export default function HealthPage() {
  const [loading, setLoading] = useState(true)
  const [healthChecks, setHealthChecks] = useState({
    itemsWithoutDefaultSupplier: {
      count: 0,
      items: []
    }
  })

  useEffect(() => {
    loadHealthData()
  }, [])

  const loadHealthData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/health/pricebook')
      setHealthChecks(response)
    } catch (error) {
      console.error('Failed to load health data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <PlusIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              System Health
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Monitor data quality and system integrity
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Pricebook Health Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pricebook Data Quality
              </h2>
            </div>

            <div className="p-6">
              {/* Items Without Default Supplier */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                      healthChecks.itemsWithoutDefaultSupplier.count > 0
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <span className={`text-2xl font-bold ${
                        healthChecks.itemsWithoutDefaultSupplier.count > 0
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {healthChecks.itemsWithoutDefaultSupplier.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        Items Without Default Supplier
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Pricebook items that don't have a default supplier assigned
                      </p>
                    </div>
                  </div>

                  {/* Item List */}
                  {healthChecks.itemsWithoutDefaultSupplier.count > 0 && (
                    <div className="mt-4 ml-15">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Price
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {healthChecks.itemsWithoutDefaultSupplier.items.slice(0, 10).map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                  {item.item_code}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {item.item_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.category || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {item.current_price ? `$${item.current_price.toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {healthChecks.itemsWithoutDefaultSupplier.count > 10 && (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 text-center">
                            Showing 10 of {healthChecks.itemsWithoutDefaultSupplier.count} items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {healthChecks.itemsWithoutDefaultSupplier.count === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                      Needs Attention
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
