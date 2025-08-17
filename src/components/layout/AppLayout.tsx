import React, { useState, useEffect } from 'react'
import Navigation from './Navigation'
import Sidebar from './Sidebar'
import Footer from './Footer'
import CommandPalette from '../shared/CommandPalette'
import QuickShortcuts from '../shared/QuickShortcuts'
import SettingsTrigger from '../shared/SettingsTrigger'
import SkipLinks from '../shared/SkipLinks'

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Check if we should show sidebar based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setShowSidebar(window.innerWidth >= 1024) // lg breakpoint
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setSidebarCollapsed(event.detail.collapsed)
    }

    window.addEventListener('sidebarToggle', handleSidebarToggle)
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle)
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 transition-colors dark:bg-gray-900'>
      {/* Skip Links for Accessibility */}
      <SkipLinks />

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Navigation Header */}
      <Navigation />

      <div className='flex'>
        {/* Sidebar - Only show on desktop */}
        {showSidebar && <Sidebar />}

        {/* Main Content Area */}
        <main
          id='main-content'
          className={`
            flex-1 transition-all duration-300
            ${showSidebar ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : 'ml-0'}
          `}
          role='main'
        >
          <div className='min-h-[calc(100vh-4rem)]'>
            {/* Quick Shortcuts - Show on home page or as floating widget */}
            <div className='p-4'>
              <QuickShortcuts className='mb-6' />
            </div>

            {children}
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>

      {/* Floating Settings Trigger */}
      <SettingsTrigger variant='floating' />
    </div>
  )
}

export default AppLayout
