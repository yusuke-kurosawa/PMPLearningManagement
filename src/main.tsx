import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Initialize performance monitoring
  import('./utils/performance-monitor').then(({ performanceMonitor }) => {
    performanceMonitor.startMonitoring()
    console.log('🚀 Performance monitoring system loaded')
  }).catch((error) => {
    console.warn('Performance monitoring system failed to load:', error)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
