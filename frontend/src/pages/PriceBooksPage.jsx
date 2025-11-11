import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
 DollarSign,
 Upload,
 Download,
 Plus,
 X,
 Filter,
 ChevronUp,
 ChevronDown,
 Menu,
 SlidersHorizontal,
 Search,
} from 'lucide-react'
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
 const [isSearchFocused, setIsSearchFocused] = useState(false) // Track search focus state

 const observerTarget = useRef(null)
 const searchTimeoutRef = useRef(null)
 const searchInputRef = useRef(null)

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
 // Memoize the active filters check to prevent unnecessary recalculations
 const hasActiveFiltersForSelection = useMemo(() => {
 return !!(categoryFilter || supplierFilter || riskFilter || searchQuery || minPrice || maxPrice || showPricedOnly)
 }, [categoryFilter, supplierFilter, riskFilter, searchQuery, minPrice, maxPrice, showPricedOnly])

 useEffect(() => {
 if (hasActiveFiltersForSelection && items.length > 0) {
 // Automatically select all filtered items
 const newSelectedIds = new Set(items.map(item => item.id))
 // Only update if the selection actually changed
 setSelectedItems(prev => {
 const hasChanged = prev.size !== newSelectedIds.size ||
 ![...prev].every(id => newSelectedIds.has(id))
 return hasChanged ? newSelectedIds : prev
 })
 } else if (!hasActiveFiltersForSelection && selectedItems.size > 0) {
 // Clear selection when filters are cleared (only if there's a selection)
 setSelectedItems(new Set())
 }
 }, [items, hasActiveFiltersForSelection])

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

 // Memoize active filters check
 const hasActiveFilters = useMemo(() => {
 return !!(searchQuery || categoryFilter || supplierFilter || riskFilter || minPrice || maxPrice || showPricedOnly)
 }, [searchQuery, categoryFilter, supplierFilter, riskFilter, minPrice, maxPrice, showPricedOnly])

 // Memoize results text to prevent recalculation on every render
 const resultsText = useMemo(() => {
 const { page, limit, total_count } = pagination
 if (total_count === 0) return 'No items'

 const showing = Math.min(page * limit, total_count)
 if (showing === total_count) {
 return `${total_count.toLocaleString()} ${total_count === 1 ? 'item' : 'items'}`
 }
 return `Showing ${showing.toLocaleString()} of ${total_count.toLocaleString()} items`
 }, [pagination])

 // Badge component matching Tailwind UI standard design
 const Badge = ({ color, children }) => {
 const colorClasses = {
 green: 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400',
 yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500',
 red: 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400',
 gray: 'bg-gray-100 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400'
 }

 return (
 <span className={`inline-flex items-center gap-x-1.5 px-2 py-1 text-xs font-medium ${colorClasses[color] || colorClasses.gray}`}>
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

 const handleSort = useCallback((column) => {
 if (sortBy === column) {
 setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
 } else {
 setSortBy(column)
 setSortDirection('asc')
 }
 // Don't clear items - the useEffect will reload and pagination reset happens in loadPriceBook
 setPagination(prev => ({ ...prev, page: 1 }))
 }, [sortBy, sortDirection])

 const handleColumnFilter = useCallback((column, value) => {
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
 }, [])

 const handleCategoryUpdate = useCallback(async (itemId, newCategory) => {
 try {
 await api.patch(`/api/v1/pricebook/${itemId}`, {
 pricebook_item: {
 category: newCategory
 }
 })

 // Update local state
 setItems(prevItems => prevItems.map(item =>
 item.id === itemId ? { ...item, category: newCategory } : item
 ))

 setEditingCategory(null)
 } catch (error) {
 console.error('Failed to update category:', error)
 alert('Failed to update category')
 }
 }, [])

 const handleSelectItem = useCallback((itemId) => {
 setSelectedItems(prev => {
 const newSet = new Set(prev)
 if (newSet.has(itemId)) {
 newSet.delete(itemId)
 } else {
 newSet.add(itemId)
 }
 return newSet
 })
 }, [])

 const handleSelectAll = useCallback(() => {
 if (selectedItems.size === items.length) {
 // Deselect all
 setSelectedItems(new Set())
 } else {
 // Select all visible items
 setSelectedItems(new Set(items.map(item => item.id)))
 }
 }, [selectedItems.size, items])

 const handleClearSelection = useCallback(() => {
 setSelectedItems(new Set())
 }, [])

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

 const handleBackdropClick = () => {
 setSearchQuery('')
 setIsSearchFocused(false)
 if (searchInputRef.current) {
 searchInputRef.current.blur()
 }
 }

 const SortIcon = ({ column }) => {
 if (sortBy !== column) return <Menu className="h-3.5 w-3.5 text-gray-400" />
 return sortDirection === 'asc' ?
 <ChevronUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> :
 <ChevronDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
 }

 // Only show full page loading on initial load (no items yet)
 if (loading && items.length === 0) {
 return (
 <div className="flex h-screen overflow-hidden">
 <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
 {/* Header Skeleton */}
 <div className="bg-gray-800 border-b border-gray-700 sticky top-0">
 <div className="px-4 py-3">
 <div className="flex items-center relative">
 {/* Left: Title */}
 <div className="flex items-center gap-2">
 <div className="h-3.5 w-3.5 bg-gray-700 rounded animate-pulse" />
 <div>
 <div className="h-3.5 w-24 bg-gray-700 rounded animate-pulse mb-1" />
 <div className="h-3.5 w-32 bg-gray-700 rounded animate-pulse" />
 </div>
 </div>

 {/* Center: Search skeleton */}
 <div className="absolute left-1/2 -translate-x-1/2">
 <div className="h-8 w-32 bg-gray-900 rounded-lg animate-pulse" />
 </div>

 {/* Right: Action buttons skeleton */}
 <div className="ml-auto flex items-center gap-2">
 <div className="h-7 w-20 bg-gray-700 rounded animate-pulse" />
 <div className="h-7 w-20 bg-gray-700 rounded animate-pulse" />
 <div className="h-7 w-20 bg-gray-700 rounded animate-pulse" />
 </div>
 </div>
 </div>
 </div>

 {/* Table Skeleton */}
 <div className="overflow-x-auto border-l border-r border-b border-gray-700">
 <table className="min-w-full">
 {/* Table Header Skeleton */}
 <thead className="bg-gray-900/50 border-b border-gray-700 sticky top-0">
 <tr>
 <th className="px-3 py-2 w-10">
 <div className="h-4 w-4 bg-gray-700 rounded animate-pulse" />
 </th>
 <th className="px-3 py-2">
 <div className="h-3.5 w-16 bg-gray-700 rounded animate-pulse" />
 </th>
 <th className="px-3 py-2">
 <div className="h-3.5 w-24 bg-gray-700 rounded animate-pulse" />
 </th>
 <th className="px-3 py-2">
 <div className="h-3.5 w-20 bg-gray-700 rounded animate-pulse" />
 </th>
 <th className="px-3 py-2">
 <div className="h-3.5 w-24 bg-gray-700 rounded animate-pulse" />
 </th>
 <th className="px-3 py-2">
 <div className="h-3.5 w-16 bg-gray-700 rounded animate-pulse" />
 </th>
 <th className="px-3 py-2">
 <div className="h-3.5 w-12 bg-gray-700 rounded animate-pulse" />
 </th>
 <th className="px-3 py-2">
 <div className="h-3.5 w-24 bg-gray-700 rounded animate-pulse" />
 </th>
 </tr>
 </thead>
 {/* Table Body Skeleton - 10 rows */}
 <tbody className="divide-y divide-gray-700">
 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
 <tr key={i} className="h-12 bg-gray-800/30 animate-pulse">
 <td className="px-3 py-2">
 <div className="h-4 w-4 bg-gray-700 rounded" />
 </td>
 <td className="px-3 py-2">
 <div className="h-4 w-16 bg-gray-700 rounded" />
 </td>
 <td className="px-3 py-2">
 <div className="h-4 w-32 bg-gray-700 rounded" />
 </td>
 <td className="px-3 py-2">
 <div className="h-4 w-20 bg-gray-700 rounded" />
 </td>
 <td className="px-3 py-2">
 <div className="h-4 w-24 bg-gray-700 rounded" />
 </td>
 <td className="px-3 py-2">
 <div className="h-4 w-16 bg-gray-700 rounded" />
 </td>
 <td className="px-3 py-2">
 <div className="h-4 w-12 bg-gray-700 rounded" />
 </td>
 <td className="px-3 py-2">
 <div className="h-4 w-24 bg-gray-700 rounded" />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="flex h-screen overflow-hidden">
 {/* Frosted glass backdrop - only visible when search is active */}
 {(searchQuery || isSearchFocused) && (
 <div
 className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 transition-opacity duration-[240ms]"
 onClick={handleBackdropClick}
 />
 )}

 <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
 {/* Header with search */}
 <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
 <div className="px-4 py-3">
 {/* Three-column layout: Title (left) | Search (center) | Actions (right) */}
 <div className="flex items-center relative">
 {/* Left: Title and results */}
 <div className="flex items-center gap-2">
 <DollarSign className="h-3.5 w-3.5 text-gray-400" />
 <div>
 <h1 className="text-xs font-medium text-gray-900 dark:text-white">
 Price Book
 </h1>
 <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
 {resultsText}
 </p>
 </div>
 </div>

 {/* Center: Centered spotlight search */}
 <div className="absolute left-1/2 -translate-x-1/2 z-20">
 <div className="relative">
 <Search
 className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-30"
 />
 <input
 ref={searchInputRef}
 type="text"
 placeholder="Search..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 onFocus={() => setIsSearchFocused(true)}
 onBlur={() => setIsSearchFocused(false)}
 className="text-gray-900 dark:text-gray-100 text-xs font-sans outline-none ring-0 focus:ring-0 focus:outline-none transition-[width,padding] duration-[240ms] placeholder:text-gray-500 dark:placeholder:text-gray-500 rounded-lg bg-gray-900 border-0"
 style={{
 width: (searchQuery || isSearchFocused) ? '16rem' : '2rem',
 height: '2rem',
 paddingLeft: (searchQuery || isSearchFocused) ? '1.75rem' : '0.5rem',
 paddingRight: (searchQuery || isSearchFocused) ? '2rem' : '0.5rem',
 }}
 />
 {searchQuery && (
 <button
 onClick={handleBackdropClick}
 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors z-30"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>
 </div>

 {/* Right: Action buttons */}
 <div className="ml-auto flex items-center gap-2">
 {/* Selection Indicator */}
 {selectedItems.size > 0 && (
 <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30">
 <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
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
 className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {exporting ? (
 <>
 <span className="loading loading-sm"></span>
 Exporting...
 </>
 ) : (
 <>
 <Download className="h-3.5 w-3.5" />
 Export
 </>
 )}
 </button>

 {/* Import Button */}
 <button
 onClick={() => setShowImportModal(true)}
 className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
 >
 <Upload className="h-3.5 w-3.5" />
 Import
 </button>

 {/* Filters Button */}
 <button
 onClick={() => setShowFilters(!showFilters)}
 className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors ${
 hasActiveFilters
 ? 'border border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400 dark:text-indigo-400'
 : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900/50'
 }`}
 >
 <SlidersHorizontal className="h-3.5 w-3.5" />
 Filters
 {hasActiveFilters && (
 <span className="ml-1 inline-flex items-center justify-center min-w-4 h-4 px-1 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-full">
 {[searchQuery, categoryFilter, supplierFilter, riskFilter, minPrice, maxPrice, showPricedOnly].filter(Boolean).length}
 </span>
 )}
 </button>
 </div>
 </div>

 {/* Expanded filters */}
 {showFilters && (
 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Category filter */}
 <div>
 <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
 Category
 </label>
 <select
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 className="w-full px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
 className="w-full px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
 className="w-full px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
 className="w-full px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
 className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
 />
 <span className="text-sm text-gray-700 dark:text-gray-300">
 Only show items with prices
 </span>
 </label>
 </div>

 {hasActiveFilters && (
 <button
 onClick={clearFilters}
 className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
 >
 <X className="h-3.5 w-3.5 mr-1" />
 Clear filters
 </button>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 <div className="overflow-x-auto border-l border-r border-b border-gray-200 dark:border-gray-700">
 <table className="min-w-full">
 <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
 <tr>
 <th className="px-3 py-2 w-10">
 <input
 type="checkbox"
 checked={items.length > 0 && selectedItems.size === items.length}
 onChange={handleSelectAll}
 className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
 <td colSpan="8" className="px-3 py-2.5 text-center text-xs text-gray-500 dark:text-gray-400">
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
 <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
 <input
 type="checkbox"
 checked={selectedItems.has(item.id)}
 onChange={() => handleSelectItem(item.id)}
 className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
 />
 </td>
 <td className="px-3 py-2.5 text-xs font-mono font-medium text-gray-900 dark:text-white">
 {item.item_code}
 </td>
 <td className="px-3 py-2.5 text-xs text-gray-900 dark:text-white">
 {item.item_name}
 </td>
 <td className="px-3 py-2.5 text-xs font-sans">
 <div className="flex flex-wrap gap-1">
 {getRiskBadges(item).length > 0 ? (
 getRiskBadges(item)
 ) : (
 <Badge color="green">OK</Badge>
 )}
 </div>
 </td>
 <td
 className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400"
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
 className="w-full px-2 py-1 text-xs font-medium border border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-indigo-400"
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
 <td className="px-3 py-2.5 text-xs text-right font-mono text-gray-900 dark:text-white font-medium">
 {item.current_price ? formatCurrency(item.current_price, false) : '-'}
 </td>
 <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">
 {item.unit_of_measure}
 </td>
 <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">
 {item.supplier?.name || '-'}
 </td>
 </tr>
 ))}

 {/* Infinite scroll trigger */}
 {hasMore && (
 <tr ref={observerTarget}>
 <td colSpan="8" className="px-3 py-2.5 text-center">
 {loadingMore ? (
 <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
 <span className="loading loading-sm"></span>
 Loading more items...
 </div>
 ) : (
 <div className="text-xs text-gray-500 dark:text-gray-400">
 Scroll for more...
 </div>
 )}
 </td>
 </tr>
 )}

 {/* End of results */}
 {!hasMore && items.length > 0 && (
 <tr>
 <td colSpan="8" className="px-3 py-2.5 text-center text-xs text-gray-500 dark:text-gray-400">
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
