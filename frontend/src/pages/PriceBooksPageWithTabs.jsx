import { useState } from 'react'
import PriceBooksPage from './PriceBooksPage'
import PriceBooksTrinityView from './PriceBooksTrinityView'

export default function PriceBooksPageWithTabs() {
  const [activeTab, setActiveTab] = useState('trinity') // Default to Trinity view

  const tabs = [
    { id: 'trinity', name: 'Trinity View (Gold Standard)', icon: '🏆' },
    { id: 'classic', name: 'Classic View (Original)', icon: '📊' },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
                {tab.id === 'trinity' && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    NEW
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'classic' && <PriceBooksPage />}
        {activeTab === 'trinity' && <PriceBooksTrinityView />}
      </div>
    </div>
  )
}
