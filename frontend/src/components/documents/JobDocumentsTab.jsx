import { useState } from 'react'
import { FolderIcon, DocumentIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

export default function JobDocumentsTab({ jobId, jobTitle }) {
  const [folders] = useState([
    {
      id: 1,
      name: '01 REVIT',
      fileCount: 0,
      lastModified: null,
    },
    {
      id: 2,
      name: '02 Land Info',
      fileCount: 0,
      lastModified: null,
    },
    {
      id: 3,
      name: '03 Contract',
      fileCount: 0,
      lastModified: null,
      children: [
        { id: 4, name: 'Sales Info', fileCount: 0 },
        { id: 5, name: 'Sent', fileCount: 0 },
      ],
    },
    {
      id: 6,
      name: '04 Certification',
      fileCount: 0,
      lastModified: null,
      children: [
        { id: 7, name: 'Final Inspection Form 16, Form 11 or 21', fileCount: 0 },
        { id: 8, name: 'Final Send For Inc Certificates', fileCount: 0 },
        { id: 9, name: 'SDA Plan Approved', fileCount: 0 },
        { id: 10, name: 'Send SDA Approval', fileCount: 0 },
        { id: 11, name: 'Start Approved Plan And Approval', fileCount: 0 },
        { id: 12, name: 'Start To Send For Certification', fileCount: 0 },
      ],
    },
    {
      id: 13,
      name: '05 Estimation',
      fileCount: 0,
      lastModified: null,
      children: [
        { id: 14, name: 'Energex Connection', fileCount: 0 },
        { id: 15, name: 'Estimation', fileCount: 0 },
        { id: 16, name: 'Quotes', fileCount: 0 },
      ],
    },
    {
      id: 17,
      name: '06 Colour Selection',
      fileCount: 0,
      lastModified: null,
    },
    {
      id: 18,
      name: '07 Photos',
      fileCount: 0,
      lastModified: null,
      children: [
        { id: 19, name: '01 SITE', fileCount: 0 },
        { id: 20, name: '02 SLAB', fileCount: 0 },
        { id: 21, name: '03 FRAME', fileCount: 0 },
        { id: 22, name: '04 ENCLOSED', fileCount: 0 },
        { id: 23, name: '05 FIXING', fileCount: 0 },
        { id: 24, name: '06 Practical Completion', fileCount: 0 },
        { id: 25, name: '07 Supervisor Photos', fileCount: 0 },
      ],
    },
    {
      id: 26,
      name: '08 SITE',
      fileCount: 0,
      lastModified: null,
    },
    {
      id: 27,
      name: '09 Handover',
      fileCount: 0,
      lastModified: null,
    },
    {
      id: 28,
      name: '10 Finance',
      fileCount: 0,
      lastModified: null,
      children: [
        { id: 29, name: 'Invoices PDF', fileCount: 0 },
      ],
    },
  ])

  const [expandedFolders, setExpandedFolders] = useState(new Set())

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderFolder = (folder, level = 0) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.has(folder.id)

    return (
      <div key={folder.id}>
        <div
          className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-200 dark:border-gray-700"
          style={{ paddingLeft: `${level * 24 + 16}px` }}
          onClick={() => hasChildren && toggleFolder(folder.id)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasChildren && (
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {!hasChildren && <div className="w-4" />}

            <FolderIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {folder.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {folder.fileCount} files
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('Upload functionality coming with OneDrive integration')
                  }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                  title="Upload files"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('Open in OneDrive - integration coming soon')
                  }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                  title="Open in OneDrive"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Project Documents
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              OneDrive folder structure for <span className="font-medium">{jobTitle}</span>
            </p>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              📁 Tekna Standard Residential Template
            </p>
          </div>

          <button
            onClick={() => alert('Sync with OneDrive - integration coming soon')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync with OneDrive
          </button>
        </div>
      </div>

      {/* Folder structure */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Folder Structure
            </h4>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>29 folders</span>
              <span>•</span>
              <span>0 files</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {folders.map(folder => renderFolder(folder, 0))}
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This folder structure was created from the <span className="font-medium">Tekna Standard Residential</span> template.
            Full OneDrive integration coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
