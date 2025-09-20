/**
 * Mobile UX Enhancements Component
 * Advanced mobile user experience patterns and responsive design
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Input } from '../ui/input'
import { useToast } from '../../hooks/use-toast'
import useTouchGestures from '../../hooks/useTouchGestures'
import { usePWA } from '../providers/PWAProvider'
import mobilePerformanceManager from '../../services/mobilePerformanceManager'
import {
  Search,
  Filter,
  Sort,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X,
  Check,
  Star,
  Heart,
  Share2,
  Bookmark,
  Download,
  RefreshCw,
  Zap,
  Battery,
  Wifi,
  WifiOff,
  Smartphone,
  Menu,
  ArrowLeft,
  Plus,
  Minus,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Settings,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react'

interface StudyCard {
  id: string
  title: string
  description: string
  progress: number
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number // minutes
  isFavorite: boolean
  isBookmarked: boolean
  lastAccessed?: Date
}

interface FilterOptions {
  category: string[]
  difficulty: string[]
  progress: 'all' | 'not-started' | 'in-progress' | 'completed'
  sortBy: 'title' | 'progress' | 'difficulty' | 'recent'
  sortOrder: 'asc' | 'desc'
}

const MobileUXEnhancements: React.FC = () => {
  const { toast } = useToast()
  const { isOnline, isStandalone, capabilities, vibrate, requestWakeLock, releaseWakeLock } =
    usePWA()

  // State management
  const [studyCards] = useState<StudyCard[]>([
    {
      id: '1',
      title: 'PMBOK Process Groups',
      description: 'Learn about the 5 process groups in project management',
      progress: 75,
      category: 'PMBOK',
      difficulty: 'medium',
      estimatedTime: 30,
      isFavorite: true,
      isBookmarked: false,
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Knowledge Areas Deep Dive',
      description: 'Comprehensive study of all 10 knowledge areas',
      progress: 45,
      category: 'Knowledge Areas',
      difficulty: 'hard',
      estimatedTime: 60,
      isFavorite: false,
      isBookmarked: true,
      lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'ITTO Quick Review',
      description: 'Fast-paced review of inputs, tools & techniques, outputs',
      progress: 0,
      category: 'ITTO',
      difficulty: 'easy',
      estimatedTime: 15,
      isFavorite: false,
      isBookmarked: false,
    },
  ])

  const [filteredCards, setFilteredCards] = useState<StudyCard[]>(studyCards)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    category: [],
    difficulty: [],
    progress: 'all',
    sortBy: 'recent',
    sortOrder: 'desc',
  })

  // Mobile UX state
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFloatingActions, setShowFloatingActions] = useState(true)
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false)
  const [swipeableCardId, setSwipeableCardId] = useState<string | null>(null)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  // Performance state
  const [performanceMode, setPerformanceMode] = useState<'auto' | 'battery' | 'performance'>('auto')
  const [deviceInfo] = useState(() => mobilePerformanceManager.getDeviceInfo())
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const pullStartY = useRef<number>(0)
  const lastScrollTop = useRef<number>(0)

  // Touch gestures
  const touchHandlers = useTouchGestures({
    onSwipeLeft: () => handleGlobalSwipe('left'),
    onSwipeRight: () => handleGlobalSwipe('right'),
    onSwipeUp: () => handleGlobalSwipe('up'),
    onSwipeDown: () => handleGlobalSwipe('down'),
    onDoubleTap: () => handleDoubleTap(),
    onPinchZoom: (scale) => handlePinchZoom(scale),
  })

  // Effects
  useEffect(() => {
    initializeMobileUX()
    setupPerformanceMonitoring()
    return () => cleanup()
  }, [])

  useEffect(() => {
    filterAndSortCards()
  }, [searchQuery, activeFilters, studyCards])

  // Initialize mobile UX features
  const initializeMobileUX = useCallback(async () => {
    // Check device capabilities
    if (deviceInfo.isMobile) {
      setShowFloatingActions(true)

      // Enable wake lock for study sessions
      if (capabilities.hasWakeLock) {
        await requestWakeLock()
      }
    }

    // Setup scroll behavior
    setupScrollBehavior()

    // Setup orientation change handling
    window.addEventListener('orientationchange', handleOrientationChange)

    // Setup battery monitoring
    setupBatteryMonitoring()

    // Setup keyboard handling for mobile
    setupMobileKeyboardHandling()
  }, [deviceInfo, capabilities, requestWakeLock])

  // Setup performance monitoring
  const setupPerformanceMonitoring = () => {
    const unsubscribe = mobilePerformanceManager.subscribe((metrics) => {
      // Adjust UX based on performance
      if (metrics.memoryUsage > 0.8) {
        setPerformanceMode('battery')
      } else if (metrics.renderTime > 50) {
        setPerformanceMode('battery')
      }
    })

    return unsubscribe
  }

  // Setup scroll behavior
  const setupScrollBehavior = () => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = container.scrollTop
          const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up'

          // Auto-hide floating actions on scroll down
          if (scrollDirection === 'down' && scrollTop > 100) {
            setShowFloatingActions(false)
          } else if (scrollDirection === 'up') {
            setShowFloatingActions(true)
          }

          lastScrollTop.current = scrollTop
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => container.removeEventListener('scroll', handleScroll)
  }

  // Setup battery monitoring
  const setupBatteryMonitoring = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        setBatteryLevel(Math.round(battery.level * 100))

        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100))

          // Auto-enable battery mode when low
          if (battery.level < 0.2) {
            setPerformanceMode('battery')
          }
        }

        battery.addEventListener('levelchange', updateBattery)
        battery.addEventListener('chargingchange', updateBattery)
      } catch (error) {
        console.warn('Battery API not available')
      }
    }
  }

  // Setup mobile keyboard handling
  const setupMobileKeyboardHandling = () => {
    if (!deviceInfo.isMobile) {
      return
    }

    const handleViewportChange = () => {
      // Adjust UI when virtual keyboard appears
      const isKeyboardOpen = window.innerHeight < screen.height * 0.75

      if (isKeyboardOpen && isSearchFocused) {
        // Scroll search into view
        searchInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }

    window.addEventListener('resize', handleViewportChange)
    return () => window.removeEventListener('resize', handleViewportChange)
  }

  // Handle orientation change
  const handleOrientationChange = () => {
    // Force re-layout after orientation change
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 100)
  }

  // Gesture handlers
  const handleGlobalSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    vibrate(15)

    switch (direction) {
      case 'right':
        // Open filters/menu
        setShowFilters(true)
        break
      case 'left':
        // Close filters/menu
        setShowFilters(false)
        break
      case 'down':
        // Pull to refresh
        handlePullToRefresh()
        break
      case 'up':
        // Hide floating actions
        setShowFloatingActions(false)
        break
    }
  }

  const handleDoubleTap = () => {
    vibrate(25)
    // Toggle dark mode
    setIsDarkMode(!isDarkMode)
    toast({
      title: `${isDarkMode ? 'Light' : 'Dark'} mode enabled`,
      description: 'Double-tap to toggle theme',
    })
  }

  const handlePinchZoom = (scale: number) => {
    // Implement zoom functionality if needed
    if (scale > 1.2) {
      // Zoom in - could expand content
      console.log('Pinch zoom in:', scale)
    } else if (scale < 0.8) {
      // Zoom out - could compress content
      console.log('Pinch zoom out:', scale)
    }
  }

  // Pull to refresh handler
  const handlePullToRefresh = async () => {
    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Connect to internet to refresh content',
        variant: 'destructive',
      })
      return
    }

    setPullToRefreshActive(true)
    vibrate([20, 10, 20])

    try {
      // Simulate refresh
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: 'Content refreshed',
        description: 'Your study materials are up to date',
      })
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setPullToRefreshActive(false)
    }
  }

  // Filter and sort cards
  const filterAndSortCards = () => {
    const filtered = studyCards.filter((card) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !card.title.toLowerCase().includes(query) &&
          !card.description.toLowerCase().includes(query) &&
          !card.category.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Category filter
      if (activeFilters.category.length > 0 && !activeFilters.category.includes(card.category)) {
        return false
      }

      // Difficulty filter
      if (
        activeFilters.difficulty.length > 0 &&
        !activeFilters.difficulty.includes(card.difficulty)
      ) {
        return false
      }

      // Progress filter
      if (activeFilters.progress !== 'all') {
        switch (activeFilters.progress) {
          case 'not-started':
            return card.progress === 0
          case 'in-progress':
            return card.progress > 0 && card.progress < 100
          case 'completed':
            return card.progress === 100
        }
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (activeFilters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'progress':
          comparison = a.progress - b.progress
          break
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
          break
        case 'recent':
          const aTime = a.lastAccessed?.getTime() || 0
          const bTime = b.lastAccessed?.getTime() || 0
          comparison = bTime - aTime
          break
      }

      return activeFilters.sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredCards(filtered)
  }

  // Card action handlers
  const toggleFavorite = (cardId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    vibrate(10)

    toast({
      title: 'Favorite toggled',
      description: 'Card has been added/removed from favorites',
    })
  }

  const toggleBookmark = (cardId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    vibrate(10)

    toast({
      title: 'Bookmark toggled',
      description: 'Card has been bookmarked/unbookmarked',
    })
  }

  const shareCard = (card: StudyCard, event: React.MouseEvent) => {
    event.stopPropagation()

    if ('share' in navigator) {
      navigator.share({
        title: card.title,
        text: card.description,
        url: window.location.href,
      })
    } else {
      // Fallback
      navigator.clipboard.writeText(`${card.title}: ${card.description}`)
      toast({
        title: 'Copied to clipboard',
        description: 'Study card details copied',
      })
    }
  }

  // Performance helpers
  const shouldShowAnimation = () => {
    return performanceMode !== 'battery' && !deviceInfo.isLowEndDevice
  }

  const getImageQuality = () => {
    return mobilePerformanceManager.getImageQuality()
  }

  // Cleanup
  const cleanup = () => {
    releaseWakeLock()
    window.removeEventListener('orientationchange', handleOrientationChange)
  }

  return (
    <div
      ref={scrollContainerRef}
      className={`min-h-screen bg-gray-50 ${isDarkMode ? 'dark bg-gray-900' : ''} 
        ${isStandalone ? 'pb-safe-bottom pt-safe-top' : ''}`}
    >
      {/* Status Bar */}
      <div className='sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Badge variant={isOnline ? 'default' : 'destructive'} className='text-xs'>
              {isOnline ? <Wifi className='h-3 w-3' /> : <WifiOff className='h-3 w-3' />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>

            {batteryLevel !== null && (
              <Badge variant='secondary' className='text-xs'>
                <Battery className='h-3 w-3' />
                {batteryLevel}%
              </Badge>
            )}

            {performanceMode !== 'auto' && (
              <Badge variant='outline' className='text-xs'>
                <Zap className='h-3 w-3' />
                {performanceMode}
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsDarkMode(!isDarkMode)}
              className='p-2'
            >
              {isDarkMode ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
              className='p-2'
            >
              <Settings className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      {pullToRefreshActive && (
        <div className='absolute left-0 right-0 top-16 z-40 bg-blue-500 py-2 text-center text-white'>
          <div className='flex items-center justify-center gap-2'>
            <RefreshCw className='h-4 w-4 animate-spin' />
            <span className='text-sm'>Refreshing content...</span>
          </div>
        </div>
      )}

      {/* Enhanced Search Bar */}
      <div className='sticky top-14 z-40 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800'>
        <div className='relative'>
          <Input
            ref={searchInputRef}
            type='text'
            placeholder='Search study materials...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`pl-10 pr-10 ${shouldShowAnimation() ? 'transition-all duration-300' : ''} 
              ${isSearchFocused ? 'ring-2 ring-blue-500' : ''}`}
          />
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />

          {searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSearchQuery('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 transform p-1'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className='scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-2'>
          <Button
            variant={activeFilters.progress === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveFilters({ ...activeFilters, progress: 'all' })}
            className='shrink-0'
          >
            All
          </Button>
          <Button
            variant={activeFilters.progress === 'not-started' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveFilters({ ...activeFilters, progress: 'not-started' })}
            className='shrink-0'
          >
            New
          </Button>
          <Button
            variant={activeFilters.progress === 'in-progress' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveFilters({ ...activeFilters, progress: 'in-progress' })}
            className='shrink-0'
          >
            In Progress
          </Button>
          <Button
            variant={activeFilters.progress === 'completed' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveFilters({ ...activeFilters, progress: 'completed' })}
            className='shrink-0'
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='space-y-4 p-4 pb-20'>
        {/* Results Header */}
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Study Materials ({filteredCards.length})
          </h2>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2'
          >
            <Filter className='h-4 w-4' />
            Filters
          </Button>
        </div>

        {/* Study Cards */}
        <div className='space-y-4'>
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              className={`p-4 ${shouldShowAnimation() ? 'transition-all duration-300' : ''} 
                ${expandedCardId === card.id ? 'ring-2 ring-blue-500' : ''}
                ${swipeableCardId === card.id ? 'translate-x-2 transform' : ''}
                cursor-pointer hover:shadow-md`}
              onClick={() => setExpandedCardId(expandedCardId === card.id ? null : card.id)}
            >
              <div className='space-y-3'>
                {/* Card Header */}
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                      {card.title}
                    </h3>
                    <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                      {card.description}
                    </p>
                  </div>

                  <Button variant='ghost' size='sm' className='ml-2 p-1'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>Progress</span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {card.progress}%
                    </span>
                  </div>
                  <Progress
                    value={card.progress}
                    className={`h-2 ${shouldShowAnimation() ? 'transition-all duration-500' : ''}`}
                  />
                </div>

                {/* Metadata */}
                <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
                  <Badge variant='secondary' className='text-xs'>
                    {card.category}
                  </Badge>

                  <Badge
                    variant={
                      card.difficulty === 'hard'
                        ? 'destructive'
                        : card.difficulty === 'medium'
                          ? 'default'
                          : 'secondary'
                    }
                    className='text-xs'
                  >
                    {card.difficulty}
                  </Badge>

                  <span className='flex items-center gap-1'>
                    <Play className='h-3 w-3' />
                    {card.estimatedTime}m
                  </span>
                </div>

                {/* Action Buttons */}
                <div className='flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700'>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => toggleFavorite(card.id, e)}
                      className={`p-2 ${card.isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Heart className={`h-4 w-4 ${card.isFavorite ? 'fill-current' : ''}`} />
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => toggleBookmark(card.id, e)}
                      className={`p-2 ${card.isBookmarked ? 'text-blue-500' : 'text-gray-400'}`}
                    >
                      <Bookmark className={`h-4 w-4 ${card.isBookmarked ? 'fill-current' : ''}`} />
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => shareCard(card, e)}
                      className='p-2 text-gray-400'
                    >
                      <Share2 className='h-4 w-4' />
                    </Button>
                  </div>

                  <Button size='sm' className='bg-blue-600 text-white hover:bg-blue-700'>
                    <Play className='mr-2 h-4 w-4' />
                    Study
                  </Button>
                </div>

                {/* Expanded Content */}
                {expandedCardId === card.id && (
                  <div
                    className={`mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700
                    ${shouldShowAnimation() ? 'animate-fadeIn' : ''}`}
                  >
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      <strong>Last studied:</strong>{' '}
                      {card.lastAccessed ? card.lastAccessed.toLocaleDateString() : 'Never'}
                    </div>

                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm'>
                        <Download className='mr-2 h-4 w-4' />
                        Download
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Eye className='mr-2 h-4 w-4' />
                        Preview
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className='py-12 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
              <Search className='h-6 w-6 text-gray-400' />
            </div>
            <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
              No study materials found
            </h3>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>
              Try adjusting your search terms or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setActiveFilters({ ...activeFilters, progress: 'all' })
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {showFloatingActions && (
        <div
          className={`fixed bottom-6 right-6 z-50 ${shouldShowAnimation() ? 'transition-all duration-300' : ''}`}
        >
          <Button
            size='lg'
            className='h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700'
            onClick={() =>
              toast({ title: 'Quick Study', description: 'Starting quick study session' })
            }
          >
            <Plus className='h-6 w-6' />
          </Button>
        </div>
      )}

      {/* Bottom Safe Area for Standalone Mode */}
      {isStandalone && <div className='h-safe-bottom bg-white dark:bg-gray-800' />}
    </div>
  )
}

export default MobileUXEnhancements
