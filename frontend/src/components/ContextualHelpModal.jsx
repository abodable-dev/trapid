import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { getChapterName } from '../config/helpMapping'

export default function ContextualHelpModal({ isOpen, onClose, chapter, section }) {
  const navigate = useNavigate()
  const [helpContent, setHelpContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Load help content for the chapter
  useEffect(() => {
    if (isOpen && chapter !== null) {
      loadHelpContent()
    }
  }, [isOpen, chapter, section])

  const loadHelpContent = async () => {
    setLoading(true)
    try {
      // Fetch User Manual content for this chapter
      const response = await api.get('/api/v1/documentation/user-manual', {
        params: { chapter }
      })

      if (response.data?.success) {
        setHelpContent(response.data?.data?.content || 'No help content available for this page.')
      }
    } catch (error) {
      console.error('Failed to load help content:', error)
      setHelpContent('Unable to load help content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      // Search across all documentation
      const response = await api.get('/api/v1/documentation/search', {
        params: {
          q: searchQuery
        }
      })

      if (response.data?.success) {
        // Filter for User Manual results only and format them
        const results = (response.data?.data?.results || [])
          .filter(r => r.doc_type === 'user_manual')
          .map(r => {
            // Extract chapter number from content if possible
            const chapterMatch = r.content.match(/Chapter (\d+):/i)
            return {
              chapter: chapterMatch ? parseInt(chapterMatch[1]) : null,
              title: r.content.substring(0, 100),
              excerpt: r.content
            }
          })
          .filter(r => r.chapter !== null) // Only include results with chapter numbers

        setSearchResults(results)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    }
  }

  const handleOpenFullHelp = () => {
    onClose()
    navigate(`/documentation?doc=user-manual&chapter=${chapter}`)
  }

  const handleSearchResultClick = (resultChapter) => {
    onClose()
    navigate(`/documentation?doc=user-manual&chapter=${resultChapter}`)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <BookOpenIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                      {chapter !== null ? `Chapter ${chapter}: ${getChapterName(chapter)}` : 'Help'}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search help documentation..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Search
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearchResultClick(result.chapter)}
                            className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Chapter {result.chapter}: {result.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {result.excerpt}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Help Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {/* Render markdown content */}
                      <div
                        className="help-content"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(helpContent) }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={handleOpenFullHelp}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <BookOpenIcon className="h-4 w-4" />
                    Open Full Help Center
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

/**
 * Simple markdown-to-HTML converter
 * For production, consider using marked or react-markdown
 */
function formatMarkdown(markdown) {
  if (!markdown) return ''

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 dark:text-indigo-400 hover:underline">$1</a>')
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Lists
    .replace(/^\- (.+)$/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1">$1</ul>')
    // Paragraphs
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<pre')) {
        return para
      }
      return `<p>${para}</p>`
    })
    .join('\n')

  return html
}
