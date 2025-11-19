import React, { useState, useEffect } from 'react';
import { api } from '../api';

/**
 * TableProtectionManagement - Settings page for managing which tables are protected from schema editing
 *
 * Features:
 * - List all database tables
 * - Show protection status for each
 * - Toggle protection on/off
 * - Show table metadata (record count, last modified)
 * - Only accessible to users with can_edit_table_schema permission
 */
const TableProtectionManagement = () => {
  const [protections, setProtections] = useState([]);
  const [allTables, setAllTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    loadProtections();
  }, []);

  const loadProtections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/table_protections');

      if (response.data.success) {
        setProtections(response.data.protections);
        setAllTables(response.data.all_tables);
      }
    } catch (error) {
      console.error('Error loading protections:', error);
      alert('Failed to load table protections: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProtection = async (tableName, currentlyProtected) => {
    try {
      setSaving(tableName);

      const endpoint = currentlyProtected
        ? '/api/v1/table_protections/unprotect_table'
        : '/api/v1/table_protections/protect_table';

      const response = await api.post(endpoint, {
        table_name: tableName,
        description: `${currentlyProtected ? 'Un' : ''}protected via UI`
      });

      if (response.data.success) {
        await loadProtections();
      }
    } catch (error) {
      console.error('Error toggling protection:', error);
      alert('Failed to update protection: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(null);
    }
  };

  const getProtectionForTable = (tableName) => {
    return protections.find(p => p.table_name === tableName);
  };

  const isProtected = (tableName) => {
    const protection = getProtectionForTable(tableName);
    return protection?.is_protected || false;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Loading table protections...
        </div>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full
                      animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Table Protection Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Protect critical tables from schema modifications. Protected tables cannot have columns added,
            removed, or modified.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
                        rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              Total Tables
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {allTables.length}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                        rounded-lg p-4">
            <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              Protected Tables
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {protections.filter(p => p.is_protected).length}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800
                        rounded-lg p-4">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
              Editable Tables
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {allTables.length - protections.filter(p => p.is_protected).length}
            </div>
          </div>
        </div>

        {/* Tables List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                      overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300
                               uppercase tracking-wider">
                    Table Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300
                               uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300
                               uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300
                               uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300
                               uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {allTables.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No tables found
                    </td>
                  </tr>
                ) : (
                  allTables.map((tableName) => {
                    const protection = getProtectionForTable(tableName);
                    const protected_status = isProtected(tableName);
                    const isSaving = saving === tableName;

                    return (
                      <tr key={tableName} className="hover:bg-gray-50 dark:hover:bg-gray-700/50
                                                    transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                              {tableName}
                            </div>
                            {!protection?.table_exists && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs
                                             font-medium bg-red-100 dark:bg-red-900/40 text-red-800
                                             dark:text-red-300">
                                Missing
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {protected_status ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs
                                           font-medium bg-red-100 dark:bg-red-900/40 text-red-800
                                           dark:text-red-300">
                              🔒 Protected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs
                                           font-medium bg-green-100 dark:bg-green-900/40 text-green-800
                                           dark:text-green-300">
                              ✓ Editable
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {protection?.record_count !== null && protection?.record_count !== undefined
                            ? protection.record_count.toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {protection?.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleProtection(tableName, protected_status)}
                            disabled={isSaving}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed ${
                              protected_status
                                ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
                            }`}
                          >
                            {isSaving ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                              </span>
                            ) : protected_status ? (
                              '🔓 Unprotect'
                            ) : (
                              '🔒 Protect'
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
                      rounded-lg">
          <div className="flex gap-3">
            <div className="text-blue-500 text-xl flex-shrink-0">
              ℹ️
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                About Table Protection
              </div>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Protected tables cannot have their schema modified through the column editor</li>
                <li>This prevents accidental changes to critical system tables</li>
                <li>Data can still be added, edited, and deleted - only schema changes are blocked</li>
                <li>Changes to protection status take effect immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableProtectionManagement;
