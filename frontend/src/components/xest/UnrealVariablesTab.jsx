import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function UnrealVariablesTab() {
  const [variables, setVariables] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    variable_name: '',
    claude_value: '',
    is_active: true
  })
  const [newVariable, setNewVariable] = useState({
    variable_name: '',
    claude_value: '',
    is_active: true
  })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadVariables()
  }, [])

  const loadVariables = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/unreal_variables')
      setVariables(response.unreal_variables || [])
    } catch (error) {
      console.error('Failed to load unreal variables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/v1/unreal_variables', {
        unreal_variable: newVariable
      })
      setNewVariable({ variable_name: '', claude_value: '', is_active: true })
      setShowAddForm(false)
      loadVariables()
    } catch (error) {
      console.error('Failed to create variable:', error)
      alert('Failed to create variable: ' + (error.response?.data?.errors?.join(', ') || error.message))
    }
  }

  const handleUpdate = async (id) => {
    try {
      await api.patch(`/api/v1/unreal_variables/${id}`, {
        unreal_variable: editForm
      })
      setEditingId(null)
      loadVariables()
    } catch (error) {
      console.error('Failed to update variable:', error)
      alert('Failed to update variable: ' + (error.response?.data?.errors?.join(', ') || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this variable?')) return

    try {
      await api.delete(`/api/v1/unreal_variables/${id}`)
      loadVariables()
    } catch (error) {
      console.error('Failed to delete variable:', error)
      alert('Failed to delete variable')
    }
  }

  const startEditing = (variable) => {
    setEditingId(variable.id)
    setEditForm({
      variable_name: variable.variable_name,
      claude_value: variable.claude_value,
      is_active: variable.is_active
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({ variable_name: '', claude_value: '', is_active: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Unreal Variables</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage variables synced with Unreal Engine
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Variable
        </button>
      </div>

      {/* Add New Variable Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Add New Variable</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variable Name
                </label>
                <input
                  type="text"
                  required
                  value={newVariable.variable_name}
                  onChange={(e) => setNewVariable({ ...newVariable, variable_name: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., WALL_HEIGHT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Claude Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newVariable.claude_value}
                  onChange={(e) => setNewVariable({ ...newVariable, claude_value: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., 2.4"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newVariable.is_active}
                    onChange={(e) => setNewVariable({ ...newVariable, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Variable
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewVariable({ variable_name: '', claude_value: '', is_active: true })
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Variables Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading variables...
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Variable Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Claude Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {variables.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No variables found. Click "Add Variable" to create one.
                  </td>
                </tr>
              ) : (
                variables.map((variable) => (
                <tr key={variable.id}>
                  {editingId === variable.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.variable_name}
                          onChange={(e) => setEditForm({ ...editForm, variable_name: e.target.value })}
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.claude_value}
                          onChange={(e) => setEditForm({ ...editForm, claude_value: e.target.value })}
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                        </label>
                      </td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdate(variable.id)}
                          className="text-green-600 dark:text-green-400 hover:text-green-700"
                          title="Save"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-700"
                          title="Cancel"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {variable.variable_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {parseFloat(variable.claude_value).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          variable.is_active
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {variable.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(variable.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button
                          onClick={() => startEditing(variable)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(variable.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              )))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
