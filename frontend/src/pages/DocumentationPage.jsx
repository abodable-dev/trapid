import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpenIcon, MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import KnowledgeEntryModal from '../components/KnowledgeEntryModal'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function DocumentationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Knowledge database state
  const [knowledge, setKnowledge] = useState([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [selectedKnowledgeType, setSelectedKnowledgeType] = useState('all')
  const [knowledgeSearch, setKnowledgeSearch] = useState('')
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

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
      // Load knowledge for Lexicon doc only
      if (docId === 'lexicon' && chapter) {
        loadKnowledge(chapter)
      } else {
        setKnowledge([])
      }
    }
  }, [searchParams])

  // Reload knowledge when filters change
  useEffect(() => {
    const chapter = searchParams.get('chapter')
    const docId = searchParams.get('doc')
    if (docId === 'lexicon' && chapter) {
      loadKnowledge(chapter)
    }
  }, [selectedKnowledgeType, knowledgeSearch])

  const loadDocs = async () => {
    try {
      const response = await api.get('/api/v1/documentation')
      if (response.success) {
        setDocs(response.data)
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
      if (response.success) {
        setContent(response.data.content)
        setSelectedDoc(docs.find(d => d.id === docId) || { id: docId })
      }
    } catch (error) {
      console.error('Failed to load doc content:', error)
      setContent('# Error\n\nFailed to load documentation.')
    } finally {
      setLoading(false)
    }
  }

  const loadKnowledge = async (chapter) => {
    setKnowledgeLoading(true)
    try {
      const params = new URLSearchParams({ chapter })
      if (selectedKnowledgeType !== 'all') {
        params.append('type', selectedKnowledgeType)
      }
      if (knowledgeSearch.trim()) {
        params.append('search', knowledgeSearch)
      }

      const response = await api.get(`/api/v1/documented_bugs?${params}`)
      if (response.success) {
        setKnowledge(response.data)
      }
    } catch (error) {
      console.error('Failed to load knowledge:', error)
      setKnowledge([])
    } finally {
      setKnowledgeLoading(false)
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
      if (response.success) {
        setSearchResults(response.data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleSaveKnowledge = async (formData, entryId = null) => {
    try {
      if (entryId) {
        // Update existing entry
        await api.put(`/api/v1/documented_bugs/${entryId}`, {
          documented_bug: formData
        })
      } else {
        // Create new entry
        await api.post('/api/v1/documented_bugs', {
          documented_bug: formData
        })
      }

      // Reload knowledge list
      const chapter = searchParams.get('chapter')
      if (chapter) {
        await loadKnowledge(chapter)
      }

      setShowKnowledgeModal(false)
      setEditingEntry(null)
    } catch (error) {
      console.error('Failed to save knowledge:', error)
      throw error
    }
  }

  const handleAddKnowledge = () => {
    setEditingEntry(null)
    setShowKnowledgeModal(true)
  }

  const handleEditKnowledge = (entry) => {
    setEditingEntry(entry)
    setShowKnowledgeModal(true)
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
          <div className="col-span-3 space-y-4">
            {/* Document Selector */}
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

            {/* Chapter Navigator (only for Trinity docs) */}
            {selectedDoc?.chapters && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Chapters
                </h2>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  <button
                    onClick={() => setSearchParams({ doc: selectedDoc.id })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !searchParams.get('chapter')
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Full Document
                  </button>
                  {Array.from({ length: selectedDoc.chapters }, (_, i) => i).map((chapterNum) => (
                    <button
                      key={chapterNum}
                      onClick={() => setSearchParams({ doc: selectedDoc.id, chapter: chapterNum })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        searchParams.get('chapter') === String(chapterNum)
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Chapter {chapterNum}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                    </div>
                  ) : content ? (
                    <MarkdownRenderer content={content} />
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

                {/* Knowledge Database Section (only for Lexicon chapters) */}
                {selectedDoc?.id === 'lexicon' && searchParams.get('chapter') && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Knowledge Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Knowledge Database
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Chapter {searchParams.get('chapter')} - {knowledge.length} entries
                          </p>
                        </div>
                        <button
                          onClick={handleAddKnowledge}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Add Entry
                        </button>
                      </div>

                      {/* Filters */}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={knowledgeSearch}
                            onChange={(e) => setKnowledgeSearch(e.target.value)}
                            placeholder="Search knowledge..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                        <select
                          value={selectedKnowledgeType}
                          onChange={(e) => setSelectedKnowledgeType(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="all">All Types</option>
                          <option value="bug">🐛 Bugs</option>
                          <option value="architecture">🏗️ Architecture</option>
                          <option value="test">📊 Tests</option>
                          <option value="performance">📈 Performance</option>
                          <option value="dev_note">🎓 Dev Notes</option>
                          <option value="common_issue">🔍 Common Issues</option>
                        </select>
                      </div>
                    </div>

                    {/* Knowledge List */}
                    <div className="p-4">
                      {knowledgeLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-gray-500 dark:text-gray-400">Loading knowledge...</div>
                        </div>
                      ) : knowledge.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            No knowledge entries found for this chapter.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {knowledge.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleEditKnowledge(item)}
                              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{item.type_display}</span>
                                    {item.component && (
                                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                        {item.component}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {item.bug_title}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {item.status_display && (
                                    <span className="text-xs">{item.status_display}</span>
                                  )}
                                  {item.severity_display && (
                                    <span className="text-xs">{item.severity_display}</span>
                                  )}
                                </div>
                              </div>

                              {/* Show description/scenario preview */}
                              {(item.description || item.scenario) && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {item.description || item.scenario}
                                </p>
                              )}

                              {/* Metadata */}
                              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                {item.first_reported && (
                                  <span>First: {new Date(item.first_reported).toLocaleDateString()}</span>
                                )}
                                {item.last_occurred && (
                                  <span>Last: {new Date(item.last_occurred).toLocaleDateString()}</span>
                                )}
                                {item.fixed_date && (
                                  <span>Fixed: {new Date(item.fixed_date).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Knowledge Entry Modal */}
      <KnowledgeEntryModal
        isOpen={showKnowledgeModal}
        onClose={() => {
          setShowKnowledgeModal(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveKnowledge}
        chapterNumber={parseInt(searchParams.get('chapter') || '0')}
        chapterName={`Chapter ${searchParams.get('chapter')}`}
        entry={editingEntry}
      />
    </div>
  )
}
