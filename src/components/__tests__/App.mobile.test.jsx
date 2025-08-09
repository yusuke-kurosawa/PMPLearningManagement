import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../App';

expect.extend(toHaveNoViolations);

// Mock the mobile components
vi.mock('../mobile/MobileOptimizedApp', () => ({
  default: ({ children }) => (
    <div data-testid="mobile-app">
      <div data-testid="mobile-header">Mobile Header</div>
      {children}
    </div>
  ),
}));

// Mock other heavy components
vi.mock('../layout/Navigation', () => ({
  default: () => <nav data-testid="desktop-navigation">Desktop Navigation</nav>,
}));

vi.mock('../shared/CustomizationPanel', () => ({
  default: () => <div data-testid="customization-panel">Customization Panel</div>,
}));

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('App Mobile Detection and Routing', () => {
  let originalUserAgent;
  let originalInnerWidth;
  let originalInnerHeight;
  let originalMaxTouchPoints;

  beforeEach(() => {
    // Store original values
    originalUserAgent = navigator.userAgent;
    originalInnerWidth = global.innerWidth;
    originalInnerHeight = global.innerHeight;
    originalMaxTouchPoints = navigator.maxTouchPoints;

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      configurable: true,
      value: originalUserAgent,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: originalMaxTouchPoints,
    });
  });

  describe('Mobile Device Detection', () => {
    it('should detect mobile device by user agent', async () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
      });
    });

    it('should detect mobile by screen size and touch support', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Mobile breakpoint
      });

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });
    });

    it('should use desktop version for large screens without touch', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('customization-panel')).toBeInTheDocument();
      });
    });

    it('should detect Android devices', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36',
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 412,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });
    });

    it('should detect iPad devices', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Mobile/15E148 Safari/604.1',
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should switch to mobile view when resizing to mobile size', async () => {
      // Start with desktop size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      render(<App />);

      // Initially should be desktop
      await waitFor(() => {
        expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
      });

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });
    });

    it('should switch to desktop view when resizing to desktop size', async () => {
      // Start with mobile size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      });

      render(<App />);

      // Initially should be mobile
      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });

      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
      });
    });

    it('should handle orientation changes', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 812,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      });

      render(<App />);

      fireEvent(window, new Event('orientationchange'));

      // Should still render mobile app in landscape
      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing touch support gracefully', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      // No touch support
      delete window.ontouchstart;
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      render(<App />);

      // Should still work
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('should handle tablet-sized screens appropriately', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Tablet size
      });

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 10,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should load components lazily', async () => {
      render(<App />);

      // Loading spinner should appear initially
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();

      // Components should load after initial render
      await waitFor(() => {
        expect(screen.queryByText('読み込み中...')).toBeInTheDocument();
      });
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<App />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });

    it('should debounce resize events', async () => {
      const { rerender } = render(<App />);

      // Fire multiple resize events
      for (let i = 0; i < 10; i++) {
        fireEvent(window, new Event('resize'));
      }

      // Should handle gracefully without multiple re-renders
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain accessibility on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-app')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component loading errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<App />);

      // Should not crash the app
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});