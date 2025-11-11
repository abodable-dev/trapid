import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function EditUserModal({ isOpen, onClose, onUserUpdated, user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    assigned_role: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const roles = [
    { value: 'user', label: 'User', description: 'Basic access' },
    { value: 'builder', label: 'Builder', description: 'Can view builder tasks' },
    { value: 'supervisor', label: 'Supervisor', description: 'Can view supervisor tasks' },
    { value: 'estimator', label: 'Estimator', description: 'Can edit schedules' },
    { value: 'product_owner', label: 'Product Owner', description: 'Can create templates and edit schedules' },
    { value: 'admin', label: 'Admin', description: 'Full system access' }
  ]

  const assignableRoles = [
    { value: '', label: 'None', description: 'No group assignment' },
    { value: 'admin', label: 'Admin', description: 'Administrative tasks' },
    { value: 'sales', label: 'Sales', description: 'Sales team' },
    { value: 'site', label: 'Site', description: 'Site management' },
    { value: 'supervisor', label: 'Supervisor', description: 'Supervisor tasks' },
    { value: 'builder', label: 'Builder', description: 'Builder tasks' },
    { value: 'estimator', label: 'Estimator', description: 'Estimating tasks' }
  ]

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        assigned_role: user.assigned_role || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    try {
      const response = await api.patch(`/api/v1/users/${user.id}`, {
        user: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          assigned_role: formData.assigned_role || null
        }
      })

      if (response.success) {
        onUserUpdated()
        handleClose()
      } else {
        setErrors(response.errors || ['Failed to update user'])
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      setErrors([error.response?.data?.error || 'Failed to update user'])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      assigned_role: ''
    })
    setErrors([])
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit User
            </h3>
            <button
              onClick={handleClose}
              className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {errors.length > 0 && (
              <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  id="edit-email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-assigned-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Assignment
                </label>
                <select
                  id="edit-assigned-role"
                  value={formData.assigned_role}
                  onChange={(e) => setFormData({ ...formData, assigned_role: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {assignableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Assign user to a team/group for task assignment in schedules
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
