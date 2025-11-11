import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import {
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ArrowLeftIcon,
  TrashIcon,
  CubeIcon,
  TagIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import ActivityTimeline from '../components/contacts/ActivityTimeline'
import LinkXeroContactModal from '../components/contacts/LinkXeroContactModal'

export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [showLinkXeroModal, setShowLinkXeroModal] = useState(false)
  const [allContacts, setAllContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSourceContact, setSelectedSourceContact] = useState('')
  const [copyingHistory, setCopyingHistory] = useState(false)
  const [copyResult, setCopyResult] = useState(null)
  const [sourceCategories, setSourceCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [removingFromCategories, setRemovingFromCategories] = useState(false)
  const [removeResult, setRemoveResult] = useState(null)
  const [currentContactCategories, setCurrentContactCategories] = useState([])
  const [selectedRemoveCategories, setSelectedRemoveCategories] = useState([])
  const [loadingCurrentCategories, setLoadingCurrentCategories] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [setAsDefaultSupplier, setSetAsDefaultSupplier] = useState(true)
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])
  const [copyMode, setCopyMode] = useState('active') // 'active', 'latest', or 'oldest'
  const [priceBookSearchTerm, setPriceBookSearchTerm] = useState('')
  const [editingPriceHistory, setEditingPriceHistory] = useState(null) // { itemId, historyId, price, date }
  const [deletingPriceHistory, setDeletingPriceHistory] = useState(null) // { itemId, historyId }
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [priceBookTab, setPriceBookTab] = useState('items') // items, activity, bulk-update
  const [bulkUpdateDate, setBulkUpdateDate] = useState(new Date().toISOString().split('T')[0])
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [abnValidation, setAbnValidation] = useState(null) // { valid, entity_name, etc. }
  const [validatingAbn, setValidatingAbn] = useState(false)
  const [editingXeroFields, setEditingXeroFields] = useState({}) // Track which Xero fields are being edited
  const [xeroFieldValues, setXeroFieldValues] = useState({}) // Temp values while editing
  const [isPageEditMode, setIsPageEditMode] = useState(false) // Global edit mode for the entire page

  useEffect(() => {
    loadContact()
    loadAllContacts()
    loadCurrentContactCategories()
  }, [id])

  // Validate ABN when contact loads
  useEffect(() => {
    if (contact?.tax_number) {
      validateAbn(contact.tax_number)
    }
  }, [contact?.tax_number])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSupplierDropdown && !event.target.closest('.supplier-search-container')) {
        setShowSupplierDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSupplierDropdown])

  const loadContact = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/contacts/${id}`)
      setContact(response.contact)
    } catch (err) {
      setError('Failed to load contact')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  const loadAllContacts = async () => {
    try {
      const response = await api.get('/api/v1/contacts?type=suppliers')
      // Filter out the current contact
      const otherContacts = response.contacts.filter(c => c.id !== parseInt(id))
      setAllContacts(otherContacts)
    } catch (err) {
      console.error('Failed to load contacts:', err)
    }
  }

  const validateAbn = async (abn) => {
    if (!abn) {
      setAbnValidation(null)
      return
    }

    try {
      setValidatingAbn(true)
      const response = await api.get(`/api/v1/contacts/validate_abn`, {
        params: { abn }
      })
      setAbnValidation(response)
    } catch (err) {
      console.error('Failed to validate ABN:', err)
      setAbnValidation({ valid: false, error: 'Validation failed' })
    } finally {
      setValidatingAbn(false)
    }
  }

  const loadSourceCategories = async (sourceId) => {
    if (!sourceId) {
      setSourceCategories([])
      setSelectedCategories([])
      return
    }

    try {
      setLoadingCategories(true)
      const response = await api.get(`/api/v1/contacts/${sourceId}/categories`)
      setSourceCategories(response.categories || [])
      // By default, select all categories
      setSelectedCategories(response.categories?.map(c => c.category) || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
      setSourceCategories([])
      setSelectedCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleSourceContactChange = (sourceId) => {
    setSelectedSourceContact(sourceId)
    setCopyResult(null)
    loadSourceCategories(sourceId)
  }

  const handleSupplierSelect = (contactId, contactName) => {
    setSelectedSourceContact(contactId)
    setSupplierSearchTerm(contactName)
    setShowSupplierDropdown(false)
    setCopyResult(null)
    loadSourceCategories(contactId)
  }

  const filteredContacts = allContacts.filter(contact =>
    contact.full_name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  )

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const toggleAllCategories = () => {
    if (selectedCategories.length === sourceCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(sourceCategories.map(c => c.category))
    }
  }

  const loadCurrentContactCategories = async () => {
    try {
      setLoadingCurrentCategories(true)
      const response = await api.get(`/api/v1/contacts/${id}/categories`)
      // Show ALL categories where this contact has any involvement (default supplier OR price histories)
      setCurrentContactCategories(response.categories || [])
    } catch (err) {
      console.error('Failed to load current contact categories:', err)
      setCurrentContactCategories([])
    } finally {
      setLoadingCurrentCategories(false)
    }
  }

  const toggleRemoveCategory = (category) => {
    setSelectedRemoveCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const toggleAllRemoveCategories = () => {
    if (selectedRemoveCategories.length === currentContactCategories.length) {
      setSelectedRemoveCategories([])
    } else {
      setSelectedRemoveCategories(currentContactCategories.map(c => c.category))
    }
  }

  const removeFromCategories = async () => {
    if (selectedRemoveCategories.length === 0) {
      alert('Please select at least one category to remove')
      return
    }

    const categoryMsg = selectedRemoveCategories.length === 1
      ? selectedRemoveCategories[0]
      : `${selectedRemoveCategories.length} categories`

    if (!confirm(`Are you sure? This will remove this contact as the default supplier AND delete all their price histories for items in ${categoryMsg}.`)) {
      return
    }

    try {
      setRemovingFromCategories(true)
      setRemoveResult(null)
      const response = await api.delete(`/api/v1/contacts/${id}/remove_from_categories`, {
        categories: selectedRemoveCategories
      })

      setRemoveResult({
        success: true,
        message: response.message,
        removed_from_default_count: response.removed_from_default_count,
        deleted_price_histories_count: response.deleted_price_histories_count
      })

      // Reload contact data and categories
      await loadContact()
      await loadCurrentContactCategories()

      // Clear selection after successful removal
      setSelectedRemoveCategories([])
    } catch (err) {
      setRemoveResult({
        success: false,
        message: err.response?.data?.error || 'Failed to remove from categories'
      })
      console.error('Failed to remove from categories:', err)
    } finally {
      setRemovingFromCategories(false)
    }
  }

  const copyPriceHistory = async () => {
    if (!selectedSourceContact) {
      alert('Please select a contact to copy from')
      return
    }

    if (selectedCategories.length === 0) {
      alert('Please select at least one category to copy')
      return
    }

    const categoryMsg = selectedCategories.length === sourceCategories.length
      ? 'all categories'
      : `${selectedCategories.length} selected ${selectedCategories.length === 1 ? 'category' : 'categories'}`

    const actionMsg = setAsDefaultSupplier
      ? `This will copy price histories for ${categoryMsg} and set this contact as the default supplier for those items.`
      : `This will copy price histories for ${categoryMsg} (without changing the default supplier).`

    if (!confirm(`Are you sure? ${actionMsg}`)) {
      return
    }

    try {
      setCopyingHistory(true)
      setCopyResult(null)

      const requestData = {
        source_id: selectedSourceContact,
        categories: selectedCategories,
        set_as_default: setAsDefaultSupplier,
        copy_mode: copyMode
      }

      // Add effective date if provided
      if (effectiveDate) {
        requestData.effective_date = effectiveDate
      }

      console.log('Copy price history request:', requestData)

      const response = await api.post(`/api/v1/contacts/${id}/copy_price_history`, requestData)

      setCopyResult({
        success: true,
        message: response.message,
        copied_count: response.copied_count,
        updated_count: response.updated_count
      })

      // Reload contact data to show updated items
      await loadContact()

      // Clear selection after successful copy
      setSelectedSourceContact('')
      setSourceCategories([])
      setSelectedCategories([])
    } catch (err) {
      setCopyResult({
        success: false,
        message: err.response?.data?.error || 'Failed to copy price history'
      })
      console.error('Failed to copy price history:', err)
    } finally {
      setCopyingHistory(false)
    }
  }

  const deleteContact = async () => {
    if (!confirm('Are you sure you want to delete this contact? This will unlink all associated suppliers.')) return

    try {
      await api.delete(`/api/v1/contacts/${id}`)
      navigate('/suppliers')
    } catch (err) {
      alert('Failed to delete contact')
      console.error(err)
    }
  }

  const openEditModal = () => {
    setEditFormData({
      full_name: contact.full_name || '',
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      mobile_phone: contact.mobile_phone || '',
      office_phone: contact.office_phone || '',
      website: contact.website || '',
      tax_number: contact.tax_number || '',
      address: contact.address || '',
      notes: contact.notes || '',
      lgas: contact.lgas || [],
      // Xero sync fields
      bank_bsb: contact.bank_bsb || '',
      bank_account_number: contact.bank_account_number || '',
      bank_account_name: contact.bank_account_name || '',
      default_purchase_account: contact.default_purchase_account || '',
      bill_due_day: contact.bill_due_day || '',
      bill_due_type: contact.bill_due_type || '',
      sync_with_xero: contact.sync_with_xero || false
    })
    setIsEditModalOpen(true)
  }

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Inline Xero field editing functions
  const startEditingXeroField = (fieldName) => {
    if (!isPageEditMode) return // Only allow editing in edit mode
    setEditingXeroFields(prev => ({ ...prev, [fieldName]: true }))
    setXeroFieldValues(prev => ({ ...prev, [fieldName]: contact[fieldName] || '' }))
  }

  const cancelEditingXeroField = (fieldName) => {
    setEditingXeroFields(prev => ({ ...prev, [fieldName]: false }))
    setXeroFieldValues(prev => {
      const newValues = { ...prev }
      delete newValues[fieldName]
      return newValues
    })
  }

  const saveXeroField = async (fieldName) => {
    try {
      const value = xeroFieldValues[fieldName]
      const response = await api.patch(`/api/v1/contacts/${id}`, {
        contact: { [fieldName]: value }
      })

      if (response.success || response.contact) {
        // Update the contact state
        setContact(prev => ({
          ...prev,
          [fieldName]: value
        }))
        setEditingXeroFields(prev => ({ ...prev, [fieldName]: false }))
        setXeroFieldValues(prev => {
          const newValues = { ...prev }
          delete newValues[fieldName]
          return newValues
        })
      }
    } catch (err) {
      console.error(`Failed to update ${fieldName}:`, err)
      alert(`Failed to update field: ${err.message}`)
    }
  }

  const handleXeroFieldChange = (fieldName, value) => {
    setXeroFieldValues(prev => ({ ...prev, [fieldName]: value }))
  }

  const saveContact = async () => {
    try {
      setSaving(true)
      const response = await api.patch(`/api/v1/contacts/${id}`, {
        contact: editFormData
      })

      if (response.success) {
        // Update the contact state with the new data
        setContact(prev => ({
          ...prev,
          ...editFormData
        }))
        setIsEditModalOpen(false)
      }
    } catch (err) {
      console.error('Failed to update contact:', err)
      alert(`Failed to update contact: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleExportPriceHistory = async () => {
    try {
      setExporting(true)
      const response = await fetch(`${api.API_URL || 'http://localhost:3001'}/api/v1/pricebook/export_price_history?supplier_id=${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${contact.full_name || 'supplier'}_price_history_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to export price history:', err)
      alert('Failed to export price history. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleEditPriceHistory = (itemId, history) => {
    setEditingPriceHistory({
      itemId,
      historyId: history.id,
      price: history.new_price,
      date: history.date_effective || history.created_at?.split('T')[0]
    })
  }

  const handleSavePriceHistory = async () => {
    if (!editingPriceHistory) return

    try {
      await api.patch(`/api/v1/pricebook/${editingPriceHistory.itemId}/price_histories/${editingPriceHistory.historyId}`, {
        new_price: editingPriceHistory.price,
        date_effective: editingPriceHistory.date
      })

      // Reload contact data to refresh the table
      await loadContact()
      setEditingPriceHistory(null)
    } catch (err) {
      console.error('Failed to update price history:', err)
      alert('Failed to update price history. Please try again.')
    }
  }

  const handleDeletePriceHistory = async (itemId, historyId) => {
    if (!confirm('Are you sure you want to delete this price history entry?')) return

    try {
      setDeletingPriceHistory({ itemId, historyId })
      await api.delete(`/api/v1/pricebook/${itemId}/price_histories/${historyId}`)

      // Reload contact data to refresh the table
      await loadContact()
    } catch (err) {
      console.error('Failed to delete price history:', err)
      alert('Failed to delete price history. Please try again.')
    } finally {
      setDeletingPriceHistory(null)
    }
  }

  const handleImportPriceHistory = async () => {
    if (!importFile) {
      alert('Please select a file to import')
      return
    }

    try {
      setImporting(true)
      setImportResult(null)

      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('effective_date', importDate)

      const response = await fetch(`${api.API_URL || 'http://localhost:3001'}/api/v1/pricebook/import_price_history`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setImportResult({
          success: true,
          message: 'Import completed successfully',
          stats: result.stats,
          warnings: result.warnings
        })
        // Reload contact data to show updated prices
        await loadContact()
      } else {
        setImportResult({
          success: false,
          errors: result.errors || ['Import failed']
        })
      }
    } catch (err) {
      console.error('Failed to import price history:', err)
      setImportResult({
        success: false,
        errors: ['Failed to import price history. Please try again.']
      })
    } finally {
      setImporting(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading contact...</div>
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">{error || 'Contact not found'}</div>
          <Link to="/suppliers" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Back to Suppliers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Suppliers
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {contact.full_name || contact.first_name || 'Unnamed Contact'}
            </h1>
            {contact.parent && (
              <p className="text-gray-600 dark:text-gray-400">
                Parent: {contact.parent}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/contacts`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Contacts
            </button>
            {!isPageEditMode ? (
              <button
                onClick={() => setIsPageEditMode(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <PencilIcon className="h-5 w-5" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    // Save all changes and exit edit mode
                    setIsPageEditMode(false)
                    await loadContact() // Reload to get fresh data
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Save & Lock
                </button>
                <button
                  onClick={() => {
                    setIsPageEditMode(false)
                    loadContact() // Reload to discard changes
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <XCircleIcon className="h-5 w-5" />
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={deleteContact}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <TrashIcon className="h-5 w-5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Contact Information and Business Details in sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>

            <div className="space-y-4">
              {/* Email with inline editing */}
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  {editingXeroFields['email'] ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={xeroFieldValues['email'] || ''}
                        onChange={(e) => handleXeroFieldChange('email', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      <button onClick={() => saveXeroField('email')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => cancelEditingXeroField('email')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex-1">
                          {contact.email}
                        </a>
                      ) : (
                        <p className="text-gray-900 dark:text-white flex-1">-</p>
                      )}
                      {isPageEditMode && (
                        <button onClick={() => startEditingXeroField('email')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Phone with inline editing */}
              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mobile Phone</p>
                  {editingXeroFields['mobile_phone'] ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={xeroFieldValues['mobile_phone'] || ''}
                        onChange={(e) => handleXeroFieldChange('mobile_phone', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      <button onClick={() => saveXeroField('mobile_phone')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => cancelEditingXeroField('mobile_phone')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      {contact.mobile_phone ? (
                        <a href={`tel:${contact.mobile_phone}`} className="text-gray-900 dark:text-white flex-1">
                          {contact.mobile_phone}
                        </a>
                      ) : (
                        <p className="text-gray-900 dark:text-white flex-1">-</p>
                      )}
                      {isPageEditMode && (
                        <button onClick={() => startEditingXeroField('mobile_phone')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Office Phone with inline editing */}
              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Office Phone</p>
                  {editingXeroFields['office_phone'] ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={xeroFieldValues['office_phone'] || ''}
                        onChange={(e) => handleXeroFieldChange('office_phone', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      <button onClick={() => saveXeroField('office_phone')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => cancelEditingXeroField('office_phone')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      {contact.office_phone ? (
                        <a href={`tel:${contact.office_phone}`} className="text-gray-900 dark:text-white flex-1">
                          {contact.office_phone}
                        </a>
                      ) : (
                        <p className="text-gray-900 dark:text-white flex-1">-</p>
                      )}
                      {isPageEditMode && (
                        <button onClick={() => startEditingXeroField('office_phone')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {contact.website && (
                <div className="flex items-start gap-3">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                    <a
                      href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {contact.website}
                    </a>
                  </div>
                </div>
              )}

              {/* Address with inline editing */}
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                  {editingXeroFields['address'] ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        value={xeroFieldValues['address'] || ''}
                        onChange={(e) => handleXeroFieldChange('address', e.target.value)}
                        rows={3}
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                      <div className="flex flex-col gap-1">
                        <button onClick={() => saveXeroField('address')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => cancelEditingXeroField('address')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 group">
                      <p className="text-gray-900 dark:text-white flex-1 whitespace-pre-wrap">{contact.address || '-'}</p>
                      {isPageEditMode && (
                        <button onClick={() => startEditingXeroField('address')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mt-0.5">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!contact.email && !contact.mobile_phone && !contact.office_phone && !contact.website && !contact.address && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No contact information available</p>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Business Details</h2>

            {/* Xero Link Status - Highlighted */}
            <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Xero Integration</p>
                  {contact.xero_id ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Linked to Xero
                        </span>
                        {contact.sync_with_xero && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (Sync enabled)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        ID: {contact.xero_id}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Not linked to Xero
                      </span>
                      <button
                        onClick={() => setShowLinkXeroModal(true)}
                        className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        Link to Xero
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tax Number (ABN) with inline editing */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tax Number (ABN)</p>
                {editingXeroFields['tax_number'] ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={xeroFieldValues['tax_number'] || ''}
                      onChange={(e) => {
                        handleXeroFieldChange('tax_number', e.target.value)
                        // Validate ABN as user types (debounced)
                        if (e.target.value) {
                          clearTimeout(window.abnValidationTimeout)
                          window.abnValidationTimeout = setTimeout(() => {
                            validateAbn(e.target.value)
                          }, 500)
                        } else {
                          setAbnValidation(null)
                        }
                      }}
                      placeholder="e.g., 51 824 753 556"
                      className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      autoFocus
                    />
                    <button onClick={() => saveXeroField('tax_number')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => cancelEditingXeroField('tax_number')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <p className="text-gray-900 dark:text-white font-medium flex-1">{contact.tax_number || '-'}</p>
                    {contact.tax_number && (
                      <>
                        {validatingAbn ? (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full" />
                        ) : abnValidation?.valid ? (
                          <div className="flex items-center gap-1">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" title="Valid ABN" />
                            {abnValidation.entity_name && (
                              <span className="text-xs text-gray-500 dark:text-gray-400" title={abnValidation.entity_name}>
                                ({abnValidation.entity_name.substring(0, 20)}{abnValidation.entity_name.length > 20 ? '...' : ''})
                              </span>
                            )}
                          </div>
                        ) : abnValidation && !abnValidation.valid ? (
                          <XCircleIcon className="h-5 w-5 text-red-500" title={abnValidation.error || 'Invalid ABN'} />
                        ) : null}
                      </>
                    )}
                    {isPageEditMode && (
                      <button onClick={() => startEditingXeroField('tax_number')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                {editingXeroFields['tax_number'] && abnValidation?.valid && abnValidation.entity_name && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    {abnValidation.entity_name}
                    {abnValidation.gst_registered && ' (GST Registered)'}
                  </p>
                )}
                {editingXeroFields['tax_number'] && abnValidation && !abnValidation.valid && abnValidation.error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {abnValidation.error}
                  </p>
                )}
              </div>

              {contact.branch !== null && contact.branch !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Branch</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {contact.branch ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>

            {/* Bank Account Details - from Xero - Always show for editing */}
            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Account Details</p>
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" title="Syncs with Xero">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  {contact.sync_with_xero ? (
                    contact.xero_sync_error ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" title={contact.xero_sync_error}>
                        <XCircleIcon className="h-3 w-3" />
                        Sync Failed
                      </span>
                    ) : contact.last_synced_at ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200" title={`Last synced: ${new Date(contact.last_synced_at).toLocaleString()}`}>
                        <CheckCircleIcon className="h-3 w-3" />
                        Synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                        Pending Sync
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      Not Synced
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bank Account Name */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Name</p>
                    {editingXeroFields['bank_account_name'] ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={xeroFieldValues['bank_account_name'] || ''}
                          onChange={(e) => handleXeroFieldChange('bank_account_name', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        <button onClick={() => saveXeroField('bank_account_name')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => cancelEditingXeroField('bank_account_name')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <p className="text-gray-900 dark:text-white font-medium flex-1">{contact.bank_account_name || '-'}</p>
                        {isPageEditMode && (
                          <button onClick={() => startEditingXeroField('bank_account_name')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bank BSB */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">BSB</p>
                    {editingXeroFields['bank_bsb'] ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={xeroFieldValues['bank_bsb'] || ''}
                          onChange={(e) => handleXeroFieldChange('bank_bsb', e.target.value)}
                          placeholder="123456"
                          maxLength="6"
                          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                          autoFocus
                        />
                        <button onClick={() => saveXeroField('bank_bsb')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => cancelEditingXeroField('bank_bsb')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <p className="text-gray-900 dark:text-white font-mono flex-1">{contact.bank_bsb || '-'}</p>
                        {isPageEditMode && (
                          <button onClick={() => startEditingXeroField('bank_bsb')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bank Account Number */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
                    {editingXeroFields['bank_account_number'] ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={xeroFieldValues['bank_account_number'] || ''}
                          onChange={(e) => handleXeroFieldChange('bank_account_number', e.target.value)}
                          placeholder="98765432"
                          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                          autoFocus
                        />
                        <button onClick={() => saveXeroField('bank_account_number')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => cancelEditingXeroField('bank_account_number')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <p className="text-gray-900 dark:text-white font-mono flex-1">{contact.bank_account_number || '-'}</p>
                        {isPageEditMode && (
                          <button onClick={() => startEditingXeroField('bank_account_number')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Synced with Xero {contact.last_synced_at && `• Last sync: ${new Date(contact.last_synced_at).toLocaleDateString()}`}
                </p>
            </div>

            {/* Purchase Account & Payment Terms - from Xero - Always show for editing */}
            <div className="mt-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Purchase & Payment Settings</p>
                    <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24" title="Syncs with Xero">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  {contact.sync_with_xero ? (
                    contact.xero_sync_error ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" title={contact.xero_sync_error}>
                        <XCircleIcon className="h-3 w-3" />
                        Sync Failed
                      </span>
                    ) : contact.last_synced_at ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200" title={`Last synced: ${new Date(contact.last_synced_at).toLocaleString()}`}>
                        <CheckCircleIcon className="h-3 w-3" />
                        Synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                        Pending Sync
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      Not Synced
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Default Purchase Account */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Default Purchase Account</p>
                    {editingXeroFields['default_purchase_account'] ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={xeroFieldValues['default_purchase_account'] || ''}
                          onChange={(e) => handleXeroFieldChange('default_purchase_account', e.target.value)}
                          placeholder="e.g., 300"
                          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        <button onClick={() => saveXeroField('default_purchase_account')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => cancelEditingXeroField('default_purchase_account')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <p className="text-gray-900 dark:text-white font-medium flex-1">{contact.default_purchase_account || '-'}</p>
                        {isPageEditMode && (
                          <button onClick={() => startEditingXeroField('default_purchase_account')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bill Due Day */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bill Due Day</p>
                    {editingXeroFields['bill_due_day'] ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={xeroFieldValues['bill_due_day'] || ''}
                          onChange={(e) => handleXeroFieldChange('bill_due_day', e.target.value)}
                          placeholder="30"
                          min="1"
                          max="90"
                          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        <button onClick={() => saveXeroField('bill_due_day')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => cancelEditingXeroField('bill_due_day')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <p className="text-gray-900 dark:text-white font-medium flex-1">{contact.bill_due_day || '-'}</p>
                        {isPageEditMode && (
                          <button onClick={() => startEditingXeroField('bill_due_day')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bill Due Type */}
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bill Due Type</p>
                    {editingXeroFields['bill_due_type'] ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={xeroFieldValues['bill_due_type'] || ''}
                          onChange={(e) => handleXeroFieldChange('bill_due_type', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        >
                          <option value="">Select type...</option>
                          <option value="DAYSAFTERBILLDATE">Days After Bill Date</option>
                          <option value="DAYSAFTERBILLMONTH">Days After Bill Month</option>
                          <option value="OFCURRENTMONTH">Of Current Month</option>
                          <option value="OFFOLLOWINGMONTH">Of Following Month</option>
                        </select>
                        <button onClick={() => saveXeroField('bill_due_type')} className="text-green-600 hover:text-green-700 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => cancelEditingXeroField('bill_due_type')} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <p className="text-gray-900 dark:text-white font-medium flex-1">{contact.bill_due_type || '-'}</p>
                        {isPageEditMode && (
                          <button onClick={() => startEditingXeroField('bill_due_type')} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Synced with Xero {contact.last_synced_at && `• Last sync: ${new Date(contact.last_synced_at).toLocaleDateString()}`}
                </p>
            </div>

            {/* LGAs - Multi-select for suppliers */}
            {contact['is_supplier?'] && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Local Government Areas (LGAs)</p>
                <div className="flex flex-wrap gap-2">
                  {contact.lgas && contact.lgas.length > 0 ? (
                    contact.lgas.map((lga, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      >
                        {lga}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No LGAs assigned</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Edit LGAs using the Edit button above
                </p>
              </div>
            )}

            {!contact.tax_number && contact.branch === null && !contact.is_supplier && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">No additional business details available</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location & Region */}
          {(contact.contact_region || contact.contact_region_id) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h2>
              </div>

              <div className="space-y-3">
                {contact.contact_region && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Region</p>
                    <p className="text-gray-900 dark:text-white font-medium">{contact.contact_region}</p>
                  </div>
                )}

                {contact.contact_region_id && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Region ID</p>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">{contact.contact_region_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Info</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Contact ID</p>
                <p className="text-gray-900 dark:text-white font-mono text-sm">#{contact.id}</p>
              </div>

              {contact.sys_type_id && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">System Type ID</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{contact.sys_type_id}</p>
                </div>
              )}

              {contact.drive_id && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drive ID</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{contact.drive_id}</p>
                </div>
              )}

              {contact.folder_id && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Folder ID</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{contact.folder_id}</p>
                </div>
              )}

              {contact.deleted && (
                <div>
                  <p className="text-sm text-red-500 dark:text-red-400 font-medium">Marked as Deleted</p>
                </div>
              )}

              {contact.created_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {contact.updated_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {new Date(contact.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Xero Integration */}
          {(contact.xero_id || contact.sync_with_xero || contact.last_synced_at || contact.xero_sync_error) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Xero Integration</h2>
              </div>

              <div className="space-y-3">
                {contact.xero_id && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Xero Contact ID</p>
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{contact.xero_id}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync with Xero</p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {contact.sync_with_xero ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Disabled
                      </span>
                    )}
                  </p>
                </div>

                {contact.last_synced_at && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Synced</p>
                    <p className="text-gray-900 dark:text-white text-sm">
                      {new Date(contact.last_synced_at).toLocaleDateString()} at {new Date(contact.last_synced_at).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {contact.xero_sync_error && (
                  <div>
                    <p className="text-sm text-red-500 dark:text-red-400 font-medium mb-1">Sync Error</p>
                    <p className="text-sm text-gray-900 dark:text-white bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                      {contact.xero_sync_error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Price Book Items</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {contact.pricebook_items?.length || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Categories</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentContactCategories.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Price Book Items - Full width for supplier contacts */}
      {contact['is_supplier?'] && (
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CubeIcon className="h-5 w-5 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Price Book Items
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50">
                    {(() => {
                      const filtered = contact.pricebook_items?.filter((item) => {
                        if (!priceBookSearchTerm) return true
                        const search = priceBookSearchTerm.toLowerCase()
                        return (
                          item.item_code?.toLowerCase().includes(search) ||
                          item.item_name?.toLowerCase().includes(search) ||
                          item.category?.toLowerCase().includes(search) ||
                          item.price_histories?.some(h =>
                            h.new_price?.toString().includes(search)
                          )
                        )
                      }) || []
                      return `${filtered.length} ${priceBookSearchTerm ? 'of ' + (contact.pricebook_items?.length || 0) : ''} items`
                    })()}
                  </span>
                </div>
                {contact.pricebook_items && contact.pricebook_items.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Import from Excel
                    </button>
                    <button
                      onClick={handleExportPriceHistory}
                      disabled={exporting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      {exporting ? 'Exporting...' : 'Export to Excel'}
                    </button>
                  </div>
                )}
              </div>

              {/* Search Input */}
              {contact.pricebook_items && contact.pricebook_items.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    value={priceBookSearchTerm}
                    onChange={(e) => setPriceBookSearchTerm(e.target.value)}
                    placeholder="Search by code, name, category, or price..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {priceBookSearchTerm && (
                    <button
                      onClick={() => setPriceBookSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Tab Navigation - Always show for suppliers */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setPriceBookTab('items')}
                    className={`${
                      priceBookTab === 'items'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Items
                  </button>
                  <button
                    onClick={() => setPriceBookTab('activity')}
                    className={`${
                      priceBookTab === 'activity'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Activity Log
                  </button>
                  <button
                    onClick={() => setPriceBookTab('bulk-update')}
                    className={`${
                      priceBookTab === 'bulk-update'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Bulk Update
                  </button>
                  <button
                    onClick={() => setPriceBookTab('xero-sync')}
                    className={`${
                      priceBookTab === 'xero-sync'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Xero Sync
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {priceBookTab === 'items' && contact.pricebook_items && contact.pricebook_items.length > 0 ? (
              (() => {
                // Get all unique dates from all price histories across all items
                const allDates = new Set()
                contact.pricebook_items.forEach(item => {
                  if (item.price_histories && item.price_histories.length > 0) {
                    item.price_histories.forEach(history => {
                      const date = history.date_effective || history.created_at
                      if (date) {
                        allDates.add(new Date(date).toISOString().split('T')[0])
                      }
                    })
                  }
                })

                // Sort dates chronologically (newest first)
                const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a))

                // Filter items based on search term
                const filteredItems = contact.pricebook_items.filter((item) => {
                  if (!priceBookSearchTerm) return true
                  const search = priceBookSearchTerm.toLowerCase()
                  return (
                    item.item_code?.toLowerCase().includes(search) ||
                    item.item_name?.toLowerCase().includes(search) ||
                    item.category?.toLowerCase().includes(search) ||
                    item.price_histories?.some(h =>
                      h.new_price?.toString().includes(search)
                    )
                  )
                })

                return (
                  <div className="overflow-x-scroll">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <th scope="col" className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800/50 px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Code
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Item Name
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Default
                          </th>
                          {sortedDates.map(date => (
                            <th
                              key={date}
                              scope="col"
                              className="px-6 py-3.5 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-l border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-end gap-2">
                                <span>
                                  {new Date(date).toLocaleDateString('en-AU', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Are you sure you want to delete ALL price histories for ${new Date(date).toLocaleDateString('en-AU')}? This will remove this entire column.`)) {
                                      return
                                    }
                                    try {
                                      const response = await api.delete(`/api/v1/contacts/${contact.id}/delete_price_column`, {
                                        params: { date_effective: date }
                                      })
                                      if (response.success) {
                                        alert(response.message)
                                        await loadContact()
                                      } else {
                                        alert(`Failed to delete column: ${response.error}`)
                                      }
                                    } catch (error) {
                                      console.error('Failed to delete column:', error)
                                      alert('Failed to delete column. Please try again.')
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete entire column"
                                >
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredItems.map((item) => {
                          // Determine which price is currently active (date_effective <= today)
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)

                          const activePriceHistory = item.price_histories
                            ?.filter(h => {
                              if (!h.date_effective) return true // No date = always active
                              const effectiveDate = new Date(h.date_effective)
                              effectiveDate.setHours(0, 0, 0, 0)
                              return effectiveDate <= today
                            })
                            ?.sort((a, b) => {
                              const dateA = a.date_effective ? new Date(a.date_effective) : new Date(a.created_at)
                              const dateB = b.date_effective ? new Date(b.date_effective) : new Date(b.created_at)
                              return dateB - dateA
                            })[0]

                          const activePriceDate = activePriceHistory ?
                            new Date(activePriceHistory.date_effective || activePriceHistory.created_at).toISOString().split('T')[0] :
                            null

                          return (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                              {item.item_code}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {item.item_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.category ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                                  <TagIcon className="h-3 w-3" />
                                  {item.category}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-200 dark:border-gray-700">
                              {item.is_default_supplier ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">—</span>
                              )}
                            </td>
                            {sortedDates.map(date => {
                              // Find price history for this date
                              const history = item.price_histories?.find(h => {
                                const historyDate = h.date_effective || h.created_at
                                if (!historyDate) return false
                                return new Date(historyDate).toISOString().split('T')[0] === date
                              })

                              const isEditing = editingPriceHistory?.itemId === item.id &&
                                                editingPriceHistory?.historyId === history?.id

                              // Check if this is the active price
                              const isActivePrice = date === activePriceDate

                              return (
                                <td
                                  key={date}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono border-l border-gray-200 dark:border-gray-700"
                                >
                                  {history ? (
                                    <div className="flex items-center justify-end gap-2">
                                      {isEditing ? (
                                        <>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={editingPriceHistory.price}
                                            onChange={(e) => setEditingPriceHistory({ ...editingPriceHistory, price: e.target.value })}
                                            onFocus={(e) => e.target.select()}
                                            className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            ref={(input) => {
                                              if (input) {
                                                // Focus without scrolling
                                                input.focus({ preventScroll: true })
                                                // Select all text for easy editing
                                                input.select()
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={handleSavePriceHistory}
                                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                            title="Save"
                                          >
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => handleDeletePriceHistory(item.id, history.id)}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            title="Delete"
                                          >
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => setEditingPriceHistory(null)}
                                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            title="Cancel"
                                          >
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <span
                                            onClick={() => handleEditPriceHistory(item.id, history)}
                                            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                            title="Click to edit"
                                          >
                                            ${parseFloat(history.new_price || 0).toFixed(2)}
                                          </span>
                                          {isActivePrice && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" title="Currently active price">
                                              Active
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500">—</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                )
              })()
            ) : (
                <div className="px-6 py-16 text-center">
                  <CubeIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-4 text-base font-medium text-gray-900 dark:text-white">No items in price book</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    This supplier doesn't have any items in their price book yet.
                  </p>
                </div>
              )}

              {/* Activity Log Tab */}
              {priceBookTab === 'activity' && (
                <div className="px-6 py-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Price Change Activity Log</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Track all price changes made to items in this supplier's price book
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Item
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Old Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            New Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Change
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {(() => {
                          // Collect all price histories from all items
                          const allHistories = contact.pricebook_items?.flatMap(item =>
                            (item.price_histories || []).map(history => ({
                              ...history,
                              item_name: item.item_name,
                              item_code: item.item_code
                            }))
                          ) || []

                          // Sort by date descending (most recent first)
                          const sortedHistories = allHistories.sort((a, b) => {
                            const dateA = new Date(a.date_effective || a.created_at)
                            const dateB = new Date(b.date_effective || b.created_at)
                            return dateB - dateA
                          })

                          if (sortedHistories.length === 0) {
                            return (
                              <tr>
                                <td colSpan="7" className="px-6 py-16 text-center">
                                  <div className="text-gray-400 dark:text-gray-500">
                                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm font-medium">No price changes recorded yet</p>
                                    <p className="text-xs mt-1">Price change history will appear here</p>
                                  </div>
                                </td>
                              </tr>
                            )
                          }

                          return sortedHistories.map((history, idx) => {
                            const changePercent = history.old_price && history.new_price
                              ? (((history.new_price - history.old_price) / history.old_price) * 100).toFixed(1)
                              : null
                            const isIncrease = changePercent > 0
                            const isDecrease = changePercent < 0

                            return (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {new Date(history.date_effective || history.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                  <div className="font-medium">{history.item_name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{history.item_code}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {history.user_name || 'System'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-900 dark:text-white">
                                  {history.old_price ? `$${parseFloat(history.old_price).toFixed(2)}` : '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-semibold text-gray-900 dark:text-white">
                                  ${parseFloat(history.new_price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {changePercent !== null && (
                                    <span className={`inline-flex items-center gap-1 ${
                                      isIncrease ? 'text-red-600 dark:text-red-400' :
                                      isDecrease ? 'text-green-600 dark:text-green-400' :
                                      'text-gray-500 dark:text-gray-400'
                                    }`}>
                                      {isIncrease && '↑'}
                                      {isDecrease && '↓'}
                                      {Math.abs(changePercent)}%
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {history.change_reason || '—'}
                                </td>
                              </tr>
                            )
                          })
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bulk Update Tab */}
              {priceBookTab === 'bulk-update' && (
                <div className="px-6 py-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bulk Price Update</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Create a new price column for a specific date and update all items at once
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Bulk Update Mode
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>
                            This will create a new price history entry for all items with the specified effective date.
                            You can edit individual prices in the table below before applying the update.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Selector */}
                  <div className="mb-6">
                    <label htmlFor="bulk-update-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Effective Date for New Prices
                    </label>
                    <input
                      type="date"
                      id="bulk-update-date"
                      value={bulkUpdateDate}
                      onChange={(e) => setBulkUpdateDate(e.target.value)}
                      className="block w-64 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Tools Section - Copy Price History & Remove from Categories */}
                  {contact['is_supplier?'] && (
                    <div className="mb-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Copy Price History */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Copy Price History & Items
                          </h3>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Copy all price histories from another supplier and set this contact as the default supplier for their items.
                          </p>

                          <div className="space-y-4">
                            <div className="relative supplier-search-container">
                              <label htmlFor="source-contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Supplier to Copy From
                              </label>
                              <input
                                type="text"
                                id="source-contact"
                                value={supplierSearchTerm}
                                onChange={(e) => {
                                  setSupplierSearchTerm(e.target.value)
                                  setShowSupplierDropdown(true)
                                  if (!e.target.value) {
                                    setSelectedSourceContact('')
                                    setSourceCategories([])
                                    setSelectedCategories([])
                                  }
                                }}
                                onFocus={() => setShowSupplierDropdown(true)}
                                placeholder="Search for a supplier..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={copyingHistory}
                                autoComplete="off"
                              />

                              {showSupplierDropdown && supplierSearchTerm && filteredContacts.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                  {filteredContacts.map((contact) => (
                                    <button
                                      key={contact.id}
                                      type="button"
                                      onClick={() => handleSupplierSelect(contact.id, contact.full_name)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                                    >
                                      {contact.full_name} <span className="text-gray-500 dark:text-gray-400">(#{contact.id})</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {showSupplierDropdown && supplierSearchTerm && filteredContacts.length === 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">No suppliers found</p>
                                </div>
                              )}
                            </div>

                            {/* Category Selection */}
                            {selectedSourceContact && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Categories to Copy
                                  </label>
                                  {sourceCategories.length > 0 && (
                                    <button
                                      onClick={toggleAllCategories}
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                      disabled={loadingCategories || copyingHistory}
                                    >
                                      {selectedCategories.length === sourceCategories.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                  )}
                                </div>

                                {loadingCategories ? (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                    Loading categories...
                                  </div>
                                ) : sourceCategories.length > 0 ? (
                                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-60 overflow-y-auto">
                                    <div className="space-y-2">
                                      {sourceCategories.map((cat) => (
                                        <label
                                          key={cat.category}
                                          className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.category)}
                                            onChange={() => toggleCategory(cat.category)}
                                            disabled={copyingHistory}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                          />
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                              {cat.category}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {cat.total_count} {cat.total_count === 1 ? 'item' : 'items'}
                                              {cat.default_supplier_count > 0 && ` (${cat.default_supplier_count} as default)`}
                                            </div>
                                          </div>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                    No categories found for this supplier
                                  </div>
                                )}

                                {selectedCategories.length > 0 && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Set as Default Supplier Checkbox */}
                            {selectedSourceContact && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <input
                                    type="checkbox"
                                    id="setAsDefault"
                                    checked={setAsDefaultSupplier}
                                    onChange={(e) => setSetAsDefaultSupplier(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor="setAsDefault" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Set this contact as the default supplier for copied items
                                  </label>
                                </div>

                                {/* Which Price to Copy */}
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <label htmlFor="copyMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Which Price to Copy
                                  </label>
                                  <select
                                    id="copyMode"
                                    value={copyMode}
                                    onChange={(e) => setCopyMode(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="active">Active Price (most recent effective date)</option>
                                    <option value="latest">Latest Price (most recently created)</option>
                                    <option value="oldest">Oldest Price (original price)</option>
                                  </select>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Choose which price history entry to copy from each item
                                  </p>
                                </div>

                                {/* Effective Date */}
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Effective Date (Optional)
                                  </label>
                                  <input
                                    type="date"
                                    id="effectiveDate"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Leave empty to use today's date, or specify a future date for scheduled price changes
                                  </p>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={copyPriceHistory}
                              disabled={!selectedSourceContact || selectedCategories.length === 0 || copyingHistory}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                            >
                              {copyingHistory ? 'Copying...' : (setAsDefaultSupplier ? 'Copy Price History & Set as Default' : 'Copy Price History Only')}
                            </button>

                            {copyResult && (
                              <div className={`p-4 rounded-lg ${copyResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                <p className={`text-sm font-medium ${copyResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                  {copyResult.message}
                                </p>
                                {copyResult.success && (
                                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                                    <p>• Copied {copyResult.copied_count} price histories</p>
                                    <p>• Updated {copyResult.updated_count} items to use this supplier as default</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remove from Categories - Only show if has categories */}
                        {currentContactCategories.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              Remove from Categories
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              Remove this supplier from selected categories. This will unset them as the default supplier AND delete all their price histories for items in those categories. Use this when a supplier has stopped supplying certain products.
                            </p>

                            <div className="space-y-4">
                              {/* Category Selection */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Categories to Remove From
                                  </label>
                                  {currentContactCategories.length > 0 && (
                                    <button
                                      onClick={toggleAllRemoveCategories}
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                      disabled={loadingCurrentCategories || removingFromCategories}
                                    >
                                      {selectedRemoveCategories.length === currentContactCategories.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                  )}
                                </div>

                                {loadingCurrentCategories ? (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                    Loading categories...
                                  </div>
                                ) : currentContactCategories.length > 0 ? (
                                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-60 overflow-y-auto">
                                    <div className="space-y-2">
                                      {currentContactCategories.map((cat) => (
                                        <label
                                          key={cat.category}
                                          className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selectedRemoveCategories.includes(cat.category)}
                                            onChange={() => toggleRemoveCategory(cat.category)}
                                            disabled={removingFromCategories}
                                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                          />
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                              {cat.category}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {cat.default_supplier_count > 0 && (
                                                <span>{cat.default_supplier_count} {cat.default_supplier_count === 1 ? 'item' : 'items'} as default</span>
                                              )}
                                              {cat.default_supplier_count > 0 && cat.price_history_count > 0 && <span>, </span>}
                                              {cat.price_history_count > 0 && (
                                                <span>{cat.price_history_count} price {cat.price_history_count === 1 ? 'history' : 'histories'}</span>
                                              )}
                                            </div>
                                          </div>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                    This contact is not the default supplier for any categories
                                  </div>
                                )}

                                {selectedRemoveCategories.length > 0 && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {selectedRemoveCategories.length} {selectedRemoveCategories.length === 1 ? 'category' : 'categories'} selected
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={removeFromCategories}
                                disabled={selectedRemoveCategories.length === 0 || removingFromCategories}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                              >
                                {removingFromCategories ? 'Removing...' : 'Remove Supplier & Delete Price Histories'}
                              </button>

                              {removeResult && (
                                <div className={`p-4 rounded-lg ${removeResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                  <p className={`text-sm font-medium ${removeResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                    {removeResult.message}
                                  </p>
                                  {removeResult.success && (
                                    <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                                      {removeResult.removed_from_default_count > 0 && (
                                        <p>• Removed as default supplier from {removeResult.removed_from_default_count} items</p>
                                      )}
                                      {removeResult.deleted_price_histories_count > 0 && (
                                        <p>• Deleted {removeResult.deleted_price_histories_count} price histories</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items Table for Bulk Update */}
                  {contact.pricebook_items && contact.pricebook_items.length > 0 ? (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Item Code
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Item Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Current Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              New Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Change Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {contact.pricebook_items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {item.item_code}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {item.item_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-500 dark:text-gray-400">
                                ${parseFloat(item.current_price || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <input
                                  type="number"
                          onFocus={(e) => e.target.select()}
                                  step="0.01"
                                  defaultValue={item.current_price || 0}
                                  id={`bulk-price-${item.id}`}
                                  className="w-32 px-3 py-1.5 text-right border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <input
                                  type="text"
                                  placeholder="Optional reason"
                                  id={`bulk-reason-${item.id}`}
                                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No items available for bulk update</p>
                    </div>
                  )}

                  {/* Apply Bulk Update Button */}
                  {contact.pricebook_items && contact.pricebook_items.length > 0 && (
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          // Reset all inputs to current prices
                          contact.pricebook_items.forEach(item => {
                            const priceInput = document.getElementById(`bulk-price-${item.id}`)
                            const reasonInput = document.getElementById(`bulk-reason-${item.id}`)
                            if (priceInput) priceInput.value = item.current_price || 0
                            if (reasonInput) reasonInput.value = ''
                          })
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Reset All
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setBulkUpdating(true)
                          try {
                            // Collect all price updates
                            const updates = contact.pricebook_items.map(item => {
                              const priceInput = document.getElementById(`bulk-price-${item.id}`)
                              const reasonInput = document.getElementById(`bulk-reason-${item.id}`)
                              return {
                                item_id: item.id,
                                new_price: parseFloat(priceInput.value),
                                change_reason: reasonInput.value || 'bulk_update',
                                date_effective: bulkUpdateDate
                              }
                            }).filter(update => update.new_price > 0)

                            // Call API endpoint
                            const response = await api.post(`/api/v1/contacts/${contact.id}/bulk_update_prices`, {
                              updates
                            })

                            if (response.success) {
                              alert(`Successfully updated ${response.updated_count} prices`)
                              // Refresh contact data
                              window.location.reload()
                            } else {
                              alert('Failed to update prices: ' + (response.errors || []).join(', '))
                            }
                          } catch (error) {
                            console.error('Bulk update error:', error)
                            alert('Failed to update prices: ' + error.message)
                          } finally {
                            setBulkUpdating(false)
                          }
                        }}
                        disabled={bulkUpdating}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                      >
                        {bulkUpdating ? 'Updating...' : `Apply Update to ${contact.pricebook_items.length} Items`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Xero Sync Tab */}
              {priceBookTab === 'xero-sync' && (
                <div className="px-6 py-8">
                  <ActivityTimeline contactId={contact.id} />
                </div>
              )}
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-gray-800 dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:size-10 dark:bg-indigo-500/10">
                    <PencilIcon aria-hidden="true" className="size-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                      Edit Contact
                    </DialogTitle>
                    <div className="mt-4 space-y-4">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          value={editFormData?.full_name || ''}
                          onChange={(e) => handleEditChange('full_name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* First Name & Last Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            value={editFormData?.first_name || ''}
                            onChange={(e) => handleEditChange('first_name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            value={editFormData?.last_name || ''}
                            onChange={(e) => handleEditChange('last_name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={editFormData?.email || ''}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* Mobile & Office Phone */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="mobile_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mobile Phone
                          </label>
                          <input
                            type="tel"
                            id="mobile_phone"
                            value={editFormData?.mobile_phone || ''}
                            onChange={(e) => handleEditChange('mobile_phone', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="office_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Office Phone
                          </label>
                          <input
                            type="tel"
                            id="office_phone"
                            value={editFormData?.office_phone || ''}
                            onChange={(e) => handleEditChange('office_phone', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Website */}
                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Website
                        </label>
                        <input
                          type="url"
                          id="website"
                          value={editFormData?.website || ''}
                          onChange={(e) => handleEditChange('website', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* Tax Number */}
                      <div>
                        <label htmlFor="tax_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tax Number (ABN)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="tax_number"
                            value={editFormData?.tax_number || ''}
                            onChange={(e) => {
                              handleEditChange('tax_number', e.target.value)
                              // Validate ABN as user types (debounced)
                              if (e.target.value) {
                                clearTimeout(window.abnValidationTimeout)
                                window.abnValidationTimeout = setTimeout(() => {
                                  validateAbn(e.target.value)
                                }, 500)
                              } else {
                                setAbnValidation(null)
                              }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                          />
                          {editFormData?.tax_number && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {validatingAbn ? (
                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full" />
                              ) : abnValidation?.valid ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" title="Valid ABN" />
                              ) : abnValidation && !abnValidation.valid ? (
                                <XCircleIcon className="h-5 w-5 text-red-500" title={abnValidation.error || 'Invalid ABN'} />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {abnValidation?.valid && abnValidation.entity_name && (
                          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                            {abnValidation.entity_name}
                            {abnValidation.gst_registered && ' (GST Registered)'}
                          </p>
                        )}
                        {abnValidation && !abnValidation.valid && abnValidation.error && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {abnValidation.error}
                          </p>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address
                        </label>
                        <textarea
                          id="address"
                          rows={2}
                          value={editFormData?.address || ''}
                          onChange={(e) => handleEditChange('address', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={editFormData?.notes || ''}
                          onChange={(e) => handleEditChange('notes', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* Xero Sync Fields Section */}
                      <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          Xero Sync Fields
                          {contact?.sync_with_xero && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                              Synced with Xero
                            </span>
                          )}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Bank BSB */}
                          <div>
                            <label htmlFor="bank_bsb" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Bank BSB
                            </label>
                            <input
                              type="text"
                              id="bank_bsb"
                              value={editFormData?.bank_bsb || ''}
                              onChange={(e) => handleEditChange('bank_bsb', e.target.value)}
                              placeholder="123456"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>

                          {/* Bank Account Number */}
                          <div>
                            <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Bank Account Number
                            </label>
                            <input
                              type="text"
                              id="bank_account_number"
                              value={editFormData?.bank_account_number || ''}
                              onChange={(e) => handleEditChange('bank_account_number', e.target.value)}
                              placeholder="98765432"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>

                          {/* Bank Account Name */}
                          <div className="sm:col-span-2">
                            <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Bank Account Name
                            </label>
                            <input
                              type="text"
                              id="bank_account_name"
                              value={editFormData?.bank_account_name || ''}
                              onChange={(e) => handleEditChange('bank_account_name', e.target.value)}
                              placeholder="Business Account"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>

                          {/* Default Purchase Account */}
                          <div>
                            <label htmlFor="default_purchase_account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Default Purchase Account
                            </label>
                            <input
                              type="text"
                              id="default_purchase_account"
                              value={editFormData?.default_purchase_account || ''}
                              onChange={(e) => handleEditChange('default_purchase_account', e.target.value)}
                              placeholder="e.g., 300"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Xero account code</p>
                          </div>

                          {/* Bill Due Day */}
                          <div>
                            <label htmlFor="bill_due_day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Bill Due Day
                            </label>
                            <input
                              type="number"
                              id="bill_due_day"
                              value={editFormData?.bill_due_day || ''}
                              onChange={(e) => handleEditChange('bill_due_day', e.target.value)}
                              placeholder="30"
                              min="1"
                              max="90"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>

                          {/* Bill Due Type */}
                          <div className="sm:col-span-2">
                            <label htmlFor="bill_due_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Bill Due Type
                            </label>
                            <select
                              id="bill_due_type"
                              value={editFormData?.bill_due_type || ''}
                              onChange={(e) => handleEditChange('bill_due_type', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="">Select type...</option>
                              <option value="DAYSAFTERBILLDATE">Days After Bill Date</option>
                              <option value="DAYSAFTERBILLMONTH">Days After Bill Month</option>
                              <option value="OFCURRENTMONTH">Of Current Month</option>
                              <option value="OFFOLLOWINGMONTH">Of Following Month</option>
                            </select>
                          </div>

                          {/* Sync with Xero Toggle */}
                          <div className="sm:col-span-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editFormData?.sync_with_xero || false}
                                onChange={(e) => handleEditChange('sync_with_xero', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Sync with Xero (enable bidirectional sync for this contact)
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* LGAs - Multi-select for suppliers */}
                      {contact['is_supplier?'] && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Local Government Areas (LGAs)
                          </label>
                          <div className="space-y-2">
                            {[
                              'Toowoomba Regional Council',
                              'Lockyer Valley Regional Council',
                              'City of Gold Coast',
                              'Brisbane City Council',
                              'Sunshine Coast Regional Council',
                              'Redland City Council',
                              'Scenic Rim Regional Council'
                            ].map((lga) => (
                              <label key={lga} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editFormData?.lgas?.includes(lga) || false}
                                  onChange={(e) => {
                                    const currentLgas = editFormData?.lgas || []
                                    const newLgas = e.target.checked
                                      ? [...currentLgas, lga]
                                      : currentLgas.filter(l => l !== lga)
                                    handleEditChange('lgas', newLgas)
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  {lga}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700/25">
                <button
                  type="button"
                  onClick={saveContact}
                  disabled={saving}
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/5 dark:hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Import Price History Modal */}
      <Dialog open={showImportModal} onClose={() => setShowImportModal(false)} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-gray-800 dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10 dark:bg-blue-500/10">
                    <ArrowUpTrayIcon aria-hidden="true" className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                      Import Price History
                    </DialogTitle>
                    <div className="mt-4 space-y-4">
                      {/* File Upload */}
                      <div>
                        <label htmlFor="import-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Excel File
                        </label>
                        <input
                          type="file"
                          id="import-file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => setImportFile(e.target.files[0])}
                          className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Accepts .xlsx, .xls, or .csv files
                        </p>
                      </div>

                      {/* Effective Date */}
                      <div>
                        <label htmlFor="import-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Effective Date
                        </label>
                        <input
                          type="date"
                          id="import-date"
                          value={importDate}
                          onChange={(e) => setImportDate(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          This date will be used for all imported prices (overrides dates in the file)
                        </p>
                      </div>

                      {/* Import Result */}
                      {importResult && (
                        <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                          <p className={`text-sm font-medium ${importResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                            {importResult.message}
                          </p>
                          {importResult.success && importResult.stats && (
                            <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                              <p>• Total rows: {importResult.stats.total_rows}</p>
                              <p>• Created: {importResult.stats.created}</p>
                              <p>• Updated: {importResult.stats.updated}</p>
                              <p>• Skipped: {importResult.stats.skipped}</p>
                              {importResult.stats.errors > 0 && <p>• Errors: {importResult.stats.errors}</p>}
                            </div>
                          )}
                          {importResult.warnings && importResult.warnings.length > 0 && (
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                              <p className="font-medium">Warnings:</p>
                              <ul className="list-disc list-inside">
                                {importResult.warnings.slice(0, 5).map((warning, i) => (
                                  <li key={i}>{warning}</li>
                                ))}
                                {importResult.warnings.length > 5 && (
                                  <li>... and {importResult.warnings.length - 5} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                          {!importResult.success && importResult.errors && (
                            <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                              <ul className="list-disc list-inside">
                                {importResult.errors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700/25">
                <button
                  type="button"
                  onClick={handleImportPriceHistory}
                  disabled={importing || !importFile}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:shadow-none dark:hover:bg-blue-400"
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportResult(null)
                  }}
                  disabled={importing}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/5 dark:hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Link to Xero Modal */}
      <LinkXeroContactModal
        isOpen={showLinkXeroModal}
        onClose={() => setShowLinkXeroModal(false)}
        contact={contact}
        onSuccess={(updatedContact) => {
          setContact({ ...contact, ...updatedContact })
          fetchContact()
        }}
      />
    </div>
  )
}
