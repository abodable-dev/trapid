import { useState, useEffect } from 'react'
import { api } from '../../api'
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function AgentShortcutsTab() {
  // Separate state for Commands and Slang tables
  const [commands, setCommands] = useState([])
  const [slang, setSlang] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)
  const [isEditingCommands, setIsEditingCommands] = useState(false)
  const [isEditingSlang, setIsEditingSlang] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Table state for Commands table - RULE #19 compliance
  const [globalSearchCommands, setGlobalSearchCommands] = useState('')
  const [columnFiltersCommands, setColumnFiltersCommands] = useState({})
  const [sortConfigCommands, setSortConfigCommands] = useState({ key: null, direction: 'asc' })
  const [columnWidthsCommands, setColumnWidthsCommands] = useState({ command: 400, shortcut: 450, audit: 200 })
  const [resizingColumnCommands, setResizingColumnCommands] = useState(null)
  const [resizeStartXCommands, setResizeStartXCommands] = useState(0)
  const [resizeStartWidthCommands, setResizeStartWidthCommands] = useState(0)
  const [visibleColumnsCommands, setVisibleColumnsCommands] = useState({ command: true, shortcut: true, audit: true })
  const [showColumnPickerCommands, setShowColumnPickerCommands] = useState(false)
  const [selectedCommandsIds, setSelectedCommandsIds] = useState(new Set())

  // Table state for Slang table - RULE #19 compliance
  const [globalSearchSlang, setGlobalSearchSlang] = useState('')
  const [columnFiltersSlang, setColumnFiltersSlang] = useState({})
  const [sortConfigSlang, setSortConfigSlang] = useState({ key: null, direction: 'asc' })
  const [columnWidthsSlang, setColumnWidthsSlang] = useState({ shortcut: 400, meaning: 450, audit: 200 })
  const [resizingColumnSlang, setResizingColumnSlang] = useState(null)
  const [resizeStartXSlang, setResizeStartXSlang] = useState(0)
  const [resizeStartWidthSlang, setResizeStartWidthSlang] = useState(0)
  const [visibleColumnsSlang, setVisibleColumnsSlang] = useState({ shortcut: true, meaning: true, audit: true })
  const [showColumnPickerSlang, setShowColumnPickerSlang] = useState(false)
  const [selectedSlangIds, setSelectedSlangIds] = useState(new Set())

  // Pre-populated Commands (what Claude executes)
  const now = new Date().toISOString()
  const baseCommands = [
    { id: 1, command: 'Run all agents in parallel', shortcut: '/ag, all agents, allagent' },
    { id: 2, command: 'Run Backend Developer agent', shortcut: '/backend, backend, backend dev' },
    { id: 3, command: 'Run Frontend Developer agent', shortcut: '/frontend, frontend, frontend dev' },
    { id: 4, command: 'Run Production Bug Hunter agent', shortcut: '/bug-hunter, bug hunter, production bug hunter' },
    { id: 5, command: 'Run Deploy Manager agent', shortcut: '/deploy, deploy' },
    { id: 6, command: 'Run Planning Collaborator agent', shortcut: '/plan, plan, planning' },
    { id: 7, command: 'Run Gantt Bug Hunter agent', shortcut: '/gantt, gantt' },
    { id: 8, command: 'Create new API endpoint', shortcut: '/api, create api' },
    { id: 9, command: 'Add database migration', shortcut: '/migration, add migration' },
    { id: 10, command: 'Fix N+1 query', shortcut: '/n+1, fix n+1' },
    { id: 11, command: 'Create new React component', shortcut: '/component, create component' },
    { id: 12, command: 'Add dark mode support', shortcut: '/darkmode, dark mode' },
    { id: 13, command: 'Fix responsive layout', shortcut: '/responsive, fix responsive' },
    { id: 14, command: 'Analyze Heroku logs', shortcut: '/logs, heroku logs' },
    { id: 15, command: 'Debug production error', shortcut: '/debug, debug error' },
    { id: 16, command: 'Check deployment health', shortcut: '/health, check health' },
    { id: 17, command: 'Run database migrations on staging', shortcut: '/migrate, run migrations' },
    { id: 18, command: 'Plan new feature', shortcut: '/feature, plan feature' },
    { id: 19, command: 'Design database schema', shortcut: '/schema, design schema' },
    { id: 20, command: 'Run Gantt visual tests', shortcut: '/gantt-test, test gantt' },
    { id: 21, command: 'Verify timezone compliance', shortcut: '/timezone, check timezone' },
    { id: 22, command: 'Test cascade behavior', shortcut: '/cascade, test cascade' },
    { id: 23, command: 'Check working days enforcement', shortcut: '/workdays, working days' },
    { id: 24, command: 'Create service object', shortcut: '/service, create service' },
    { id: 25, command: 'Add background job', shortcut: '/job, background job' }
  ]

  // Pre-populated Slang (shortcuts like "sm" for Schedule Master)
  const baseSlang = [
    { id: 1, shortcut: 'sm', meaning: 'Schedule Master' },
    { id: 2, shortcut: 'po', meaning: 'Purchase Order' },
    { id: 3, shortcut: 'est', meaning: 'Estimate' },
    { id: 4, shortcut: 'inv', meaning: 'Invoice' },
    { id: 5, shortcut: 'sup', meaning: 'Supplier' },
    { id: 6, shortcut: 'cont', meaning: 'Contact' },
    { id: 7, shortcut: 'pb', meaning: 'Price Book' },
    { id: 8, shortcut: 'wf', meaning: 'Workflow' },
    { id: 9, shortcut: 'gantt', meaning: 'Gantt Chart' },
    { id: 10, shortcut: 'sched', meaning: 'Schedule' }
  ]

  // Add audit info to all items
  const defaultCommands = baseCommands.map(c => ({
    ...c,
    lastUpdated: now,
    updatedBy: 'System'
  }))

  const defaultSlang = baseSlang.map(s => ({
    ...s,
    lastUpdated: now,
    updatedBy: 'System'
  }))

  useEffect(() => {
    loadCurrentUser()
    loadData()
  }, [])

  // Column resize handlers for Commands table
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizingColumnCommands) {
        const diff = e.clientX - resizeStartXCommands
        const newWidth = Math.max(100, resizeStartWidthCommands + diff)
        setColumnWidthsCommands(prev => ({
          ...prev,
          [resizingColumnCommands]: newWidth
        }))
      }
    }

    const handleMouseUp = () => {
      setResizingColumnCommands(null)
    }

    if (resizingColumnCommands) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingColumnCommands, resizeStartXCommands, resizeStartWidthCommands])

  // Column resize handlers for Slang table
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizingColumnSlang) {
        const diff = e.clientX - resizeStartXSlang
        const newWidth = Math.max(100, resizeStartWidthSlang + diff)
        setColumnWidthsSlang(prev => ({
          ...prev,
          [resizingColumnSlang]: newWidth
        }))
      }
    }

    const handleMouseUp = () => {
      setResizingColumnSlang(null)
    }

    if (resizingColumnSlang) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingColumnSlang, resizeStartXSlang, resizeStartWidthSlang])

  const loadCurrentUser = () => {
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

  const loadData = () => {
    try {
      const savedCommands = localStorage.getItem('claudeCommands')
      if (savedCommands) {
        setCommands(JSON.parse(savedCommands))
      } else {
        setCommands(defaultCommands)
        localStorage.setItem('claudeCommands', JSON.stringify(defaultCommands))
      }

      const savedSlang = localStorage.getItem('claudeSlang')
      if (savedSlang) {
        setSlang(JSON.parse(savedSlang))
      } else {
        setSlang(defaultSlang)
        localStorage.setItem('claudeSlang', JSON.stringify(defaultSlang))
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setCommands(defaultCommands)
      setSlang(defaultSlang)
    } finally {
      setLoading(false)
    }
  }

  // Commands CRUD
  const updateCommand = (id, field, value) => {
    const updated = commands.map(c =>
      c.id === id ? {
        ...c,
        [field]: value,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser || 'User'
      } : c
    )
    setCommands(updated)
    localStorage.setItem('claudeCommands', JSON.stringify(updated))
  }

  const addCommand = () => {
    const newCommand = {
      id: Date.now(),
      command: '',
      shortcut: '',
      lastUpdated: new Date().toISOString(),
      updatedBy: currentUser || 'User'
    }
    const updated = [...commands, newCommand]
    setCommands(updated)
    localStorage.setItem('claudeCommands', JSON.stringify(updated))
  }

  const deleteCommand = (id) => {
    const updated = commands.filter(c => c.id !== id)
    setCommands(updated)
    localStorage.setItem('claudeCommands', JSON.stringify(updated))
  }

  const bulkDeleteCommands = () => {
    if (!confirm(`Delete ${selectedCommandsIds.size} selected commands? This cannot be undone.`)) return
    const updated = commands.filter(c => !selectedCommandsIds.has(c.id))
    setCommands(updated)
    localStorage.setItem('claudeCommands', JSON.stringify(updated))
    setSelectedCommandsIds(new Set())
  }

  const resetCommandsToDefaults = () => {
    if (!confirm('Reset all commands to default values? This cannot be undone.')) return
    setCommands(defaultCommands)
    localStorage.setItem('claudeCommands', JSON.stringify(defaultCommands))
    setSelectedCommandsIds(new Set())
  }

  // Slang CRUD
  const updateSlang = (id, field, value) => {
    const updated = slang.map(s =>
      s.id === id ? {
        ...s,
        [field]: value,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser || 'User'
      } : s
    )
    setSlang(updated)
    localStorage.setItem('claudeSlang', JSON.stringify(updated))
  }

  const addSlang = () => {
    const newSlang = {
      id: Date.now(),
      shortcut: '',
      meaning: '',
      lastUpdated: new Date().toISOString(),
      updatedBy: currentUser || 'User'
    }
    const updated = [...slang, newSlang]
    setSlang(updated)
    localStorage.setItem('claudeSlang', JSON.stringify(updated))
  }

  const deleteSlang = (id) => {
    const updated = slang.filter(s => s.id !== id)
    setSlang(updated)
    localStorage.setItem('claudeSlang', JSON.stringify(updated))
  }

  const bulkDeleteSlang = () => {
    if (!confirm(`Delete ${selectedSlangIds.size} selected slang entries? This cannot be undone.`)) return
    const updated = slang.filter(s => !selectedSlangIds.has(s.id))
    setSlang(updated)
    localStorage.setItem('claudeSlang', JSON.stringify(updated))
    setSelectedSlangIds(new Set())
  }

  const resetSlangToDefaults = () => {
    if (!confirm('Reset all slang to default values? This cannot be undone.')) return
    setSlang(defaultSlang)
    localStorage.setItem('claudeSlang', JSON.stringify(defaultSlang))
    setSelectedSlangIds(new Set())
  }

  // Save to Lexicon
  const handleSaveCommands = async () => {
    setSaving(true)
    setExportStatus({ type: 'loading', message: 'Saving Commands to Lexicon...' })

    try {
      localStorage.setItem('claudeCommands', JSON.stringify(commands))

      await api.post('/api/v1/documented_bugs', {
        documented_bug: {
          chapter_number: 20,
          chapter_name: 'Agent System & Automation',
          component: 'Claude Code Commands',
          bug_title: 'Claude Code Commands Configuration',
          knowledge_type: 'dev_note',
          description: `${commands.length} commands configured for Claude Code`,
          details: commands.map(c => `- **${c.command}**: ${c.shortcut}`).join('\n')
        }
      })

      await api.post('/api/v1/documented_bugs/export_to_markdown')

      setExportStatus({ type: 'success', message: 'Commands saved to Lexicon!' })
      setIsEditingCommands(false)
    } catch (error) {
      setExportStatus({ type: 'error', message: `Error: ${error.message}` })
    } finally {
      setSaving(false)
      setTimeout(() => setExportStatus(null), 5000)
    }
  }

  const handleSaveSlang = async () => {
    setSaving(true)
    setExportStatus({ type: 'loading', message: 'Saving Slang to Lexicon...' })

    try {
      localStorage.setItem('claudeSlang', JSON.stringify(slang))

      await api.post('/api/v1/documented_bugs', {
        documented_bug: {
          chapter_number: 20,
          chapter_name: 'Agent System & Automation',
          component: 'Claude Code Slang',
          bug_title: 'Claude Code Slang Configuration',
          knowledge_type: 'dev_note',
          description: `${slang.length} slang shortcuts configured for Claude Code`,
          details: slang.map(s => `- **${s.shortcut}**: ${s.meaning}`).join('\n')
        }
      })

      await api.post('/api/v1/documented_bugs/export_to_markdown')

      setExportStatus({ type: 'success', message: 'Slang saved to Lexicon!' })
      setIsEditingSlang(false)
    } catch (error) {
      setExportStatus({ type: 'error', message: `Error: ${error.message}` })
    } finally {
      setSaving(false)
      setTimeout(() => setExportStatus(null), 5000)
    }
  }

  // Sort and filter handlers
  const handleSortCommands = (key) => {
    setSortConfigCommands(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSortSlang = (key) => {
    setSortConfigSlang(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleColumnFilterChangeCommands = (column, value) => {
    setColumnFiltersCommands(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleColumnFilterChangeSlang = (column, value) => {
    setColumnFiltersSlang(prev => ({
      ...prev,
      [column]: value
    }))
  }

  // Filtering and sorting
  const filteredCommands = commands
    .filter(cmd => {
      if (globalSearchCommands) {
        const search = globalSearchCommands.toLowerCase()
        if (!cmd.command?.toLowerCase().includes(search) && !cmd.shortcut?.toLowerCase().includes(search)) {
          return false
        }
      }
      for (const [key, value] of Object.entries(columnFiltersCommands)) {
        if (value && !cmd[key]?.toLowerCase().includes(value.toLowerCase())) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
      if (!sortConfigCommands.key) return 0
      const aVal = a[sortConfigCommands.key] || ''
      const bVal = b[sortConfigCommands.key] || ''
      const comparison = aVal.localeCompare(bVal)
      return sortConfigCommands.direction === 'asc' ? comparison : -comparison
    })

  const filteredSlang = slang
    .filter(s => {
      if (globalSearchSlang) {
        const search = globalSearchSlang.toLowerCase()
        if (!s.shortcut?.toLowerCase().includes(search) && !s.meaning?.toLowerCase().includes(search)) {
          return false
        }
      }
      for (const [key, value] of Object.entries(columnFiltersSlang)) {
        if (value && !s[key]?.toLowerCase().includes(value.toLowerCase())) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
      if (!sortConfigSlang.key) return 0
      const aVal = a[sortConfigSlang.key] || ''
      const bVal = b[sortConfigSlang.key] || ''
      const comparison = aVal.localeCompare(bVal)
      return sortConfigSlang.direction === 'asc' ? comparison : -comparison
    })

  const formatAuditInfo = (item) => {
    if (!item.lastUpdated) return 'Never'
    const date = new Date(item.lastUpdated)
    const formattedDate = date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    const by = item.updatedBy || 'Unknown'
    return `${formattedDate}\nby ${by}`
  }

  const commandsColumns = [
    { key: 'command', label: 'Command', sublabel: '(Claude will execute this)', sortable: true, searchable: true },
    { key: 'shortcut', label: 'Shortcut', sublabel: '(User types this)', sortable: true, searchable: true },
    { key: 'audit', label: 'Last Updated', sortable: false, searchable: false }
  ]

  const slangColumns = [
    { key: 'shortcut', label: 'Shortcut', sublabel: '(What user types)', sortable: true, searchable: true },
    { key: 'meaning', label: 'Meaning', sortable: true, searchable: true },
    { key: 'audit', label: 'Last Updated', sortable: false, searchable: false }
  ]

  if (loading) {
    return <div className="animate-pulse p-6">Loading...</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Claude Code Shortcuts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage commands (what Claude executes) and slang (quick shortcuts like "sm" for Schedule Master)
        </p>
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

      {/* COMMANDS TABLE */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Commands
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              (What Claude will execute)
            </span>
          </h3>
          <div className="flex gap-3">
            {!isEditingCommands ? (
              <button
                onClick={() => setIsEditingCommands(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Edit Commands
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveCommands}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <DocumentTextIcon className="w-4 h-4" />}
                  Save to Lexicon
                </button>
                <button
                  onClick={() => { loadData(); setIsEditingCommands(false) }}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addCommand}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Command
                </button>
                <button
                  onClick={resetCommandsToDefaults}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bulk Actions - RULE #19.9 */}
        {selectedCommandsIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedCommandsIds.size} selected
            </span>
            <button
              onClick={bulkDeleteCommands}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedCommandsIds(new Set())}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Global Search and Column Visibility - RULE #19.5A */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands..."
              value={globalSearchCommands}
              onChange={(e) => setGlobalSearchCommands(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPickerCommands(!showColumnPickerCommands)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Columns</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Column Picker Dropdown */}
            {showColumnPickerCommands && (
              <div className="absolute right-0 z-20 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[200px]">
                {commandsColumns.map(column => (
                  <label key={column.key} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumnsCommands[column.key]}
                      onChange={() => {
                        setVisibleColumnsCommands(prev => ({
                          ...prev,
                          [column.key]: !prev[column.key]
                        }))
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{column.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Commands Table - RULE #19.2 Sticky Headers, #19.3 Inline Filters, #19.5B Resizable */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
                <tr>
                  {/* Row Selection - RULE #19.9 */}
                  <th className="relative px-6 py-3 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedCommandsIds.size === filteredCommands.length && filteredCommands.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCommandsIds(new Set(filteredCommands.map(cmd => cmd.id)))
                        } else {
                          setSelectedCommandsIds(new Set())
                        }
                      }}
                    />
                  </th>
                  {commandsColumns.filter(column => visibleColumnsCommands[column.key]).map(column => (
                    <th
                      key={column.key}
                      style={{ width: columnWidthsCommands[column.key] }}
                      className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => column.sortable && handleSortCommands(column.key)}
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
                            {column.sortable && sortConfigCommands.key === column.key && (
                              sortConfigCommands.direction === 'asc' ?
                                <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
                                <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          {column.searchable && (
                            <input
                              type="text"
                              placeholder="Filter..."
                              value={columnFiltersCommands[column.key] || ''}
                              onChange={(e) => handleColumnFilterChangeCommands(column.key, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                          )}
                        </div>
                      </div>
                      {/* Resize handle */}
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setResizingColumnCommands(column.key)
                          setResizeStartXCommands(e.clientX)
                          setResizeStartWidthCommands(columnWidthsCommands[column.key])
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </th>
                  ))}
                  {isEditingCommands && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCommands.map(cmd => (
                  <tr key={cmd.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* Row Selection - RULE #19.9 */}
                    <td className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedCommandsIds.has(cmd.id)}
                        onChange={() => {
                          const newSelected = new Set(selectedCommandsIds)
                          if (newSelected.has(cmd.id)) {
                            newSelected.delete(cmd.id)
                          } else {
                            newSelected.add(cmd.id)
                          }
                          setSelectedCommandsIds(newSelected)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    {visibleColumnsCommands.command && (
                      <td className="px-6 py-4">
                        {isEditingCommands ? (
                          <input
                            type="text"
                            value={cmd.command}
                            onChange={(e) => updateCommand(cmd.id, 'command', e.target.value)}
                            placeholder="What Claude will do..."
                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white">
                            {cmd.command || <span className="text-gray-400 italic">No command</span>}
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumnsCommands.shortcut && (
                      <td className="px-6 py-4">
                        {isEditingCommands ? (
                          <input
                            type="text"
                            value={cmd.shortcut}
                            onChange={(e) => updateCommand(cmd.id, 'shortcut', e.target.value)}
                            placeholder="What user types (comma-separated)..."
                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white">
                            {cmd.shortcut || <span className="text-gray-400 italic">No shortcut</span>}
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumnsCommands.audit && (
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                          {formatAuditInfo(cmd)}
                        </div>
                      </td>
                    )}
                    {isEditingCommands && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => deleteCommand(cmd.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCommands.length} of {commands.length} commands
          {(globalSearchCommands || Object.keys(columnFiltersCommands).length > 0) && ' (filtered)'}
        </div>
      </div>

      {/* SLANG TABLE */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Slang
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              (Quick shortcuts like "sm" for Schedule Master)
            </span>
          </h3>
          <div className="flex gap-3">
            {!isEditingSlang ? (
              <button
                onClick={() => setIsEditingSlang(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Edit Slang
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveSlang}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <DocumentTextIcon className="w-4 h-4" />}
                  Save to Lexicon
                </button>
                <button
                  onClick={() => { loadData(); setIsEditingSlang(false) }}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addSlang}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Slang
                </button>
                <button
                  onClick={resetSlangToDefaults}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bulk Actions - RULE #19.9 */}
        {selectedSlangIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedSlangIds.size} selected
            </span>
            <button
              onClick={bulkDeleteSlang}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedSlangIds(new Set())}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Global Search and Column Visibility - RULE #19.5A */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search slang..."
              value={globalSearchSlang}
              onChange={(e) => setGlobalSearchSlang(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPickerSlang(!showColumnPickerSlang)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Columns</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Column Picker Dropdown */}
            {showColumnPickerSlang && (
              <div className="absolute right-0 z-20 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[200px]">
                {slangColumns.map(column => (
                  <label key={column.key} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumnsSlang[column.key]}
                      onChange={() => {
                        setVisibleColumnsSlang(prev => ({
                          ...prev,
                          [column.key]: !prev[column.key]
                        }))
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{column.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slang Table - RULE #19.2 Sticky Headers, #19.3 Inline Filters, #19.5B Resizable */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
                <tr>
                  {/* Row Selection - RULE #19.9 */}
                  <th className="relative px-6 py-3 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedSlangIds.size === filteredSlang.length && filteredSlang.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSlangIds(new Set(filteredSlang.map(s => s.id)))
                        } else {
                          setSelectedSlangIds(new Set())
                        }
                      }}
                    />
                  </th>
                  {slangColumns.filter(column => visibleColumnsSlang[column.key]).map(column => (
                    <th
                      key={column.key}
                      style={{ width: columnWidthsSlang[column.key] }}
                      className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => column.sortable && handleSortSlang(column.key)}
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
                            {column.sortable && sortConfigSlang.key === column.key && (
                              sortConfigSlang.direction === 'asc' ?
                                <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
                                <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          {column.searchable && (
                            <input
                              type="text"
                              placeholder="Filter..."
                              value={columnFiltersSlang[column.key] || ''}
                              onChange={(e) => handleColumnFilterChangeSlang(column.key, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                          )}
                        </div>
                      </div>
                      {/* Resize handle */}
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setResizingColumnSlang(column.key)
                          setResizeStartXSlang(e.clientX)
                          setResizeStartWidthSlang(columnWidthsSlang[column.key])
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </th>
                  ))}
                  {isEditingSlang && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSlang.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* Row Selection - RULE #19.9 */}
                    <td className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedSlangIds.has(s.id)}
                        onChange={() => {
                          const newSelected = new Set(selectedSlangIds)
                          if (newSelected.has(s.id)) {
                            newSelected.delete(s.id)
                          } else {
                            newSelected.add(s.id)
                          }
                          setSelectedSlangIds(newSelected)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    {visibleColumnsSlang.shortcut && (
                      <td className="px-6 py-4">
                        {isEditingSlang ? (
                          <input
                            type="text"
                            value={s.shortcut}
                            onChange={(e) => updateSlang(s.id, 'shortcut', e.target.value)}
                            placeholder="Shortcut (e.g., sm)..."
                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white">
                            {s.shortcut || <span className="text-gray-400 italic">No shortcut</span>}
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumnsSlang.meaning && (
                      <td className="px-6 py-4">
                        {isEditingSlang ? (
                          <input
                            type="text"
                            value={s.meaning}
                            onChange={(e) => updateSlang(s.id, 'meaning', e.target.value)}
                            placeholder="What it means..."
                            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white">
                            {s.meaning || <span className="text-gray-400 italic">No meaning</span>}
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumnsSlang.audit && (
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                          {formatAuditInfo(s)}
                        </div>
                      </td>
                    )}
                    {isEditingSlang && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => deleteSlang(s.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredSlang.length} of {slang.length} slang shortcuts
          {(globalSearchSlang || Object.keys(columnFiltersSlang).length > 0) && ' (filtered)'}
        </div>
      </div>
    </div>
  )
}
