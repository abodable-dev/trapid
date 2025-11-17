import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  EyeIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const CHAPTER_NAMES = {
  1: 'Overview & System-Wide Rules',
  2: 'Authentication & Users',
  3: 'System Administration',
  4: 'Contacts & Relationships',
  5: 'Price Books & Suppliers',
  6: 'Jobs & Construction Management',
  7: 'Estimates & Quoting',
  8: 'AI Plan Review',
  9: 'Purchase Orders',
  10: 'Gantt & Schedule Master',
  11: 'Project Tasks & Checklists',
  12: 'Weather & Public Holidays',
  13: 'OneDrive Integration',
  14: 'Outlook/Email Integration',
  15: 'Chat & Communications',
  16: 'Xero Accounting Integration',
  17: 'Payments & Financials',
  18: 'Workflows & Automation',
  19: 'Custom Tables & Formulas',
  20: 'UI/UX Standards & Patterns',
  21: 'Agent System & Automation'
}

const STATUS_COLORS = {
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  fixed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  by_design: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  monitoring: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

const STATUS_ICONS = {
  open: '⚡',
  fixed: '✅',
  by_design: '⚠️',
  monitoring: '🔄'
}

const SEVERITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

// Define columns (RULE #19.1: Row selection checkbox must be first column)
const COLUMNS = [
  { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 50 },
  { key: 'expand', label: '', resizable: false, sortable: false, filterable: false, width: 50 },
  { key: 'chapter', label: 'Chapter', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 200, tooltip: 'Chapter number and name' },
  { key: 'type', label: 'Type', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 120 },
  { key: 'trinity', label: 'Trinity', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 180 },
  { key: 'title', label: 'Title', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 300 },
  { key: 'component', label: 'Component', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 180 },
  { key: 'status', label: 'Status', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 140 },
  { key: 'severity', label: 'Severity', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 120 },
  { key: 'actions', label: 'Actions', resizable: false, sortable: false, filterable: false, width: 120 }
]

const DEFAULT_COLUMN_WIDTHS = COLUMNS.reduce((acc, col) => {
  acc[col.key] = col.width
  return acc
}, {})

const DEFAULT_COLUMN_ORDER = COLUMNS.map(c => c.key)

const DEFAULT_VISIBLE_COLUMNS = COLUMNS.reduce((acc, col) => {
  acc[col.key] = true
  return acc
}, {})

export default function LexiconTableView({ entries, onEdit, onDelete, stats }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('chapter')
  const [sortDir, setSortDir] = useState('asc')
  const [filters, setFilters] = useState({
    chapter: 'all',
    type: 'all',
    status: 'all',
    severity: 'all'
  })
  const [expandedRows, setExpandedRows] = useState(new Set())

  // Row selection state (RULE #19.1)
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Inline column filters (RULE #19.1)
  const [columnFilters, setColumnFilters] = useState({})

  // Chapter 19 compliance: Column state management
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS)
  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMN_ORDER)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)

  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  // Column reordering state
  const [draggedColumn, setDraggedColumn] = useState(null)

  // Sticky horizontal scrollbar state
  const [tableScrollWidth, setTableScrollWidth] = useState(0)
  const scrollContainerRef = useRef(null)
  const stickyScrollbarRef = useRef(null)

  // Load table state from localStorage on mount (RULE #19.5B)
  useEffect(() => {
    const savedState = localStorage.getItem('lexiconTableViewState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        setColumnWidths(state.columnWidths || DEFAULT_COLUMN_WIDTHS)
        setColumnOrder(state.columnOrder || DEFAULT_COLUMN_ORDER)
        setVisibleColumns(state.visibleColumns || DEFAULT_VISIBLE_COLUMNS)
        setSortBy(state.sortBy || 'chapter')
        setSortDir(state.sortDir || 'asc')
      } catch (e) {
        console.error('Failed to load table state:', e)
      }
    }
  }, [])

  // Save table state to localStorage whenever it changes (RULE #19.5B)
  useEffect(() => {
    const state = {
      columnWidths,
      columnOrder,
      visibleColumns,
      sortBy,
      sortDir
    }
    localStorage.setItem('lexiconTableViewState', JSON.stringify(state))
  }, [columnWidths, columnOrder, visibleColumns, sortBy, sortDir])

  // Column resizing handlers (RULE #19.4)
  const handleResizeStart = (e, columnKey) => {
    e.stopPropagation()
    setResizingColumn(columnKey)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[columnKey] || 200)
  }

  const handleResizeMove = (e) => {
    if (!resizingColumn) return
    const diff = e.clientX - resizeStartX
    const newWidth = Math.max(100, resizeStartWidth + diff) // Min 100px
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }))
  }

  const handleResizeEnd = () => {
    setResizingColumn(null)
  }

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth])

  // Scroll handlers for sticky horizontal scrollbar
  const handleScroll = (e) => {
    const container = e.target
    const { scrollLeft, scrollTop } = container

    // Sync horizontal sticky scrollbar
    if (stickyScrollbarRef.current) {
      stickyScrollbarRef.current.scrollLeft = scrollLeft
    }

    // Log scroll position occasionally (every 100px)
    if (Math.floor(scrollLeft / 100) !== Math.floor((scrollLeft - 1) / 100)) {
      console.log('📊 Lexicon scroll:', { scrollLeft, scrollTop })
    }
  }

  const handleStickyScroll = (e) => {
    const scrollLeft = e.target.scrollLeft
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft
      console.log('📊 Lexicon sticky scrollbar scrolled to:', scrollLeft)
    }
  }

  // Track table scroll width for sticky scrollbar
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      console.log('📊 Lexicon: No scroll container ref')
      return
    }

    const updateScrollbar = () => {
      const { scrollWidth, clientWidth, offsetWidth } = container
      console.log('📊 Lexicon table dimensions:', {
        scrollWidth,
        clientWidth,
        offsetWidth,
        needsHorizontalScroll: scrollWidth > clientWidth,
        overflow: scrollWidth - clientWidth
      })
      setTableScrollWidth(scrollWidth)
    }

    updateScrollbar()
    const resizeObserver = new ResizeObserver(updateScrollbar)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [columnWidths])

  // Column reordering handlers (RULE #19.5)
  const handleDragStart = (e, columnKey) => {
    setDraggedColumn(columnKey)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetColumnKey) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === targetColumnKey) {
      setDraggedColumn(null)
      return
    }

    const draggedIndex = columnOrder.indexOf(draggedColumn)
    const targetIndex = columnOrder.indexOf(targetColumnKey)

    const newOrder = [...columnOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedColumn)

    setColumnOrder(newOrder)
    setDraggedColumn(null)
  }

  // Column visibility toggle (RULE #19.10)
  const handleToggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // Row selection handlers (RULE #19.1)
  const handleSelectAll = () => {
    if (selectedRows.size === filteredAndSorted.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredAndSorted.map(e => e.id)))
    }
  }

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  // Bulk action handlers (RULE #19.1)
  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedRows.size} selected entries?`)) return

    selectedRows.forEach(id => {
      const entry = entries.find(e => e.id === id)
      if (entry) onDelete(entry)
    })
    setSelectedRows(new Set())
  }

  // Column filter handler (RULE #19.1)
  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  // Filter and sort entries
  const filteredAndSorted = useMemo(() => {
    let result = [...entries]

    // Apply search (RULE #19.20)
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(e =>
        e.title?.toLowerCase().includes(query) ||
        e.component?.toLowerCase().includes(query) ||
        e.scenario?.toLowerCase().includes(query) ||
        e.root_cause?.toLowerCase().includes(query) ||
        e.solution?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query)
      )
    }

    // Apply inline column filters (RULE #19.1)
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'chapter':
          result = result.filter(e => e.chapter_number === parseInt(value))
          break
        case 'type':
          result = result.filter(e => e.entry_type === value)
          break
        case 'trinity':
          result = result.filter(e => {
            try {
              if (!e.related_rules) return false
              const docs = JSON.parse(e.related_rules)
              if (!docs || !Array.isArray(docs) || docs.length === 0) return false
              const trinityType = docs[0].type?.toLowerCase()
              return trinityType === value
            } catch (error) {
              return false
            }
          })
          break
        case 'title':
          result = result.filter(e => e.title?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'component':
          result = result.filter(e => e.component?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'status':
          result = result.filter(e => e.status === value)
          break
        case 'severity':
          result = result.filter(e => e.severity === value)
          break
      }
    })

    // Apply global filters (legacy)
    if (filters.chapter !== 'all') {
      result = result.filter(e => e.chapter_number === parseInt(filters.chapter))
    }
    if (filters.type !== 'all') {
      result = result.filter(e => e.entry_type === filters.type)
    }
    if (filters.status !== 'all') {
      result = result.filter(e => e.status === filters.status)
    }
    if (filters.severity !== 'all') {
      result = result.filter(e => e.severity === filters.severity)
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal

      switch (sortBy) {
        case 'chapter':
          aVal = a.chapter_number
          bVal = b.chapter_number
          break
        case 'title':
          aVal = a.title || ''
          bVal = b.title || ''
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          aVal = severityOrder[a.severity] || 0
          bVal = severityOrder[b.severity] || 0
          break
        case 'component':
          aVal = a.component || ''
          bVal = b.component || ''
          break
        case 'type':
          aVal = a.entry_type || ''
          bVal = b.entry_type || ''
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [entries, search, filters, sortBy, sortDir, columnFilters])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null
    return sortDir === 'asc'
      ? <ChevronUpIcon className="w-4 h-4 inline ml-1 text-indigo-600 dark:text-indigo-400" />
      : <ChevronDownIcon className="w-4 h-4 inline ml-1 text-indigo-600 dark:text-indigo-400" />
  }

  const uniqueChapters = useMemo(() => {
    const chapters = [...new Set(entries.map(e => e.chapter_number))].sort((a, b) => a - b)
    return chapters.map(num => ({ value: num, label: `Ch ${num}: ${CHAPTER_NAMES[num]}` }))
  }, [entries])

  const getColumnLabel = (key) => {
    const column = COLUMNS.find(c => c.key === key)
    return column ? column.label : key
  }

  const renderCellContent = (entry, columnKey) => {
    switch (columnKey) {
      case 'select':
        return (
          <input
            type="checkbox"
            checked={selectedRows.has(entry.id)}
            onChange={(e) => {
              e.stopPropagation()
              handleSelectRow(entry.id)
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
        )

      case 'expand':
        return (
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {expandedRows.has(entry.id) ? '▼' : '▶'}
          </span>
        )

      case 'chapter':
        return (
          <>
            <div className="font-medium">Ch {entry.chapter_number}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {CHAPTER_NAMES[entry.chapter_number]
                ? (CHAPTER_NAMES[entry.chapter_number].length > 20
                    ? CHAPTER_NAMES[entry.chapter_number].substring(0, 20) + '...'
                    : CHAPTER_NAMES[entry.chapter_number])
                : 'Unknown Chapter'}
            </div>
          </>
        )

      case 'type':
        return (
          <>
            {entry.entry_type === 'bug' && '🐛'}
            {entry.entry_type === 'architecture' && '🏛️'}
            {entry.entry_type === 'test' && '📊'}
            {entry.entry_type === 'note' && '🎓'}
            <span className="ml-1 text-xs">{entry.entry_type}</span>
          </>
        )

      case 'trinity': {
        // Parse current trinity selection from related_rules field (single-select only)
        let selectedTrinity = null
        try {
          if (entry.related_rules) {
            const docs = JSON.parse(entry.related_rules)
            if (docs && Array.isArray(docs) && docs.length > 0) {
              const firstDoc = docs[0]
              if (firstDoc.type === 'Bible') selectedTrinity = 'bible'
              else if (firstDoc.type === 'Teacher') selectedTrinity = 'teacher'
              else if (firstDoc.type === 'Lexicon') selectedTrinity = 'lexicon'
            }
          }
        } catch (e) {
          // Invalid JSON, use null
        }

        const handleTrinityChange = async (trinityType) => {
          // Build new related_rules array with only ONE selected item
          const newDocs = []
          if (trinityType === 'bible') {
            newDocs.push({ type: 'Bible', reference: `Ch${entry.chapter_number}` })
          } else if (trinityType === 'teacher') {
            newDocs.push({ type: 'Teacher', reference: `Ch${entry.chapter_number}` })
          } else if (trinityType === 'lexicon') {
            newDocs.push({ type: 'Lexicon', reference: `Ch${entry.chapter_number}` })
          }

          // Save to API
          try {
            await fetch(`http://localhost:3000/api/v1/trinity/${entry.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                trinity: {
                  related_rules: JSON.stringify(newDocs)
                }
              })
            })
            // Force parent to reload data
            window.location.reload()
          } catch (error) {
            console.error('Failed to update Trinity:', error)
          }
        }

        return (
          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
              <input
                type="radio"
                name={`trinity-${entry.id}`}
                checked={selectedTrinity === 'bible'}
                onChange={() => handleTrinityChange('bible')}
                className="h-3 w-3 border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-purple-700 dark:text-purple-400 font-medium">📖 Bible</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
              <input
                type="radio"
                name={`trinity-${entry.id}`}
                checked={selectedTrinity === 'teacher'}
                onChange={() => handleTrinityChange('teacher')}
                className="h-3 w-3 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-blue-700 dark:text-blue-400 font-medium">🔧 Teacher</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
              <input
                type="radio"
                name={`trinity-${entry.id}`}
                checked={selectedTrinity === 'lexicon'}
                onChange={() => handleTrinityChange('lexicon')}
                className="h-3 w-3 border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-green-700 dark:text-green-400 font-medium">📕 Lexicon</span>
            </label>
          </div>
        )
      }

      case 'title':
        return <div className="max-w-md truncate font-medium">{entry.title}</div>

      case 'component':
        return entry.component || '-'

      case 'status':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
            {STATUS_ICONS[entry.status]} {entry.status?.replace('_', ' ')}
          </span>
        )

      case 'severity':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${SEVERITY_COLORS[entry.severity]}`}>
            {entry.severity}
          </span>
        )

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(entry) }}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry) }}
              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <style>{`
        /* Lexicon sticky horizontal scrollbar styling */
        .lexicon-sticky-scroll::-webkit-scrollbar {
          -webkit-appearance: none !important;
          height: 14px !important;
        }
        .lexicon-sticky-scroll::-webkit-scrollbar-track {
          background: #E5E7EB !important;
          border-radius: 0 !important;
        }
        .lexicon-sticky-scroll::-webkit-scrollbar-thumb {
          background: #6B7280 !important;
          border-radius: 4px !important;
          border: 2px solid #E5E7EB !important;
        }
        .lexicon-sticky-scroll::-webkit-scrollbar-thumb:hover {
          background: #4B5563 !important;
        }
        .dark .lexicon-sticky-scroll::-webkit-scrollbar-track {
          background: #374151 !important;
        }
        .dark .lexicon-sticky-scroll::-webkit-scrollbar-thumb {
          background: #9CA3AF !important;
          border-color: #374151 !important;
        }
        .dark .lexicon-sticky-scroll::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB !important;
        }
      `}</style>
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Bulk Action Bar (RULE #19.1 - shown when rows selected) */}
      {selectedRows.size > 0 && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
              {selectedRows.size} {selectedRows.size === 1 ? 'entry' : 'entries'} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert('Lexicon edit functionality coming soon! This will allow you to edit selected entries.')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Search, Filters, and Column Visibility (RULE #19.20, #19.10) */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4 flex-shrink-0">
        {/* Search Box with Clear Button (RULE #19.20) */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all fields..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Column Visibility Toggle (RULE #19.10) */}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
              <EyeIcon className="h-5 w-5" />
              Columns
            </MenuButton>

            <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {COLUMNS.filter(col => col.key !== 'actions' && col.key !== 'expand' && col.key !== 'select').map((column) => (
                  <MenuItem key={column.key}>
                    {({ focus }) => (
                      <button
                        onClick={() => handleToggleColumn(column.key)}
                        className={`${
                          focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[column.key]}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <span className="ml-3">{column.label}</span>
                      </button>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>
        </div>

        {/* Search Results Count (RULE #19.20) */}
        {search && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Found {filteredAndSorted.length} of {entries.length} entries
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Filters:</span>
          </div>

          <select
            value={filters.chapter}
            onChange={(e) => setFilters({ ...filters, chapter: e.target.value })}
            className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Chapters</option>
            {uniqueChapters.map(ch => (
              <option key={ch.value} value={ch.value}>{ch.label}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="bug">🐛 Bugs</option>
            <option value="architecture">🏛️ Architecture</option>
            <option value="test">📊 Tests</option>
            <option value="note">🎓 Notes</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="open">⚡ Open</option>
            <option value="fixed">✅ Fixed</option>
            <option value="by_design">⚠️ By Design</option>
            <option value="monitoring">🔄 Monitoring</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            Showing {filteredAndSorted.length} of {entries.length} entries
          </div>
        </div>
      </div>

      {/* Table Container with Sticky Scrollbar - using flex layout */}
      <div className="flex-1 min-h-0 flex flex-col px-4">
        {/* Table with Sticky Gradient Headers (RULE #19.2) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-scroll overflow-x-auto relative bg-white dark:bg-gray-900"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB'
          }}
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                const column = COLUMNS.find(c => c.key === colKey)
                if (!column) return null

                return (
                  <th
                    key={colKey}
                    draggable={column.resizable}
                    onDragStart={(e) => handleDragStart(e, colKey)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, colKey)}
                    onClick={() => column.sortable && handleSort(colKey)}
                    style={{
                      width: columnWidths[colKey],
                      minWidth: columnWidths[colKey],
                      position: 'relative'
                    }}
                    className={`group px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide transition-colors ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                    } ${draggedColumn === colKey ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                  >
                    {/* Select All Checkbox (RULE #19.1) */}
                    {colKey === 'select' ? (
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectAll()
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {column.resizable && (
                            <Bars3Icon className="h-4 w-4 text-gray-400 cursor-move" />
                          )}
                          <span>{column.label}</span>
                          {column.sortable && <SortIcon column={colKey} />}
                        </div>

                        {/* Inline Column Filter (RULE #19.1) */}
                        {column.filterable && column.filterType === 'text' && (
                          <input
                            type="text"
                            placeholder="Filter..."
                            value={columnFilters[colKey] || ''}
                            onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        )}

                        {column.filterable && column.filterType === 'dropdown' && (
                          <select
                            value={columnFilters[colKey] || ''}
                            onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">All</option>
                            {colKey === 'chapter' && uniqueChapters.map(ch => (
                              <option key={ch.value} value={ch.value}>{ch.label}</option>
                            ))}
                            {colKey === 'type' && (
                              <>
                                <option value="bug">Bug</option>
                                <option value="architecture">Architecture</option>
                                <option value="test">Test</option>
                                <option value="note">Note</option>
                              </>
                            )}
                            {colKey === 'status' && (
                              <>
                                <option value="open">Open</option>
                                <option value="fixed">Fixed</option>
                                <option value="by_design">By Design</option>
                                <option value="monitoring">Monitoring</option>
                              </>
                            )}
                            {colKey === 'severity' && (
                              <>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </>
                            )}
                            {colKey === 'trinity' && (
                              <>
                                <option value="bible">📖 Bible</option>
                                <option value="teacher">🔧 Teacher</option>
                                <option value="lexicon">📕 Lexicon</option>
                              </>
                            )}
                          </select>
                        )}
                      </>
                    )}

                    {/* Resize Handle (RULE #19.4) */}
                    {column.resizable && (
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
                        onMouseDown={(e) => handleResizeStart(e, colKey)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSorted.map(entry => (
              <React.Fragment key={entry.id}>
                <tr
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                  onClick={() => toggleRow(entry.id)}
                >
                  {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                    const column = COLUMNS.find(c => c.key === colKey)
                    if (!column) return null

                    return (
                      <td
                        key={colKey}
                        style={{
                          width: columnWidths[colKey],
                          minWidth: columnWidths[colKey],
                          maxWidth: columnWidths[colKey]
                        }}
                        className={`px-4 py-3 text-sm text-gray-900 dark:text-white ${
                          colKey === 'expand' || colKey === 'select' ? 'text-center' : ''
                        } ${colKey === 'title' || colKey === 'chapter' || colKey === 'component' ? '' : 'whitespace-nowrap'}`}
                      >
                        {renderCellContent(entry, colKey)}
                      </td>
                    )
                  })}
                </tr>
                {expandedRows.has(entry.id) && (
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={columnOrder.filter(key => visibleColumns[key]).length} className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {entry.scenario && (
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Scenario</div>
                            <div className="text-gray-600 dark:text-gray-400">{entry.scenario}</div>
                          </div>
                        )}
                        {entry.root_cause && (
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Root Cause</div>
                            <div className="text-gray-600 dark:text-gray-400">{entry.root_cause}</div>
                          </div>
                        )}
                        {entry.solution && (
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Solution</div>
                            <div className="text-gray-600 dark:text-gray-400">{entry.solution}</div>
                          </div>
                        )}
                        {entry.prevention && (
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Prevention</div>
                            <div className="text-gray-600 dark:text-gray-400">{entry.prevention}</div>
                          </div>
                        )}
                        {entry.description && (
                          <div className="md:col-span-2">
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</div>
                            <div className="text-gray-600 dark:text-gray-400">{entry.description}</div>
                          </div>
                        )}
                        <div className="md:col-span-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                          {entry.first_reported && (
                            <div>First Reported: {entry.first_reported}</div>
                          )}
                          {entry.last_occurred && (
                            <div>Last Occurred: {entry.last_occurred}</div>
                          )}
                          {entry.fixed_date && (
                            <div>Fixed: {entry.fixed_date}</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No entries found matching your filters
          </div>
        )}
      </div>

        {/* Sticky Horizontal Scrollbar - Always visible at bottom of table */}
        <div
          ref={stickyScrollbarRef}
          onScroll={handleStickyScroll}
          className="lexicon-sticky-scroll overflow-x-scroll overflow-y-hidden border-t-2 border-gray-400 dark:border-gray-500 flex-shrink-0"
          style={{
            height: '20px',
            scrollbarWidth: 'auto',
            scrollbarColor: '#6B7280 #E5E7EB',
            backgroundColor: '#F3F4F6'
          }}
        >
          <div style={{ width: `${Math.max(tableScrollWidth, 100)}px`, height: '100%' }} />
        </div>
      </div>
    </div>
    </>
  )
}
