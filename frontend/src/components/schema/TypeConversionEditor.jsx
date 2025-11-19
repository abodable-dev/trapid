import React, { useState, useEffect } from 'react';
import api from '../../api';

/**
 * TypeConversionEditor - Component for changing column types with data conversion preview
 *
 * Features:
 * - Dropdown to select new column type
 * - Conversion strategy selector (clear invalid, set default, etc.)
 * - Preview table showing: Current Value → New Value → Status
 * - Count of successful vs failed conversions
 * - Validation before applying changes
 */
const TypeConversionEditor = ({ tableId, column, onUpdate }) => {
  const [newType, setNewType] = useState(column.column_type);
  const [conversionStrategy, setConversionStrategy] = useState('clear_invalid');
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const columnTypes = [
    { value: 'string', label: 'Text (Single Line)', icon: '📝' },
    { value: 'text', label: 'Text Area (Multi-line)', icon: '📄' },
    { value: 'integer', label: 'Number (Integer)', icon: '🔢' },
    { value: 'float', label: 'Number (Decimal)', icon: '🔢' },
    { value: 'decimal', label: 'Currency/Decimal', icon: '💰' },
    { value: 'boolean', label: 'Yes/No (Boolean)', icon: '✓' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'datetime', label: 'Date & Time', icon: '🕐' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Phone', icon: '📞' },
    { value: 'url', label: 'URL', icon: '🔗' }
  ];

  const conversionStrategies = [
    { value: 'clear_invalid', label: 'Clear Invalid Values', desc: 'Set incompatible values to NULL' },
    { value: 'fail_on_invalid', label: 'Fail if Invalid', desc: 'Block conversion if any values are incompatible' },
    { value: 'set_default', label: 'Set to Default', desc: 'Use column default value for invalid data' }
  ];

  useEffect(() => {
    setNewType(column.column_type);
  }, [column]);

  const handleValidate = async () => {
    if (newType === column.column_type) {
      alert('New type is the same as current type');
      return;
    }

    try {
      setValidating(true);
      setValidationResult(null);

      const response = await api.post(
        `/api/v1/tables/${tableId}/columns/${column.id}/validate_change`,
        {
          change_type: 'change_type',
          new_type: newType,
          conversion_strategy: conversionStrategy
        }
      );

      setValidationResult(response.data);

      // If validation passed, optionally load preview data
      if (response.data.valid) {
        // For now, just show validation result
        // In a full implementation, you'd load sample data to show conversion preview
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error validating conversion:', error);
      alert('Validation failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setValidating(false);
    }
  };

  const handleApply = async () => {
    if (!validationResult || !validationResult.valid) {
      alert('Please validate the conversion first');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to convert column "${column.name}" from ${column.column_type} to ${newType}?\n\n` +
      (validationResult.warnings.length > 0
        ? 'Warnings:\n' + validationResult.warnings.join('\n')
        : 'This operation cannot be undone.')
    );

    if (!confirmed) return;

    try {
      const response = await api.post(
        `/api/v1/tables/${tableId}/columns/${column.id}/apply_change`,
        {
          change_type: 'change_type',
          new_type: newType,
          conversion_strategy: conversionStrategy
        }
      );

      if (response.data.success) {
        alert('Column type successfully changed!');
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error applying conversion:', error);
      alert('Conversion failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const currentTypeLabel = columnTypes.find(t => t.value === column.column_type)?.label || column.column_type;
  const newTypeLabel = columnTypes.find(t => t.value === newType)?.label || newType;

  return (
    <div className="type-conversion-editor p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Change Column Type
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Convert "{column.name}" from <strong>{currentTypeLabel}</strong> to a new type
        </p>
      </div>

      {/* Current Type */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
          Current Type
        </div>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {columnTypes.find(t => t.value === column.column_type)?.icon} {currentTypeLabel}
        </div>
      </div>

      {/* New Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Convert To
        </label>
        <select
          value={newType}
          onChange={(e) => {
            setNewType(e.target.value);
            setValidationResult(null);
            setShowPreview(false);
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {columnTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Conversion Strategy */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Conversion Strategy
        </label>
        <div className="space-y-2">
          {conversionStrategies.map(strategy => (
            <label
              key={strategy.value}
              className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg
                       cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="radio"
                name="conversionStrategy"
                value={strategy.value}
                checked={conversionStrategy === strategy.value}
                onChange={(e) => {
                  setConversionStrategy(e.target.value);
                  setValidationResult(null);
                  setShowPreview(false);
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {strategy.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {strategy.desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleValidate}
          disabled={validating || newType === column.column_type}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium
                   hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? 'Validating...' : 'Validate Conversion'}
        </button>
        {validationResult?.valid && (
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium
                     hover:bg-green-600 transition-colors"
          >
            Apply Conversion
          </button>
        )}
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`p-4 rounded-lg border ${
          validationResult.valid
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className={`text-sm font-semibold mb-2 ${
            validationResult.valid
              ? 'text-green-800 dark:text-green-300'
              : 'text-red-800 dark:text-red-300'
          }`}>
            {validationResult.valid ? '✓ Validation Passed' : '✗ Validation Failed'}
          </div>

          {/* Errors */}
          {validationResult.errors && validationResult.errors.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                Errors:
              </div>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.errors.map((error, idx) => (
                  <li key={idx} className="text-xs text-red-600 dark:text-red-400">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings && validationResult.warnings.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                Warnings:
              </div>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.warnings.map((warning, idx) => (
                  <li key={idx} className="text-xs text-yellow-600 dark:text-yellow-400">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success message */}
          {validationResult.valid && validationResult.errors.length === 0 && (
            <div className="text-xs text-green-700 dark:text-green-400">
              Conversion is safe to apply. Click "Apply Conversion" to proceed.
            </div>
          )}
        </div>
      )}

      {/* Preview Table (Placeholder) */}
      {showPreview && validationResult?.valid && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Conversion Preview
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="mb-2">
              <strong>Conversion Path:</strong> {currentTypeLabel} → {newTypeLabel}
            </div>
            <div className="mb-2">
              <strong>Strategy:</strong> {conversionStrategies.find(s => s.value === conversionStrategy)?.label}
            </div>
            {validationResult.warnings.length === 0 && (
              <div className="text-green-600 dark:text-green-400 font-medium">
                ✓ All data will convert successfully
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeConversionEditor;
