import { useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { TagIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'

export default function ContactGroupsSection({ contactGroups = [], onUpdate, isEditMode }) {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          Contact Groups
          <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
        </h2>
        {isEditMode && !isAddingGroup && (
          <button
            onClick={() => setIsAddingGroup(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
          >
            <PlusIcon className="h-4 w-4" />
            Add to Group
          </button>
        )}
      </div>

      {contactGroups.length === 0 && !isAddingGroup && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Not assigned to any groups yet</p>
      )}

      <div className="space-y-4">
        {contactGroups.map((group) => (
          <div key={group.id} className="relative">
            {/* Delete button - positioned absolute top-right when in edit mode */}
            {isEditMode && (
              <div className="absolute top-0 right-0">
                <button
                  onClick={() => handleRemoveGroup(group.id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 disabled:opacity-50"
                  title="Remove from group"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Group info - matching Contact Information layout */}
            <div className="flex items-start gap-3 pr-8">
              <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Group</p>
                  <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                </div>
                <div
                  className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}
                >
                  <p className={`text-gray-900 dark:text-white flex-1 ${isEditMode ? 'border-b-2 border-dashed border-blue-400' : ''}`}>
                    {group.name}
                    {group.status && (
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                        group.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {group.status}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Group Form - inline grid style matching Contact Information */}
        {isAddingGroup && (
          <div className="relative">
            {/* Group info - matching Contact Information layout */}
            <div className="flex items-start gap-3 pr-8">
              <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Group</p>
                  <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                </div>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddGroup()
                    if (e.key === 'Escape') {
                      setIsAddingGroup(false)
                      setNewGroupName('')
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Add this contact to an existing Xero contact group or create a new one
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddGroup}
                    disabled={isLoading || !newGroupName.trim()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
