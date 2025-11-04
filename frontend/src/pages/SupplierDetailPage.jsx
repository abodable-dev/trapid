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
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function SupplierDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {supplier.name}
              </h1>
              {getMatchBadge()}
            </div>
            {supplier.contact && (
              <p className="text-gray-600 dark:text-gray-400">
                Contact:{' '}
                <Link
                  to={`/contacts/${supplier.contact.id}`}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {supplier.contact.full_name}
                </Link>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/suppliers/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PencilIcon className="h-5 w-5" />
              Edit
            </button>
            <button
              onClick={deleteSupplier}
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
          {(supplier.email || supplier.phone || supplier.address) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>

              <div className="space-y-4">
                {supplier.email && (
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        {supplier.email}
                      </a>
                    </div>
                  </div>
                )}

                {supplier.phone && (
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <a href={`tel:${supplier.phone}`} className="text-gray-900 dark:text-white">
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                )}

                {supplier.address && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-white">{supplier.address}</p>
                    </div>
                  </div>
                )}

                {supplier.contact_person && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact Person</p>
                    <p className="text-gray-900 dark:text-white font-medium">{supplier.contact_person}</p>
                  </div>
                )}

                {supplier.contact_name && (
                  <div className={supplier.contact_person ? "" : "pt-4 border-t border-gray-200 dark:border-gray-700"}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">{supplier.contact_name}</p>
                  </div>
                )}

                {supplier.contact_number && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact Number</p>
                    <a href={`tel:${supplier.contact_number}`} className="text-gray-900 dark:text-white">
                      {supplier.contact_number}
                    </a>
                  </div>
                )}

                {supplier.contact?.website && (
                  <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                      <a
                        href={supplier.contact.website.startsWith('http') ? supplier.contact.website : `https://${supplier.contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {supplier.contact.website}
                      </a>
                    </div>
                  </div>
                )}

                {supplier.contact?.tax_number && (
                  <div className="flex items-start gap-3">
                    <IdentificationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tax Number (ABN)</p>
                      <p className="text-gray-900 dark:text-white font-mono">{supplier.contact.tax_number}</p>
                    </div>
                  </div>
                )}

                {supplier.contact?.xero_id && (
                  <div className="flex items-start gap-3">
                    <ArrowPathRoundedSquareIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Xero ID</p>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">{supplier.contact.xero_id}</p>
                    </div>
                  </div>
                )}

                {supplier.contact?.sync_with_xero !== null && supplier.contact?.sync_with_xero !== undefined && (
                  <div className="flex items-start gap-3">
                    <ArrowPathRoundedSquareIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sync with Xero</p>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        supplier.contact.sync_with_xero
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {supplier.contact.sync_with_xero ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rating</p>
                {renderStars(supplier.rating || 0)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Response Rate</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ChartBarIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {parseFloat(supplier.response_rate || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {supplier.avg_response_time ? `${supplier.avg_response_time}h` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  supplier.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {supplier.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {supplier.notes && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
                  <p className="text-gray-900 dark:text-white">{supplier.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Book Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Price Book Items ({supplier.pricebook_items?.length || 0})
            </h2>

            {supplier.pricebook_items && supplier.pricebook_items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {supplier.pricebook_items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                          {item.item_code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.item_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.category || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                          ${parseFloat(item.current_price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No items in price book</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Items</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {supplier.pricebook_items?.length || 0}
                </span>
              </div>

              {supplier.pricebook_items && supplier.pricebook_items.length > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Avg Price</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      $
                      {(
                        supplier.pricebook_items.reduce((sum, item) => sum + parseFloat(item.current_price || 0), 0) /
                        supplier.pricebook_items.length
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Value</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      $
                      {supplier.pricebook_items
                        .reduce((sum, item) => sum + parseFloat(item.current_price || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Categories</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Set(supplier.pricebook_items.map((item) => item.category).filter(Boolean)).size}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Info</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Supplier ID</p>
                <p className="text-gray-900 dark:text-white font-mono text-sm">#{supplier.id}</p>
              </div>

              {supplier.created_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {supplier.updated_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {new Date(supplier.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
