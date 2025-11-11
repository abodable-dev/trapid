import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline'
import { api } from '../api'
import { formatCurrency, formatPercentage } from '../utils/formatters'
import { POSummaryCards, POTable, PurchaseOrderModal } from '../components/purchase-orders'
import JobDocumentsTab from '../components/documents/JobDocumentsTab'
import TeamSettings from '../components/job-detail/TeamSettings'
import EstimatesTab from '../components/estimates/EstimatesTab'
import ScheduleMasterTab from '../components/schedule-master/ScheduleMasterTab'
import DocumentationTab from '../components/documentation/DocumentationTab'
import SetupGuideModal from '../components/documentation/SetupGuideModal'
import JobMessagesTab from '../components/messages/JobMessagesTab'
import JobEmailsTab from '../components/emails/JobEmailsTab'

const tabs = [
  { name: 'Overview' },
  { name: 'Purchase Orders' },
  { name: 'Estimates' },
  { name: 'Activity' },
  { name: 'Budget' },
  { name: 'Schedule Master' },
  { name: 'Documents' },
  { name: 'Messages' },
  { name: 'Emails' },
  { name: 'Team' },
  { name: 'Settings' },
  { name: 'Documentation' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedJob, setEditedJob] = useState(null)
  const [saving, setSaving] = useState(false)

  const activeTab = searchParams.get('tab') || 'Overview'

  // Purchase Orders state
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [showPOModal, setShowPOModal] = useState(false)
  const [editingPO, setEditingPO] = useState(null)
  const [loadingPOs, setLoadingPOs] = useState(false)

  // Documentation state
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  useEffect(() => {
    loadJob()
  }, [id])

  // Check if this is the first time visiting (for setup guide)
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('trapid_setup_guide_shown')
    if (!hasSeenGuide) {
      // Show setup guide for first-time users (with a delay for better UX)
      const timer = setTimeout(() => {
        setShowSetupGuide(true)
      }, 1000)
      return () => clearTimeout(timer)
    }

    // Listen for custom event to open setup guide
    const handleOpenSetupGuide = () => {
      setShowSetupGuide(true)
    }
    window.addEventListener('openSetupGuide', handleOpenSetupGuide)
    return () => window.removeEventListener('openSetupGuide', handleOpenSetupGuide)
  }, [])

  const loadJob = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/constructions/${id}`)
      // API returns the construction object directly, not wrapped
      setJob(response)
      setEditedJob(response)
    } catch (err) {
      setError('Failed to load job details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedJob({ ...job })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedJob({ ...job })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put(`/api/v1/constructions/${id}`, {
        construction: editedJob
      })
      await loadJob()
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update job:', err)
      alert('Failed to update job')
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (field, value) => {
    setEditedJob(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Purchase Orders functions
  const loadPurchaseOrders = async () => {
    try {
      setLoadingPOs(true)
      const response = await api.get('/api/v1/purchase_orders', {
        params: { construction_id: id }
      })
      setPurchaseOrders(response.purchase_orders || [])
    } catch (err) {
      console.error('Failed to load purchase orders:', err)
    } finally {
      setLoadingPOs(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      // Load contacts that are marked as suppliers
      const response = await api.get('/api/v1/contacts', {
        params: {
          type: 'suppliers',
          per_page: 1000
        }
      })
      // Map contacts to match the supplier format expected by the modal
      const supplierContacts = (response.contacts || []).map(contact => ({
        id: contact.id,
        name: contact.full_name || contact.company_name || 'Unnamed Contact'
      }))
      setSuppliers(supplierContacts)
    } catch (err) {
      console.error('Failed to load suppliers:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'Purchase Orders') {
      loadPurchaseOrders()
      loadSuppliers()
    }
  }, [activeTab])

  const handleSavePO = async (poData) => {
    try {
      if (editingPO) {
        await api.put(`/api/v1/purchase_orders/${editingPO.id}`, {
          purchase_order: poData
        })
        await loadPurchaseOrders()
        setShowPOModal(false)
        setEditingPO(null)
      } else {
        const response = await api.post('/api/v1/purchase_orders', {
          purchase_order: poData
        })
        // Navigate to the new PO edit page to add line items
        navigate(`/purchase-orders/${response.id}/edit`)
      }
    } catch (err) {
      console.error('Failed to save purchase order:', err)
      // Error will be displayed by the modal
      throw err
    }
  }

  const handleEditPO = (po) => {
    setEditingPO(po)
    setShowPOModal(true)
  }

  const handleDeletePO = async (poId) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return
    try {
      await api.delete(`/api/v1/purchase_orders/${poId}`)
      await loadPurchaseOrders()
    } catch (err) {
      console.error('Failed to delete purchase order:', err)
      alert('Failed to delete purchase order')
    }
  }

  const handleApprovePO = async (poId) => {
    try {
      await api.post(`/api/v1/purchase_orders/${poId}/approve`)
      await loadPurchaseOrders()
    } catch (err) {
      console.error('Failed to approve purchase order:', err)
      alert('Failed to approve purchase order')
    }
  }

  const handleSendPO = async (poId) => {
    try {
      await api.post(`/api/v1/purchase_orders/${poId}/send_to_supplier`)
      await loadPurchaseOrders()
    } catch (err) {
      console.error('Failed to send purchase order:', err)
      alert('Failed to send purchase order')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Job not found'}</p>
            <button
              onClick={() => navigate('/active-jobs')}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Back to Active Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Contract Value',
      value: job.contract_value ? formatCurrency(job.contract_value, false) : '$0',
      icon: CurrencyDollarIcon
    },
    {
      name: 'Live Profit',
      value: job.live_profit ? formatCurrency(job.live_profit, false) : '$0',
      icon: ChartBarIcon,
      change: job.profit_percentage ? formatPercentage(job.profit_percentage, 2) : '0%',
      changeType: job.profit_percentage >= 0 ? 'positive' : 'negative'
    },
    {
      name: 'Stage',
      value: job.stage || 'Not Set',
      icon: DocumentTextIcon
    },
    {
      name: 'Status',
      value: job.status || 'Unknown',
      icon: BriefcaseIcon
    },
  ]

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-8 py-6">
            <button
              onClick={() => navigate('/active-jobs')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
            >
              ← Back to Active Jobs
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Construction Job #{job.id}
                </p>
              </div>
              <button
                onClick={() => setShowSetupGuide(true)}
                className="flex items-center justify-center h-10 w-10 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                title="Help & Setup Guide"
              >
                <QuestionMarkCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 -mb-px">
              <nav aria-label="Tabs" className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setSearchParams({ tab: tab.name })}
                    className={classNames(
                      activeTab === tab.name
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                      'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium'
                    )}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-3 py-3 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dt className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
                    <dd className="flex items-baseline mt-1">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                      {stat.change && (
                        <div
                          className={classNames(
                            stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                            'ml-2 flex items-baseline text-xs font-semibold'
                          )}
                        >
                          {stat.change}
                        </div>
                      )}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Job Details
                    </h3>
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
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

                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editedJob.title || ''}
                          onChange={(e) => handleFieldChange('title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <input
                          type="text"
                          value={editedJob.status || ''}
                          onChange={(e) => handleFieldChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Stage
                        </label>
                        <input
                          type="text"
                          value={editedJob.stage || ''}
                          onChange={(e) => handleFieldChange('stage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contract Value
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editedJob.contract_value || ''}
                          onChange={(e) => handleFieldChange('contract_value', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Live Profit
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Auto-calculated)</span>
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                          {editedJob.live_profit ? formatCurrency(editedJob.live_profit, false) : '-'}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Contract Value - Total PO Costs
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Profit Percentage
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Auto-calculated)</span>
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                          {editedJob.profit_percentage ? formatPercentage(editedJob.profit_percentage, 2) : '-'}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          (Live Profit / Contract Value) × 100
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          TED Number
                        </label>
                        <input
                          type="text"
                          value={editedJob.ted_number || ''}
                          onChange={(e) => handleFieldChange('ted_number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Certifier Job No
                        </label>
                        <input
                          type="text"
                          value={editedJob.certifier_job_no || ''}
                          onChange={(e) => handleFieldChange('certifier_job_no', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={editedJob.start_date || ''}
                          onChange={(e) => handleFieldChange('start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.title || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.status || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stage</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.stage || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract Value</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {job.contract_value ? formatCurrency(job.contract_value, false) : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Live Profit</dt>
                        <dd className={`mt-1 text-sm font-medium ${
                          job.live_profit >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {job.live_profit ? formatCurrency(job.live_profit, false) : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Percentage</dt>
                        <dd className={`mt-1 text-sm font-medium ${
                          job.profit_percentage >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {job.profit_percentage ? formatPercentage(job.profit_percentage, 2) : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">TED Number</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.ted_number || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Certifier Job No</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.certifier_job_no || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {job.start_date ? new Date(job.start_date).toLocaleDateString() : '-'}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Purchase Orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Purchase Orders
                </h3>
                <button
                  onClick={() => {
                    setEditingPO(null)
                    setShowPOModal(true)
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Purchase Order
                </button>
              </div>

              {loadingPOs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  <POSummaryCards purchaseOrders={purchaseOrders} />
                  <POTable
                    purchaseOrders={purchaseOrders}
                    onEdit={handleEditPO}
                    onDelete={handleDeletePO}
                    onApprove={handleApprovePO}
                    onSend={handleSendPO}
                  />
                </>
              )}

              <PurchaseOrderModal
                isOpen={showPOModal}
                onClose={() => {
                  setShowPOModal(false)
                  setEditingPO(null)
                }}
                onSave={handleSavePO}
                purchaseOrder={editingPO}
                suppliers={suppliers}
                constructionId={id}
                construction={job}
              />
            </div>
          )}

          {activeTab === 'Estimates' && (
            <EstimatesTab jobId={id} />
          )}

          {activeTab === 'Activity' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Activity tracking coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Budget' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Budget Management
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Budget tracking coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Schedule Master' && (
            <ScheduleMasterTab constructionId={id} />
          )}

          {activeTab === 'Documents' && (
            <JobDocumentsTab jobId={id} jobTitle={job?.title} />
          )}

          {activeTab === 'Messages' && (
            <JobMessagesTab constructionId={id} />
          )}

          {activeTab === 'Emails' && (
            <JobEmailsTab constructionId={id} />
          )}

          {activeTab === 'Team' && (
            <TeamSettings
              job={job}
              onSave={async (teamData) => {
                try {
                  setSaving(true)
                  await api.put(`/api/v1/constructions/${id}`, {
                    construction: teamData
                  })
                  await loadJob()
                } catch (err) {
                  console.error('Failed to update team settings:', err)
                  alert('Failed to update team settings')
                } finally {
                  setSaving(false)
                }
              }}
              saving={saving}
            />
          )}

          {activeTab === 'Settings' && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Job Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Settings management coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Documentation' && (
            <DocumentationTab />
          )}
        </div>

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />
      </div>
  )
}
