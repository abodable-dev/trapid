import { useEffect, useState, useRef } from 'react'
import { Variable, Search } from 'lucide-react'
import { api } from '../api'

export default function UnrealVariablesPage() {
  const [variables, setVariables] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total_count: 0
  })

  const searchTimeoutRef = useRef(null)

  // Load variables
  const loadVariables = async () => {
    try {
      setLoading(true)
      const params = { page: 1, limit: 100 }
      if (searchQuery) params.search = searchQuery

      const response = await api.get('/api/v1/unreal_variables', { params })
      setVariables(response.variables || [])
      setPagination(response.pagination || { page: 1, limit: 100, total_count: 0 })
    } catch (error) {
      console.error('Failed to load Unreal Variables:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadVariables()
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Variable className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Unreal Variables
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {pagination.total_count} {pagination.total_count === 1 ? 'variable' : 'variables'}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by variable name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Variable Name
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Claude Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading variables...</p>
                    </div>
                  </td>
                </tr>
              ) : variables.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No variables match your search.' : 'No variables found.'}
                  </td>
                </tr>
              ) : (
                variables.map((variable) => (
                  <tr
                    key={variable.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {variable.variable_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium text-gray-900 dark:text-white">
                      {variable.claude_value !== null && variable.claude_value !== undefined ? variable.claude_value : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
