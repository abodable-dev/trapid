import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // TODO: Send to error tracking service (e.g., Sentry)
  // errorTracker.captureException(event.reason);

  // Show user-friendly error message
  // TODO: Replace with proper toast notification system
  console.error('An unexpected error occurred. Please refresh the page or contact support if the problem persists.');

  event.preventDefault();
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);

  // TODO: Send to error tracking service
  // errorTracker.captureException(event.error);

  event.preventDefault();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
