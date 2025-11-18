import { useEffect, useState } from 'react'
import { api } from '../api'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Toast from '../components/Toast'

export default function MeetingTypesPage() {
  const [meetingTypes, setMeetingTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedType, setSelectedType] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadMeetingTypes()
  }, [])

  const loadMeetingTypes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/meeting_types')

      if (response.success) {
        setMeetingTypes(response.data || [])
      } else {
        setError(response.error || 'Failed to load meeting types')
      }
    } catch (err) {
      console.error('Error loading meeting types:', err)
      setError('Failed to load meeting types')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (meetingType) => {
    try {
      const response = await api.patch(`/api/v1/meeting_types/${meetingType.id}`, {
        meeting_type: {
          is_active: !meetingType.is_active
        }
      })

      if (response.success) {
        setToast({
          type: 'success',
          message: `Meeting type ${meetingType.is_active ? 'deactivated' : 'activated'}`
        })
        loadMeetingTypes()
      } else {
        setToast({ type: 'error', message: response.error || 'Failed to update meeting type' })
      }
    } catch (err) {
      console.error('Error updating meeting type:', err)
      setToast({ type: 'error', message: 'Failed to update meeting type' })
    }
  }

  const handleDeleteType = async (meetingType) => {
    if (meetingType.is_system_default) {
      setToast({ type: 'error', message: 'Cannot delete system default meeting type' })
      return
    }

    if (!confirm(`Are you sure you want to delete "${meetingType.name}"?`)) return

    try {
      const response = await api.delete(`/api/v1/meeting_types/${meetingType.id}`)

      if (response.success) {
        setToast({ type: 'success', message: 'Meeting type deleted successfully' })
        loadMeetingTypes()
        if (selectedType?.id === meetingType.id) {
          setSelectedType(null)
        }
      } else {
        setToast({ type: 'error', message: response.error || 'Failed to delete meeting type' })
      }
    } catch (err) {
      console.error('Error deleting meeting type:', err)
      setToast({ type: 'error', message: 'Failed to delete meeting type' })
    }
  }

  const getCategoryBadgeColor = (category) => {
    const colors = {
      sales: 'bg-blue-100 text-blue-800',
      construction: 'bg-orange-100 text-orange-800',
      board: 'bg-purple-100 text-purple-800',
      safety: 'bg-red-100 text-red-800',
      team: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const categories = [...new Set(meetingTypes.map(t => t.category).filter(Boolean))]

  const filteredMeetingTypes = meetingTypes.filter(type => {
    // Category filter
    if (filterCategory !== 'all' && type.category !== filterCategory) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        type.name.toLowerCase().includes(query) ||
        type.description?.toLowerCase().includes(query) ||
        type.category?.toLowerCase().includes(query)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading meeting types...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meeting Types Configuration</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure meeting types with specific rules, participants, and requirements
            </p>
          </div>
          <button
            onClick={() => setToast({ type: 'info', message: 'Create custom meeting type coming soon' })}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Meeting Type
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search meeting types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meeting Types List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Meeting Types ({filteredMeetingTypes.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredMeetingTypes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No meeting types match your filters</p>
              </div>
            ) : (
              filteredMeetingTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-4 cursor-pointer transition-colors ${
                    selectedType?.id === type.id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {type.name}
                        </h4>
                        {type.is_system_default && (
                          <ShieldCheckIcon className="h-4 w-4 text-gray-400" title="System Default" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {type.category && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryBadgeColor(type.category)}`}>
                            {type.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {type.default_duration_minutes} min
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {type.description}
                      </p>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleActive(type)
                        }}
                        className={`p-1.5 rounded ${
                          type.is_active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={type.is_active ? 'Active' : 'Inactive'}
                      >
                        {type.is_active ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <XCircleIcon className="h-5 w-5" />
                        )}
                      </button>

                      {!type.is_system_default && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteType(type)
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Meeting Type Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {selectedType ? selectedType.name : 'Details'}
            </h3>
          </div>

          {!selectedType ? (
            <div className="p-8 text-center text-gray-500">
              <p>Select a meeting type to view details</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Description */}
              <div className="px-4 py-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedType.description || 'No description'}</p>
              </div>

              {/* Duration & Participants */}
              <div className="px-4 py-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Duration & Participants
                </h4>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Default Duration:</dt>
                    <dd className="font-medium">{selectedType.default_duration_minutes} minutes</dd>
                  </div>
                  {selectedType.minimum_participants && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Min Participants:</dt>
                      <dd className="font-medium">{selectedType.minimum_participants}</dd>
                    </div>
                  )}
                  {selectedType.maximum_participants && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Max Participants:</dt>
                      <dd className="font-medium">{selectedType.maximum_participants}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Required Participants */}
              {selectedType.required_participant_types?.length > 0 && (
                <div className="px-4 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    Required Participants
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.required_participant_types.map((type, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Participants */}
              {selectedType.optional_participant_types?.length > 0 && (
                <div className="px-4 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Optional Participants</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.optional_participant_types.map((type, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Default Agenda */}
              {selectedType.default_agenda_items?.length > 0 && (
                <div className="px-4 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    Default Agenda
                  </h4>
                  <ol className="space-y-2">
                    {selectedType.default_agenda_items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{idx + 1}. {item.title}</span>
                        <span className="text-gray-500">{item.duration_minutes} min</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Required Fields */}
              {selectedType.required_fields?.length > 0 && (
                <div className="px-4 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Required Fields</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.required_fields.map((field, idx) => (
                      <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {selectedType.custom_fields?.length > 0 && (
                <div className="px-4 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Fields</h4>
                  <dl className="space-y-2">
                    {selectedType.custom_fields.map((field, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <dt className="text-gray-600">{field.label}:</dt>
                        <dd className="font-medium text-gray-900">{field.type}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Required Documents */}
              {selectedType.required_documents?.length > 0 && (
                <div className="px-4 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Required Documents</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedType.required_documents.map((doc, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notifications */}
              {selectedType.notification_settings && (
                <div className="px-4 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <BellIcon className="h-4 w-4" />
                    Notifications
                  </h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Send Reminder:</dt>
                      <dd className="font-medium">
                        {selectedType.notification_settings.send_reminder ? 'Yes' : 'No'}
                      </dd>
                    </div>
                    {selectedType.notification_settings.reminder_hours && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Reminder Before:</dt>
                        <dd className="font-medium">{selectedType.notification_settings.reminder_hours} hours</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
