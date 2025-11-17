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
  ChevronDownIcon,
  CheckIcon
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

// Define columns (Chapter 20: Checkbox column must be first, locked, and minimal size)
const COLUMNS = [
  { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 32 },
  { key: 'chapter', label: 'Chapter', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 200, tooltip: 'Chapter number and name' },
  { key: 'section', label: 'Section', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 100, tooltip: 'Section number (e.g., 2.01)' },
  { key: 'type', label: 'Type', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 120 },
  { key: 'title', label: 'Title', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 300 },
  { key: 'content', label: 'Content', resizable: true, sortable: false, filterable: true, filterType: 'text', width: 400 },
  { key: 'component', label: 'Component', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 180 },
  { key: 'status', label: 'Status', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 140 },
  { key: 'severity', label: 'Severity', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 120 },
  { key: 'audit', label: 'Audit', resizable: true, sortable: true, filterable: false, width: 180, tooltip: 'Last modification date and user' }
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

export default function TrinityTableView({ entries, onEdit, onDelete, stats, category = null, customActions = null }) {
  // category can be: null (show all), 'bible', 'teacher', or 'lexicon'
  // customActions: optional array of custom button elements to display after Columns button
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('chapter')
  const [sortDir, setSortDir] = useState('asc')
  const [filters, setFilters] = useState({
    chapter: 'all',
    type: 'all',
    status: 'all',
    severity: 'all'
  })

  // Get current user for audit trail
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        return userData.name || userData.email || 'User'
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e)
    }
    return 'User'
  }

  // Row selection state (Chapter 20: Always enabled for multi-select)
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Bulk action state - show delete only after edit clicked
  const [showDeleteButton, setShowDeleteButton] = useState(false)

  // Edit mode state - when true, all cells are unlocked for editing
  const [editModeActive, setEditModeActive] = useState(false)

  // Inline editing state (Chapter 20.2)
  const [editingRowId, setEditingRowId] = useState(null)
  const [editingData, setEditingData] = useState({})

  // Inline column filters (Chapter 20.1)
  const [columnFilters, setColumnFilters] = useState({})

  // Modal state for viewing full row details
  const [selectedEntry, setSelectedEntry] = useState(null)

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

  // Load table state from localStorage on mount (Chapter 20.5B)
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

  // Save table state to localStorage whenever it changes (Chapter 20.5B)
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

  // Column resizing handlers (Chapter 20.4)
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

  // Column reordering handlers (Chapter 20.5)
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

  // Column visibility toggle (Chapter 20.10)
  const handleToggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // Row selection handlers (Chapter 20: Multi-select with bulk actions)
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

  // Bulk action handlers (Chapter 20: Delete with confirmation)
  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedRows.size} selected entries?`)) return

    selectedRows.forEach(id => {
      const entry = entries.find(e => e.id === id)
      if (entry) onDelete(entry)
    })
    setSelectedRows(new Set())
  }

  // Column filter handler (Chapter 20.1)
  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  // Filter and sort entries
  const filteredAndSorted = useMemo(() => {
    let result = [...entries]

    // Apply category filter if specified
    if (category) {
      result = result.filter(e => e.category === category)
    }

    // Apply search (Chapter 20.20)
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

    // Apply inline column filters (Chapter 20.1)
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'category':
          result = result.filter(e => e.category === value)
          break
        case 'chapter':
          result = result.filter(e => e.chapter_number === parseInt(value))
          break
        case 'section':
          result = result.filter(e => e.section_number?.toLowerCase().includes(value.toLowerCase()) || e.section_display?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'type':
          result = result.filter(e => e.entry_type === value)
          break
        case 'title':
          result = result.filter(e => e.title?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'content':
          result = result.filter(e => {
            const searchIn = [
              e.description,
              e.details,
              e.summary,
              e.scenario,
              e.solution,
              e.examples,
              e.code_example
            ].filter(Boolean).join(' ').toLowerCase()
            return searchIn.includes(value.toLowerCase())
          })
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
        case 'category':
          aVal = a.category || ''
          bVal = b.category || ''
          break
        case 'chapter':
          aVal = a.chapter_number
          bVal = b.chapter_number
          break
        case 'section':
          aVal = a.section_number || ''
          bVal = b.section_number || ''
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
        case 'audit':
          aVal = a.updated_at ? new Date(a.updated_at).getTime() : 0
          bVal = b.updated_at ? new Date(b.updated_at).getTime() : 0
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [entries, search, filters, sortBy, sortDir, columnFilters, category])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null
    return sortDir === 'asc'
      ? <ChevronUpIcon className="w-4 h-4 inline ml-1 text-white" />
      : <ChevronDownIcon className="w-4 h-4 inline ml-1 text-white" />
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

      case 'chapter':
        return (
          <div className="truncate">
            <span className="font-medium">Ch {entry.chapter_number}</span>
            {CHAPTER_NAMES[entry.chapter_number] && (
              <span className="text-gray-500 dark:text-gray-400"> - {CHAPTER_NAMES[entry.chapter_number]}</span>
            )}
          </div>
        )

      case 'section':
        if (!entry.section_number) {
          return <span className="text-gray-400">-</span>
        }

        // Format section number as X.YY (e.g., 2.01, 2.10, 19.11)
        // Handle both "X.Y" format and "X-Y" format (which should be converted to "X.Y")
        let formattedSection = entry.section_number

        if (entry.section_number.includes('.')) {
          // Already has dot notation - just ensure padding
          const parts = entry.section_number.split('.')
          if (parts.length === 2) {
            const [chapter, section] = parts
            // Only pad if section is a number (not already padded or formatted)
            const sectionNum = section.trim()
            formattedSection = sectionNum.length === 1
              ? `${chapter}.${sectionNum.padStart(2, '0')}`
              : `${chapter}.${sectionNum}`
          }
        } else if (entry.section_number.includes('-')) {
          // Has hyphen - this is likely a range that was incorrectly stored
          // For now, display as-is but this indicates data quality issue
          formattedSection = entry.section_number
        }

        return (
          <div className="font-mono font-medium text-indigo-700 dark:text-indigo-400">
            {formattedSection}
          </div>
        )

      case 'type':
        return (
          <>
            {entry.entry_type === 'bug' && '🐛'}
            {entry.entry_type === 'architecture' && '🏛️'}
            {entry.entry_type === 'test' && '📊'}
            {entry.entry_type === 'note' && '🎓'}
            <span className="ml-1">{entry.entry_type}</span>
          </>
        )

      case 'title':
        if (editingRowId === entry.id) {
          return (
            <input
              type="text"
              value={editingData.title || ''}
              onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
              autoFocus
            />
          )
        }
        return <div className="truncate font-medium">{entry.title}</div>

      case 'content':
        if (editingRowId === entry.id) {
          return (
            <textarea
              value={editingData.description || ''}
              onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              rows={2}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
            />
          )
        }

        // Show the primary content field based on category
        let contentText = ''
        if (entry.category === 'bible') {
          // Bible: show description or details
          contentText = entry.description || entry.details || entry.examples || ''
        } else if (entry.category === 'teacher') {
          // Teacher: show summary or description
          contentText = entry.summary || entry.description || entry.code_example || ''
        } else if (entry.category === 'lexicon') {
          // Lexicon: show scenario or description
          contentText = entry.scenario || entry.description || entry.solution || ''
        } else {
          // Fallback
          contentText = entry.description || entry.details || entry.summary || ''
        }

        // Truncate to reasonable length for table cell
        const maxLength = 150
        const displayText = contentText.length > maxLength
          ? contentText.substring(0, maxLength) + '...'
          : contentText

        return (
          <div className="truncate text-gray-600 dark:text-gray-400">
            {displayText || '-'}
          </div>
        )

      case 'component':
        if (editingRowId === entry.id) {
          return (
            <input
              type="text"
              value={editingData.component || ''}
              onChange={(e) => setEditingData({ ...editingData, component: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )
        }
        return <span>{entry.component || '-'}</span>

      case 'status':
        if (editingRowId === entry.id) {
          return (
            <select
              value={editingData.status || entry.status || ''}
              onChange={(e) => setEditingData({ ...editingData, status: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="open">⚡ Open</option>
              <option value="fixed">✅ Fixed</option>
              <option value="by_design">⚠️ By Design</option>
              <option value="monitoring">🔄 Monitoring</option>
            </select>
          )
        }
        return (
          <span
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status]}`}
          >
            {STATUS_ICONS[entry.status]} {entry.status?.replace('_', ' ')}
          </span>
        )

      case 'severity':
        if (editingRowId === entry.id) {
          return (
            <select
              value={editingData.severity || entry.severity || ''}
              onChange={(e) => setEditingData({ ...editingData, severity: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          )
        }
        return (
          <span
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${SEVERITY_COLORS[entry.severity]}`}
          >
            {entry.severity}
          </span>
        )

      case 'audit':
        if (!entry.updated_at) {
          return <span className="text-gray-400 text-xs">Never</span>
        }

        // Format timestamp to Australian format
        const updatedDate = new Date(entry.updated_at)
        const formattedDate = updatedDate.toLocaleDateString('en-AU', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
        const formattedTime = updatedDate.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

        // Show who made the update from the database, or fallback to current user
        const updatedBy = entry.updated_by
          ? `by ${entry.updated_by}`
          : `by ${getCurrentUser()} via Claude`

        return (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div className="font-medium">{formattedDate}</div>
            <div className="text-gray-500 dark:text-gray-500">{formattedTime}</div>
            <div className="text-gray-500 dark:text-gray-500 italic">{updatedBy}</div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <style>{`
        /* Trinity table scrollbar styling - blue theme */
        .trinity-table-scroll::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .trinity-table-scroll::-webkit-scrollbar-track {
          background: #E0E7FF;
          border-radius: 6px;
        }
        .trinity-table-scroll::-webkit-scrollbar-thumb {
          background: #2563EB;
          border-radius: 6px;
          border: 2px solid #E0E7FF;
        }
        .trinity-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #1D4ED8;
        }
        .dark .trinity-table-scroll::-webkit-scrollbar-track {
          background: #1E293B;
        }
        .dark .trinity-table-scroll::-webkit-scrollbar-thumb {
          background: #1E40AF;
          border-color: #1E293B;
        }
        .dark .trinity-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #1E3A8A;
        }

        /* Cursor styles for table headers */
        .trinity-resize-handle {
          cursor: col-resize;
        }
        .trinity-drag-handle {
          cursor: grab;
        }
        .trinity-drag-handle:active {
          cursor: grabbing;
        }
      `}</style>
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header with Search, Filters, and Column Visibility (Chapter 20.20, #19.10) */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4 flex-shrink-0">
        {/* Quick Filter Buttons - Only show when viewing all categories */}
        {!category && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters:</span>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleColumnFilterChange('category', '')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                !columnFilters.category
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ✨ All Categories
            </button>
            <button
              onClick={() => handleColumnFilterChange('category', 'bible')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                columnFilters.category === 'bible'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ring-2 ring-purple-500'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              📖 Bible
            </button>
            <button
              onClick={() => handleColumnFilterChange('category', 'teacher')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                columnFilters.category === 'teacher'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              🔧 Teacher
            </button>
            <button
              onClick={() => handleColumnFilterChange('category', 'lexicon')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                columnFilters.category === 'lexicon'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ring-2 ring-orange-500'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              📕 Lexicon
            </button>
          </div>

          {/* Clear All Filters Button */}
          {Object.values(columnFilters).some(v => v) && (
            <button
              onClick={() => setColumnFilters({})}
              className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-medium rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
        )}

        {/* Search Box with Clear Button (Chapter 20.20) */}
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

          {/* Column Visibility Toggle (Chapter 20.10) */}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex items-center gap-x-2 rounded-lg bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 h-[42px]">
              <EyeIcon className="h-5 w-5" />
              Columns
            </MenuButton>

            <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {COLUMNS.filter(col => col.key !== 'select').map((column) => (
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

          {/* Custom Action Buttons (Chapter 20: Add, Import, etc.) */}
          {customActions && customActions}

          {/* Edit Mode Toggle - Always visible */}
          <button
            onClick={() => {
              // Toggle edit mode - unlock all cells
              setEditModeActive(!editModeActive)
              setShowDeleteButton(!editModeActive) // Show delete when entering edit mode
            }}
            className="inline-flex items-center gap-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors h-[42px]"
          >
            <PencilIcon className="h-4 w-4" />
            {editModeActive ? 'Lock Cells' : 'Edit'}
          </button>

          {/* Inline Editing Buttons - Always visible when row is being edited */}
          {editingRowId && (
            <>
              {/* Save button when in edit mode */}
              <button
                onClick={() => {
                  const entry = filteredAndSorted.find(e => e.id === editingRowId)
                  if (entry) {
                    // Merge edited data with original entry
                    const updatedEntry = { ...entry, ...editingData }
                    onEdit(updatedEntry)
                    setEditingRowId(null)
                    setEditingData({})
                    setSelectedRows(new Set())
                    setShowDeleteButton(false)
                    setEditModeActive(false)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors h-[42px]"
              >
                <CheckIcon className="h-4 w-4" />
                Save
              </button>
              {/* Cancel button when in edit mode */}
              <button
                onClick={() => {
                  setEditingRowId(null)
                  setEditingData({})
                  setShowDeleteButton(false)
                  setEditModeActive(false)
                  setSelectedRows(new Set())
                }}
                className="inline-flex items-center gap-2 px-4 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors h-[42px]"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </button>
            </>
          )}

          {/* Delete and Export Buttons - Only visible when rows selected and edit mode active */}
          {selectedRows.size > 0 && editModeActive && !editingRowId && (
            <>
              {editModeActive && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedRows.size} ${selectedRows.size === 1 ? 'entry' : 'entries'}?`)) {
                      const selectedEntryIds = Array.from(selectedRows)
                      selectedEntryIds.forEach(id => {
                        fetch(`http://localhost:3000/api/v1/trinity/${id}`, {
                          method: 'DELETE'
                        }).catch(error => console.error('Error deleting entry:', error))
                      })
                      setSelectedRows(new Set())
                      setShowDeleteButton(false)
                      alert('Entries deleted successfully!')
                      window.location.reload()
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors h-[42px]"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  const selectedEntryIds = Array.from(selectedRows)
                  const selectedEntries = filteredAndSorted.filter(e => selectedEntryIds.includes(e.id))
                  const csvContent = [
                    ['Chapter', 'Section', 'Type', 'Title', 'Content', 'Component', 'Status', 'Severity'].join(','),
                    ...selectedEntries.map(e => [
                      `"${e.chapter_number} - ${CHAPTER_NAMES[e.chapter_number] || e.chapter_name}"`,
                      e.section_number || '',
                      e.entry_type || '',
                      `"${e.title?.replace(/"/g, '""')}"`,
                      `"${(e.description || e.details || e.scenario || '')?.replace(/"/g, '""')}"`,
                      `"${e.component?.replace(/"/g, '""') || ''}"`,
                      e.status || '',
                      e.severity || ''
                    ].join(','))
                  ].join('\n')

                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `trinity-export-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="inline-flex items-center gap-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors h-[42px]"
              >
                Export
              </button>
              <button
                onClick={() => {
                  setSelectedRows(new Set())
                  setShowDeleteButton(false)
                  setEditModeActive(false)
                }}
                className="inline-flex items-center gap-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors h-[42px]"
              >
                Clear Selection
              </button>
            </>
          )}
        </div>

        {/* Search Results Count (Chapter 20.20) */}
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

      {/* Table Container with borders on all sides */}
      <div className="flex-1 min-h-0 flex flex-col border border-gray-200 dark:border-gray-700 mx-4">
        {/* Table with Sticky Gradient Headers (Chapter 20.2) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="trinity-table-scroll flex-1 overflow-y-scroll overflow-x-auto relative bg-white dark:bg-gray-900"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#2563EB #E0E7FF'
          }}
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 backdrop-blur-sm bg-blue-600 dark:bg-blue-800">
            <tr className="border-b border-blue-700 dark:border-blue-900">
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
                      position: 'relative',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                    className={`group ${colKey === 'select' ? 'px-1 py-4' : 'px-6 py-4'} ${colKey === 'select' ? 'text-center' : 'text-left'} text-white tracking-wide transition-colors ${
                      column.sortable ? 'cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900' : ''
                    } ${draggedColumn === colKey ? 'bg-blue-700 dark:bg-blue-900' : ''}`}
                  >
                    {/* Select All Checkbox (Chapter 20.1) */}
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
                            <Bars3Icon className="h-4 w-4 text-gray-400 trinity-drag-handle" />
                          )}
                          <span>{column.label}</span>
                          {column.sortable && <SortIcon column={colKey} />}
                        </div>

                        {/* Column Resize Handle */}
                        {column.resizable && (
                          <div
                            onMouseDown={(e) => handleResizeStart(e, colKey)}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-blue-400 cursor-col-resize z-20"
                            style={{ cursor: 'col-resize' }}
                          />
                        )}

                        {/* Inline Column Filter (Chapter 20.1) */}
                        {column.filterable && column.filterType === 'text' && (
                          <input
                            type="text"
                            placeholder="Filter..."
                            value={columnFilters[colKey] || ''}
                            onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-blue-400 dark:border-blue-700 rounded focus:ring-1 focus:ring-white focus:border-white bg-blue-500 dark:bg-blue-700 text-white placeholder-blue-200 dark:placeholder-blue-300"
                          />
                        )}

                        {column.filterable && column.filterType === 'dropdown' && (
                          <select
                            value={columnFilters[colKey] || ''}
                            onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-blue-400 dark:border-blue-700 rounded focus:ring-1 focus:ring-white focus:border-white bg-blue-500 dark:bg-blue-700 text-white placeholder-blue-200 dark:placeholder-blue-300"
                          >
                            <option value="">All</option>
                            {colKey === 'category' && (
                              <>
                                <option value="bible">📖 Bible</option>
                                <option value="teacher">🔧 Teacher</option>
                                <option value="lexicon">📕 Lexicon</option>
                              </>
                            )}
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

                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSorted.map((entry, index) => (
              <tr
                key={entry.id}
                className={`${
                  editingRowId === entry.id
                    ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500'
                    : index % 2 === 0
                      ? 'bg-white dark:bg-gray-900'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                } hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-150`}
              >
                {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                  const column = COLUMNS.find(c => c.key === colKey)
                  if (!column) return null

                  return (
                    <td
                      key={colKey}
                      onDoubleClick={(e) => {
                        // Double-click any editable cell to start editing (only in edit mode)
                        const editableCells = ['title', 'content', 'component', 'status', 'severity']
                        if (editModeActive && editableCells.includes(colKey)) {
                          e.stopPropagation();
                          if (editingRowId !== entry.id) {
                            setEditingRowId(entry.id);
                            setEditingData(entry);
                            setSelectedRows(new Set([entry.id]));
                          }
                        }
                      }}
                      onClick={(e) => {
                        // Single-click on status/severity to start editing (only in edit mode)
                        if (editModeActive && (colKey === 'status' || colKey === 'severity')) {
                          e.stopPropagation();
                          if (editingRowId !== entry.id) {
                            setEditingRowId(entry.id);
                            setEditingData(entry);
                            setSelectedRows(new Set([entry.id]));
                          }
                        }
                      }}
                      style={{
                        width: columnWidths[colKey],
                        minWidth: columnWidths[colKey],
                        maxWidth: columnWidths[colKey],
                        fontSize: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      }}
                      className={`${colKey === 'select' ? 'px-1 py-1' : 'px-3 py-1'} text-gray-900 dark:text-white ${
                        colKey === 'select' ? 'text-center' : ''
                      } ${editModeActive && ['title', 'content', 'component', 'status', 'severity'].includes(colKey) && editingRowId !== entry.id ? 'cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : ''} whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}
                      title={editModeActive && editingRowId !== entry.id && ['title', 'content', 'component'].includes(colKey) ? 'Double-click to edit' : editModeActive && editingRowId !== entry.id && ['status', 'severity'].includes(colKey) ? 'Click to edit' : ''}
                    >
                      {renderCellContent(entry, colKey)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No entries found matching your filters
          </div>
        )}
      </div>
      </div>

      {/* Full Entry Details Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-blue-600 dark:bg-blue-800 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div>
                <div className="text-sm font-medium opacity-90">
                  Ch {selectedEntry.chapter_number} · {selectedEntry.section_number || 'No Section'}
                </div>
                <h2 className="text-xl font-bold mt-1">{selectedEntry.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</div>
                  <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {selectedEntry.category === 'bible' && '📖 Bible'}
                    {selectedEntry.category === 'teacher' && '🔧 Teacher'}
                    {selectedEntry.category === 'lexicon' && '📕 Lexicon'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</div>
                  <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedEntry.entry_type}
                  </div>
                </div>
                {selectedEntry.component && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Component</div>
                    <div className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                      {selectedEntry.component}
                    </div>
                  </div>
                )}
                {selectedEntry.status && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedEntry.status]}`}>
                        {STATUS_ICONS[selectedEntry.status]} {selectedEntry.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}
                {selectedEntry.severity && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Severity</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${SEVERITY_COLORS[selectedEntry.severity]}`}>
                        {selectedEntry.severity}
                      </span>
                    </div>
                  </div>
                )}
                {selectedEntry.difficulty && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Difficulty</div>
                    <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {selectedEntry.difficulty}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Fields - Bible */}
              {selectedEntry.category === 'bible' && (
                <>
                  {selectedEntry.description && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Description</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.description}</div>
                    </div>
                  )}
                  {selectedEntry.details && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Details</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.details}</div>
                    </div>
                  )}
                  {selectedEntry.examples && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Examples</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono">{selectedEntry.examples}</div>
                    </div>
                  )}
                  {selectedEntry.recommendations && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Recommendations</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.recommendations}</div>
                    </div>
                  )}
                </>
              )}

              {/* Content Fields - Teacher */}
              {selectedEntry.category === 'teacher' && (
                <>
                  {selectedEntry.summary && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Summary</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.summary}</div>
                    </div>
                  )}
                  {selectedEntry.description && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Description</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.description}</div>
                    </div>
                  )}
                  {selectedEntry.code_example && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Code Example</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono overflow-x-auto">{selectedEntry.code_example}</div>
                    </div>
                  )}
                  {selectedEntry.common_mistakes && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Common Mistakes</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.common_mistakes}</div>
                    </div>
                  )}
                  {selectedEntry.testing_strategy && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Testing Strategy</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.testing_strategy}</div>
                    </div>
                  )}
                </>
              )}

              {/* Content Fields - Lexicon */}
              {selectedEntry.category === 'lexicon' && (
                <>
                  {selectedEntry.scenario && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Scenario</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.scenario}</div>
                    </div>
                  )}
                  {selectedEntry.description && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Description</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.description}</div>
                    </div>
                  )}
                  {selectedEntry.root_cause && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Root Cause</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.root_cause}</div>
                    </div>
                  )}
                  {selectedEntry.solution && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Solution</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">{selectedEntry.solution}</div>
                    </div>
                  )}
                  {selectedEntry.prevention && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Prevention</div>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEntry.prevention}</div>
                    </div>
                  )}
                </>
              )}

              {/* Related Rules */}
              {selectedEntry.related_rules && (
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Related Rules</div>
                  <div className="text-sm text-gray-900 dark:text-white">{selectedEntry.related_rules}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedEntry(null); onEdit(selectedEntry); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedEntry(null); onDelete(selectedEntry); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
