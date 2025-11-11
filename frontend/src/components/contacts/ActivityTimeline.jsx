import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  DocumentTextIcon,
  UserPlusIcon,
  ArrowPathIcon,
  PencilIcon,
  CubeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { api } from '../../api';

const ActivityTimeline = ({ contactId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [contactId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contacts/${contactId}/activities`);
      if (response.success) {
        setActivities(response.activities);
      } else {
        setError('Failed to load activities');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'created':
        return <UserPlusIcon className="w-4 h-4" />;
      case 'updated':
        return <PencilIcon className="w-4 h-4" />;
      case 'synced_from_xero':
        return <ArrowPathIcon className="w-4 h-4" />;
      case 'synced_to_xero':
        return <ArrowPathIcon className="w-4 h-4" />;
      case 'purchase_order_created':
        return <CubeIcon className="w-4 h-4" />;
      case 'supplier_linked':
        return <LinkIcon className="w-4 h-4" />;
      case 'contact_merged':
        return <DocumentTextIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'synced_from_xero':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'synced_to_xero':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'purchase_order_created':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'supplier_linked':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'contact_merged':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderChanges = (metadata) => {
    if (!metadata || !metadata.changes) return null;

    const changes = metadata.changes;
    const changeKeys = Object.keys(changes);

    if (changeKeys.length === 0) return null;

    return (
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Changes:</div>
        <ul className="list-disc list-inside space-y-1">
          {changeKeys.map((key) => {
            const change = changes[key];
            const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return (
              <li key={key}>
                <span className="font-medium">{fieldName}:</span>{' '}
                <span className="line-through text-gray-500">{change.from || 'empty'}</span>
                {' → '}
                <span className="text-green-600 dark:text-green-400">{change.to || 'empty'}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchActivities}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No activity history yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Activity will appear here when the contact is synced from Xero or updated
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activity History</h3>
        <button
          onClick={fetchActivities}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          title="Refresh"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

        {/* Activity items */}
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4">
              {/* Icon */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getActivityColor(activity.activity_type)}`}>
                {getActivityIcon(activity.activity_type)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(activity.occurred_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityColor(activity.activity_type)}`}>
                      {activity.activity_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Render changes if available */}
                  {renderChanges(activity.metadata)}

                  {/* Render Xero metadata if available */}
                  {activity.metadata && activity.metadata.xero_name && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Xero Contact:</span> {activity.metadata.xero_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
