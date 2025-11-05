import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { api } from '../api'
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  AdjustmentsHorizontalIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import ColumnVisibilityModal from '../components/modals/ColumnVisibilityModal'

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  // Column visibility state for Contacts tab
  const [visibleContactColumns, setVisibleContactColumns] = useState({
    name: true,
    email: true,
    phone: true,
    website: true,
    xero: true,
    actions: true
  })

  // Column visibility state for Clients tab
  const [visibleClientColumns, setVisibleClientColumns] = useState({
    supplier: true,
    rating: true,
    items: true,
    contact: true,
    status: true,
    actions: true
  })

  // Define available columns for each tab
  const contactColumns = [
    { key: 'name', label: 'Contact Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Numbers' },
    { key: 'website', label: 'Website' },
    { key: 'xero', label: 'Xero Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const clientColumns = [
    { key: 'supplier', label: 'Supplier Name' },
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

  const filteredContacts = contacts.filter(c =>
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const contactStats = {
    total: contacts.length,
    withEmail: contacts.filter(c => c.email).length,
    withPhone: contacts.filter(c => c.mobile_phone || c.office_phone).length,
    syncedXero: contacts.filter(c => c.sync_with_xero).length
  }

  const supplierStats = {
    total: suppliers.length,
    verified: suppliers.filter(s => s.is_verified).length,
    needsReview: suppliers.filter(s => s.contact_id && !s.is_verified).length,
    unmatched: suppliers.filter(s => !s.contact_id).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contacts & Suppliers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your contacts and supplier relationships</p>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup onChange={setActiveTab}>
        <TabList className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-8 max-w-md">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
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
              `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
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
            {/* Stats for Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Contacts</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{contactStats.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">With Email</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{contactStats.withEmail}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <EnvelopeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">With Phone</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{contactStats.withPhone}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <PhoneIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Synced with Xero</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{contactStats.syncedXero}</p>
                  </div>
                  <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <CheckCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
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
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowColumnModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Columns
              </button>
            </div>

            {/* Contacts Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <tr>
                      {visibleContactColumns.name && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact Name
                        </th>
                      )}
                      {visibleContactColumns.email && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                      )}
                      {visibleContactColumns.phone && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Phone Numbers
                        </th>
                      )}
                      {visibleContactColumns.website && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Website
                        </th>
                      )}
                      {visibleContactColumns.xero && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Xero Status
                        </th>
                      )}
                      {visibleContactColumns.actions && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                        {visibleContactColumns.name && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/contacts/${contact.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
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
                        {visibleContactColumns.email && (
                          <td className="px-6 py-4">
                            {contact.email ? (
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <EnvelopeIcon className="h-4 w-4" />
                                {contact.email}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </td>
                        )}
                        {visibleContactColumns.phone && (
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {contact.mobile_phone && (
                                <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                  <PhoneIcon className="h-4 w-4" />
                                  {contact.mobile_phone}
                                </div>
                              )}
                              {contact.office_phone && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <BuildingOfficeIcon className="h-4 w-4" />
                                  {contact.office_phone}
                                </div>
                              )}
                              {!contact.mobile_phone && !contact.office_phone && (
                                <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleContactColumns.website && (
                          <td className="px-6 py-4">
                            {contact.website ? (
                              <a
                                href={contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <GlobeAltIcon className="h-4 w-4" />
                                Visit
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </td>
                        )}
                        {visibleContactColumns.xero && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {contact.sync_with_xero ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Synced
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/50">
                                <XCircleIcon className="h-3.5 w-3.5" />
                                Not Synced
                              </span>
                            )}
                          </td>
                        )}
                        {visibleContactColumns.actions && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
            {/* Stats for Suppliers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Suppliers</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{supplierStats.total}</p>
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
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{supplierStats.verified}</p>
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
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{supplierStats.needsReview}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <CheckCircleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unmatched</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{supplierStats.unmatched}</p>
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

                <Link
                  to="/suppliers"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  Manage Suppliers
                </Link>
              </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <tr>
                      {visibleClientColumns.supplier && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Supplier
                        </th>
                      )}
                      {visibleClientColumns.rating && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rating
                        </th>
                      )}
                      {visibleClientColumns.items && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Items
                        </th>
                      )}
                      {visibleClientColumns.contact && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                      )}
                      {visibleClientColumns.status && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      {visibleClientColumns.actions && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                        {visibleClientColumns.supplier && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/suppliers/${supplier.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {supplier.name}
                            </Link>
                          </td>
                        )}
                        {visibleClientColumns.rating && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {supplier.rating || 0}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">/ 5</span>
                            </div>
                          </td>
                        )}
                        {visibleClientColumns.items && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {supplier.pricebook_items?.length || 0}
                            </span>
                          </td>
                        )}
                        {visibleClientColumns.contact && (
                          <td className="px-6 py-4">
                            {supplier.contact ? (
                              <span className="text-sm text-gray-900 dark:text-white font-medium">
                                {supplier.contact.full_name}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">No contact</span>
                            )}
                          </td>
                        )}
                        {visibleClientColumns.status && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {!supplier.contact_id ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
                                <XCircleIcon className="h-3.5 w-3.5" />
                                Unmatched
                              </span>
                            ) : supplier.is_verified ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50">
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Needs Review
                              </span>
                            )}
                          </td>
                        )}
                        {visibleClientColumns.actions && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
    </div>
  )
}
