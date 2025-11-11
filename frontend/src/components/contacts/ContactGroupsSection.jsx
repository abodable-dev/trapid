import { useState } from 'react'
import { TagIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function ContactGroupsSection({ contactGroups = [], onUpdate, isEditMode, contactId }) {
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name')
      return
    }

    try {
      setIsLoading(true)
      // Create new group with the name
      const updatedGroups = [...contactGroups, { name: newGroupName.trim(), status: 'ACTIVE' }]
      await onUpdate(updatedGroups)
      setNewGroupName('')
      setIsAddingGroup(false)
    } catch (error) {
      console.error('Failed to add group:', error)
      alert('Failed to add contact group')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to remove this contact from this group?')) return

    try {
      setIsLoading(true)
      const updatedGroups = contactGroups.filter(g => g.id !== groupId)
      await onUpdate(updatedGroups)
    } catch (error) {
      console.error('Failed to remove group:', error)
      alert('Failed to remove contact group')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          Contact Groups
          <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24" title="Syncs with Xero">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </h3>
        {isEditMode && !isAddingGroup && (
          <button
            onClick={() => setIsAddingGroup(true)}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add to Group
          </button>
        )}
      </div>

      {contactGroups.length === 0 && !isAddingGroup && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Not assigned to any groups</p>
      )}

      <div className="space-y-2">
        {contactGroups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</span>
              {group.status && (
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                  group.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {group.status}
                </span>
              )}
            </div>
            {isEditMode && (
              <button
                onClick={() => handleRemoveGroup(group.id)}
                disabled={isLoading}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {/* Add Group Form */}
        {isAddingGroup && (
          <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/10">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add to Contact Group</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddGroup()
                    if (e.key === 'Escape') {
                      setIsAddingGroup(false)
                      setNewGroupName('')
                    }
                  }}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Add this contact to an existing Xero contact group or create a new one
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddGroup}
                  disabled={isLoading || !newGroupName.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingGroup(false)
                    setNewGroupName('')
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
