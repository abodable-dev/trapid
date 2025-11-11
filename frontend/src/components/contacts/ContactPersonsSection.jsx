import { useState } from 'react'
import { UserCircleIcon, PencilIcon, TrashIcon, PlusIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'

export default function ContactPersonsSection({ contactPersons = [], onUpdate, isEditMode, contactId }) {
  const [editingPerson, setEditingPerson] = useState(null)
  const [newPerson, setNewPerson] = useState(null)

  const startEditing = (person) => {
    if (!isEditMode) return
    setEditingPerson({ ...person })
  }

  const startAdding = () => {
    setNewPerson({
      first_name: '',
      last_name: '',
      email: '',
      include_in_emails: true,
      is_primary: contactPersons.length === 0
    })
  }

  const cancelEditing = () => {
    setEditingPerson(null)
    setNewPerson(null)
  }

  const savePerson = async (person, isNew = false) => {
    try {
      const updatedPersons = isNew
        ? [...contactPersons, person]
        : contactPersons.map(p => p.id === person.id ? person : p)

      await onUpdate(updatedPersons)
      cancelEditing()
    } catch (error) {
      console.error('Failed to save person:', error)
    }
  }

  const deletePerson = async (personId) => {
    if (!confirm('Are you sure you want to delete this contact person?')) return

    try {
      const updatedPersons = contactPersons.filter(p => p.id !== personId)
      await onUpdate(updatedPersons)
    } catch (error) {
      console.error('Failed to delete person:', error)
    }
  }

  const primaryPerson = contactPersons.find(p => p.is_primary)

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <UserCircleIcon className="h-5 w-5" />
          Contact Persons
          <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
        </h3>
        {isEditMode && (
          <button
            onClick={startAdding}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add Person
          </button>
        )}
      </div>

      {contactPersons.length === 0 && !newPerson && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No contact persons</p>
      )}

      <div className="space-y-3">
        {contactPersons.map((person) => (
          <div key={person.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {editingPerson?.id === person.id ? (
              // Edit mode
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                      First Name
                      <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                    </label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={editingPerson.first_name || ''}
                      onChange={(e) => setEditingPerson({ ...editingPerson, first_name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Last Name
                      <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                    </label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editingPerson.last_name || ''}
                      onChange={(e) => setEditingPerson({ ...editingPerson, last_name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Email
                    <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={editingPerson.email || ''}
                    onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingPerson.include_in_emails}
                      onChange={(e) => setEditingPerson({ ...editingPerson, include_in_emails: e.target.checked })}
                      className="rounded"
                    />
                    Include in emails
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingPerson.is_primary}
                      onChange={(e) => setEditingPerson({ ...editingPerson, is_primary: e.target.checked })}
                      className="rounded"
                    />
                    Primary contact
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => savePerson(editingPerson)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {person.first_name} {person.last_name}
                    </p>
                    {person.is_primary && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                        Primary
                      </span>
                    )}
                  </div>
                  {person.email && (
                    <a href={`mailto:${person.email}`} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      {person.email}
                    </a>
                  )}
                  {person.include_in_emails && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Included in emails</p>
                  )}
                </div>
                {isEditMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(person)}
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePerson(person.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add new person form */}
        {newPerson && (
          <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/10">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">New Contact Person</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    First Name
                    <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newPerson.first_name}
                    onChange={(e) => setNewPerson({ ...newPerson, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Last Name
                    <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newPerson.last_name}
                    onChange={(e) => setNewPerson({ ...newPerson, last_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Email
                  <ShieldCheckIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" title="Syncs with Xero" />
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newPerson.include_in_emails}
                    onChange={(e) => setNewPerson({ ...newPerson, include_in_emails: e.target.checked })}
                    className="rounded"
                  />
                  Include in emails
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newPerson.is_primary}
                    onChange={(e) => setNewPerson({ ...newPerson, is_primary: e.target.checked })}
                    className="rounded"
                  />
                  Primary contact
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => savePerson(newPerson, true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Add
                </button>
                <button
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <XCircleIcon className="h-4 w-4" />
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
