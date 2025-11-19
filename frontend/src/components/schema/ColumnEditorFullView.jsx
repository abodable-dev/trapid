import React, { useState, useEffect } from 'react';
import api from '../../api';
import ChoiceEditor from './ChoiceEditor';
import FormulaEditor from './FormulaEditor';
import TypeConversionEditor from './TypeConversionEditor';
import PreviewChangesModal from './PreviewChangesModal';

/**
 * ColumnEditorFullView - Full-screen meta-table editor for managing all columns
 *
 * Layout: Table where each row represents a column definition
 * Columns in the meta-table:
 * 1. Column Name
 * 2. Current Type
 * 3. Working Sheet (dynamic based on column type/action)
 *
 * Features:
 * - View all table columns in one interface
 * - Edit multiple columns before applying
 * - Preview changes before applying
 * - Add new columns
 * - Delete columns (with warnings)
 * - Rename columns
 */
const ColumnEditorFullView = ({ tableId, tableName, onClose }) => {
  const [table, setTable] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedColumn, setExpandedColumn] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [validationResults, setValidationResults] = useState([]);

  useEffect(() => {
    loadTableData();
  }, [tableId]);

  const loadTableData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/tables/${tableId}`);

      if (response.data.success) {
        setTable(response.data.table);
        setColumns(response.data.table.columns || []);
      }
    } catch (error) {
      console.error('Error loading table:', error);
      alert('Failed to load table: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (columnId) => {
    setExpandedColumn(expandedColumn === columnId ? null : columnId);
  };

  const handleAddChange = (change) => {
    setPendingChanges([...pendingChanges, change]);
  };

  const handleClearChanges = () => {
    setPendingChanges([]);
    setValidationResults([]);
    setShowPreviewModal(false);
  };

  const handlePreviewChanges = async () => {
    if (pending Changes.length === 0) {
      alert('No changes to preview');
      return;
    }

    // Validate all changes
    try {
      const results = await Promise.all(
        pendingChanges.map(change => validateChange(change))
      );
      setValidationResults(results);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error validating changes:', error);
      alert('Validation failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const validateChange = async (change) => {
    // This would call the backend validation endpoint
    // For now, return a placeholder
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  };

  const handleApplyChanges = async () => {
    // Apply all pending changes
    try {
      for (const change of pendingChanges) {
        await applyChange(change);
      }

      alert('All changes applied successfully!');
      handleClearChanges();
      await loadTableData();
    } catch (error) {
      console.error('Error applying changes:', error);
      alert('Failed to apply changes: ' + (error.response?.data?.error || error.message));
    }
  };

  const applyChange = async (change) => {
    // Apply individual change via API
    // Implementation depends on change type
    console.log('Applying change:', change);
  };

  const getColumnTypeLabel = (type) => {
    const typeLabels = {
      'string': 'Text',
      'text': 'Text Area',
      'integer': 'Number',
      'float': 'Decimal',
      'boolean': 'Yes/No',
      'date': 'Date',
      'datetime': 'Date & Time',
      'choice': 'Choice',
      'computed': 'Computed'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Loading table columns...
          </div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Edit Columns: {tableName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {columns.length} {columns.length === 1 ? 'column' : 'columns'}
                {pendingChanges.length > 0 && (
                  <span className="ml-3 text-orange-600 dark:text-orange-400 font-medium">
                    • {pendingChanges.length} pending {pendingChanges.length === 1 ? 'change' : 'changes'}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {pendingChanges.length > 0 && (
                <>
                  <button
                    onClick={handleClearChanges}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                             bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                             rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear Changes
                  </button>
                  <button
                    onClick={handlePreviewChanges}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-500
                             rounded-lg hover:bg-purple-600 transition-colors shadow-lg"
                  >
                    Preview {pendingChanges.length} {pendingChanges.length === 1 ? 'Change' : 'Changes'}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
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

      {/* Column List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {columns.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2
                            border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No columns in this table
                </p>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                           transition-colors font-medium"
                >
                  Add First Column
                </button>
              </div>
            ) : (
              columns.map((column) => {
                const isExpanded = expandedColumn === column.id;
                const isChoiceColumn = ['choice', 'dropdown', 'select'].includes(column.column_type?.toLowerCase());
                const isComputedColumn = column.column_type === 'computed' || column.formula;

                return (
                  <div
                    key={column.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200
                             dark:border-gray-700 overflow-hidden transition-all"
                  >
                    {/* Column Header Row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50
                               dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleToggleExpand(column.id)}
                    >
                      {/* Expand/Collapse Icon */}
                      <div className="flex-shrink-0">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? 'transform rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* Column Name */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {column.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {column.column_name}
                        </div>
                      </div>

                      {/* Current Type */}
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs
                                       font-medium bg-blue-100 dark:bg-blue-900 text-blue-800
                                       dark:text-blue-200">
                          {getColumnTypeLabel(column.column_type)}
                        </span>
                      </div>

                      {/* Required Badge */}
                      {column.required && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs
                                         font-medium bg-red-100 dark:bg-red-900 text-red-800
                                         dark:text-red-200">
                            Required
                          </span>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex-shrink-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {isChoiceColumn && (
                          <button
                            className="px-3 py-1 text-xs text-purple-600 dark:text-purple-400
                                     hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                            title="Manage choices"
                          >
                            📋 Choices
                          </button>
                        )}
                        {isComputedColumn && (
                          <button
                            className="px-3 py-1 text-xs text-green-600 dark:text-green-400
                                     hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="Edit formula"
                          >
                            🔢 Formula
                          </button>
                        )}
                        <button
                          className="px-3 py-1 text-xs text-blue-600 dark:text-blue-400
                                   hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Change type"
                        >
                          🔄 Type
                        </button>
                      </div>
                    </div>

                    {/* Expanded Working Sheet */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50
                                    dark:bg-gray-900/50 p-6">
                        <div className="flex gap-4 mb-4">
                          <button
                            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400
                                     bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100
                                     dark:hover:bg-blue-900/50 transition-colors"
                          >
                            Change Type
                          </button>
                          {isChoiceColumn && (
                            <button
                              className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400
                                       bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100
                                       dark:hover:bg-purple-900/50 transition-colors"
                            >
                              Manage Choices
                            </button>
                          )}
                          {isComputedColumn && (
                            <button
                              className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400
                                       bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100
                                       dark:hover:bg-green-900/50 transition-colors"
                            >
                              Edit Formula
                            </button>
                          )}
                        </div>

                        {/* Working Sheet Area - Shows appropriate editor */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <TypeConversionEditor
                            tableId={tableId}
                            column={column}
                            onUpdate={loadTableData}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Preview Changes Modal */}
      <PreviewChangesModal
        isOpen={showPreviewModal}
        changes={pendingChanges}
        validationResults={validationResults}
        onApply={handleApplyChanges}
        onClear={handleClearChanges}
      />
    </div>
  );
};

export default ColumnEditorFullView;
