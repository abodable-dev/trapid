import { useEffect, useState } from 'react'
import { getNowInCompanyTimezone, getTodayAsString, getRelativeTime } from '../utils/timezoneUtils'
import { api } from '../api'
import {
  MagnifyingGlassIcon,
  UserIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import ColumnVisibilityModal from '../components/modals/ColumnVisibilityModal'
import Toast from '../components/Toast'
import AddUserModal from '../components/settings/AddUserModal'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [groupFilter, setGroupFilter] = useState('all')
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [toast, setToast] = useState(null)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    role: true,
    group: true,
    lastLogin: true,
    actions: true
  })

  // Define all available columns
  const availableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'group', label: 'Group' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'actions', label: 'Actions' }
  ]

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

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Listen for global search event from AppLayout
  useEffect(() => {
    const handleGlobalSearch = (event) => {
      setSearchQuery(event.detail)
    }

    window.addEventListener('global-search', handleGlobalSearch)
    return () => {
      window.removeEventListener('global-search', handleGlobalSearch)
    }
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/users')
      setUsers(Array.isArray(response) ? response : [])
      setError(null)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user.id)
    setEditValues({
      name: user.name,
      email: user.email,
      role: user.role,
      assigned_role: user.assigned_role || ''
    })
  }

  const handleSave = async (userId) => {
    try {
      const response = await api.patch(`/api/v1/users/${userId}`, {
        user: editValues
      })

      if (response.success) {
        setToast({
          message: 'User updated successfully',
          type: 'success'
        })
        setEditingUser(null)
        setEditValues({})
        loadUsers()
      }
    } catch (error) {
      console.error('Update error:', error)
      setToast({
        message: error.response?.data?.error || 'Failed to update user',
        type: 'error'
      })
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setEditValues({})
  }

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to remove ${user.name}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await api.delete(`/api/v1/users/${user.id}`)
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
        message: 'Failed to remove user',
        type: 'error'
      })
    }
  }

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

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesGroup = groupFilter === 'all' || user.assigned_role === groupFilter

    return matchesSearch && matchesRole && matchesGroup
  })

  // Calculate stats
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.last_login_at).length,
    groups: users.filter(u => u.assigned_role).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and group assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 self-start sm:self-auto font-medium"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admins</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.admin}</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">With Groups</p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">{stats.groups}</p>
              </div>
              <div className="h-12 w-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <UserGroupIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowColumnModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <EyeIcon className="h-5 w-5" />
              Columns
            </button>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Groups</option>
              {assignableRoles.filter(r => r.value).map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB'
          }}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
                <tr>
                  {visibleColumns.name && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                  )}
                  {visibleColumns.email && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                  )}
                  {visibleColumns.role && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                  )}
                  {visibleColumns.group && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Group
                    </th>
                  )}
                  {visibleColumns.lastLogin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-12 text-center">
                      <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {visibleColumns.name && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <input
                              type="text"
                              value={editValues.name}
                              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          )}
                        </td>
                      )}
                      {visibleColumns.email && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <input
                              type="email"
                              value={editValues.email}
                              onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                            />
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          )}
                        </td>
                      )}
                      {visibleColumns.role && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <select
                              value={editValues.role}
                              onChange={(e) => setEditValues({ ...editValues, role: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                            >
                              {roles.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              {roles.find(r => r.value === user.role)?.label || user.role}
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.group && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <select
                              value={editValues.assigned_role}
                              onChange={(e) => setEditValues({ ...editValues, assigned_role: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                            >
                              {assignableRoles.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                            </select>
                          ) : user.assigned_role ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupBadgeColor(user.assigned_role)}`}>
                              <UserGroupIcon className="h-3 w-3 mr-1" />
                              {assignableRoles.find(r => r.value === user.assigned_role)?.label || user.assigned_role}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.lastLogin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="h-4 w-4 mr-1.5" />
                            {formatLastLogin(user.last_login_at)}
                          </div>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingUser === user.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSave(user.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ColumnVisibilityModal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        availableColumns={availableColumns}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={() => {
          setShowAddModal(false)
          loadUsers()
          setToast({
            message: 'User added successfully',
            type: 'success'
          })
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
