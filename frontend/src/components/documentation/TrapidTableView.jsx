import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import RichTextEditor from '../common/RichTextEditor'
import ColumnEditorModal from '../schema/ColumnEditorModal'
import SavedViewsKanban from './SavedViewsKanban'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ViewColumnsIcon,
  Cog8ToothIcon,
  WrenchScrewdriverIcon
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

// Define default columns for Trinity documentation (Chapter 20: Checkbox column must be first, locked, and minimal size)
const DEFAULT_TRINITY_COLUMNS = [
  { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 32 },
  { key: 'category', label: 'Category', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 100, tooltip: 'Bible, Teacher, or Lexicon' },
  { key: 'chapter', label: 'Chapter', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 200, tooltip: 'Chapter number and name' },
  { key: 'section', label: 'Section', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 100, tooltip: 'Section number (e.g., 2.01)' },
  { key: 'type', label: 'Type', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 120 },
  { key: 'title', label: 'Title', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 300 },
  { key: 'content', label: 'Content', resizable: true, sortable: false, filterable: true, filterType: 'text', width: 400 },
  { key: 'component', label: 'Component', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 180 },
  { key: 'dense_index', label: 'Dense Index', resizable: true, sortable: false, filterable: true, filterType: 'text', width: 400, tooltip: 'Searchable index (no formatting)' },
  { key: 'status', label: 'Status', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 140 },
  { key: 'severity', label: 'Severity', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 120 },
  { key: 'price', label: 'Price', resizable: true, sortable: true, filterable: false, width: 140, showSum: true, sumType: 'currency', tooltip: 'Price in AUD - shows total in footer' },
  { key: 'quantity', label: 'Qty', resizable: true, sortable: true, filterable: false, width: 100, showSum: true, sumType: 'number', tooltip: 'Quantity - shows total in footer' },
  { key: 'audit', label: 'Audit', resizable: true, sortable: true, filterable: false, width: 180, tooltip: 'Last modification date and user' }
]

export default function TrapidTableView({
  entries,
  onEdit,
  onDelete,
  stats,
  category = null,
  customActions = null,
  enableImport = false,
  enableExport = false,
  onImport = null,
  onExport = null,
  columns = null,  // NEW: Custom columns definition (if not provided, uses DEFAULT_TRINITY_COLUMNS)
  tableId = 'default',  // NEW: Unique identifier for this table (for saving filters per table)
  enableSchemaEditor = false,  // NEW: Enable schema editor menu items
  tableIdNumeric = null,  // NEW: Numeric table ID for schema editor API calls
  tableName = 'Table'  // NEW: Human-readable table name for schema editor
}) {
  const navigate = useNavigate()

  // Use custom columns if provided, otherwise use default Trinity columns
  const COLUMNS = columns || DEFAULT_TRINITY_COLUMNS

  const DEFAULT_COLUMN_WIDTHS = COLUMNS.reduce((acc, col) => {
    acc[col.key] = col.width
    return acc
  }, {})

  const DEFAULT_COLUMN_ORDER = COLUMNS.map(c => c.key)

  const DEFAULT_VISIBLE_COLUMNS = COLUMNS.reduce((acc, col) => {
    acc[col.key] = true
    return acc
  }, {})
  // category can be: null (show all), 'bible', 'teacher', or 'lexicon'
  // customActions: optional array of custom button elements to display after Columns button
  // enableImport/enableExport: show import/export options in three-dot menu
  // onImport/onExport: callback functions for import/export actions
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
  const [validationError, setValidationError] = useState(null)

  // Column visibility dropdown state
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)

  // Inline column filters (Chapter 20.1)
  const [columnFilters, setColumnFilters] = useState({})
  const [showFilters, setShowFilters] = useState(true) // Toggle to show/hide filter inputs

  // Cascade filters - Excel-style dropdown filters that can be applied in any order
  const [cascadeFilters, setCascadeFilters] = useState([]) // Array of {id, column, value, label}
  const [showCascadeDropdown, setShowCascadeDropdown] = useState(false)

  // Saved custom filters - load from localStorage on mount (per table)
  const [savedFilters, setSavedFilters] = useState(() => {
    try {
      const stored = localStorage.getItem(`trapid-saved-filters-${tableId}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading saved filters:', error)
      return []
    }
  })
  const [filterName, setFilterName] = useState('') // Name for saving current filter combo

  // Feature flag: Use kanban-style saved views (default: true)
  const [useKanbanSavedViews, setUseKanbanSavedViews] = useState(() => {
    const saved = localStorage.getItem('trapidTableUseKanbanSavedViews')
    return saved !== null ? JSON.parse(saved) : true
  })

  const [selectedCascadeColumn, setSelectedCascadeColumn] = useState('') // Currently selected column in cascade filter
  const [cascadeInputValue, setCascadeInputValue] = useState('') // Input value for text-based filters
  const [cascadeOperator, setCascadeOperator] = useState('=') // Operator for numeric comparisons (=, >, <, >=, <=, !=)
  const [columnSearchQuery, setColumnSearchQuery] = useState('') // Search query for filtering column list
  const [activeViewId, setActiveViewId] = useState(null) // Track which saved view is currently active
  const [editingViewId, setEditingViewId] = useState(null) // Track which view is being edited
  const [editingFilterId, setEditingFilterId] = useState(null) // Track which filter is being edited
  const [editingFilterValue, setEditingFilterValue] = useState('') // Track the temporary value while editing

  // Save filters to localStorage whenever they change (per table)
  useEffect(() => {
    try {
      localStorage.setItem(`trapid-saved-filters-${tableId}`, JSON.stringify(savedFilters))
    } catch (error) {
      console.error('Error saving filters to localStorage:', error)
    }
  }, [savedFilters, tableId])

  // Auto-load default view on mount - DISABLED to start with clean slate
  // useEffect(() => {
  //   const defaultView = savedFilters.find(view => view.isDefault)
  //   if (defaultView) {
  //     // Load default view's filters
  //     setCascadeFilters(defaultView.filters.map(f => ({
  //       id: Date.now() + Math.random(),
  //       column: f.column,
  //       value: f.value,
  //       operator: f.operator || '=',
  //       label: f.label
  //     })))
  //     // Load default view's column visibility if available
  //     if (defaultView.visibleColumns) {
  //       setVisibleColumns(defaultView.visibleColumns)
  //     }
  //     setActiveViewId(defaultView.id)
  //   }
  // }, []) // Only run on mount

  // Component multi-select checkbox state
  const [selectedComponents, setSelectedComponents] = useState(new Set())
  const [showComponentDropdown, setShowComponentDropdown] = useState(false)

  // Modal state for viewing full row details
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState(null)

  // Text editing modal state
  const [showTextEditModal, setShowTextEditModal] = useState(false)
  const [textEditField, setTextEditField] = useState('') // 'title' or 'content'
  const [textEditValue, setTextEditValue] = useState('')
  const textEditTextareaRef = useRef(null)

  // Editable modal state (for double-click row editing)
  const [showEditableModal, setShowEditableModal] = useState(false)
  const [modalEditData, setModalEditData] = useState(null)

  // Column schema editor state
  const [editIndividualMode, setEditIndividualMode] = useState(false)
  const [selectedColumnForEdit, setSelectedColumnForEdit] = useState(null)

  // Chapter 19 compliance: Column state management
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS)
  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMN_ORDER)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)

  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const [forceUpdate, setForceUpdate] = useState(0) // Force re-render after resize

  // Column reordering state
  const [draggedColumn, setDraggedColumn] = useState(null)
  const [dropTargetColumn, setDropTargetColumn] = useState(null)

  // Sticky horizontal scrollbar state
  const [tableScrollWidth, setTableScrollWidth] = useState(0)
  const scrollContainerRef = useRef(null)
  const stickyScrollbarRef = useRef(null)

  // Scroll loop prevention flags (RULE #20.33)
  const isScrollingStickyRef = useRef(false)
  const isScrollingMainRef = useRef(false)

  // Load table state from localStorage on mount (Chapter 20.5B)
  useEffect(() => {
    const storageKey = `trapidTableViewState_${category || 'default'}`
    const savedState = localStorage.getItem(storageKey)
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
  }, [category])

  // Save table state to localStorage whenever it changes (Chapter 20.5B)
  useEffect(() => {
    const storageKey = `trapidTableViewState_${category || 'default'}`
    const state = {
      columnWidths,
      columnOrder,
      visibleColumns,
      sortBy,
      sortDir
    }
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [columnWidths, columnOrder, visibleColumns, sortBy, sortDir, category])

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
    // Force re-render to update column display
    setForceUpdate(prev => prev + 1)
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

  // Validation function for field values
  const validateField = (key, value) => {
    if (key === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Invalid email format. Example: example@domain.com'
      }
    }
    if (key === 'mobile' && value) {
      // Australian mobile: 04XX XXX XXX (10 digits)
      const mobileRegex = /^04\d{2}\s?\d{3}\s?\d{3}$/
      if (!mobileRegex.test(value.replace(/\s/g, ''))) {
        return 'Invalid mobile format. Example: 0407 397 541'
      }
    }
    if (key === 'phone' && value) {
      // Australian landline: (0X) XXXX XXXX or 1300/1800 numbers
      const phoneRegex = /^(\(0\d\)\s?\d{4}\s?\d{4}|1[38]00\s?\d{3}\s?\d{3})$/
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Invalid phone format. Example: (03) 9123 4567 or 1300 123 456'
      }
    }
    if (key === 'is_active' && value !== undefined && value !== null) {
      // Boolean validation: must be true or false
      if (typeof value !== 'boolean') {
        return 'Invalid boolean value. Must be true or false'
      }
    }
    if (key === 'document_link' && value) {
      // URL validation: must be valid URL format
      try {
        new URL(value)
      } catch {
        return 'Invalid URL format. Example: https://example.com/document.pdf'
      }
    }
    return null
  }

  // Scroll handlers for sticky horizontal scrollbar (RULE #20.33)
  const handleScroll = (e) => {
    // Prevent infinite loop from sticky scrollbar
    if (isScrollingStickyRef.current) {
      isScrollingStickyRef.current = false
      return
    }

    const container = e.target
    const { scrollLeft, scrollTop } = container

    // Sync horizontal sticky scrollbar
    if (stickyScrollbarRef.current) {
      isScrollingMainRef.current = true
      stickyScrollbarRef.current.scrollLeft = scrollLeft
      setTimeout(() => { isScrollingMainRef.current = false }, 0)
    }

    // Log scroll position occasionally (every 100px)
    if (Math.floor(scrollLeft / 100) !== Math.floor((scrollLeft - 1) / 100)) {
      console.log('📊 Lexicon scroll:', { scrollLeft, scrollTop })
    }
  }

  const handleStickyScroll = (e) => {
    // Prevent infinite loop from main container
    if (isScrollingMainRef.current) {
      isScrollingMainRef.current = false
      return
    }

    const scrollLeft = e.target.scrollLeft
    if (scrollContainerRef.current) {
      isScrollingStickyRef.current = true
      scrollContainerRef.current.scrollLeft = scrollLeft
      setTimeout(() => { isScrollingStickyRef.current = false }, 0)
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
    setDropTargetColumn(null)
  }

  const handleDragOver = (e, targetColumnKey) => {
    e.preventDefault()
    if (draggedColumn && draggedColumn !== targetColumnKey) {
      setDropTargetColumn(targetColumnKey)
    }
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
    setDropTargetColumn(null)
    // Force a re-render to update the table display
    setTimeout(() => {
      // Trigger re-render by updating state
      setColumnOrder(prev => [...prev])
    }, 0)
  }

  const handleDrop = (e, targetColumnKey) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === targetColumnKey) {
      setDraggedColumn(null)
      setDropTargetColumn(null)
      return
    }

    const draggedIndex = columnOrder.indexOf(draggedColumn)
    const targetIndex = columnOrder.indexOf(targetColumnKey)

    const newOrder = [...columnOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedColumn)

    setColumnOrder(newOrder)
    setDraggedColumn(null)
    setDropTargetColumn(null)
    // Force a re-render to update the table display
    setTimeout(() => {
      // Trigger re-render by updating state
      setColumnOrder(prev => [...prev])
    }, 0)
  }

  // Column visibility toggle (Chapter 20.10)
  const handleToggleColumn = (columnKey) => {
    setVisibleColumns(prev => {
      const newVisibleColumns = {
        ...prev,
        [columnKey]: !prev[columnKey]
      }

      // RULE #20.37: Prevent hiding ALL columns
      const visibleCount = Object.values(newVisibleColumns).filter(Boolean).length
      if (visibleCount === 0) {
        console.warn('Cannot hide all columns - at least one must remain visible')
        return prev // Don't apply the change
      }

      return newVisibleColumns
    })
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

    // Apply search (Chapter 20.20) - Search across ALL fields
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(e => {
        // Get all values from the entry and check if any contain the search query
        return Object.values(e).some(value => {
          if (value === null || value === undefined) return false
          // Convert to string and check for match
          return String(value).toLowerCase().includes(query)
        })
      })
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
          // Component uses multi-select checkboxes
          if (selectedComponents.size > 0) {
            result = result.filter(e => {
              // Special handling: "Table" checkbox also includes "DynamicTables"
              if (selectedComponents.has('Table') && (e.component === 'Table' || e.component === 'DynamicTables')) {
                return true
              }
              return selectedComponents.has(e.component)
            })
          }
          break
        case 'status':
          result = result.filter(e => e.status === value)
          break
        case 'severity':
          result = result.filter(e => e.severity === value)
          break
      }
    })

    // Apply cascade filters - Excel-style filters applied in order
    cascadeFilters.forEach(filter => {
      if (!filter.value && filter.value !== 0) return

      const key = filter.column
      const value = filter.value
      const operator = filter.operator || '='

      // Generic filter that works for any column
      result = result.filter(entry => {
        const entryValue = entry[key]

        // Handle different value types
        if (typeof value === 'boolean') {
          return entryValue === value
        }

        // Handle numeric comparison with operators
        if (typeof entryValue === 'number' && !isNaN(parseFloat(value))) {
          const numValue = parseFloat(value)
          switch (operator) {
            case '>': return entryValue > numValue
            case '<': return entryValue < numValue
            case '>=': return entryValue >= numValue
            case '<=': return entryValue <= numValue
            case '!=': return entryValue !== numValue
            case '=':
            default: return entryValue === numValue
          }
        }

        // Handle string comparison (case-insensitive)
        if (operator === '!=') {
          return String(entryValue).toLowerCase() !== String(value).toLowerCase()
        }
        return String(entryValue).toLowerCase() === String(value).toLowerCase()
      })
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
          // Parse section numbers with optional category prefix (B01.01, L01.02, T01.03)
          const parseSection = (str) => {
            if (!str) return ['', 0, 0]

            // Match: B01.01 → prefix="B", chapter=1, section=1
            // Match: 03.05 → prefix="", chapter=3, section=5 (legacy)
            const match = str.match(/^([BTL])?(\d+)\.(\d+)$/)
            if (!match) return ['', 0, 0]

            return [
              match[1] || '',           // prefix letter (B/L/T or empty)
              parseInt(match[2]),       // chapter number
              parseInt(match[3])        // section number
            ]
          }

          const [aPrefix, aChapter, aSection] = parseSection(a.section_number)
          const [bPrefix, bChapter, bSection] = parseSection(b.section_number)

          // Sort by prefix first (B < L < T), then chapter, then section
          if (aPrefix !== bPrefix) {
            aVal = aPrefix
            bVal = bPrefix
          } else if (aChapter !== bChapter) {
            aVal = aChapter
            bVal = bChapter
          } else {
            aVal = aSection
            bVal = bSection
          }
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
        case 'updated_at':
          aVal = a.updated_at ? new Date(a.updated_at).getTime() : 0
          bVal = b.updated_at ? new Date(b.updated_at).getTime() : 0
          break
        case 'price':
          aVal = a.price || 0
          bVal = b.price || 0
          break
        case 'quantity':
          aVal = a.quantity || 0
          bVal = b.quantity || 0
          break
        case 'discount':
          aVal = a.discount || 0
          bVal = b.discount || 0
          break
        case 'total_cost':
          // Computed column - use the compute function
          const column = COLUMNS.find(c => c.key === sortBy)
          if (column?.isComputed && column?.computeFunction) {
            aVal = column.computeFunction(a) || 0
            bVal = column.computeFunction(b) || 0
          } else {
            aVal = 0
            bVal = 0
          }
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [entries, search, filters, sortBy, sortDir, columnFilters, category, cascadeFilters, selectedComponents])

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortDir === 'asc') {
        setSortDir('desc')
      } else if (sortDir === 'desc') {
        // Third state: clear sort
        setSortBy(null)
        setSortDir(null)
      }
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
    const chapters = [...new Set(entries.map(e => e.chapter_number).filter(Boolean))].sort((a, b) => a - b)
    return chapters.map(num => ({ value: num, label: `Ch ${num}: ${CHAPTER_NAMES[num]}` }))
  }, [entries])

  const uniqueComponents = useMemo(() => {
    return [...new Set(entries.map(e => e.component).filter(Boolean))].sort()
  }, [entries])

  // Get unique values for any column - generic helper
  const getUniqueValuesForColumn = (columnKey) => {
    const values = [...new Set(entries.map(e => e[columnKey] || e.entry_type).filter(Boolean))]
    return values.sort()
  }

  const getColumnLabel = (key) => {
    const column = COLUMNS.find(c => c.key === key)
    return column ? column.label : key
  }

  const renderCellContent = (entry, columnKey) => {
    switch (columnKey) {
      case 'select':
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedRows.has(entry.id)}
              onChange={(e) => {
                e.stopPropagation()
                handleSelectRow(entry.id)
              }}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        )

      case 'category':
        const categoryColors = {
          bible: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          teacher: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          lexicon: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        }
        const categoryIcons = {
          bible: '📖',
          teacher: '🔧',
          lexicon: '📕'
        }
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[entry.category] || 'bg-gray-100 text-gray-800'}`}>
            <span className="mr-1">{categoryIcons[entry.category]}</span>
            {entry.category}
          </span>
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
        // Check if this is a Bible/Lexicon/Teacher entry with section_number
        if (entry.section_number !== undefined) {
          // This is Trinity documentation - use formatted section numbers
          if (!entry.section_number) {
            return <span className="text-gray-400">-</span>
          }

          // Format section number with category prefix: B01.001, L12.003, T05.001 (3-digit)
          let formattedSection = entry.section_number

          // Check if section_number already has a B/L/T prefix (2-digit or 3-digit)
          const alreadyHasPrefix = /^[BLT]\d{2}\.\d{2,3}$/.test(entry.section_number)

          if (alreadyHasPrefix) {
            // Already correctly formatted - use as is
            formattedSection = entry.section_number
          } else if (entry.section_number.startsWith('TEMP-')) {
            // Temporary number during migration - show as is
            formattedSection = entry.section_number
          } else {
            // Need to add prefix and padding
            const categoryPrefix = {
              'bible': 'B',
              'lexicon': 'L',
              'teacher': 'T'
            }[entry.category] || ''

            if (entry.section_number.includes('.')) {
              // Already has dot notation - add prefix and ensure padding
              const parts = entry.section_number.split('.')
              if (parts.length === 2) {
                const [chapter, section] = parts
                const chapterPadded = String(chapter).padStart(2, '0')
                // Use 3-digit section padding for consistency
                const sectionPadded = String(section).padStart(3, '0')
                formattedSection = `${categoryPrefix}${chapterPadded}.${sectionPadded}`
              }
            } else if (entry.section_number.includes('-')) {
              // Has hyphen - this is likely a range that was incorrectly stored
              // For now, display as-is but this indicates data quality issue
              formattedSection = entry.section_number
            }
          }

          return (
            <div className="font-mono font-medium text-indigo-700 dark:text-indigo-400">
              {formattedSection}
            </div>
          )
        }

        // Otherwise, this is Gold Standard - editable single line text field
        if (editingRowId === entry.id) {
          return (
            <input
              type="text"
              value={editingData.section || ''}
              onChange={(e) => setEditingData({ ...editingData, section: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              maxLength={255}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )
        }
        return entry.section || <span className="text-gray-400">-</span>

      case 'type':
        // Format type display: first letter capital, rest lowercase
        const formatType = (type) => {
          if (!type) return ''
          // Handle special cases with underscores
          if (type.includes('_')) {
            return type.split('_').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ')
          }
          // Standard: First letter uppercase, rest lowercase
          return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
        }

        return (
          <>
            {entry.entry_type === 'bug' && '🐛'}
            {entry.entry_type === 'architecture' && '🏛️'}
            {entry.entry_type === 'test' && '📊'}
            {entry.entry_type === 'note' && '🎓'}
            <span className="ml-1">{formatType(entry.entry_type)}</span>
          </>
        )

      case 'title':
        if (editingRowId === entry.id) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setTextEditField('title')
                setTextEditValue(editingData.title || '')
                setShowTextEditModal(true)
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer truncate"
            >
              {editingData.title || 'Click to edit...'}
            </button>
          )
        }
        return <div className="truncate font-medium">{entry.title}</div>

      case 'content':
        if (editingRowId === entry.id) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setTextEditField('content')
                setTextEditValue(editingData.description || '')
                setShowTextEditModal(true)
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer truncate"
            >
              {editingData.description || 'Click to edit...'}
            </button>
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

        // Strip HTML tags and truncate to reasonable length for table cell
        const stripHTML = (html) => {
          const tmp = document.createElement('div')
          tmp.innerHTML = html
          return tmp.textContent || tmp.innerText || ''
        }

        const plainText = stripHTML(contentText)
        const maxLength = 150
        const displayText = plainText.length > maxLength
          ? plainText.substring(0, maxLength) + '...'
          : plainText

        return (
          <div className="truncate text-gray-600 dark:text-gray-400">
            {displayText || '-'}
          </div>
        )

      case 'dense_index':
        const denseText = entry.dense_index || ''
        const maxDenseLength = 150
        const displayDense = denseText.length > maxDenseLength
          ? denseText.substring(0, maxDenseLength) + '...'
          : denseText

        return (
          <div className="truncate text-xs font-mono text-gray-500 dark:text-gray-500">
            {displayDense || '-'}
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
              onFocus={(e) => e.target.select()}
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
              onMouseDown={(e) => {
                // Allow the dropdown to open
                e.stopPropagation()
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option key="status-empty" value="">Select Status</option>
              <option key="status-open" value="open">⚡ Open</option>
              <option key="status-fixed" value="fixed">✅ Fixed</option>
              <option key="status-by-design" value="by_design">⚠️ By Design</option>
              <option key="status-monitoring" value="monitoring">🔄 Monitoring</option>
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
              onMouseDown={(e) => {
                // Allow the dropdown to open
                e.stopPropagation()
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option key="severity-empty" value="">Select Severity</option>
              <option key="severity-low" value="low">Low</option>
              <option key="severity-medium" value="medium">Medium</option>
              <option key="severity-high" value="high">High</option>
              <option key="severity-critical" value="critical">Critical</option>
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
      case 'updated_at':
      case 'created_at':
        // Check if this is Trinity documentation (Bible/Lexicon/Teacher)
        if (entry.section_number !== undefined) {
          // This is Trinity documentation - use read-only formatted date
          if (!entry.updated_at) {
            return <span className="text-gray-400 text-xs">Never</span>
          }

          // Format date only (no time)
          const updatedDate = new Date(entry.updated_at)
          const formattedDate = updatedDate.toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })

          return (
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {formattedDate}
            </div>
          )
        }

        // Otherwise, this is Gold Standard - editable date picker
        if (editingRowId === entry.id) {
          // Convert datetime to YYYY-MM-DD format for date input
          const dateValue = editingData[columnKey]
            ? new Date(editingData[columnKey]).toISOString().split('T')[0]
            : ''

          return (
            <input
              type="date"
              value={dateValue}
              onChange={(e) => {
                // Convert back to ISO datetime string when saving
                const dateStr = e.target.value
                if (dateStr) {
                  const date = new Date(dateStr)
                  setEditingData({ ...editingData, [columnKey]: date.toISOString() })
                } else {
                  setEditingData({ ...editingData, [columnKey]: null })
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                e.target.showPicker && e.target.showPicker() // Show calendar picker on click
              }}
              onFocus={(e) => {
                e.target.showPicker && e.target.showPicker() // Show calendar picker on focus
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          )
        }

        // In edit mode but not editing this row - show white box to indicate it's clickable
        if (editModeActive && editingRowId !== entry.id) {
          return (
            <div className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 cursor-pointer">
              {entry[columnKey] ? (
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(entry[columnKey]).toLocaleDateString('en-AU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          )
        }

        // Display formatted date (when not in edit mode)
        if (entry[columnKey]) {
          const date = new Date(entry[columnKey])
          return (
            <div className="text-sm text-gray-900 dark:text-white">
              {date.toLocaleDateString('en-AU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </div>
          )
        }
        return <span className="text-gray-400">-</span>

      case 'document_link':
        // URL column - editable in edit mode
        if (editingRowId === entry.id) {
          return (
            <input
              type="url"
              value={editingData.document_link || ''}
              onChange={(e) => setEditingData({ ...editingData, document_link: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              placeholder="https://example.com"
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )
        }

        if (!entry.document_link) {
          return <span className="text-gray-400 text-xs">-</span>
        }

        return (
          <a
            href={entry.document_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Document
          </a>
        )

      case 'action_buttons':
        // Action buttons column - demonstrates interactive row-level actions
        // This is a REFERENCE IMPLEMENTATION for the Gold Standard table
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                console.log('👁️ View action clicked for entry:', entry.id)
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="View"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                console.log('✏️ Edit action clicked for entry:', entry.id)
              }}
              className="p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded transition-colors"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                console.log('🗑️ Delete action clicked for entry:', entry.id)
              }}
              className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )

      case 'price':
        // Currency column - right-aligned with AUD formatting
        if (editingRowId === entry.id) {
          return (
            <input
              type="number"
              step="0.01"
              value={editingData.price || ''}
              onChange={(e) => setEditingData({ ...editingData, price: parseFloat(e.target.value) || 0 })}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-right"
            />
          )
        }
        return (
          <div className="text-right font-medium">
            {entry.price != null ? new Intl.NumberFormat('en-AU', {
              style: 'currency',
              currency: 'AUD'
            }).format(entry.price) : '-'}
          </div>
        )

      case 'quantity':
      case 'whole_number':
        // Number column - right-aligned
        if (editingRowId === entry.id) {
          return (
            <input
              type="number"
              step={columnKey === 'whole_number' ? '1' : 'any'}
              value={editingData[columnKey] || ''}
              onChange={(e) => {
                const value = e.target.value
                // For whole_number, only allow integers (no decimals)
                if (columnKey === 'whole_number') {
                  setEditingData({ ...editingData, [columnKey]: parseInt(value) || 0 })
                } else {
                  setEditingData({ ...editingData, [columnKey]: parseFloat(value) || 0 })
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-right"
            />
          )
        }
        return (
          <div className="text-right font-medium">
            {entry[columnKey] != null ? entry[columnKey].toLocaleString('en-AU') : '-'}
          </div>
        )

      case 'email':
        // Email column with mailto link
        if (editingRowId === entry.id) {
          return (
            <input
              type="email"
              value={editingData.email || ''}
              onChange={(e) => setEditingData({ ...editingData, email: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )
        }
        return entry.email ? (
          <a
            href={`mailto:${entry.email}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {entry.email}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )

      case 'phone':
        // Landline phone column with tel link
        if (editingRowId === entry.id) {
          return (
            <input
              type="tel"
              value={editingData.phone || ''}
              onChange={(e) => {
                let value = e.target.value.replace(/[\s()]/g, '') // Remove formatting
                // Auto-format landline: (0X) XXXX XXXX
                if (value.length === 10 && value.match(/^0[2-9]\d{8}$/)) {
                  value = `(${value.slice(0, 2)}) ${value.slice(2, 6)} ${value.slice(6)}`
                }
                // Auto-format 1300/1800: 1300 XXX XXX
                else if (value.length === 10 && value.match(/^1[38]00\d{6}$/)) {
                  value = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`
                }
                setEditingData({ ...editingData, phone: value })
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              placeholder="(03) 9123 4567"
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )
        }
        return entry.phone ? (
          <a
            href={`tel:${entry.phone.replace(/[\s()]/g, '')}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {entry.phone}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )

      case 'mobile':
        // Mobile phone column with tel link
        if (editingRowId === entry.id) {
          return (
            <input
              type="tel"
              value={editingData.mobile || ''}
              onChange={(e) => {
                let value = e.target.value.replace(/\s/g, '') // Remove spaces
                // Auto-format if 10 digits entered (Australian mobile)
                if (value.length === 10 && value.match(/^04\d{8}$/)) {
                  value = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`
                }
                setEditingData({ ...editingData, mobile: value })
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              placeholder="0407 397 541"
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )
        }
        return entry.mobile ? (
          <a
            href={`tel:${entry.mobile.replace(/\s/g, '')}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {entry.mobile}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )

      case 'is_active':
        // Boolean column with toggle-style indicator
        const isActive = editingRowId === entry.id ? editingData.is_active : entry.is_active

        return (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (editingRowId === entry.id) {
                  // In edit mode: toggle the value
                  setEditingData({ ...editingData, is_active: !editingData.is_active })
                }
              }}
              disabled={editingRowId !== entry.id}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                isActive
                  ? 'bg-green-500 dark:bg-green-600'
                  : 'bg-red-400 dark:bg-red-500'
              } ${editingRowId === entry.id ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        )

      case 'discount':
        // Percentage column - right-aligned with % symbol
        if (editingRowId === entry.id) {
          return (
            <input
              type="number"
              step="0.1"
              value={editingData.discount || ''}
              onChange={(e) => setEditingData({ ...editingData, discount: parseFloat(e.target.value) || 0 })}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-right"
            />
          )
        }
        return (
          <div className="text-right font-medium">
            {entry.discount != null ? `${entry.discount}%` : '-'}
          </div>
        )

      case 'total_cost':
        // Computed column - calculated value (e.g., price × quantity)
        // Find the column definition to get the compute function
        const column = COLUMNS.find(col => col.key === columnKey)
        if (column?.isComputed && column?.computeFunction) {
          const computedValue = column.computeFunction(entry)
          return (
            <div className="text-right font-medium bg-blue-50 dark:bg-blue-900/20">
              {computedValue != null ? new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD'
              }).format(computedValue) : '-'}
            </div>
          )
        }
        return <span className="text-gray-400">-</span>

      default:
        // Generic handler for all other columns - make them editable in edit mode
        const value = entry[columnKey]

        if (editingRowId === entry.id) {
          // In edit mode: show editable input
          return (
            <input
              type="text"
              value={editingData[columnKey] || ''}
              onChange={(e) => setEditingData({ ...editingData, [columnKey]: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )
        }

        // Display mode: show value as text
        return value ? (
          <span className="text-gray-900 dark:text-white">{value}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
    }
  }

  return (
    <>
      <style>{`
        /* Trapid table scrollbar styling - blue theme */
        .trapid-table-scroll::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .trapid-table-scroll::-webkit-scrollbar-track {
          background: #E0E7FF;
          border-radius: 6px;
        }
        .trapid-table-scroll::-webkit-scrollbar-thumb {
          background: #2563EB;
          border-radius: 6px;
          border: 2px solid #E0E7FF;
        }
        .trapid-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #1D4ED8;
        }
        .dark .trapid-table-scroll::-webkit-scrollbar-track {
          background: #1E293B;
        }
        .dark .trapid-table-scroll::-webkit-scrollbar-thumb {
          background: #1E40AF;
          border-color: #1E293B;
        }
        .dark .trapid-table-scroll::-webkit-scrollbar-thumb:hover {
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
      {/* Bordered container wrapping toolbar and table */}
      <div className="flex-1 min-h-0 flex flex-col mx-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">

        {/* Edit Mode Banner - Shows when edit mode is active */}
        {editModeActive && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white px-6 py-4 border-b-4 border-orange-400 dark:border-orange-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
                  <PencilIcon className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span>Edit Mode Active</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 animate-pulse">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-sm text-orange-100 mt-0.5">
                    Click any cell to edit • Click Save button to save changes • Exit when done
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Save & Exit button - saves current row if editing */}
                <button
                  onClick={async () => {
                    // Save current editing row if any
                    if (editingRowId !== null && Object.keys(editingData).length > 0) {
                      await onEdit(editingData)
                    }
                    setEditModeActive(false)
                    setEditingRowId(null)
                    setEditingData({})
                    setShowDeleteButton(false)
                    setSelectedRows(new Set())
                  }}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save & Exit
                </button>

                {/* Exit Without Saving button */}
                <button
                  onClick={() => {
                    if (confirm('Exit without saving? Any unsaved changes will be lost.')) {
                      setEditModeActive(false)
                      setEditingRowId(null)
                      setEditingData({})
                      setShowDeleteButton(false)
                      setSelectedRows(new Set())
                    }
                  }}
                  className="px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 backdrop-blur-sm"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Exit Without Saving
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Error Banner - Shows when validation fails */}
        {validationError && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-6 py-3 border-b-4 border-red-400 dark:border-red-500 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h4 className="font-bold">Validation Error</h4>
                <p className="text-sm text-red-100">{validationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header with Search, Filters, and Column Visibility (Chapter 20.20, #19.10) */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4 flex-shrink-0">
        {/* Search Box with Clear Button (Chapter 20.20) */}
        <div className="flex items-end gap-3">
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

          {/* Custom Action Buttons (Chapter 20: Add, Import, etc.) */}
          {customActions && customActions}

          {/* Edit Mode Toggle - Always visible */}
          <button
            onClick={() => {
              // Toggle edit mode - unlock all cells
              setEditModeActive(!editModeActive)
              setShowDeleteButton(!editModeActive) // Show delete when entering edit mode
              if (!editModeActive) {
                // Entering edit mode - clear any selections
                setEditingRowId(null)
                setEditingData({})
                setSelectedRows(new Set())
              }
            }}
            className={`inline-flex items-center gap-2 px-4 text-sm font-bold rounded-lg transition-all h-[42px] ml-auto ${
              editModeActive
                ? 'bg-orange-600 hover:bg-orange-700 text-white ring-4 ring-orange-400/50 shadow-lg shadow-orange-500/50 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
            }`}
          >
            <PencilIcon className={`h-5 w-5 ${editModeActive ? 'animate-bounce' : ''}`} />
            {editModeActive ? '🔓 Editing' : '✏️ Edit'}
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

          {/* Delete Button - Only visible when rows selected (Export available in three-dot menu) */}
          {selectedRows.size > 0 && !editingRowId && (
            <>
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
                <TrashIcon className="h-4 w-4" />
                Delete ({selectedRows.size})
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

          {/* Three-Dot Menu - Table Options - Always on far right */}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 p-2 text-white border border-blue-600 dark:border-blue-500 h-[42px] w-[42px] transition-colors">
              <EllipsisVerticalIcon className="h-6 w-6" />
            </MenuButton>

            <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 max-h-[80vh] overflow-y-auto">
              {/* Filter toggle */}
              <div className="py-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`${
                        focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      {showFilters ? (
                        <>
                          <EyeSlashIcon className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                          <span>Hide Filters</span>
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                          <span>Show Filters</span>
                        </>
                      )}
                    </button>
                  )}
                </MenuItem>

                {/* Columns toggle */}
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                      className={`${
                        focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      <ViewColumnsIcon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                      <span>Columns</span>
                    </button>
                  )}
                </MenuItem>
              </div>

              {/* Schema Editor - only show if enableSchemaEditor prop is true */}
              {enableSchemaEditor && (
                <div className="py-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Schema
                  </div>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => navigate(`/tables/${tableIdNumeric}/columns?name=${encodeURIComponent(tableName)}`)}
                        className={`${
                          focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <WrenchScrewdriverIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        <span>Edit Columns</span>
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => {
                          setEditIndividualMode(!editIndividualMode)
                        }}
                        className={`${
                          focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <Cog8ToothIcon className={`h-5 w-5 mr-3 ${editIndividualMode ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        <span>{editIndividualMode ? 'Exit Edit Individual' : 'Edit Individual'}</span>
                      </button>
                    )}
                  </MenuItem>
                </div>
              )}

              {/* Import/Export options - only show if enabled */}
              {(enableImport || enableExport) && (
                <div className="py-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Data
                  </div>
                  {enableImport && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => onImport && onImport()}
                          className={`${
                            focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          <ArrowDownTrayIcon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                          <span>Import</span>
                        </button>
                      )}
                    </MenuItem>
                  )}
                  {enableExport && (
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => onExport && onExport()}
                          className={`${
                            focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          <ArrowUpTrayIcon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                          <span>Export</span>
                        </button>
                      )}
                    </MenuItem>
                  )}
                </div>
              )}
            </MenuItems>
          </Menu>

          {/* Columns dropdown - appears when triggered from three-dot menu */}
          {showColumnsDropdown && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowColumnsDropdown(false)} />
              {/* Dropdown positioned in center */}
              <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-[80vh] overflow-y-auto z-[60]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Show/Hide Columns
                    </span>
                    <button
                      onClick={() => setShowColumnsDropdown(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2">
                    {COLUMNS.filter(col => col.key !== 'select').map((column) => (
                      <button
                        key={column.key}
                        onClick={() => handleToggleColumn(column.key)}
                        className="group flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[column.key]}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <span className="ml-3">{column.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
          {/* Cascade Filters Button - Excel-style popup */}
          <div className="relative group flex items-center gap-2">
            <button
              onClick={() => setShowCascadeDropdown(!showCascadeDropdown)}
              className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {cascadeFilters.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] bg-purple-600 text-white rounded-full text-[10px] font-bold">
                  {cascadeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Access Saved View Buttons */}
          {savedFilters
            .sort((a, b) => {
              // Default view always first
              if (a.isDefault) return -1
              if (b.isDefault) return 1
              return 0
            })
            .map((view) => (
            <button
              key={view.id}
              onClick={() => {
                setCascadeFilters(view.filters.map(f => ({
                  id: Date.now() + Math.random(),
                  column: f.column,
                  value: f.value,
                  operator: f.operator || '=',
                  label: f.label
                })))
                if (view.visibleColumns) {
                  setVisibleColumns(view.visibleColumns)
                }
                setActiveViewId(view.id)
              }}
              className={`px-3 py-1.5 ${
                activeViewId === view.id
                  ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-400 dark:border-blue-600'
                  : 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              } text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap`}
              title={`${view.filters.length} filter${view.filters.length !== 1 ? 's' : ''}, ${view.visibleColumns ? Object.values(view.visibleColumns).filter(Boolean).length : 0} columns`}
            >
              {view.isDefault && <span className="text-yellow-600 dark:text-yellow-400">⭐</span>}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {view.name}
              {view.filters.length > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] ${
                  activeViewId === view.id
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-green-600 dark:bg-green-700'
                } text-white rounded-full text-[10px] font-bold`}>
                  {view.filters.length}
                </span>
              )}
            </button>
          ))}

          {/* Update View Button - appears when active view has been modified */}
          {(() => {
            if (!activeViewId) return null
            const activeView = savedFilters.find(v => v.id === activeViewId)
            if (!activeView) return null

            // Don't show update button while:
            // 1. Editing a filter value inline
            // 2. The cascade dropdown is open (user may be working with filters)
            // 3. User is typing a new view name (filterName has content)
            if (editingFilterId || showCascadeDropdown || filterName.trim()) return null

            // Check if filters or columns have changed
            // Normalize both current and saved filters to include default operator
            const normalizeFilter = (f) => ({
              column: f.column,
              value: f.value,
              operator: f.operator || '=',
              label: f.label
            })
            const currentFilters = JSON.stringify(cascadeFilters.map(normalizeFilter))
            const savedFiltersStr = JSON.stringify(activeView.filters.map(normalizeFilter))
            const filtersChanged = currentFilters !== savedFiltersStr
            const columnsChanged = activeView.visibleColumns && JSON.stringify(visibleColumns) !== JSON.stringify(activeView.visibleColumns)

            if (!filtersChanged && !columnsChanged) return null

            return (
              <button
                onClick={() => {
                  setSavedFilters(savedFilters.map(v =>
                    v.id === activeViewId
                      ? {
                          ...v,
                          filters: cascadeFilters.map(f => ({ column: f.column, value: f.value, operator: f.operator, label: f.label })),
                          visibleColumns: { ...visibleColumns }
                        }
                      : v
                  ))
                }}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white text-sm font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap animate-pulse"
                title="Save changes to this view"
              >
                💾 Update "{activeView.name}"
              </button>
            )
          })()}

            {/* Excel-style dropdown panel */}
            {showCascadeDropdown && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowCascadeDropdown(false)} />
                {/* Dropdown positioned in center like a modal */}
                <div
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[90vh] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl overflow-y-auto z-[60]"
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Cascade Filters
                    </span>
                    <button
                      onClick={() => setShowCascadeDropdown(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Main content: 4 columns - Column Select | Value Select | Column Visibility | Saved Views */}
                  <div className="grid grid-cols-[1fr,1.5fr,fit-content(200px),280px] gap-4 h-[calc(90vh-4rem)]">
                    {/* LEFT COLUMN: Column Selection */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Select Column:
                      </label>
                      {/* Column search box */}
                      <input
                        type="text"
                        value={columnSearchQuery}
                        onChange={(e) => setColumnSearchQuery(e.target.value)}
                        placeholder="Search columns..."
                        className="w-full text-xs px-2 py-1.5 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400"
                      />
                      <div className="h-[calc(100%-3rem)] overflow-y-auto border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
                        {(() => {
                          const filteredColumns = COLUMNS
                            .filter(col => col.key !== 'select')
                            .filter(col => col.label.toLowerCase().includes(columnSearchQuery.toLowerCase()))

                          return filteredColumns.length > 0 ? filteredColumns.map((col, index) => (
                            <button
                              key={`cascade-${col.key}`}
                              onClick={() => {
                                setSelectedCascadeColumn(col.key === selectedCascadeColumn ? '' : col.key)
                                setColumnSearchQuery('') // Clear search after selection
                                setCascadeOperator('=') // Reset operator to default
                                setCascadeInputValue('') // Clear input value
                              }}
                              className={`w-full text-left text-xs px-3 py-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${
                                selectedCascadeColumn === col.key
                                  ? 'bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                                  : index % 2 === 0
                                    ? 'bg-blue-50 dark:bg-blue-900/10 text-gray-700 dark:text-gray-300'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {col.label}
                            </button>
                          )) : (
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-3">
                              No matching columns
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Value Selection */}
                    <div className="flex flex-col h-full">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Select Values:
                      </label>
                      <div className="h-[40%] overflow-y-auto">
                      {!selectedCascadeColumn ? (
                        <div className="h-full flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 text-center p-4">
                          Select a column from the left to choose values
                        </div>
                      ) : (() => {
                        const column = COLUMNS.find(c => c.key === selectedCascadeColumn)
                      const columnLabel = column?.label || selectedCascadeColumn

                      // Boolean type - show sliding toggle switch
                      if (column?.filterType === 'boolean') {
                        const hasYesFilter = cascadeFilters.some(f => f.column === selectedCascadeColumn && f.value === true)
                        const hasNoFilter = cascadeFilters.some(f => f.column === selectedCascadeColumn && f.value === false)
                        const currentState = hasYesFilter ? true : hasNoFilter ? false : null

                        return (
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                if (currentState === true) {
                                  // Switch to No
                                  const filtered = cascadeFilters.filter(f => f.column !== selectedCascadeColumn)
                                  setCascadeFilters([...filtered, {
                                    id: Date.now(),
                                    column: selectedCascadeColumn,
                                    value: false,
                                    label: `${columnLabel}: No`
                                  }])
                                } else {
                                  // Switch to Yes (from No or null)
                                  const filtered = cascadeFilters.filter(f => f.column !== selectedCascadeColumn)
                                  setCascadeFilters([...filtered, {
                                    id: Date.now(),
                                    column: selectedCascadeColumn,
                                    value: true,
                                    label: `${columnLabel}: Yes`
                                  }])
                                }
                              }}
                              className={`relative w-full h-12 rounded-full transition-all ${
                                currentState === true ? 'bg-green-600' : currentState === false ? 'bg-red-600' : 'bg-gray-400 dark:bg-gray-600'
                              }`}
                            >
                              <div className={`absolute top-1 w-10 h-10 bg-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center text-lg font-bold ${
                                currentState === true ? 'right-1 translate-x-0' : 'left-1 translate-x-0'
                              }`}>
                                {currentState === true ? '✓' : currentState === false ? '✗' : '-'}
                              </div>
                              <div className="flex items-center justify-between px-3 text-white font-medium text-sm">
                                <span className={currentState === false ? 'font-bold' : 'opacity-70'}>No</span>
                                <span className={currentState === true ? 'font-bold' : 'opacity-70'}>Yes</span>
                              </div>
                            </button>
                            {currentState !== null && (
                              <button
                                onClick={() => setCascadeFilters(cascadeFilters.filter(f => f.column !== selectedCascadeColumn))}
                                className="w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                Clear filter
                              </button>
                            )}
                          </div>
                        )
                      }

                      // Numeric fields - show operator buttons and number input
                      // Check if this is a numeric column based on key name or if the data is numeric
                      const numericKeywords = ['price', 'quantity', 'qty', 'amount', 'count', 'number', 'currency', 'percent', 'cost', 'total', 'sum', 'value']
                      const isNumericColumn = numericKeywords.some(keyword =>
                        selectedCascadeColumn.toLowerCase().includes(keyword) ||
                        column?.label?.toLowerCase().includes(keyword)
                      ) || column?.sumType === 'number' || column?.sumType === 'currency'

                      if (isNumericColumn) {
                        const operators = [
                          { value: '=', label: '=' },
                          { value: '!=', label: '≠' },
                          { value: '>', label: '>' },
                          { value: '<', label: '<' },
                          { value: '>=', label: '≥' },
                          { value: '<=', label: '≤' }
                        ]

                        return (
                          <div className="space-y-2">
                            {/* Operator buttons */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Operator:
                              </label>
                              <div className="grid grid-cols-6 gap-1">
                                {operators.map(op => (
                                  <button
                                    key={op.value}
                                    onClick={() => setCascadeOperator(op.value)}
                                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                                      cascadeOperator === op.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    {op.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Number input */}
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={cascadeInputValue}
                                onChange={(e) => setCascadeInputValue(e.target.value)}
                                placeholder={`Enter ${columnLabel.toLowerCase()}...`}
                                className="flex-1 text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && cascadeInputValue.trim()) {
                                    const operatorLabel = operators.find(op => op.value === cascadeOperator)?.label || '='
                                    setCascadeFilters([...cascadeFilters, {
                                      id: Date.now(),
                                      column: selectedCascadeColumn,
                                      value: cascadeInputValue.trim(),
                                      operator: cascadeOperator,
                                      label: `${columnLabel} ${operatorLabel} ${cascadeInputValue.trim()}`
                                    }])
                                    setCascadeInputValue('')
                                    setCascadeOperator('=')
                                    setSelectedCascadeColumn('')
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  if (cascadeInputValue.trim()) {
                                    const operatorLabel = operators.find(op => op.value === cascadeOperator)?.label || '='
                                    setCascadeFilters([...cascadeFilters, {
                                      id: Date.now(),
                                      column: selectedCascadeColumn,
                                      value: cascadeInputValue.trim(),
                                      operator: cascadeOperator,
                                      label: `${columnLabel} ${operatorLabel} ${cascadeInputValue.trim()}`
                                    }])
                                    setCascadeInputValue('')
                                    setCascadeOperator('=')
                                    setSelectedCascadeColumn('')
                                  }
                                }}
                                disabled={!cascadeInputValue.trim()}
                                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )
                      }

                      // Text fields - check filterType='text' instead of specific column names
                      if (column?.filterType === 'text') {
                        return (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={cascadeInputValue}
                              onChange={(e) => setCascadeInputValue(e.target.value)}
                              placeholder={`Enter ${columnLabel.toLowerCase()}...`}
                              className="flex-1 text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && cascadeInputValue.trim()) {
                                  setCascadeFilters([...cascadeFilters, {
                                    id: Date.now(),
                                    column: selectedCascadeColumn,
                                    value: cascadeInputValue.trim(),
                                    label: `${columnLabel}: ${cascadeInputValue.trim()}`
                                  }])
                                  setCascadeInputValue('')
                                  setSelectedCascadeColumn('')
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (cascadeInputValue.trim()) {
                                  setCascadeFilters([...cascadeFilters, {
                                    id: Date.now(),
                                    column: selectedCascadeColumn,
                                    value: cascadeInputValue.trim(),
                                    label: `${columnLabel}: ${cascadeInputValue.trim()}`
                                  }])
                                  setCascadeInputValue('')
                                  setSelectedCascadeColumn('')
                                }
                              }}
                              disabled={!cascadeInputValue.trim()}
                              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                          </div>
                        )
                      }

                      // Dropdown/Lookup fields - show checkboxes with search filter
                      const uniqueValues = [...new Set(filteredAndSorted.map(entry => entry[selectedCascadeColumn]).filter(val => val !== null && val !== undefined && val !== ''))]
                      const filteredValues = uniqueValues.filter(val =>
                        val.toString().toLowerCase().includes(cascadeInputValue.toLowerCase())
                      )

                      return (
                        <div>
                          <input
                            type="text"
                            value={cascadeInputValue}
                            onChange={(e) => setCascadeInputValue(e.target.value)}
                            placeholder={`Type to search ${columnLabel.toLowerCase()}...`}
                            className="w-full text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 mb-2"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800">
                            {filteredValues.length > 0 ? filteredValues.map(val => (
                              <label key={val} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCascadeFilters([...cascadeFilters, {
                                        id: Date.now(),
                                        column: selectedCascadeColumn,
                                        value: val,
                                        label: `${columnLabel}: ${val}`
                                      }])
                                    } else {
                                      setCascadeFilters(cascadeFilters.filter(f => !(f.column === selectedCascadeColumn && f.value === val)))
                                    }
                                  }}
                                  checked={cascadeFilters.some(f => f.column === selectedCascadeColumn && f.value === val)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300">{val}</span>
                              </label>
                            )) : (
                              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-3 space-y-1">
                                <div className="font-medium">No matches found</div>
                                {uniqueValues.length === 0 ? (
                                  <div className="text-xs">
                                    No values available in this column for the currently filtered rows.
                                    {cascadeFilters.length > 0 && ' Try removing or adjusting previous filters.'}
                                  </div>
                                ) : cascadeInputValue && (
                                  <div className="text-xs">
                                    No values match "{cascadeInputValue}". Try a different search term.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                      </div>

                      {/* Active filters list - moved under Select Values */}
                      <div className="flex-1 mt-2 overflow-y-auto">
                      {cascadeFilters.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Active Filters ({cascadeFilters.length}):
                            </label>
                            <button
                              onClick={() => setCascadeFilters([])}
                              className="px-2 py-0.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 text-[10px] font-medium rounded transition-colors"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {cascadeFilters.map((filter, index) => (
                              <div
                                key={filter.id}
                                className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => {
                                      if (index === 0) return
                                      const newFilters = [...cascadeFilters]
                                      const temp = newFilters[index]
                                      newFilters[index] = newFilters[index - 1]
                                      newFilters[index - 1] = temp
                                      setCascadeFilters(newFilters)
                                    }}
                                    disabled={index === 0}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] leading-none"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (index === cascadeFilters.length - 1) return
                                      const newFilters = [...cascadeFilters]
                                      const temp = newFilters[index]
                                      newFilters[index] = newFilters[index + 1]
                                      newFilters[index + 1] = temp
                                      setCascadeFilters(newFilters)
                                    }}
                                    disabled={index === cascadeFilters.length - 1}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] leading-none"
                                  >
                                    ▼
                                  </button>
                                </div>
                                <span className="flex-1 text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                  <span className="font-semibold text-purple-600 dark:text-purple-400">{index + 1}.</span>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {COLUMNS.find(col => col.key === filter.column)?.label || filter.column}:
                                  </span>
                                  {editingFilterId === filter.id ? (
                                    <input
                                      type="text"
                                      value={editingFilterValue}
                                      onChange={(e) => setEditingFilterValue(e.target.value)}
                                      onBlur={(e) => {
                                        const newValue = e.target.value.trim()
                                        if (newValue) {
                                          const columnLabel = COLUMNS.find(col => col.key === filter.column)?.label || filter.column
                                          // Match the original label format
                                          const operatorMap = { '=': '=', '!=': '≠', '>': '>', '<': '<', '>=': '≥', '<=': '≤' }
                                          const operatorLabel = operatorMap[filter.operator] || filter.operator
                                          const newLabel = filter.operator && filter.operator !== '='
                                            ? `${columnLabel} ${operatorLabel} ${newValue}`
                                            : `${columnLabel}: ${newValue}`

                                          setCascadeFilters(cascadeFilters.map(f =>
                                            f.id === filter.id
                                              ? { ...f, value: newValue, label: newLabel }
                                              : f
                                          ))
                                        }
                                        setEditingFilterId(null)
                                        setEditingFilterValue('')
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.target.blur()
                                        if (e.key === 'Escape') {
                                          setEditingFilterId(null)
                                          setEditingFilterValue('')
                                        }
                                      }}
                                      autoFocus
                                      className="flex-1 px-1 py-0.5 border border-blue-400 rounded bg-white dark:bg-gray-700 dark:text-white text-[11px] font-semibold min-w-[60px]"
                                    />
                                  ) : (
                                    <span
                                      className="font-semibold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
                                      onClick={() => {
                                        setEditingFilterId(filter.id)
                                        setEditingFilterValue(filter.value)
                                      }}
                                      title="Click to edit value"
                                    >
                                      {filter.operator && filter.operator !== '=' && <span className="text-orange-600 dark:text-orange-400">{filter.operator} </span>}
                                      {filter.value}
                                    </span>
                                  )}
                                </span>
                                <button
                                  onClick={() => setCascadeFilters(cascadeFilters.filter(f => f.id !== filter.id))}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                          No filters applied
                        </div>
                      )}
                      </div>
                    </div>

                    {/* COLUMN 3: Column Visibility */}
                    <div className="border-l border-gray-200 dark:border-gray-700 pl-4 h-full overflow-y-auto w-fit max-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Show/Hide Columns:
                        </label>
                        <button
                          onClick={() => {
                            const allVisible = COLUMNS.filter(col => col.key !== 'select').every(col => visibleColumns[col.key] !== false)
                            const newVisibility = {}
                            COLUMNS.filter(col => col.key !== 'select').forEach(col => {
                              newVisibility[col.key] = !allVisible
                            })
                            setVisibleColumns({ ...visibleColumns, ...newVisibility })
                          }}
                          className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-[10px] font-medium rounded transition-colors"
                        >
                          {COLUMNS.filter(col => col.key !== 'select').every(col => visibleColumns[col.key] !== false) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {COLUMNS.filter(col => col.key !== 'select')
                          .sort((a, b) => a.label.localeCompare(b.label))
                          .map((column, index) => (
                          <label key={column.key} className={`flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-0.5 cursor-pointer ${
                            index % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'
                          }`}>
                            <input
                              type="checkbox"
                              checked={visibleColumns[column.key] !== false}
                              onChange={(e) => {
                                setVisibleColumns({
                                  ...visibleColumns,
                                  [column.key]: e.target.checked
                                })
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="flex-1">{column.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN 4: Saved Views Section */}
                    <div className="border-l border-gray-200 dark:border-gray-700 pl-4 h-full overflow-hidden flex flex-col">
                    {useKanbanSavedViews ? (
                      <div className="flex-1 min-h-0">
                        {/* NEW: Kanban-style drag-and-drop saved views */}
                        <SavedViewsKanban
                          savedFilters={savedFilters}
                          setSavedFilters={setSavedFilters}
                          activeViewId={activeViewId}
                          setActiveViewId={setActiveViewId}
                          setCascadeFilters={setCascadeFilters}
                          setVisibleColumns={setVisibleColumns}
                          setShowCascadeDropdown={setShowCascadeDropdown}
                          filterName={filterName}
                          setFilterName={setFilterName}
                          cascadeFilters={cascadeFilters}
                          visibleColumns={visibleColumns}
                          editingViewId={editingViewId}
                          setEditingViewId={setEditingViewId}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto">
                      {/* OLD: Classic list-style saved views */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Saved Views
                        </span>
                        {savedFilters.length > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] bg-green-600 text-white rounded-full text-[10px] font-bold">
                            {savedFilters.length}
                          </span>
                        )}
                      </div>

                    {/* Update existing view button - only show if active view has been modified */}
                    {(() => {
                      if (!activeViewId || cascadeFilters.length === 0) return null
                      const activeView = savedFilters.find(v => v.id === activeViewId)
                      if (!activeView) return null

                      // Check if filters or columns have changed
                      const normalizeFilter = (f) => ({
                        column: f.column,
                        value: f.value,
                        operator: f.operator || '=',
                        label: f.label
                      })
                      const currentFilters = JSON.stringify(cascadeFilters.map(normalizeFilter))
                      const savedFiltersStr = JSON.stringify(activeView.filters.map(normalizeFilter))
                      const filtersChanged = currentFilters !== savedFiltersStr
                      const columnsChanged = activeView.visibleColumns && JSON.stringify(visibleColumns) !== JSON.stringify(activeView.visibleColumns)

                      if (!filtersChanged && !columnsChanged) return null

                      return (
                        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              setSavedFilters(savedFilters.map(v =>
                                v.id === activeViewId
                                  ? {
                                      ...v,
                                      filters: cascadeFilters.map(f => ({ column: f.column, value: f.value, operator: f.operator, label: f.label })),
                                      visibleColumns: { ...visibleColumns }
                                    }
                                  : v
                              ))
                              // Clear active filters and view
                              setCascadeFilters([])
                              setActiveViewId(null)
                              setShowCascadeDropdown(false)
                            }}
                            className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white text-sm font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                            title="Save changes to this view and close"
                          >
                            💾 Update "{activeView.name}"
                          </button>
                        </div>
                      )
                    })()}

                    {/* Save current view section - only show if there are active filters */}
                    {cascadeFilters.length > 0 && (
                      <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Save Current View:
                          </label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={filterName}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value.length <= 20) {
                                  setFilterName(value)
                                }
                              }}
                              placeholder="View name (max 20 chars)..."
                              maxLength={20}
                              className="flex-1 text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400"
                            />
                            <span className="text-[10px] text-gray-400 self-center">{filterName.length}/20</span>
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded border border-blue-200 dark:border-blue-800">
                            Will save: {cascadeFilters.length} filter{cascadeFilters.length !== 1 ? 's' : ''} + {Object.values(visibleColumns).filter(Boolean).length} visible column{Object.values(visibleColumns).filter(Boolean).length !== 1 ? 's' : ''}
                          </div>
                          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              id="cascade-saved-views-set-as-default"
                              className="rounded border-gray-300"
                            />
                            <span>Set as default view</span>
                          </label>
                          <button
                            onClick={() => {
                              if (!filterName.trim()) return
                              const isDefault = document.getElementById('cascade-saved-views-set-as-default').checked
                              const updatedFilters = isDefault
                                ? savedFilters.map(f => ({ ...f, isDefault: false }))
                                : savedFilters

                              const newViewId = Date.now()
                              setSavedFilters([...updatedFilters, {
                                id: newViewId,
                                name: filterName.trim(),
                                filters: cascadeFilters.map(f => ({ column: f.column, value: f.value, operator: f.operator, label: f.label })),
                                visibleColumns: { ...visibleColumns },
                                isDefault: isDefault
                              }])
                              setActiveViewId(newViewId)
                              setFilterName('')
                              document.getElementById('cascade-saved-views-set-as-default').checked = false
                            }}
                            disabled={!filterName.trim()}
                            className="w-full px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save View
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Saved views list */}
                    {savedFilters.length > 0 ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Your Saved Views ({savedFilters.length}):
                        </label>
                        <div className="space-y-1.5">
                          {savedFilters.map((saved, index) => (
                            <div
                              key={saved.id}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border ${
                                activeViewId === saved.id
                                  ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600'
                                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              }`}
                            >
                              {editingViewId === saved.id ? (
                                <>
                                  <input
                                    type="text"
                                    defaultValue={saved.name}
                                    maxLength={20}
                                    onBlur={(e) => {
                                      const newName = e.target.value.trim()
                                      if (newName) {
                                        setSavedFilters(savedFilters.map(f =>
                                          f.id === saved.id ? { ...f, name: newName } : f
                                        ))
                                      }
                                      setEditingViewId(null)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') e.target.blur()
                                      if (e.key === 'Escape') setEditingViewId(null)
                                    }}
                                    autoFocus
                                    className="flex-1 text-xs px-1 py-0.5 border border-blue-400 rounded bg-white dark:bg-gray-700 dark:text-white"
                                  />
                                </>
                              ) : (
                                <>
                                  <div className="flex-1 flex flex-col gap-0.5">
                                    <button
                                      onClick={() => {
                                        setCascadeFilters(saved.filters.map(f => ({
                                          id: Date.now() + Math.random(),
                                          column: f.column,
                                          value: f.value,
                                          operator: f.operator || '=',
                                          label: f.label
                                        })))
                                        if (saved.visibleColumns) {
                                          setVisibleColumns(saved.visibleColumns)
                                        }
                                        setActiveViewId(saved.id)
                                        setShowCascadeDropdown(false)
                                      }}
                                      className="text-left text-xs text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium truncate"
                                      title={`${saved.name} - ${saved.filters.length} filters, ${saved.visibleColumns ? Object.values(saved.visibleColumns).filter(Boolean).length : 0} columns visible`}
                                    >
                                      {saved.isDefault && <span className="text-yellow-600 dark:text-yellow-400">⭐ </span>}
                                      {saved.name}
                                    </button>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                      {saved.filters.length} filter{saved.filters.length !== 1 ? 's' : ''} • {saved.visibleColumns ? Object.values(saved.visibleColumns).filter(Boolean).length : 0} column{saved.visibleColumns && Object.values(saved.visibleColumns).filter(Boolean).length !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                  {/* Up/Down arrows for reordering */}
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      onClick={() => {
                                        if (index === 0) return
                                        const newFilters = [...savedFilters]
                                        const temp = newFilters[index]
                                        newFilters[index] = newFilters[index - 1]
                                        newFilters[index - 1] = temp
                                        setSavedFilters(newFilters)
                                      }}
                                      disabled={index === 0}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] leading-none"
                                      title="Move up"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (index === savedFilters.length - 1) return
                                        const newFilters = [...savedFilters]
                                        const temp = newFilters[index]
                                        newFilters[index] = newFilters[index + 1]
                                        newFilters[index + 1] = temp
                                        setSavedFilters(newFilters)
                                      }}
                                      disabled={index === savedFilters.length - 1}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] leading-none"
                                      title="Move down"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Load the view for editing
                                      setCascadeFilters(saved.filters.map(f => ({
                                        id: Date.now() + Math.random(),
                                        column: f.column,
                                        value: f.value,
                                        operator: f.operator || '=',
                                        label: f.label
                                      })))
                                      if (saved.visibleColumns) {
                                        setVisibleColumns(saved.visibleColumns)
                                      }
                                      setActiveViewId(saved.id)
                                      // Don't close dropdown - keep it open so user can see what they're editing
                                    }}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                                    title="Load view to edit filters and columns"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => setEditingViewId(saved.id)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs"
                                    title="Rename view"
                                  >
                                    📝
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSavedFilters(savedFilters.map(f => ({
                                        ...f,
                                        isDefault: f.id === saved.id ? true : false
                                      })))
                                    }}
                                    className={`text-xs ${saved.isDefault ? 'opacity-50' : 'hover:text-yellow-600'}`}
                                    title={saved.isDefault ? "Already default" : "Set as default"}
                                    disabled={saved.isDefault}
                                  >
                                    ⭐
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (activeViewId === saved.id) setActiveViewId(null)
                                      setSavedFilters(savedFilters.filter(f => f.id !== saved.id))
                                    }}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-bold"
                                    title="Delete view"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-3 bg-gray-50 dark:bg-gray-700/30 rounded">
                        No saved views yet. Apply some filters and save them as a view!
                      </div>
                    )}
                    </div>
                    )}
                    {/* END COLUMN 4 */}
                    </div>
                  </div>
                  {/* END MAIN GRID */}
                </div>
                {/* END PADDING WRAPPER */}
                </div>
                {/* END MODAL WRAPPER */}
              </>
            )}
          </div>

          {/* Showing count */}
          <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            Showing {filteredAndSorted.length} of {entries.length} entries
          </div>
        </div>
        </div>

        {/* Table with Sticky Gradient Headers (Chapter 20.2) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="trapid-table-scroll flex-1 overflow-y-auto overflow-x-scroll relative bg-white dark:bg-gray-900"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#2563EB #FFFFFF',
            maxHeight: 'calc(100vh - 320px)', // Footer always visible
            minHeight: '600px' // Minimum 10 rows visible to prevent dropdown cutoff
          }}
        >
          <table className="w-full border-collapse" style={{ tableLayout: 'auto' }}>
            <thead className="sticky top-0 z-10 backdrop-blur-sm bg-blue-600 dark:bg-blue-800">
            <tr className="border-b border-blue-700 dark:border-blue-900">
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                const column = COLUMNS.find(c => c.key === colKey)
                if (!column) return null

                // Check if this is a system-generated column
                const isSystemGenerated = ['id', 'created_at', 'updated_at'].includes(colKey)

                return (
                  <th
                    key={colKey}
                    onDragOver={(e) => handleDragOver(e, colKey)}
                    onDrop={(e) => handleDrop(e, colKey)}
                    onClick={(e) => {
                      // Only sort if clicking on the column content, not resize handle or drag icon
                      if (column.sortable && !e.defaultPrevented) {
                        handleSort(colKey)
                      }
                    }}
                    style={{
                      width: columnWidths[colKey],
                      minWidth: columnWidths[colKey],
                      position: 'relative',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      verticalAlign: 'top',
                      height: '100px',
                      // Visual drop indicator - green border when this is the drop target
                      borderLeft: dropTargetColumn === colKey ? '4px solid #10b981' : undefined,
                      borderRight: dropTargetColumn === colKey ? '4px solid #10b981' : undefined,
                      // System-generated columns get red background
                      backgroundColor: isSystemGenerated ? (dropTargetColumn === colKey ? '#059669' : '#dc2626') : undefined,
                    }}
                    className={`group align-top ${colKey === 'select' ? 'px-1 py-4' : 'px-6 pt-4 pb-2'} ${colKey === 'select' ? 'text-center' : 'text-left'} text-white tracking-wide transition-colors ${
                      column.sortable && !isSystemGenerated ? 'cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900' : ''
                    } ${column.sortable && isSystemGenerated ? 'cursor-pointer hover:bg-red-700 dark:hover:bg-red-800' : ''} ${
                      draggedColumn === colKey && !isSystemGenerated ? 'bg-blue-700 dark:bg-blue-900 opacity-50' : ''
                    } ${draggedColumn === colKey && isSystemGenerated ? 'bg-red-700 dark:bg-red-800 opacity-50' : ''} ${
                      dropTargetColumn === colKey ? 'bg-green-600 dark:bg-green-700' : ''
                    }`}
                  >
                    {/* Select All Checkbox (Chapter 20.1) */}
                    {colKey === 'select' ? (
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectAll()
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between h-full gap-2">
                        <div className="flex items-start gap-1">
                          {column.resizable && (
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation()
                                handleDragStart(e, colKey)
                                e.dataTransfer.effectAllowed = 'move'
                              }}
                              onDragEnd={(e) => {
                                e.stopPropagation()
                                handleDragEnd()
                              }}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <Bars3Icon className="h-4 w-4 text-gray-200 hover:text-white transition-colors" />
                            </div>
                          )}
                          <span>{column.label}</span>
                          {isSystemGenerated && <span className="ml-1 text-sm">🔒</span>}
                          {column.sortable && <SortIcon column={colKey} />}
                          {/* Schema Editor Cog Icon - only show in Edit Individual mode */}
                          {editIndividualMode && enableSchemaEditor && colKey !== 'select' && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                // Create a column object to pass to the editor
                                setSelectedColumnForEdit({
                                  id: colKey,
                                  name: column.label,
                                  column_name: colKey,
                                  column_type: column.column_type || 'single_line_text', // Use column type from config
                                  required: false
                                })
                              }}
                              className={`ml-2 p-1 rounded transition-colors ${
                                isSystemGenerated
                                  ? 'hover:bg-red-500 dark:hover:bg-red-700'
                                  : 'hover:bg-blue-500 dark:hover:bg-blue-700'
                              }`}
                              title={isSystemGenerated ? 'Edit system-generated column schema' : 'Edit column schema'}
                            >
                              <Cog8ToothIcon className="h-4 w-4 text-orange-300 hover:text-white" />
                            </button>
                          )}
                        </div>

                        {/* Column Resize Handle */}
                        {column.resizable && (
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              handleResizeStart(e, colKey)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 bg-transparent hover:bg-blue-300 dark:hover:bg-blue-500 cursor-col-resize z-20 transition-all"
                            style={{ cursor: 'col-resize' }}
                          />
                        )}

                        {/* Inline Column Filter (Chapter 20.1) - Show only if showFilters is true */}
                        {showFilters && column.filterType === 'text' && (
                          <input
                            type="text"
                            placeholder="Filter..."
                            value={columnFilters[colKey] || ''}
                            onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs px-2 py-1 border border-blue-400 dark:border-blue-700 rounded focus:ring-1 focus:ring-white focus:border-white bg-blue-500 dark:bg-blue-700 text-white placeholder-blue-200 dark:placeholder-blue-300"
                          />
                        )}

                        {showFilters && column.filterType === 'dropdown' && colKey !== 'component' && (
                          <select
                            value={columnFilters[colKey] || ''}
                            onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs px-2 py-1 border border-blue-400 dark:border-blue-700 rounded focus:ring-1 focus:ring-white focus:border-white bg-blue-500 dark:bg-blue-700 text-white placeholder-blue-200 dark:placeholder-blue-300"
                          >
                            <option key="inline-all" value="">All</option>
                            {colKey === 'category' && (
                              <>
                                <option key="inline-cat-bible" value="bible">📖 Bible</option>
                                <option key="inline-cat-teacher" value="teacher">🔧 Teacher</option>
                                <option key="inline-cat-lexicon" value="lexicon">📕 Lexicon</option>
                              </>
                            )}
                            {colKey === 'chapter' && uniqueChapters.map(ch => (
                              <option key={ch.value} value={ch.value}>{ch.label}</option>
                            ))}
                            {colKey === 'type' && (
                              <>
                                {/* Lexicon types */}
                                <option key="inline-type-bug" value="bug">🐛 Bug</option>
                                <option key="inline-type-architecture" value="architecture">🏗️ Architecture</option>
                                <option key="inline-type-test" value="test">📊 Test</option>
                                <option key="inline-type-performance" value="performance">📈 Performance</option>
                                <option key="inline-type-dev-note" value="dev_note">🎓 Dev Note</option>
                                <option key="inline-type-common-issue" value="common_issue">🔍 Common Issue</option>
                                {/* Teacher types */}
                                <option key="inline-type-component" value="component">🧩 Component</option>
                                <option key="inline-type-feature" value="feature">✨ Feature</option>
                                <option key="inline-type-util" value="util">🔧 Util</option>
                                <option key="inline-type-hook" value="hook">🪝 Hook</option>
                                <option key="inline-type-integration" value="integration">🔌 Integration</option>
                                <option key="inline-type-optimization" value="optimization">⚡ Optimization</option>
                                <option key="inline-type-dropdown-md" value="dropdown_md">📋 Dropdown Md</option>
                                {/* Bible types */}
                                <option key="inline-type-must" value="MUST">✅ Must</option>
                                <option key="inline-type-never" value="NEVER">❌ Never</option>
                                <option key="inline-type-always" value="ALWAYS">🔄 Always</option>
                                <option key="inline-type-protected" value="PROTECTED">🔒 Protected</option>
                                <option key="inline-type-config" value="CONFIG">⚙️ Config</option>
                                <option key="inline-type-rule" value="rule">📖 Rule</option>
                                <option key="inline-type-reference" value="REFERENCE">📚 Reference</option>
                              </>
                            )}
                            {colKey === 'status' && (
                              <>
                                <option key="active" value="active">Active</option>
                                <option key="inactive" value="inactive">Inactive</option>
                                <option key="open" value="open">Open</option>
                                <option key="fixed" value="fixed">Fixed</option>
                                <option key="by_design" value="by_design">By Design</option>
                                <option key="monitoring" value="monitoring">Monitoring</option>
                              </>
                            )}
                            {colKey === 'severity' && (
                              <>
                                <option key="low" value="low">Low</option>
                                <option key="medium" value="medium">Medium</option>
                                <option key="high" value="high">High</option>
                                <option key="critical" value="critical">Critical</option>
                              </>
                            )}
                            {colKey === 'trinity' && (
                              <>
                                <option key="inline-trinity-bible" value="bible">📖 Bible</option>
                                <option key="inline-trinity-teacher" value="teacher">🔧 Teacher</option>
                                <option key="inline-trinity-lexicon" value="lexicon">📕 Lexicon</option>
                              </>
                            )}
                            {colKey === 'component' && (
                              <>
                                <option key="inline-comp-auth" value="Auth">Auth</option>
                                <option key="inline-comp-chat" value="Chat">Chat</option>
                                <option key="inline-comp-dynamic" value="DynamicTables">DynamicTables</option>
                                <option key="inline-comp-email" value="Email">Email</option>
                                <option key="inline-comp-gantt" value="Gantt">Gantt</option>
                                <option key="inline-comp-jobs" value="Jobs">Jobs</option>
                                <option key="inline-comp-onedrive" value="OneDrive">OneDrive</option>
                                <option key="inline-comp-payments" value="Payments">Payments</option>
                                <option key="inline-comp-pos" value="PurchaseOrders">PurchaseOrders</option>
                                <option key="inline-comp-settings" value="Settings">Settings</option>
                                <option key="inline-comp-table" value="Table">Table</option>
                                <option key="inline-comp-tasks" value="Tasks">Tasks</option>
                                <option key="inline-comp-weather" value="Weather">Weather</option>
                                <option key="inline-comp-xero" value="Xero">Xero</option>
                              </>
                            )}
                            {/* Generic fallback for other dropdown columns - dynamically populate from data */}
                            {!['category', 'chapter', 'type', 'status', 'severity', 'trinity', 'component'].includes(colKey) &&
                              getUniqueValuesForColumn(colKey).map((value, idx) => (
                                <option key={`${colKey}-${value}-${idx}`} value={value}>{value}</option>
                              ))
                            }
                          </select>
                        )}

                        {/* Component multi-select checkboxes - Show only if showFilters is true */}
                        {showFilters && colKey === 'component' && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowComponentDropdown(!showComponentDropdown)
                              }}
                              className="w-full text-xs px-2 py-1 border border-blue-400 dark:border-blue-700 rounded focus:ring-1 focus:ring-white focus:border-white bg-blue-500 dark:bg-blue-700 text-white flex items-center justify-between"
                            >
                              <span>{selectedComponents.size > 0 ? `${selectedComponents.size} selected` : 'Filter...'}</span>
                              <span>▼</span>
                            </button>
                            {showComponentDropdown && (
                              <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg text-xs z-[100] min-w-full max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                {uniqueComponents.map(comp => (
                                  <label key={comp} className="flex items-center space-x-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded cursor-pointer text-gray-900 dark:text-white whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={selectedComponents.has(comp)}
                                      onChange={(e) => {
                                        const newSet = new Set(selectedComponents)
                                        if (e.target.checked) {
                                          newSet.add(comp)
                                        } else {
                                          newSet.delete(comp)
                                        }
                                        setSelectedComponents(newSet)
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <span>{comp}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Default text filter for columns without specific filterType - Show only if showFilters is true */}
                        {showFilters && !column.filterType && colKey !== 'component' && colKey !== 'select' && (
                          <input
                            type="text"
                            placeholder="Filter..."
                            value={columnFilters[colKey] || ''}
                            onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs px-2 py-1 border border-blue-400 dark:border-blue-700 rounded focus:ring-1 focus:ring-white focus:border-white bg-blue-500 dark:bg-blue-700 text-white placeholder-blue-200 dark:placeholder-blue-300"
                          />
                        )}

                        {/* Empty spacer for select column */}
                        {showFilters && colKey === 'select' && (
                          <div className="h-[26px]"></div>
                        )}
                      </div>
                    )}

                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900">
            {filteredAndSorted.length > 0 ? filteredAndSorted.map((entry, index) => (
              <tr
                key={entry.id}
                onDoubleClick={(e) => {
                  // Double-click row when NOT in edit mode to open editable modal
                  if (!editModeActive) {
                    e.stopPropagation()
                    setModalEditData({...entry})
                    setShowEditableModal(true)
                  }
                }}
                className={`${
                  editingRowId === entry.id
                    ? 'bg-white dark:bg-gray-800 ring-4 ring-blue-500 shadow-lg'
                    : selectedRows.has(entry.id)
                      ? 'bg-blue-200 dark:bg-blue-800/60 ring-2 ring-blue-400 dark:ring-blue-500'
                      : index % 2 === 0
                        ? 'bg-white dark:bg-gray-900'
                        : editModeActive
                          ? 'bg-orange-50 dark:bg-orange-900/20'
                          : 'bg-blue-50 dark:bg-blue-900/20'
                } ${!editModeActive ? 'cursor-pointer' : ''} ${editModeActive ? 'hover:bg-orange-100 dark:hover:bg-orange-800/30' : 'hover:bg-blue-100 dark:hover:bg-blue-800/30'} transition-colors duration-150`}
              >
                {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                  const column = COLUMNS.find(c => c.key === colKey)
                  if (!column) return null

                  return (
                    <td
                      key={colKey}
                      onDoubleClick={(e) => {
                        // Double-click row when NOT in edit mode to open editable modal (handled at row level)
                      }}
                      onClick={(e) => {
                        // Debug logging
                        console.log('Cell clicked:', {
                          colKey,
                          editModeActive,
                          isComputed: column.isComputed,
                          currentEditingRowId: editingRowId,
                          clickedRowId: entry.id
                        });

                        // Single-click on Title or Content columns ONLY to open detail modal (only when not in edit mode)
                        const textColumns = ['title', 'content'];
                        if (textColumns.includes(colKey) && !editModeActive) {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                          setSelectedColumn(colKey); // Track which column was clicked
                          return;
                        }

                        // In edit mode: make ALL cells editable on click (except select, id, user_id, and computed)
                        if (editModeActive && colKey !== 'select' && colKey !== 'id' && colKey !== 'user_id' && !column.isComputed) {
                          e.stopPropagation();
                          if (editingRowId !== entry.id) {
                            // Validate current editing data before switching rows
                            if (editingRowId !== null && Object.keys(editingData).length > 0) {
                              const errors = []
                              Object.keys(editingData).forEach(key => {
                                const error = validateField(key, editingData[key])
                                if (error) errors.push(error)
                              })
                              if (errors.length > 0) {
                                setValidationError(errors[0]) // Show first error
                                setTimeout(() => setValidationError(null), 4000) // Clear after 4 seconds
                                return // Don't switch rows if validation fails
                              }
                            }
                            setValidationError(null)
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
                      className={`group relative ${colKey === 'select' ? 'px-1 py-1' : 'px-3 py-1'} ${
                        // Gray out computed columns when in edit mode
                        editModeActive && column.isComputed ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                      } ${
                        colKey === 'select' ? 'text-center' : ['price', 'quantity', 'total_cost'].includes(colKey) ? 'text-right' : ''
                      } ${
                        // Non-edit mode: highlight clickable title/content cells
                        ['title', 'content'].includes(colKey) && !editModeActive ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''
                      } ${
                        // Edit mode: make all cells clickable except select, id, user_id, and computed
                        editModeActive && colKey !== 'select' && colKey !== 'id' && colKey !== 'user_id' && !column.isComputed ? 'cursor-pointer' : ''
                      } whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}
                    >
                      {renderCellContent(entry, colKey)}
                    </td>
                  )
                })}
              </tr>
            )) : (
              // When no rows match filters, show 10 empty placeholder rows to maintain table height
              // This keeps filter dropdowns accessible (Chapter 20: Table must remain usable even with no matches)
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={`empty-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-blue-50 dark:bg-blue-900/20'}>
                  {columnOrder.filter(key => visibleColumns[key]).map(colKey => (
                    <td key={colKey} className="px-6 py-3 text-center text-sm text-gray-400 dark:text-gray-600">
                      {colKey === 'select' ? '' : index === 4 && colKey === columnOrder.filter(key => visibleColumns[key])[1] ? 'No entries found matching your filters' : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {/* Table Footer - shows sums for currency/numeric columns */}
          <tfoot className="sticky bottom-0 z-10 bg-blue-100 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800">
            <tr>
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                const column = COLUMNS.find(c => c.key === colKey)
                if (!column) return null

                // Calculate sum for currency/numeric columns
                // If rows are selected, sum only selected rows; otherwise sum all
                let sum = null
                if (column.showSum) {
                  const rowsToSum = selectedRows.size > 0
                    ? filteredAndSorted.filter(entry => selectedRows.has(entry.id))
                    : filteredAndSorted

                  sum = rowsToSum.reduce((total, entry) => {
                    // For computed columns, use the compute function
                    let value
                    if (column.isComputed && column.computeFunction) {
                      value = column.computeFunction(entry)
                    } else {
                      value = entry[colKey]
                    }
                    // Handle numeric values
                    const numValue = typeof value === 'number' ? value : parseFloat(value)
                    return total + (isNaN(numValue) ? 0 : numValue)
                  }, 0)
                }

                return (
                  <td
                    key={colKey}
                    style={{
                      width: columnWidths[colKey],
                      minWidth: columnWidths[colKey],
                    }}
                    className={`${colKey === 'select' ? 'px-1 py-1.5' : 'px-6 py-1.5'} ${
                      colKey === 'select' ? 'text-center' : column.showSum ? 'text-right' : 'text-left'
                    } text-xs font-semibold text-gray-700 dark:text-gray-300`}
                  >
                    {colKey === 'select' ? (
                      // Empty cell for checkbox column
                      ''
                    ) : column.showSum ? (
                      // Display sum (right-aligned) - format based on sumType
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-600 dark:text-gray-400">{selectedRows.size > 0 ? 'Selected:' : 'Total:'}</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {column.sumType === 'currency'
                            ? new Intl.NumberFormat('en-AU', {
                                style: 'currency',
                                currency: 'AUD'
                              }).format(sum)
                            : sum.toLocaleString('en-AU')
                          }
                        </span>
                      </div>
                    ) : (
                      // Empty cell for non-sum columns
                      ''
                    )}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>
      {/* End bordered container */}

      {/* Sticky horizontal scrollbar (RULE #20.33) */}
      {tableScrollWidth > 0 && (
        <div
          ref={stickyScrollbarRef}
          className="sticky bottom-0 left-0 right-0 z-20 overflow-x-auto overflow-y-hidden bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
          style={{ height: '20px' }}
          onScroll={(e) => {
            if (isScrollingMainRef.current) {
              isScrollingMainRef.current = false
              return
            }
            const { scrollLeft } = e.target
            if (scrollContainerRef.current) {
              isScrollingStickyRef.current = true
              scrollContainerRef.current.scrollLeft = scrollLeft
            }
          }}
        >
          <div style={{ width: `${tableScrollWidth}px`, height: '1px' }}></div>
        </div>
      )}
      </div>

      {/* Full Entry Details Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedEntry(null)
            setSelectedColumn(null)
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-blue-600 dark:bg-blue-800 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div>
                <div className="text-sm font-medium opacity-90">
                  {selectedColumn === 'title' ? 'Title' : selectedColumn === 'content' ? 'Content' : 'Details'}
                </div>
                <h2 className="text-xl font-bold mt-1">
                  {selectedColumn === 'title' ? selectedEntry.title : selectedColumn === 'content' ? 'Content Details' : selectedEntry.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedEntry(null)
                  setSelectedColumn(null)
                }}
                className="p-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Show only the clicked column's content */}
              {selectedColumn === 'title' && (
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedEntry.title}
                  </div>
                </div>
              )}

              {selectedColumn === 'content' && (
                <div>
                  <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {/* Show content based on category */}
                    {selectedEntry.category === 'bible' && (selectedEntry.description || selectedEntry.details || selectedEntry.examples || 'No content available')}
                    {selectedEntry.category === 'teacher' && (selectedEntry.summary || selectedEntry.description || selectedEntry.code_example || 'No content available')}
                    {selectedEntry.category === 'lexicon' && (selectedEntry.scenario || selectedEntry.description || selectedEntry.solution || 'No content available')}
                    {selectedEntry.category === 'inspiring_quotes' && (selectedEntry.description || 'No content available')}
                    {!['bible', 'teacher', 'lexicon', 'inspiring_quotes'].includes(selectedEntry.category) && (selectedEntry.description || selectedEntry.content || 'No content available')}
                  </div>
                </div>
              )}

              {/* Fallback: show metadata if no specific column selected */}
              {!selectedColumn && (
                <>
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

              {/* Dense Index - Searchable Content */}
              {selectedEntry.dense_index && (
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Dense Index (Searchable)</div>
                  <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-xs leading-relaxed max-h-96 overflow-y-auto">{selectedEntry.dense_index}</div>
                </div>
              )}

              {/* Related Rules */}
              {selectedEntry.related_rules && (
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Related Rules</div>
                  <div className="text-sm text-gray-900 dark:text-white">{selectedEntry.related_rules}</div>
                </div>
              )}
                </>
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
                  onClick={() => {
                    setSelectedEntry(null)
                    setSelectedColumn(null)
                  }}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Editing Modal */}
      {showTextEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowTextEditModal(false)}>
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" aria-hidden="true" />

            {/* Modal Dialog */}
            <div
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit {textEditField === 'title' ? 'Title' : 'Content'}
                </h3>
                <button
                  onClick={() => setShowTextEditModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <RichTextEditor
                  value={textEditValue}
                  onChange={(html) => setTextEditValue(html)}
                  placeholder={`Enter ${textEditField === 'title' ? 'title' : 'content'}...`}
                />

                {/* Statistics */}
                <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{textEditValue.replace(/<[^>]*>/g, '').length}</span>
                    <span className="text-xs">characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {textEditValue.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length}
                    </span>
                    <span className="text-xs">words</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowTextEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (textEditField === 'title') {
                      setEditingData({ ...editingData, title: textEditValue })
                    } else if (textEditField === 'content') {
                      setEditingData({ ...editingData, description: textEditValue })
                    }
                    setShowTextEditModal(false)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editable Modal - Double-click row to open */}
      {showEditableModal && modalEditData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEditableModal(false)
            setModalEditData(null)
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-5 rounded-t-lg flex items-center justify-between z-10 shadow-lg">
              <div>
                <h2 className="text-2xl font-bold">Edit Item</h2>
                <p className="text-blue-100 text-sm mt-1">Make changes to all fields</p>
              </div>
              <button
                onClick={() => {
                  setShowEditableModal(false)
                  setModalEditData(null)
                }}
                className="p-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Form Fields */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COLUMNS.filter(col => col.key !== 'select' && col.key !== 'total_cost' && !col.isComputed).map((column) => (
                  <div key={column.key} className={column.key === 'content' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {column.label}
                    </label>

                    {/* Text inputs */}
                    {['section', 'email', 'phone', 'mobile', 'title', 'category_type', 'document_link'].includes(column.key) && (
                      <input
                        type={column.key === 'email' ? 'email' : column.key === 'document_link' ? 'url' : 'text'}
                        value={modalEditData[column.key] || ''}
                        onChange={(e) => setModalEditData({ ...modalEditData, [column.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {/* Number inputs */}
                    {['price', 'quantity', 'discount', 'whole_number'].includes(column.key) && (
                      <input
                        type="number"
                        step={column.key === 'price' ? '0.01' : column.key === 'whole_number' ? '1' : 'any'}
                        value={modalEditData[column.key] || ''}
                        onChange={(e) => setModalEditData({ ...modalEditData, [column.key]: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {/* Boolean checkbox */}
                    {column.key === 'is_active' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={modalEditData[column.key] || false}
                          onChange={(e) => setModalEditData({ ...modalEditData, [column.key]: e.target.checked })}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Active</span>
                      </div>
                    )}

                    {/* Status dropdown */}
                    {column.key === 'status' && (
                      <select
                        value={modalEditData[column.key] || 'active'}
                        onChange={(e) => setModalEditData({ ...modalEditData, [column.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="open">Open</option>
                        <option value="fixed">Fixed</option>
                        <option value="by_design">By Design</option>
                        <option value="monitoring">Monitoring</option>
                      </select>
                    )}

                    {/* Severity dropdown */}
                    {column.key === 'severity' && (
                      <select
                        value={modalEditData[column.key] || ''}
                        onChange={(e) => setModalEditData({ ...modalEditData, [column.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    )}

                    {/* Component text input */}
                    {column.key === 'component' && (
                      <input
                        type="text"
                        value={modalEditData[column.key] || ''}
                        onChange={(e) => setModalEditData({ ...modalEditData, [column.key]: e.target.value })}
                        placeholder="e.g., Auth, Chat, Jobs"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {/* Multi-line content */}
                    {column.key === 'content' && (
                      <textarea
                        value={modalEditData[column.key] || ''}
                        onChange={(e) => setModalEditData({ ...modalEditData, [column.key]: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Enter notes or details..."
                      />
                    )}

                    {/* Date field - read only */}
                    {column.key === 'updated_at' && (
                      <input
                        type="text"
                        value={modalEditData[column.key] ? new Date(modalEditData[column.key]).toLocaleString('en-AU') : 'Never'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-lg flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEditableModal(false)
                  setModalEditData(null)
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Call the onEdit callback with the updated data
                  onEdit(modalEditData)
                  setShowEditableModal(false)
                  setModalEditData(null)
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Editor Individual Modal */}
      {selectedColumnForEdit && (
        <ColumnEditorModal
          isOpen={!!selectedColumnForEdit}
          column={selectedColumnForEdit}
          table={null} // TODO: Pass table data if needed
          tableId={tableIdNumeric}
          onClose={() => setSelectedColumnForEdit(null)}
          onUpdate={() => {
            // Optionally reload data here if needed
            setSelectedColumnForEdit(null)
          }}
        />
      )}
    </>
  )
}
