import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon,
  GlobeAltIcon,
  IdentificationIcon,
  ArrowPathRoundedSquareIcon,
  CubeIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SupplierDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentTab, setCurrentTab] = useState('overview')

  useEffect(() => {
    loadSupplier()
  }, [id])

  const loadSupplier = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/suppliers/${id}`)
      setSupplier(response.supplier)
    } catch (err) {
      setError('Failed to load supplier')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteSupplier = async () => {
    if (!confirm('Are you sure you want to delete this supplier? This will unlink the contact.')) return

    try {
      await api.delete(`/api/v1/suppliers/${id}`)
      navigate('/suppliers')
    } catch (err) {
      alert('Failed to delete supplier')
      console.error(err)
    }
  }

  const getMatchBadge = () => {
    if (!supplier.contact_id) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircleIcon className="h-3 w-3" />
          Unmatched
        </span>
      )
    }

    if (supplier.is_verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircleIcon className="h-3 w-3" />
          Verified
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <ExclamationTriangleIcon className="h-3 w-3" />
        Needs Review
      </span>
    )
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          )
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating > 0 ? `${rating}/5` : 'No rating'}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading supplier...</div>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">{error || 'Supplier not found'}</div>
          <Link to="/suppliers" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Back to Suppliers
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { name: 'Overview', id: 'overview' },
    { name: 'Price Book', id: 'pricebook' },
    { name: 'Performance', id: 'performance' }
  ]

  return (
    <div className="min-h-full">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Suppliers
        </button>
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                  {supplier.name}
                </h1>
                {getMatchBadge()}
              </div>
              {supplier.contact && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Contact: {supplier.contact.full_name}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/suppliers/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={deleteSupplier}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="mt-4">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={classNames(
                    tab.id === currentTab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                    'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition'
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow-sm border border-gray-200 dark:border-gray-700 sm:p-6">
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <CubeIcon className="h-5 w-5" />
              Total Items
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {supplier.pricebook_items?.length || 0}
            </dd>
          </div>

          <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow-sm border border-gray-200 dark:border-gray-700 sm:p-6">
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="h-5 w-5" />
              Total Value
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              ${supplier.pricebook_items && supplier.pricebook_items.length > 0
                ? supplier.pricebook_items.reduce((sum, item) => sum + parseFloat(item.current_price || 0), 0).toFixed(2)
                : '0.00'}
            </dd>
          </div>

          <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow-sm border border-gray-200 dark:border-gray-700 sm:p-6">
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <ChartBarIcon className="h-5 w-5" />
              Response Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {parseFloat(supplier.response_rate || 0).toFixed(1)}%
            </dd>
          </div>

          <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow-sm border border-gray-200 dark:border-gray-700 sm:p-6">
            <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <TagIcon className="h-5 w-5" />
              Categories
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {supplier.pricebook_items && supplier.pricebook_items.length > 0
                ? new Set(supplier.pricebook_items.map((item) => item.category).filter(Boolean)).size
                : 0}
            </dd>
          </div>
        </dl>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Contact Information</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {supplier.email && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <EnvelopeIcon className="h-4 w-4" />
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                          {supplier.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {supplier.phone && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <PhoneIcon className="h-4 w-4" />
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a href={`tel:${supplier.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {supplier.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="sm:col-span-2">
                      <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-4 w-4" />
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supplier.address}</dd>
                    </div>
                  )}
                  {supplier.contact_person && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{supplier.contact_person}</dd>
                    </div>
                  )}
                  {supplier.contact_name && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{supplier.contact_name}</dd>
                    </div>
                  )}
                  {supplier.contact_number && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a href={`tel:${supplier.contact_number}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {supplier.contact_number}
                        </a>
                      </dd>
                    </div>
                  )}
                  {supplier.contact?.website && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <GlobeAltIcon className="h-4 w-4" />
                        Website
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a
                          href={supplier.contact.website.startsWith('http') ? supplier.contact.website : `https://${supplier.contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {supplier.contact.website}
                        </a>
                      </dd>
                    </div>
                  )}
                  {supplier.contact?.tax_number && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <IdentificationIcon className="h-4 w-4" />
                        Tax Number (ABN)
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{supplier.contact.tax_number}</dd>
                    </div>
                  )}
                  {supplier.contact?.xero_id && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                        Xero ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{supplier.contact.xero_id}</dd>
                    </div>
                  )}
                  {supplier.contact?.sync_with_xero !== null && supplier.contact?.sync_with_xero !== undefined && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                        Sync with Xero
                      </dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          supplier.contact.sync_with_xero
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {supplier.contact.sync_with_xero ? 'Enabled' : 'Disabled'}
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">System Information</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">#{supplier.id}</dd>
                  </div>
                  {supplier.created_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(supplier.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {supplier.updated_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(supplier.updated_at).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {supplier.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Notes</h3>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{supplier.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'pricebook' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Price Book Items ({supplier.pricebook_items?.length || 0})
              </h3>
            </div>
            {supplier.pricebook_items && supplier.pricebook_items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {supplier.pricebook_items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {item.item_code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {item.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.category || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                          ${parseFloat(item.current_price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This supplier has no items in their price book.</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Performance Metrics</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</dt>
                    <dd className="mt-2">{renderStars(supplier.rating || 0)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <ChartBarIcon className="h-4 w-4" />
                      Response Rate
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      {parseFloat(supplier.response_rate || 0).toFixed(1)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4" />
                      Average Response Time
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      {supplier.avg_response_time ? `${supplier.avg_response_time}h` : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
