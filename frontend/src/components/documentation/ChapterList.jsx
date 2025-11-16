import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function ChapterList({ chapters, selectedChapter, onSelectChapter, searchQuery, onSearchChange, fullContent }) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '')
  const [searchMode, setSearchMode] = useState('fast') // 'fast' or 'deep'
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search - only update parent after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(localSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  // Sync with parent if it changes externally
  useEffect(() => {
    if (searchQuery !== localSearch) {
      setLocalSearch(searchQuery || '')
    }
  }, [searchQuery])

  const filteredChapters = chapters?.filter(chapter => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()

    // Fast search - chapter titles only
    if (searchMode === 'fast') {
      return (
        chapter.title?.toLowerCase().includes(query) ||
        chapter.subtitle?.toLowerCase().includes(query)
      )
    }

    // Deep search - search full content
    if (searchMode === 'deep' && fullContent) {
      setIsSearching(true)
      const chapterContent = extractChapterContent(fullContent, chapter.number)
      const matches = chapterContent.toLowerCase().includes(query)
      setIsSearching(false)
      return matches
    }

    return false
  }) || []

  // Extract content for a specific chapter from full markdown
  const extractChapterContent = (content, chapterNum) => {
    if (!content) return ''

    const lines = content.split('\n')
    const startPattern = new RegExp(`^#\\s+Chapter\\s+${chapterNum}[:\\s]`, 'i')
    const nextChapterPattern = /^#\s+Chapter\s+\d+[:\s]/i

    let capturing = false
    let chapterLines = []

    for (const line of lines) {
      if (startPattern.test(line)) {
        capturing = true
        chapterLines.push(line)
        continue
      }

      if (capturing) {
        // Stop at next chapter
        if (nextChapterPattern.test(line) && !startPattern.test(line)) {
          break
        }
        chapterLines.push(line)
      }
    }

    return chapterLines.join('\n')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder={searchMode === 'fast' ? 'Quick search (titles)...' : 'Deep search (full content)...'}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full px-3 py-2 pr-20 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setSearchMode('fast')}
              className={`p-1 rounded transition-colors ${
                searchMode === 'fast'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Fast search (titles only)"
            >
              <BoltIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSearchMode('deep')}
              className={`p-1 rounded transition-colors ${
                searchMode === 'deep'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Deep search (full content)"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isSearching && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        )}
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
