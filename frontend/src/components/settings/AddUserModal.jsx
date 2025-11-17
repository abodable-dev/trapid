import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
    assigned_role: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [roles, setRoles] = useState([])

  // Fetch roles from API (RULE #1.13 - Single Source of Truth)
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles')
        setRoles(response.data || [])
      } catch (error) {
        console.error('Failed to fetch roles:', error)
        // Fallback to default roles
        setRoles([
          { value: 'user', label: 'User' },
          { value: 'admin', label: 'Admin' }
        ])
      }
    }
    fetchRoles()
  }, [])

  const assignableRoles = [
    { value: '', label: 'None', description: 'No group assignment' },
    { value: 'admin', label: 'Admin', description: 'Administrative tasks' },
    { value: 'sales', label: 'Sales', description: 'Sales team' },
    { value: 'site', label: 'Site', description: 'Site management' },
    { value: 'supervisor', label: 'Supervisor', description: 'Supervisor tasks' },
    { value: 'builder', label: 'Builder', description: 'Builder tasks' },
    { value: 'estimator', label: 'Estimator', description: 'Estimating tasks' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    if (formData.password !== formData.password_confirmation) {
      setErrors(['Passwords do not match'])
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/api/v1/auth/signup', {
        user: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        }
      })

      if (response.success) {
        // If role or assigned_role is different from default, update them
        if (formData.role !== 'user' || formData.assigned_role) {
          await api.patch(`/api/v1/users/${response.user.id}`, {
            user: {
              role: formData.role,
              assigned_role: formData.assigned_role || null
            }
          })
        }

        onUserAdded()
        handleClose()
      } else {
        setErrors(response.errors || ['Failed to create user'])
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      setErrors([error.response?.data?.error || 'Failed to create user'])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'user',
      assigned_role: ''
    })
    setErrors([])
    onClose()
  }

  if (!isOpen) return null

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
              Add New User
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 6 characters</p>
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  id="role"
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
                <label htmlFor="assigned-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Assignment
                </label>
                <select
                  id="assigned-role"
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
                {loading ? 'Adding User...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
