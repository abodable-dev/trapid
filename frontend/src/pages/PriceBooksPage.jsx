import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../utils/formatters'
import { api } from '../api'

export default function PriceBooksPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total_count: 0,
    total_pages: 0
  })
  const [hasMore, setHasMore] = useState(true)

  const observerTarget = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Debounced search
  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setItems([])
      setPagination(prev => ({ ...prev, page: 1 }))
      loadPriceBook(1, query, categoryFilter, supplierFilter)
    }, 300)
  }, [categoryFilter, supplierFilter])

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, debouncedSearch])

  // Load on filter change
  useEffect(() => {
    setItems([])
    setPagination(prev => ({ ...prev, page: 1 }))
    loadPriceBook(1, searchQuery, categoryFilter, supplierFilter)
  }, [categoryFilter, supplierFilter])

  const loadPriceBook = async (page = 1, search = searchQuery, category = categoryFilter, supplier = supplierFilter) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await api.get('/api/v1/pricebook', {
        params: {
          search: search || undefined,
          category: category || undefined,
          supplier_id: supplier || undefined,
          page,
          limit: 50
        }
      })

      const newItems = response.items || []

      if (page === 1) {
        setItems(newItems)
      } else {
        setItems(prev => [...prev, ...newItems])
      }

      setPagination(response.pagination || {})
      setHasMore(page < (response.pagination?.total_pages || 0))

      // Set filters on first load
      if (page === 1) {
        if (response.filters?.categories) {
          setCategories(response.filters.categories)
        }
        if (response.filters?.suppliers) {
          setSuppliers(response.filters.suppliers)
        }
      }
    } catch (err) {
      console.error('Failed to load price book:', err)
      setItems([])
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = pagination.page + 1
          loadPriceBook(nextPage)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadingMore, loading, pagination.page])

  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('')
    setSupplierFilter('')
    setItems([])
    setPagination(prev => ({ ...prev, page: 1 }))
    loadPriceBook(1, '', '', '')
  }

  const hasActiveFilters = searchQuery || categoryFilter || supplierFilter

  const getResultsText = () => {
    const { page, limit, total_count } = pagination
    if (total_count === 0) return 'No items'

    const showing = Math.min(page * limit, total_count)
    if (showing === total_count) {
      return `${total_count.toLocaleString()} ${total_count === 1 ? 'item' : 'items'}`
    }
    return `Showing ${showing.toLocaleString()} of ${total_count.toLocaleString()} items`
  }

  if (loading && pagination.page === 1) {
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
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 flex-shrink-0">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Price Book
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getResultsText()}
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
                  placeholder="Search by code, name, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white min-w-[200px]"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Clear all filters"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Active filters badges */}
            {hasActiveFilters && (
              <div className="flex gap-2 mt-3">
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
                    <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                    "{searchQuery}"
                  </span>
                )}
                {categoryFilter && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200">
                    <FunnelIcon className="h-4 w-4 mr-1" />
                    {categoryFilter}
                  </span>
                )}
                {supplierFilter && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                    Supplier: {suppliers.find(([id]) => id === parseInt(supplierFilter))?.[1]}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0">
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
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {hasActiveFilters
                          ? 'No items match your filters. Try adjusting your search or clearing filters.'
                          : 'No items found in the price book.'}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
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
                      ))}

                      {/* Infinite scroll trigger */}
                      {hasMore && (
                        <tr ref={observerTarget}>
                          <td colSpan="6" className="px-4 py-4 text-center">
                            {loadingMore ? (
                              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                Loading more items...
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Scroll for more...
                              </div>
                            )}
                          </td>
                        </tr>
                      )}

                      {/* End of results */}
                      {!hasMore && items.length > 0 && (
                        <tr>
                          <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            End of results
                          </td>
                        </tr>
                      )}
                    </>
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
