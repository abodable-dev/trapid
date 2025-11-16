import { useState } from 'react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useLocation } from 'react-router-dom'
import ContextualHelpModal from './ContextualHelpModal'
import { getHelpForPage } from '../config/helpMapping'

export default function FloatingHelpButton({ inline = false }) {
  const location = useLocation()
  const [showHelpModal, setShowHelpModal] = useState(false)

  const handleHelpClick = () => {
    setShowHelpModal(true)
  }

  // Get contextual help for current page
  const helpInfo = getHelpForPage(location.pathname)

  return (
    <>
      {/* Help Button - inline or floating */}
      <button
        onClick={handleHelpClick}
        className={inline
          ? "-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-white"
          : "fixed bottom-6 right-6 z-40 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        }
        aria-label="Get help"
        title="Get help for this page"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {/* Contextual Help Modal */}
      <ContextualHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        chapter={helpInfo?.chapter}
        section={helpInfo?.section}
      />
    </>
  )
}
