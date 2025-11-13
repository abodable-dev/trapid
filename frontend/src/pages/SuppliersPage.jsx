import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  UserPlusIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import ColumnVisibilityModal from '../components/modals/ColumnVisibilityModal'
import EditSupplierModal from '../components/suppliers/EditSupplierModal'
import Toast from '../components/Toast'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [matchStatus, setMatchStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [photoAttachedFilter, setPhotoAttachedFilter] = useState('')
  const [isMatching, setIsMatching] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [toast, setToast] = useState(null)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    supplier: true,
    rating: true,
    items: true,
    contact: true,
    status: true,
    actions: true
  })

  // Define all available columns
  const availableColumns = [
    { key: 'supplier', label: 'Supplier Name' },
    { key: 'rating', label: 'Rating' },
    { key: 'items', label: 'Items Count' },
    { key: 'contact', label: 'Supplier Details' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  useEffect(() => {
    loadSuppliers()
    loadContacts()
  }, [matchStatus, photoAttachedFilter])

  // Listen for global search event from AppLayout
  useEffect(() => {
    const handleGlobalSearch = (event) => {
      setSearchQuery(event.detail)
    }

    window.addEventListener('global-search', handleGlobalSearch)
    return () => {
      window.removeEventListener('global-search', handleGlobalSearch)
    }
  }, [])

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier)
    setShowEditModal(true)
  }

  const handleSaveSupplier = async (supplierId, formData) => {
    try {
      const response = await api.patch(`/api/v1/suppliers/${supplierId}`, {
        supplier: formData
      })

      if (response.success) {
        setToast({
          message: 'Supplier updated successfully',
          type: 'success'
        })
        setShowEditModal(false)
        loadSuppliers() // Refresh the list
      }
    } catch (error) {
      console.error('Update error:', error)
      throw error // Re-throw to be handled by the modal
    }
  }

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (matchStatus !== 'all') params.append('match_status', matchStatus)
      if (photoAttachedFilter) params.append('photo_attached', photoAttachedFilter)

      const response = await api.get(`/api/v1/suppliers?${params.toString()}`)
      setSuppliers(response.suppliers || [])
    } catch (err) {
      setError('Failed to load suppliers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      const response = await api.get('/api/v1/contacts')
      setContacts(response.contacts || [])
    } catch (err) {
      console.error('Failed to load contacts:', err)
    }
  }

  const runAutoMatch = async () => {
    setIsMatching(true)
    try {
      const response = await api.post('/api/v1/suppliers/auto_match', {
        threshold: 0.7,
        verify_exact: false
      })

      alert(`✓ Matched ${response.matched_count} suppliers!`)
      loadSuppliers()
    } catch (err) {
      alert('Failed to run auto-matching')
      console.error(err)
    } finally {
      setIsMatching(false)
    }
  }

  const linkSupplierToContact = async () => {
    if (!selectedSupplier || !selectedContact) return

    try {
      await api.post(`/api/v1/suppliers/${selectedSupplier.id}/link_contact`, {
        contact_id: selectedContact.id
      })

      setShowLinkModal(false)
      setSelectedSupplier(null)
      setSelectedContact(null)
      loadSuppliers()
    } catch (err) {
      alert('Failed to link supplier')
      console.error(err)
    }
  }

  const verifyMatch = async (supplierId) => {
    try {
      await api.post(`/api/v1/suppliers/${supplierId}/verify_match`)
      loadSuppliers()
    } catch (err) {
      alert('Failed to verify match')
      console.error(err)
    }
  }

  const unlinkSupplier = async (supplierId) => {
    if (!confirm('Are you sure you want to unlink this supplier?')) return

    try {
      await api.post(`/api/v1/suppliers/${supplierId}/unlink_contact`)
      loadSuppliers()
    } catch (err) {
      alert('Failed to unlink supplier')
      console.error(err)
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: suppliers.length,
    verified: suppliers.filter(s => s.is_verified).length,
    needsReview: suppliers.filter(s => s.contact_id && !s.is_verified).length,
    unmatched: suppliers.filter(s => !s.contact_id).length
  }

  const getMatchBadge = (supplier) => {
    if (!supplier.contact_id) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
          <XCircleIcon className="h-3.5 w-3.5" />
          Unmatched
        </span>
      )
    }

    if (supplier.is_verified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Verified
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500">
        <ExclamationTriangleIcon className="h-3.5 w-3.5" />
        Needs Review
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading suppliers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Supplier Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage supplier-contact relationships and verify matches</p>
        </div>
        <Link
          to="/suppliers/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 self-start sm:self-auto font-medium"
        >
          <UserPlusIcon className="h-5 w-5" />
          New Supplier
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Suppliers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <UserPlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.verified}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Needs Review</p>
              <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-500 mt-2">{stats.needsReview}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-400/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-800 dark:text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unmatched</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.unmatched}</p>
            </div>
            <div className="h-12 w-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowColumnModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Columns
          </button>

          <select
            value={matchStatus}
            onChange={(e) => setMatchStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Suppliers</option>
            <option value="verified">Verified</option>
            <option value="needs_review">Needs Review</option>
            <option value="unmatched">Unmatched</option>
          </select>

          <select
            value={photoAttachedFilter}
            onChange={(e) => setPhotoAttachedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Photo Attached</option>
            <option value="true">With Photo</option>
            <option value="false">No Photo</option>
          </select>

          <button
            onClick={runAutoMatch}
            disabled={isMatching}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isMatching ? 'animate-spin' : ''}`} />
            {isMatching ? 'Matching...' : 'Run Auto-Match'}
          </button>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="w-full h-full overflow-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}>
          <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
              <tr>
                {visibleColumns.supplier && (
                  <th style={{ minWidth: '200px' }} className="px-6 py-3 border-r border-gray-200 dark:border-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Supplier
                  </th>
                )}
                {visibleColumns.rating && (
                  <th style={{ minWidth: '100px' }} className="px-6 py-3 border-r border-gray-200 dark:border-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                )}
                {visibleColumns.items && (
                  <th style={{ minWidth: '100px' }} className="px-6 py-3 border-r border-gray-200 dark:border-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                )}
                {visibleColumns.contact && (
                  <th style={{ minWidth: '250px' }} className="px-6 py-3 border-r border-gray-200 dark:border-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Supplier Details
                  </th>
                )}
                {visibleColumns.status && (
                  <th style={{ minWidth: '150px' }} className="px-6 py-3 border-r border-gray-200 dark:border-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {visibleColumns.actions && (
                  <th style={{ minWidth: '150px' }} className="px-6 py-3 border-r border-gray-200 dark:border-gray-700 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                  {visibleColumns.supplier && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {supplier.name}
                      </Link>
                    </td>
                  )}
                  {visibleColumns.rating && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {supplier.rating || 0}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">/ 5</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.items && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {supplier.pricebook_items?.length || 0}
                      </span>
                    </td>
                  )}
                  {visibleColumns.contact && (
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {supplier.contact ? (
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {supplier.contact.full_name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No contact</span>
                        )}

                        {/* Email addresses */}
                        {supplier.contact_emails && supplier.contact_emails.length > 0 && (
                          <div className="space-y-0.5">
                            {supplier.contact_emails.map((email, idx) => (
                              <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                {email}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Phone numbers */}
                        {supplier.contact_phones && supplier.contact_phones.length > 0 && (
                          <div className="space-y-0.5">
                            {supplier.contact_phones.map((phone, idx) => (
                              <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                {phone}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMatchBadge(supplier)}
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit supplier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {!supplier.contact_id && (
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              setShowLinkModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Link
                          </button>
                        )}
                        {supplier.contact_id && !supplier.is_verified && (
                          <button
                            onClick={() => verifyMatch(supplier.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Verify
                          </button>
                        )}
                        {supplier.contact_id && (
                          <button
                            onClick={() => unlinkSupplier(supplier.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Unlink
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Link Supplier Modal */}
    {showLinkModal && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowLinkModal(false)} />

          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Link Supplier to Contact
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supplier
              </label>
              <div className="text-sm text-gray-900 dark:text-white font-medium">
                {selectedSupplier?.name}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact
              </label>
              <select
                value={selectedContact?.id || ''}
                onChange={(e) => {
                  const contact = contacts.find(c => c.id === parseInt(e.target.value))
                  setSelectedContact(contact)
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a contact...</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={linkSupplierToContact}
                disabled={!selectedContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Link Supplier
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Column Visibility Modal */}
    <ColumnVisibilityModal
      isOpen={showColumnModal}
      onClose={() => setShowColumnModal(false)}
      columns={availableColumns}
      visibleColumns={visibleColumns}
      onToggleColumn={toggleColumn}
    />

    {/* Edit Supplier Modal */}
    <EditSupplierModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      supplier={editingSupplier}
      onSave={handleSaveSupplier}
    />

    {/* Toast Notification */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
  </div>
  )
}
