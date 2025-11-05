import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition, Combobox, RadioGroup } from '@headlessui/react'
import {
  XMarkIcon,
  BriefcaseIcon,
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FlagIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckIcon,
  ChevronUpDownIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import api from '../../api'

const STAGES = [
  'Planning',
  'Design',
  'Preconstruction',
  'Construction',
  'Closeout',
  'Complete',
]

const STATUSES = [
  'Active',
  'On Hold',
  'Cancelled',
  'Complete',
]

const LEAD_SOURCES = [
  'Referral',
  'Website',
  'Social Media',
  'Email Campaign',
  'Walk-in',
  'Past Client',
  'Other',
]

const LAND_STATUS_OPTIONS = [
  'Registered',
  'Not Yet Registered',
  'Unconditional',
  'Settled',
  'Under Contract',
]

export default function NewJobModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState('forward')
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    client_id: null,
    client_name: '',
    client_email: '',
    client_phone: '',
    lead_source: '',
    contract_value: '',
    start_date: '',
    end_date: '',
    site_supervisor_name: 'Andrew Clement',
    stage: 'Planning',
    status: 'Active',
    has_plans: false,
    has_engineering: false,
    has_soil_report: false,
    has_energy_report: false,
    land_status: '',
  })

  // Client lookup state
  const [clients, setClients] = useState([])
  const [clientQuery, setClientQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [loadingClients, setLoadingClients] = useState(false)

  const totalSteps = 3

  // Debounced client search
  useEffect(() => {
    if (clientQuery.length < 2) {
      setClients([])
      return
    }

    const timer = setTimeout(async () => {
      setLoadingClients(true)
      try {
        const response = await api.get(`/api/v1/contacts?search=${encodeURIComponent(clientQuery)}`)
        setClients(response.data.contacts || [])
      } catch (error) {
        console.error('Error fetching clients:', error)
        setClients([])
      } finally {
        setLoadingClients(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [clientQuery])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClientSelect = (client) => {
    if (!client) {
      setSelectedClient(null)
      setFormData(prev => ({
        ...prev,
        client_id: null,
        client_name: '',
        client_email: '',
        client_phone: ''
      }))
      return
    }

    setSelectedClient(client)
    setFormData(prev => ({
      ...prev,
      client_id: client.id,
      client_name: client.full_name || '',
      client_email: client.email || '',
      client_phone: client.mobile_phone || client.office_phone || ''
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setDirection('forward')
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setDirection('back')
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert contract_value to number if it exists
      const submitData = {
        ...formData,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : null,
      }

      await onSuccess(submitData)

      // Reset form
      setFormData({
        title: '',
        location: '',
        client_id: null,
        client_name: '',
        client_email: '',
        client_phone: '',
        lead_source: '',
        contract_value: '',
        start_date: '',
        end_date: '',
        site_supervisor_name: 'Andrew Clement',
        stage: 'Planning',
        status: 'Active',
        has_plans: false,
        has_engineering: false,
        has_soil_report: false,
        has_energy_report: false,
        land_status: '',
      })
      setSelectedClient(null)
      setClientQuery('')
      setStep(1)
      onClose()
    } catch (error) {
      console.error('Failed to create job:', error)
      alert('Failed to create job. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToNext = () => {
    if (step === 1) {
      return (
        formData.title.trim() !== '' &&
        formData.location.trim() !== '' &&
        formData.client_id !== null
      )
    }
    if (step === 2) {
      return true // All fields optional
    }
    if (step === 3) {
      return (
        formData.title.trim() !== '' &&
        formData.location.trim() !== '' &&
        formData.client_id !== null &&
        formData.site_supervisor_name.trim() !== '' &&
        formData.status.trim() !== ''
      )
    }
    return true
  }

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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                      <BriefcaseIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <Dialog.Title className="text-2xl font-bold">
                        Create New Construction Job
                      </Dialog.Title>
                      <p className="mt-1 text-indigo-100">
                        Let's get your project set up in just a few steps
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-indigo-100">Step {step} of {totalSteps}</span>
                      <span className="text-indigo-100">{Math.round((step / totalSteps) * 100)}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 overflow-hidden">
                  {/* Steps Container with Swipe Animation */}
                  <div className="relative" style={{ minHeight: '400px' }}>
                    <div className="absolute inset-0 w-full">
                      {/* Step 1: Basic Information */}
                      <div
                        className={`absolute inset-0 w-full transition-all duration-400 ease-in-out ${
                          step === 1
                            ? 'translate-x-0 opacity-100'
                            : step > 1
                            ? '-translate-x-full opacity-0'
                            : 'translate-x-full opacity-0'
                        }`}
                        style={{
                          transitionProperty: 'transform, opacity',
                          transitionDuration: '400ms',
                          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Basic Information
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Start with the essential details about this construction project
                        </p>
                      </div>

                      {/* Job Title */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2">
                            <BriefcaseIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          placeholder="e.g., Residential Build - 123 Main Street"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                          autoFocus
                          required
                        />
                      </div>

                      {/* Client Name */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                            <UserCircleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          Client Name
                        </label>
                        <input
                          type="text"
                          value={formData.client_name}
                          onChange={(e) => handleChange('client_name', e.target.value)}
                          placeholder="e.g., John Smith Properties"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>

                      {/* Location */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                            <MapPinIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          Location / Address
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          placeholder="e.g., 123 Main Street, Sydney NSW 2000"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                        )}
                      </div>

                      {/* Step 2: Financial & Timeline */}
                      <div
                        className={`absolute inset-0 w-full transition-all duration-400 ease-in-out ${
                          step === 2
                            ? 'translate-x-0 opacity-100'
                            : step > 2
                            ? '-translate-x-full opacity-0'
                            : 'translate-x-full opacity-0'
                        }`}
                        style={{
                          transitionProperty: 'transform, opacity',
                          transitionDuration: '400ms',
                          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Financial & Timeline
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Set the contract value and project timeline
                        </p>
                      </div>

                      {/* Contract Value */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
                            <CurrencyDollarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          Contract Value
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.contract_value}
                            onChange={(e) => handleChange('contract_value', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                              <CalendarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                          />
                        </div>

                        <div className="group">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                              <CalendarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            End Date
                          </label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Project Manager */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                            <UserCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          Project Manager
                        </label>
                        <input
                          type="text"
                          value={formData.project_manager}
                          onChange={(e) => handleChange('project_manager', e.target.value)}
                          placeholder="e.g., Sarah Johnson"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                        )}
                      </div>

                      {/* Step 3: Stage & Status */}
                      <div
                        className={`absolute inset-0 w-full transition-all duration-400 ease-in-out ${
                          step === 3
                            ? 'translate-x-0 opacity-100'
                            : step > 3
                            ? '-translate-x-full opacity-0'
                            : 'translate-x-full opacity-0'
                        }`}
                        style={{
                          transitionProperty: 'transform, opacity',
                          transitionDuration: '400ms',
                          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Project Status
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Define where this project is in its lifecycle
                        </p>
                      </div>

                      {/* Site Supervisor */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                            <UserCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          Site Supervisor <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.site_supervisor_name}
                          onChange={(e) => handleChange('site_supervisor_name', e.target.value)}
                          placeholder="e.g., Andrew Clement"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                          required
                        />
                      </div>

                      {/* Stage */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/30 p-2">
                            <FlagIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          Project Stage
                        </label>
                        <select
                          value={formData.stage}
                          onChange={(e) => handleChange('stage', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                        >
                          {STAGES.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="rounded-lg bg-rose-100 dark:bg-rose-900/30 p-2">
                            <ChartBarIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                          </div>
                          Project Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                          required
                        >
                          {STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      {/* Summary Card */}
                      <div className="mt-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 p-6">
                        <div className="flex items-start gap-3">
                          <CheckCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Ready to Create
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p><span className="font-medium">Job:</span> {formData.title || 'Untitled'}</p>
                              {formData.client_name && <p><span className="font-medium">Client:</span> {formData.client_name}</p>}
                              {formData.contract_value && <p><span className="font-medium">Value:</span> ${parseFloat(formData.contract_value).toLocaleString()}</p>}
                              <p><span className="font-medium">Stage:</span> {formData.stage} • <span className="font-medium">Status:</span> {formData.status}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ArrowLeftIcon className="h-4 w-4" />
                          Back
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>

                      {step < totalSteps ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!canProceedToNext()}
                          className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                        >
                          Next
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            !formData.title.trim() ||
                            !formData.site_supervisor_name.trim() ||
                            !formData.status.trim()
                          }
                          className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4" />
                              Create Job
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
