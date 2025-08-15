import React, { useState, useCallback, _useMemo, useEffect } from 'react'
import PMBOKMatrix from '../pages/PMBOKMatrix'
import ITTOForceGraph from './ITTOForceGraph'
import { Maximize2, Minimize2, RotateCcw, Grip } from 'lucide-react'
import { throttle } from '../../utils/performance'

const IntegratedView = React.memo(() => {
  const [splitRatio, setSplitRatio] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [fullscreenView, setFullscreenView] = useState(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    throttle((e) => {
      if (isDragging) {
        const container = e.currentTarget.closest('.split-container')
        if (!container) return
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left
        const newRatio = (x / rect.width) * 100
        setSplitRatio(Math.max(20, Math.min(80, newRatio)))
      }
    }, 16),
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetSplit = useCallback(() => {
    setSplitRatio(50)
    setFullscreenView(null)
  }, [])

  const toggleFullscreen = useCallback((view) => {
    setFullscreenView((prev) => (prev === view ? null : view))
  }, [])

  // Handle mobile view switching
  const setMobileView = useCallback((view) => {
    setFullscreenView(view === 'matrix' ? null : 'network')
  }, [])

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e)
      const handleGlobalMouseUp = () => handleMouseUp()

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Set initial view for mobile
  useEffect(() => {
    if (isMobile && fullscreenView === null) {
      setFullscreenView(null) // Show matrix view by default on mobile
    }
  }, [isMobile, fullscreenView])

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-2 py-2 sm:px-4">
        <h2 className="text-sm font-semibold sm:text-lg">Integrated View</h2>
        <div className="flex gap-2">
          {!isMobile && (
            <button
              onClick={resetSplit}
              className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs transition-colors hover:bg-gray-200 sm:px-3 sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reset Layout</span>
            </button>
          )}
        </div>
      </div>

      {/* Split View Container */}
      <div
        className="split-container relative flex flex-1"
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'col-resize' : 'default' }}
      >
        {/* Left Panel - Matrix View */}
        <div
          className={`${fullscreenView === 'network' ? 'hidden' : ''} custom-scrollbar relative overflow-auto bg-gray-50`}
          style={{
            width: isMobile ? '100%' : fullscreenView === 'matrix' ? '100%' : `${splitRatio}%`,
            display: fullscreenView === 'network' ? 'none' : 'block',
          }}
        >
          {!isMobile && (
            <div className="absolute right-2 top-2 z-10">
              <button
                onClick={() => toggleFullscreen('matrix')}
                className="rounded bg-white p-1.5 shadow transition-colors hover:bg-gray-100 sm:p-2"
                title={fullscreenView === 'matrix' ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {fullscreenView === 'matrix' ? (
                  <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          )}
          <React.Suspense
            fallback={<div className="flex h-full items-center justify-center">読み込み中...</div>}
          >
            <PMBOKMatrix />
          </React.Suspense>
        </div>

        {/* Divider */}
        {!fullscreenView && !isMobile && (
          <div
            className="group relative w-1 cursor-col-resize bg-gray-300 transition-colors hover:bg-blue-500 sm:w-2"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute left-1/2 top-1/2 flex h-16 w-8 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center">
              <Grip className="h-4 w-4 text-gray-500 transition-colors group-hover:text-white" />
            </div>
          </div>
        )}

        {/* Right Panel - Network View */}
        <div
          className={`${fullscreenView === 'matrix' || (isMobile && fullscreenView !== 'network') ? 'hidden' : ''} relative flex-1 overflow-hidden`}
          style={{
            display:
              fullscreenView === 'matrix' || (isMobile && fullscreenView !== 'network')
                ? 'none'
                : 'block',
          }}
        >
          {!isMobile && (
            <div className="absolute left-2 top-2 z-10">
              <button
                onClick={() => toggleFullscreen('network')}
                className="rounded bg-white p-1.5 shadow transition-colors hover:bg-gray-100 sm:p-2"
                title={fullscreenView === 'network' ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {fullscreenView === 'network' ? (
                  <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          )}
          <React.Suspense
            fallback={<div className="flex h-full items-center justify-center">読み込み中...</div>}
          >
            <ITTOForceGraph />
          </React.Suspense>
        </div>
      </div>

      {/* Status Bar */}
      {!isMobile && (
        <div className="border-t bg-gray-100 px-2 py-1 text-xs text-gray-600 sm:px-4">
          <div className="flex justify-between">
            <span>
              Split: {Math.round(splitRatio)}% / {Math.round(100 - splitRatio)}%
            </span>
            <span className="hidden sm:inline">Drag the divider to adjust the view sizes</span>
          </div>
        </div>
      )}

      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="flex gap-2 border-t bg-white p-2">
          <button
            onClick={() => setMobileView('matrix')}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
              fullscreenView !== 'network' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Matrix View
          </button>
          <button
            onClick={() => setMobileView('network')}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
              fullscreenView === 'network' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Network View
          </button>
        </div>
      )}
    </div>
  )
})

IntegratedView.displayName = 'IntegratedView'

export default IntegratedView
