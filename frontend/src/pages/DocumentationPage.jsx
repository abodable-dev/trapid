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
import LoadingSkeleton from '../components/documentation/LoadingSkeleton'
import Breadcrumb from '../components/documentation/Breadcrumb'
import KeyboardShortcutsHelp from '../components/documentation/KeyboardShortcutsHelp'

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
  const [showHelp, setShowHelp] = useState(false)

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow Escape to clear focus
        if (e.key === 'Escape') {
          e.target.blur()
          setSearchQuery('')
        }
        return
      }

      // / - Focus search
      if (e.key === '/') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]')
        searchInput?.focus()
      }

      // Escape - Clear selection and search
      if (e.key === 'Escape') {
        setSelectedEntry(null)
        setSearchQuery('')
      }

      // For Lexicon entries
      if (selectedDoc?.id === 'lexicon' && entries?.length > 0) {
        const currentIndex = selectedEntry
          ? entries.findIndex(e => e.id === selectedEntry.id)
          : -1

        // j or ArrowDown - Next entry
        if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault()
          const nextIndex = Math.min(currentIndex + 1, entries.length - 1)
          handleEntrySelect(entries[nextIndex])
        }

        // k or ArrowUp - Previous entry
        if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault()
          const prevIndex = Math.max(currentIndex - 1, 0)
          handleEntrySelect(entries[prevIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDoc, entries, selectedEntry, searchQuery])

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

  const handleEntrySelect = async (entry) => {
    // Fetch full entry details
    try {
      const response = await api.get(`/api/v1/documented_bugs/${entry.id}`)
      if (response.success) {
        setSelectedEntry(response.data)
      }
    } catch (error) {
      console.error('Failed to load entry details:', error)
      // Fallback to list data if detail fetch fails
      setSelectedEntry(entry)
    }
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
    // Jump to chapter heading in the rendered markdown
    const headingId = `chapter-${chapter.number}`
    const element = document.getElementById(headingId)
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
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
      return <LoadingSkeleton type="content" />
    }

    // Build breadcrumb
    const breadcrumbItems = []
    if (selectedDoc) {
      breadcrumbItems.push({ icon: selectedDoc.icon, label: selectedDoc.name })

      if (selectedDoc.id === 'lexicon' && selectedEntry) {
        breadcrumbItems.push({
          label: `Chapter ${selectedEntry.chapter_number}`,
          icon: '📂'
        })
        breadcrumbItems.push({ label: selectedEntry.bug_title })
      }
    }

    if (selectedDoc?.id === 'lexicon') {
      return (
        <div className="h-full flex flex-col">
          {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}
          <div className="flex-1 overflow-hidden">
            <EntryDetails
              entry={selectedEntry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </div>
        </div>
      )
    }

    // For Bible, Manual, etc. - show markdown
    return (
      <div className="h-full flex flex-col">
        {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}
        <div className="flex-1 overflow-y-auto p-6">
          {content ? (
            <div className="max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">📖</div>
              <div className="text-lg font-medium">Select a document to view</div>
              <div className="text-sm mt-2">Choose a document from the left panel</div>
            </div>
          )}
        </div>
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

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </>
  )
}
