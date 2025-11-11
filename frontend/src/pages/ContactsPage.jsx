import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { api } from '../api'
import {
  UserPlus,
  SlidersHorizontal,
  Phone,
  Mail,
  Globe,
  Building,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react'
import ColumnVisibilityModal from '../components/modals/ColumnVisibilityModal'
import Toast from '../components/Toast'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ContactsPage() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState([])

  // Bulk selection state
  const [selectedContacts, setSelectedContacts] = useState(new Set())
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [bulkContactType, setBulkContactType] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updatingContactId, setUpdatingContactId] = useState(null)
  const [toast, setToast] = useState(null)

  // Column visibility state for Contacts tab
  const [visibleContactColumns, setVisibleContactColumns] = useState({
    name: true,
    type: true,
    email: true,
    phone: true,
    website: true,
    xero: true,
    actions: true
  })

  // Column visibility state for Clients tab
  const [visibleClientColumns, setVisibleClientColumns] = useState({
    supplier: true,
    categories: true,
    rating: true,
    items: true,
    contact: true,
    status: true,
    actions: true
  })

  // Define available columns for each tab
  const contactColumns = [
    { key: 'name', label: 'Contact Name' },
    { key: 'type', label: 'Contact Type' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Numbers' },
    { key: 'website', label: 'Website' },
    { key: 'xero', label: 'Xero Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const clientColumns = [
    { key: 'supplier', label: 'Supplier Name' },
    { key: 'categories', label: 'Trade Categories' },
    { key: 'rating', label: 'Rating' },
    { key: 'items', label: 'Items Count' },
    { key: 'contact', label: 'Supplier Details' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  useEffect(() => {
    loadContacts()
    loadSuppliers()
  }, [])

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

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/contacts')
      setContacts(response.contacts || [])
    } catch (err) {
      setError('Failed to load contacts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/api/v1/suppliers')
      setSuppliers(response.suppliers || [])
    } catch (err) {
      console.error('Failed to load suppliers:', err)
    }
  }

  const toggleContactColumn = (columnKey) => {
    setVisibleContactColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  const toggleClientColumn = (columnKey) => {
    setVisibleClientColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // Bulk selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)))
    } else {
      setSelectedContacts(new Set())
    }
  }

  const handleSelectContact = (contactId, checked) => {
    const newSelected = new Set(selectedContacts)
    if (checked) {
      newSelected.add(contactId)
    } else {
      newSelected.delete(contactId)
    }
    setSelectedContacts(newSelected)
  }

  const handleBulkUpdate = async () => {
    if (selectedContacts.size === 0) return

    setUpdating(true)
    try {
      const response = await api.patch('/api/v1/contacts/bulk_update', {
        contact_ids: Array.from(selectedContacts),
        contact_types: [bulkContactType],
        primary_contact_type: bulkContactType
      })

      if (response.success) {
        setToast({
          message: `Successfully updated ${response.updated_count} contact${response.updated_count !== 1 ? 's' : ''} to ${bulkContactType}`,
          type: 'success'
        })
        setSelectedContacts(new Set())
        loadContacts() // Refresh the list
      }
    } catch (error) {
      console.error('Bulk update error:', error)
      setToast({
        message: 'Failed to update contacts. Please try again.',
        type: 'error'
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleClearSelection = () => {
    setSelectedContacts(new Set())
  }

  const handleUpdateSingleContact = async (contactId, newTypes, newPrimaryType) => {
    setUpdatingContactId(contactId)
    try {
      await api.patch(`/api/v1/contacts/${contactId}`, {
        contact: {
          contact_types: newTypes,
          primary_contact_type: newPrimaryType
        }
      })
      setToast({
        message: `Contact types updated`,
        type: 'success'
      })
      await loadContacts() // Refresh the list
    } catch (error) {
      console.error('Update error:', error)
      setToast({
        message: 'Failed to update contact. Please try again.',
        type: 'error'
      })
    } finally {
      setUpdatingContactId(null)
    }
  }

  const getTypeBadge = (type) => {
    const badges = {
      customer: {
        label: 'Customer',
        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400'
      },
      supplier: {
        label: 'Supplier',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500'
      },
      sales: {
        label: 'Sales',
        className: 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400'
      },
      land_agent: {
        label: 'Land Agent',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400'
      }
    }
    return badges[type] || badges.customer
  }

  // Get unique categories from all suppliers
  const allCategories = Array.from(
    new Set(
      suppliers.flatMap(s => s.trade_categories || [])
    )
  ).sort()

  // Memoize filtered contacts to prevent recalculation on every render
  const filteredContacts = useMemo(() => {
    return contacts.filter(c =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [contacts, searchQuery])

  // Memoize filtered suppliers to prevent recalculation on every render
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // Filter by search query
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by selected categories (if any selected)
      const matchesCategories = selectedCategories.length === 0 ||
        selectedCategories.some(cat => s.trade_categories?.includes(cat))

      return matchesSearch && matchesCategories
    })
  }, [suppliers, searchQuery, selectedCategories])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-gray-800 p-1 mb-8 max-w-md">
          <div className="flex space-x-1">
            <div className="h-8 flex-1 bg-gray-700 rounded animate-pulse" />
            <div className="h-8 flex-1 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Actions Bar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 h-9 bg-gray-900 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="h-9 w-32 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton - Same structure as real table */}
        <div className="bg-gray-800 border border-gray-700">
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="bg-gray-900/50 h-10 border-b border-gray-700 animate-pulse" />
            {/* Table Rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-12 border-b border-gray-700 bg-gray-800/30 animate-pulse" />
            ))}
          </div>
        </div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-sm font-medium text-gray-900 dark:text-white">Contacts & Suppliers</h1>
      </div>

      {/* Tabs */}
      <TabGroup onChange={setActiveTab}>
        <TabList className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 mb-8 max-w-md">
          <Tab
            className={({ selected }) =>
              `w-full py-1.5 px-3 text-xs font-medium leading-5 transition-all
              ${
                selected
                  ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Contacts ({contacts.length})
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full py-1.5 px-3 text-xs font-medium leading-5 transition-all
              ${
                selected
                  ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Suppliers ({suppliers.length})
          </Tab>
        </TabList>

        <TabPanels>
          {/* Contacts Tab */}
          <TabPanel>
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Lookup.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-900 text-xs font-sans text-white placeholder:text-gray-500 outline-none transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowColumnModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Columns
                </button>

                <button
                  onClick={() => navigate('/suppliers/new')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  New Contact
                </button>
              </div>
            </div>

            {/* Bulk Update Toolbar */}
            {selectedContacts.size > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
                  </span>

                  <div className="flex items-center gap-2">
                    <label htmlFor="bulk-contact-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Change type to:
                    </label>
                    <select
                      id="bulk-contact-type"
                      value={bulkContactType}
                      onChange={(e) => setBulkContactType(e.target.value)}
                      className="block border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">Select type...</option>
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="sales">Sales</option>
                      <option value="land_agent">Land Agent</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkUpdate}
                    disabled={updating || !bulkContactType || selectedContacts.size === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                  >
                    {updating ? (
                      <>
                        <span className="loading loading-sm"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        Update Type
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Contacts Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 cursor-pointer"
                        />
                      </th>
                      {visibleContactColumns.name && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact Name
                        </th>
                      )}
                      {visibleContactColumns.type && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact Type
                        </th>
                      )}
                      {visibleContactColumns.email && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                      )}
                      {visibleContactColumns.phone && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Phone Numbers
                        </th>
                      )}
                      {visibleContactColumns.website && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Website
                        </th>
                      )}
                      {visibleContactColumns.xero && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Xero Status
                        </th>
                      )}
                      {visibleContactColumns.actions && (
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className={`transition-colors duration-150 ${
                          selectedContacts.has(contact.id)
                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedContacts.has(contact.id)}
                            onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                            className="h-4 w-4 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 cursor-pointer"
                          />
                        </td>
                        {visibleContactColumns.name && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <Link
                              to={`/contacts/${contact.id}`}
                              className="text-xs font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {contact.full_name}
                            </Link>
                            {(contact.first_name || contact.last_name) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {contact.first_name} {contact.last_name}
                              </div>
                            )}
                          </td>
                        )}
                        {visibleContactColumns.type && (
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {updatingContactId === contact.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="loading loading-sm"></span>
                                  <span className="text-xs text-gray-500">Updating...</span>
                                </div>
                              ) : contact.primary_contact_type ? (
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenDropdownId(openDropdownId === contact.id ? null : contact.id)
                                    }}
                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getTypeBadge(contact.primary_contact_type).className}`}
                                  >
                                    {getTypeBadge(contact.primary_contact_type).label}
                                    <ChevronDown className="ml-1 h-3 w-3" />
                                  </button>
                                  {openDropdownId === contact.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setOpenDropdownId(null)}
                                      />
                                      <div className="absolute z-20 mt-1 w-56 bg-white dark:bg-gray-800 shadow-lg py-2 text-sm border border-gray-200 dark:border-gray-700">
                                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                          Select Types
                                        </div>
                                        {['customer', 'supplier', 'sales', 'land_agent'].map((type) => {
                                          const badge = getTypeBadge(type)
                                          const isSelected = contact.contact_types?.includes(type)
                                          const isPrimary = contact.primary_contact_type === type
                                          return (
                                            <div
                                              key={type}
                                              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            >
                                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                  type="checkbox"
                                                  checked={isSelected}
                                                  onChange={() => {
                                                    const currentTypes = contact.contact_types || []
                                                    let newTypes
                                                    let newPrimaryType = contact.primary_contact_type

                                                    if (isSelected) {
                                                      newTypes = currentTypes.filter(t => t !== type)
                                                      if (isPrimary) {
                                                        newPrimaryType = newTypes[0] || null
                                                      }
                                                    } else {
                                                      newTypes = [...currentTypes, type]
                                                    }

                                                    handleUpdateSingleContact(contact.id, newTypes, newPrimaryType)
                                                  }}
                                                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                />
                                                <span className={isSelected ? 'font-medium' : 'font-normal'}>
                                                  {badge.label}
                                                </span>
                                              </label>
                                              {isSelected && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleUpdateSingleContact(contact.id, contact.contact_types, type)
                                                  }}
                                                  className={`text-xs px-2 py-0.5 ${
                                                    isPrimary
                                                      ? 'bg-indigo-600 text-white'
                                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                  }`}
                                                >
                                                  {isPrimary ? 'Primary' : 'Set Primary'}
                                                </button>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">No type</span>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleContactColumns.email && (
                          <td className="px-3 py-2.5">
                            {contact.email ? (
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                {contact.email}
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </td>
                        )}
                        {visibleContactColumns.phone && (
                          <td className="px-3 py-2.5">
                            <div className="space-y-1">
                              {contact.mobile_phone && (
                                <div className="text-xs text-gray-900 dark:text-white flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5" />
                                  {contact.mobile_phone}
                                </div>
                              )}
                              {contact.office_phone && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <Building className="h-3.5 w-3.5" />
                                  {contact.office_phone}
                                </div>
                              )}
                              {!contact.mobile_phone && !contact.office_phone && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleContactColumns.website && (
                          <td className="px-3 py-2.5">
                            {contact.website ? (
                              <a
                                href={contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                Visit
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </td>
                        )}
                        {visibleContactColumns.xero && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {contact.sync_with_xero ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Synced
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/50">
                                <XCircle className="h-3.5 w-3.5" />
                                Not Synced
                              </span>
                            )}
                          </td>
                        )}
                        {visibleContactColumns.actions && (
                          <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-medium">
                            <Link
                              to={`/contacts/${contact.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View
                            </Link>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabPanel>

          {/* Suppliers Tab */}
          <TabPanel>
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Lookup.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-900 text-xs font-sans text-white placeholder:text-gray-500 outline-none transition-colors"
                />
              </div>

              <div className="flex gap-2">
                {/* Category Filter */}
                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors min-w-[140px] justify-between outline-none">
                    <span className="truncate">
                      {selectedCategories.length === 0
                        ? 'All Categories'
                        : `${selectedCategories.length} selected`}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 z-50 mt-1 min-w-[240px] max-h-60 overflow-auto origin-top-right rounded-none bg-gray-900 border border-gray-800 p-1 shadow-lg focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                  >
                    {allCategories.map((category) => {
                      const isSelected = selectedCategories.includes(category)
                      return (
                        <MenuItem key={category}>
                          {({ focus }) => (
                            <button
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category))
                                } else {
                                  setSelectedCategories([...selectedCategories, category])
                                }
                              }}
                              className={classNames(
                                focus ? 'bg-gray-800 text-white' : 'text-gray-300',
                                'flex items-center gap-2 rounded-none h-8 px-3 text-xs outline-none cursor-pointer transition-colors duration-200 w-full text-left'
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={isSelected ? 'font-medium' : 'font-normal'}>
                                  {category}
                                </span>
                                {isSelected && (
                                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                                )}
                              </div>
                            </button>
                          )}
                        </MenuItem>
                      )
                    })}

                    {selectedCategories.length > 0 && (
                      <>
                        <div className="h-px bg-gray-800 my-1" />
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              onClick={() => setSelectedCategories([])}
                              className={classNames(
                                focus ? 'bg-gray-800 text-white' : 'text-gray-300',
                                'flex items-center gap-2 rounded-none h-8 px-3 text-xs outline-none cursor-pointer transition-colors duration-200 w-full text-left'
                              )}
                            >
                              Clear All
                            </button>
                          )}
                        </MenuItem>
                      </>
                    )}
                  </MenuItems>
                </Menu>

                <button
                  onClick={() => setShowColumnModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Columns
                </button>

                <button
                  onClick={() => navigate('/suppliers/new')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  New Contact
                </button>
              </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      {visibleClientColumns.supplier && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Supplier
                        </th>
                      )}
                      {visibleClientColumns.categories && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Trade Categories
                        </th>
                      )}
                      {visibleClientColumns.rating && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rating
                        </th>
                      )}
                      {visibleClientColumns.items && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Items
                        </th>
                      )}
                      {visibleClientColumns.contact && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                      )}
                      {visibleClientColumns.status && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      {visibleClientColumns.actions && (
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                        {visibleClientColumns.supplier && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <Link
                              to={`/suppliers/${supplier.id}`}
                              className="text-xs font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {supplier.name}
                            </Link>
                          </td>
                        )}
                        {visibleClientColumns.categories && (
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-1.5">
                              {supplier.trade_categories && supplier.trade_categories.length > 0 ? (
                                supplier.trade_categories.slice(0, 3).map((category, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                                  >
                                    {category}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                              )}
                              {supplier.trade_categories && supplier.trade_categories.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                                  +{supplier.trade_categories.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleClientColumns.rating && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-mono text-gray-900 dark:text-white">
                                {supplier.rating || 0}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">/ 5</span>
                            </div>
                          </td>
                        )}
                        {visibleClientColumns.items && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-xs font-mono text-gray-900 dark:text-white">
                              {supplier.pricebook_items?.length || 0}
                            </span>
                          </td>
                        )}
                        {visibleClientColumns.contact && (
                          <td className="px-3 py-2.5">
                            {supplier.contact ? (
                              <span className="text-xs text-gray-900 dark:text-white font-medium">
                                {supplier.contact.full_name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">No contact</span>
                            )}
                          </td>
                        )}
                        {visibleClientColumns.status && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {!supplier.contact_id ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
                                <XCircle className="h-3.5 w-3.5" />
                                Unmatched
                              </span>
                            ) : supplier.is_verified ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Needs Review
                              </span>
                            )}
                          </td>
                        )}
                        {visibleClientColumns.actions && (
                          <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-medium">
                            <Link
                              to={`/suppliers/${supplier.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View
                            </Link>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Column Visibility Modal */}
      <ColumnVisibilityModal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        columns={activeTab === 0 ? contactColumns : clientColumns}
        visibleColumns={activeTab === 0 ? visibleContactColumns : visibleClientColumns}
        onToggleColumn={activeTab === 0 ? toggleContactColumn : toggleClientColumn}
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
