import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// パフォーマンスモニタリング
if (process.env.NODE_ENV === 'production') {
  import('./utils/performance-monitor').then(({ performanceMonitor }) => {
    performanceMonitor.startMonitoring()
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
