import { PlusIcon } from '@heroicons/react/24/outline'
import TemplateTable from './TemplateTable'

export default function UserTemplatesSection({ templates, onDuplicate, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Custom Templates</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your customized folder structures. Edit or delete as needed.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5" />
          Create New Template
        </button>
      </div>

      <TemplateTable
        templates={templates}
        isSystem={false}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  )
}
