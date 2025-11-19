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

  // Column type metadata for auto-population - matches Gold Standard exactly
  const COLUMN_TYPE_METADATA = {
    'single_line_text': {
      sqlType: 'VARCHAR(255)',
      validation: 'Optional text field, max 255 characters, alphanumeric',
      usedFor: 'Short text entries like names, titles, codes, unique identifiers',
      example: 'CONC-001, STL-042A, John Smith'
    },
    'email': {
      sqlType: 'VARCHAR(255)',
      validation: 'Must contain @ symbol, valid email format',
      usedFor: 'Email addresses for contacts',
      example: 'supplier@example.com, contact@business.com.au'
    },
    'phone': {
      sqlType: 'VARCHAR(20)',
      validation: 'Format: (03) 9123 4567 or 1300 numbers',
      usedFor: 'Landline phone numbers',
      example: '(03) 9123 4567, 1300 123 456'
    },
    'mobile': {
      sqlType: 'VARCHAR(20)',
      validation: 'Format: 0407 397 541, starts with 04',
      usedFor: 'Mobile phone numbers',
      example: '0407 397 541, 0412 345 678'
    },
    'url': {
      sqlType: 'VARCHAR(500)',
      validation: 'Valid URL format, clickable in table',
      usedFor: 'Links to external documents or files',
      example: 'https://example.com/doc.pdf'
    },
    'multiple_lines_text': {
      sqlType: 'TEXT',
      validation: 'Optional text field, supports line breaks',
      usedFor: 'Notes, comments, multi-line descriptions',
      example: 'Additional notes\\nSecond line\\nThird line'
    },
    'date': {
      sqlType: 'DATE',
      validation: 'Format: YYYY-MM-DD, no time component',
      usedFor: 'Date values without time, for contracts, events, start dates',
      example: '2025-11-19, 1990-01-15'
    },
    'date_and_time': {
      sqlType: 'DATETIME',
      validation: 'Auto-populated on creation/modification, not editable',
      usedFor: 'Record creation and modification timestamps',
      example: '2024-11-19 14:30:00, 2024-11-19 16:45:22'
    },
    'gps_coordinates': {
      sqlType: 'VARCHAR(100)',
      validation: 'Latitude, Longitude format',
      usedFor: 'GPS coordinates for job sites, delivery addresses, asset tracking',
      example: '-33.8688, 151.2093 (Sydney)'
    },
    'color_picker': {
      sqlType: 'VARCHAR(7)',
      validation: 'Hex color format (#RRGGBB)',
      usedFor: 'Visual categorization, status indicators, UI customization',
      example: '#FF5733, #3498DB, #000000'
    },
    'file_upload': {
      sqlType: 'TEXT',
      validation: 'File path or URL to uploaded file',
      usedFor: 'File references, document links, image paths',
      example: '/uploads/doc.pdf, https://example.com/file.png'
    },
    'number': {
      sqlType: 'INTEGER',
      validation: 'Positive integers, shows sum in footer',
      usedFor: 'Quantity of items',
      example: '10, 250, 15'
    },
    'percentage': {
      sqlType: 'DECIMAL(5,2)',
      validation: '0-100, displayed with % symbol',
      usedFor: 'Discount percentage for pricing',
      example: '10.5%, 25%, 0%'
    },
    'currency': {
      sqlType: 'DECIMAL(10,2)',
      validation: 'Positive numbers, 2 decimal places, shows sum in footer',
      usedFor: 'Price in Australian dollars',
      example: '$125.50, $1,234.99'
    },
    'whole_number': {
      sqlType: 'INTEGER',
      validation: 'Integers only (no decimals), shows sum',
      usedFor: 'Counts, units, days - no fractional values',
      example: '5, 100, 42'
    },
    'boolean': {
      sqlType: 'BOOLEAN',
      validation: 'True or False only',
      usedFor: 'Active/inactive status flag',
      example: 'true, false'
    },
    'lookup': {
      sqlType: 'VARCHAR(255)',
      validation: 'Must match predefined category list',
      usedFor: 'Material type classification',
      example: 'Concrete, Timber, Steel, Plasterboard'
    },
    'choice': {
      sqlType: 'VARCHAR(50)',
      validation: 'Limited options: active, inactive (with colored badges)',
      usedFor: 'Status with visual indicators',
      example: 'active (green), inactive (red)'
    },
    'computed': {
      sqlType: 'COMPUTED',
      validation: 'Formula: price × quantity, read-only, shows sum',
      usedFor: 'Automatic calculations from other columns',
      example: '$1,255.00 (from $125.50 × 10)'
    },
    'user': {
      sqlType: 'INTEGER (Foreign Key to Users)',
      validation: 'Must reference valid user ID',
      usedFor: 'Assignment to users, ownership tracking',
      example: 'Assigned To: User #7, Created By: User #1'
    },
    'multiple_lookups': {
      sqlType: 'TEXT (JSON Array)',
      validation: 'Array of IDs stored as JSON',
      usedFor: 'Multiple relationships to other records',
      example: '[1, 5, 12] - Links to multiple related items'
    }
  };

  // Map database types to display types for metadata lookup
  const DB_TYPE_TO_COLUMN_TYPE = {
    'string': 'single_line_text',
    'text': 'multiple_lines_text',
    'integer': 'whole_number',
    'decimal': 'number',
    'boolean': 'boolean',
    'date': 'date',
    'datetime': 'date_and_time'
  };

  // Get metadata for a column type
  const getColumnMetadata = (columnType) => {
    // If it's a database type (string, text, etc), convert to display type first
    const displayType = DB_TYPE_TO_COLUMN_TYPE[columnType] || columnType;

    return COLUMN_TYPE_METADATA[displayType] || {
      sqlType: 'Unknown',
      validation: 'No validation rules defined',
      usedFor: 'No description available',
      example: 'No example available'
    };
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
            <div className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editedColumn.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const updates = { name: newName };

                    // Auto-copy to column_name unless it contains "ratetime"
                    if (!column.column_name?.includes('ratetime')) {
                      // Convert to snake_case
                      const snakeCaseName = newName
                        .toLowerCase()
                        .replace(/[^\w\s]/g, '') // Remove special chars
                        .replace(/\s+/g, '_')     // Replace spaces with underscores
                        .replace(/_+/g, '_')      // Remove duplicate underscores
                        .replace(/^_|_$/g, '');   // Remove leading/trailing underscores

                      updates.column_name = snakeCaseName;
                    }

                    setEditedColumn({ ...editedColumn, ...updates });
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300
                           dark:border-gray-600 text-base text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Column display name"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The name shown to users in the interface
                </p>
              </div>

              {/* SQL Type (Editable) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  SQL Type
                </label>
                <select
                  value={editedColumn.data_type}
                  onChange={(e) => setEditedColumn({ ...editedColumn, data_type: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-purple-300
                           dark:border-purple-600 text-base text-gray-900 dark:text-gray-100 font-medium
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <optgroup label="Text Types">
                    <option value="single_line_text">Single Line Text (VARCHAR 255)</option>
                    <option value="email">Email (VARCHAR 255)</option>
                    <option value="phone">Phone - Landline (VARCHAR 20)</option>
                    <option value="mobile">Mobile Phone (VARCHAR 20)</option>
                    <option value="url">URL / Link (VARCHAR 500)</option>
                    <option value="multiple_lines_text">Multi-Line Text (TEXT)</option>
                  </optgroup>
                  <optgroup label="Number Types">
                    <option value="number">Number / Quantity (INTEGER)</option>
                    <option value="currency">Currency / AUD (DECIMAL 10,2)</option>
                    <option value="percentage">Percentage (DECIMAL 5,2)</option>
                    <option value="whole_number">Whole Number (INTEGER)</option>
                  </optgroup>
                  <optgroup label="Date & Time Types">
                    <option value="date">Date Only (DATE)</option>
                    <option value="date_and_time">Date & Time (DATETIME)</option>
                  </optgroup>
                  <optgroup label="Special Types">
                    <option value="gps_coordinates">GPS Coordinates (VARCHAR 100)</option>
                    <option value="color_picker">Color Picker (VARCHAR 7)</option>
                    <option value="file_upload">File Upload (TEXT)</option>
                  </optgroup>
                  <optgroup label="Boolean & Choice Types">
                    <option value="boolean">Boolean / Checkbox (BOOLEAN)</option>
                    <option value="choice">Choice / Badge (VARCHAR 50)</option>
                  </optgroup>
                  <optgroup label="Relationship Types">
                    <option value="lookup">Lookup / Dropdown (VARCHAR 255)</option>
                    <option value="multiple_lookups">Multiple Lookups (JSON Array)</option>
                    <option value="user">User (Foreign Key)</option>
                  </optgroup>
                  <optgroup label="Advanced Types">
                    <option value="computed">Computed / Formula (COMPUTED)</option>
                  </optgroup>
                </select>
                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs text-purple-800 dark:text-purple-200 font-mono font-semibold">
                    Database Type: {getColumnMetadata(editedColumn.data_type).sqlType}
                  </p>
                </div>
              </div>

              {/* Column Name (Editable) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Column Name (Database)
                </label>
                <input
                  type="text"
                  value={editedColumn.column_name}
                  onChange={(e) => setEditedColumn({ ...editedColumn, column_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-green-300
                           dark:border-green-600 text-base font-mono text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="column_name"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The actual database column name (snake_case recommended)
                </p>
              </div>

              {/* Actual SQL Type from Column */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Actual SQL Type
                </label>
                <div className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200
                             dark:border-blue-700 text-sm font-mono text-blue-900 dark:text-blue-100 font-bold min-h-[2.5rem]">
                  {column.sql_type || ''}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The actual SQL type stored in the database
                </p>
              </div>

              {/* Display Type from Column */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Display Type
                </label>
                <div className="w-full px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200
                             dark:border-green-700 text-sm text-green-900 dark:text-green-100 min-h-[2.5rem]">
                  {column.display_type || ''}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How this column is displayed in the UI
                </p>
              </div>

              {/* Validation Rules from Column */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Validation Rules
                </label>
                <div className="w-full px-4 py-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200
                             dark:border-orange-700 text-sm text-orange-900 dark:text-orange-100 min-h-[2.5rem]">
                  {column.validation_rules || ''}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Validation rules applied to this column
                </p>
              </div>

              {/* Example from Column */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Example
                </label>
                <div className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200
                             dark:border-purple-700 text-sm font-mono text-purple-900 dark:text-purple-100 min-h-[2.5rem]">
                  {column.example || ''}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example values for this column
                </p>
              </div>

              {/* Used For from Column */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Used For
                </label>
                <div className="w-full px-4 py-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-2 border-teal-200
                             dark:border-teal-700 text-sm text-teal-900 dark:text-teal-100 min-h-[2.5rem]">
                  {column.used_for || ''}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Description of what this column is used for
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hasChanges() ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          You have unsaved changes
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">
                          No changes
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Use other tabs to rename, change type details, manage choices, or edit formulas
                    </p>
                  </div>
                  {hasChanges() && (
                    <button
                      onClick={handleSaveColumnInfo}
                      disabled={saving}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-semibold
                               rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
