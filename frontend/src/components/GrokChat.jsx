import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { api } from '../api'
import { useLocation } from 'react-router-dom'

export default function GrokChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const location = useLocation()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with a welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hey! I'm Grok, your AI teammate. I can see what you're working on and help plan features, debug issues, or discuss architecture. What's on your mind?"
      }])
    }
  }, [isOpen])

  const getContext = () => {
    return {
      current_page: location.pathname,
      // You can add more context here like current table, recent actions, etc.
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await api.post('/api/v1/grok/chat', {
        message: userMessage,
        context: getContext()
      })

      if (response.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.response
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'error',
          content: 'Sorry, I encountered an error. Please try again.'
        }])
      }
    } catch (error) {
      console.error('Grok chat error:', error)
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Failed to connect to Grok. Please check your API key.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestFeatures = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/v1/grok/suggest-features')

      if (response.success) {
        setMessages(prev => [...prev,
          { role: 'user', content: 'What features should we build next?' },
          { role: 'assistant', content: response.suggestions }
        ])
      }
    } catch (error) {
      console.error('Feature suggestion error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-x-2">
          <SparklesIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Grok AI</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={suggestFeatures}
          disabled={loading}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-x-1"
        >
          <SparklesIcon className="h-3 w-3" />
          Suggest Features
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : message.role === 'error'
                  ? 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center gap-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900">
        <div className="flex items-end gap-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Grok anything..."
            rows={2}
            disabled={loading}
            className="flex-1 resize-none rounded-lg border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}

// Floating button to open chat
export function GrokChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-lg z-40 flex items-center gap-x-2 group"
    >
      <img src="/grok-logo.svg" alt="Grok" className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Ask Grok
      </span>
    </button>
  )
}
