import React, { useState } from 'react';
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
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300
                               dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100">
                    {column.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Database Column
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300
                               dark:border-gray-600 text-sm font-mono text-gray-900 dark:text-gray-100">
                    {column.column_name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300
                               dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100">
                    {column.column_type}
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use the tabs above to rename, change column type, manage choices, or edit formulas.
                </p>
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
