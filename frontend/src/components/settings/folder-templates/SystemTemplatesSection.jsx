import TemplateTable from './TemplateTable'

export default function SystemTemplatesSection({ templates, onDuplicate, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Default Templates</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pre-configured folder structures for common project types. Duplicate to customize.
          </p>
        </div>
      </div>

      <TemplateTable
        templates={templates}
        isSystem={true}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  )
}
