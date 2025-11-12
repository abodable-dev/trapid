import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { useAuth } from '../contexts/AuthContext'

export default function TrainingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [showJoinSession, setShowJoinSession] = useState(false)

  // Auto-fill display name with logged-in user's name
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name)
    }
  }, [user])

  const handleCreateSession = () => {
    const newSessionId = nanoid(10)
    const params = new URLSearchParams()
    if (displayName) params.append('displayName', displayName)
    navigate(`/training/${newSessionId}?${params.toString()}`)
  }

  const handleJoinSession = () => {
    if (!sessionId.trim()) {
      alert('Please enter a session ID')
      return
    }
    const params = new URLSearchParams()
    if (displayName) params.append('displayName', displayName)
    navigate(`/training/${sessionId.trim()}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Training Sessions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Create or join training sessions with screen sharing and video conferencing
          </p>
        </div>

        {/* Display Name Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Session */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create New Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start a new training session and invite others to join
              </p>
              <button
                onClick={handleCreateSession}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                         hover:bg-blue-700 transition-colors shadow-sm"
              >
                Create Session
              </button>
            </div>
          </div>

          {/* Join Existing Session */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Join Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter a session ID to join an existing training
              </p>

              {!showJoinSession ? (
                <button
                  onClick={() => setShowJoinSession(true)}
                  className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg
                           hover:bg-green-700 transition-colors shadow-sm"
                >
                  Join Session
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Enter session ID"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleJoinSession}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg
                               hover:bg-green-700 transition-colors"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => {
                        setShowJoinSession(false)
                        setSessionId('')
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                               font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Training Session Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Screen Sharing</h4>
                <p className="text-gray-600 dark:text-gray-400">Share your screen to demonstrate workflows and features</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Video & Audio</h4>
                <p className="text-gray-600 dark:text-gray-400">HD video and crystal-clear audio for training sessions</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Live Chat</h4>
                <p className="text-gray-600 dark:text-gray-400">Text chat for questions and discussions during training</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
