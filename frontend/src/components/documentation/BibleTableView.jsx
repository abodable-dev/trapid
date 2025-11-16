import React, { useState, useMemo, useEffect } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  EyeIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const CHAPTER_NAMES = {
  0: 'Overview & System-Wide Rules',
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

// Define columns (RULE #19.1 compliant)
const COLUMNS = [
  { key: 'select', label: '', resizable: false, sortable: false, filterable: false, width: 50 },
  { key: 'expand', label: '', resizable: false, sortable: false, filterable: false, width: 50 },
  { key: 'rule', label: 'Rule #', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 100 },
  { key: 'chapter', label: 'Chapter', resizable: true, sortable: true, filterable: true, filterType: 'dropdown', width: 200 },
  { key: 'title', label: 'Title', resizable: true, sortable: true, filterable: true, filterType: 'text', width: 400 }
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

export default function BibleTableView({ content }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rule')
  const [sortDir, setSortDir] = useState('asc')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [selectedRows, setSelectedRows] = useState(new Set())
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

  // Parse rules from markdown content
  const rules = useMemo(() => parseRulesFromMarkdown(content), [content])

  // Load table state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('bibleTableViewState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        setColumnWidths(state.columnWidths || DEFAULT_COLUMN_WIDTHS)
        setColumnOrder(state.columnOrder || DEFAULT_COLUMN_ORDER)
        setVisibleColumns(state.visibleColumns || DEFAULT_VISIBLE_COLUMNS)
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
        case 'chapter':
          result = result.filter(r => r.chapter === parseInt(value))
          break
        case 'title':
          result = result.filter(r => r.title?.toLowerCase().includes(value.toLowerCase()))
          break
      }
    })

    // Sort
    result.sort((a, b) => {
      let aVal, bVal

      switch (sortBy) {
        case 'rule':
          aVal = a.ruleNumber || ''
          bVal = b.ruleNumber || ''
          break
        case 'chapter':
          aVal = a.chapter
          bVal = b.chapter
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
  }, [rules, search, columnFilters, sortBy, sortDir])

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
    const chapters = [...new Set(rules.map(r => r.chapter))].sort((a, b) => a - b)
    return chapters.map(num => ({ value: num, label: `Ch ${num}: ${CHAPTER_NAMES[num]}` }))
  }, [rules])

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

      case 'expand':
        return (
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {expandedRows.has(rule.id) ? '▼' : '▶'}
          </span>
        )

      case 'rule':
        return <div className="font-mono font-medium">#{rule.ruleNumber}</div>

      case 'chapter':
        return (
          <>
            <div className="font-medium">Ch {rule.chapter}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {rule.chapterName.length > 25
                ? rule.chapterName.substring(0, 25) + '...'
                : rule.chapterName}
            </div>
          </>
        )

      case 'title':
        return <div className="font-medium">{rule.title}</div>

      default:
        return null
    }
  }

  return (
    <>
      <style>{`
        .bible-table-scroll {
          scrollbar-width: auto !important;
          scrollbar-color: #9CA3AF #E5E7EB !important;
        }
        .dark .bible-table-scroll {
          scrollbar-color: #9CA3AF #4B5563 !important;
        }
        .bible-table-scroll::-webkit-scrollbar {
          width: 14px !important;
          height: 14px !important;
        }
        .bible-table-scroll::-webkit-scrollbar-track {
          background: #E5E7EB !important;
        }
        .bible-table-scroll::-webkit-scrollbar-thumb {
          background: #9CA3AF !important;
          border-radius: 6px !important;
          border: 2px solid #E5E7EB !important;
        }
        .bible-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #6B7280 !important;
        }
        .dark .bible-table-scroll::-webkit-scrollbar-track {
          background: #4B5563 !important;
        }
        .dark .bible-table-scroll::-webkit-scrollbar-thumb {
          background: #9CA3AF !important;
          border-color: #4B5563 !important;
        }
        .dark .bible-table-scroll::-webkit-scrollbar-thumb:hover {
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

        {/* Search Results Count */}
        {search && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Found {filteredAndSorted.length} of {rules.length} rules
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredAndSorted.length} of {rules.length} rules
        </div>
      </div>

      {/* Table */}
      <div className="bible-table-scroll flex-1 overflow-y-auto overflow-x-auto relative bg-white dark:bg-gray-900 min-h-0" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#9CA3AF #4B5563'
      }}>
        <table className="w-full border-collapse">
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
            {filteredAndSorted.map(rule => (
              <React.Fragment key={rule.id}>
                <tr
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                  onClick={() => toggleRow(rule.id)}
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
                        } ${colKey === 'title' || colKey === 'chapter' ? '' : 'whitespace-nowrap'}`}
                      >
                        {renderCellContent(rule, colKey)}
                      </td>
                    )
                  })}
                </tr>
                {expandedRows.has(rule.id) && (
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={columnOrder.filter(key => visibleColumns[key]).length} className="px-4 py-4">
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-mono">Line {rule.lineNumber}</span>
                          <span>•</span>
                          <span>Chapter {rule.chapter}: {rule.chapterName}</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto">
                          {rule.content}
                        </pre>
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
            No rules found matching your filters
          </div>
        )}
      </div>
      </div>
    </>
  )
}
