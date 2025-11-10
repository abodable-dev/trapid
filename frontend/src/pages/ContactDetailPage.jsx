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
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
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

  useEffect(() => {
    loadContact()
    loadAllContacts()
    loadCurrentContactCategories()
  }, [id])

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
        set_as_default: setAsDefaultSupplier
      }

      // Add effective date if provided
      if (effectiveDate) {
        requestData.effective_date = effectiveDate
      }

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
      notes: contact.notes || ''
    })
    setIsEditModalOpen(true)
  }

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <PencilIcon className="h-5 w-5" />
              Edit
            </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>

            <div className="space-y-4">
              {contact.email && (
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}

              {contact.mobile_phone && (
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Phone</p>
                    <a href={`tel:${contact.mobile_phone}`} className="text-gray-900 dark:text-white">
                      {contact.mobile_phone}
                    </a>
                  </div>
                </div>
              )}

              {contact.office_phone && (
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Office Phone</p>
                    <a href={`tel:${contact.office_phone}`} className="text-gray-900 dark:text-white">
                      {contact.office_phone}
                    </a>
                  </div>
                </div>
              )}

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

              {!contact.email && !contact.mobile_phone && !contact.office_phone && !contact.website && (
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
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Not linked to Xero
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contact.tax_number && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tax Number (ABN)</p>
                  <p className="text-gray-900 dark:text-white font-medium">{contact.tax_number}</p>
                </div>
              )}

              {contact.branch !== null && contact.branch !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Branch</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {contact.branch ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>

            {!contact.tax_number && contact.branch === null && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">No additional business details available</p>
            )}
          </div>


          {/* Copy Price History - Only show for supplier contacts */}
          {contact['is_supplier?'] && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Copy Price History & Items
              </h2>

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
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
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

                    {/* Effective Date */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
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
          )}

          {/* Remove from Categories - Only show for supplier contacts */}
          {contact['is_supplier?'] && currentContactCategories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Remove from Categories
              </h2>

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

          {/* Price Book - Only show for supplier contacts */}
          {contact['is_supplier?'] && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CubeIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Price Book Items
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50">
                      {contact.pricebook_items?.length || 0} items
                    </span>
                  </div>
                  {contact.pricebook_items && contact.pricebook_items.length > 0 && (
                    <button
                      onClick={handleExportPriceHistory}
                      disabled={exporting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      {exporting ? 'Exporting...' : 'Export to Excel'}
                    </button>
                  )}
                </div>
              </div>
              {contact.pricebook_items && contact.pricebook_items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          Code
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          Item Name
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          Current Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {contact.pricebook_items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                            ${parseFloat(item.current_price || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <CubeIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-4 text-base font-medium text-gray-900 dark:text-white">No items in price book</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    This supplier doesn't have any items in their price book yet.
                  </p>
                </div>
              )}
            </div>
          )}
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
            </div>
          </div>

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
                        <input
                          type="text"
                          id="tax_number"
                          value={editFormData?.tax_number || ''}
                          onChange={(e) => handleEditChange('tax_number', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
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
    </div>
  )
}
