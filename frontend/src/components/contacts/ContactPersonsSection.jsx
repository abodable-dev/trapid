import { useState, useEffect } from 'react'
import { TrashIcon, PlusIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'

export default function ContactPersonsSection({ contact, contactPersons = [], onUpdate, isEditMode }) {
  const [editingPerson, setEditingPerson] = useState(null)
  const [availableRoles, setAvailableRoles] = useState([])
  const [showCustomRole, setShowCustomRole] = useState({})

  useEffect(() => {
    fetchRoles()
  }, [])

  // Auto-open add form when there are no contact persons and in edit mode
  useEffect(() => {
    if (contactPersons.length === 0 && isEditMode && !editingPerson) {
      startAdding()
    }
  }, [contactPersons.length, isEditMode, editingPerson])

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/v1/contact_roles')
      setAvailableRoles(response.filter(role => role.active))
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  // Get roles organized by contact type
  const getOrganizedRoles = () => {
    if (!contact || !contact.contact_types || contact.contact_types.length === 0) {
      return availableRoles
    }

    const contactTypes = contact.contact_types
    const organized = []

    // Add shared roles first (roles with empty contact_types array)
    const sharedRoles = availableRoles.filter(role => !role.contact_types || role.contact_types.length === 0)
    if (sharedRoles.length > 0) {
      organized.push({ type: 'shared', label: 'All Types', roles: sharedRoles })
    }

    // Add type-specific roles (roles that include this contact type)
    contactTypes.forEach(type => {
      const typeRoles = availableRoles.filter(role => role.contact_types && role.contact_types.includes(type))
      if (typeRoles.length > 0) {
        const typeLabels = {
          customer: 'Customer',
          supplier: 'Supplier',
          sales: 'Sales',
          land_agent: 'Land Agent'
        }
        organized.push({ type, label: typeLabels[type] || type, roles: typeRoles })
      }
    })

    return organized
  }

  const startEditing = (person) => {
    if (!isEditMode) return
    setEditingPerson({ ...person })
  }

  const startAdding = () => {
    // Create a new person and immediately put it into edit mode
    const newPersonData = {
      id: `new-${Date.now()}`, // Temporary ID for new person
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      role: '',
      include_in_emails: true,
      is_primary: contactPersons.length === 0,
      _isNew: true // Flag to indicate this is a new person
    }
    setEditingPerson(newPersonData)
  }

  const handleRoleChange = (person, value) => {
    const key = person.id

    if (value === 'Other') {
      setShowCustomRole(prev => ({ ...prev, [key]: true }))
      setEditingPerson(prev => ({ ...prev, role: '' }))
    } else {
      setShowCustomRole(prev => ({ ...prev, [key]: false }))
      setEditingPerson(prev => ({ ...prev, role: value }))
    }
  }

  const cancelEditing = () => {
    setEditingPerson(null)
  }

  const savePerson = async (person) => {
    try {
      // Check if this is a new person by the _isNew flag
      const isNew = person._isNew

      // Remove the temporary fields before saving
      const { _isNew, ...personData } = person

      const updatedPersons = isNew
        ? [...contactPersons, personData]  // New person without id
        : contactPersons.map(p => p.id === person.id ? { ...personData, id: person.id } : p)  // Existing person keeps id

      await onUpdate(updatedPersons)
      cancelEditing()
    } catch (error) {
      console.error('Failed to save person:', error)
      alert('Failed to save contact person. Please try again.')
    }
  }

  const deletePerson = async (personId) => {
    if (!confirm('Are you sure you want to delete this contact person?')) return

    try {
      // Mark the person for destruction using Rails nested attributes convention
      const updatedPersons = contactPersons.map(p =>
        p.id === personId ? { ...p, _destroy: true } : p
      )
      await onUpdate(updatedPersons)
    } catch (error) {
      console.error('Failed to delete person:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Contact Persons
          <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
        </h2>
        {!editingPerson?._isNew && (
          <button
            onClick={startAdding}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
          >
            <PlusIcon className="h-4 w-4" />
            Add Person
          </button>
        )}
      </div>

      {contactPersons.length === 0 && !editingPerson && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No contact persons added yet</p>
      )}

      <div className="space-y-4">
        {contactPersons.filter(p => !p._destroy).map((person) => (
          <div key={person.id} className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
            {editingPerson?.id === person.id ? (
              // Edit mode - with icons, labels, and badges matching display mode
              <div className="relative">
                {/* Action buttons - positioned absolute top-right */}
                <div className="absolute top-0 right-0 flex gap-2">
                  <button
                    onClick={() => savePerson(editingPerson)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => deletePerson(person.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                    title="Delete contact person"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 pr-44">
                  {/* Name */}
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={editingPerson.first_name || ''}
                          onChange={(e) => setEditingPerson(prev => ({ ...prev, first_name: e.target.value }))}
                          className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={editingPerson.last_name || ''}
                          onChange={(e) => setEditingPerson(prev => ({ ...prev, last_name: e.target.value }))}
                          className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        {editingPerson.is_primary && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                      </div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={editingPerson.email || ''}
                        onChange={(e) => setEditingPerson(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-blue-600 dark:text-blue-400"
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                        <XMarkIcon className="h-4 w-4 text-red-500 dark:text-red-400" title="Does not sync to Xero" />
                      </div>
                      <input
                        type="tel"
                        placeholder="Mobile number"
                        value={editingPerson.mobile || ''}
                        onChange={(e) => setEditingPerson(prev => ({ ...prev, mobile: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-start gap-3">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                        <XMarkIcon className="h-4 w-4 text-red-500 dark:text-red-400" title="Does not sync to Xero" />
                      </div>
                      {showCustomRole[editingPerson.id] || (editingPerson.role && !availableRoles.find(r => r.name === editingPerson.role)) ? (
                        <input
                          type="text"
                          placeholder="Enter custom role"
                          value={editingPerson.role || ''}
                          onChange={(e) => setEditingPerson(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <select
                          value={editingPerson.role || ''}
                          onChange={(e) => handleRoleChange(editingPerson, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select role...</option>
                          {getOrganizedRoles().length > 0 && Array.isArray(getOrganizedRoles()[0].roles) ? (
                            // Organized by type
                            getOrganizedRoles().map(group => (
                              <optgroup key={group.type} label={group.label}>
                                {group.roles.map(role => (
                                  <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                              </optgroup>
                            ))
                          ) : (
                            // Flat list
                            getOrganizedRoles().map(role => (
                              <option key={role.id} value={role.name}>{role.name}</option>
                            ))
                          )}
                          <option value="Other">Other (custom)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Email Preferences */}
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email Preferences</p>
                        <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={editingPerson.include_in_emails}
                            onChange={(e) => setEditingPerson(prev => ({ ...prev, include_in_emails: e.target.checked }))}
                            className="rounded-md"
                          />
                          <span>Include in automated emails</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={editingPerson.is_primary}
                            onChange={(e) => setEditingPerson(prev => ({ ...prev, is_primary: e.target.checked }))}
                            className="rounded-md"
                          />
                          <span>Primary contact</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Display mode - matching Contact Information section style
              <div className="relative">
                {/* Action buttons - positioned absolute top-right when in edit mode */}
                {isEditMode && (
                  <div className="absolute top-0 right-0 flex gap-2">
                    {!person.is_primary && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            const updatedPersons = contactPersons.map(p =>
                              p.id === person.id ? { ...p, is_primary: true } : p
                            )
                            await onUpdate(updatedPersons)
                          } catch (error) {
                            console.error('Failed to update primary contact:', error)
                            alert('Failed to update primary contact')
                          }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 whitespace-nowrap"
                        title="Make primary contact"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePerson(person.id)
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      title="Delete contact person"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Contact person info - matching Contact Information layout */}
                <div
                  className={`space-y-4 pr-16 ${isEditMode ? 'cursor-pointer' : ''}`}
                  onClick={() => isEditMode && startEditing(person)}
                >
                  {/* Name */}
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                      </div>
                      <div
                        className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}
                      >
                        <p className={`text-gray-900 dark:text-white flex-1 ${isEditMode ? 'border-b-2 border-dashed border-blue-400' : ''}`}>
                          {person.first_name} {person.last_name}
                          {person.is_primary && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                              Primary
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                      </div>
                      <div
                        className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}
                      >
                        {person.email ? (
                          <a
                            href={`mailto:${person.email}`}
                            className={`text-blue-600 hover:text-blue-700 dark:text-blue-400 flex-1 ${isEditMode ? 'border-b-2 border-dashed border-blue-400' : ''}`}
                            onClick={(e) => !isEditMode && e.stopPropagation()}
                          >
                            {person.email}
                          </a>
                        ) : (
                          <p className={`text-gray-900 dark:text-white flex-1 ${isEditMode ? 'border-b-2 border-dashed border-blue-400' : ''}`}>-</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                        <XMarkIcon className="h-4 w-4 text-red-500 dark:text-red-400" title="Does not sync to Xero" />
                      </div>
                      <div
                        className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}
                      >
                        <p className={`text-gray-900 dark:text-white flex-1 ${isEditMode ? 'border-b-2 border-dashed border-blue-400' : ''}`}>
                          {person.mobile || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-start gap-3">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                        <XMarkIcon className="h-4 w-4 text-red-500 dark:text-red-400" title="Does not sync to Xero" />
                      </div>
                      <div
                        className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}
                      >
                        <p className={`text-gray-900 dark:text-white flex-1 ${isEditMode ? 'border-b-2 border-dashed border-blue-400' : ''}`}>
                          {person.role || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Include in emails */}
                  {person.include_in_emails && (
                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email Preferences</p>
                          <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                        </div>
                        <p className="text-gray-900 dark:text-white">Included in automated emails</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New person in edit mode */}
        {editingPerson?._isNew && (
          <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              {/* Action buttons - positioned absolute top-right */}
              <div className="absolute top-0 right-0 flex gap-2">
                <button
                  onClick={() => savePerson(editingPerson)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Add
                </button>
                <button
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Cancel
                </button>
              </div>

              <div className="space-y-4 pr-44">
                {/* Name */}
                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={editingPerson.first_name || ''}
                        onChange={(e) => setEditingPerson(prev => ({ ...prev, first_name: e.target.value }))}
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={editingPerson.last_name || ''}
                        onChange={(e) => setEditingPerson(prev => ({ ...prev, last_name: e.target.value }))}
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      {editingPerson.is_primary && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={editingPerson.email || ''}
                      onChange={(e) => setEditingPerson(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-blue-600 dark:text-blue-400"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                      <XMarkIcon className="h-4 w-4 text-red-500 dark:text-red-400" title="Does not sync to Xero" />
                    </div>
                    <input
                      type="tel"
                      placeholder="Mobile number"
                      value={editingPerson.mobile || ''}
                      onChange={(e) => setEditingPerson(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-3">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                      <XMarkIcon className="h-4 w-4 text-red-500 dark:text-red-400" title="Does not sync to Xero" />
                    </div>
                    {showCustomRole[editingPerson.id] || (editingPerson.role && !availableRoles.find(r => r.name === editingPerson.role)) ? (
                      <input
                        type="text"
                        placeholder="Enter custom role"
                        value={editingPerson.role || ''}
                        onChange={(e) => setEditingPerson(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <select
                        value={editingPerson.role || ''}
                        onChange={(e) => handleRoleChange(editingPerson, e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select role...</option>
                        {getOrganizedRoles().length > 0 && Array.isArray(getOrganizedRoles()[0].roles) ? (
                          // Organized by type
                          getOrganizedRoles().map(group => (
                            <optgroup key={group.type} label={group.label}>
                              {group.roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                              ))}
                            </optgroup>
                          ))
                        ) : (
                          // Flat list
                          getOrganizedRoles().map(role => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                          ))
                        )}
                        <option value="Other">Other (custom)</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Email Preferences */}
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Preferences</p>
                      <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={editingPerson.include_in_emails}
                          onChange={(e) => setEditingPerson(prev => ({ ...prev, include_in_emails: e.target.checked }))}
                          className="rounded-md"
                        />
                        <span>Include in automated emails</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={editingPerson.is_primary}
                          onChange={(e) => setEditingPerson(prev => ({ ...prev, is_primary: e.target.checked }))}
                          className="rounded-md"
                        />
                        <span>Primary contact</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
