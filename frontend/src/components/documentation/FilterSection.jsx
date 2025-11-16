export default function FilterSection({ filters, onFilterChange, stats }) {
  const chapters = Array.from({ length: 19 }, (_, i) => i)

  const typeOptions = [
    { value: 'all', label: 'All Types', icon: '📚', count: stats?.total_bugs || 0 },
    { value: 'bug', label: 'Bugs', icon: '🐛', count: stats?.by_type?.bug || 0 },
    { value: 'architecture', label: 'Architecture', icon: '🏗️', count: stats?.by_type?.architecture || 0 },
    { value: 'test', label: 'Tests', icon: '📊', count: stats?.by_type?.test || 0 },
    { value: 'performance', label: 'Performance', icon: '📈', count: stats?.by_type?.performance || 0 },
    { value: 'dev_note', label: 'Dev Notes', icon: '🎓', count: stats?.by_type?.dev_note || 0 },
    { value: 'common_issue', label: 'Common Issues', icon: '🔍', count: stats?.by_type?.common_issue || 0 }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '⚡' },
    { value: 'open', label: 'Active', icon: '🔴' },
    { value: 'fixed', label: 'Resolved', icon: '✅' },
    { value: 'monitoring', label: 'Monitoring', icon: '🔄' },
    { value: 'by_design', label: 'By Design', icon: '⚠️' }
  ]

  const severityOptions = [
    { value: 'all', label: 'All Severity', icon: '🔥' },
    { value: 'critical', label: 'Critical', icon: '🔴' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'low', label: 'Low', icon: '🟢' }
  ]

  const FilterGroup = ({ title, options, filterKey, currentValue }) => (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="space-y-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(filterKey, option.value)}
            className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors ${
              currentValue === option.value
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className={currentValue === option.value ? 'text-sm' : 'text-xs opacity-70'}>
              {option.icon}
            </span>
            <span className="flex-1">{option.label}</span>
            {option.count !== undefined && (
              <span className="text-xs text-gray-400">({option.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Filters
      </h2>

      {/* Chapter Filter */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Chapter
        </h3>
        <select
          value={filters.chapter || 'all'}
          onChange={(e) => onFilterChange('chapter', e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Chapters ({stats?.total || 0})</option>
          {chapters.map((num) => {
            const chapterStats = stats?.by_chapter?.find(c => c.chapter_number === num)
            const count = chapterStats?.bug_count || 0
            return count > 0 ? (
              <option key={num} value={num}>
                Chapter {num} ({count})
              </option>
            ) : null
          })}
        </select>
      </div>

      <FilterGroup
        title="Type"
        options={typeOptions}
        filterKey="type"
        currentValue={filters.type || 'all'}
      />

      <FilterGroup
        title="Status"
        options={statusOptions}
        filterKey="status"
        currentValue={filters.status || 'all'}
      />

      <FilterGroup
        title="Severity"
        options={severityOptions}
        filterKey="severity"
        currentValue={filters.severity || 'all'}
      />
    </div>
  )
}
