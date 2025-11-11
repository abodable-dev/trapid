import { useState } from 'react'
import { FolderIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function FolderTreeNode({ node, level }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const indent = level * 24

  return (
    <div>
      <div
        className="flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-2 transition-colors"
        style={{ paddingLeft: `${indent + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mr-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {expanded ? (
              <ChevronDownIcon className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-3 w-3 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-4 mr-1" />
        )}
        <FolderIcon className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
        <span className="text-gray-900 dark:text-white">{node.name}</span>
        {node.description && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 italic">
            {node.description}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <FolderTreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
