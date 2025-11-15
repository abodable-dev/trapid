import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { api } from '../api'

export default function DocumentationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Load list of available docs on mount
  useEffect(() => {
    loadDocs()
  }, [])

  // Auto-load Bible if no doc is selected
  useEffect(() => {
    if (docs.length > 0 && !searchParams.get('doc')) {
      setSearchParams({ doc: 'bible' })
    }
  }, [docs, searchParams, setSearchParams])

  // Load specific doc from URL param
  useEffect(() => {
    const docId = searchParams.get('doc')
    const chapter = searchParams.get('chapter')
    if (docId) {
      loadDocContent(docId, chapter)
    }
  }, [searchParams])

  const loadDocs = async () => {
    try {
      const response = await api.get('/api/v1/documentation')
      if (response.data.success) {
        setDocs(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load docs:', error)
    }
  }

  const loadDocContent = async (docId, chapter = null) => {
    setLoading(true)
    try {
      const url = chapter
        ? `/api/v1/documentation/${docId}?chapter=${chapter}`
        : `/api/v1/documentation/${docId}`

      const response = await api.get(url)
      if (response.data.success) {
        setContent(response.data.data.content)
        setSelectedDoc(docs.find(d => d.id === docId) || { id: docId })
      }
    } catch (error) {
      console.error('Failed to load doc content:', error)
      setContent('# Error\n\nFailed to load documentation.')
    } finally {
      setLoading(false)
    }
  }

  const handleDocSelect = (docId) => {
    setSearchParams({ doc: docId })
    setSearchResults([])
    setSearchQuery('')
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      const response = await api.get(`/api/v1/documentation/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.data.success) {
        setSearchResults(response.data.data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpenIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Trapid Documentation
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The Trinity: Bible, Lexicon, User Manual
                </p>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Document List */}
          <div className="col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Documents
              </h2>

              <div className="space-y-2">
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocSelect(doc.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedDoc?.id === doc.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{doc.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.audience}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {searchResults.length > 0 ? (
              /* Search Results */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Search Results ({searchResults.length})
                </h2>
                <div className="space-y-3">
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleDocSelect(result.doc_type)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{result.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {result.doc_name}
                        </span>
                        <span className="text-xs text-gray-500">Line {result.line_number}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Document Content */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                  </div>
                ) : content ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {content}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select a document to view
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Choose from the sidebar to view documentation
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
