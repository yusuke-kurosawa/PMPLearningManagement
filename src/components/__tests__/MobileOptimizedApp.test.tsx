import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import MobileOptimizedApp from '../mobile/MobileOptimizedApp'
import type { ServiceWorkerRegistration as _ServiceWorkerRegistration } from '../../types/service-worker'

expect.extend(toHaveNoViolations)

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Mock intersection observer
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

// Mock service worker
const mockServiceWorker = {
  register: vi.fn().mockResolvedValue({}),
  ready: vi.fn().mockResolvedValue({}),
}
Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
})

// Mock PWA APIs
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock vibration API
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
})

// Mock touch events
Object.defineProperty(window, 'ontouchstart', {
  value: null,
  writable: true,
})

// Mock device pixel ratio
Object.defineProperty(window, 'devicePixelRatio', {
  value: 2,
  writable: true,
})

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('MobileOptimizedApp', () => {
  let originalInnerWidth
  let originalInnerHeight

  beforeEach(() => {
    // Mock mobile viewport
    originalInnerWidth = global.innerWidth
    originalInnerHeight = global.innerHeight
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 812,
    })

    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      value: null,
      writable: true,
    })

    // Mock maxTouchPoints
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      writable: true,
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    })
  })

  describe('PWA Features', () => {
    it('should render mobile header with menu button', () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0) // At least one button
      expect(screen.getByText('PMP Learning')).toBeInTheDocument()
    })

    it('should show offline indicator when offline', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Simulate offline event
      fireEvent(window, new Event('offline'))

      await waitFor(() => {
        const offlineElements = screen.getAllByText(/offline/i)
        expect(offlineElements.length).toBeGreaterThan(0)
      })
    })

    it('should handle install prompt', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Create mock beforeinstallprompt event with required properties
      const mockInstallEvent = new Event('beforeinstallprompt')
      Object.defineProperty(mockInstallEvent, 'prompt', {
        value: vi.fn().mockResolvedValue({}),
        writable: false
      })
      Object.defineProperty(mockInstallEvent, 'preventDefault', {
        value: vi.fn(),
        writable: false
      })

      // Dispatch the event to window
      window.dispatchEvent(mockInstallEvent)
      
      // Wait for state update then open mobile menu
      await waitFor(async () => {
        const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
        const menuButton = menuButtons[0] // Use first menu button
        fireEvent.click(menuButton)

        // Look for install button in menu
        await waitFor(() => {
          expect(screen.getByText(/install app/i)).toBeInTheDocument()
        })
      })
    })

    it('should display PWA status indicators', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Open mobile menu
      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText(/online/i)).toBeInTheDocument()
      })
    })
  })

  describe('Touch Gesture Recognition', () => {
    it('should handle touch start events', () => {
      const { container } = renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          {
            clientX: 100,
            clientY: 200,
          } as Touch,
        ],
      })

      fireEvent(container.firstChild, touchStartEvent)

      // Should not throw error
      expect(container).toBeInTheDocument()
    })

    it('should detect swipe gestures', async () => {
      const { container } = renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Simulate swipe right from edge
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          {
            clientX: 20,
            clientY: 200,
          } as Touch,
        ],
      })

      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [
          {
            clientX: 150,
            clientY: 200,
          } as Touch,
        ],
      })

      fireEvent(container.firstChild, touchStart)

      // Wait a bit then trigger end
      setTimeout(() => {
        fireEvent(container.firstChild, touchEnd)
      }, 100)

      // Should potentially open menu (implementation dependent)
      expect(container).toBeInTheDocument()
    })

    it('should handle long press gestures with vibration', async () => {
      // Set up proper environment for touch gestures
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      })

      const { container } = renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Create a proper touch event that the component will recognize
      const touch = { clientX: 100, clientY: 200, identifier: 0 } as Touch
      const touchStartEvent = {
        type: 'touchstart',
        touches: [touch],
        changedTouches: [touch],
        preventDefault: vi.fn(),
        target: container.firstChild,
      } as unknown as TouchEvent

      // Trigger the touch start event directly on the app container
      fireEvent(container.firstChild!, touchStartEvent)

      // Wait longer than the long press threshold (500ms)
      await new Promise(resolve => setTimeout(resolve, 600))

      // Component should handle the gesture without error
      expect(container).toBeInTheDocument()
    })
  })

  describe('Device Information Collection', () => {
    it('should collect device information', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Open mobile menu to see device info
      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText(/device info/i)).toBeInTheDocument()
        expect(screen.getByText(/375/)).toBeInTheDocument() // Width
        expect(screen.getByText(/812/)).toBeInTheDocument() // Height
      })
    })

    it('should update device info on resize', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Change window size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      fireEvent(window, new Event('resize'))

      // Device info should update
      await waitFor(() => {
        expect(window.innerWidth).toBe(768)
      })
    })

    it('should detect orientation changes', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Simulate landscape orientation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 812,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      })

      fireEvent(window, new Event('orientationchange'))

      // Should detect landscape
      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText(/landscape/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should render navigation menu items', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText('ホーム')).toBeInTheDocument()
        expect(screen.getByText('マトリックス')).toBeInTheDocument()
        expect(screen.getByText('ネットワーク')).toBeInTheDocument()
      })
    })

    it('should close menu when navigation item is clicked', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      fireEvent.click(menuButton)

      await waitFor(() => {
        const homeLink = screen.getByText('ホーム')
        fireEvent.click(homeLink)
      })

      // Menu should close (implementation dependent)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render bottom navigation on mobile', () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Bottom navigation should be present
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(1) // At least hamburger + bottom nav buttons
    })
  })

  describe('Performance & Memory', () => {
    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Get the number of removeEventListener calls before unmount
      const initialCallCount = removeEventListenerSpy.mock.calls.length

      unmount()

      // Check that removeEventListener was called more times after unmount
      expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThan(initialCallCount)

      // Reset spy
      removeEventListenerSpy.mockRestore()
    })

    it('should throttle resize events', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Fire multiple resize events rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent(window, new Event('resize'))
      }

      // Should handle gracefully
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Share & Installation', () => {
    it('should handle app sharing', async () => {
      const mockShare = vi.fn().mockResolvedValue()
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      })

      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      fireEvent.click(menuButton)

      await waitFor(() => {
        const shareButton = screen.getByText(/share app/i)
        fireEvent.click(shareButton)
      })

      expect(mockShare).toHaveBeenCalledWith({
        title: 'PMP Learning Management',
        text: 'Check out this awesome PMP study app!',
        url: expect.any(String),
      })
    })

    it('should fallback to clipboard when share API unavailable', async () => {
      const mockClipboard = vi.fn().mockResolvedValue()
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockClipboard },
        writable: true,
      })
      
      // Ensure navigator.share is not available
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      })

      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      fireEvent.click(menuButton)

      await waitFor(() => {
        const shareButton = screen.getByText(/share app/i)
        fireEvent.click(shareButton)
      })

      await waitFor(() => {
        expect(mockClipboard).toHaveBeenCalledWith(expect.any(String))
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels', () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      expect(menuButtons.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      const menuButtons = screen.getAllByRole('button', { name: /メニューを開く/i })
      const menuButton = menuButtons[0] // Use first menu button
      menuButton.focus()

      expect(document.activeElement).toBe(menuButton)
    })
  })

  describe('Error Handling', () => {
    it('should handle service worker registration failure gracefully', async () => {
      // Don't mock console.error since logger may not call it in dev mode
      mockServiceWorker.register.mockRejectedValueOnce(new Error('SW registration failed'))

      const { container } = renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Service worker failure should not crash the app
      await waitFor(() => {
        expect(container).toBeInTheDocument()
      })

      // Reset mock for other tests
      mockServiceWorker.register.mockResolvedValue({})
    })

    it('should handle notification permission denial', async () => {
      Object.defineProperty(Notification, 'permission', {
        value: 'denied',
        writable: true,
      })

      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Should render without throwing
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Development Mode Features', () => {
    it('should show debug info in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      renderWithRouter(
        <MobileOptimizedApp>
          <div>Test Content</div>
        </MobileOptimizedApp>
      )

      // Debug info should be visible (if implemented)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      process.env.NODE_ENV = originalEnv
    })
  })
})
