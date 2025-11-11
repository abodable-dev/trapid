import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon, CheckIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { api } from '../../api'

/**
 * DocumentationCategoriesTab
 *
 * Manages global documentation categories that can be assigned to schedule template tasks.
 * Categories are shared across all jobs and templates.
 */

export default function DocumentationCategoriesTab() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    icon: '',
    description: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/v1/documentation_categories')
      setCategories(response.documentation_categories || [])
    } catch (error) {
      console.error('Failed to load documentation categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      name: '',
      color: '#6366f1',
      icon: '',
      description: ''
    })
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      color: category.color || '#6366f1',
      icon: category.icon || '',
      description: category.description || ''
    })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({
      name: '',
      color: '#6366f1',
      icon: '',
      description: ''
    })
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        await api.post('/api/v1/documentation_categories', {
          documentation_category: formData
        })
      } else if (editingId) {
        await api.patch(`/api/v1/documentation_categories/${editingId}`, {
          documentation_category: formData
        })
      }

      handleCancel()
      loadCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      alert(error.response?.data?.errors?.join(', ') || 'Failed to save category')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? It will be removed from all tasks.')) {
      return
    }

    try {
      await api.delete(`/api/v1/documentation_categories/${id}`)
      loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newCategories = [...categories]
    const draggedItem = newCategories[draggedIndex]

    // Remove from old position
    newCategories.splice(draggedIndex, 1)
    // Insert at new position
    newCategories.splice(index, 0, draggedItem)

    setCategories(newCategories)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    // Update sequence order on backend
    const categoryOrders = categories.map((cat, index) => ({
      id: cat.id,
      sequence_order: index
    }))

    try {
      await api.post('/api/v1/documentation_categories/reorder', { category_orders: categoryOrders })
      loadCategories() // Reload to ensure consistency
    } catch (error) {
      console.error('Failed to reorder categories:', error)
      alert('Failed to save new order')
      loadCategories() // Reload on error to reset to server state
    }

    setDraggedIndex(null)
  }

  const predefinedColors = [
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#64748b', // slate
    '#14b8a6', // teal
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
          Documentation Categories
        </h2>
        <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
          Manage global documentation categories that can be assigned to schedule template tasks.
          These categories organize job documentation and help track required documents.
        </p>
        <p className="mt-2 text-sm/6 text-gray-500 dark:text-gray-400">
          Drag and drop categories to reorder how they appear in document tabs.
        </p>
        <button
          onClick={handleCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-4 w-4" />
          New Category
        </button>
      </div>

      <div className="md:col-span-2 space-y-4">
        {/* Create Form */}
        {isCreating && (
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              New Category
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Building Consent, Warranties, Photos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-md transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-8 h-8 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Optional description of what documents go in this category"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="h-4 w-4" />
                  Create Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        {categories.length === 0 && !isCreating ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              No categories
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new documentation category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                draggable={editingId !== category.id}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4 transition-opacity ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${editingId !== category.id ? 'cursor-move' : ''}`}
              >
                {editingId === category.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-8 h-8 rounded-md transition-transform ${
                              formData.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-8 h-8 rounded-md cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!formData.name.trim()}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Bars3Icon className="h-5 w-5" />
                      </div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        #{category.sequence_order}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
