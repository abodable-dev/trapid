import { Navigate } from 'react-router-dom'
import { usePermission } from '../hooks/usePermission'
import { useAuth } from '../contexts/AuthContext'

/**
 * Component to protect routes based on permissions
 *
 * Usage:
 *   <Route path="/permissions" element={
 *     <ProtectedRoute permission="manage_permissions">
 *       <AppLayout><PermissionsPage /></AppLayout>
 *     </ProtectedRoute>
 *   } />
 *
 * Multiple permissions (user must have ALL):
 *   <ProtectedRoute permissions={['edit_projects', 'view_gantt']}>
 *     <SomeComponent />
 *   </ProtectedRoute>
 *
 * Multiple permissions (user must have ANY):
 *   <ProtectedRoute permissionsAny={['edit_projects', 'manage_permissions']}>
 *     <SomeComponent />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  permission,
  permissions,
  permissionsAny,
  fallback = null,
  redirectTo = '/dashboard'
}) {
  const { can, canAll, canAny } = usePermission()
  const { user, loading } = useAuth()

  // Wait for auth to load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check permissions
  let hasPermission = true

  if (permission) {
    hasPermission = can(permission)
  } else if (permissions && permissions.length > 0) {
    hasPermission = canAll(...permissions)
  } else if (permissionsAny && permissionsAny.length > 0) {
    hasPermission = canAny(...permissionsAny)
  }

  // No permission - show fallback or redirect
  if (!hasPermission) {
    if (fallback) {
      return fallback
    }

    return <Navigate to={redirectTo} replace />
  }

  return children
}
