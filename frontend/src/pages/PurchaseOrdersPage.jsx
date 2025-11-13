import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import POTable from '../components/purchase-orders/POTable'

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadPurchaseOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/purchase_orders')
      setPurchaseOrders(response.purchase_orders || response || [])
    } catch (err) {
      console.error('Failed to load purchase orders:', err)
      setPurchaseOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (poId) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) {
      return
    }

    try {
      await api.delete(`/api/v1/purchase_orders/${poId}`)
      await loadPurchaseOrders()
    } catch (err) {
      console.error('Failed to delete purchase order:', err)
      alert('Failed to delete purchase order. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading purchase orders...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            View and manage all purchase orders across all jobs.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/active-jobs"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            New Purchase Order
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Purchase Orders</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {purchaseOrders.length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Draft</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {purchaseOrders.filter(po => po.status === 'draft').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approval</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {purchaseOrders.filter(po => po.status === 'pending').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Sent</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {purchaseOrders.filter(po => po.status === 'sent').length}
          </dd>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="mt-6">
        <POTable
          purchaseOrders={purchaseOrders}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
