export default function ChapterList({ chapters, selectedChapter, onSelectChapter, searchQuery, onSearchChange }) {
  const filteredChapters = chapters?.filter(chapter =>
    searchQuery ? chapter.title?.toLowerCase().includes(searchQuery.toLowerCase()) : true
  ) || []

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchQuery || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredChapters.map((chapter, index) => (
            <button
              key={chapter.number ?? index}
              onClick={() => onSelectChapter(chapter)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                selectedChapter?.number === chapter.number
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">📄</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{chapter.title}</div>
                  {chapter.subtitle && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {chapter.subtitle}
                    </div>
                  )}
                  {chapter.metadata && (
                    <div className="text-xs text-gray-400 mt-1">
                      {chapter.metadata}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredChapters.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No chapters found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        Showing {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
