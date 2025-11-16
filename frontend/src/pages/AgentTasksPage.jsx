import { useState, useEffect } from 'react'
import { api } from '../api'
import BackButton from '../components/common/BackButton'
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function AgentTasksPage() {
  const [agents, setAgents] = useState([])
  const [agentTasks, setAgentTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [runningAgents, setRunningAgents] = useState(new Set())
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

  // Load agents and their tasks
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const response = await api.get('/agent_definitions')
      if (response.data.success) {
        const agentsData = response.data.data
        setAgents(agentsData)

        // Check localStorage first for saved tasks
        const savedTasks = localStorage.getItem('agentTasks')

        if (savedTasks) {
          // Load from localStorage
          setAgentTasks(JSON.parse(savedTasks))
        } else {
          // Initialize with default instructions
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
          // Save to localStorage
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
        ...agentTasks[agentId],
        {
          id: Date.now(),
          description: '',
          completed: false
        }
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
    if (!confirm('Reset all shortcuts to default values? This will delete your custom shortcuts.')) {
      return
    }

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

  const runAgent = async (agentId) => {
    setRunningAgents(prev => new Set(prev).add(agentId))

    try {
      const tasks = agentTasks[agentId] || []
      const taskList = tasks.map(t => `- ${t.description}`).join('\n')

      // Record agent run
      await api.post(`/agent_definitions/${agentId}/record_run`, {
        status: 'success',
        message: `Executed tasks:\n${taskList}`,
        details: {
          task_count: tasks.length,
          completed_count: tasks.filter(t => t.completed).length
        }
      })

      // Mark all tasks as completed
      setAgentTasks(prev => ({
        ...prev,
        [agentId]: prev[agentId].map(task => ({ ...task, completed: true }))
      }))

      // Reload agents to get updated stats
      loadAgents()
    } catch (error) {
      console.error(`Failed to run agent ${agentId}:`, error)

      // Record failure
      await api.post(`/agent_definitions/${agentId}/record_run`, {
        status: 'failure',
        message: error.message,
        details: { error: error.toString() }
      })
    } finally {
      setRunningAgents(prev => {
        const newSet = new Set(prev)
        newSet.delete(agentId)
        return newSet
      })
    }
  }

  const runAllAgents = async () => {
    const agentIds = agents.map(a => a.agent_id)

    // Run all agents in parallel
    await Promise.all(agentIds.map(id => runAgent(id)))
  }

  const saveAndExportToLexicon = async () => {
    setSaving(true)
    setExportStatus({ type: 'loading', message: 'Saving tasks and updating Lexicon...' })

    try {
      // Create documented_bugs entries for each agent's tasks
      for (const agent of agents) {
        const tasks = agentTasks[agent.agent_id] || []
        const completedTasks = tasks.filter(t => t.completed)

        if (completedTasks.length > 0) {
          // Create a knowledge entry for this agent's completed tasks
          await api.post('/documented_bugs', {
            documented_bug: {
              chapter_number: 20, // Chapter 20 = Agent System
              chapter_name: 'Agent System & Automation',
              component: agent.name,
              bug_title: `Tasks completed by ${agent.name}`,
              knowledge_type: 'dev_note',
              description: `Completed ${completedTasks.length} tasks`,
              details: completedTasks.map(t => t.description).join('\n'),
              metadata: {
                agent_id: agent.agent_id,
                total_tasks: tasks.length,
                completed_tasks: completedTasks.length,
                timestamp: new Date().toISOString()
              }
            }
          })
        }
      }

      // Export to markdown
      const exportResponse = await api.post('/documented_bugs/export_to_markdown')

      if (exportResponse.data.success) {
        setExportStatus({
          type: 'success',
          message: `Lexicon updated! ${exportResponse.data.total_entries} entries exported.`
        })
      } else {
        setExportStatus({
          type: 'error',
          message: 'Failed to export Lexicon'
        })
      }

      // Clear completed tasks
      const clearedTasks = {}
      agents.forEach(agent => {
        clearedTasks[agent.agent_id] = agentTasks[agent.agent_id].filter(t => !t.completed)
      })
      setAgentTasks(clearedTasks)

    } catch (error) {
      console.error('Failed to save and export:', error)
      setExportStatus({
        type: 'error',
        message: `Error: ${error.message}`
      })
    } finally {
      setSaving(false)

      // Clear status after 5 seconds
      setTimeout(() => setExportStatus(null), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <BackButton />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Agent Shortcuts
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Edit shortcut instructions for each agent. All changes are saved automatically to your browser.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              💡 <strong>Tip:</strong> Type <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">/gantt</code>, <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">/deploy</code>, etc. in Claude Code
            </p>
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Auto-saved
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={runAllAgents}
            disabled={runningAgents.size > 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
                     hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <PlayIcon className="w-5 h-5" />
            Run All Agents
          </button>

          <button
            onClick={saveAndExportToLexicon}
            disabled={saving || runningAgents.size > 0}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-lg
                     hover:from-green-700 hover:to-green-700 transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <DocumentTextIcon className="w-5 h-5" />
            )}
            Save & Update Lexicon
          </button>

          <button
            onClick={resetToDefaults}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700
                     transition-all shadow-lg flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Reset to Defaults
          </button>
        </div>

        {/* Export Status */}
        {exportStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
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
            const isRunning = runningAgents.has(agent.agent_id)
            const completedCount = tasks.filter(t => t.completed).length

            return (
              <div
                key={agent.agent_id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-2 border-slate-200 dark:border-slate-700"
              >
                {/* Agent Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {agent.status_emoji} {agent.name}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {agent.focus}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addTask(agent.agent_id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
                                 transition-all flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add
                      </button>

                      <button
                        onClick={() => runAgent(agent.agent_id)}
                        disabled={isRunning}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                                 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center gap-2"
                      >
                        {isRunning ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlayIcon className="w-4 h-4" />
                        )}
                        Run
                      </button>
                    </div>
                  </div>

                  {/* Agent Stats */}
                  <div className="flex gap-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Total runs: <strong>{agent.total_runs}</strong>
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      Success rate: <strong>{Math.round(agent.success_rate)}%</strong>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Tasks: <strong>{completedCount}/{tasks.length}</strong>
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-2 mb-4">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <button
                        onClick={() => toggleTask(agent.agent_id, task.id)}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                        )}
                      </button>

                      <input
                        type="text"
                        value={task.description}
                        onChange={(e) => updateTask(agent.agent_id, task.id, e.target.value)}
                        placeholder="Enter task description..."
                        className={`flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white
                                  ${task.completed ? 'line-through opacity-50' : ''}`}
                      />

                      <button
                        onClick={() => deleteTask(agent.agent_id, task.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
