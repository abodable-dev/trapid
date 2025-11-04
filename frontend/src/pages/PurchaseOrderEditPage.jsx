import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function PurchaseOrderEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({
    supplier_id: '',
    description: '',
    delivery_address: '',
    special_instructions: '',
    budget: '',
    required_date: '',
    ordered_date: '',
    expected_delivery_date: '',
    ted_task: '',
    estimation_check: false,
    part_payment: false
  })

  useEffect(() => {
    loadPurchaseOrder()
    loadSuppliers()
  }, [id])

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/api/v1/suppliers')
      setSuppliers(response.suppliers || [])
    } catch (err) {
      console.error('Failed to load suppliers:', err)
    }
  }

  const loadPurchaseOrder = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/purchase_orders/${id}`)
      const po = response

      setFormData({
        supplier_id: po.supplier_id || '',
        description: po.description || '',
        delivery_address: po.delivery_address || '',
        special_instructions: po.special_instructions || '',
        budget: po.budget || '',
        required_date: po.required_date || '',
        ordered_date: po.ordered_date || '',
        expected_delivery_date: po.expected_delivery_date || '',
        ted_task: po.ted_task || '',
        estimation_check: po.estimation_check || false,
        part_payment: po.part_payment || false
      })
    } catch (err) {
      setError('Failed to load purchase order')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await api.put(`/api/v1/purchase_orders/${id}`, { purchase_order: formData })
      navigate(`/purchase-orders/${id}`)
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || 'Failed to update purchase order')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading purchase order...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to={`/purchase-orders/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Purchase Order
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Purchase Order
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/10 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Supplier
            </label>
            <select
              id="supplier_id"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="">Select a supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="ted_task" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Description
            </label>
            <textarea
              id="ted_task"
              name="ted_task"
              rows={2}
              value={formData.ted_task}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget
            </label>
            <input
              type="number"
              step="0.01"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="required_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Required Date
            </label>
            <input
              type="date"
              id="required_date"
              name="required_date"
              value={formData.required_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="ordered_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ordered Date
            </label>
            <input
              type="date"
              id="ordered_date"
              name="ordered_date"
              value={formData.ordered_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Delivery Date
            </label>
            <input
              type="date"
              id="expected_delivery_date"
              name="expected_delivery_date"
              value={formData.expected_delivery_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Delivery Address
            </label>
            <textarea
              id="delivery_address"
              name="delivery_address"
              rows={3}
              value={formData.delivery_address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Special Instructions
            </label>
            <textarea
              id="special_instructions"
              name="special_instructions"
              rows={3}
              value={formData.special_instructions}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="estimation_check"
              name="estimation_check"
              checked={formData.estimation_check}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="estimation_check" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Estimation Check
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="part_payment"
              name="part_payment"
              checked={formData.part_payment}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="part_payment" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Part Payment
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to={`/purchase-orders/${id}`}
            className="rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
