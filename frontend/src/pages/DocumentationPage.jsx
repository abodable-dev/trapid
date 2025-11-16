import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { api } from '../api'

// Layout Components
import ThreePanelLayout from '../components/documentation/ThreePanelLayout'
import DocumentList from '../components/documentation/DocumentList'
import FilterSection from '../components/documentation/FilterSection'
import ChapterList from '../components/documentation/ChapterList'
import EntryList from '../components/documentation/EntryList'
import EntryDetails from '../components/documentation/EntryDetails'
import MarkdownRenderer from '../components/MarkdownRenderer'
import KnowledgeEntryModal from '../components/KnowledgeEntryModal'

export default function DocumentationPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Document state
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  // For Lexicon (database mode)
  const [entries, setEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    chapter: 'all',
    type: 'all',
    status: 'all',
    severity: 'all'
  })

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  // Load docs list on mount
  useEffect(() => {
    loadDocs()
  }, [])

  // Auto-select Bible if no doc selected
  useEffect(() => {
    if (docs.length > 0 && !searchParams.get('doc')) {
      setSearchParams({ doc: 'bible' })
    }
  }, [docs])

  // Load content when doc changes
  useEffect(() => {
    const docId = searchParams.get('doc')
    if (docId && docs.length > 0) {
      const doc = docs.find(d => d.id === docId)
      setSelectedDoc(doc)

      if (docId === 'lexicon') {
        loadLexiconData()
      } else {
        loadMarkdownContent(docId)
      }
    }
  }, [searchParams, docs])

  // Reload entries when filters change
  useEffect(() => {
    if (selectedDoc?.id === 'lexicon') {
      loadLexiconData()
    }
  }, [filters, searchQuery])

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

  const loadMarkdownContent = async (docId) => {
    setLoading(true)
    try {
      const response = await api.get(`/api/v1/documentation/${docId}`)
      if (response.success) {
        setContent(response.data.content)
      }
    } catch (error) {
      console.error('Failed to load content:', error)
      setContent('# Error\n\nFailed to load documentation.')
    } finally {
      setLoading(false)
    }
  }

  const loadLexiconData = async () => {
    setLoading(true)
    try {
      // Build query params
      const params = new URLSearchParams()
      if (filters.chapter !== 'all') params.append('chapter', filters.chapter)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.severity !== 'all') params.append('severity', filters.severity)
      if (searchQuery) params.append('search', searchQuery)

      // Load entries
      const entriesResponse = await api.get(`/api/v1/documented_bugs?${params}`)
      if (entriesResponse.success) {
        setEntries(entriesResponse.data)
      }

      // Load stats
      const statsResponse = await api.get('/api/v1/documented_bugs/stats')
      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load lexicon:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocSelect = (doc) => {
    setSearchParams({ doc: doc.id })
    setSearchQuery('')
    setSelectedEntry(null)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry)
  }

  const handleAddEntry = () => {
    setEditingEntry(null)
    setShowModal(true)
  }

  const handleEditEntry = (entry) => {
    setEditingEntry(entry)
    setShowModal(true)
  }

  const handleDeleteEntry = async (entry) => {
    if (!confirm(`Delete "${entry.bug_title}"?`)) return

    try {
      await api.delete(`/api/v1/documented_bugs/${entry.id}`)
      loadLexiconData()
      setSelectedEntry(null)
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete entry')
    }
  }

  const handleSaveEntry = async (formData, entryId) => {
    try {
      if (entryId) {
        await api.put(`/api/v1/documented_bugs/${entryId}`, {
          documented_bug: formData
        })
      } else {
        await api.post('/api/v1/documented_bugs', {
          documented_bug: formData
        })
      }

      loadLexiconData()
      setShowModal(false)
      setEditingEntry(null)
    } catch (error) {
      console.error('Failed to save entry:', error)
      throw error
    }
  }

  // Parse chapters from markdown content
  const parseChapters = () => {
    if (!content) return []

    const lines = content.split('\n')
    const chapters = []
    let currentChapter = null

    lines.forEach((line, index) => {
      // Match "# Chapter X:" pattern
      const match = line.match(/^#\s+Chapter\s+(\d+):?\s*(.*)/)
      if (match) {
        const number = parseInt(match[1])
        const title = match[2] || `Chapter ${number}`

        if (currentChapter) {
          chapters.push(currentChapter)
        }

        currentChapter = {
          number,
          title: `Chapter ${number}`,
          subtitle: title,
          line: index
        }
      }
    })

    if (currentChapter) {
      chapters.push(currentChapter)
    }

    return chapters
  }

  const handleChapterSelect = (chapter) => {
    // Scroll to chapter in content
    // This is a simplified version - you'd implement smooth scrolling to the heading
    console.log('Selected chapter:', chapter)
  }

  // Render based on selected document
  const renderLeftPanel = () => (
    <>
      <DocumentList
        documents={docs}
        selectedDoc={selectedDoc}
        onSelectDoc={handleDocSelect}
      />

      {selectedDoc?.id === 'lexicon' && (
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          stats={stats}
        />
      )}
    </>
  )

  const renderMiddlePanel = () => {
    if (selectedDoc?.id === 'lexicon') {
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Knowledge Base
            </h2>
            <button
              onClick={handleAddEntry}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Entry
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <EntryList
              entries={entries}
              selectedEntry={selectedEntry}
              onSelectEntry={handleEntrySelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              groupByChapter={true}
            />
          </div>
        </div>
      )
    }

    // For Bible, Manual, etc. - show chapter list
    const chapters = parseChapters()
    return (
      <ChapterList
        chapters={chapters}
        selectedChapter={null}
        onSelectChapter={handleChapterSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    )
  }

  const renderRightPanel = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      )
    }

    if (selectedDoc?.id === 'lexicon') {
      return (
        <EntryDetails
          entry={selectedEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      )
    }

    // For Bible, Manual, etc. - show markdown
    return (
      <div className="h-full overflow-y-auto p-6">
        {content ? (
          <div className="max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📖</div>
            <div className="text-lg font-medium">Select a document to view</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <ThreePanelLayout
        leftPanel={renderLeftPanel()}
        middlePanel={renderMiddlePanel()}
        rightPanel={renderRightPanel()}
        leftPanelWidth="240px"
        middlePanelWidth="320px"
      />

      {/* Knowledge Entry Modal */}
      <KnowledgeEntryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveEntry}
        chapterNumber={editingEntry?.chapter_number || 0}
        chapterName={editingEntry?.chapter_name || 'Overview'}
        entry={editingEntry}
      />
    </>
  )
}
