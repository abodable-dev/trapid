import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { StarIcon, PencilIcon, TrashIcon, FunnelIcon, EyeIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

/**
 * SavedViewCard - Draggable card for saved filter views
 * Used in ReactFlow kanban-style interface
 */
const SavedViewCard = memo(({ data }) => {
  const {
    view,
    isActive,
    onLoad,
    onEdit,
    onDelete,
    onToggleDefault
  } = data

  return (
    <div className="relative">
      {/* Invisible ReactFlow handles */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      {/* Main card */}
      <div
        className={`
          group relative rounded-lg shadow-lg p-3 min-w-[240px] max-w-[280px]
          transition-all duration-300 ease-out cursor-grab active:cursor-grabbing
          hover:shadow-xl hover:scale-105
          ${isActive
            ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-2 border-blue-500 dark:border-blue-400'
            : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
          }
        `}
        onClick={onLoad}
      >
        {/* Header: Name + Default Star */}
        <div className="flex items-start gap-2 mb-2">
          {/* Default Star Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleDefault()
            }}
            className="flex-shrink-0 mt-0.5 transition-transform hover:scale-125"
            title={view.isDefault ? "Remove as default view" : "Set as default view"}
          >
            {view.isDefault ? (
              <StarIconSolid className="h-5 w-5 text-yellow-500" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
            )}
          </button>

          {/* View Name */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {view.name}
            </h4>
          </div>
        </div>

        {/* Metadata: Filters + Columns */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
            <FunnelIcon className="h-3 w-3" />
            <span className="font-medium">{view.filters?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
            <EyeIcon className="h-3 w-3" />
            <span className="font-medium">
              {view.visibleColumns ? Object.values(view.visibleColumns).filter(Boolean).length : 0}
            </span>
          </div>
        </div>

        {/* Filter Preview (first 2 filters) */}
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

        {/* Actions Row */}
        <div className="flex items-center gap-1 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
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
              onDelete()
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs font-medium transition-colors"
            title="Delete view"
          >
            <TrashIcon className="h-3 w-3" />
            Delete
          </button>
        </div>

        {/* Active Indicator Badge */}
        {isActive && (
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
            ACTIVE
          </div>
        )}

        {/* Drag Handle Indicator */}
        <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-60 transition-opacity">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>
      </div>
    </div>
  )
})

SavedViewCard.displayName = 'SavedViewCard'

export default SavedViewCard
