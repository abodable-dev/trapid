import { useState, useEffect } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

const CONTACT_TYPES = [
  { value: 'customer', label: 'Customer', tabLabel: 'Customer' },
  { value: 'supplier', label: 'Supplier', tabLabel: 'Supplier' },
  { value: 'sales', label: 'Sales', tabLabel: 'Sales' },
  { value: 'land_agent', label: 'Land Agent', tabLabel: 'Land Agent' }
]

export default function ContactRolesManagement() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [newRoleTypes, setNewRoleTypes] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)

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
          contact_types: newRoleTypes,
          active: true
        }
      })
      setRoles([...roles, response])
      setNewRole('')
      setNewRoleTypes([])
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add role:', error)
      alert(error.message || 'Failed to add role')
    }
  }

  const handleOpenAddForm = () => {
    // Pre-select the current tab's contact type
    const currentContactType = CONTACT_TYPES[selectedTabIndex].value
    setNewRoleTypes(currentContactType ? [currentContactType] : [])
    setShowAddForm(true)
  }

  const handleCancelAddForm = () => {
    setShowAddForm(false)
    setNewRole('')
    setNewRoleTypes([])
  }

  const handleUpdateRole = async (role) => {
    try {
      const response = await api.patch(`/api/v1/contact_roles/${role.id}`, {
        contact_role: {
          name: role.name,
          contact_types: role.contact_types || [],
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

  // Filter roles by contact type for current tab
  // Roles with empty contact_types array appear in ALL tabs (universal roles)
  const getFilteredRoles = (contactTypeValue) => {
    return roles.filter(role => {
      // Show role if it has no types (universal) OR includes this specific type
      return (!role.contact_types || role.contact_types.length === 0) ||
             (role.contact_types && role.contact_types.includes(contactTypeValue))
    })
  }

  // Render a table for a specific contact type
  const renderRolesTable = (contactTypeValue) => {
    const filteredRoles = getFilteredRoles(contactTypeValue)
    const currentType = CONTACT_TYPES.find(t => t.value === contactTypeValue)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {currentType.label} Roles
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Roles shown here are available for {currentType.label.toLowerCase()} contacts. Universal roles (with no types assigned) appear in all tabs.
            </p>
          </div>
          {!showAddForm && (
            <button
              onClick={handleOpenAddForm}
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
              New Role
            </label>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
                placeholder="e.g., Project Manager"
                className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">Available for:</div>
                <div className="space-y-1">
                  {CONTACT_TYPES.map(type => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRoleTypes.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...newRoleTypes, type.value]
                            : newRoleTypes.filter(t => t !== type.value)
                          setNewRoleTypes(newTypes)
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-1 text-gray-500 dark:text-gray-500 italic">
                  {newRoleTypes.length === 0 && '(None selected = Universal role for all types)'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddRole}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                >
                  <CheckIcon className="h-4 w-4" />
                  Add
                </button>
                <button
                  onClick={handleCancelAddForm}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roles table */}
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
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No roles defined yet. Add your first {currentType.label.toLowerCase()} role to get started.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className={!role.active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4">
                      {editingRole?.id === role.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateRole(editingRole)}
                            className="w-full px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            autoFocus
                          />
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <div className="font-medium mb-1">Available for:</div>
                            <div className="space-y-1">
                              {CONTACT_TYPES.filter(t => t.value !== '').map(type => (
                                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editingRole.contact_types?.includes(type.value) || false}
                                    onChange={(e) => {
                                      const currentTypes = editingRole.contact_types || []
                                      const newTypes = e.target.checked
                                        ? [...currentTypes, type.value]
                                        : currentTypes.filter(t => t !== type.value)
                                      setEditingRole({ ...editingRole, contact_types: newTypes })
                                    }}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span>{type.label}</span>
                                </label>
                              ))}
                            </div>
                            <div className="mt-1 text-gray-500 dark:text-gray-500 italic">
                              {(!editingRole.contact_types || editingRole.contact_types.length === 0) && '(None selected = Universal role for all types)'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(!role.contact_types || role.contact_types.length === 0)
                              ? 'Universal (All Types)'
                              : role.contact_types.map(t => CONTACT_TYPES.find(ct => ct.value === t)?.label).join(', ')
                            }
                          </div>
                        </div>
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
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Contact Person Roles
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage roles for contact persons by type. Universal roles (with no types assigned) appear in all tabs, while type-specific roles only appear for their designated contact types.
        </p>
      </div>

      <TabList className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
        {CONTACT_TYPES.map((type, index) => {
          const count = getFilteredRoles(type.value).length
          return (
            <Tab
              key={type.value || 'shared'}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {({ selected }) => (
                <span className="flex items-center justify-center gap-2">
                  {type.tabLabel}
                  <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold
                    ${
                      selected
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`
                  }>
                    {count}
                  </span>
                </span>
              )}
            </Tab>
          )
        })}
      </TabList>

      <TabPanels>
        {CONTACT_TYPES.map((type) => (
          <TabPanel key={type.value || 'shared'}>
            {renderRolesTable(type.value)}
          </TabPanel>
        ))}
      </TabPanels>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Roles can be assigned to multiple contact types by editing them and checking the desired types. Roles with no types selected become universal and appear in all tabs. Inactive roles won't appear in dropdowns but existing contact persons will still display them.
        </p>
      </div>
    </TabGroup>
  )
}
