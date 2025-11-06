import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../utils/formatters'
import { api } from '../api'
import ColumnHeaderMenu from '../components/pricebook/ColumnHeaderMenu'
import PriceBookImportModal from '../components/pricebook/PriceBookImportModal'

export default function PriceBooksPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize state from URL params
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')
  const [supplierFilter, setSupplierFilter] = useState(searchParams.get('supplier_id') || '')
  const [riskFilter, setRiskFilter] = useState(searchParams.get('risk_level') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [showPricedOnly, setShowPricedOnly] = useState(searchParams.get('needs_pricing') === 'true')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [allSuppliers, setAllSuppliers] = useState([]) // Store all suppliers for filtering
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total_count: 0,
    total_pages: 0
  })
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'category')
  const [sortDirection, setSortDirection] = useState(searchParams.get('sort_direction') || 'asc')
  const [editingCategory, setEditingCategory] = useState(null) // Track which item's category is being edited
  const [showImportModal, setShowImportModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set()) // Track selected item IDs

  const observerTarget = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Clear supplier filter if it's no longer in the filtered suppliers list
  useEffect(() => {
    if (supplierFilter && suppliers.length > 0) {
      const supplierStillExists = suppliers.some(s => s.id.toString() === supplierFilter.toString())
      if (!supplierStillExists) {
        setSupplierFilter('')
      }
    }
  }, [suppliers])

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (categoryFilter) params.set('category', categoryFilter)
    if (supplierFilter) params.set('supplier_id', supplierFilter)
    if (riskFilter) params.set('risk_level', riskFilter)
    if (minPrice) params.set('min_price', minPrice)
    if (maxPrice) params.set('max_price', maxPrice)
    if (showPricedOnly) params.set('needs_pricing', 'true')
    if (sortBy !== 'category') params.set('sort_by', sortBy)
    if (sortDirection !== 'asc') params.set('sort_direction', sortDirection)

    setSearchParams(params, { replace: true })
  }, [searchQuery, categoryFilter, supplierFilter, riskFilter, minPrice, maxPrice, showPricedOnly, sortBy, sortDirection, setSearchParams])

  // Debounced search - reload when filters change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadPriceBook(1)
    }, 300) // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, categoryFilter, supplierFilter, riskFilter, minPrice, maxPrice, showPricedOnly, sortBy, sortDirection])

  // Auto-select all items when filters are applied
  useEffect(() => {
    const hasActiveFilters = categoryFilter || supplierFilter || riskFilter || searchQuery || minPrice || maxPrice || showPricedOnly

    if (hasActiveFilters && items.length > 0) {
      // Automatically select all filtered items
      setSelectedItems(new Set(items.map(item => item.id)))
    } else {
      // Clear selection when filters are cleared
      setSelectedItems(new Set())
    }
  }, [items, categoryFilter, supplierFilter, riskFilter, searchQuery, minPrice, maxPrice, showPricedOnly])

  const loadPriceBook = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // Build query params
      const params = {
        page,
        limit: 50,
        sort_by: sortBy,
        sort_direction: sortDirection,
      }

      if (searchQuery) params.search = searchQuery
      if (categoryFilter) params.category = categoryFilter
      if (supplierFilter) params.supplier_id = supplierFilter
      if (riskFilter) params.risk_level = riskFilter
      if (minPrice) params.min_price = minPrice
      if (maxPrice) params.max_price = maxPrice
      if (!showPricedOnly) params.needs_pricing = 'false'

      const response = await api.get('/api/v1/pricebook', { params })

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
          const supplierList = response.filters.suppliers.map(([id, name]) => ({ id, name }))
          setAllSuppliers(supplierList)
          setSuppliers(supplierList)
        }
      }
    } catch (err) {
      console.error('Failed to load price book:', err)
      setItems([])
      setHasMore(false)
    } finally {
      setLoading(false)
      setSearching(false)
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
    setRiskFilter('')
    setMinPrice('')
    setMaxPrice('')
    setShowPricedOnly(false)
  }

  const hasActiveFilters = searchQuery || categoryFilter || supplierFilter || riskFilter || minPrice || maxPrice || showPricedOnly

  const getResultsText = () => {
    const { page, limit, total_count } = pagination
    if (total_count === 0) return 'No items'

    const showing = Math.min(page * limit, total_count)
    if (showing === total_count) {
      return `${total_count.toLocaleString()} ${total_count === 1 ? 'item' : 'items'}`
    }
    return `Showing ${showing.toLocaleString()} of ${total_count.toLocaleString()} items`
  }

  // Badge component matching Tailwind UI standard design
  const Badge = ({ color, children }) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500',
      red: 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400',
      gray: 'bg-gray-100 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400'
    }

    return (
      <span className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${colorClasses[color] || colorClasses.gray}`}>
        <svg className={`h-1.5 w-1.5 fill-current`} viewBox="0 0 6 6" aria-hidden="true">
          <circle cx={3} cy={3} r={3} />
        </svg>
        {children}
      </span>
    )
  }

  const getRiskBadges = (item) => {
    const badges = []

    // Price Freshness Badge
    if (item.price_freshness) {
      badges.push(
        <Badge key="freshness" color={item.price_freshness.color}>
          {item.price_freshness.label}
        </Badge>
      )
    }

    // Overall Risk Badge (if medium or higher)
    if (item.risk && ['medium', 'high', 'critical'].includes(item.risk.level)) {
      badges.push(
        <Badge key="risk" color={item.risk.color}>
          {item.risk.label}
        </Badge>
      )
    }

    return badges
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
    // Don't clear items - the useEffect will reload and pagination reset happens in loadPriceBook
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleColumnFilter = (column, value) => {
    switch (column) {
      case 'category':
        setCategoryFilter(value)
        break
      case 'supplier':
        setSupplierFilter(value)
        break
      case 'risk_level':
        setRiskFilter(value)
        break
      case 'current_price':
        if (value && typeof value === 'object') {
          setMinPrice(value.min || '')
          setMaxPrice(value.max || '')
        } else {
          setMinPrice('')
          setMaxPrice('')
        }
        break
      case 'item_code':
      case 'item_name':
        // These are handled by the main search
        setSearchQuery(value)
        break
    }
  }

  const handleCategoryUpdate = async (itemId, newCategory) => {
    try {
      await api.patch(`/api/v1/pricebook/${itemId}`, {
        pricebook_item: {
          category: newCategory
        }
      })

      // Update local state
      setItems(items.map(item =>
        item.id === itemId ? { ...item, category: newCategory } : item
      ))

      setEditingCategory(null)
    } catch (error) {
      console.error('Failed to update category:', error)
      alert('Failed to update category')
    }
  }

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      // Deselect all
      setSelectedItems(new Set())
    } else {
      // Select all visible items
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleExport = async () => {
    try {
      setExporting(true)

      // Build query params with current filters or selected items
      const params = new URLSearchParams()

      // If items are selected, export only those
      if (selectedItems.size > 0) {
        params.append('item_ids', Array.from(selectedItems).join(','))
      } else {
        // Otherwise use filters
        if (supplierFilter) params.append('supplier_id', supplierFilter)
        if (categoryFilter) params.append('category', categoryFilter)
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const url = `${API_URL}/api/v1/pricebook/export_price_history?${params.toString()}`

      // Fetch the file
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Export failed')

      // Get the blob and create download
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl

      // Create filename with date and filters or selection
      const date = new Date().toISOString().split('T')[0]
      let filename = `price_history_${date}`
      if (selectedItems.size > 0) {
        filename += `_selected_${selectedItems.size}_items`
      } else {
        if (supplierFilter) {
          const supplier = suppliers.find(s => s.id.toString() === supplierFilter.toString())
          if (supplier) filename += `_${supplier.name.replace(/[^a-z0-9]/gi, '_')}`
        }
        if (categoryFilter) filename += `_${categoryFilter.replace(/[^a-z0-9]/gi, '_')}`
      }
      a.download = `${filename}.xlsx`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleImportSuccess = () => {
    // Refresh the pricebook data
    loadPriceBook(1)
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <Bars3Icon className="h-4 w-4 text-gray-400" />
    return sortDirection === 'asc' ?
      <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
      <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
  }

  // Only show full page loading on initial load (no items yet)
  if (loading && items.length === 0) {
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
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {/* Header with search */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Price Book
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {getResultsText()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Selection Indicator */}
                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      {selectedItems.size} selected
                    </span>
                    <button
                      onClick={handleClearSelection}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </button>

                {/* Import Button */}
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Import
                </button>

                {/* Filters Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                    hasActiveFilters
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-full">
                      {[searchQuery, categoryFilter, supplierFilter, riskFilter, minPrice, maxPrice, showPricedOnly].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Main search bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${pagination.total_count?.toLocaleString() || ''} items by code, name, category, or supplier...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Supplier filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Supplier
                    </label>
                    <select
                      value={supplierFilter}
                      onChange={(e) => setSupplierFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Suppliers</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price range */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="$0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="$999,999"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Toggles and actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPricedOnly}
                        onChange={(e) => setShowPricedOnly(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Only show items with prices
                      </span>
                    </label>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedItems.size === items.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <ColumnHeaderMenu
                    label="Code"
                    column="item_code"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onFilter={handleColumnFilter}
                    filterValue={searchQuery}
                    filterType="search"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <ColumnHeaderMenu
                    label="Item Name"
                    column="item_name"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onFilter={handleColumnFilter}
                    filterValue={searchQuery}
                    filterType="search"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <ColumnHeaderMenu
                    label="Status"
                    column="risk_level"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onFilter={handleColumnFilter}
                    filterValue={riskFilter}
                    filterType="select"
                    filterOptions={[
                      { label: 'Low Risk', value: 'low', count: null },
                      { label: 'Medium Risk', value: 'medium', count: null },
                      { label: 'High Risk', value: 'high', count: null },
                      { label: 'Critical', value: 'critical', count: null },
                    ]}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <ColumnHeaderMenu
                    label="Category"
                    column="category"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onFilter={handleColumnFilter}
                    filterValue={categoryFilter}
                    filterType="select"
                    filterOptions={categories.map(cat => ({ label: cat, value: cat, count: null }))}
                  />
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  <ColumnHeaderMenu
                    label="Price"
                    column="current_price"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onFilter={handleColumnFilter}
                    filterValue={minPrice || maxPrice ? { min: minPrice, max: maxPrice } : ''}
                    filterType="price-range"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Unit
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <ColumnHeaderMenu
                    label="Supplier"
                    column="supplier"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onFilter={handleColumnFilter}
                    filterValue={supplierFilter}
                    filterType="select"
                    filterOptions={suppliers.map(sup => ({ label: sup.name, value: sup.id.toString(), count: null }))}
                  />
                </th>
              </tr>
            </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {items.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {hasActiveFilters
                          ? 'No items match your filters. Try adjusting your search criteria.'
                          : 'No items found in the price book.'}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`/price-books/${item.id}`)}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                            selectedItems.has(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                          }`}
                        >
                          <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {item.item_code}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {item.item_name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-wrap gap-1">
                              {getRiskBadges(item).length > 0 ? (
                                getRiskBadges(item)
                              ) : (
                                <Badge color="green">OK</Badge>
                              )}
                            </div>
                          </td>
                          <td
                            className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCategory(item.id)
                            }}
                          >
                            {editingCategory === item.id ? (
                              <select
                                autoFocus
                                value={item.category || ''}
                                onChange={(e) => handleCategoryUpdate(item.id, e.target.value)}
                                onBlur={() => setEditingCategory(null)}
                                className="w-full px-2 py-1 text-sm border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-indigo-400"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="">Select category...</option>
                                {categories.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400">
                                {item.category || '-'}
                              </span>
                            )}
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
                          <td colSpan="8" className="px-4 py-4 text-center">
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
                          <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            End of results
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Import Modal */}
            <PriceBookImportModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onImportSuccess={handleImportSuccess}
            />
          </div>
        </div>
  )
}
