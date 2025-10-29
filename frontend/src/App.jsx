import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ImportPage from './pages/ImportPage'
import TablePage from './pages/TablePage'
import DesignerHome from './pages/designer/DesignerHome'
import TableSettings from './pages/designer/TableSettings'
import TableBuilder from './pages/designer/TableBuilder'
import Features from './pages/designer/Features'
import Menus from './pages/designer/Menus'
import Pages from './pages/designer/Pages'
import Experiences from './pages/designer/Experiences'
import Maintenance from './pages/designer/Maintenance'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Logout from './pages/Logout'

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected routes */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/import"
        element={
          <ProtectedRoute>
            <AppLayout><ImportPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tables/:id"
        element={
          <ProtectedRoute>
            <AppLayout><TablePage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer"
        element={
          <ProtectedRoute>
            <AppLayout><DesignerHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/tables/new"
        element={
          <ProtectedRoute>
            <AppLayout><TableBuilder /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/tables/:id"
        element={
          <ProtectedRoute>
            <AppLayout><TableSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/features"
        element={
          <ProtectedRoute>
            <AppLayout><Features /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/menus"
        element={
          <ProtectedRoute>
            <AppLayout><Menus /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/pages"
        element={
          <ProtectedRoute>
            <AppLayout><Pages /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/experiences"
        element={
          <ProtectedRoute>
            <AppLayout><Experiences /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/maintenance"
        element={
          <ProtectedRoute>
            <AppLayout><Maintenance /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout><Settings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logout"
        element={<Logout />}
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
