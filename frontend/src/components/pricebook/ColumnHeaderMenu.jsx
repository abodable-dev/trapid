import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
 ChevronDownIcon,
 MagnifyingGlassIcon,
 FunnelIcon,
 ChevronUpIcon,
 XMarkIcon,
} from '@heroicons/react/20/solid'

export default function ColumnHeaderMenu({
 label,
 column,
 sortBy,
 sortDirection,
 onSort,
 onFilter,
 filterValue,
 filterOptions,
 filterType = 'select', // 'select', 'search', or 'price-range'
}) {
 const [searchTerm, setSearchTerm] = useState('')
 const [minPrice, setMinPrice] = useState('')
 const [maxPrice, setMaxPrice] = useState('')

 // Sync local state with filterValue prop
 useEffect(() => {
 if (filterType === 'search') {
 setSearchTerm(filterValue || '')
 } else if (filterType === 'price-range' && typeof filterValue === 'object') {
 setMinPrice(filterValue.min || '')
 setMaxPrice(filterValue.max || '')
 }
 }, [filterValue, filterType])

 const handleFilterSelect = (value) => {
 onFilter(column, value === filterValue ? '' : value)
 }

 const handleSearchSubmit = (e) => {
 e.preventDefault()
 e.stopPropagation()
 onFilter(column, searchTerm)
 }

 const handlePriceRangeSubmit = (e) => {
 e.preventDefault()
 e.stopPropagation()
 onFilter(column, { min: minPrice, max: maxPrice })
 }

 const handleClearFilter = (e) => {
 e.stopPropagation()
 onFilter(column, '')
 setSearchTerm('')
 setMinPrice('')
 setMaxPrice('')
 }

 // Filter options by search term for select type
 const filteredOptions = filterOptions?.filter(option =>
 option.label?.toLowerCase().includes(searchTerm.toLowerCase())
 ) || []

 return (
 <Menu as="div" className="relative inline-block text-left w-full">
 {({ open }) => (
 <>
 <Menu.Button className="w-full flex items-center justify-between gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
 <span className="flex items-center gap-2 flex-1">
 {label}
 {filterValue && (
 <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
 )}
 </span>
 <div className="flex items-center gap-1">
 {sortBy === column && (
 sortDirection === 'asc' ?
 <ChevronUpIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> :
 <ChevronDownIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
 )}
 <ChevronDownIcon
 className={`h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}
 />
 </div>
 </Menu.Button>

 <Transition
 as={Fragment}
 enter="transition ease-out duration-100"
 enterFrom="transform opacity-0 scale-95"
 enterTo="transform opacity-100 scale-100"
 leave="transition ease-in duration-75"
 leaveFrom="transform opacity-100 scale-100"
 leaveTo="transform opacity-0 scale-95"
 >
 <Menu.Items className="absolute left-0 z-50 mt-2 w-64 origin-top-left bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
 <div className="p-2">
 {/* Sort options */}
 <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
 <Menu.Item>
 {({ active }) => (
 <button
 onClick={(e) => {
 e.stopPropagation()
 onSort(column)
 }}
 className={`${
 active ? 'bg-gray-100 dark:bg-gray-700' : ''
 } group flex w-full items-center px-2 py-2 text-sm text-gray-900 dark:text-white`}
 >
 <ChevronUpIcon className="mr-2 h-4 w-4" />
 Sort ascending
 </button>
 )}
 </Menu.Item>
 <Menu.Item>
 {({ active }) => (
 <button
 onClick={(e) => {
 e.stopPropagation()
 onSort(column)
 }}
 className={`${
 active ? 'bg-gray-100 dark:bg-gray-700' : ''
 } group flex w-full items-center px-2 py-2 text-sm text-gray-900 dark:text-white`}
 >
 <ChevronDownIcon className="mr-2 h-4 w-4" />
 Sort descending
 </button>
 )}
 </Menu.Item>
 </div>

 {/* Filter options */}
 <div>
 <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
 <FunnelIcon className="h-3.5 w-3.5" />
 Filter
 </div>

 {filterType === 'select' && (
 <div className="max-h-64 overflow-y-auto">
 {/* Search within options */}
 <div className="sticky top-0 bg-white dark:bg-gray-800 px-2 py-2">
 <div className="relative">
 <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => {
 e.stopPropagation()
 setSearchTerm(e.target.value)
 }}
 onClick={(e) => e.stopPropagation()}
 placeholder="Search..."
 className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
 />
 </div>
 </div>

 {filteredOptions.map((option) => (
 <Menu.Item key={option.value}>
 {({ active }) => (
 <button
 onClick={(e) => {
 e.stopPropagation()
 handleFilterSelect(option.value)
 }}
 className={`${
 active ? 'bg-gray-100 dark:bg-gray-700' : ''
 } ${
 filterValue === option.value ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
 } group flex w-full items-center justify-between px-2 py-2 text-sm text-gray-900 dark:text-white`}
 >
 <span className="truncate">{option.label}</span>
 {option.count !== undefined && (
 <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
 {option.count}
 </span>
 )}
 </button>
 )}
 </Menu.Item>
 ))}
 </div>
 )}

 {filterType === 'search' && (
 <form onSubmit={handleSearchSubmit} onClick={(e) => e.stopPropagation()}>
 <div className="px-2 py-2">
 <div className="relative">
 <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder={`Search ${label.toLowerCase()}...`}
 className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
 />
 </div>
 <button
 type="submit"
 className="w-full mt-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
 >
 Apply Filter
 </button>
 </div>
 </form>
 )}

 {filterType === 'price-range' && (
 <form onSubmit={handlePriceRangeSubmit} onClick={(e) => e.stopPropagation()}>
 <div className="px-2 py-2 space-y-2">
 <input
 type="number"
 value={minPrice}
 onChange={(e) => setMinPrice(e.target.value)}
 placeholder="Min price"
 step="0.01"
 className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
 />
 <input
 type="number"
 value={maxPrice}
 onChange={(e) => setMaxPrice(e.target.value)}
 placeholder="Max price"
 step="0.01"
 className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
 />
 <button
 type="submit"
 className="w-full px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
 >
 Apply Filter
 </button>
 </div>
 </form>
 )}

 {/* Clear filter button */}
 {filterValue && (
 <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
 <Menu.Item>
 {({ active }) => (
 <button
 onClick={handleClearFilter}
 className={`${
 active ? 'bg-gray-100 dark:bg-gray-700' : ''
 } group flex w-full items-center px-2 py-2 text-sm text-red-600 dark:text-red-400`}
 >
 <XMarkIcon className="mr-2 h-4 w-4" />
 Clear filter
 </button>
 )}
 </Menu.Item>
 </div>
 )}
 </div>
 </div>
 </Menu.Items>
 </Transition>
 </>
 )}
 </Menu>
 )
}
