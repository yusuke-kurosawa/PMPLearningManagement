import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { logger } from './services/logger'

import './index.css'

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Initialize performance monitoring
  import('./utils/performance-monitor')
    .then(({ performanceMonitor }) => {
      performanceMonitor.startMonitoring()
      logger.info('🚀 Performance monitoring system loaded')
    })
    .catch((error) => {
      logger.warn('Performance monitoring system failed to load:', error)
    })
}

// Get root element with null check
const rootElement = document.getElementById('root')

if (!rootElement) {
  logger.error('Fatal: Root element not found. Cannot initialize application.')
  // Display a fallback error message
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">アプリケーション初期化エラー</h1>
      <p style="font-size: 1.1rem; margin-bottom: 2rem; max-width: 600px;">
        アプリケーションの起動に失敗しました。ブラウザをリフレッシュしてください。
      </p>
      <button
        onclick="location.reload()"
        style="
          padding: 12px 24px;
          font-size: 1rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        "
      >
        ページをリロード
      </button>
    </div>
  `
  throw new Error('Root element (#root) not found in the document')
}

try {
  // Create React root and render app
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )

  logger.info('✅ Application successfully mounted')
} catch (error) {
  logger.error('Failed to render application:', error)

  // Display error UI
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">レンダリングエラー</h1>
      <p style="font-size: 1.1rem; margin-bottom: 2rem; max-width: 600px;">
        アプリケーションのレンダリング中にエラーが発生しました。
      </p>
      <button
        onclick="location.reload()"
        style="
          padding: 12px 24px;
          font-size: 1rem;
          background: white;
          color: #f5576c;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        "
      >
        ページをリロード
      </button>
      ${
        process.env.NODE_ENV === 'development'
          ? `
        <details style="margin-top: 2rem; text-align: left; max-width: 600px; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">エラー詳細</summary>
          <pre style="margin-top: 1rem; font-size: 0.9rem; overflow: auto;">${error instanceof Error ? error.stack : String(error)}</pre>
        </details>
      `
          : ''
      }
    </div>
  `

  throw error
}
