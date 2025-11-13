import { useState, useEffect, useRef } from 'react'
import { api } from '../../api'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function SmsConversation({ contact }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (contact?.id) {
      loadMessages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/api/v1/contacts/${contact.id}/sms_messages`)
      setMessages(response.data?.sms_messages || response.sms_messages || [])
    } catch (err) {
      console.error('Failed to load SMS messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!messageBody.trim()) {
      return
    }

    setSending(true)
    setError(null)

    try {
      const response = await api.post(`/api/v1/contacts/${contact.id}/sms_messages`, {
        body: messageBody
      })

      const newMessage = response.data?.sms_message || response.sms_message

      setMessages(prev => [newMessage, ...prev])
      setMessageBody('')
    } catch (err) {
      console.error('Failed to send SMS:', err)
      setError(err.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const getStatusIcon = (message) => {
    if (message.direction === 'inbound') {
      return null
    }

    switch (message.status) {
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" title="Delivered" />
      case 'sent':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" title="Sent" />
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" title="Failed" />
      case 'queued':
        return <ClockIcon className="h-4 w-4 text-gray-400" title="Queued" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" title={message.status} />
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    } else if (days < 7) {
      return date.toLocaleDateString('en-AU', { weekday: 'short' }) + ' ' +
             date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (!contact?.mobile_phone && !contact?.office_phone) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          No phone number available for this contact. Add a mobile phone number to send SMS.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            SMS Messages
          </h3>
        </div>
        <button
          onClick={loadMessages}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Refresh"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
        <div ref={messagesEndRef} />

        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No messages yet. Start a conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.direction === 'outbound'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  message.direction === 'outbound' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{formatTime(message.created_at)}</span>
                  {getStatusIcon(message)}
                </div>
                {message.error_message && (
                  <p className="text-xs text-red-300 mt-1">{message.error_message}</p>
                )}
                {message.user && message.direction === 'outbound' && (
                  <p className="text-xs text-indigo-200 mt-1">
                    Sent by {message.user.name || message.user.email}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            maxLength={1600}
          />
          <button
            type="submit"
            disabled={sending || !messageBody.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5" />
                Send
              </>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Sending to: {contact.mobile_phone || contact.office_phone}
        </p>
      </form>
    </div>
  )
}
