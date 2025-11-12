import { useState, useEffect } from 'react'
import { api } from '../../api'
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
  CheckCircleIcon,
  TrashIcon,
  XMarkIcon,
  XCircleIcon,
  KeyIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

export default function UserManagementTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editedUsers, setEditedUsers] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Column order state with localStorage persistence and migration
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('users_columnOrder')
    const defaultOrder = ['name', 'email', 'mobile', 'password', 'role', 'group', 'lastLogin', 'actions']

    if (!saved) return defaultOrder

    try {
      const parsed = JSON.parse(saved)
      // Migrate: add missing columns
      const missingColumns = defaultOrder.filter(col => !parsed.includes(col))
      if (missingColumns.length > 0) {
        // Insert mobile and password after email
        const emailIndex = parsed.indexOf('email')
        if (emailIndex !== -1 && !parsed.includes('mobile')) {
          parsed.splice(emailIndex + 1, 0, 'mobile')
        }
        if (emailIndex !== -1 && !parsed.includes('password')) {
          const mobileIndex = parsed.indexOf('mobile')
          parsed.splice(mobileIndex !== -1 ? mobileIndex + 1 : emailIndex + 1, 0, 'password')
        }
        // Save migrated order
        localStorage.setItem('users_columnOrder', JSON.stringify(parsed))
        return parsed
      }
      return parsed
    } catch {
      return defaultOrder
    }
  })

  // Column widths with localStorage persistence and migration
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('users_columnWidths')
    const defaultWidths = {
      name: 200,
      email: 250,
      mobile: 150,
      password: 180,
      role: 180,
      group: 180,
      lastLogin: 150,
      actions: 100
    }

    if (!saved) return defaultWidths

    try {
      const parsed = JSON.parse(saved)
      // Add missing column widths
      const merged = { ...defaultWidths, ...parsed }
      if (Object.keys(merged).length !== Object.keys(parsed).length) {
        localStorage.setItem('users_columnWidths', JSON.stringify(merged))
      }
      return merged
    } catch {
      return defaultWidths
    }
  })

  // Column resize state
  const [resizingColumn, setResizingColumn] = useState(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  // Column filters
  const [columnFilters, setColumnFilters] = useState({})
  const [draggedColumn, setDraggedColumn] = useState(null)

  // Sort state
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    loadUsers()
  }, [])

  // Persist column widths to localStorage
  useEffect(() => {
    localStorage.setItem('users_columnWidths', JSON.stringify(columnWidths))
  }, [columnWidths])

  // Persist column order to localStorage
  useEffect(() => {
    localStorage.setItem('users_columnOrder', JSON.stringify(columnOrder))
  }, [columnOrder])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/users')
      setUsers(Array.isArray(response) ? response : [])
      setError(null)
      setEditedUsers({})
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'builder', label: 'Builder' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'estimator', label: 'Estimator' },
    { value: 'product_owner', label: 'Product Owner' },
    { value: 'admin', label: 'Admin' }
  ]

  const assignableRoles = [
    { value: '', label: 'None' },
    { value: 'admin', label: 'Admin' },
    { value: 'sales', label: 'Sales' },
    { value: 'site', label: 'Site' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'builder', label: 'Builder' },
    { value: 'estimator', label: 'Estimator' }
  ]

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      product_owner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      estimator: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      supervisor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      builder: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
    return colors[role] || colors.user
  }

  const getGroupBadgeColor = (assignedRole) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      sales: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      site: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      supervisor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      builder: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      estimator: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
    return colors[assignedRole] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const formatLastLogin = (lastLoginAt) => {
    if (!lastLoginAt) return 'Never'

    const date = new Date(lastLoginAt)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const handleEditUser = (userId, field, value) => {
    setEditedUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }))
  }

  const handleSaveAll = async () => {
    if (Object.keys(editedUsers).length === 0) return

    setSaving(true)
    try {
      const updates = Object.entries(editedUsers).map(([userId, changes]) =>
        api.patch(`/api/v1/users/${userId}`, {
          user: changes
        })
      )

      await Promise.all(updates)

      setToast({
        message: `Successfully updated ${Object.keys(editedUsers).length} user${Object.keys(editedUsers).length !== 1 ? 's' : ''}`,
        type: 'success'
      })

      await loadUsers()
    } catch (error) {
      console.error('Failed to save users:', error)
      setToast({
        message: 'Failed to save changes. Please try again.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (userId, userEmail, userName) => {
    if (!confirm(`Send password reset email to ${userName} (${userEmail})?`)) {
      return
    }

    try {
      const response = await api.post(`/api/v1/users/${userId}/reset_password`)
      if (response.success) {
        setToast({
          message: `Password reset email sent to ${userEmail}`,
          type: 'success'
        })
      }
    } catch (err) {
      console.error('Failed to send reset email:', err)
      setToast({
        message: 'Failed to send password reset email. Please try again.',
        type: 'error'
      })
    }
  }

  const handleRemoveUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await api.delete(`/api/v1/users/${userId}`)
      if (response.success) {
        setToast({
          message: 'User removed successfully',
          type: 'success'
        })
        loadUsers()
      }
    } catch (err) {
      console.error('Failed to remove user:', err)
      setToast({
        message: 'Failed to remove user. Please try again.',
        type: 'error'
      })
    }
  }

  // Column reordering handlers
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

  // Column filter handler
  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  // Sort handler
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnKey)
      setSortDirection('asc')
    }
  }

  // Column resize handlers
  const handleResizeStart = (e, columnKey) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(columnKey)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[columnKey])
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

  // Helper function to get sort value
  const getSortValue = (user, columnKey) => {
    switch (columnKey) {
      case 'name':
        return user.name?.toLowerCase() || ''
      case 'email':
        return user.email?.toLowerCase() || ''
      case 'mobile':
        return user.mobile_phone?.toLowerCase() || ''
      case 'role':
        return user.role?.toLowerCase() || ''
      case 'group':
        return user.assigned_role?.toLowerCase() || ''
      case 'lastLogin':
        return user.last_login_at || ''
      default:
        return ''
    }
  }

  // Apply column filters
  const applyColumnFilters = (items) => {
    if (Object.keys(columnFilters).length === 0) return items

    return items.filter(item => {
      return Object.entries(columnFilters).every(([key, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true

        const lowerFilter = filterValue.toLowerCase()

        switch (key) {
          case 'name':
            return item.name?.toLowerCase().includes(lowerFilter)
          case 'email':
            return item.email?.toLowerCase().includes(lowerFilter)
          case 'mobile':
            return item.mobile_phone?.toLowerCase().includes(lowerFilter)
          case 'role':
            return item.role?.toLowerCase().includes(lowerFilter)
          case 'group':
            return item.assigned_role?.toLowerCase().includes(lowerFilter)
          default:
            return true
        }
      })
    })
  }

  const filteredUsers = applyColumnFilters(
    users.filter(u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).sort((a, b) => {
    const aVal = getSortValue(a, sortBy)
    const bVal = getSortValue(b, sortBy)

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const columnsConfig = {
    name: { key: 'name', label: 'Name', searchable: true, filterType: 'search' },
    email: { key: 'email', label: 'Email', searchable: true, filterType: 'search' },
    mobile: { key: 'mobile', label: 'Mobile', searchable: true, filterType: 'search' },
    password: { key: 'password', label: 'Password', searchable: false },
    role: { key: 'role', label: 'Role', searchable: true, filterType: 'dropdown' },
    group: { key: 'group', label: 'Group', searchable: true, filterType: 'dropdown' },
    lastLogin: { key: 'lastLogin', label: 'Last Login', searchable: false },
    actions: { key: 'actions', label: 'Actions', searchable: false }
  }

  const columns = columnOrder.map(key => columnsConfig[key])

  // Get current value (edited or original)
  const getCurrentValue = (user, field) => {
    if (editedUsers[user.id] && editedUsers[user.id][field] !== undefined) {
      return editedUsers[user.id][field]
    }
    return user[field]
  }

  // Render cell based on column
  const renderCell = (user, columnKey) => {
    const width = columnWidths[columnKey]
    const cellStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }
    const isEdited = editedUsers[user.id] && editedUsers[user.id][columnKey] !== undefined

    switch (columnKey) {
      case 'name':
        return (
          <td key="name" style={cellStyle} className={`px-6 py-4 whitespace-nowrap ${isEdited ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </span>
            </div>
          </td>
        )

      case 'email':
        return (
          <td key="email" style={cellStyle} className={`px-6 py-4 ${isEdited ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <div className="flex items-center gap-1">
              <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900 dark:text-white truncate">
                {user.email}
              </span>
            </div>
          </td>
        )

      case 'mobile':
        return (
          <td key="mobile" style={cellStyle} className={`px-6 py-4 ${isEdited || editedUsers[user.id]?.mobile_phone !== undefined ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <div className="flex items-center gap-1">
              <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={getCurrentValue(user, 'mobile_phone') || ''}
                onChange={(e) => handleEditUser(user.id, 'mobile_phone', e.target.value)}
                placeholder="04XX XXX XXX"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </td>
        )

      case 'password':
        return (
          <td key="password" style={cellStyle} className="px-6 py-4 whitespace-nowrap">
            <button
              onClick={() => handleResetPassword(user.id, user.email, user.name)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
            >
              <KeyIcon className="h-3.5 w-3.5" />
              Reset Password
            </button>
          </td>
        )

      case 'role':
        return (
          <td key="role" style={cellStyle} className={`px-6 py-4 ${isEdited || editedUsers[user.id]?.role !== undefined ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <select
              value={getCurrentValue(user, 'role')}
              onChange={(e) => handleEditUser(user.id, 'role', e.target.value)}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-sm ${getRoleBadgeColor(getCurrentValue(user, 'role'))} focus:ring-2 focus:ring-indigo-600`}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </td>
        )

      case 'group':
        return (
          <td key="group" style={cellStyle} className={`px-6 py-4 ${isEdited || editedUsers[user.id]?.assigned_role !== undefined ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <select
              value={getCurrentValue(user, 'assigned_role') || ''}
              onChange={(e) => handleEditUser(user.id, 'assigned_role', e.target.value || null)}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-sm ${getCurrentValue(user, 'assigned_role') ? getGroupBadgeColor(getCurrentValue(user, 'assigned_role')) : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'} focus:ring-2 focus:ring-indigo-600`}
            >
              {assignableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </td>
        )

      case 'lastLogin':
        return (
          <td key="lastLogin" style={cellStyle} className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatLastLogin(user.last_login_at)}
            </div>
          </td>
        )

      case 'actions':
        return (
          <td key="actions" style={cellStyle} className="px-6 py-4 whitespace-nowrap text-right">
            <button
              onClick={() => handleRemoveUser(user.id, user.name)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
              title="Remove user"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </td>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage users who have access to the system. Edit roles and groups directly in the table.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {Object.keys(editedUsers).length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Save Changes ({Object.keys(editedUsers).length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#9CA3AF #E5E7EB',
        maxHeight: 'calc(100vh - 350px)'
      }}>
        <div className="w-full h-full">
          <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
              <tr>
                {columns.map((column) => {
                  const width = columnWidths[column.key]
                  const isSortable = column.key !== 'actions'
                  const isSorted = sortBy === column.key
                  return (
                    <th
                      key={column.key}
                      style={{ width: `${width}px`, minWidth: `${width}px`, position: 'relative' }}
                      className={`px-6 py-2 border-r border-gray-200 dark:border-gray-700 ${column.key === 'actions' ? 'text-right' : 'text-left'} ${draggedColumn === column.key ? 'bg-indigo-100 dark:bg-indigo-900/20' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, column.key)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.key)}
                    >
                      <div
                        className={`flex items-center gap-2 ${isSortable ? 'cursor-pointer' : 'cursor-move'}`}
                        onClick={() => isSortable && handleSort(column.key)}
                      >
                        <Bars3Icon className="h-4 w-4 text-gray-400 cursor-move" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{column.label}</span>
                        {isSortable && isSorted && (
                          sortDirection === 'asc' ?
                            <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
                            <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      {column.searchable && (
                        column.filterType === 'dropdown' ? (
                          <select
                            value={columnFilters[column.key] || ''}
                            onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          >
                            {column.key === 'role' ? (
                              <>
                                <option value="">All Roles</option>
                                {roles.map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </>
                            ) : column.key === 'group' ? (
                              <>
                                <option value="">All Groups</option>
                                {assignableRoles.filter(r => r.value).map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </>
                            ) : null}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Search..."
                            value={columnFilters[column.key] || ''}
                            onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        )
                      )}
                      {/* Resize handle */}
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
                        onMouseDown={(e) => handleResizeStart(e, column.key)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    {columns.map((column) => renderCell(user, column.key))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Role Permissions</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Admin:</strong> Full system access</li>
                <li><strong>Product Owner:</strong> Can create templates and edit schedules</li>
                <li><strong>Estimator:</strong> Can edit schedules</li>
                <li><strong>Supervisor:</strong> Can view supervisor tasks</li>
                <li><strong>Builder:</strong> Can view builder tasks</li>
                <li><strong>User:</strong> Basic access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {toast.message}
              </p>
              <button
                onClick={() => setToast(null)}
                className={`ml-4 ${toast.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
