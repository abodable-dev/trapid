import { useState } from 'react'
import { FolderIcon, DocumentDuplicateIcon, PencilIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import FolderTreeNode from './FolderTreeNode'

export default function TemplateRow({ template, isSystem, onDuplicate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const folderCount = template.folder_template_items?.length || 0

  // Build folder hierarchy
  const buildHierarchy = (items) => {
    if (!items || items.length === 0) return []

    const itemMap = {}
    const roots = []

    // First pass: create map of all items
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] }
    })

    // Second pass: build hierarchy
    items.forEach(item => {
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id])
      } else {
        roots.push(itemMap[item.id])
      }
    })

    // Sort by order
    const sortByOrder = (nodes) => {
      nodes.sort((a, b) => (a.order || 0) - (b.order || 0))
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortByOrder(node.children)
        }
      })
    }
    sortByOrder(roots)

    return roots
  }

  const hierarchy = buildHierarchy(template.folder_template_items)

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {expanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
            <FolderIcon className="h-5 w-5 text-yellow-500 mr-3" />
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {template.name}
              {isSystem && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  Default
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-900 dark:text-white capitalize">
            {template.template_type || 'Custom'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {folderCount} folders
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {template.is_active ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              Inactive
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onDuplicate(template.id, template.name)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              title="Duplicate template"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Duplicate
            </button>
            {!isSystem && (
              <>
                <button
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  title="Edit template"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(template.id, template.name)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  title="Delete template"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan="5" className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30">
            <div className="text-sm">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Folder Structure:</h4>
              {hierarchy.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">No folders defined</p>
              ) : (
                <div className="space-y-1">
                  {hierarchy.map(node => (
                    <FolderTreeNode key={node.id} node={node} level={0} />
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
