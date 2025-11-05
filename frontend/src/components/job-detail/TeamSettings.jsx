import { useState } from 'react'
import { UserIcon, EnvelopeIcon, PhoneIcon, CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function TeamSettings({ job, onSave, saving }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    site_supervisor_name: job?.site_supervisor_name || 'Andrew Clement',
    site_supervisor_email: job?.site_supervisor_email || '',
    site_supervisor_phone: job?.site_supervisor_phone || ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    await onSave(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      site_supervisor_name: job?.site_supervisor_name || 'Andrew Clement',
      site_supervisor_email: job?.site_supervisor_email || '',
      site_supervisor_phone: job?.site_supervisor_phone || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Team Members
          </h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Site Supervisor Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Site Supervisor
            </h4>

            {isEditing ? (
              <div className="space-y-4 ml-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.site_supervisor_name}
                    onChange={(e) => handleChange('site_supervisor_name', e.target.value)}
                    required
                    placeholder="Andrew Clement"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.site_supervisor_email}
                    onChange={(e) => handleChange('site_supervisor_email', e.target.value)}
                    placeholder="andrew@tekna.com.au"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.site_supervisor_phone}
                    onChange={(e) => handleChange('site_supervisor_phone', e.target.value)}
                    placeholder="0400 000 000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <dl className="space-y-3 ml-7">
                <div className="flex items-start">
                  <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 w-24">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Name
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {formData.site_supervisor_name || 'Andrew Clement'}
                  </dd>
                </div>
                {formData.site_supervisor_email && (
                  <div className="flex items-start">
                    <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 w-24">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      Email
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      <a
                        href={`mailto:${formData.site_supervisor_email}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {formData.site_supervisor_email}
                      </a>
                    </dd>
                  </div>
                )}
                {formData.site_supervisor_phone && (
                  <div className="flex items-start">
                    <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 w-24">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      Phone
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      <a
                        href={`tel:${formData.site_supervisor_phone}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {formData.site_supervisor_phone}
                      </a>
                    </dd>
                  </div>
                )}
                {!formData.site_supervisor_email && !formData.site_supervisor_phone && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No contact information provided. Click Edit to add email and phone.
                  </div>
                )}
              </dl>
            )}
          </div>

          {/* Future team members can be added here */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Additional team member management coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
