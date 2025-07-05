import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PMBOKMatrix from './PMBOKMatrix';
import ITTOForceGraph from './ITTOForceGraph';
import { Maximize2, Minimize2, RotateCcw, Grip } from 'lucide-react';
import { throttle } from '../utils/performance';

const IntegratedView = React.memo(() => {
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreenView, setFullscreenView] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    throttle((e) => {
      if (isDragging) {
        const container = e.currentTarget.closest('.split-container');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newRatio = (x / rect.width) * 100;
        setSplitRatio(Math.max(20, Math.min(80, newRatio)));
      }
    }, 16),
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetSplit = useCallback(() => {
    setSplitRatio(50);
    setFullscreenView(null);
  }, []);

  const toggleFullscreen = useCallback((view) => {
    setFullscreenView(prev => prev === view ? null : view);
  }, []);

  // Handle mobile view switching
  const setMobileView = useCallback((view) => {
    setFullscreenView(view === 'matrix' ? null : 'network');
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Set initial view for mobile
  useEffect(() => {
    if (isMobile && fullscreenView === null) {
      setFullscreenView(null); // Show matrix view by default on mobile
    }
  }, [isMobile, fullscreenView]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-2 sm:px-4 py-2 flex justify-between items-center">
        <h2 className="text-sm sm:text-lg font-semibold">Integrated View</h2>
        <div className="flex gap-2">
          {!isMobile && (
            <button
              onClick={resetSplit}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reset Layout</span>
            </button>
          )}
        </div>
      </div>

      {/* Split View Container */}
      <div 
        className="flex-1 flex relative split-container"
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'col-resize' : 'default' }}
      >
        {/* Left Panel - Matrix View */}
        <div 
          className={`${fullscreenView === 'network' ? 'hidden' : ''} relative overflow-auto bg-gray-50 custom-scrollbar`}
          style={{ 
            width: isMobile ? '100%' : (fullscreenView === 'matrix' ? '100%' : `${splitRatio}%`),
            display: fullscreenView === 'network' ? 'none' : 'block'
          }}
        >
          {!isMobile && (
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => toggleFullscreen('matrix')}
                className="p-1.5 sm:p-2 bg-white rounded shadow hover:bg-gray-100 transition-colors"
                title={fullscreenView === 'matrix' ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {fullscreenView === 'matrix' ? 
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                }
              </button>
            </div>
          )}
          <React.Suspense fallback={<div className="flex items-center justify-center h-full">読み込み中...</div>}>
            <PMBOKMatrix />
          </React.Suspense>
        </div>

        {/* Divider */}
        {!fullscreenView && !isMobile && (
          <div
            className="w-1 sm:w-2 bg-gray-300 hover:bg-blue-500 cursor-col-resize relative transition-colors group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center">
              <Grip className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        )}

        {/* Right Panel - Network View */}
        <div 
          className={`${fullscreenView === 'matrix' || (isMobile && fullscreenView !== 'network') ? 'hidden' : ''} relative flex-1 overflow-hidden`}
          style={{ 
            display: fullscreenView === 'matrix' || (isMobile && fullscreenView !== 'network') ? 'none' : 'block'
          }}
        >
          {!isMobile && (
            <div className="absolute top-2 left-2 z-10">
              <button
                onClick={() => toggleFullscreen('network')}
                className="p-1.5 sm:p-2 bg-white rounded shadow hover:bg-gray-100 transition-colors"
                title={fullscreenView === 'network' ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {fullscreenView === 'network' ? 
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                }
              </button>
            </div>
          )}
          <React.Suspense fallback={<div className="flex items-center justify-center h-full">読み込み中...</div>}>
            <ITTOForceGraph />
          </React.Suspense>
        </div>
      </div>

      {/* Status Bar */}
      {!isMobile && (
        <div className="bg-gray-100 border-t px-2 sm:px-4 py-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Split: {Math.round(splitRatio)}% / {Math.round(100 - splitRatio)}%</span>
            <span className="hidden sm:inline">Drag the divider to adjust the view sizes</span>
          </div>
        </div>
      )}
      
      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="bg-white border-t p-2 flex gap-2">
          <button
            onClick={() => setMobileView('matrix')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              fullscreenView !== 'network' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Matrix View
          </button>
          <button
            onClick={() => setMobileView('network')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              fullscreenView === 'network' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Network View
          </button>
        </div>
      )}
    </div>
  );
});

IntegratedView.displayName = 'IntegratedView';

export default IntegratedView;