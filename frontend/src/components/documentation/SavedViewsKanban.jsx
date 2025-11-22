import { useState, useEffect } from 'react'
import { StarIcon, PencilIcon, TrashIcon, FunnelIcon, EyeIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

/**
 * SavedViewsKanban - Trello-style drag-and-drop list for saved views
 * Cards fill width, stay in bounds, scroll naturally
 * First card automatically becomes default
 */
export default function SavedViewsKanban({
  savedFilters,
  setSavedFilters,
  activeViewId,
  setActiveViewId,
  setCascadeFilters,
  setVisibleColumns,
  setShowCascadeDropdown,
  filterName,
  setFilterName,
  cascadeFilters,
  visibleColumns,
  editingViewId,
  setEditingViewId,
  setVisibilityColumnOrder,
  setColumnOrder
}) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // Auto-set first card as default when order changes
  useEffect(() => {
    if (savedFilters.length > 0) {
      const firstView = savedFilters[0]
      // Only update if the first view is not already default
      if (!firstView.isDefault) {
        setSavedFilters(savedFilters.map((v, idx) => ({
          ...v,
          isDefault: idx === 0
        })))
      }
    }
  }, [savedFilters.map(v => v.id).join(',')]) // Only trigger when order changes

  // Handle edit name
  useEffect(() => {
    if (editingViewId !== null) {
      const viewToEdit = savedFilters.find(v => v.id === editingViewId)
      if (viewToEdit) {
        const newName = prompt('Edit view name:', viewToEdit.name)
        if (newName && newName.trim()) {
          setSavedFilters(savedFilters.map(v =>
            v.id === editingViewId ? { ...v, name: newName.trim() } : v
          ))
        }
        setEditingViewId(null)
      }
    }
  }, [editingViewId])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newFilters = [...savedFilters]
      const [draggedItem] = newFilters.splice(draggedIndex, 1)
      newFilters.splice(dragOverIndex, 0, draggedItem)
      setSavedFilters(newFilters)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleLoadView = (view) => {
    setCascadeFilters(view.filters.map(f => ({
      id: Date.now() + Math.random(),
      column: f.column,
      value: f.value,
      operator: f.operator || '=',
      label: f.label
    })))
    if (view.visibleColumns) {
      setVisibleColumns(view.visibleColumns)
    }
    // Restore column order if saved
    if (view.columnOrder && setVisibilityColumnOrder && setColumnOrder) {
      setVisibilityColumnOrder(view.columnOrder)
      setColumnOrder(view.columnOrder)
    }
    setActiveViewId(view.id)
    setShowCascadeDropdown(false)
  }

  const handleDeleteView = (view) => {
    if (confirm(`Delete view "${view.name}"?`)) {
      setSavedFilters(savedFilters.filter(v => v.id !== view.id))
      if (activeViewId === view.id) {
        setActiveViewId(null)
      }
    }
  }

  if (savedFilters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center max-w-xs px-4">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-sm font-medium mb-1">No Saved Views</div>
          <div className="text-xs">
            Create filters on the left, then save them as a view for quick access
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Saved Views</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-bold">
              {savedFilters.length}
            </span>
          </div>
          <div className="text-xs opacity-90">Drag to reorder</div>
        </div>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {savedFilters.map((view, index) => {
          const isActive = activeViewId === view.id
          const isDragging = draggedIndex === index
          const isDragOver = dragOverIndex === index
          const isFirst = index === 0

          return (
            <div
              key={view.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => handleLoadView(view)}
              className={`
                group relative rounded-lg shadow-md p-3 cursor-pointer
                transition-all duration-200 ease-out
                ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
                ${isDragOver ? 'border-t-4 border-indigo-500' : ''}
                ${isActive
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-2 border-blue-500 dark:border-blue-400 shadow-lg'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl'
                }
              `}
            >
              {/* Drag handle indicator */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition-opacity">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                </svg>
              </div>

              {/* Active badge */}
              {isActive && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
                  ACTIVE
                </div>
              )}

              {/* Default star (auto-set for first card) */}
              {isFirst && (
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="relative">
                    <StarIconSolid className="h-6 w-6 text-yellow-500 drop-shadow-md" />
                    <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-white text-[8px] font-bold px-1 rounded-full">
                      DEFAULT
                    </div>
                  </div>
                </div>
              )}

              {/* Card content */}
              <div className="ml-6">
                {/* View name */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate flex-1">
                    {view.name}
                  </h4>
                </div>

                {/* Metadata badges */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    <FunnelIcon className="h-3 w-3" />
                    <span className="font-medium">{view.filters?.length || 0} filters</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    <EyeIcon className="h-3 w-3" />
                    <span className="font-medium">
                      {view.visibleColumns ? Object.values(view.visibleColumns).filter(Boolean).length : 0} cols
                    </span>
                  </div>
                </div>

                {/* Filter preview */}
                {view.filters && view.filters.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {view.filters.slice(0, 2).map((filter, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded truncate"
                      >
                        <span className="text-gray-600 dark:text-gray-400">{filter.label}</span>
                      </div>
                    ))}
                    {view.filters.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                        +{view.filters.length - 2} more filter{view.filters.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingViewId(view.id)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium transition-colors"
                    title="Edit view name"
                  >
                    <PencilIcon className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteView(view)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs font-medium transition-colors"
                    title="Delete view"
                  >
                    <TrashIcon className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      {savedFilters.length > 1 && (
        <div className="flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 text-center border-t border-indigo-200 dark:border-indigo-800">
          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
            💡 Top card is always the default view
          </div>
        </div>
      )}
    </div>
  )
}
