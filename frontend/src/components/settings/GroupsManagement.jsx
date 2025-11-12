import { useState, useEffect } from 'react'
import { api } from '../../api'
import {
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function GroupsManagement() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupLabel, setNewGroupLabel] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/user_groups')
      setGroups(response.groups || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load groups:', err)
      setError('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGroup = async () => {
    if (!newGroupName.trim() || !newGroupLabel.trim()) {
      setToast({
        message: 'Both group name and label are required',
        type: 'error'
      })
      return
    }

    try {
      await api.post('/api/v1/user_groups', {
        name: newGroupName.trim().toLowerCase().replace(/\s+/g, '_'),
        label: newGroupLabel.trim()
      })
      setToast({
        message: 'Group added successfully',
        type: 'success'
      })
      setNewGroupName('')
      setNewGroupLabel('')
      loadGroups()
    } catch (err) {
      console.error('Failed to add group:', err)
      setToast({
        message: err.response?.data?.error || 'Failed to add group',
        type: 'error'
      })
    }
  }

  const handleDeleteGroup = async (groupName) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}"? Users in this group will have their group removed.`)) {
      return
    }

    try {
      await api.delete(`/api/v1/user_groups/${groupName}`)
      setToast({
        message: 'Group deleted successfully',
        type: 'success'
      })
      loadGroups()
    } catch (err) {
      console.error('Failed to delete group:', err)
      setToast({
        message: err.response?.data?.error || 'Failed to delete group',
        type: 'error'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading groups...</div>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Group Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Organize users into teams or departments. Groups are used for task assignments and filtering.
          </p>
        </div>
      </div>

      {/* Add New Group Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Group</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name (lowercase, underscore-separated)
            </label>
            <input
              id="groupName"
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., project_management"
              className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="groupLabel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Label
            </label>
            <input
              id="groupLabel"
              type="text"
              value={newGroupLabel}
              onChange={(e) => setNewGroupLabel(e.target.value)}
              placeholder="e.g., Project Management"
              className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleAddGroup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            Add Group
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Groups</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {groups.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No groups defined</p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.value}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <UserGroupIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {group.value}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGroup(group.value)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete group"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <UserGroupIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">About Groups</h3>
            <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Groups organize users into teams or departments (e.g., sales, site, operations)</li>
                <li>Users can belong to zero or one group</li>
                <li>Groups are used for task assignments in schedules</li>
                <li>Group names should be lowercase with underscores (e.g., field_operations)</li>
                <li>Changes take effect immediately for all users</li>
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
