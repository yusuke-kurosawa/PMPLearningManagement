/**
 * Keyboard Shortcuts Component
 * Displays available keyboard shortcuts and handles help modal
 */

import React, { useState, useEffect } from 'react'
import {
  Keyboard,
  X,
  Command,
  RefreshCw,
  Download,
  Filter,
  Maximize2,
  Search,
  Settings,
  Eye,
  Zap,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface KeyboardShortcut {
  key: string
  description: string
  icon: React.ComponentType<any>
  category: 'navigation' | 'actions' | 'views' | 'filters'
  modifier?: 'ctrl' | 'alt' | 'shift'
  combination?: string[]
}

const SHORTCUTS: KeyboardShortcut[] = [
  // Navigation shortcuts
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    icon: Keyboard,
    category: 'navigation',
  },
  {
    key: 'Escape',
    description: 'Close current modal/dialog',
    icon: X,
    category: 'navigation',
  },
  {
    key: '1-6',
    description: 'Switch between dashboard tabs',
    icon: Eye,
    category: 'navigation',
  },

  // Action shortcuts
  {
    key: 'r',
    description: 'Refresh dashboard data',
    icon: RefreshCw,
    category: 'actions',
    modifier: 'ctrl',
  },
  {
    key: 'e',
    description: 'Export current view',
    icon: Download,
    category: 'actions',
    modifier: 'ctrl',
  },
  {
    key: 'f',
    description: 'Toggle filters panel',
    icon: Filter,
    category: 'actions',
    modifier: 'ctrl',
  },
  {
    key: 's',
    description: 'Open settings',
    icon: Settings,
    category: 'actions',
    modifier: 'ctrl',
  },
  {
    key: 'Enter',
    description: 'Toggle fullscreen mode',
    icon: Maximize2,
    category: 'actions',
    modifier: 'shift',
  },

  // View shortcuts
  {
    key: 'z',
    description: 'Zoom in on charts',
    icon: Zap,
    category: 'views',
    modifier: 'ctrl',
  },
  {
    key: 'x',
    description: 'Zoom out on charts',
    icon: Zap,
    category: 'views',
    modifier: 'ctrl',
  },
  {
    key: '0',
    description: 'Reset zoom level',
    icon: Zap,
    category: 'views',
    modifier: 'ctrl',
  },

  // Filter shortcuts
  {
    key: 'd',
    description: 'Set date range filter',
    icon: Filter,
    category: 'filters',
    modifier: 'alt',
  },
  {
    key: 'c',
    description: 'Set category filter',
    icon: Filter,
    category: 'filters',
    modifier: 'alt',
  },
  {
    key: 'p',
    description: 'Set priority filter',
    icon: Filter,
    category: 'filters',
    modifier: 'alt',
  },
]

const CATEGORY_NAMES = {
  navigation: 'Navigation',
  actions: 'Actions',
  views: 'Views',
  filters: 'Filters',
}

const CATEGORY_DESCRIPTIONS = {
  navigation: 'Move around the dashboard and interface',
  actions: 'Perform common tasks and operations',
  views: 'Control chart display and visualization',
  filters: 'Quickly apply data filters',
}

interface KeyboardShortcutsProps {
  className?: string
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Show help modal with '?' key
      if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
        // Don't trigger if user is typing in an input
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true'
        ) {
          return
        }

        event.preventDefault()
        setIsOpen(true)
        return
      }

      // Close modal with Escape
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      // Handle other shortcuts when modal is not open
      if (!isOpen) {
        // Tab switching (1-6)
        if (event.key >= '1' && event.key <= '6' && !event.ctrlKey && !event.altKey) {
          const target = event.target as HTMLElement
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return
          }

          event.preventDefault()
          const tabIndex = parseInt(event.key) - 1
          const tabTriggers = document.querySelectorAll(
            '[data-state="inactive"], [data-state="active"]'
          )
          const targetTab = tabTriggers[tabIndex] as HTMLElement
          if (targetTab) {
            targetTab.click()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen])

  // Filter shortcuts based on search
  const filteredShortcuts = React.useMemo(() => {
    if (!searchQuery) {
      return SHORTCUTS
    }

    return SHORTCUTS.filter(
      (shortcut) =>
        shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        CATEGORY_NAMES[shortcut.category].toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    return filteredShortcuts.reduce(
      (groups, shortcut) => {
        if (!groups[shortcut.category]) {
          groups[shortcut.category] = []
        }
        groups[shortcut.category].push(shortcut)
        return groups
      },
      {} as Record<string, KeyboardShortcut[]>
    )
  }, [filteredShortcuts])

  const formatKeyCombo = (shortcut: KeyboardShortcut) => {
    const parts: string[] = []

    if (shortcut.modifier) {
      const modifierText =
        shortcut.modifier === 'ctrl'
          ? navigator.platform.includes('Mac')
            ? '⌘'
            : 'Ctrl'
          : shortcut.modifier === 'alt'
            ? navigator.platform.includes('Mac')
              ? '⌥'
              : 'Alt'
            : 'Shift'
      parts.push(modifierText)
    }

    parts.push(shortcut.key.toUpperCase())

    return parts
  }

  return (
    <>
      {/* Help trigger button (optional, shortcuts work globally) */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 z-40 bg-background/95 backdrop-blur-sm ${className}`}
        aria-label='Show keyboard shortcuts'
      >
        <Keyboard className='h-4 w-4' />
        <span className='sr-only'>Keyboard shortcuts (Press ? for help)</span>
      </Button>

      {/* Keyboard shortcuts modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-hidden'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Keyboard className='h-5 w-5' />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate the dashboard efficiently.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <input
                type='text'
                placeholder='Search shortcuts...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            {/* Shortcuts by category */}
            <div className='grid max-h-[60vh] gap-6 overflow-y-auto'>
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <Card key={category}>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>
                      {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
                    </CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      {CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS]}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='grid gap-3'>
                      {shortcuts.map((shortcut, index) => {
                        const IconComponent = shortcut.icon
                        const keyParts = formatKeyCombo(shortcut)

                        return (
                          <div
                            key={`${category}-${index}`}
                            className='flex items-center justify-between border-b border-border/50 py-2 last:border-0'
                          >
                            <div className='flex items-center gap-3'>
                              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-muted'>
                                <IconComponent className='h-4 w-4 text-muted-foreground' />
                              </div>
                              <span className='text-sm font-medium'>{shortcut.description}</span>
                            </div>

                            <div className='flex items-center gap-1'>
                              {keyParts.map((part, partIndex) => (
                                <React.Fragment key={partIndex}>
                                  <Badge variant='outline' className='px-2 py-1 font-mono text-xs'>
                                    {part}
                                  </Badge>
                                  {partIndex < keyParts.length - 1 && (
                                    <span className='text-xs text-muted-foreground'>+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredShortcuts.length === 0 && (
              <div className='py-8 text-center text-muted-foreground'>
                <Keyboard className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No shortcuts found matching "{searchQuery}"</p>
                <p className='mt-1 text-sm'>Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer with tips */}
          <div className='border-t pt-4'>
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1'>
                  <Badge variant='outline' className='px-1 py-0 text-xs'>
                    ?
                  </Badge>
                  <span>Show this help</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Badge variant='outline' className='px-1 py-0 text-xs'>
                    Esc
                  </Badge>
                  <span>Close</span>
                </div>
              </div>
              <span>{filteredShortcuts.length} shortcuts available</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default KeyboardShortcuts
