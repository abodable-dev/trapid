import React, { useState, useEffect } from 'react';
import api from '../../api';

/**
 * FormulaEditor - Component for creating and editing Excel-like formulas for computed columns
 *
 * Features:
 * - Formula input with Excel-like syntax (=price * quantity)
 * - Insert field references from dropdown
 * - Formula syntax help and examples
 * - Live preview with sample data
 * - Supported functions: SUM, AVG, IF, CONCAT, ROUND, etc.
 */
const FormulaEditor = ({ tableId, table, formula, onChange }) => {
  const [formulaValue, setFormulaValue] = useState(formula || '=');
  const [previewResult, setPreviewResult] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setFormulaValue(formula || '=');
  }, [formula]);

  useEffect(() => {
    // Get available columns from table
    if (table?.columns) {
      setAvailableColumns(table.columns);
    }
  }, [table]);

  const handleFormulaChange = (value) => {
    // Ensure formula starts with =
    if (!value.startsWith('=')) {
      value = '=' + value;
    }
    setFormulaValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleInsertField = (columnName) => {
    // Insert field at cursor position or at end
    const input = document.getElementById('formula-input');
    const cursorPos = input.selectionStart;
    const before = formulaValue.slice(0, cursorPos);
    const after = formulaValue.slice(cursorPos);

    const newFormula = before + `[${columnName}]` + after;
    setFormulaValue(newFormula);

    if (onChange) {
      onChange(newFormula);
    }

    // Focus back on input
    setTimeout(() => {
      input.focus();
      const newPos = cursorPos + columnName.length + 2;
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleInsertFunction = (functionName) => {
    const input = document.getElementById('formula-input');
    const cursorPos = input.selectionStart;
    const before = formulaValue.slice(0, cursorPos);
    const after = formulaValue.slice(cursorPos);

    const newFormula = before + `${functionName}()` + after;
    setFormulaValue(newFormula);

    if (onChange) {
      onChange(newFormula);
    }

    // Focus and position cursor inside parentheses
    setTimeout(() => {
      input.focus();
      const newPos = cursorPos + functionName.length + 1;
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleTestFormula = async () => {
    if (!formulaValue || formulaValue === '=') {
      setPreviewError('Formula is empty');
      return;
    }

    try {
      setTesting(true);
      setPreviewError(null);

      const response = await api.post(`/api/v1/tables/${tableId}/columns/test_formula`, {
        formula: formulaValue
      });

      if (response.data.success) {
        setPreviewResult(response.data);
        setPreviewError(null);
      } else {
        setPreviewError(response.data.error || 'Formula test failed');
        setPreviewResult(null);
      }
    } catch (error) {
      console.error('Error testing formula:', error);
      setPreviewError(error.response?.data?.error || error.message);
      setPreviewResult(null);
    } finally {
      setTesting(false);
    }
  };

  const excelFunctions = [
    { name: 'SUM', desc: 'Sum values', example: 'SUM(price, tax)' },
    { name: 'AVG', desc: 'Average values', example: 'AVG(score1, score2)' },
    { name: 'IF', desc: 'Conditional', example: 'IF(price > 100, "High", "Low")' },
    { name: 'CONCAT', desc: 'Join text', example: 'CONCAT(first_name, " ", last_name)' },
    { name: 'ROUND', desc: 'Round number', example: 'ROUND(price, 2)' },
    { name: 'ABS', desc: 'Absolute value', example: 'ABS(balance)' },
    { name: 'UPPER', desc: 'Uppercase text', example: 'UPPER(name)' },
    { name: 'LOWER', desc: 'Lowercase text', example: 'LOWER(email)' },
    { name: 'LEN', desc: 'Text length', example: 'LEN(description)' }
  ];

  return (
    <div className="formula-editor p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Formula Editor
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Create Excel-like formulas using column names and functions
        </p>
      </div>

      {/* Formula Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Formula
        </label>
        <div className="relative">
          <textarea
            id="formula-input"
            value={formulaValue}
            onChange={(e) => handleFormulaChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="=price * quantity"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleTestFormula}
            disabled={testing}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600
                     transition-colors font-medium disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Formula'}
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600
                     transition-colors font-medium"
          >
            {showHelp ? 'Hide' : 'Show'} Help
          </button>
        </div>
      </div>

      {/* Insert Column */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Insert Column Reference
        </label>
        <div className="flex flex-wrap gap-2">
          {availableColumns.length === 0 ? (
            <p className="text-xs text-gray-500">No columns available</p>
          ) : (
            availableColumns.map((col) => (
              <button
                key={col.id}
                onClick={() => handleInsertField(col.column_name)}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200
                         rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                title={`Insert [${col.column_name}]`}
              >
                {col.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Insert Function */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Insert Function
        </label>
        <div className="flex flex-wrap gap-2">
          {excelFunctions.map((func) => (
            <button
              key={func.name}
              onClick={() => handleInsertFunction(func.name)}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200
                       rounded text-xs hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              title={func.desc}
            >
              {func.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Result */}
      {previewResult && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200
                      dark:border-green-800 rounded-lg">
          <div className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
            Preview Result
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Tested with record ID: {previewResult.tested_with_record_id}
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-green-200
                          dark:border-green-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Result:</div>
              <div className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                {JSON.stringify(previewResult.result)}
              </div>
            </div>
            {previewResult.sample_data && Object.keys(previewResult.sample_data).length > 0 && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sample data:</div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded border border-green-200
                              dark:border-green-700 text-xs font-mono">
                  {JSON.stringify(previewResult.sample_data, null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {previewError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200
                      dark:border-red-800 rounded-lg">
          <div className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
            Formula Error
          </div>
          <div className="text-sm text-red-700 dark:text-red-400">
            {previewError}
          </div>
        </div>
      )}

      {/* Help Section */}
      {showHelp && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200
                      dark:border-blue-800 rounded-lg">
          <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
            Formula Help
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Basic Syntax
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Formulas must start with <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">=</code></li>
                <li>Reference columns with <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">[column_name]</code></li>
                <li>Use operators: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">+ - * /</code></li>
                <li>Strings use double quotes: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">"text"</code></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Examples
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                  <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
                    =[price] * [quantity]
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Multiply two columns
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                  <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
                    =IF([status] = "active", "Yes", "No")
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Conditional logic
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                  <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
                    =CONCAT([first_name], " ", [last_name])
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Combine text fields
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                  <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
                    =ROUND([price] * 1.1, 2)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Price with 10% markup, rounded to 2 decimals
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Available Functions
              </div>
              <div className="grid grid-cols-2 gap-2">
                {excelFunctions.map((func) => (
                  <div key={func.name} className="p-2 bg-white dark:bg-gray-800 rounded">
                    <div className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {func.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {func.desc}
                    </div>
                    <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      {func.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaEditor;
