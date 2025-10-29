import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function Dashboard() {
  const [tables, setTables] = useState([])
  const [filteredTables, setFilteredTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    loadTables()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = tables.filter(table =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (table.description && table.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredTables(filtered)
    } else {
      setFilteredTables(tables)
    }
  }, [searchQuery, tables])

  const loadTables = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/tables')
      // Only show tables that are marked as live
      const liveTables = (response.tables || []).filter(table => table.is_live)
      setTables(liveTables)
    } catch (err) {
      setError('Failed to load tables')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Loading tables...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Tables</h1>
        <Link
          to="/import"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Import New Table
        </Link>
      </div>

      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTables.length} result{filteredTables.length !== 1 ? 's' : ''} for "{searchQuery}"
          <Link to="/dashboard" className="ml-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            Clear search
          </Link>
        </div>
      )}

      {tables.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tables yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by importing a spreadsheet to create your first table.
          </p>
          <Link
            to="/import"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Import Your First Table
          </Link>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tables found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tables match your search query "{searchQuery}".
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Clear search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <Link
              key={table.id}
              to={`/tables/${table.id}`}
              className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {table.name}
                  </h3>
                  {table.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{table.description}</p>
                  )}
                </div>
                {table.icon && (
                  <span className="text-2xl">{table.icon}</span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Database: {table.database_table_name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
