import { useState } from 'react'

export default function ThreePanelLayout({
  leftPanel,
  middlePanel,
  rightPanel,
  leftPanelWidth = '200px',
  middlePanelWidth = '320px'
}) {
  const [leftCollapsed, setLeftCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Documents & Filters */}
      <div
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto transition-all duration-300 ${
          leftCollapsed ? 'w-0' : ''
        }`}
        style={{ width: leftCollapsed ? '0' : leftPanelWidth }}
      >
        {!leftCollapsed && leftPanel}
      </div>

      {/* Middle Panel - Chapter/Entry List */}
      <div
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto"
        style={{ width: middlePanelWidth }}
      >
        {middlePanel}
      </div>

      {/* Right Panel - Content Display */}
      <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto">
        {rightPanel}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setLeftCollapsed(!leftCollapsed)}
        className="fixed top-20 left-0 z-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-r-lg transition-colors"
        title={leftCollapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        <svg
          className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${leftCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  )
}
