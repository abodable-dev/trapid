import { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  applyNodeChanges
} from 'reactflow'
import 'reactflow/dist/style.css'
import SavedViewCard from './SavedViewCard'
import { PlusIcon } from '@heroicons/react/24/outline'

// Register custom node type
const nodeTypes = {
  savedViewCard: SavedViewCard
}

/**
 * SavedViewsKanban - Drag-and-drop kanban interface for saved views
 * Replaces up/down arrow buttons with natural drag-to-reorder
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
  setEditingViewId
}) {
  const [nodes, setNodes] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize nodes from saved filters
  useEffect(() => {
    const CARD_HEIGHT = 180
    const CARD_SPACING = 20
    const START_Y = 60

    const newNodes = savedFilters.map((view, index) => ({
      id: `view-${view.id}`,
      type: 'savedViewCard',
      position: { x: 20, y: START_Y + index * (CARD_HEIGHT + CARD_SPACING) },
      draggable: true,
      data: {
        view,
        isActive: activeViewId === view.id,
        onLoad: () => {
          // Load this view
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
          setActiveViewId(view.id)
          setShowCascadeDropdown(false)
        },
        onEdit: () => {
          setEditingViewId(view.id)
        },
        onDelete: () => {
          if (confirm(`Delete view "${view.name}"?`)) {
            setSavedFilters(savedFilters.filter(v => v.id !== view.id))
            if (activeViewId === view.id) {
              setActiveViewId(null)
            }
          }
        },
        onToggleDefault: () => {
          setSavedFilters(savedFilters.map(v => ({
            ...v,
            isDefault: v.id === view.id ? !v.isDefault : false
          })))
        }
      }
    }))

    setNodes(newNodes)
    setIsInitialized(true)
  }, [savedFilters, activeViewId])

  // Handle node position changes (drag)
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds)

      // Check for drag end
      const dragEndChanges = changes.filter(c => c.type === 'position' && c.dragging === false)
      if (dragEndChanges.length > 0) {
        // Sort nodes by Y position to determine new order
        const sortedNodes = [...updatedNodes].sort((a, b) => a.position.y - b.position.y)

        // Reorder savedFilters array
        const newOrder = sortedNodes.map(node => {
          const viewId = parseInt(node.id.replace('view-', ''))
          return savedFilters.find(v => v.id === viewId)
        }).filter(Boolean)

        setSavedFilters(newOrder)

        // Snap to vertical positions
        const CARD_HEIGHT = 180
        const CARD_SPACING = 20
        const START_Y = 60

        sortedNodes.forEach((node, index) => {
          node.position.x = 20 // Keep X fixed
          node.position.y = START_Y + index * (CARD_HEIGHT + CARD_SPACING)
        })

        return sortedNodes
      }

      return updatedNodes
    })
  }, [savedFilters, setSavedFilters])

  // Handle edit name inline
  useEffect(() => {
    if (editingViewId !== null) {
      // Find the view being edited
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

  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-sm">Loading saved views...</div>
        </div>
      </div>
    )
  }

  if (savedFilters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center max-w-xs">
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
    <div className="h-full relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-t-lg z-10 shadow-lg">
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

      {/* ReactFlow Canvas */}
      <div className="h-full pt-14">
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView={false}
          minZoom={0.8}
          maxZoom={1.2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={false}
          zoomOnScroll={false}
          preventScrolling={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="#cbd5e1"
            gap={16}
            size={0.5}
            className="dark:opacity-20"
          />
        </ReactFlow>
      </div>

      {/* Floating hint */}
      {savedFilters.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg opacity-80 pointer-events-none">
          💡 Drag cards to reorder your views
        </div>
      )}
    </div>
  )
}
