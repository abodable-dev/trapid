import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function ContactRolesManagement() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/v1/contact_roles')
      setRoles(response)
    } catch (error) {
      console.error('Failed to fetch contact roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async () => {
    if (!newRole.trim()) return

    try {
      const response = await api.post('/api/v1/contact_roles', {
        contact_role: {
          name: newRole.trim(),
          active: true
        }
      })
      setRoles([...roles, response])
      setNewRole('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add role:', error)
      alert(error.message || 'Failed to add role')
    }
  }

  const handleUpdateRole = async (role) => {
    try {
      const response = await api.patch(`/api/v1/contact_roles/${role.id}`, {
        contact_role: {
          name: role.name,
          active: role.active
        }
      })
      setRoles(roles.map(r => r.id === role.id ? response : r))
      setEditingRole(null)
    } catch (error) {
      console.error('Failed to update role:', error)
      alert(error.message || 'Failed to update role')
    }
  }

  const handleToggleActive = async (role) => {
    try {
      const response = await api.patch(`/api/v1/contact_roles/${role.id}`, {
        contact_role: {
          active: !role.active
        }
      })
      setRoles(roles.map(r => r.id === role.id ? response : r))
    } catch (error) {
      console.error('Failed to toggle role status:', error)
      alert('Failed to update role status')
    }
  }

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/api/v1/contact_roles/${roleId}`)
      setRoles(roles.filter(r => r.id !== roleId))
    } catch (error) {
      console.error('Failed to delete role:', error)
      alert('Failed to delete role')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Contact Person Roles
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage roles that can be assigned to contact persons (e.g., Sales, Owner, Accounts)
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            <PlusIcon className="h-4 w-4" />
            Add Role
          </button>
        )}
      </div>

      {/* Add new role form */}
      {showAddForm && (
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Role Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
              placeholder="e.g., Project Manager"
              className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
            <button
              onClick={handleAddRole}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
            >
              <CheckIcon className="h-4 w-4" />
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewRole('')
              }}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <XMarkIcon className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Roles list */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {roles.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No roles defined yet. Add your first role to get started.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className={!role.active ? 'opacity-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRole?.id === role.id ? (
                      <input
                        type="text"
                        value={editingRole.name}
                        onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateRole(editingRole)}
                        className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {role.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(role)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {role.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {editingRole?.id === role.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateRole(editingRole)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingRole({ ...role })}
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Inactive roles won't appear in the dropdown when adding or editing contact persons, but existing contact persons with that role will still display it.
        </p>
      </div>
    </div>
  )
}
