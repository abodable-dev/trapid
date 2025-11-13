import { useState, useEffect } from 'react'
import { api } from '../../api'
import {
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function TwilioConfiguration() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [formData, setFormData] = useState({
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    twilio_enabled: false
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await api.get('/api/v1/company_settings')
      const data = response.data || response
      setSettings(data)
      setFormData({
        twilio_account_sid: data.twilio_account_sid || '',
        twilio_auth_token: data.twilio_auth_token || '',
        twilio_phone_number: data.twilio_phone_number || '',
        twilio_enabled: data.twilio_enabled || false
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setTestResult(null)

    try {
      await api.put('/api/v1/company_settings', {
        company_setting: formData
      })

      alert('Twilio settings saved successfully!')
      await loadSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await api.post('/api/v1/company_settings/test_twilio')
      setTestResult({
        success: true,
        message: response.data.message || response.message,
        account: response.data.account || response.account
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || error.message || 'Connection test failed'
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            SMS Messaging (Twilio)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send and receive SMS messages with customers and suppliers
          </p>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          How to set up Twilio SMS:
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
          <li>Sign up for Twilio at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="underline">twilio.com/try-twilio</a></li>
          <li>Get your Account SID and Auth Token from the Twilio Console</li>
          <li>Buy an Australian phone number (+61) in Twilio</li>
          <li>Enter your credentials below and enable SMS</li>
          <li>Configure webhook URL in Twilio: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{window.location.origin}/api/v1/sms/webhook</code></li>
        </ol>
      </div>

      {/* Configuration Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Account SID
          </label>
          <input
            type="text"
            name="twilio_account_sid"
            value={formData.twilio_account_sid}
            onChange={handleChange}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Auth Token
          </label>
          <input
            type="password"
            name="twilio_auth_token"
            value={formData.twilio_auth_token}
            onChange={handleChange}
            placeholder="••••••••••••••••••••••••••••••••"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="twilio_phone_number"
            value={formData.twilio_phone_number}
            onChange={handleChange}
            placeholder="+61400000000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your Twilio phone number in E.164 format (e.g., +61400000000)
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="twilio_enabled"
            checked={formData.twilio_enabled}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable SMS messaging
          </label>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <div className="flex items-start">
              {testResult.success ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="ml-3">
                <p className={`text-sm font-medium ${testResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {testResult.message}
                </p>
                {testResult.account && (
                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                    <p>Account: {testResult.account.friendly_name}</p>
                    <p>Status: {testResult.account.status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={handleTestConnection}
            disabled={testing || !formData.twilio_account_sid || !formData.twilio_auth_token}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* Webhook Configuration Warning */}
      {formData.twilio_enabled && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                Don't forget to configure webhooks!
              </h4>
              <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-400">
                In your Twilio console, set the webhook URL for incoming messages to:
              </p>
              <code className="block mt-2 bg-yellow-100 dark:bg-yellow-800 px-3 py-2 rounded text-sm">
                {window.location.origin}/api/v1/sms/webhook
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
