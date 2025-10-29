import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ImportPage from './pages/ImportPage'
import TablePage from './pages/TablePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page - no header/layout */}
        <Route path="/" element={<Login />} />

        {/* App pages with header/layout */}
        <Route path="/dashboard" element={
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                      Trapid
                    </Link>
                    <nav className="ml-10 flex gap-6">
                      <Link
                        to="/dashboard"
                        className="text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Tables
                      </Link>
                      <Link
                        to="/import"
                        className="text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Import Data
                      </Link>
                    </nav>
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Dashboard />
            </main>
          </div>
        } />

        <Route path="/import" element={
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                      Trapid
                    </Link>
                    <nav className="ml-10 flex gap-6">
                      <Link
                        to="/dashboard"
                        className="text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Tables
                      </Link>
                      <Link
                        to="/import"
                        className="text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Import Data
                      </Link>
                    </nav>
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ImportPage />
            </main>
          </div>
        } />

        <Route path="/tables/:id" element={
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                      Trapid
                    </Link>
                    <nav className="ml-10 flex gap-6">
                      <Link
                        to="/dashboard"
                        className="text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Tables
                      </Link>
                      <Link
                        to="/import"
                        className="text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Import Data
                      </Link>
                    </nav>
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <TablePage />
            </main>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
