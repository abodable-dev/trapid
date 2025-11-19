import React, { useState } from 'react';

/**
 * PreviewChangesModal - Modal for reviewing all pending schema changes before applying
 *
 * Features:
 * - Shows list of all pending changes
 * - Displays impact summary (rows affected, warnings, data loss)
 * - Validation results (errors/warnings from backend)
 * - Blocking modal - user must Apply or Clear to proceed
 * - Cannot close without making a decision
 */
const PreviewChangesModal = ({ changes, validationResults, onApply, onClear, isOpen }) => {
  const [applying, setApplying] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply();
    } finally {
      setApplying(false);
    }
  };

  const hasErrors = validationResults?.some(result => result.errors && result.errors.length > 0);
  const hasWarnings = validationResults?.some(result => result.warnings && result.warnings.length > 0);
  const totalChanges = changes?.length || 0;

  const getChangeTypeIcon = (changeType) => {
    switch (changeType) {
      case 'add_column':
        return '➕';
      case 'remove_column':
        return '🗑️';
      case 'rename_column':
        return '✏️';
      case 'change_type':
        return '🔄';
      case 'change_null':
        return '🔒';
      case 'rename_choice':
        return '🏷️';
      case 'delete_choice':
        return '❌';
      case 'merge_choices':
        return '🔗';
      default:
        return '⚙️';
    }
  };

  const getChangeDescription = (change) => {
    switch (change.type) {
      case 'add_column':
        return `Add column "${change.columnName}" (${change.columnType})`;
      case 'remove_column':
        return `Remove column "${change.columnName}"`;
      case 'rename_column':
        return `Rename column "${change.oldName}" to "${change.newName}"`;
      case 'change_type':
        return `Change "${change.columnName}" from ${change.oldType} to ${change.newType}`;
      case 'change_null':
        return `${change.allowNull ? 'Allow' : 'Disallow'} NULL in "${change.columnName}"`;
      case 'rename_choice':
        return `Rename choice "${change.oldValue}" to "${change.newValue}" in "${change.columnName}"`;
      case 'delete_choice':
        return `Delete choice "${change.value}" from "${change.columnName}"${change.replacement ? ` (replace with "${change.replacement}")` : ' (clear values)'}`;
      case 'merge_choices':
        return `Merge ${change.sourceValues.length} choices into "${change.targetValue}" in "${change.columnName}"`;
      default:
        return JSON.stringify(change);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh]
                    flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r
                      from-blue-500 to-purple-600">
          <h2 className="text-xl font-bold text-white">
            Preview Schema Changes
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            Review all changes before applying them to the database
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200
                        dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Change Summary
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {totalChanges} {totalChanges === 1 ? 'change' : 'changes'}
              </div>
            </div>

            {hasErrors && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-2">
                <span className="font-bold">⚠️</span>
                <span>Some changes have validation errors and cannot be applied</span>
              </div>
            )}

            {hasWarnings && !hasErrors && (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
                <span className="font-bold">⚠️</span>
                <span>Some changes have warnings - review carefully</span>
              </div>
            )}

            {!hasErrors && !hasWarnings && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <span className="font-bold">✓</span>
                <span>All changes validated successfully</span>
              </div>
            )}
          </div>

          {/* Changes List */}
          <div className="space-y-3">
            {!changes || changes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No pending changes to preview
              </div>
            ) : (
              changes.map((change, index) => {
                const validation = validationResults?.[index];
                const hasValidationErrors = validation?.errors && validation.errors.length > 0;
                const hasValidationWarnings = validation?.warnings && validation.warnings.length > 0;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      hasValidationErrors
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                        : hasValidationWarnings
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getChangeTypeIcon(change.type)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {getChangeDescription(change)}
                        </div>

                        {/* Metadata */}
                        {change.affectedRows !== undefined && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Affects {change.affectedRows} {change.affectedRows === 1 ? 'row' : 'rows'}
                          </div>
                        )}

                        {/* Validation Errors */}
                        {hasValidationErrors && (
                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                            <div className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                              Validation Errors:
                            </div>
                            <ul className="list-disc list-inside space-y-1">
                              {validation.errors.map((error, errIdx) => (
                                <li key={errIdx} className="text-xs text-red-700 dark:text-red-400">
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Validation Warnings */}
                        {hasValidationWarnings && (
                          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                            <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                              Warnings:
                            </div>
                            <ul className="list-disc list-inside space-y-1">
                              {validation.warnings.map((warning, warnIdx) => (
                                <li key={warnIdx} className="text-xs text-yellow-700 dark:text-yellow-400">
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {hasValidationErrors ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                         bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                            ✗ Error
                          </span>
                        ) : hasValidationWarnings ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                         bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                            ⚠ Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                         bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                            ✓ Valid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Important Notice */}
          {!hasErrors && totalChanges > 0 && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200
                          dark:border-orange-800 rounded-lg">
              <div className="flex gap-3">
                <div className="text-orange-500 text-xl flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <div className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">
                    Important Notice
                  </div>
                  <ul className="text-xs text-orange-700 dark:text-orange-400 space-y-1 list-disc list-inside">
                    <li>These changes will modify your database schema</li>
                    <li>Some operations may result in data loss or transformation</li>
                    <li>It is recommended to backup your data before applying major changes</li>
                    <li>Once applied, some changes cannot be automatically reverted</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClear}
              disabled={applying}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                       rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All Changes
            </button>
            <button
              onClick={handleApply}
              disabled={applying || hasErrors || totalChanges === 0}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r
                       from-blue-500 to-purple-600 rounded-lg hover:from-blue-600
                       hover:to-purple-700 transition-all shadow-lg hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400
                       disabled:to-gray-500 disabled:shadow-none"
            >
              {applying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Applying Changes...
                </span>
              ) : (
                `Apply ${totalChanges} ${totalChanges === 1 ? 'Change' : 'Changes'}`
              )}
            </button>
          </div>

          {hasErrors && (
            <div className="mt-3 text-xs text-red-600 dark:text-red-400 text-center">
              Cannot apply changes - please fix validation errors first
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewChangesModal;
