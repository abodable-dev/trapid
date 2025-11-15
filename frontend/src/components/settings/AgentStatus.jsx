import { useEffect, useState } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

export default function AgentStatus() {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgentStatus();
  }, []);

  const fetchAgentStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/agents/status');
      if (!response.ok) throw new Error('Failed to fetch agent status');
      const data = await response.json();
      setAgentData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getAgentIcon = (agentName) => {
    const icons = {
      'backend-developer': '🔧',
      'frontend-developer': '🎨',
      'production-bug-hunter': '🔍',
      'deploy-manager': '🚀',
      'planning-collaborator': '📋',
      'gantt-bug-hunter': '🐛'
    };
    return icons[agentName] || '🤖';
  };

  const getAgentDisplayName = (agentName) => {
    const names = {
      'backend-developer': 'Backend Developer',
      'frontend-developer': 'Frontend Developer',
      'production-bug-hunter': 'Production Bug Hunter',
      'deploy-manager': 'Deploy Manager',
      'planning-collaborator': 'Planning Collaborator',
      'gantt-bug-hunter': 'Gantt Bug Hunter'
    };
    return names[agentName] || agentName;
  };

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
          <CheckCircleIcon className="h-3 w-3" />
          Success
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400">
          <XCircleIcon className="h-3 w-3" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
        <PlayCircleIcon className="h-3 w-3" />
        No runs yet
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading agent status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading agent status</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const agents = agentData?.agents || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Agent Status</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Monitor the status and run history of specialized Claude Code agents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(agents).map(([agentName, agentStats]) => (
          <div
            key={agentName}
            className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getAgentIcon(agentName)}</span>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {getAgentDisplayName(agentName)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {agentStats.total_runs} {agentStats.total_runs === 1 ? 'run' : 'runs'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last run:</span>
                <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                  <ClockIcon className="h-4 w-4" />
                  {formatDate(agentStats.last_run)}
                </span>
              </div>

              {agentStats.last_status && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  {getStatusBadge(agentStats.last_status)}
                </div>
              )}

              {agentStats.total_runs > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {agentStats.successful_runs} successful
                    </span>
                    {agentStats.failed_runs > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        ✗ {agentStats.failed_runs} failed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {agentData?.metadata && (
        <div className="mt-6 rounded-md bg-gray-50 dark:bg-gray-800 p-4">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Last updated: {formatDate(agentData.metadata.last_updated)}
          </div>
        </div>
      )}
    </div>
  );
}
