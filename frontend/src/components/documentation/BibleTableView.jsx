import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  EyeIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'

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

// Parse markdown content to extract rules
const parseRulesFromMarkdown = (content) => {
  if (!content) return []

  const lines = content.split('\n')
  const rules = []
  let currentChapter = 0
  let currentRule = null
  let collectingContent = false

  lines.forEach((line, index) => {
    // Match chapter headers: # Chapter X:
    const chapterMatch = line.match(/^#\s+Chapter\s+(\d+):/)
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1])
      return
    }

    // Match rule headers: ## RULE #X.X:
    const ruleMatch = line.match(/^##\s+RULE\s+#([\d.]+):\s*(.+)/)
    if (ruleMatch) {
      // Save previous rule if exists
      if (currentRule) {
        rules.push(currentRule)
      }

      // Start new rule
      currentRule = {
        id: ruleMatch[1], // Use just the rule number as ID (e.g., "19.6" not "19.19.6")
        ruleNumber: ruleMatch[1],
        chapter: currentChapter,
        chapterName: CHAPTER_NAMES[currentChapter] || `Chapter ${currentChapter}`,
        title: ruleMatch[2].trim(),
        content: '',
        lineNumber: index + 1
      }
      collectingContent = true
      return
    }

    // Match next heading (stop collecting)
    if (line.match(/^##\s+[^R]/) || line.match(/^#\s+/)) {
      collectingContent = false
      return
    }

    // Collect content for current rule
    if (collectingContent && currentRule && line.trim()) {
      currentRule.content += line + '\n'
    }
  })

  // Add last rule
  if (currentRule) {
    rules.push(currentRule)
  }

  return rules
}

// Define columns (RULE #19.1 compliant) - Simplified for readability
const COLUMNS = [
  { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 50, tooltip: 'Select rows' },
  { key: 'chapter', label: 'Chapter', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 200, tooltip: 'Chapter number and name' },
  { key: 'rule', label: 'Rule', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 100, tooltip: 'Rule number (e.g., 1.01, 20.37)' },
  { key: 'type', label: 'Type', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 120, tooltip: 'Rule type: MUST, NEVER, ALWAYS, PROTECTED, CONFIG' },
  { key: 'trinity', label: 'Trinity', resizable: true, sortable: false, filterable: true, filterType: 'dropdown', width: 180, tooltip: 'Related Trinity documents: Bible, Teacher, Lexicon' },
  { key: 'subtitle', label: 'Rule Title', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 500, tooltip: 'Rule title - click row to view full details' },
  { key: 'content', label: 'Description', resizable: true, sortable: false, filterable: false, width: 800, tooltip: 'Rule description - click row to view full details' }
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

export default function BibleTableView({ entries, onEdit, onDelete, stats }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rule')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [columnFilters, setColumnFilters] = useState({})
  const [activeTab, setActiveTab] = useState('all') // Chapter filter tabs
  const [expandedRows, setExpandedRows] = useState(new Set()) // Row expansion state
  const [selectedRule, setSelectedRule] = useState(null) // Rule selected for modal view
  const [editingRule, setEditingRule] = useState(null) // Rule being edited
  const [editFormData, setEditFormData] = useState(null) // Edit form data

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

  // Custom scrollbar state
  const [scrollbarThumbHeight, setScrollbarThumbHeight] = useState(0)
  const [scrollbarThumbTop, setScrollbarThumbTop] = useState(0)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)
  const scrollContainerRef = useRef(null)
  const stickyScrollbarRef = useRef(null)
  const isScrollingStickyRef = useRef(false)
  const isScrollingMainRef = useRef(false)

  // Update custom scrollbar on scroll
  const handleScroll = (e) => {
    if (isScrollingStickyRef.current) {
      isScrollingStickyRef.current = false
      return
    }

    isScrollingMainRef.current = true
    const container = e.target
    const { scrollTop, scrollHeight, clientHeight, scrollLeft } = container

    // Sync vertical scrollbar
    if (scrollHeight <= clientHeight) {
      setScrollbarThumbHeight(0)
    } else {
      const thumbHeight = (clientHeight / scrollHeight) * clientHeight
      const thumbTop = (scrollTop / scrollHeight) * clientHeight
      setScrollbarThumbHeight(thumbHeight)
      setScrollbarThumbTop(thumbTop)
    }

    // Sync horizontal sticky scrollbar
    if (stickyScrollbarRef.current) {
      stickyScrollbarRef.current.scrollLeft = scrollLeft
    }

    setTimeout(() => { isScrollingMainRef.current = false }, 0)
  }

  // Handle sticky scrollbar scroll
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

  // Transform entries from Trinity API to match component structure
  const rules = useMemo(() => {
    if (!entries || entries.length === 0) return []

    return entries.map(rule => ({
      id: rule.id,
      ruleNumber: rule.section_number,
      chapter: rule.chapter_number,
      chapterName: rule.chapter_name,
      title: rule.title,
      ruleType: rule.entry_type,
      typeEmoji: rule.type_emoji,
      typeDisplay: rule.type_display,
      description: rule.description || '',
      codeExample: rule.code_example || '',
      crossReferences: rule.related_rules || '',
      relatedDocs: rule.related_rules || '',
      fullTitle: rule.full_title
    }))
  }, [entries])

  // Helper function to parse rule numbers for numeric sorting
  const parseRuleNumber = (ruleNumber) => {
    if (!ruleNumber) return [0, 0]
    // Parse "19.10" into [19, 10]
    const match = ruleNumber.match(/^(\d+)\.(\d+)$/)
    if (!match) return [0, 0]
    return [
      parseInt(match[1], 10),  // Chapter number
      parseInt(match[2], 10)   // Rule number
    ]
  }

  // Helper function to format rule numbers with zero-padding (19.01, 19.02)
  const formatRuleNumber = (ruleNumber) => {
    if (!ruleNumber) return ''
    const match = ruleNumber.match(/^(\d+)\.(\d+)$/)
    if (!match) return ruleNumber
    const chapter = match[1]
    const rule = match[2].padStart(2, '0')
    return `${chapter}.${rule}`
  }

  // Filter and sort rules
  const filteredAndSorted = useMemo(() => {
    let result = [...rules]

    // Apply search
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(r =>
        r.ruleNumber?.toLowerCase().includes(query) ||
        r.title?.toLowerCase().includes(query) ||
        r.chapterName?.toLowerCase().includes(query) ||
        r.content?.toLowerCase().includes(query)
      )
    }

    // Apply inline column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'rule':
          result = result.filter(r => r.ruleNumber?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'type':
          result = result.filter(r => r.ruleType === value)
          break
        case 'chapter':
          result = result.filter(r => r.chapter === parseInt(value))
          break
        case 'newTitle':
          result = result.filter(r => r.chapterName?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'subtitle':
          result = result.filter(r => r.title?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'description':
          result = result.filter(r => r.description?.toLowerCase().includes(value.toLowerCase()))
          break
        case 'trinity':
          // Filter by Trinity relationship (Bible, Teacher, or Lexicon)
          result = result.filter(r => {
            if (!r.relatedDocs) return false
            try {
              const docs = JSON.parse(r.relatedDocs)
              return docs && docs.some(doc => doc.type === value)
            } catch (e) {
              return false
            }
          })
          break
      }
    })

    // Sort (RULE #19.14: 3-state sorting - asc → desc → none)
    if (sortBy && sortDir) {
      result.sort((a, b) => {
        let aVal, bVal

        switch (sortBy) {
          case 'rule':
            // Numeric sorting for rule numbers (19.01, 19.02, ..., 19.36, 19.37, etc.)
            const [aChapter, aRule] = parseRuleNumber(a.ruleNumber)
            const [bChapter, bRule] = parseRuleNumber(b.ruleNumber)

            if (aChapter !== bChapter) {
              return sortDir === 'asc' ? aChapter - bChapter : bChapter - aChapter
            }
            if (aRule !== bRule) {
              return sortDir === 'asc' ? aRule - bRule : bRule - aRule
            }
            return 0
          case 'type':
            aVal = a.ruleType || ''
            bVal = b.ruleType || ''
            break
          case 'chapter':
            aVal = a.chapter
            bVal = b.chapter
            break
          case 'newTitle':
            aVal = a.chapterName || ''
            bVal = b.chapterName || ''
            break
          case 'subtitle':
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
    }

    return result
  }, [rules, search, columnFilters, sortBy, sortDir])

  // CASCADING FILTERS: Calculate available filter options based on current selections
  // Filter hierarchy: Chapter -> Type -> Trinity
  // Each filter only shows options available given the previous filters
  const availableFilterOptions = useMemo(() => {
    let currentData = rules

    // Step 1: Count chapters (no upstream filters)
    const chapterCounts = {}
    currentData.forEach(rule => {
      const chapter = rule.chapter
      chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1
    })

    // Step 2: Apply chapter filter for type counts
    if (columnFilters.chapter) {
      currentData = currentData.filter(r => r.chapter === parseInt(columnFilters.chapter))
    }

    const typeCounts = {}
    currentData.forEach(rule => {
      const type = rule.ruleType || 'UNKNOWN'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    // Step 3: Apply chapter AND type filters for trinity counts
    if (columnFilters.type) {
      currentData = currentData.filter(r => r.ruleType === columnFilters.type)
    }

    const trinityCounts = { Bible: 0, Teacher: 0, Lexicon: 0 }
    currentData.forEach(rule => {
      try {
        if (rule.relatedDocs) {
          const docs = JSON.parse(rule.relatedDocs)
          if (docs && Array.isArray(docs)) {
            docs.forEach(doc => {
              if (doc.type && trinityCounts[doc.type] !== undefined) {
                trinityCounts[doc.type]++
              }
            })
          }
        }
      } catch (e) {
        // Skip invalid JSON
      }
    })

    return {
      chapters: chapterCounts,
      types: typeCounts,
      trinity: trinityCounts
    }
  }, [rules, columnFilters.chapter, columnFilters.type]) // Re-run when upstream filters change

  // Initialize scrollbar on mount and content change
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollbar = () => {
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } = container

      // Find the actual table element to get its true width
      const table = container.querySelector('table')
      const actualTableWidth = table ? table.offsetWidth : scrollWidth

      // Update vertical scrollbar
      if (scrollHeight <= clientHeight) {
        setScrollbarThumbHeight(0)
      } else {
        const thumbHeight = (clientHeight / scrollHeight) * clientHeight
        setScrollbarThumbHeight(thumbHeight)
      }

      // Update horizontal scroll width - use actual table width
      setTableScrollWidth(actualTableWidth)
    }

    updateScrollbar()
    const resizeObserver = new ResizeObserver(updateScrollbar)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [filteredAndSorted, columnWidths])

  // Load table state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('bibleTableViewState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        // Merge saved widths with defaults to include new columns
        setColumnWidths({ ...DEFAULT_COLUMN_WIDTHS, ...state.columnWidths })

        // For column order, use DEFAULT order if saved order is missing new columns
        // This ensures new columns appear in their correct position
        const savedOrder = state.columnOrder || []
        const hasAllColumns = DEFAULT_COLUMN_ORDER.every(col => savedOrder.includes(col))

        if (hasAllColumns) {
          setColumnOrder(savedOrder)
        } else {
          // Use default order if structure has changed
          setColumnOrder(DEFAULT_COLUMN_ORDER)
        }

        // Merge saved visibility with defaults
        setVisibleColumns({ ...DEFAULT_VISIBLE_COLUMNS, ...state.visibleColumns })
        setSortBy(state.sortBy || 'rule')
        setSortDir(state.sortDir || 'asc')
      } catch (e) {
        console.error('Failed to load table state:', e)
      }
    }
  }, [])

  // Save table state to localStorage
  useEffect(() => {
    const state = {
      columnWidths,
      columnOrder,
      visibleColumns,
      sortBy,
      sortDir
    }
    localStorage.setItem('bibleTableViewState', JSON.stringify(state))
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

  // RULE #19.14: 3-state sorting (asc → desc → none)
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
      ? <ChevronUpIcon className="w-4 h-4 inline ml-1 text-indigo-600 dark:text-indigo-400" />
      : <ChevronDownIcon className="w-4 h-4 inline ml-1 text-indigo-600 dark:text-indigo-400" />
  }

  const uniqueChapters = useMemo(() => {
    const chapters = [...new Set(rules.map(r => r.chapter))].sort((a, b) => a - b)
    return chapters.map(num => ({ value: num, label: `Ch ${num}: ${CHAPTER_NAMES[num]}` }))
  }, [rules])

  // Row click handler - open modal instead of inline expansion
  const handleRowClick = (rule) => {
    setSelectedRule(rule)
  }

  // Close modal
  const closeModal = () => {
    setSelectedRule(null)
  }

  // Open edit modal
  const handleEditClick = (e, rule) => {
    e.stopPropagation() // Prevent row click
    setEditingRule(rule)
    setEditFormData({
      rule_number: rule.ruleNumber,
      title: rule.title,
      rule_type: rule.ruleType,
      description: rule.description,
      code_example: rule.codeExample || '',
      cross_references: rule.crossReferences || '',
      related_docs: rule.relatedDocs || ''
    })
  }

  // Close edit modal
  const closeEditModal = () => {
    setEditingRule(null)
    setEditFormData(null)
  }

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`http://localhost:3000/api/v1/trinity/${editingRule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trinity: {
            category: 'bible',
            section_number: editFormData.rule_number,
            title: editFormData.title,
            entry_type: editFormData.rule_type,
            description: editFormData.description,
            code_example: editFormData.code_example,
            related_rules: editFormData.cross_references
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update rule')
      }

      // Reload rules from API
      fetchRules()

      // Close modal
      closeEditModal()

      alert('Rule updated successfully!')
    } catch (error) {
      console.error('Error updating rule:', error)
      alert('Failed to update rule. Check console for details.')
    }
  }

  // Extract clean rule content for table display (remove redundant headers and references)
  const getCleanRuleContent = (description) => {
    if (!description) return ''

    // Remove emoji prefix line (✅ MUST, ❌ NEVER, etc.)
    let clean = description.replace(/^[✅❌🔄🔒⚙️📖]\s*(MUST|NEVER|ALWAYS|PROTECTED|CONFIG|rule)\s*\n*/i, '')

    // Remove heading markers but keep the content
    clean = clean.replace(/[✅❌🔄]\s*\*\*(MUST|NEVER|ALWAYS)[^:]*:\*\*/g, '$1:')

    // Stop at Implementation/Bug History references
    const refIndex = clean.search(/\*\*📖 Implementation:\*\*|\*\*📕 Bug History:\*\*|---/)
    if (refIndex > 0) {
      clean = clean.substring(0, refIndex)
    }

    // Trim and return full content for table display (no truncation)
    clean = clean.trim()
    return clean
  }

  // Extract cross-references from description
  const getCrossReferences = (description) => {
    if (!description) return ''

    const match = description.match(/(\*\*📖 Implementation:\*\*[\s\S]*?(?=\*\*📕|$))(\*\*📕 Bug History:\*\*[\s\S]*?(?=---|$))?/)
    if (match) {
      return (match[1] || '') + '\n' + (match[2] || '')
    }
    return ''
  }

  const renderCellContent = (rule, columnKey) => {
    switch (columnKey) {
      case 'select':
        return (
          <input
            type="checkbox"
            checked={selectedRows.has(rule.id)}
            onChange={(e) => {
              e.stopPropagation()
              handleSelectRow(rule.id)
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
        )

      case 'rule':
        return <div className="font-mono font-medium">{formatRuleNumber(rule.ruleNumber)}</div>

      case 'type':
        if (!rule.ruleType) return <span className="text-gray-400 text-xs">-</span>

        const typeColors = {
          'MUST': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          'NEVER': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          'ALWAYS': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          'PROTECTED': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          'CONFIG': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }

        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${typeColors[rule.ruleType] || 'bg-gray-100 text-gray-800'}`}>
            <span>{rule.typeEmoji}</span>
            <span>{rule.ruleType}</span>
          </span>
        )

      case 'chapter':
        const paddedChapter = String(rule.chapter).padStart(2, '0')
        return <div className="font-medium">{paddedChapter} {rule.chapterName}</div>

      case 'newTitle':
        return <div className="font-medium">{rule.chapterName}</div>

      case 'subtitle':
        return <div className="font-medium">{rule.title}</div>

      case 'content':
        const cleanContent = getCleanRuleContent(rule.description)
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-normal">
            {cleanContent || <span className="text-gray-400 dark:text-gray-500 italic">No description</span>}
          </div>
        )

      case 'trinity':
        // Parse current trinity selection from relatedDocs field
        let selectedTrinity = null
        let hasBible = false
        let hasTeacher = false
        let hasLexicon = false
        try {
          if (rule.relatedDocs) {
            const docs = JSON.parse(rule.relatedDocs)
            if (docs && Array.isArray(docs)) {
              docs.forEach(doc => {
                if (doc.type === 'Bible') hasBible = true
                if (doc.type === 'Teacher') hasTeacher = true
                if (doc.type === 'Lexicon') hasLexicon = true
              })

              // Check if all three are selected
              if (hasBible && hasTeacher && hasLexicon) {
                selectedTrinity = 'all'
              } else if (hasBible) {
                selectedTrinity = 'bible'
              } else if (hasTeacher) {
                selectedTrinity = 'teacher'
              } else if (hasLexicon) {
                selectedTrinity = 'lexicon'
              }
            }
          }
        } catch (e) {
          // Invalid JSON, use null
        }

        const handleTrinityChange = async (trinityType) => {
          // Build new relatedDocs array
          const newDocs = []
          if (trinityType === 'all') {
            // Select all three
            newDocs.push({ type: 'Bible', reference: `RULE #${rule.ruleNumber}` })
            newDocs.push({ type: 'Teacher', reference: `§${rule.ruleNumber}` })
            newDocs.push({ type: 'Lexicon', reference: `Ch${rule.chapter}` })
          } else if (trinityType === 'bible') {
            newDocs.push({ type: 'Bible', reference: `RULE #${rule.ruleNumber}` })
          } else if (trinityType === 'teacher') {
            newDocs.push({ type: 'Teacher', reference: `§${rule.ruleNumber}` })
          } else if (trinityType === 'lexicon') {
            newDocs.push({ type: 'Lexicon', reference: `Ch${rule.chapter}` })
          }

          // Save to API
          try {
            const response = await fetch(`http://localhost:3000/api/v1/trinity/${rule.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                trinity: {
                  related_rules: JSON.stringify(newDocs)
                }
              })
            })

            if (response.ok) {
              // Refresh data to show updated selection
              fetchRules()
            } else {
              alert('Failed to update Trinity relationship')
            }
          } catch (error) {
            console.error('Error updating Trinity:', error)
            alert('Error updating Trinity relationship')
          }
        }

        return (
          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
              <input
                type="radio"
                name={`trinity-${rule.id}`}
                checked={selectedTrinity === 'all'}
                onChange={() => handleTrinityChange('all')}
                className="h-3 w-3 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-indigo-700 dark:text-indigo-400 font-medium">✨ All</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
              <input
                type="radio"
                name={`trinity-${rule.id}`}
                checked={selectedTrinity === 'bible'}
                onChange={() => handleTrinityChange('bible')}
                className="h-3 w-3 border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-purple-700 dark:text-purple-400 font-medium">📖 Bible</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
              <input
                type="radio"
                name={`trinity-${rule.id}`}
                checked={selectedTrinity === 'teacher'}
                onChange={() => handleTrinityChange('teacher')}
                className="h-3 w-3 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-blue-700 dark:text-blue-400 font-medium">🔧 Teacher</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
              <input
                type="radio"
                name={`trinity-${rule.id}`}
                checked={selectedTrinity === 'lexicon'}
                onChange={() => handleTrinityChange('lexicon')}
                className="h-3 w-3 border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-orange-700 dark:text-orange-400 font-medium">📕 Lexicon</span>
            </label>
          </div>
        )

      case 'relatedDocs':
        if (!rule.relatedDocs) {
          return <span className="text-gray-400 dark:text-gray-500 text-xs italic">None</span>
        }
        // Parse JSON array of related docs
        try {
          const docs = JSON.parse(rule.relatedDocs)
          if (!docs || docs.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500 text-xs italic">None</span>
          }
          return (
            <div className="flex flex-wrap gap-1">
              {docs.map((doc, idx) => {
                const colors = {
                  'Bible': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                  'Teacher': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                  'Lexicon': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }
                return (
                  <span key={idx} className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${colors[doc.type] || 'bg-gray-100 text-gray-800'}`}>
                    {doc.type}: {doc.reference}
                  </span>
                )
              })}
            </div>
          )
        } catch (e) {
          return <span className="text-gray-400 dark:text-gray-500 text-xs italic">Invalid</span>
        }

      default:
        return null
    }
  }

  return (
    <>
      <style>{`
        .bible-table-scroll {
          scrollbar-width: thin !important;
          scrollbar-color: #9CA3AF #E5E7EB !important;
        }
        .dark .bible-table-scroll {
          scrollbar-color: #D1D5DB #374151 !important;
        }
        /* Hide ALL native scrollbars (we use custom sticky scrollbar for horizontal) */
        .bible-table-scroll::-webkit-scrollbar {
          display: none !important;
        }
        .bible-table-scroll {
          -ms-overflow-style: none !important;  /* IE and Edge */
          scrollbar-width: none !important;  /* Firefox */
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
          border-radius: 0 !important;
        }
        .sticky-horizontal-scroll::-webkit-scrollbar-thumb {
          background: #6B7280 !important;
          border-radius: 4px !important;
          border: 2px solid #E5E7EB !important;
        }
        .sticky-horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: #4B5563 !important;
        }
        .dark .sticky-horizontal-scroll::-webkit-scrollbar-track {
          background: #374151 !important;
        }
        .dark .sticky-horizontal-scroll::-webkit-scrollbar-thumb {
          background: #9CA3AF !important;
          border-color: #374151 !important;
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
              {selectedRows.size} {selectedRows.size === 1 ? 'rule' : 'rules'} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Get first selected rule for editing
                  const selectedRuleIds = Array.from(selectedRows)
                  if (selectedRuleIds.length === 1) {
                    const rule = rules.find(r => r.id === selectedRuleIds[0])
                    if (rule) handleEditClick({ stopPropagation: () => {} }, rule)
                  } else {
                    alert('Bulk edit multiple rules coming soon! For now, select only 1 rule to edit.')
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Selected
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
              placeholder="Search rules, chapters, content..."
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
                {COLUMNS.filter(col => col.key !== 'select' && col.key !== 'expand').map((column) => (
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

        {/* Active Filters Display */}
        {(Object.values(columnFilters).some(v => v) || search) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                Search: "{search}"
                <button
                  onClick={() => setSearch('')}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {columnFilters.chapter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-md">
                Chapter: {CHAPTER_NAMES[parseInt(columnFilters.chapter)]}
                <button
                  onClick={() => {
                    handleColumnFilterChange('chapter', '')
                    handleColumnFilterChange('type', '')
                    handleColumnFilterChange('trinity', '')
                  }}
                  className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {columnFilters.type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-md">
                Type: {columnFilters.type}
                <button
                  onClick={() => {
                    handleColumnFilterChange('type', '')
                    handleColumnFilterChange('trinity', '')
                  }}
                  className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {columnFilters.trinity && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs rounded-md">
                Trinity: {columnFilters.trinity}
                <button
                  onClick={() => handleColumnFilterChange('trinity', '')}
                  className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {columnFilters.subtitle && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-md">
                Title: "{columnFilters.subtitle}"
                <button
                  onClick={() => handleColumnFilterChange('subtitle', '')}
                  className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setSearch('')
                setColumnFilters({})
              }}
              className="ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-medium rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Search Results Count */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredAndSorted.length} of {rules.length} rules
        </div>
      </div>

      {/* Table with Custom Scrollbar */}
      <div className="flex-1 min-h-0 flex flex-col px-4">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="bible-table-scroll flex-1 overflow-y-scroll overflow-x-scroll relative bg-white dark:bg-gray-900"
        >
        <table
          className="border-collapse border-l border-r border-gray-200 dark:border-gray-700"
          style={{
            minWidth: `${Object.values(columnWidths).reduce((sum, w) => sum + w, 0)}px`,
            width: '100%'
          }}
        >
          <thead className="sticky top-0 z-30 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 shadow-sm border-b-2 border-gray-200 dark:border-gray-700">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                const column = COLUMNS.find(c => c.key === colKey)
                if (!column) return null

                return (
                  <th
                    key={colKey}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, colKey)}
                    onClick={() => column.sortable && handleSort(colKey)}
                    title={column.tooltip}
                    style={{
                      width: columnWidths[colKey],
                      minWidth: columnWidths[colKey],
                      maxWidth: columnWidths[colKey],
                      position: 'relative'
                    }}
                    className={`group ${colKey === 'select' ? 'px-1' : 'px-4'} py-2.5 ${colKey === 'select' ? 'text-center' : 'text-left'} text-xs font-medium text-gray-600 dark:text-gray-400 tracking-wider transition-all ${
                      column.sortable ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-gray-100' : ''
                    } ${draggedColumn === colKey ? 'bg-blue-50 dark:bg-indigo-900/20' : ''}`}
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
                          {/* Drag Handle for Column Reordering */}
                          {column.resizable && (
                            <div
                              draggable={true}
                              onDragStart={(e) => {
                                e.stopPropagation()
                                handleDragStart(e, colKey)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-move hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <Bars3Icon className="h-4 w-4 text-gray-400" />
                            </div>
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
                            onChange={(e) => {
                              const newValue = e.target.value
                              handleColumnFilterChange(colKey, newValue)

                              // CASCADE RESET: Clear downstream filters when an upstream filter changes
                              if (colKey === 'chapter') {
                                // Clear type and trinity when chapter changes
                                handleColumnFilterChange('type', '')
                                handleColumnFilterChange('trinity', '')
                              } else if (colKey === 'type') {
                                // Clear trinity when type changes
                                handleColumnFilterChange('trinity', '')
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">All</option>
                            {colKey === 'chapter' && uniqueChapters.map(ch => {
                              const count = availableFilterOptions.chapters[ch.value] || 0
                              return (
                                <option key={ch.value} value={ch.value}>
                                  {ch.label} ({count})
                                </option>
                              )
                            })}
                            {colKey === 'type' && ['MUST', 'NEVER', 'ALWAYS', 'PROTECTED', 'CONFIG'].map(type => {
                              const count = availableFilterOptions.types[type] || 0
                              const isDisabled = count === 0
                              return (
                                <option
                                  key={type}
                                  value={type}
                                  disabled={isDisabled}
                                  style={isDisabled ? { color: '#9CA3AF', fontStyle: 'italic' } : {}}
                                >
                                  {type} ({count})
                                </option>
                              )
                            })}
                            {colKey === 'trinity' && ['Bible', 'Teacher', 'Lexicon'].map(doc => {
                              const count = availableFilterOptions.trinity[doc] || 0
                              const isDisabled = count === 0
                              return (
                                <option
                                  key={doc}
                                  value={doc}
                                  disabled={isDisabled}
                                  style={isDisabled ? { color: '#9CA3AF', fontStyle: 'italic' } : {}}
                                >
                                  {doc === 'Bible' && '📖 '}
                                  {doc === 'Teacher' && '🔧 '}
                                  {doc === 'Lexicon' && '📕 '}
                                  {doc} ({count})
                                </option>
                              )
                            })}
                          </select>
                        )}
                      </>
                    )}

                    {/* Resize Handle - Wider clickable area on right edge */}
                    {column.resizable && (
                      <div
                        className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-400 dark:hover:bg-blue-400 transition-all z-20"
                        onMouseDown={(e) => handleResizeStart(e, colKey)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      />
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={columnOrder.filter(key => visibleColumns[key]).length} className="text-center py-12">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400">No rules found</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((rule, index) => (
                  <tr
                    key={rule.id}
                    onClick={() => handleRowClick(rule)}
                    className={`group border-b border-gray-100 dark:border-gray-800/50 hover:bg-blue-50/40 dark:hover:bg-gray-800/30 transition-all duration-150 cursor-pointer ${
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
                          } ${colKey === 'select' || colKey === 'type' || colKey === 'content' ? '' : 'truncate overflow-hidden whitespace-nowrap'}`}
                          title={colKey === 'title' ? rule.title : ''}
                        >
                          {renderCellContent(rule, colKey)}
                        </td>
                      )
                    })}
                  </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No rules found matching your filters
          </div>
        )}
        </div>

        {/* Sticky Horizontal Scrollbar - Always visible at bottom of table */}
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

      {/* Modal Popup for Rule Details */}
      {selectedRule && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                    {selectedRule.ruleNumber}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    selectedRule.ruleType === 'MUST' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    selectedRule.ruleType === 'NEVER' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    selectedRule.ruleType === 'ALWAYS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    selectedRule.ruleType === 'PROTECTED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    selectedRule.ruleType === 'CONFIG' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    <span>{selectedRule.typeEmoji}</span>
                    <span>{selectedRule.ruleType}</span>
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {selectedRule.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ch {selectedRule.chapter}: {selectedRule.chapterName}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Description - cleaned for better readability */}
              {selectedRule.description && (() => {
                const cleanDesc = getCleanRuleContent(selectedRule.description)
                const crossRefs = getCrossReferences(selectedRule.description)

                return (
                  <>
                    {cleanDesc && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {cleanDesc}
                      </div>
                    )}

                    {/* Cross References from description */}
                    {crossRefs && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">📚 Related Documentation</h4>
                        <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                          {crossRefs}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Code Example */}
              {selectedRule.codeExample && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Code Example</h4>
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{selectedRule.codeExample}</code>
                  </pre>
                </div>
              )}

              {/* Additional Cross References (from related_rules field) */}
              {selectedRule.crossReferences && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">🔗 Related Rules</h4>
                  <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap">
                    {selectedRule.crossReferences}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRule && editFormData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeEditModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Edit Rule {editingRule.ruleNumber}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingRule.title}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="px-6 py-6 space-y-6">
              {/* Rule Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rule Number
                </label>
                <input
                  type="text"
                  value={editFormData.rule_number}
                  onChange={(e) => setEditFormData({ ...editFormData, rule_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 19.10"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rule title"
                  required
                />
              </div>

              {/* Rule Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rule Type
                </label>
                <select
                  value={editFormData.rule_type}
                  onChange={(e) => setEditFormData({ ...editFormData, rule_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="MUST">MUST</option>
                  <option value="NEVER">NEVER</option>
                  <option value="ALWAYS">ALWAYS</option>
                  <option value="PROTECTED">PROTECTED</option>
                  <option value="CONFIG">CONFIG</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Rule description"
                  required
                />
              </div>

              {/* Code Example (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code Example (optional)
                </label>
                <textarea
                  value={editFormData.code_example}
                  onChange={(e) => setEditFormData({ ...editFormData, code_example: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Code example..."
                />
              </div>

              {/* Cross References (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cross References (optional)
                </label>
                <textarea
                  value={editFormData.cross_references}
                  onChange={(e) => setEditFormData({ ...editFormData, cross_references: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Related rules, Teacher sections, Lexicon entries..."
                />
              </div>

              {/* Related Docs (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Related Documentation (optional)
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Format: JSON array like [{"{"}"type":"Teacher","reference":"§19.1"{"}"},{"{"}"type":"Lexicon","reference":"Ch19 Bug #3"{"}"}]
                </div>
                <textarea
                  value={editFormData.related_docs}
                  onChange={(e) => setEditFormData({ ...editFormData, related_docs: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder='[{"type":"Teacher","reference":"§19.1"},{"type":"Lexicon","reference":"Ch19"}]'
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
