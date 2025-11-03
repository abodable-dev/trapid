import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowUpTrayIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../utils/formatters'
import api from '../api'

export default function PriceBooksPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadPriceBook()
  }, [searchQuery, categoryFilter])

  const loadPriceBook = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/pricebook', {
        params: {
          search: searchQuery || undefined,
          category: categoryFilter || undefined,
        }
      })

      setItems(response.items || [])
      if (response.filters?.categories) {
        setCategories(response.filters.categories)
      }
    } catch (err) {
      console.error('Failed to load price book:', err)
      // Keep empty state on error
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // API handles filtering, so we just use items directly
  const filteredItems = items

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Price Book
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/import')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Import CSV
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price Book Table */}
        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Supplier
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No items found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.item_code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.item_name}
                          {item.needs_pricing_review && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                              ⚠️ Needs Pricing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.category || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                          {item.current_price ? formatCurrency(item.current_price, false) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.unit_of_measure}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.supplier?.name || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
