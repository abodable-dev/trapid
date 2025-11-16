import { useState, useEffect } from 'react'
import { api } from '../../api'
import {
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function AgentShortcutsTab() {
  const [agents, setAgents] = useState([])
  const [agentTasks, setAgentTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)

  // Pre-populated instructions for each agent
  const defaultInstructions = {
    'backend-developer': [
      'Create new API endpoint for user preferences',
      'Add migration for new table column',
      'Fix N+1 query in jobs controller',
      'Add validation to Purchase Order model',
      'Create service object for complex business logic',
      'Add background job for email notifications',
      'Update serializer to include new fields',
      'Add database index for performance',
      'Fix failing spec in models/contact_spec.rb',
      'Add API documentation for new endpoint'
    ],
    'frontend-developer': [
      'Create new modal component for settings',
      'Add dark mode support to new components',
      'Fix responsive layout on mobile',
      'Add loading state to data table',
      'Create new page for reporting',
      'Add form validation with helpful error messages',
      'Optimize bundle size by code splitting',
      'Add keyboard shortcuts to modal',
      'Fix z-index layering issue',
      'Add accessibility labels to buttons'
    ],
    'production-bug-hunter': [
      'Investigate slow API response times',
      'Debug 500 error on job creation',
      'Check for memory leaks in frontend',
      'Analyze Heroku logs for errors',
      'Fix broken authentication flow',
      'Debug missing data in reports',
      'Investigate Xero sync failures',
      'Check database connection pool issues',
      'Debug CORS errors on staging',
      'Analyze performance bottlenecks'
    ],
    'deploy-manager': [
      'Deploy latest changes to staging',
      'Run database migrations on staging',
      'Check deployment health after push',
      'Verify environment variables are set',
      'Test API endpoints after deployment',
      'Check frontend build succeeded',
      'Verify background jobs are running',
      'Check Heroku dyno status',
      'Test Xero integration after deploy',
      'Verify OneDrive connection works'
    ],
    'planning-collaborator': [
      'Plan new feature: Advanced reporting',
      'Design database schema for new module',
      'Create architecture diagram for API',
      'Plan refactoring of legacy code',
      'Design UX flow for onboarding',
      'Plan migration strategy for data',
      'Create technical spec for new feature',
      'Plan API versioning strategy',
      'Design caching layer for performance',
      'Plan testing strategy for new module'
    ],
    'gantt-bug-hunter': [
      'Run all 12 Gantt visual tests',
      'Verify RULE #9.1 (Timezone compliance)',
      'Check RULE #9.3 (Company Settings)',
      'Test cascade behavior on drag',
      'Verify working days enforcement',
      'Check lock state consistency',
      'Test public holiday exclusions',
      'Verify manual positioning persists',
      'Check critical path calculation',
      'Test template inheritance rules'
    ]
  }

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const response = await api.get('/agent_definitions')
      if (response.data.success) {
        const agentsData = response.data.data
        setAgents(agentsData)

        const savedTasks = localStorage.getItem('agentTasks')
        if (savedTasks) {
          setAgentTasks(JSON.parse(savedTasks))
        } else {
          const initialTasks = {}
          agentsData.forEach(agent => {
            const instructions = defaultInstructions[agent.agent_id] || []
            initialTasks[agent.agent_id] = instructions.map((desc, idx) => ({
              id: Date.now() + idx,
              description: desc,
              completed: false
            }))
          })
          setAgentTasks(initialTasks)
          localStorage.setItem('agentTasks', JSON.stringify(initialTasks))
        }
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = (agentId) => {
    const newTasks = {
      ...agentTasks,
      [agentId]: [
        ...(agentTasks[agentId] || []),
        { id: Date.now(), description: '', completed: false }
      ]
    }
    setAgentTasks(newTasks)
    localStorage.setItem('agentTasks', JSON.stringify(newTasks))
  }

  const updateTask = (agentId, taskId, description) => {
    const newTasks = {
      ...agentTasks,
      [agentId]: agentTasks[agentId].map(task =>
        task.id === taskId ? { ...task, description } : task
      )
    }
    setAgentTasks(newTasks)
    localStorage.setItem('agentTasks', JSON.stringify(newTasks))
  }

  const toggleTask = (agentId, taskId) => {
    const newTasks = {
      ...agentTasks,
      [agentId]: agentTasks[agentId].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }
    setAgentTasks(newTasks)
    localStorage.setItem('agentTasks', JSON.stringify(newTasks))
  }

  const deleteTask = (agentId, taskId) => {
    const newTasks = {
      ...agentTasks,
      [agentId]: agentTasks[agentId].filter(task => task.id !== taskId)
    }
    setAgentTasks(newTasks)
    localStorage.setItem('agentTasks', JSON.stringify(newTasks))
  }

  const resetToDefaults = () => {
    if (!confirm('Reset all shortcuts to default values?')) return

    const initialTasks = {}
    agents.forEach(agent => {
      const instructions = defaultInstructions[agent.agent_id] || []
      initialTasks[agent.agent_id] = instructions.map((desc, idx) => ({
        id: Date.now() + idx,
        description: desc,
        completed: false
      }))
    })
    setAgentTasks(initialTasks)
    localStorage.setItem('agentTasks', JSON.stringify(initialTasks))
  }


  const saveAndExportToLexicon = async () => {
    setSaving(true)
    setExportStatus({ type: 'loading', message: 'Updating Lexicon...' })
    try {
      for (const agent of agents) {
        const completedTasks = (agentTasks[agent.agent_id] || []).filter(t => t.completed)
        if (completedTasks.length > 0) {
          await api.post('/documented_bugs', {
            documented_bug: {
              chapter_number: 20,
              chapter_name: 'Agent System & Automation',
              component: agent.name,
              bug_title: `Tasks completed by ${agent.name}`,
              knowledge_type: 'dev_note',
              description: `Completed ${completedTasks.length} tasks`,
              details: completedTasks.map(t => t.description).join('\n')
            }
          })
        }
      }
      const exportResponse = await api.post('/documented_bugs/export_to_markdown')
      setExportStatus({
        type: 'success',
        message: `Lexicon updated! ${exportResponse.data.total_entries} entries exported.`
      })
    } catch (error) {
      setExportStatus({ type: 'error', message: `Error: ${error.message}` })
    } finally {
      setSaving(false)
      setTimeout(() => setExportStatus(null), 5000)
    }
  }

  if (loading) {
    return <div className="animate-pulse p-6">Loading agent shortcuts...</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Claude Code Shortcuts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize instructions that Claude Code sees when you type shortcuts like <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">/gantt</code>, <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">/deploy</code>, etc.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          💡 These shortcuts don't run automatically - they're just instructions for Claude Code to follow.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4" />
            Auto-saved to browser
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={saveAndExportToLexicon}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <DocumentTextIcon className="w-4 h-4" />}
          Save to Lexicon
        </button>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Reset Defaults
        </button>
      </div>

      {/* Status Message */}
      {exportStatus && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          exportStatus.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
          exportStatus.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
          'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
        }`}>
          {exportStatus.message}
        </div>
      )}

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map(agent => {
          const tasks = agentTasks[agent.agent_id] || []

          return (
            <div key={agent.agent_id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {agent.status_emoji} {agent.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{agent.focus}</p>
                </div>
                <button
                  onClick={() => addTask(agent.agent_id)}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Shortcut
                </button>
              </div>

              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm">
                    <button onClick={() => toggleTask(agent.agent_id, task.id)}>
                      {task.completed ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => updateTask(agent.agent_id, task.id, e.target.value)}
                      placeholder="Enter instruction..."
                      className={`flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white ${task.completed ? 'line-through opacity-50' : ''}`}
                    />
                    <button
                      onClick={() => deleteTask(agent.agent_id, task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
