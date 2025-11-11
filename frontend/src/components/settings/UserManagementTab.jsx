import { useState, useEffect } from 'react'
import { api } from '../../api'
import { UserIcon, EnvelopeIcon, ShieldCheckIcon, PlusIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'
import AddUserModal from './AddUserModal'
import EditUserModal from './EditUserModal'

export default function UserManagementTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadUsers()
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

  const getRoleDisplayName = (role) => {
    const names = {
      admin: 'Admin',
      product_owner: 'Product Owner',
      estimator: 'Estimator',
      supervisor: 'Supervisor',
      builder: 'Builder',
      user: 'User'
    }
    return names[role] || role
  }

  const getGroupDisplayName = (assignedRole) => {
    if (!assignedRole) return null
    const names = {
      admin: 'Admin',
      sales: 'Sales',
      site: 'Site',
      supervisor: 'Supervisor',
      builder: 'Builder',
      estimator: 'Estimator'
    }
    return names[assignedRole] || assignedRole
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

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleRemoveUser = async (user) => {
    if (!confirm(`Are you sure you want to remove ${user.name}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await api.delete(`/api/v1/users/${user.id}`)
      if (response.success) {
        loadUsers()
      }
    } catch (err) {
      console.error('Failed to remove user:', err)
      alert('Failed to remove user. Please try again.')
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage users who have access to the system
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={loadUsers}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onUserUpdated={loadUsers}
        user={selectedUser}
      />

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No users found</p>
            </li>
          ) : (
            users.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                            {user.name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            {getRoleDisplayName(user.role)}
                          </span>
                          {user.assigned_role && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupBadgeColor(
                                user.assigned_role
                              )}`}
                            >
                              <UserGroupIcon className="h-3 w-3 mr-1" />
                              {getGroupDisplayName(user.assigned_role)}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1.5" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                            <ClockIcon className="h-3.5 w-3.5 mr-1" />
                            Last login: {formatLastLogin(user.last_login_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditUser(user)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

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
    </div>
  )
}
