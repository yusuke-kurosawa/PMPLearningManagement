import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize PWA optimization systems
import './lib/pwa/serviceWorkerManager.js'
import './lib/pwa/coreWebVitals.js'

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Initialize performance monitoring
  import('./lib/pwa/coreWebVitals.js')
    .then(() => {
      console.log('🚀 PWA optimization systems loaded')
    })
    .catch((error) => {
      console.warn('PWA optimization system failed to load:', error)
    })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
