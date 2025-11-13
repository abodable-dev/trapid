import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

export default function BackButton({ className = '' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ${className}`}
      aria-label="Go back"
    >
      <ChevronLeftIcon className="h-6 w-6" />
    </button>
  )
}
