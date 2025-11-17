import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const CATEGORIES = [
  { value: 'bible', label: '📖 Bible', emoji: '📖' },
  { value: 'teacher', label: '🔧 Teacher', emoji: '🔧' },
  { value: 'lexicon', label: '📕 Lexicon', emoji: '📕' },
]

const KNOWLEDGE_TYPES = [
  { value: 'bug', label: '🐛 Bug', emoji: '🐛' },
  { value: 'architecture', label: '🏗️ Architecture', emoji: '🏗️' },
  { value: 'test', label: '📊 Test', emoji: '📊' },
  { value: 'performance', label: '📈 Performance', emoji: '📈' },
  { value: 'dev_note', label: '🎓 Dev Note', emoji: '🎓' },
  { value: 'common_issue', label: '🔍 Common Issue', emoji: '🔍' },
  { value: 'terminology', label: '📖 Terminology', emoji: '📖' },
]

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'by_design', label: 'By Design' },
  { value: 'wont_fix', label: "Won't Fix" },
  { value: 'monitoring', label: 'Monitoring' },
]

const SEVERITIES = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function KnowledgeEntryModal({ isOpen, onClose, onSave, chapterNumber, chapterName, entry = null }) {
  const [formData, setFormData] = useState({
    category: 'lexicon',
    chapter_number: chapterNumber || 0,
    chapter_name: chapterName || '',
    entry_type: 'bug',
    title: '',
    component: '',
    description: '',
    details: '',
    examples: '',
    recommendations: '',
    rule_reference: '',
    // Bug-specific fields
    status: 'open',
    severity: 'medium',
    first_reported: '',
    last_occurred: '',
    fixed_date: '',
    // Old bug fields (for backward compatibility)
    scenario: '',
    root_cause: '',
    solution: '',
    prevention: '',
  })

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])

  useEffect(() => {
    if (entry) {
      setFormData({
        category: entry.category || 'lexicon',
        chapter_number: entry.chapter_number,
        chapter_name: entry.chapter_name,
        entry_type: entry.entry_type,
        title: entry.title,
        component: entry.component || '',
        description: entry.description || '',
        details: entry.details || '',
        examples: entry.examples || '',
        recommendations: entry.recommendations || '',
        rule_reference: entry.rule_reference || '',
        status: entry.status || 'open',
        severity: entry.severity || 'medium',
        first_reported: entry.first_reported || '',
        last_occurred: entry.last_occurred || '',
        fixed_date: entry.fixed_date || '',
        scenario: entry.scenario || '',
        root_cause: entry.root_cause || '',
        solution: entry.solution || '',
        prevention: entry.prevention || '',
      })
    } else {
      setFormData({
        category: 'lexicon',
        chapter_number: chapterNumber || 0,
        chapter_name: chapterName || '',
        entry_type: 'bug',
        title: '',
        component: '',
        description: '',
        details: '',
        examples: '',
        recommendations: '',
        rule_reference: '',
        status: 'open',
        severity: 'medium',
        first_reported: '',
        last_occurred: '',
        fixed_date: '',
        scenario: '',
        root_cause: '',
        solution: '',
        prevention: '',
      })
    }
  }, [entry, chapterNumber, chapterName, isOpen])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors([])

    try {
      await onSave(formData, entry?.id)
      onClose()
    } catch (error) {
      console.error('Failed to save knowledge entry:', error)
      setErrors(error.response?.data?.errors || ['Failed to save entry'])
    } finally {
      setSaving(false)
    }
  }

  const isBug = formData.entry_type === 'bug'

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                    {entry ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Errors */}
                  {errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                        {errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Knowledge Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Knowledge Type
                    </label>
                    <select
                      value={formData.entry_type}
                      onChange={(e) => handleChange('entry_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {KNOWLEDGE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Brief title describing this entry"
                      required
                    />
                  </div>

                  {/* Component */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Component (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.component}
                      onChange={(e) => handleChange('component', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., XeroContactSync, EstimateToPOService"
                    />
                  </div>

                  {/* Rule Reference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Related Bible Rule (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.rule_reference}
                      onChange={(e) => handleChange('rule_reference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., RULE #9.3, RULE #2.1"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Link this entry to a specific Bible rule for audit tracking
                    </p>
                  </div>

                  {/* Bug-specific fields */}
                  {isBug && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                          {STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Severity
                        </label>
                        <select
                          value={formData.severity}
                          onChange={(e) => handleChange('severity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                          {SEVERITIES.map((severity) => (
                            <option key={severity.value} value={severity.value}>
                              {severity.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Reported
                        </label>
                        <input
                          type="date"
                          value={formData.first_reported}
                          onChange={(e) => handleChange('first_reported', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Occurred
                        </label>
                        <input
                          type="date"
                          value={formData.last_occurred}
                          onChange={(e) => handleChange('last_occurred', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      {formData.status === 'fixed' && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fixed Date
                          </label>
                          <input
                            type="date"
                            value={formData.fixed_date}
                            onChange={(e) => handleChange('fixed_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Universal Content Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="General description of the issue/topic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Details
                    </label>
                    <textarea
                      value={formData.details}
                      onChange={(e) => handleChange('details', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                      placeholder="Detailed technical explanation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Examples
                    </label>
                    <textarea
                      value={formData.examples}
                      onChange={(e) => handleChange('examples', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Code examples, test scenarios, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Recommendations
                    </label>
                    <textarea
                      value={formData.recommendations}
                      onChange={(e) => handleChange('recommendations', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Best practices, solutions, workarounds"
                    />
                  </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : entry ? 'Update Entry' : 'Create Entry'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
