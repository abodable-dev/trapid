import { useState, useEffect, useRef } from 'react'
import { Gantt } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/style.css'
import { XMarkIcon } from '@heroicons/react/24/outline'

/**
 * GanttView - Visualize schedule template tasks with dependencies using SVAR Gantt
 * Shows task names, durations, and predecessor relationships in an interactive timeline
 */

export default function GanttView({ isOpen, onClose, tasks, onUpdateTask }) {
  const [ganttData, setGanttData] = useState({ data: [], links: [] })

  useEffect(() => {
    if (isOpen && tasks) {
      // Convert tasks to Gantt format
      const ganttTasks = tasks.map((task, index) => {
        // Default start date (today) and duration (5 days)
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 5)

        // Format predecessors for display
        const formatPredecessor = (pred) => {
          if (typeof pred === 'object') {
            const type = pred.type || 'FS'
            const lag = pred.lag || 0
            let result = `${pred.id}${type}`
            if (lag !== 0) {
              result += lag > 0 ? `+${lag}` : lag
            }
            return result
          }
          return `${pred}FS`
        }

        const predecessorDisplay = task.predecessor_ids && task.predecessor_ids.length > 0
          ? task.predecessor_ids.map(formatPredecessor).join(', ')
          : ''

        return {
          id: task.id,
          text: task.name,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          duration: 5,
          progress: 0,
          type: 'task',
          // Store original task data
          taskNumber: index + 1,
          supplier: task.supplier_name || task.assigned_role || '',
          predecessors: predecessorDisplay,
          originalTask: task
        }
      })

      // Convert predecessors to Gantt links
      const ganttLinks = []
      tasks.forEach((task, index) => {
        if (task.predecessor_ids && task.predecessor_ids.length > 0) {
          task.predecessor_ids.forEach(pred => {
            const predData = typeof pred === 'object' ? pred : { id: pred, type: 'FS', lag: 0 }

            // Find the predecessor task
            const predTask = tasks[predData.id - 1] // Task numbers are 1-indexed
            if (predTask) {
              ganttLinks.push({
                id: `${predTask.id}-${task.id}`,
                source: predTask.id,
                target: task.id,
                type: getLinkType(predData.type || 'FS')
              })
            }
          })
        }
      })

      setGanttData({
        data: ganttTasks,
        links: ganttLinks
      })
    }
  }, [isOpen, tasks])

  // Convert dependency type to Gantt link type
  const getLinkType = (depType) => {
    switch (depType) {
      case 'FS': return 0 // Finish to Start
      case 'SS': return 1 // Start to Start
      case 'FF': return 2 // Finish to Finish
      case 'SF': return 3 // Start to Finish
      default: return 0
    }
  }

  // Convert Gantt link type to dependency type
  const getDepType = (linkType) => {
    switch (linkType) {
      case 0: return 'FS'
      case 1: return 'SS'
      case 2: return 'FF'
      case 3: return 'SF'
      default: return 'FS'
    }
  }

  const handleLinkAdd = (link) => {
    // When a new link is added in the Gantt chart
    const sourceTask = tasks.find(t => t.id === link.source)
    const targetTask = tasks.find(t => t.id === link.target)

    if (sourceTask && targetTask) {
      const sourceTaskNumber = tasks.findIndex(t => t.id === sourceTask.id) + 1
      const depType = getDepType(link.type)

      // Update the target task's predecessors
      const currentPreds = targetTask.predecessor_ids || []
      const newPred = {
        id: sourceTaskNumber,
        type: depType,
        lag: 0
      }

      // Check if this predecessor already exists
      const exists = currentPreds.some(p => {
        const predId = typeof p === 'object' ? p.id : p
        return predId === sourceTaskNumber
      })

      if (!exists) {
        const updatedPreds = [...currentPreds, newPred]
        onUpdateTask(targetTask.id, { predecessor_ids: updatedPreds })
      }
    }
  }

  const handleLinkDelete = (link) => {
    // When a link is deleted in the Gantt chart
    const sourceTask = tasks.find(t => t.id === link.source)
    const targetTask = tasks.find(t => t.id === link.target)

    if (sourceTask && targetTask) {
      const sourceTaskNumber = tasks.findIndex(t => t.id === sourceTask.id) + 1

      // Remove the predecessor from the target task
      const currentPreds = targetTask.predecessor_ids || []
      const updatedPreds = currentPreds.filter(p => {
        const predId = typeof p === 'object' ? p.id : p
        return predId !== sourceTaskNumber
      })

      onUpdateTask(targetTask.id, { predecessor_ids: updatedPreds })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 2147483647 }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gantt Chart View
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualize tasks and dependencies on a timeline. Drag to add new dependency links.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {ganttData.data.length > 0 && (
              <Gantt
                tasks={ganttData.data}
                links={ganttData.links}
                scales={[
                  { unit: 'month', step: 1, format: 'MMMM yyyy' },
                  { unit: 'day', step: 1, format: 'd' }
                ]}
                columns={[
                  { name: 'taskNumber', label: '#', width: 60, align: 'center' },
                  { name: 'text', label: 'Task Name', width: 300 },
                  { name: 'supplier', label: 'Supplier/Group', width: 150 },
                  { name: 'predecessors', label: 'Predecessors', width: 120 },
                  { name: 'duration', label: 'Days', width: 70, align: 'center' }
                ]}
                cellHeight={40}
                readonly={false}
                onAdd={handleLinkAdd}
                onUpdate={(task) => {
                  // Handle task updates if needed
                  console.log('Task updated:', task)
                }}
                onDelete={handleLinkDelete}
              />
            )}
          </div>
        </div>

        {/* Footer with instructions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>How to use:</strong>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>Drag from one task to another to create a dependency link</li>
              <li>Click on a link and press Delete to remove it</li>
              <li>Changes to dependencies are automatically saved</li>
              <li>Task durations shown here are for visualization only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
