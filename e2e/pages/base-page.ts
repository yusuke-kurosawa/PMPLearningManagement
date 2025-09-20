/**
 * Base Page Object Model for PMP Learning Management System
 * 
 * This base class provides common functionality for all page objects including:
 * - Self-healing element location strategies
 * - Advanced wait conditions and error handling
 * - Performance monitoring integration
 * - Accessibility testing helpers
 * - Screenshot and error reporting
 * 
 * @fileoverview Base Page Object Model with advanced automation features
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { type Page, type Locator, type FrameLocator } from '@playwright/test'
import { PerformanceMonitor } from '../utils/performance-monitor'
import { AccessibilityTester } from '../utils/accessibility-tester'
import { VisualTester } from '../utils/visual-tester'
import { SelfHealingLocator } from '../utils/self-healing-locator'

export interface WaitConditions {
  networkIdle?: boolean
  domContentLoaded?: boolean
  loadState?: 'load' | 'domcontentloaded' | 'networkidle'
  timeout?: number
  customCondition?: () => Promise<boolean>
}

export interface ElementOptions {
  timeout?: number
  retries?: number
  selfHeal?: boolean
  screenshot?: boolean
  accessibility?: boolean
}

export abstract class BasePage {
  protected readonly page: Page
  protected readonly performanceMonitor: PerformanceMonitor
  protected readonly accessibilityTester: AccessibilityTester
  protected readonly visualTester: VisualTester
  protected readonly selfHealingLocator: SelfHealingLocator
  
  // Common selectors that appear across multiple pages
  protected readonly commonSelectors = {
    // Navigation elements
    navigation: '[data-testid="navigation"]',
    mobileMenu: '[data-testid="mobile-menu"]',
    userProfile: '[data-testid="user-profile"]',
    
    // Loading and error states
    loadingSpinner: '[data-testid="loading-spinner"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    
    // Common UI elements
    modal: '[data-testid="modal"]',
    modalClose: '[data-testid="modal-close"]',
    tooltip: '[data-testid="tooltip"]',
    dropdown: '[data-testid="dropdown"]',
    
    // Form elements
    submitButton: '[data-testid="submit-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    
    // Theme and settings
    themeToggle: '[data-testid="theme-toggle"]',
    settingsPanel: '[data-testid="settings-panel"]'
  }

  constructor(page: Page) {
    this.page = page
    this.performanceMonitor = new PerformanceMonitor(page)
    this.accessibilityTester = new AccessibilityTester(page)
    this.visualTester = new VisualTester(page)
    this.selfHealingLocator = new SelfHealingLocator(page)
  }

  /**
   * Navigate to the page with advanced monitoring and validation
   */
  async navigate(url: string, options: WaitConditions = {}): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Start performance monitoring
      await this.performanceMonitor.startTrace()
      
      // Navigate with retry logic
      await this.page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.loadState || 'networkidle'
      })
      
      // Custom wait conditions
      if (options.customCondition) {
        await this.page.waitForFunction(options.customCondition, { timeout: 10000 })
      }
      
      // Wait for page-specific load indicators
      await this.waitForPageLoad()
      
      // Performance validation
      const navigationTime = Date.now() - startTime
      await this.performanceMonitor.recordNavigation(url, navigationTime)
      
      // Basic accessibility check
      await this.accessibilityTester.quickScan()
      
    } catch (error) {
      await this.handleNavigationError(error, url)
      throw error
    } finally {
      await this.performanceMonitor.stopTrace()
    }
  }

  /**
   * Get element with self-healing capabilities
   */
  async getElement(selector: string, options: ElementOptions = {}): Promise<Locator> {
    if (options.selfHeal !== false) {
      return await this.selfHealingLocator.locate(selector, options)
    }
    
    return this.page.locator(selector)
  }

  /**
   * Click element with advanced error handling and validation
   */
  async clickElement(
    selector: string, 
    options: ElementOptions & { force?: boolean } = {}
  ): Promise<void> {
    const element = await this.getElement(selector, options)
    
    try {
      // Ensure element is visible and enabled
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 })
      await element.waitFor({ state: 'attached' })
      
      // Accessibility check before interaction
      if (options.accessibility !== false) {
        await this.accessibilityTester.checkElement(element)
      }
      
      // Perform click with retry logic
      await this.retryAction(
        () => element.click({ force: options.force }),
        options.retries || 3
      )
      
      // Visual validation after click if requested
      if (options.screenshot) {
        await this.visualTester.captureElementScreenshot(element, `after-click-${selector}`)
      }
      
    } catch (error) {
      await this.handleElementError(error, selector, 'click')
      throw error
    }
  }

  /**
   * Fill input with advanced validation
   */
  async fillInput(
    selector: string, 
    value: string, 
    options: ElementOptions & { clear?: boolean } = {}
  ): Promise<void> {
    const element = await this.getElement(selector, options)
    
    try {
      await element.waitFor({ state: 'visible', timeout: options.timeout || 10000 })
      
      if (options.clear !== false) {
        await element.clear()
      }
      
      await this.retryAction(
        () => element.fill(value),
        options.retries || 3
      )
      
      // Verify the value was filled correctly
      const actualValue = await element.inputValue()
      if (actualValue !== value) {
        throw new Error(`Fill validation failed: expected "${value}", got "${actualValue}"`)
      }
      
    } catch (error) {
      await this.handleElementError(error, selector, 'fill')
      throw error
    }
  }

  /**
   * Wait for element with multiple strategies
   */
  async waitForElement(
    selector: string, 
    state: 'visible' | 'hidden' | 'attached' | 'detached' = 'visible',
    timeout: number = 10000
  ): Promise<Locator> {
    const element = await this.getElement(selector)
    await element.waitFor({ state, timeout })
    return element
  }

  /**
   * Wait for page-specific loading to complete
   */
  protected async waitForPageLoad(): Promise<void> {
    // Wait for common loading indicators to disappear
    try {
      await this.page.waitForSelector(this.commonSelectors.loadingSpinner, {
        state: 'detached',
        timeout: 5000
      })
    } catch {
      // Loading spinner not found or already gone - this is fine
    }

    // Wait for network activity to settle
    await this.page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Wait for any lazy-loaded content
    await this.page.waitForTimeout(500)
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string, timeout: number = 1000): Promise<boolean> {
    try {
      const element = await this.getElement(selector)
      await element.waitFor({ state: 'attached', timeout })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get text content with retry logic
   */
  async getTextContent(selector: string, options: ElementOptions = {}): Promise<string> {
    const element = await this.getElement(selector, options)
    
    return await this.retryAction(
      async () => {
        const text = await element.textContent()
        if (text === null) {
          throw new Error(`Element ${selector} has no text content`)
        }
        return text.trim()
      },
      options.retries || 3
    )
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = await this.getElement(selector)
    await element.scrollIntoViewIfNeeded()
    await this.page.waitForTimeout(500) // Allow for smooth scrolling
  }

  /**
   * Take screenshot of specific element
   */
  async screenshotElement(selector: string, name?: string): Promise<Buffer> {
    const element = await this.getElement(selector)
    return await element.screenshot({
      path: name ? `./test-results/screenshots/${name}.png` : undefined
    })
  }

  /**
   * Perform accessibility scan on current page
   */
  async scanAccessibility(): Promise<any> {
    return await this.accessibilityTester.fullScan()
  }

  /**
   * Monitor performance metrics
   */
  async measurePerformance(): Promise<any> {
    return await this.performanceMonitor.getMetrics()
  }

  /**
   * Wait for D3.js visualization to load completely
   */
  async waitForD3Visualization(container: string, timeout: number = 15000): Promise<void> {
    // Wait for D3 container to be present
    await this.page.waitForSelector(container, { timeout })
    
    // Wait for SVG elements to be rendered
    await this.page.waitForSelector(`${container} svg`, { timeout })
    
    // Wait for D3 animations to complete
    await this.page.waitForFunction(
      (selector) => {
        const container = document.querySelector(selector)
        if (!container) return false
        
        // Check if D3 has finished rendering
        const svg = container.querySelector('svg')
        if (!svg) return false
        
        // Basic check for content
        const hasContent = svg.children.length > 0
        return hasContent
      },
      container,
      { timeout }
    )
    
    // Additional wait for complex animations
    await this.page.waitForTimeout(1000)
  }

  /**
   * Retry action with exponential backoff
   */
  protected async retryAction<T>(
    action: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await action()
      } catch (error) {
        lastError = error as Error
        
        if (i === maxRetries) {
          break
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, i)
        await this.page.waitForTimeout(delay)
      }
    }
    
    throw lastError
  }

  /**
   * Handle navigation errors with debugging information
   */
  protected async handleNavigationError(error: Error, url: string): Promise<void> {
    console.error(`Navigation error for URL ${url}:`, error.message)
    
    // Take screenshot for debugging
    try {
      await this.page.screenshot({
        path: `./test-results/screenshots/navigation-error-${Date.now()}.png`,
        fullPage: true
      })
    } catch {
      // Screenshot failed, continue
    }
    
    // Log page console errors
    const logs = await this.page.evaluate(() => {
      return (window as any).__playwrightLogs || []
    })
    
    if (logs.length > 0) {
      console.error('Page console logs:', logs)
    }
  }

  /**
   * Handle element interaction errors
   */
  protected async handleElementError(
    error: Error, 
    selector: string, 
    action: string
  ): Promise<void> {
    console.error(`Element ${action} error for selector ${selector}:`, error.message)
    
    // Take screenshot for debugging
    try {
      await this.page.screenshot({
        path: `./test-results/screenshots/element-error-${action}-${Date.now()}.png`,
        fullPage: true
      })
    } catch {
      // Screenshot failed, continue
    }
    
    // Log element state for debugging
    try {
      const element = this.page.locator(selector)
      const isVisible = await element.isVisible().catch(() => false)
      const isEnabled = await element.isEnabled().catch(() => false)
      const isAttached = await element.count() > 0
      
      console.error(`Element state - Visible: ${isVisible}, Enabled: ${isEnabled}, Attached: ${isAttached}`)
    } catch {
      console.error('Could not determine element state')
    }
  }

  /**
   * Get current page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title()
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url()
  }

  /**
   * Check if page is responsive by testing key breakpoints
   */
  async testResponsiveness(): Promise<boolean> {
    const breakpoints = [
      { width: 375, height: 812 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }  // Desktop
    ]
    
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize(breakpoint)
      await this.page.waitForTimeout(500)
      
      // Basic responsiveness check
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      
      if (hasHorizontalScroll) {
        console.warn(`Horizontal scroll detected at ${breakpoint.width}x${breakpoint.height}`)
        return false
      }
    }
    
    return true
  }
}