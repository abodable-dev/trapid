import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import CurrencyCell from '../components/table/CurrencyCell'
import AutocompleteLookupCell from '../components/table/AutocompleteLookupCell'
import ColumnHeader from '../components/table/ColumnHeader'
import AddColumnModal from '../components/table/AddColumnModal'
import { formatPercentage, formatNumber } from '../utils/formatters'
import {
  ChevronLeftIcon,
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HashtagIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  LinkIcon,
  DocumentIcon,
  ChevronUpIcon,
  TableCellsIcon,
  CalculatorIcon,
  EyeSlashIcon,
  Bars3Icon,
  EyeIcon,
} from '@heroicons/react/24/outline'

export default function TablePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [table, setTable] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingCell, setEditingCell] = useState(null) // { recordId, columnName }
  const [editValue, setEditValue] = useState('')
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
  const [showColumnInfo, setShowColumnInfo] = useState(false)

  // Unified table pattern state
  const [draggedColumn, setDraggedColumn] = useState(null)
  const [sortBy, setSortBy] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [columnFilters, setColumnFilters] = useState({})
  const [showColumnSettings, setShowColumnSettings] = useState(false)

  // Column order with localStorage persistence (dynamic per table)
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem(`table_${id}_columnOrder`)
    return saved ? JSON.parse(saved) : []
  })

  // Column widths with localStorage persistence (dynamic per table)
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem(`table_${id}_columnWidths`)
    return saved ? JSON.parse(saved) : {}
  })

  // Column visibility state (dynamic per table)
  const [columnVisibility, setColumnVisibility] = useState({})

  // Column resize state
  const [resizingColumn, setResizingColumn] = useState(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  // Initialize column order and widths when table data loads
  useEffect(() => {
    if (table && table.columns) {
      // Initialize column order from localStorage or default
      const savedOrder = localStorage.getItem(`table_${id}_columnOrder`)
      if (!savedOrder) {
        const defaultOrder = table.columns
          .filter(col => !isSystemOrHiddenColumn(col.column_name))
          .map(col => col.column_name)
        setColumnOrder(defaultOrder)
      }

      // Initialize column widths from localStorage or default
      const savedWidths = localStorage.getItem(`table_${id}_columnWidths`)
      if (!savedWidths) {
        const defaultWidths = {}
        table.columns.forEach(col => {
          defaultWidths[col.column_name] = 200
        })
        setColumnWidths(defaultWidths)
      }

      // Initialize column visibility
      const visibility = {}
      table.columns.forEach(col => {
        visibility[col.column_name] = !isSystemOrHiddenColumn(col.column_name)
      })
      setColumnVisibility(visibility)
    }
  }, [table, id])

  // Persist column order to localStorage
  useEffect(() => {
    if (columnOrder.length > 0) {
      localStorage.setItem(`table_${id}_columnOrder`, JSON.stringify(columnOrder))
    }
  }, [columnOrder, id])

  // Persist column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      localStorage.setItem(`table_${id}_columnWidths`, JSON.stringify(columnWidths))
    }
  }, [columnWidths, id])

  // Add mouse move and mouse up listeners for column resizing
  useEffect(() => {
    if (resizingColumn) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResizeMove)
        window.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth])

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      await loadTable()
      if (!cancelled) {
        await loadRecords()
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [id])

  const loadTable = async () => {
    try {
      const response = await api.get(`/api/v1/tables/${id}`)
      setTable(response.table)
    } catch (err) {
      setError('Failed to load table')
      console.error(err)
    }
  }

  const loadRecords = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `/api/v1/tables/${id}/records?per_page=1000`
      )
      setRecords(response.records || [])
    } catch (err) {
      setError('Failed to load records')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRow = async () => {
    if (isAddingRow) return

    // Make sure we have a table with columns
    if (!table || !table.columns) {
      console.error('Table or columns not loaded')
      alert('Please wait for the table to finish loading')
      return
    }

    // Check if table has any columns
    if (table.columns.length === 0) {
      alert('This table has no columns yet. Please add columns before adding records.')
      return
    }

    try {
      setIsAddingRow(true)

      // Debug logging
      console.log('Table object:', table)
      console.log('Table columns:', table.columns)
      console.log('Number of columns:', table.columns?.length)

      // Create an empty record with all columns
      const newRecordData = {}
      table.columns.forEach(col => {
        console.log('Processing column:', col)
        console.log('Column name:', col.column_name)
        newRecordData[col.column_name] = ''
      })

      console.log('Final newRecordData:', newRecordData)
      console.log('newRecordData keys:', Object.keys(newRecordData))

      const response = await api.post(`/api/v1/tables/${id}/records`, {
        record: newRecordData
      })

      if (response.success) {
        await loadRecords()
      }
    } catch (err) {
      console.error('Failed to add record:', err)
      alert('Failed to add record')
    } finally {
      setIsAddingRow(false)
    }
  }

  const handleCellClick = (recordId, columnName, currentValue) => {
    setEditingCell({ recordId, columnName })
    setEditValue(currentValue || '')
  }

  const handleCellBlur = async () => {
    if (!editingCell) return

    const { recordId, columnName } = editingCell
    const record = records.find(r => r.id === recordId)

    // Only update if value changed
    if (record && record[columnName] !== editValue) {
      try {
        const updateData = { [columnName]: editValue }
        await api.put(`/api/v1/tables/${id}/records/${recordId}`, {
          record: updateData
        })
        await loadRecords()
      } catch (err) {
        console.error('Failed to update record:', err)
        alert('Failed to update record')
      }
    }

    setEditingCell(null)
    setEditValue('')
  }

  const handleCellUpdate = async (recordId, columnName, newValue) => {
    const record = records.find(r => r.id === recordId)

    // Get the current value (handle both object and primitive values for lookups)
    const currentValue = typeof record[columnName] === 'object'
      ? record[columnName]?.id
      : record[columnName]

    // Only update if value changed
    if (currentValue !== newValue) {
      try {
        const updateData = { [columnName]: newValue }
        await api.put(`/api/v1/tables/${id}/records/${recordId}`, {
          record: updateData
        })
        await loadRecords()
      } catch (err) {
        console.error('Failed to update record:', err)
        alert('Failed to update record')
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditValue('')
    }
  }

  const handleColumnTypeChange = async (columnId, newType, lookupConfig = null) => {
    try {
      const columnData = { column_type: newType }

      // If lookup configuration is provided, include it
      if (lookupConfig) {
        columnData.lookup_table_id = lookupConfig.lookup_table_id
        columnData.lookup_display_column = lookupConfig.lookup_display_column
      }

      await api.put(`/api/v1/tables/${id}/columns/${columnId}`, {
        column: columnData
      })
      // Reload table data to get updated column info
      await loadTable()
      await loadRecords()
    } catch (err) {
      console.error('Failed to update column type:', err)
      alert('Failed to update column type')
    }
  }

  const handleAddColumn = async (columnData) => {
    try {
      const columnPayload = {
        name: columnData.name,
        column_name: columnData.name.toLowerCase().replace(/\s+/g, '_'),
        column_type: columnData.column_type,
        position: table.columns.length
      }

      // Add settings if provided (e.g., formula expression)
      if (columnData.settings) {
        columnPayload.settings = columnData.settings
      }

      const response = await api.post(`/api/v1/tables/${id}/columns`, {
        column: columnPayload
      })

      if (response.success) {
        setIsAddColumnModalOpen(false)
        await loadTable()
        await loadRecords()
      }
    } catch (err) {
      console.error('Failed to add column:', err)
      alert('Failed to add column')
    }
  }

  // Unified table pattern handlers
  const handleDragStart = (e, columnKey) => {
    setDraggedColumn(columnKey)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
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

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        // Third state: clear sort
        setSortBy(null)
        setSortDirection('asc')
      }
    } else {
      setSortBy(columnKey)
      setSortDirection('asc')
    }
  }

  const handleResizeStart = (e, columnKey) => {
    e.preventDefault()
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

  const handleColumnFilter = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  const toggleColumnVisibility = (columnKey) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  const resetColumnSettings = () => {
    if (table && table.columns) {
      const defaultOrder = table.columns
        .filter(col => !isSystemOrHiddenColumn(col.column_name))
        .map(col => col.column_name)
      setColumnOrder(defaultOrder)

      const defaultWidths = {}
      table.columns.forEach(col => {
        defaultWidths[col.column_name] = 200
      })
      setColumnWidths(defaultWidths)

      const defaultVisibility = {}
      table.columns.forEach(col => {
        defaultVisibility[col.column_name] = !isSystemOrHiddenColumn(col.column_name)
      })
      setColumnVisibility(defaultVisibility)

      localStorage.removeItem(`table_${id}_columnOrder`)
      localStorage.removeItem(`table_${id}_columnWidths`)
    }
  }

  // Get sorted and filtered columns based on order and visibility
  const getVisibleColumns = () => {
    if (!table || !table.columns) return []

    return columnOrder
      .map(colName => table.columns.find(col => col.column_name === colName))
      .filter(col => col && columnVisibility[col.column_name])
  }

  // Apply filters to records
  const applyFilters = (recordsToFilter) => {
    if (Object.keys(columnFilters).length === 0) return recordsToFilter

    return recordsToFilter.filter(record => {
      return Object.entries(columnFilters).every(([key, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true

        const value = record[key]
        if (value === null || value === undefined) return false

        const strValue = typeof value === 'object' ? value.display : String(value)
        return strValue.toLowerCase().includes(filterValue.toLowerCase())
      })
    })
  }

  // Apply sorting to records
  const applySorting = (recordsToSort) => {
    if (!sortBy) return recordsToSort

    return [...recordsToSort].sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Handle objects (like lookup values)
      const aCompare = typeof aValue === 'object' ? aValue.display : aValue
      const bCompare = typeof bValue === 'object' ? bValue.display : bValue

      if (aCompare < bCompare) return sortDirection === 'asc' ? -1 : 1
      if (aCompare > bCompare) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  // Get filtered and sorted records
  const getProcessedRecords = () => {
    let processed = [...records]
    processed = applyFilters(processed)
    processed = applySorting(processed)
    return processed
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">{error}</div>
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading table...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header - Google Sheets style */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-normal text-gray-900 dark:text-white">
                {table.name}
              </h1>
              {table.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {table.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              onClick={() => setShowColumnInfo(!showColumnInfo)}
              className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <TableCellsIcon className="h-4 w-4" />
              Info
              {showColumnInfo ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={() => setShowColumnSettings(true)}
              className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <EyeIcon className="h-4 w-4" />
              Columns
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <FunnelIcon className="h-4 w-4" />
              Filter
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
            <Link
              to={`/designer/tables/${id}`}
              className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleAddRow}
              disabled={isAddingRow || !table || !table.columns || table.columns.length === 0}
              className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              {isAddingRow ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* Columns Information Panel */}
      {showColumnInfo && (
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 py-4">
          <div className="max-w-7xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Table Columns ({table.columns.length})
              </h3>

              {/* Summary Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {table.columns.filter(c => c.lookup_table_id).length} lookups
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <EyeSlashIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {table.columns.filter(c => isSystemOrHiddenColumn(c.column_name)).length} hidden
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalculatorIcon className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {table.columns.filter(c => c.column_type === 'computed').length} computed
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {table.columns.map((column) => {
                const isSystemColumn = isSystemOrHiddenColumn(column.column_name)
                return (
                  <div
                    key={column.id}
                    className={`rounded-lg border p-3 hover:shadow-sm transition-shadow ${
                      isSystemColumn
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getColumnIcon(column.column_type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {column.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {column.column_name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {formatColumnType(column.column_type)}
                    </span>
                    {column.column_type === 'computed' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        <CalculatorIcon className="h-3 w-3 mr-1" />
                        Formula
                      </span>
                    )}
                    {column.column_type === 'lookup' && column.lookup_table_id && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Lookup
                      </span>
                    )}
                    {column.required && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Required
                      </span>
                    )}
                    {column.is_unique && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Unique
                      </span>
                    )}
                    {column.is_title && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Title
                      </span>
                    )}
                    {isSystemColumn && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        <EyeSlashIcon className="h-3 w-3 mr-1" />
                        Hidden
                      </span>
                    )}
                  </div>
                  {column.description && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {column.description}
                    </p>
                  )}

                  {/* Relationship information */}
                  {(column.lookup_table_name || column.referenced_by) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      {column.lookup_table_name && (
                        <div className="flex items-start gap-2">
                          <LinkIcon className="h-3 w-3 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Looks up to: </span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {column.lookup_table_name}
                            </span>
                            {column.lookup_display_column && (
                              <span className="text-gray-500 dark:text-gray-500">
                                {' '}({column.lookup_display_column})
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {column.referenced_by && column.referenced_by.length > 0 && (
                        <div className="flex items-start gap-2">
                          <LinkIcon className="h-3 w-3 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Referenced by: </span>
                            <div className="mt-1 space-y-1">
                              {column.referenced_by.map((ref, idx) => (
                                <div key={idx} className="text-green-600 dark:text-green-400 font-medium">
                                  {ref.table_name} ({ref.column_name})
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Table Container - Google Sheets grid with custom scrollbar */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
        <div className="w-full h-full overflow-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {table && table.columns && table.columns.length === 0 ? (
                <>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">No columns yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add columns to this table before adding records</p>
                  <div className="mt-4">
                    <Link
                      to={`/admin/system?tab=tables`}
                      className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                      Manage Columns
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">No records yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first record</p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleAddRow}
                      disabled={isAddingRow || !table || !table.columns || table.columns.length === 0}
                      className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {isAddingRow ? 'Adding...' : 'Add Record'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-800/50 border-r border-b border-gray-200 dark:border-gray-700 px-2 py-1 text-left w-8">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">#</span>
                  </th>
                  {getVisibleColumns().map((column, index) => {
                    const isSystemColumn = isSystemOrHiddenColumn(column.column_name)
                    const width = columnWidths[column.column_name] || 200
                    const isSorted = sortBy === column.column_name
                    const isSortable = !['computed'].includes(column.column_type)

                    return (
                      <th
                        key={column.id}
                        style={{ width: `${width}px`, minWidth: `${width}px`, position: 'relative' }}
                        className={`border-r border-b border-gray-200 dark:border-gray-700 px-2 py-2 text-left ${
                          index === 0 ? 'sticky left-8 z-20 bg-gray-50 dark:bg-gray-800/50' : ''
                        } ${isSystemColumn ? 'bg-orange-50 dark:bg-orange-900/20' : ''} ${
                          draggedColumn === column.column_name ? 'bg-indigo-100 dark:bg-indigo-900/20' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, column.column_name)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.column_name)}
                      >
                        <div
                          className={`flex items-center gap-2 ${isSortable ? 'cursor-pointer' : 'cursor-move'}`}
                          onClick={() => isSortable && handleSort(column.column_name)}
                        >
                          {/* Drag handle */}
                          <Bars3Icon className="h-4 w-4 text-gray-400 cursor-move" />

                          {/* Column label */}
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {column.name}
                          </span>

                          {/* Sort indicators */}
                          {isSortable && isSorted && (
                            sortDirection === 'asc' ?
                              <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
                              <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>

                        {/* Inline filter */}
                        {!isSystemColumn && (
                          <input
                            type="text"
                            placeholder="Search..."
                            value={columnFilters[column.column_name] || ''}
                            onChange={(e) => handleColumnFilter(column.column_name, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        )}

                        {/* Resize handle */}
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
                          onMouseDown={(e) => handleResizeStart(e, column.column_name)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                    )
                  })}
                  <th className="border-r border-b border-gray-200 dark:border-gray-700 px-1 py-1 text-center w-8 bg-gray-50 dark:bg-gray-800/50">
                    <button
                      type="button"
                      onClick={() => setIsAddColumnModalOpen(true)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5 rounded transition-colors"
                      title="Add column"
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {getProcessedRecords().map((record, idx) => (
                  <tr
                    key={record.id}
                    className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                  >
                    <td className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 border-r border-b border-gray-200 dark:border-gray-700 px-2 py-1 w-8">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{idx + 1}</span>
                    </td>
                    {getVisibleColumns().map((column, colIndex) => {
                      const isEditing = editingCell?.recordId === record.id && editingCell?.columnName === column.column_name
                      const isCurrency = column.column_type === 'currency'
                      const isSystemColumn = isSystemOrHiddenColumn(column.column_name)
                      const width = columnWidths[column.column_name] || 200

                      return (
                        <td
                          key={column.id}
                          style={{ width: `${width}px`, minWidth: `${width}px` }}
                          className={`border-r border-b border-gray-200 dark:border-gray-700 px-0 py-0 text-xs group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 ${
                            colIndex === 0
                              ? 'sticky left-8 z-10 bg-white dark:bg-gray-900 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10'
                              : isSystemColumn
                                ? 'bg-orange-50 dark:bg-orange-900/20 group-hover:bg-orange-100/50 dark:group-hover:bg-orange-900/30'
                                : 'bg-white dark:bg-gray-900'
                          }`}
                          onClick={() => !isEditing && !isCurrency && handleCellClick(record.id, column.column_name, record[column.column_name])}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-full px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-blue-500 focus:outline-none text-xs"
                            />
                          ) : column.column_type === 'lookup' ? (
                            <div className="px-2 py-1 min-h-[24px] flex items-center">
                              <AutocompleteLookupCell
                                column={column}
                                value={record[column.column_name]}
                                onChange={(newValue) => handleCellUpdate(record.id, column.column_name, newValue)}
                                isEditing={isEditing}
                              />
                            </div>
                          ) : isCurrency ? (
                            <div className="px-2 py-1 min-h-[24px] flex items-center">
                              <CurrencyCell value={record[column.column_name]} />
                            </div>
                          ) : (
                            <div className="px-2 py-1 cursor-text hover:bg-blue-50/30 dark:hover:bg-blue-900/5 min-h-[24px] flex items-center">
                              {formatValue(record[column.column_name], column.column_type)}
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="border-r border-b border-gray-200 dark:border-gray-700 px-2 py-2 text-center w-12 bg-white dark:bg-gray-900 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">
                      {/* Empty cell for plus column */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
        </div>
      </div>

      {/* Add Column Modal */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onAdd={handleAddColumn}
        tableId={id}
      />

      {/* Column Settings Modal */}
      {showColumnSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setShowColumnSettings(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 m-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Column Settings
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Toggle column visibility and drag to reorder
            </p>

            {/* Column list */}
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {columnOrder.map((columnName) => {
                const column = table?.columns.find(col => col.column_name === columnName)
                if (!column) return null

                return (
                  <label
                    key={columnName}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={columnVisibility[columnName] || false}
                      onChange={() => toggleColumnVisibility(columnName)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Bars3Icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white flex-1">
                      {column.name}
                    </span>
                    {isSystemOrHiddenColumn(columnName) && (
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        (Hidden)
                      </span>
                    )}
                  </label>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetColumnSettings}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Reset to defaults
              </button>
              <button
                onClick={() => setShowColumnSettings(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getColumnIcon(columnType) {
  const iconProps = { className: 'h-4 w-4 text-gray-500 dark:text-gray-400' }

  const icons = {
    'single_line_text': <DocumentTextIcon {...iconProps} />,
    'multiple_lines_text': <DocumentIcon {...iconProps} />,
    'number': <HashtagIcon {...iconProps} />,
    'whole_number': <HashtagIcon {...iconProps} />,
    'email': <EnvelopeIcon {...iconProps} />,
    'phone': <PhoneIcon {...iconProps} />,
    'date': <CalendarIcon {...iconProps} />,
    'date_and_time': <ClockIcon {...iconProps} />,
    'boolean': <CheckCircleIcon {...iconProps} />,
    'currency': <CurrencyDollarIcon {...iconProps} />,
    'percentage': <HashtagIcon {...iconProps} />,
    'choice': <ChevronDownIcon {...iconProps} />,
    'url': <LinkIcon {...iconProps} />,
    'lookup': <LinkIcon {...iconProps} />,
    'multiple_lookups': <LinkIcon {...iconProps} />,
    'computed': <CalculatorIcon {...iconProps} />,
  }
  return icons[columnType] || <DocumentTextIcon {...iconProps} />
}

function formatColumnType(columnType) {
  const typeNames = {
    'single_line_text': 'Text',
    'multiple_lines_text': 'Long Text',
    'number': 'Number',
    'whole_number': 'Whole Number',
    'email': 'Email',
    'phone': 'Phone',
    'date': 'Date',
    'date_and_time': 'Date & Time',
    'boolean': 'Yes/No',
    'currency': 'Currency',
    'percentage': 'Percentage',
    'choice': 'Choice',
    'url': 'URL',
    'lookup': 'Lookup',
    'multiple_lookups': 'Multiple Lookups',
    'computed': 'Computed',
    'user': 'User',
  }
  return typeNames[columnType] || columnType
}

// Check if a column is a system column that's typically hidden from end users
function isSystemOrHiddenColumn(columnName) {
  const systemColumns = [
    'id',
    'sys_type_id',
    'deleted',
    'drive_id',
    'folder_id',
    'parent_id',
    'parent$type',
    'range$type',
    'colour_spec$type',
    'tedmodel$type',
    'pricebook$type',
    'created_at',
    'updated_at',
  ]

  // Check exact matches
  if (systemColumns.includes(columnName)) {
    return true
  }

  // Check for columns ending with $type (relationship type indicators)
  if (columnName.endsWith('$type')) {
    return true
  }

  // Check for columns ending with _id (foreign keys, except user-facing ones)
  if (columnName.endsWith('_id') && !['product_id', 'contact_id', 'job_id'].includes(columnName)) {
    return true
  }

  return false
}

function formatValue(value, columnType) {
  if (value === null || value === undefined) {
    return '-'
  }

  switch (columnType) {
    case 'lookup':
      // Lookup values are objects with { id, display } from backend
      return typeof value === 'object' ? value.display : value
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'currency':
      // This case is now handled by CurrencyCell component
      return `$${Number(value).toFixed(2)}`
    case 'percentage':
      return formatPercentage(value, 0)
    case 'number':
      return formatNumber(value, 0)
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'date_and_time':
      return new Date(value).toLocaleString()
    default:
      return String(value)
  }
}
