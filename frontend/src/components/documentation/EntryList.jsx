import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function EntryList({ entries, selectedEntry, onSelectEntry, searchQuery, onSearchChange, groupByChapter = true }) {
  const [expandedChapters, setExpandedChapters] = useState(new Set([...Array(19).keys()]))

  const toggleChapter = (chapterNum) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterNum)) {
      newExpanded.delete(chapterNum)
    } else {
      newExpanded.add(chapterNum)
    }
    setExpandedChapters(newExpanded)
  }

  // Group entries by chapter
  const entriesByChapter = entries?.reduce((acc, entry) => {
    const chapter = entry.chapter_number
    if (!acc[chapter]) acc[chapter] = []
    acc[chapter].push(entry)
    return acc
  }, {}) || {}

  const chapters = Object.keys(entriesByChapter).sort((a, b) => Number(a) - Number(b))

  const EntryCard = ({ entry }) => (
    <button
      onClick={() => onSelectEntry(entry)}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
        selectedEntry?.id === entry.id
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base flex-shrink-0">{entry.type_display?.split(' ')[0] || '📝'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {entry.title}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            {entry.severity_display && (
              <span className="text-gray-600 dark:text-gray-400">{entry.severity_display}</span>
            )}
            {entry.status_display && (
              <span className="text-gray-600 dark:text-gray-400">{entry.status_display}</span>
            )}
          </div>
          {entry.fixed_date && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fixed: {new Date(entry.fixed_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </button>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchQuery || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto p-2">
        {groupByChapter ? (
          <div className="space-y-2">
            {chapters.map((chapterNum) => {
              const chapterEntries = entriesByChapter[chapterNum]
              const isExpanded = expandedChapters.has(Number(chapterNum))
              const chapterName = chapterEntries[0]?.chapter_name || `Chapter ${chapterNum}`

              return (
                <div key={chapterNum} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(Number(chapterNum))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        📂 {chapterName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({chapterEntries.length})
                    </span>
                  </button>

                  {/* Chapter Entries */}
                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-white dark:bg-gray-900">
                      {chapterEntries.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {entries?.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {entries?.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No entries found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        Showing {entries?.length || 0} entr{entries?.length !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  )
}
