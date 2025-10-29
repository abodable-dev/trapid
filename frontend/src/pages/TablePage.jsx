import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import {
  ChevronLeftIcon,
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ChevronLeftIcon as ChevronPaginationLeft,
  ChevronRightIcon,
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
} from '@heroicons/react/24/outline'

export default function TablePage() {
  const { id } = useParams()
  const [table, setTable] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadTable()
    loadRecords()
  }, [id, currentPage])

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
        `/api/v1/tables/${id}/records?page=${currentPage}&per_page=50`
      )
      setRecords(response.records || [])
      setTotalPages(response.pagination?.total_pages || 1)
    } catch (err) {
      setError('Failed to load records')
      console.error(err)
    } finally {
      setLoading(false)
    }
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header - Google Sheets style */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Link>
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
              className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded ml-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Table Container - Google Sheets grid */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
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
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">No records yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first record</p>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Record
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-800/50 border-r border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-left">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">#</span>
                  </th>
                  {table.columns.map((column) => (
                    <th
                      key={column.id}
                      className="border-r border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-left min-w-[150px]"
                    >
                      <div className="flex items-center gap-x-2">
                        {getColumnIcon(column.column_type)}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {column.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {records.map((record, idx) => (
                  <tr
                    key={record.id}
                    className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                  >
                    <td className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/20 border-r border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{idx + 1}</span>
                    </td>
                    {table.columns.map((column) => (
                      <td
                        key={column.id}
                        className="border-r border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10"
                      >
                        {formatValue(record[column.column_name], column.column_type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer with pagination - Google Sheets style */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronPaginationLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-4 w-4" />
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
    'multi_line_text': <DocumentIcon {...iconProps} />,
    'number': <HashtagIcon {...iconProps} />,
    'email': <EnvelopeIcon {...iconProps} />,
    'phone': <PhoneIcon {...iconProps} />,
    'date': <CalendarIcon {...iconProps} />,
    'date_and_time': <ClockIcon {...iconProps} />,
    'boolean': <CheckCircleIcon {...iconProps} />,
    'currency': <CurrencyDollarIcon {...iconProps} />,
    'percentage': <HashtagIcon {...iconProps} />,
    'choice': <ChevronDownIcon {...iconProps} />,
    'url': <LinkIcon {...iconProps} />,
  }
  return icons[columnType] || <DocumentTextIcon {...iconProps} />
}

function formatValue(value, columnType) {
  if (value === null || value === undefined) {
    return '-'
  }

  switch (columnType) {
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'currency':
      return `$${Number(value).toFixed(2)}`
    case 'percentage':
      return `${value}%`
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'date_and_time':
      return new Date(value).toLocaleString()
    default:
      return String(value)
  }
}
