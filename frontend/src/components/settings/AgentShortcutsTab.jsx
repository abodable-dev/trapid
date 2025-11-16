import { useState, useEffect } from 'react'
import { api } from '../../api'
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function AgentShortcutsTab() {
  const [shortcuts, setShortcuts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Table state - RULE #19.1 compliance
  const [globalSearch, setGlobalSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [columnWidths, setColumnWidths] = useState({ command: 400, shortcut: 450, audit: 200 })
  const [columnOrder, setColumnOrder] = useState(['command', 'shortcut', 'audit', 'actions'])
  const [visibleColumns, setVisibleColumns] = useState({ command: true, shortcut: true, audit: true, actions: true })

  // Pre-populated Claude Code shortcuts
  const now = new Date().toISOString()
  const baseShortcuts = [
    { id: 1, command: 'Run all agents in parallel', shortcut: '/ag, all agents, allagent' },
    { id: 2, command: 'Run Backend Developer agent', shortcut: '/backend, backend, backend dev' },
    { id: 3, command: 'Run Frontend Developer agent', shortcut: '/frontend, frontend, frontend dev' },
    { id: 4, command: 'Run Production Bug Hunter agent', shortcut: '/bug-hunter, bug hunter, production bug hunter' },
    { id: 5, command: 'Run Deploy Manager agent', shortcut: '/deploy, deploy' },
    { id: 6, command: 'Run Planning Collaborator agent', shortcut: '/plan, plan, planning' },
    { id: 7, command: 'Run Gantt Bug Hunter agent', shortcut: '/gantt, gantt' },
    { id: 8, command: 'Show Schedule Master shortcuts in UI', shortcut: 'sm, schedule master' },
    { id: 9, command: 'Create new API endpoint', shortcut: '/api, create api' },
    { id: 10, command: 'Add database migration', shortcut: '/migration, add migration' },
    { id: 11, command: 'Fix N+1 query', shortcut: '/n+1, fix n+1' },
    { id: 12, command: 'Create new React component', shortcut: '/component, create component' },
    { id: 13, command: 'Add dark mode support', shortcut: '/darkmode, dark mode' },
    { id: 14, command: 'Fix responsive layout', shortcut: '/responsive, fix responsive' },
    { id: 15, command: 'Analyze Heroku logs', shortcut: '/logs, heroku logs' },
    { id: 16, command: 'Debug production error', shortcut: '/debug, debug error' },
    { id: 17, command: 'Check deployment health', shortcut: '/health, check health' },
    { id: 18, command: 'Run database migrations on staging', shortcut: '/migrate, run migrations' },
    { id: 19, command: 'Plan new feature', shortcut: '/feature, plan feature' },
    { id: 20, command: 'Design database schema', shortcut: '/schema, design schema' },
    { id: 21, command: 'Run Gantt visual tests', shortcut: '/gantt-test, test gantt' },
    { id: 22, command: 'Verify timezone compliance', shortcut: '/timezone, check timezone' },
    { id: 23, command: 'Test cascade behavior', shortcut: '/cascade, test cascade' },
    { id: 24, command: 'Check working days enforcement', shortcut: '/workdays, working days' },
    { id: 25, command: 'Create service object', shortcut: '/service, create service' },
    { id: 26, command: 'Add background job', shortcut: '/job, background job' },
    { id: 27, command: 'Optimize query performance', shortcut: '/optimize, optimize query' },
    { id: 28, command: 'Add API documentation', shortcut: '/docs, add docs' },
    { id: 29, command: 'Create modal component', shortcut: '/modal, create modal' },
    { id: 30, command: 'Add form validation', shortcut: '/validate, add validation' },
    { id: 31, command: 'Implement caching', shortcut: '/cache, add cache' },
    { id: 32, command: 'Add error handling', shortcut: '/error, add error handling' },
    { id: 33, command: 'Create reusable component', shortcut: '/reusable, reusable component' },
    { id: 34, command: 'Add loading state', shortcut: '/loading, add loading' },
    { id: 35, command: 'Implement infinite scroll', shortcut: '/scroll, infinite scroll' },
    { id: 36, command: 'Add drag and drop', shortcut: '/drag, drag drop' },
    { id: 37, command: 'Create toast notifications', shortcut: '/toast, notifications' },
    { id: 38, command: 'Add skeleton loading', shortcut: '/skeleton, skeleton loading' },
    { id: 39, command: 'Implement lazy loading', shortcut: '/lazy, lazy load' },
    { id: 40, command: 'Add error boundary', shortcut: '/boundary, error boundary' },
    { id: 41, command: 'Check database connection pool', shortcut: '/dbpool, connection pool' },
    { id: 42, command: 'Debug CORS errors', shortcut: '/cors, debug cors' },
    { id: 43, command: 'Analyze performance bottlenecks', shortcut: '/perf, performance' },
    { id: 44, command: 'Fix timeout errors', shortcut: '/timeout, fix timeout' },
    { id: 45, command: 'Investigate race conditions', shortcut: '/race, race condition' },
    { id: 46, command: 'Verify environment variables', shortcut: '/env, check env' },
    { id: 47, command: 'Test API endpoints', shortcut: '/test-api, test endpoints' },
    { id: 48, command: 'Check frontend build', shortcut: '/build, check build' },
    { id: 49, command: 'Verify background jobs', shortcut: '/bg-jobs, background jobs' },
    { id: 50, command: 'Check Heroku dyno status', shortcut: '/dyno, dyno status' }
  ]

  // Add audit info to all shortcuts
  const defaultShortcuts = baseShortcuts.map(s => ({
    ...s,
    lastUpdated: now,
    updatedBy: 'System'
  }))

  useEffect(() => {
    loadCurrentUser()
    loadShortcuts()
  }, [])

  const loadCurrentUser = () => {
    // Get user from localStorage (set during login)
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        setCurrentUser(userData.email || userData.name || 'User')
      } catch (e) {
        setCurrentUser('User')
      }
    } else {
      setCurrentUser('User')
    }
  }

  useEffect(() => {
    // Persist table state to localStorage - RULE #19.1 requirement
    const state = {
      columnWidths,
      columnOrder,
      visibleColumns,
      sortConfig
    }
    localStorage.setItem('agentShortcutsTableState', JSON.stringify(state))
  }, [columnWidths, columnOrder, visibleColumns, sortConfig])

  const loadShortcuts = () => {
    try {
      // Load shortcuts from localStorage
      const saved = localStorage.getItem('agentShortcuts')
      if (saved) {
        setShortcuts(JSON.parse(saved))
      } else {
        setShortcuts(defaultShortcuts)
        localStorage.setItem('agentShortcuts', JSON.stringify(defaultShortcuts))
      }

      // Load table state
      const savedState = localStorage.getItem('agentShortcutsTableState')
      if (savedState) {
        const state = JSON.parse(savedState)
        setColumnWidths(state.columnWidths || { command: 400, shortcut: 450, audit: 200 })
        setColumnOrder(state.columnOrder || ['command', 'shortcut', 'audit', 'actions'])
        setVisibleColumns(state.visibleColumns || { command: true, shortcut: true, audit: true, actions: true })
        setSortConfig(state.sortConfig || { key: null, direction: 'asc' })
      }
    } catch (error) {
      console.error('Failed to load shortcuts:', error)
      setShortcuts(defaultShortcuts)
    } finally {
      setLoading(false)
    }
  }

  const updateShortcut = (id, field, value) => {
    const updated = shortcuts.map(s =>
      s.id === id ? {
        ...s,
        [field]: value,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser || 'User'
      } : s
    )
    setShortcuts(updated)
    localStorage.setItem('agentShortcuts', JSON.stringify(updated))
  }

  const addShortcut = () => {
    const newShortcut = {
      id: Date.now(),
      command: '',
      shortcut: '',
      lastUpdated: new Date().toISOString(),
      updatedBy: currentUser || 'User'
    }
    const updated = [...shortcuts, newShortcut]
    setShortcuts(updated)
    localStorage.setItem('agentShortcuts', JSON.stringify(updated))
  }

  const deleteShortcut = (id) => {
    const updated = shortcuts.filter(s => s.id !== id)
    setShortcuts(updated)
    localStorage.setItem('agentShortcuts', JSON.stringify(updated))
  }

  const resetToDefaults = () => {
    if (!confirm('Reset all shortcuts to default values? This cannot be undone.')) return
    setShortcuts(defaultShortcuts)
    localStorage.setItem('agentShortcuts', JSON.stringify(defaultShortcuts))
  }

  const handleSave = async () => {
    setSaving(true)
    setExportStatus({ type: 'loading', message: 'Saving to Lexicon...' })

    try {
      // Save to localStorage
      localStorage.setItem('agentShortcuts', JSON.stringify(shortcuts))

      // Auto-save to Lexicon - Create documented_bug entry
      await api.post('/api/v1/documented_bugs', {
        documented_bug: {
          chapter_number: 20,
          chapter_name: 'Agent System & Automation',
          component: 'Claude Code Shortcuts',
          bug_title: 'Claude Code Shortcuts Configuration',
          knowledge_type: 'dev_note',
          description: `${shortcuts.length} shortcuts configured for Claude Code`,
          details: shortcuts.map(s => `- **${s.command}**: ${s.shortcut}`).join('\n')
        }
      })

      // Export to markdown
      await api.post('/api/v1/documented_bugs/export_to_markdown')

      setExportStatus({ type: 'success', message: 'Saved to Lexicon successfully!' })
      setIsEditing(false)
    } catch (error) {
      setExportStatus({ type: 'error', message: `Error: ${error.message}` })
    } finally {
      setSaving(false)
      setTimeout(() => setExportStatus(null), 5000)
    }
  }

  const handleCancel = () => {
    // Reload shortcuts from localStorage
    loadShortcuts()
    setIsEditing(false)
  }

  // RULE #19.1: Table functionality
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }))
  }

  // Filter and sort data
  const filteredAndSortedShortcuts = shortcuts
    .filter(shortcut => {
      // Global search
      if (globalSearch) {
        const search = globalSearch.toLowerCase()
        if (!shortcut.command?.toLowerCase().includes(search) &&
            !shortcut.shortcut?.toLowerCase().includes(search)) {
          return false
        }
      }
      // Column filters
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value && !shortcut[key]?.toLowerCase().includes(value.toLowerCase())) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0
      const aVal = a[sortConfig.key] || ''
      const bVal = b[sortConfig.key] || ''
      const comparison = aVal.localeCompare(bVal)
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })

  const columns = [
    { key: 'command', label: 'Command', sublabel: '(Claude will execute this)', sortable: true, searchable: true },
    { key: 'shortcut', label: 'Shortcut', sublabel: '(User types this)', sortable: true, searchable: true },
    { key: 'audit', label: 'Last Updated', sublabel: '', sortable: true, searchable: false },
    { key: 'actions', label: 'Actions', sortable: false, searchable: false }
  ]

  // Helper function to format date
  const formatAuditInfo = (shortcut) => {
    if (!shortcut.lastUpdated) return 'Never'
    const date = new Date(shortcut.lastUpdated)
    const formattedDate = date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    const by = shortcut.updatedBy || 'Unknown'
    return `${formattedDate}\nby ${by}`
  }

  if (loading) {
    return <div className="animate-pulse p-6">Loading shortcuts...</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Claude Code Shortcuts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define what Claude Code will execute when you type specific shortcuts in chat.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Edit Shortcuts
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <DocumentTextIcon className="w-4 h-4" />}
              Save to Lexicon
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              Cancel
            </button>
            <button
              onClick={addShortcut}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Shortcut
            </button>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset to Defaults
            </button>
          </>
        )}
      </div>

      {/* Status Message */}
      {exportStatus && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          exportStatus.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
          exportStatus.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
          'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
        }`}>
          {exportStatus.message}
        </div>
      )}

      {/* Global Search - RULE #19.1 requirement */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Table - RULE #19.2 Sticky Headers with Gradient */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {/* RULE #19.2: Sticky header with gradient background */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
              <tr>
                {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                  const column = columns.find(c => c.key === colKey)
                  if (!column) return null

                  return (
                    <th
                      key={colKey}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                      style={{ width: columnWidths[colKey] }}
                      onClick={() => column.sortable && handleSort(colKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div>
                              <div>{column.label}</div>
                              {column.sublabel && (
                                <div className="text-xs font-normal text-gray-400 dark:text-gray-500 normal-case">
                                  {column.sublabel}
                                </div>
                              )}
                            </div>
                            {/* RULE #19.2: Sort indicators */}
                            {column.sortable && sortConfig.key === colKey && (
                              sortConfig.direction === 'asc' ?
                                <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
                                <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          {/* RULE #19.3: Inline column filters */}
                          {column.searchable && (
                            <input
                              type="text"
                              placeholder="Filter..."
                              value={columnFilters[colKey] || ''}
                              onChange={(e) => handleColumnFilterChange(colKey, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                          )}
                        </div>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedShortcuts.map(shortcut => (
                <tr key={shortcut.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={shortcut.command}
                        onChange={(e) => updateShortcut(shortcut.id, 'command', e.target.value)}
                        placeholder="What Claude will do..."
                        className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white">
                        {shortcut.command || <span className="text-gray-400 italic">No command</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={shortcut.shortcut}
                        onChange={(e) => updateShortcut(shortcut.id, 'shortcut', e.target.value)}
                        placeholder="What user types (comma-separated)..."
                        className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white">
                        {shortcut.shortcut || <span className="text-gray-400 italic">No shortcut</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {formatAuditInfo(shortcut)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing && (
                      <button
                        onClick={() => deleteShortcut(shortcut.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Info */}
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedShortcuts.length} of {shortcuts.length} shortcuts
        {(globalSearch || Object.keys(columnFilters).length > 0) && ' (filtered)'}
      </div>
    </div>
  )
}
