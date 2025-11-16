import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import MarkdownRenderer from '../MarkdownRenderer'

export default function EntryDetails({ entry, onEdit, onDelete }) {
  if (!entry) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-lg font-medium">Select an entry to view details</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{entry.type_display?.split(' ')[0] || '📝'}</span>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {entry.title}
              </h1>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">Chapter:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {entry.chapter_number} - {entry.chapter_name}
                </span>
              </div>

              {entry.component && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Component:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{entry.component}</span>
                </div>
              )}

              {entry.status_display && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="font-medium">{entry.status_display}</span>
                </div>
              )}

              {entry.severity_display && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Severity:</span>
                  <span className="font-medium">{entry.severity_display}</span>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
              {entry.first_reported && (
                <span>Discovered: {new Date(entry.first_reported).toLocaleDateString()}</span>
              )}
              {entry.fixed_date && (
                <span>Fixed: {new Date(entry.fixed_date).toLocaleDateString()}</span>
              )}
              {entry.last_occurred && (
                <span>Last Occurred: {new Date(entry.last_occurred).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(entry)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete?.(entry)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description/Scenario */}
        {(entry.description || entry.scenario) && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📋 Summary
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={entry.description || entry.scenario} />
            </div>
          </section>
        )}

        {/* Root Cause */}
        {entry.root_cause && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🔍 Root Cause
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={entry.root_cause} />
            </div>
          </section>
        )}

        {/* Solution */}
        {entry.solution && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              ✅ Solution
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={entry.solution} />
            </div>
          </section>
        )}

        {/* Details */}
        {entry.details && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📝 Details
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={entry.details} />
            </div>
          </section>
        )}

        {/* Examples */}
        {entry.examples && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              💡 Examples
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={entry.examples} />
            </div>
          </section>
        )}

        {/* Prevention */}
        {entry.prevention && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🛡️ Prevention
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={entry.prevention} />
            </div>
          </section>
        )}

        {/* Recommendations */}
        {entry.recommendations && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              💡 Recommendations
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={entry.recommendations} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
