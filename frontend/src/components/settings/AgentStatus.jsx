import { useEffect, useState } from 'react';
import { api } from '../../api';
import {
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  Bars3Icon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AgentStatus() {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningAgents, setRunningAgents] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedAgentDescription, setSelectedAgentDescription] = useState(null);

  // Table state - RULE #19 compliance
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnWidths, setColumnWidths] = useState({
    agent: 250,
    description: 500,
    status: 140,
    lastRun: 180,
    totalRuns: 120,
    successRate: 120,
    actions: 100
  });
  const [resizingColumn, setResizingColumn] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState({
    agent: true,
    description: true,
    status: true,
    lastRun: true,
    totalRuns: true,
    successRate: true,
    actions: true
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [columnOrder, setColumnOrder] = useState(['agent', 'description', 'status', 'lastRun', 'totalRuns', 'successRate', 'actions']);
  const [draggingColumn, setDraggingColumn] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    fetchAgentStatus();
  }, []);

  // Column resize handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizingColumn) {
        const diff = e.clientX - resizeStartX;
        const newWidth = Math.max(100, resizeStartWidth + diff);
        setColumnWidths(prev => ({
          ...prev,
          [resizingColumn]: newWidth
        }));
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const loadCurrentUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData.email || userData.name || 'User');
      } catch (e) {
        setCurrentUser('User');
      }
    } else {
      setCurrentUser('User');
    }
  };

  const fetchAgentStatus = async () => {
    try {
      setLoading(true);
      // RULE #1.13 - Single Source of Truth: Fetch all agent data from API
      const data = await api.get('/api/v1/agents');
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
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // RULE #1.13 - Single Source of Truth: Data comes from API, not hardcoded
  // These functions now just pass through the data from the agent object
  const getAgentIcon = (agent) => {
    return agent.icon || '🤖';
  };

  const getAgentDisplayName = (agent) => {
    return agent.name || agent.agent_id;
  };

  const getAgentDescription = (agent) => {
    return agent.description || agent.focus || 'Specialized Claude Code agent';
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
        No runs
      </span>
    );
  };

  const handleRunAgent = async (agentName) => {
    setRunningAgents(prev => new Set(prev).add(agentName));
    try {
      // Simulate agent run - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Running agent: ${agentName}`);
      // Refresh agent status after run
      await fetchAgentStatus();
    } catch (err) {
      console.error(`Error running agent ${agentName}:`, err);
    } finally {
      setRunningAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentName);
        return newSet;
      });
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Convert API response to array format
  const agentsArray = agentData
    ? agentData.map(agent => ({
        id: agent.agent_id,
        name: agent.name,
        displayName: getAgentDisplayName(agent),
        icon: getAgentIcon(agent),
        description: getAgentDescription(agent),
        last_run: agent.last_run_at,
        status: agent.last_status,
        total_runs: agent.total_runs || 0,
        success_rate: agent.success_rate || 0
      }))
    : [];

  // Filter and sort
  const filteredAgents = agentsArray
    .filter(agent => {
      if (globalSearch) {
        const search = globalSearch.toLowerCase();
        if (
          !agent.displayName?.toLowerCase().includes(search) &&
          !agent.description?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value) {
          const fieldValue = String(agent[key] || '').toLowerCase();
          if (!fieldValue.includes(value.toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const columns = [
    { key: 'agent', label: 'Agent', sortable: true, searchable: true },
    { key: 'description', label: 'Description', sortable: true, searchable: true },
    { key: 'status', label: 'Status', sortable: true, searchable: false },
    { key: 'lastRun', label: 'Last Run', sortable: true, searchable: false },
    { key: 'totalRuns', label: 'Total Runs', sortable: true, searchable: false },
    { key: 'successRate', label: 'Success Rate', sortable: true, searchable: false },
    { key: 'actions', label: 'Actions', sortable: false, searchable: false }
  ];

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Claude Code Agents
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor and run specialized Claude Code agents for development tasks
        </p>
      </div>

      {/* Table Toolbar - RULE #19.11A */}
      <div className="mb-4 px-6 flex items-center justify-between gap-4" style={{ minHeight: '44px' }}>
        {/* LEFT SIDE: Global Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Action buttons */}
        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm whitespace-nowrap"
              >
                Clear Selection
              </button>
            </>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchAgentStatus}
            disabled={loading}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Toggle columns"
            >
              <EyeIcon className="h-5 w-5" />
            </button>

            {/* Column Picker Dropdown */}
            {showColumnPicker && (
              <div className="absolute right-0 z-20 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[200px]">
                {columns.map(column => (
                  <label key={column.key} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.key]}
                      onChange={() => {
                        setVisibleColumns(prev => ({
                          ...prev,
                          [column.key]: !prev[column.key]
                        }));
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{column.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table - RULE #19.2 Sticky Headers, #19.3 Inline Filters, #19.5B Resizable */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
              <tr>
                {/* Row Selection - RULE #19.9 */}
                <th className="px-2 py-3 w-8 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedIds.size === filteredAgents.length && filteredAgents.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredAgents.map(a => a.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                  />
                </th>
                {columnOrder
                  .map(key => columns.find(col => col.key === key))
                  .filter(column => column && visibleColumns[column.key])
                  .map(column => (
                  <th
                    key={column.key}
                    draggable
                    onDragStart={(e) => {
                      setDraggingColumn(column.key);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedCol = draggingColumn;
                      const targetCol = column.key;
                      if (draggedCol && draggedCol !== targetCol) {
                        const newOrder = [...columnOrder];
                        const dragIndex = newOrder.indexOf(draggedCol);
                        const targetIndex = newOrder.indexOf(targetCol);
                        newOrder.splice(dragIndex, 1);
                        newOrder.splice(targetIndex, 0, draggedCol);
                        setColumnOrder(newOrder);
                      }
                      setDraggingColumn(null);
                    }}
                    onDragEnd={() => setDraggingColumn(null)}
                    style={{ width: columnWidths[column.key] }}
                    className={`relative px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${draggingColumn === column.key ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {/* Drag handle icon */}
                          <Bars3Icon
                            className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
                            title="Drag to reorder"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {/* Sortable area */}
                          <div
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (column.sortable) handleSort(column.key);
                            }}
                          >
                            <div>{column.label}</div>
                            {column.sortable && sortConfig.key === column.key && (
                              sortConfig.direction === 'asc' ?
                                <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> :
                                <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                        </div>
                        {column.searchable && (
                          <input
                            type="text"
                            placeholder="Filter..."
                            value={columnFilters[column.key] || ''}
                            onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                    </div>
                    {/* Resize handle */}
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors z-20"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setResizingColumn(column.key);
                        setResizeStartX(e.clientX);
                        setResizeStartWidth(columnWidths[column.key]);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAgents.map(agent => (
                <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Row Selection */}
                  <td className="px-2 py-3 w-8 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedIds.has(agent.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedIds);
                        if (newSelected.has(agent.id)) {
                          newSelected.delete(agent.id);
                        } else {
                          newSelected.add(agent.id);
                        }
                        setSelectedIds(newSelected);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {/* Render cells in column order */}
                  {columnOrder
                    .filter(key => visibleColumns[key])
                    .map(key => {
                      if (key === 'agent') {
                        return (
                          <td key="agent" className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{agent.icon}</span>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {agent.displayName}
                              </div>
                            </div>
                          </td>
                        );
                      } else if (key === 'description') {
                        return (
                          <td
                            key="description"
                            className="px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onDoubleClick={() => setSelectedAgentDescription({
                              name: agent.name || agent.agent_id,
                              description: agent.description
                            })}
                            title="Double-click to view full description"
                          >
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                              {agent.description}
                            </div>
                          </td>
                        );
                      } else if (key === 'status') {
                        return (
                          <td key="status" className="px-6 py-4">
                            {getStatusBadge(agent.last_status)}
                          </td>
                        );
                      } else if (key === 'lastRun') {
                        return (
                          <td key="lastRun" className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {agent.last_run ? formatDate(agent.last_run) : 'Never'}
                            </div>
                          </td>
                        );
                      } else if (key === 'totalRuns') {
                        return (
                          <td key="totalRuns" className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {agent.total_runs || 0}
                            </div>
                          </td>
                        );
                      } else if (key === 'successRate') {
                        return (
                          <td key="successRate" className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {agent.total_runs > 0 ? `${agent.success_rate}%` : 'N/A'}
                            </div>
                          </td>
                        );
                      } else if (key === 'actions') {
                        return (
                          <td key="actions" className="px-6 py-4">
                            <button
                              onClick={() => handleRunAgent(agent.id)}
                              disabled={runningAgents.has(agent.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {runningAgents.has(agent.id) ? (
                                <>
                                  <ArrowPathIcon className="h-3 w-3 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <PlayCircleIcon className="h-3 w-3" />
                                  Run
                                </>
                              )}
                            </button>
                          </td>
                        );
                      }
                      return null;
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 px-6 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAgents.length} of {agentsArray.length} agents
        {(globalSearch || Object.keys(columnFilters).length > 0) && ' (filtered)'}
      </div>

      {/* Description Modal */}
      {selectedAgentDescription && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedAgentDescription(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedAgentDescription.name}
              </h3>
              <button
                onClick={() => setSelectedAgentDescription(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {selectedAgentDescription.description}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAgentDescription(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
