import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const CHAPTER_NAMES = {
  0: 'Overview & System-Wide Patterns',
  1: 'Authentication & Users',
  2: 'System Administration',
  3: 'Contacts & Relationships',
  4: 'Price Books & Suppliers',
  5: 'Jobs & Construction Management',
  6: 'Estimates & Quoting',
  7: 'AI Plan Review',
  8: 'Purchase Orders',
  9: 'Gantt & Schedule Master',
  10: 'Project Tasks & Checklists',
  11: 'Weather & Public Holidays',
  12: 'OneDrive Integration',
  13: 'Outlook/Email Integration',
  14: 'Chat & Communications',
  15: 'Xero Accounting Integration',
  16: 'Payments & Financials',
  17: 'Workflows & Automation',
  18: 'Custom Tables & Formulas',
  19: 'UI/UX Standards & Patterns',
  20: 'Agent System & Automation'
}

// Extract "Related To" category from section title - categorize by PRIMARY subject
const extractRelatedTo = (title) => {
  const titleLower = title.toLowerCase()

  // Priority: Check beginning of title for main subject (most specific first)
  // This ensures we categorize by WHAT the rule is about, not what it mentions

  // UI Component Subjects (Chapter 19 primarily)
  if (titleLower.match(/^(table|advanced table|datatable)/)) return 'Table'
  if (titleLower.includes('scroll')) return 'Scroll'
  if (titleLower.includes('column') && !titleLower.includes('table')) return 'Column'
  if (titleLower.includes('row') && !titleLower.includes('table')) return 'Row'
  if (titleLower.includes('form')) return 'Form'
  if (titleLower.includes('modal') || titleLower.includes('drawer')) return 'Modal'
  if (titleLower.includes('toolbar')) return 'Toolbar'
  if (titleLower.includes('button')) return 'Button'
  if (titleLower.includes('badge') || titleLower.includes('status')) return 'Badge'
  if (titleLower.includes('tooltip')) return 'Tooltip'
  if (titleLower.includes('dropdown')) return 'Dropdown'
  if (titleLower.includes('layout')) return 'Layout'
  if (titleLower.includes('dark mode') || titleLower.includes('theme')) return 'Dark Mode'
  if (titleLower.includes('navigation') || titleLower.includes('nav')) return 'Navigation'
  if (titleLower.includes('header')) return 'Header'
  if (titleLower.includes('footer')) return 'Footer'

  // Data & State
  if (titleLower.includes('database') || titleLower.includes('schema')) return 'Database'
  if (titleLower.includes('api') || titleLower.includes('endpoint')) return 'API'
  if (titleLower.includes('state') || titleLower.includes('persistence')) return 'State'
  if (titleLower.includes('cache') || titleLower.includes('caching')) return 'Cache'

  // Search & Filtering
  if (titleLower.includes('search')) return 'Search'
  if (titleLower.includes('filter')) return 'Filter'
  if (titleLower.includes('sort')) return 'Sort'
  if (titleLower.includes('fuzzy') || titleLower.includes('matching')) return 'Matching'

  // Authentication & Security
  if (titleLower.includes('auth') || titleLower.includes('login') || titleLower.includes('token') || titleLower.includes('jwt')) return 'Auth'
  if (titleLower.includes('password') || titleLower.includes('security') || titleLower.includes('encryption')) return 'Security'
  if (titleLower.includes('permission') || titleLower.includes('role') || titleLower.includes('access')) return 'Permissions'

  // Integrations
  if (titleLower.includes('xero')) return 'Xero'
  if (titleLower.includes('onedrive')) return 'OneDrive'
  if (titleLower.includes('outlook') || titleLower.includes('email')) return 'Outlook'
  if (titleLower.includes('twilio') || titleLower.includes('sms')) return 'Twilio'
  if (titleLower.includes('ai') || titleLower.includes('claude') || titleLower.includes('grok')) return 'AI'

  // Business Logic
  if (titleLower.includes('gantt') || titleLower.includes('schedule') || titleLower.includes('cascade')) return 'Gantt'
  if (titleLower.includes('task')) return 'Task'
  if (titleLower.includes('job') || titleLower.includes('construction')) return 'Job'
  if (titleLower.includes('estimate') || titleLower.includes('quote')) return 'Estimate'
  if (titleLower.includes('purchase order') || titleLower.includes('po ')) return 'Purchase Order'
  if (titleLower.includes('price') || titleLower.includes('pricing')) return 'Pricing'
  if (titleLower.includes('contact') || titleLower.includes('relationship')) return 'Contact'
  if (titleLower.includes('payment') || titleLower.includes('invoice')) return 'Payment'
  if (titleLower.includes('workflow')) return 'Workflow'

  // Technical Patterns (lower priority - only if not a UI component)
  if (titleLower.includes('validation')) return 'Validation'
  if (titleLower.includes('transaction')) return 'Transaction'
  if (titleLower.includes('async') || titleLower.includes('background')) return 'Async'
  if (titleLower.includes('webhook')) return 'Webhook'
  if (titleLower.includes('sync') || titleLower.includes('synchronization')) return 'Sync'
  if (titleLower.includes('migration')) return 'Migration'
  if (titleLower.includes('timezone') || titleLower.includes('time zone')) return 'Timezone'
  if (titleLower.includes('date') || titleLower.includes('calendar')) return 'Date/Time'
  if (titleLower.includes('file') || titleLower.includes('upload') || titleLower.includes('download')) return 'File'
  if (titleLower.includes('image') || titleLower.includes('photo')) return 'Image'
  if (titleLower.includes('test') || titleLower.includes('testing')) return 'Testing'
  if (titleLower.includes('documentation') || titleLower.includes('lexicon')) return 'Documentation'

  // UI patterns (catch any table-related if not already caught)
  if (titleLower.includes('table')) return 'Table'

  return 'General'
}

// Parse markdown content to extract sections (§X.Y format)
const parseSectionsFromMarkdown = (content) => {
  if (!content) return []

  const lines = content.split('\n')
  const sections = []
  let currentChapter = 0
  let currentSection = null
  let collectingContent = false

  lines.forEach((line, index) => {
    // Match chapter headers: # Chapter X:
    const chapterMatch = line.match(/^#\s+Chapter\s+(\d+):/)
    if (chapterMatch) {
      return
    }

    // Match section headers: ## §X.Y:
    const sectionMatch = line.match(/^##\s+§([\d.]+):\s*(.+)/)
    if (sectionMatch) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection)
      }

      // Extract chapter from section number (§19.1 → chapter 19)
      const sectionNumber = sectionMatch[1]
      const sectionParts = sectionNumber.split('.')
      const chapterFromSection = parseInt(sectionParts[0])
      const title = sectionMatch[2].trim()

      // Start new section (use unique ID with index to avoid duplicates)
      currentSection = {
        id: `${sectionNumber}-${sections.length}`, // Unique ID to prevent duplicate keys
        sectionNumber: sectionNumber,
        chapter: chapterFromSection,
        chapterName: CHAPTER_NAMES[chapterFromSection] || `Chapter ${chapterFromSection}`,
        title: title,
        relatedTo: extractRelatedTo(title, chapterFromSection),
        content: '',
        lineNumber: index + 1
      }
      collectingContent = true
      return
    }

    // Match next heading (stop collecting)
    if (line.match(/^##\s+[^§]/) || line.match(/^#\s+/)) {
      collectingContent = false
      return
    }

    // Collect content for current section
    if (collectingContent && currentSection && line.trim()) {
      currentSection.content += line + '\n'
    }
  })

  // Add last section
  if (currentSection) {
    sections.push(currentSection)
  }

  return sections
}

// Define columns (RULE #19.33: Increased widths to force horizontal overflow)
const COLUMNS = [
  { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 50 },
  { key: 'section', label: 'Section §', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 150 },
  { key: 'chapter', label: 'Chapter', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 400 },
  { key: 'relatedTo', label: 'Related To', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 200 },
  { key: 'title', label: 'Title', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 600 },
  { key: 'content', label: 'Content', resizable: true, sortable: false, filterable: true, filterType: 'text', width: 1200 }
]
// Total: 2600px - ensures horizontal overflow on most screens

const DEFAULT_COLUMN_WIDTHS = COLUMNS.reduce((acc, col) => {
  acc[col.key] = col.width
  return acc
}, {})

const DEFAULT_COLUMN_ORDER = COLUMNS.map(c => c.key)

const DEFAULT_VISIBLE_COLUMNS = COLUMNS.reduce((acc, col) => {
  acc[col.key] = true
  return acc
}, {})

export default function TeacherTableView({ content }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('section')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [columnFilters, setColumnFilters] = useState({})

  // Column state management
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS)
  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMN_ORDER)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)

  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  // Column reordering state
  const [draggedColumn, setDraggedColumn] = useState(null)

  // RULE #19.33: Sticky horizontal scrollbar refs
  const scrollContainerRef = useRef(null)
  const stickyScrollbarRef = useRef(null)
  const isScrollingStickyRef = useRef(false)
  const isScrollingMainRef = useRef(false)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)

  // Track if initial load is complete to prevent saving stale data
  const hasLoadedRef = useRef(false)

  // Parse sections from markdown content
  const sections = useMemo(() => parseSectionsFromMarkdown(content), [content])

  // RULE #19.33: Scroll handlers with loop prevention
  const handleScroll = (e) => {
    if (isScrollingStickyRef.current) {
      isScrollingStickyRef.current = false
      return
    }

    isScrollingMainRef.current = true
    const scrollLeft = e.target.scrollLeft

    // Sync horizontal sticky scrollbar
    if (stickyScrollbarRef.current) {
      stickyScrollbarRef.current.scrollLeft = scrollLeft
    }

    setTimeout(() => { isScrollingMainRef.current = false }, 0)
  }

  const handleStickyScroll = (e) => {
    if (isScrollingMainRef.current) {
      isScrollingMainRef.current = false
      return
    }

    isScrollingStickyRef.current = true
    const scrollLeft = e.target.scrollLeft
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft
    }

    setTimeout(() => { isScrollingStickyRef.current = false }, 0)
  }

  // RULE #19.33: Version number to force-clear old localStorage when column widths change
  const STATE_VERSION = 2 // Increment when DEFAULT_COLUMN_WIDTHS change

  // Load table state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('teacherTableViewState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)

        // Check version - if old version, clear and use defaults
        if (state.version !== STATE_VERSION) {
          console.log('TeacherTableView: Clearing old localStorage (version mismatch)')
          localStorage.removeItem('teacherTableViewState')
          setColumnWidths(DEFAULT_COLUMN_WIDTHS)
          setColumnOrder(DEFAULT_COLUMN_ORDER)
          setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)
          hasLoadedRef.current = true
          return
        }

        setColumnWidths(state.columnWidths || DEFAULT_COLUMN_WIDTHS)
        setColumnOrder(state.columnOrder || DEFAULT_COLUMN_ORDER)
        setVisibleColumns(state.visibleColumns || DEFAULT_VISIBLE_COLUMNS)
        setSortBy(state.sortBy || 'section')
        setSortDir(state.sortDir || 'asc')
      } catch (e) {
        console.error('Failed to load table state:', e)
      }
    }
    hasLoadedRef.current = true
  }, [])

  // Save table state to localStorage (but only after initial load completes)
  useEffect(() => {
    if (!hasLoadedRef.current) return // Don't save during initial load

    const state = {
      version: STATE_VERSION,
      columnWidths,
      columnOrder,
      visibleColumns,
      sortBy,
      sortDir
    }
    localStorage.setItem('teacherTableViewState', JSON.stringify(state))
  }, [columnWidths, columnOrder, visibleColumns, sortBy, sortDir])

  // Column resizing handlers
  const handleResizeStart = (e, columnKey) => {
    e.stopPropagation()
    setResizingColumn(columnKey)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[columnKey] || 200)
  }

  const handleResizeMove = (e) => {
    if (!resizingColumn) return
    const diff = e.clientX - resizeStartX
    const newWidth = Math.max(100, resizeStartWidth + diff)
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

  // Column reordering handlers
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

  // Column visibility toggle
  const handleToggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // Row selection handlers
  const handleSelectAll = () => {
    if (selectedRows.size === filteredAndSorted.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredAndSorted.map(r => r.id)))
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

  // Column filter handler
  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  // Filter and sort sections
  const filteredAndSorted = useMemo(() => {
    let result = [...sections]

    // Apply search
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(s =>
        s.sectionNumber?.toLowerCase().includes(query) ||
        s.title?.toLowerCase().includes(query) ||
        s.chapterName?.toLowerCase().includes(query) ||
        s.content?.toLowerCase().includes(query)
      )
    }

    // Apply inline column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'section':
          result = result.filter(s => s.sectionNumber?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'chapter':
          result = result.filter(s => s.chapter === parseInt(value))
          break
        case 'relatedTo':
          result = result.filter(s => s.relatedTo === value)
          break
        case 'title':
          result = result.filter(s => s.title?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'content':
          result = result.filter(s => s.content?.toLowerCase().includes(value.toLowerCase()))
          break
      }
    })

    // Sort
    result.sort((a, b) => {
      let aVal, bVal

      switch (sortBy) {
        case 'section': {
          // Sort by section number (e.g., 0.1, 0.2, 19.1)
          const aParts = (a.sectionNumber || '').split('.').map(n => parseInt(n))
          const bParts = (b.sectionNumber || '').split('.').map(n => parseInt(n))
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aNum = aParts[i] || 0
            const bNum = bParts[i] || 0
            if (aNum !== bNum) return sortDir === 'asc' ? aNum - bNum : bNum - aNum
          }
          return 0
        }
        case 'chapter':
          aVal = a.chapter
          bVal = b.chapter
          break
        case 'relatedTo':
          aVal = a.relatedTo || ''
          bVal = b.relatedTo || ''
          break
        case 'title':
          aVal = a.title || ''
          bVal = b.title || ''
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [sections, search, columnFilters, sortBy, sortDir])

  // RULE #19.33: Track table width with ResizeObserver
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollbar = () => {
      // IMPORTANT: Measure actual table element, not container
      const table = container.querySelector('table')
      const actualTableWidth = table ? table.offsetWidth : container.scrollWidth

      setTableScrollWidth(actualTableWidth)
    }

    updateScrollbar()

    // Update on resize (column resize, window resize, etc.)
    const resizeObserver = new ResizeObserver(updateScrollbar)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [filteredAndSorted, columnWidths])

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
      ? <ChevronUpIcon className="w-4 h-4 inline ml-1 text-indigo-600 dark:text-indigo-400" />
      : <ChevronDownIcon className="w-4 h-4 inline ml-1 text-indigo-600 dark:text-indigo-400" />
  }

  const uniqueChapters = useMemo(() => {
    const chapters = [...new Set(sections.map(s => s.chapter))].sort((a, b) => a - b)
    return chapters.map(num => ({ value: num, label: `Ch ${num}: ${CHAPTER_NAMES[num]}` }))
  }, [sections])

  const uniqueRelatedTo = useMemo(() => {
    const relatedToValues = [...new Set(sections.map(s => s.relatedTo).filter(Boolean))].sort()
    return relatedToValues
  }, [sections])

  const renderCellContent = (section, columnKey) => {
    switch (columnKey) {
      case 'select':
        return (
          <input
            type="checkbox"
            checked={selectedRows.has(section.id)}
            onChange={(e) => {
              e.stopPropagation()
              handleSelectRow(section.id)
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
        )

      case 'section':
        return <div className="font-mono font-medium">§{section.sectionNumber}</div>

      case 'chapter':
        return (
          <>
            <div className="font-medium">Ch {section.chapter}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {section.chapterName.length > 25
                ? section.chapterName.substring(0, 25) + '...'
                : section.chapterName}
            </div>
          </>
        )

      case 'relatedTo':
        return section.relatedTo ? (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {section.relatedTo}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-600">-</span>
        )

      case 'title':
        return <div className="font-medium">{section.title}</div>

      case 'content':
        return (
          <div className="text-xs text-gray-700 dark:text-gray-300">
            {section.content || '-'}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <style>{`
        /* Vertical scrollbar (keep visible) */
        .teacher-table-scroll {
          scrollbar-width: auto !important;
          scrollbar-color: #9CA3AF #E5E7EB !important;
        }
        .dark .teacher-table-scroll {
          scrollbar-color: #9CA3AF #4B5563 !important;
        }
        .teacher-table-scroll::-webkit-scrollbar {
          width: 14px !important;
          height: 14px !important;
        }
        .teacher-table-scroll::-webkit-scrollbar-track {
          background: #E5E7EB !important;
        }
        .teacher-table-scroll::-webkit-scrollbar-thumb {
          background: #9CA3AF !important;
          border-radius: 6px !important;
          border: 2px solid #E5E7EB !important;
        }
        .teacher-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #6B7280 !important;
        }
        .dark .teacher-table-scroll::-webkit-scrollbar-track {
          background: #4B5563 !important;
        }
        .dark .teacher-table-scroll::-webkit-scrollbar-thumb {
          background: #9CA3AF !important;
          border-color: #4B5563 !important;
        }
        .dark .teacher-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB !important;
        }

        /* RULE #19.33: Hide native horizontal scrollbar */
        .teacher-table-scroll::-webkit-scrollbar-horizontal {
          display: none !important;
        }
        .teacher-table-scroll::-webkit-scrollbar:horizontal {
          display: none !important;
          height: 0 !important;
        }

        /* Sticky horizontal scrollbar styling */
        .sticky-horizontal-scroll {
          overflow-x: scroll !important;
          overflow-y: hidden !important;
        }
        .sticky-horizontal-scroll::-webkit-scrollbar {
          -webkit-appearance: none !important;
          height: 16px !important;
        }
        .sticky-horizontal-scroll::-webkit-scrollbar-track {
          background: #E5E7EB !important;
          border-radius: 8px !important;
        }
        .sticky-horizontal-scroll::-webkit-scrollbar-thumb {
          background: #6B7280 !important;
          border-radius: 8px !important;
          border: 2px solid #E5E7EB !important;
        }
        .sticky-horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: #4B5563 !important;
        }
        .dark .sticky-horizontal-scroll::-webkit-scrollbar-track {
          background: #4B5563 !important;
        }
        .dark .sticky-horizontal-scroll::-webkit-scrollbar-thumb {
          background: #9CA3AF !important;
          border-color: #4B5563 !important;
        }
        .dark .sticky-horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB !important;
        }
      `}</style>
      <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900">
        {/* Bulk Action Bar */}
        {selectedRows.size > 0 && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                {selectedRows.size} {selectedRows.size === 1 ? 'section' : 'sections'} selected
              </div>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Header with Search and Column Visibility */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          {/* Search Box */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sections, chapters, content..."
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

            {/* Column Visibility Toggle */}
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
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
          </div>

          {/* Search Results Count */}
          {search && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Found {filteredAndSorted.length} of {sections.length} sections
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredAndSorted.length} of {sections.length} sections
          </div>
        </div>

        {/* Table - RULE #19.33: Wrapped in flex container for sticky scrollbar */}
        <div className="flex-1 min-h-0 flex flex-col px-4">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="teacher-table-scroll flex-1 overflow-y-auto overflow-x-scroll relative bg-white dark:bg-gray-900"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
          <table
            className="w-full border-collapse border-l border-r border-gray-200 dark:border-gray-700"
            style={{
              minWidth: `${Object.values(columnWidths).reduce((sum, w) => sum + w, 0)}px`,
              width: '100%'
            }}
          >
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-20">
              <tr>
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
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                      } ${draggedColumn === colKey ? 'bg-indigo-100 dark:bg-indigo-900' : ''}`}
                    >
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

                          {/* Inline Column Filter */}
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
                              {colKey === 'relatedTo' && uniqueRelatedTo.map(val => (
                                <option key={val} value={val}>{val}</option>
                              ))}
                            </select>
                          )}
                        </>
                      )}

                      {/* Resize Handle */}
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
              {filteredAndSorted.map((section, index) => (
                <tr
                  key={section.id}
                  className={`group border-b border-gray-100 dark:border-gray-800/50 hover:bg-blue-50/40 dark:hover:bg-gray-800/30 transition-all duration-150 hover:shadow-md ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800/30'
                  }`}
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
                        className={`${colKey === 'select' ? 'px-1' : 'px-4'} py-2.5 text-sm text-gray-900 dark:text-gray-100 ${
                          colKey === 'select' ? 'text-center' : ''
                        } truncate overflow-hidden whitespace-nowrap`}
                        title={colKey === 'title' ? section.title : colKey === 'content' ? section.content : ''}
                      >
                        {renderCellContent(section, colKey)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSorted.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No sections found matching your filters
            </div>
          )}
        </div>

        {/* RULE #19.33: Sticky Horizontal Scrollbar - Always visible at bottom */}
        <div
          ref={stickyScrollbarRef}
          onScroll={handleStickyScroll}
          className="sticky-horizontal-scroll border-t-2 border-gray-400 dark:border-gray-500 flex-shrink-0"
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            height: '20px',
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollbarWidth: 'auto',
            scrollbarColor: '#6B7280 #E5E7EB',
            backgroundColor: '#E5E7EB'
          }}
        >
          <div style={{ width: `${tableScrollWidth}px`, height: '100%', backgroundColor: 'transparent' }} />
        </div>
      </div>
      </div>
    </>
  )
}
