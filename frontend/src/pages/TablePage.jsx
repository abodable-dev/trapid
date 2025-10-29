import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

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
        <div className="text-red-600">{error}</div>
        <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Back to Tables
        </Link>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
          ← Back to Tables
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{table.name}</h1>
        {table.description && (
          <p className="text-gray-600 mt-2">{table.description}</p>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading records...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-600">No records found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {table.columns.map((column) => (
                      <td
                        key={column.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {formatValue(record[column.column_name], column.column_type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
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
