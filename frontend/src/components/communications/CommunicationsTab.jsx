import { useState } from 'react'
import { ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import InternalMessagesTab from './InternalMessagesTab'
import EmailsTab from './EmailsTab'
import SmsTab from './SmsTab'

export default function CommunicationsTab({ entityType, entityId, entityName, contact }) {
  const [activeSubTab, setActiveSubTab] = useState('messages')

  const subTabs = [
    { id: 'messages', name: 'Internal Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'emails', name: 'Emails', icon: EnvelopeIcon },
    { id: 'sms', name: 'SMS', icon: PhoneIcon },
  ]

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {subTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeSubTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeSubTab === 'messages' && (
          <InternalMessagesTab
            entityType={entityType}
            entityId={entityId}
            entityName={entityName}
          />
        )}
        {activeSubTab === 'emails' && (
          <EmailsTab
            entityType={entityType}
            entityId={entityId}
            entityName={entityName}
          />
        )}
        {activeSubTab === 'sms' && (
          <SmsTab
            entityType={entityType}
            entityId={entityId}
            contact={contact}
          />
        )}
      </div>
    </div>
  )
}
