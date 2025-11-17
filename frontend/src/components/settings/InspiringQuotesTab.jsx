import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { api } from '../../api'
import DataTable from '../DataTable'

export default function InspiringQuotesTab() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingQuote, setEditingQuote] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    category: '',
    aussie_slang: '',
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/v1/inspiring_quotes')
      if (response.success) {
        setQuotes(response.data)
      }
    } catch (error) {
      console.error('Failed to load quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingQuote) {
        await api.put(`/api/v1/inspiring_quotes/${editingQuote.id}`, {
          inspiring_quote: formData
        })
      } else {
        await api.post('/api/v1/inspiring_quotes', {
          inspiring_quote: formData
        })
      }
      loadQuotes()
      resetForm()
    } catch (error) {
      console.error('Failed to save quote:', error)
      alert('Failed to save quote')
    }
  }

  const handleEdit = (quote) => {
    setEditingQuote(quote)
    setFormData({
      quote: quote.original_quote || quote.quote,
      author: quote.author || '',
      category: quote.category || '',
      aussie_slang: quote.aussie_slang || '',
      is_active: quote.is_active,
      display_order: quote.display_order
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quote?')) return

    try {
      await api.delete(`/api/v1/inspiring_quotes/${id}`)
      loadQuotes()
    } catch (error) {
      console.error('Failed to delete quote:', error)
      alert('Failed to delete quote')
    }
  }

  const resetForm = () => {
    setFormData({
      quote: '',
      author: '',
      category: '',
      aussie_slang: '',
      is_active: true,
      display_order: 0
    })
    setEditingQuote(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading quotes...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingQuote ? 'Edit Quote' : 'Add New Quote'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Bible Verse *
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter the original Bible verse..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aussie Slang Version (Displayed to users)
              </label>
              <textarea
                value={formData.aussie_slang}
                onChange={(e) => setFormData({ ...formData, aussie_slang: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter the Aussie slang version..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Motivation, Success"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingQuote ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quotes List */}
      <DataTable
        title="Inspiring Quotes"
        description="Manage inspiring messages that appear on every screen"
        data={quotes}
        loading={loading}
        defaultSortKey="display_order"
        defaultSortDirection="asc"
        columns={[
          {
            key: 'display_order',
            label: 'Order',
            sortable: true,
            render: (quote) => (
              <span className="text-sm text-gray-900 dark:text-white">
                {quote.display_order}
              </span>
            )
          },
          {
            key: 'aussie_slang',
            label: 'Aussie Slang',
            sortable: true,
            render: (quote) => (
              <div className="text-sm text-gray-900 dark:text-white max-w-md">
                {quote.aussie_slang || '—'}
              </div>
            )
          },
          {
            key: 'quote',
            label: 'Original Quote',
            sortable: true,
            render: (quote) => (
              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                {quote.original_quote || quote.quote}
              </div>
            )
          },
          {
            key: 'author',
            label: 'Author',
            sortable: true,
            render: (quote) => (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {quote.author || '—'}
              </span>
            )
          },
          {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (quote) => (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {quote.category || '—'}
              </span>
            )
          },
          {
            key: 'is_active',
            label: 'Status',
            sortable: true,
            render: (quote) => (
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  quote.is_active
                    ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/50'
                    : 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900/30 dark:text-gray-400 dark:ring-gray-500/50'
                }`}
              >
                {quote.is_active ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (quote) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(quote)
                  }}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(quote.id)
                  }}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )
          }
        ]}
        actionButton={{
          label: 'Add Quote',
          icon: PlusIcon,
          onClick: () => setShowForm(true)
        }}
        emptyStateTitle="No quotes yet"
        emptyStateDescription="Add your first inspiring quote to get started!"
        emptyStateAction={{
          label: 'Add Quote',
          onClick: () => setShowForm(true)
        }}
      />
    </div>
  )
}
