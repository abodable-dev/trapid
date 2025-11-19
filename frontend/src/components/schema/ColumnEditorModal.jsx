import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import ChoiceEditor from './ChoiceEditor';
import FormulaEditor from './FormulaEditor';
import TypeConversionEditor from './TypeConversionEditor';
import RenameEditor from './RenameEditor';

/**
 * ColumnEditorModal - Modal for editing a single column's schema
 *
 * Opens when user clicks the cog icon (⚙️) on a column header in "Edit Individual" mode
 * Shows the appropriate editor based on column type and selected action
 */
const ColumnEditorModal = ({ isOpen, column, table, tableId, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [editedColumn, setEditedColumn] = useState({
    name: column?.name || '',
    column_name: column?.column_name || '',
    data_type: column?.data_type || column?.column_type || 'string'
  });
  const [saving, setSaving] = useState(false);

  // Map column types to database types (matches backend COLUMN_TYPE_MAP)
  const COLUMN_TYPE_TO_DB_TYPE = {
    'single_line_text': 'string',
    'email': 'string',
    'phone': 'string',
    'url': 'string',
    'multiple_lines_text': 'text',
    'date': 'date',
    'date_and_time': 'datetime',
    'number': 'decimal',
    'percentage': 'decimal',
    'currency': 'decimal',
    'whole_number': 'integer',
    'boolean': 'boolean',
    'lookup': 'integer',
    'choice': 'string',
    'computed': 'string',
    'user': 'integer',
    'multiple_lookups': 'text'
  };

  // Get the database type for a column type
  const getDbType = (columnType) => {
    return COLUMN_TYPE_TO_DB_TYPE[columnType] || 'unknown';
  };

  // Sync state when column prop changes
  useEffect(() => {
    if (column) {
      setEditedColumn({
        name: column.name || '',
        column_name: column.column_name || '',
        data_type: column.data_type || column.column_type || 'string'
      });
    }
  }, [column]);

  if (!isOpen || !column) return null;

  const isChoiceColumn = ['choice', 'dropdown', 'select'].includes(column.column_type?.toLowerCase());
  const isComputedColumn = column.column_type === 'computed' || column.formula;

  const tabs = [
    { id: 'info', label: 'Column Info', icon: 'ℹ️' },
    { id: 'rename', label: 'Rename', icon: '✏️' },
    { id: 'type', label: 'Change Type', icon: '🔄' },
  ];

  if (isChoiceColumn) {
    tabs.push({ id: 'choices', label: 'Manage Choices', icon: '📋' });
  }

  if (isComputedColumn) {
    tabs.push({ id: 'formula', label: 'Edit Formula', icon: '🔢' });
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleSaveColumnInfo = async () => {
    try {
      setSaving(true);

      // Validate display name
      if (!editedColumn.name.trim()) {
        alert('Column name cannot be empty');
        setSaving(false);
        return;
      }

      // Validate database column name format
      const dbNameRegex = /^[a-z][a-z0-9_]*$/;
      if (!dbNameRegex.test(editedColumn.column_name)) {
        alert('Database column name must be lowercase, start with a letter, and contain only letters, numbers, and underscores');
        setSaving(false);
        return;
      }

      // Warn if changing database column name or type
      const dbNameChanged = editedColumn.column_name !== column.column_name;
      const typeChanged = editedColumn.data_type !== (column.data_type || column.column_type);

      if (dbNameChanged || typeChanged) {
        const changes = [];
        if (dbNameChanged) changes.push(`database column name from "${column.column_name}" to "${editedColumn.column_name}"`);
        if (typeChanged) changes.push(`type from "${column.column_type}" to "${editedColumn.data_type}"`);

        const confirmed = window.confirm(
          `⚠️ Warning: You are changing the ${changes.join(' and ')}.\n\n` +
          'This will rebuild the database table and may result in data loss if the types are incompatible.\n\n' +
          'Are you sure you want to continue?'
        );

        if (!confirmed) {
          setSaving(false);
          return;
        }
      }

      const response = await api.patch(
        `/api/v1/tables/${tableId}/columns/${column.id}`,
        {
          column: {
            name: editedColumn.name,
            column_name: editedColumn.column_name,
            column_type: editedColumn.data_type
          }
        }
      );

      if (response.data.success) {
        alert('✅ Column updated successfully!');
        handleUpdate();
        handleClose();
      } else {
        alert('❌ Failed to update column: ' + (response.data.errors?.join(', ') || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating column:', error);
      console.error('Full error response:', error.response);

      const errorMsg = error.response?.data?.errors?.join(', ') ||
                       error.response?.data?.error ||
                       error.message ||
                       'Unknown error occurred';

      alert(
        '❌ Failed to update column: ' + errorMsg + '\n\n' +
        'Note: Column updates require rebuilding the database table. ' +
        'If this error persists, you may need to:\n' +
        '1. Check backend logs for details\n' +
        '2. Ensure no data conflicts exist\n' +
        '3. Consider using the schema migration tools instead'
      );
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return editedColumn.name !== column.name ||
           editedColumn.column_name !== column.column_name ||
           editedColumn.data_type !== (column.data_type || column.column_type);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         onClick={(e) => {
           if (e.target === e.currentTarget) {
             handleClose();
           }
         }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh]
                    flex flex-col overflow-hidden"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r
                      from-purple-500 to-pink-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Edit Column: {column.name}
              </h2>
              <p className="text-sm text-purple-100 mt-1">
                {column.column_type} • {column.required ? 'Required' : 'Optional'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50
                      px-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                       border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Column Name
                  </label>
                  <input
                    type="text"
                    value={editedColumn.name}
                    onChange={(e) => setEditedColumn({ ...editedColumn, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 rounded border border-gray-300
                             dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Column display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Database Column
                  </label>
                  <input
                    type="text"
                    value={editedColumn.column_name}
                    onChange={(e) => setEditedColumn({ ...editedColumn, column_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 rounded border border-gray-300
                             dark:border-gray-600 text-sm font-mono text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="database_column_name"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Lowercase, alphanumeric, and underscores only
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Column Type</div>
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300
                                   dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {column.column_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stored As (DB Type)</div>
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-300
                                   dark:border-blue-600 text-sm text-blue-900 dark:text-blue-100 font-mono font-bold">
                        {getDbType(column.column_type)}
                      </div>
                    </div>
                  </div>
                  <select
                    value={editedColumn.data_type}
                    onChange={(e) => setEditedColumn({ ...editedColumn, data_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 rounded border border-gray-300
                             dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <optgroup label="Text Types">
                      <option value="single_line_text">string - Single line of text (up to 255 chars)</option>
                      <option value="email">string - Email address with @ validation</option>
                      <option value="phone">string - Phone number</option>
                      <option value="url">string - Web URL starting with http/https</option>
                      <option value="multiple_lines_text">text - Multiple lines/paragraphs (unlimited)</option>
                    </optgroup>
                    <optgroup label="Number Types">
                      <option value="number">decimal - Decimal numbers (e.g., 123.45)</option>
                      <option value="currency">decimal - Money amounts (e.g., $123.45)</option>
                      <option value="percentage">decimal - Percentage values (e.g., 15.5%)</option>
                      <option value="whole_number">integer - Whole numbers only (e.g., 1, 2, 100)</option>
                    </optgroup>
                    <optgroup label="Date & Time Types">
                      <option value="date">date - Date only (YYYY-MM-DD)</option>
                      <option value="date_and_time">datetime - Date with time (YYYY-MM-DD HH:MM:SS)</option>
                    </optgroup>
                    <optgroup label="Boolean & Choice Types">
                      <option value="boolean">boolean - True/False checkbox</option>
                      <option value="choice">string - Dropdown with predefined options</option>
                    </optgroup>
                    <optgroup label="Relationship Types">
                      <option value="lookup">integer - Link to single record in another table</option>
                      <option value="multiple_lookups">text - Link to multiple records (stored as JSON array)</option>
                      <option value="user">integer - Link to a user account</option>
                    </optgroup>
                    <optgroup label="Advanced Types">
                      <option value="computed">string - Auto-calculated from formula (cached result)</option>
                    </optgroup>
                  </select>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Storage Info:</strong> The database type shown in parentheses indicates how the data is physically stored.
                      For example, percentages are stored as decimal numbers (e.g., 15.5), not strings.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Required
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300
                               dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100">
                    {column.required ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              {column.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300
                               dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100">
                    {column.description}
                  </div>
                </div>
              )}

              {column.default_value && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Value
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300
                               dark:border-gray-600 text-sm font-mono text-gray-900 dark:text-gray-100">
                    {column.default_value}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use the tabs above to rename, change column type, manage choices, or edit formulas.
                  </p>
                  {hasChanges() && (
                    <button
                      onClick={handleSaveColumnInfo}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium
                               rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rename' && (
            <RenameEditor
              tableId={tableId}
              column={column}
              onUpdate={handleUpdate}
            />
          )}

          {activeTab === 'type' && (
            <TypeConversionEditor
              tableId={tableId}
              column={column}
              onUpdate={handleUpdate}
            />
          )}

          {activeTab === 'choices' && isChoiceColumn && (
            <ChoiceEditor
              tableId={tableId}
              column={column}
              onUpdate={handleUpdate}
            />
          )}

          {activeTab === 'formula' && isComputedColumn && (
            <FormulaEditor
              tableId={tableId}
              table={table}
              formula={column.formula}
              onChange={(newFormula) => {
                // Handle formula change
                console.log('Formula updated:', newFormula);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                       rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnEditorModal;
