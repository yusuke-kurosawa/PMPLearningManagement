import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Star, Heart, Share2, Bookmark } from 'lucide-react'

// Touch-friendly button with haptic feedback
export const TouchButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  haptic = true,
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => {
    setIsPressed(true)
    if (haptic && navigator.vibrate && !disabled) {
      navigator.vibrate(10)
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
  }

  const baseClasses = `
    relative overflow-hidden transition-all duration-150 rounded-xl font-medium
    active:scale-95 select-none touch-manipulation
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isPressed ? 'scale-95' : ''}
  `

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg',
    secondary:
      'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={() => setIsPressed(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Expandable card with touch gestures
export const TouchExpandableCard = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const cardRef = useRef(null)

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    const deltaY = currentY - startY

    if (Math.abs(deltaY) > 50) {
      if (deltaY < 0 && !isExpanded) {
        // Swipe up to expand
        setIsExpanded(true)
        if (navigator.vibrate) {
          navigator.vibrate(15)
        }
      } else if (deltaY > 0 && isExpanded) {
        // Swipe down to collapse
        setIsExpanded(false)
        if (navigator.vibrate) {
          navigator.vibrate(15)
        }
      }
    }

    setStartY(0)
    setCurrentY(0)
  }

  return (
    <div
      ref={cardRef}
      className='overflow-hidden rounded-xl border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'
    >
      <div
        className='cursor-pointer touch-manipulation select-none p-4 active:bg-gray-50 dark:active:bg-gray-700'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{title}</h3>
          <div className='flex items-center gap-2'>
            {isExpanded ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />}
          </div>
        </div>

        {/* Swipe indicator */}
        <div className='mt-2 flex justify-center'>
          <div className='h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600' />
        </div>
      </div>

      {/* Expandable content */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className='border-t p-4 pt-0 dark:border-gray-700'>{children}</div>
      </div>
    </div>
  )
}

// Touch-friendly action bar
export const TouchActionBar = ({ items = [], onAction }) => {
  const [activeItem, setActiveItem] = useState(null)

  const defaultItems = [
    { id: 'favorite', icon: Heart, label: 'お気に入り', color: 'text-red-500' },
    { id: 'bookmark', icon: Bookmark, label: 'ブックマーク', color: 'text-blue-500' },
    { id: 'share', icon: Share2, label: '共有', color: 'text-green-500' },
    { id: 'star', icon: Star, label: '評価', color: 'text-yellow-500' },
  ]

  const actionItems = items.length > 0 ? items : defaultItems

  const handleAction = (item) => {
    setActiveItem(item.id)
    if (navigator.vibrate) {
      navigator.vibrate(20)
    }

    // Reset active state after animation
    setTimeout(() => setActiveItem(null), 200)

    if (onAction) {
      onAction(item)
    }
  }

  return (
    <div className='border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex items-center justify-around'>
        {actionItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleAction(item)}
              className={`
                flex min-w-[60px] touch-manipulation flex-col items-center gap-2 rounded-xl p-3
                transition-all duration-150
                ${
                  isActive
                    ? 'scale-110 bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 active:scale-95 dark:hover:bg-gray-700/50'
                }
              `}
            >
              <Icon className={`h-6 w-6 ${item.color || 'text-gray-600 dark:text-gray-400'}`} />
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Long press menu component
export const TouchLongPressMenu = ({ children, menuItems = [], onMenuAction }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }

    longPressTimer.current = setTimeout(() => {
      setMenuPosition({ x: touch.clientX, y: touch.clientY })
      setShowMenu(true)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
  }

  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - startPos.current.x)
    const deltaY = Math.abs(touch.clientY - startPos.current.y)

    // Cancel long press if user moves finger too much
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleMenuAction = (item) => {
    setShowMenu(false)
    if (onMenuAction) {
      onMenuAction(item)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false)
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className='touch-manipulation'
      >
        {children}
      </div>

      {showMenu && (
        <div
          className='fixed z-50 min-w-[160px] rounded-xl border bg-white py-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800'
          style={{
            left: Math.min(menuPosition.x, window.innerWidth - 180),
            top: Math.min(menuPosition.y, window.innerHeight - menuItems.length * 48 - 20),
          }}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => handleMenuAction(item)}
                className='flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                {Icon && <Icon className='h-4 w-4' />}
                <span className='text-sm font-medium'>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// Swipeable list item
export const SwipeableListItem = ({ children, leftActions = [], rightActions = [], onSwipe }) => {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwipping, setIsSwiping] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const itemRef = useRef(null)

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!isSwipping) {
      return
    }

    currentX.current = e.touches[0].clientX
    const deltaX = currentX.current - startX.current
    const maxOffset = 80

    setSwipeOffset(Math.max(-maxOffset, Math.min(maxOffset, deltaX)))
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)

    if (Math.abs(swipeOffset) > 40) {
      const direction = swipeOffset > 0 ? 'right' : 'left'
      const actions = direction === 'right' ? rightActions : leftActions

      if (actions.length > 0 && onSwipe) {
        onSwipe(direction, actions[0])
      }
    }

    // Reset position
    setTimeout(() => setSwipeOffset(0), 100)
  }

  return (
    <div className='relative overflow-hidden'>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className='absolute bottom-0 left-0 top-0 flex items-center bg-green-500 px-4 text-white'>
          {leftActions.map((action, index) => {
            const Icon = action.icon
            return (
              <div key={index} className='flex flex-col items-center'>
                {Icon && <Icon className='h-5 w-5' />}
                <span className='mt-1 text-xs'>{action.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className='absolute bottom-0 right-0 top-0 flex items-center bg-red-500 px-4 text-white'>
          {rightActions.map((action, index) => {
            const Icon = action.icon
            return (
              <div key={index} className='flex flex-col items-center'>
                {Icon && <Icon className='h-5 w-5' />}
                <span className='mt-1 text-xs'>{action.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Main content */}
      <div
        ref={itemRef}
        className='touch-manipulation bg-white transition-transform duration-200 ease-out dark:bg-gray-800'
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
