import { useState, useEffect } from 'react'
import {
  PlusIcon, TrashIcon, PencilIcon, DocumentDuplicateIcon,
  CheckIcon, ArrowUpIcon, ArrowDownIcon, InformationCircleIcon,
  MagnifyingGlassIcon, XMarkIcon
} from '@heroicons/react/24/outline'
import { api } from '../../api'
import Toast from '../Toast'

/**
 * Schedule Template Editor - Full 14-column grid interface for creating/editing schedule templates
 * Columns: Name, Supplier, Predecessors, PO Required, Create PO on Start, Price Book Items,
 *          Critical PO, Tags, Photo Required, Certificate Required, Cert Lag Days,
 *          Supervisor Check, Auto-Complete Predecessors, Subtasks
 */

// Tooltip component for column headers
function ColumnTooltip({ text, tooltip }) {
  return (
    <div className="group relative flex items-center gap-1">
      <span>{text}</span>
      <InformationCircleIcon className="h-3.5 w-3.5 text-gray-400 cursor-help" />
      <div className="invisible group-hover:visible absolute z-[9999] top-full left-0 mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-xl border border-gray-700">
        {tooltip}
        <div className="absolute bottom-full left-4 mb-[-4px] border-4 border-transparent border-b-gray-900"></div>
      </div>
    </div>
  )
}

// User role/group options for assignment
const ASSIGNABLE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'site', label: 'Site' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'builder', label: 'Builder' },
  { value: 'estimator', label: 'Estimator' }
]

export default function ScheduleTemplateEditor() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [rows, setRows] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', is_default: false })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTemplates()
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateRows(selectedTemplate.id)
    }
  }, [selectedTemplate])

  const loadTemplates = async () => {
    try {
      const response = await api.get('/api/v1/schedule_templates')
      setTemplates(response)
      if (response.length > 0 && !selectedTemplate) {
        setSelectedTemplate(response[0])
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
      showToast('Failed to load templates', 'error')
    }
  }

  const loadTemplateRows = async (templateId) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/schedule_templates/${templateId}`)
      setRows(response.rows || [])
    } catch (err) {
      console.error('Failed to load template rows:', err)
      showToast('Failed to load template rows', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/api/v1/suppliers')
      setSuppliers(response.suppliers || [])
    } catch (err) {
      console.error('Failed to load suppliers:', err)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const response = await api.post('/api/v1/schedule_templates', {
        schedule_template: templateForm
      })
      showToast('Template created successfully', 'success')
      await loadTemplates()
      setSelectedTemplate(response)
      setShowTemplateModal(false)
      setTemplateForm({ name: '', description: '', is_default: false })
    } catch (err) {
      console.error('Failed to create template:', err)
      showToast('Failed to create template', 'error')
    }
  }

  const handleDuplicateTemplate = async () => {
    if (!selectedTemplate) return

    const newName = prompt('Enter name for duplicated template:', `${selectedTemplate.name} (Copy)`)
    if (!newName) return

    try {
      const response = await api.post(`/api/v1/schedule_templates/${selectedTemplate.id}/duplicate`, {
        new_name: newName
      })
      showToast('Template duplicated successfully', 'success')
      await loadTemplates()
      setSelectedTemplate(response)
    } catch (err) {
      console.error('Failed to duplicate template:', err)
      showToast('Failed to duplicate template', 'error')
    }
  }

  const handleSetAsDefault = async () => {
    if (!selectedTemplate) return

    try {
      await api.post(`/api/v1/schedule_templates/${selectedTemplate.id}/set_as_default`)
      showToast('Template set as default', 'success')
      await loadTemplates()
    } catch (err) {
      console.error('Failed to set default template:', err)
      showToast('Failed to set default template', 'error')
    }
  }

  const handleAddRow = async () => {
    if (!selectedTemplate) return

    const newRow = {
      name: 'New Task',
      supplier_id: null,
      assigned_role: null,
      predecessor_ids: [],
      po_required: false,
      create_po_on_job_start: false,
      price_book_item_ids: [],
      critical_po: false,
      tags: [],
      require_photo: false,
      require_certificate: false,
      cert_lag_days: 10,
      require_supervisor_check: false,
      auto_complete_predecessors: false,
      has_subtasks: false,
      subtask_count: 0,
      subtask_names: [],
      sequence_order: rows.length
    }

    try {
      const response = await api.post(
        `/api/v1/schedule_templates/${selectedTemplate.id}/rows`,
        { schedule_template_row: newRow }
      )
      setRows([...rows, response])
      showToast('Row added', 'success')
    } catch (err) {
      console.error('Failed to add row:', err)
      showToast('Failed to add row', 'error')
    }
  }

  const handleUpdateRow = async (rowId, updates) => {
    try {
      await api.patch(
        `/api/v1/schedule_templates/${selectedTemplate.id}/rows/${rowId}`,
        { schedule_template_row: updates }
      )
      setRows(rows.map(r => r.id === rowId ? { ...r, ...updates } : r))
    } catch (err) {
      console.error('Failed to update row:', err)
      showToast('Failed to update row', 'error')
    }
  }

  const handleDeleteRow = async (rowId) => {
    if (!confirm('Delete this row?')) return

    try {
      await api.delete(`/api/v1/schedule_templates/${selectedTemplate.id}/rows/${rowId}`)
      setRows(rows.filter(r => r.id !== rowId))
      showToast('Row deleted', 'success')
    } catch (err) {
      console.error('Failed to delete row:', err)
      showToast('Failed to delete row', 'error')
    }
  }

  const handleMoveRow = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= rows.length) return

    const newRows = [...rows]
    ;[newRows[index], newRows[newIndex]] = [newRows[newIndex], newRows[index]]

    setRows(newRows)

    try {
      await api.post(
        `/api/v1/schedule_templates/${selectedTemplate.id}/rows/reorder`,
        { row_ids: newRows.map(r => r.id) }
      )
    } catch (err) {
      console.error('Failed to reorder rows:', err)
      showToast('Failed to reorder rows', 'error')
    }
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Filter rows based on search query
  const filteredRows = rows.filter(row => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      row.name.toLowerCase().includes(query) ||
      (row.supplier_name && row.supplier_name.toLowerCase().includes(query)) ||
      (row.tags && row.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  })

  return (
    <div className="max-w-full px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schedule Templates
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create reusable schedule templates with full task dependencies and automation
          </p>
        </div>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Template
        </button>
      </div>

      {/* Template Selector */}
      <div className="mb-4 flex items-center gap-4">
        <select
          value={selectedTemplate?.id || ''}
          onChange={(e) => {
            const template = templates.find(t => t.id === parseInt(e.target.value))
            setSelectedTemplate(template)
          }}
          className="flex-1 max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} {template.is_default ? '(Default)' : ''}
            </option>
          ))}
        </select>

        {selectedTemplate && (
          <>
            <button
              onClick={handleDuplicateTemplate}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Duplicate Template"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
            </button>
            {!selectedTemplate.is_default && (
              <button
                onClick={handleSetAsDefault}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                title="Set as Default"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Search Bar */}
      {selectedTemplate && (
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${rows.length} task${rows.length !== 1 ? 's' : ''} by name, supplier, or tags...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 14-Column Grid */}
      {selectedTemplate && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="min-w-[2000px]">
            {/* Header Row */}
            <div className="grid grid-cols-[40px_200px_150px_100px_80px_80px_120px_80px_100px_80px_80px_80px_80px_80px_120px_80px] gap-2 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
              <div>#</div>
              <ColumnTooltip
                text="Task Name"
                tooltip="The name of the task that will appear in the schedule. Be descriptive so builders know exactly what needs to be done."
              />
              <ColumnTooltip
                text="Supplier / Group"
                tooltip="For PO tasks: select a supplier. For internal work: assign to a team (Admin, Sales, Site, Supervisor, Builder, Estimator)."
              />
              <ColumnTooltip
                text="Predecessors"
                tooltip="Tasks that must be completed before this one starts. Supports FS (Finish-to-Start), SS (Start-to-Start), FF (Finish-to-Finish), and SF (Start-to-Finish) dependencies with lag days."
              />
              <ColumnTooltip
                text="PO Req"
                tooltip="Check if this task requires a purchase order. This tracks whether a PO is needed, but doesn't automatically create one."
              />
              <ColumnTooltip
                text="Auto PO"
                tooltip="Automatically create and send a purchase order to the supplier when the job starts. Requires a supplier to be selected."
              />
              <ColumnTooltip
                text="Price Items"
                tooltip="Link price book items to this task. These items will be included in the auto-generated purchase order."
              />
              <ColumnTooltip
                text="Critical"
                tooltip="Mark this PO as critical priority. Critical POs will be highlighted and require immediate attention."
              />
              <ColumnTooltip
                text="Tags"
                tooltip="Add tags to categorize and filter tasks (e.g., 'electrical', 'foundation', 'inspection'). Useful for filtering views by trade."
              />
              <ColumnTooltip
                text="Photo"
                tooltip="Automatically spawn a photo task when this task is completed. Use for tasks that need photo documentation."
              />
              <ColumnTooltip
                text="Cert"
                tooltip="Automatically spawn a certificate task when this task is completed. Used for regulatory certifications and compliance documents."
              />
              <ColumnTooltip
                text="Cert Lag"
                tooltip="Number of days after task completion when the certificate is due. Default is 10 days."
              />
              <ColumnTooltip
                text="Sup Check"
                tooltip="Require a supervisor to check in on this task. Supervisor will get a prompt to visit the site and verify quality."
              />
              <ColumnTooltip
                text="Auto ✓"
                tooltip="Automatically mark all predecessor tasks as complete when this task is completed. Useful for cleanup or milestone tasks."
              />
              <ColumnTooltip
                text="Subtasks"
                tooltip="Automatically create subtasks when this task starts. Useful for breaking down complex tasks into smaller steps."
              />
              <div>Actions</div>
            </div>

            {/* Data Rows */}
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No rows yet. Click "Add Row" to start building your template.
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No tasks match your search.
              </div>
            ) : (
              filteredRows.map((row, index) => (
                <ScheduleTemplateRow
                  key={row.id}
                  row={row}
                  index={rows.findIndex(r => r.id === row.id)}
                  suppliers={suppliers}
                  onUpdate={(updates) => handleUpdateRow(row.id, updates)}
                  onDelete={() => handleDeleteRow(row.id)}
                  onMoveUp={() => handleMoveRow(rows.findIndex(r => r.id === row.id), 'up')}
                  onMoveDown={() => handleMoveRow(rows.findIndex(r => r.id === row.id), 'down')}
                  canMoveUp={rows.findIndex(r => r.id === row.id) > 0}
                  canMoveDown={rows.findIndex(r => r.id === row.id) < rows.length - 1}
                />
              ))
            )}
          </div>

          {/* Add Row Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleAddRow}
              className="inline-flex items-center px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Row
            </button>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Template
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                  placeholder="e.g., Standard House Build"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                  rows="3"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={templateForm.is_default}
                  onChange={(e) => setTemplateForm({ ...templateForm, is_default: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Set as default template
                </span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setTemplateForm({ name: '', description: '', is_default: false })
                }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!templateForm.name}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

// Individual row component
function ScheduleTemplateRow({
  row, index, suppliers, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown
}) {
  const [localName, setLocalName] = useState(row.name)
  const [updateTimeout, setUpdateTimeout] = useState(null)

  // Debounced update for text fields
  const handleTextChange = (field, value) => {
    if (field === 'name') {
      setLocalName(value)
    }

    // Clear existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout)
    }

    // Set new timeout to update after user stops typing
    const timeout = setTimeout(() => {
      if (value && value.trim()) { // Only update if non-empty
        onUpdate({ [field]: value })
      }
    }, 500)

    setUpdateTimeout(timeout)
  }

  // Immediate update for checkboxes and selects
  const handleFieldChange = (field, value) => {
    // Handle interdependent fields
    if (field === 'po_required') {
      if (!value) {
        // If po_required is unchecked, also uncheck create_po_on_job_start and clear supplier
        onUpdate({ po_required: false, create_po_on_job_start: false, supplier_id: null })
      } else {
        // If po_required is checked, clear assigned_role
        onUpdate({ po_required: true, assigned_role: null })
      }
    } else if (field === 'create_po_on_job_start') {
      if (value && !row.supplier_id) {
        // If checking create_po_on_job_start but no supplier, show error and don't update
        alert('Please select a supplier first before enabling Auto PO')
        return
      } else {
        onUpdate({ [field]: value })
      }
    } else {
      onUpdate({ [field]: value })
    }
  }

  return (
    <div className="grid grid-cols-[40px_200px_150px_100px_80px_80px_120px_80px_100px_80px_80px_80px_80px_80px_120px_80px] gap-2 p-4 border-b border-gray-100 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30">
      {/* Sequence # */}
      <div className="text-gray-500 dark:text-gray-400">{index + 1}</div>

      {/* Task Name */}
      <input
        type="text"
        value={localName}
        onChange={(e) => handleTextChange('name', e.target.value)}
        onFocus={(e) => e.target.select()}
        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white text-sm"
      />

      {/* Supplier / Group */}
      {row.po_required ? (
        <select
          value={row.supplier_id || ''}
          onChange={(e) => handleFieldChange('supplier_id', e.target.value ? parseInt(e.target.value) : null)}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white text-sm"
        >
          <option value="">Select supplier...</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      ) : (
        <select
          value={row.assigned_role || ''}
          onChange={(e) => handleFieldChange('assigned_role', e.target.value || null)}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white text-sm"
        >
          <option value="">Assign to group...</option>
          {ASSIGNABLE_ROLES.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      )}

      {/* Predecessors */}
      <input
        type="text"
        value={row.predecessor_display || 'None'}
        readOnly
        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-800"
        title="Click to edit predecessors"
      />

      {/* PO Required */}
      <input
        type="checkbox"
        checked={row.po_required}
        onChange={(e) => handleFieldChange('po_required', e.target.checked)}
        className="mx-auto"
      />

      {/* Auto PO */}
      <input
        type="checkbox"
        checked={row.create_po_on_job_start}
        onChange={(e) => handleFieldChange('create_po_on_job_start', e.target.checked)}
        disabled={!row.po_required}
        className="mx-auto"
      />

      {/* Price Items */}
      <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
        {row.price_book_item_ids.length} items
      </div>

      {/* Critical PO */}
      <input
        type="checkbox"
        checked={row.critical_po}
        onChange={(e) => handleFieldChange('critical_po', e.target.checked)}
        className="mx-auto"
      />

      {/* Tags */}
      <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
        {row.tags.length} tags
      </div>

      {/* Photo */}
      <input
        type="checkbox"
        checked={row.require_photo}
        onChange={(e) => handleFieldChange('require_photo', e.target.checked)}
        className="mx-auto"
      />

      {/* Certificate */}
      <input
        type="checkbox"
        checked={row.require_certificate}
        onChange={(e) => handleFieldChange('require_certificate', e.target.checked)}
        className="mx-auto"
      />

      {/* Cert Lag */}
      <input
        type="number"
        value={row.cert_lag_days}
        onChange={(e) => handleFieldChange('cert_lag_days', parseInt(e.target.value))}
        disabled={!row.require_certificate}
        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white text-sm w-full"
      />

      {/* Supervisor Check */}
      <input
        type="checkbox"
        checked={row.require_supervisor_check}
        onChange={(e) => handleFieldChange('require_supervisor_check', e.target.checked)}
        className="mx-auto"
      />

      {/* Auto Complete */}
      <input
        type="checkbox"
        checked={row.auto_complete_predecessors}
        onChange={(e) => handleFieldChange('auto_complete_predecessors', e.target.checked)}
        className="mx-auto"
      />

      {/* Subtasks */}
      <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
        {row.has_subtasks ? `${row.subtask_count} subs` : '-'}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {canMoveUp && (
          <button onClick={onMoveUp} className="p-1 hover:text-indigo-600" title="Move up">
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        )}
        {canMoveDown && (
          <button onClick={onMoveDown} className="p-1 hover:text-indigo-600" title="Move down">
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        )}
        <button onClick={onDelete} className="p-1 hover:text-red-600" title="Delete">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
