/**
 * Home Page Object Model for PMP Learning Management System
 * 
 * This page object represents the main landing page and provides methods for:
 * - Navigation validation and interaction
 * - PMBOK overview and statistics verification
 * - Quick access to learning features
 * - Theme and customization testing
 * - Performance monitoring of initial page load
 * 
 * @fileoverview Home Page Object Model with comprehensive test coverage
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { type Page, type Locator } from '@playwright/test'
import { BasePage } from './base-page'

export interface HomePageMetrics {
  loadTime: number
  interactivityTime: number
  visualStability: number
  processesLoaded: number
  navigationItems: number
}

export interface PMBOKStats {
  totalProcesses: number
  knowledgeAreas: number
  processGroups: number
  userProgress: number
}

export class HomePage extends BasePage {
  // Page-specific selectors
  private readonly selectors = {
    // Hero section
    heroSection: '[data-testid="hero-section"]',
    mainTitle: '[data-testid="main-title"]',
    subtitle: '[data-testid="subtitle"]',
    ctaButton: '[data-testid="cta-button"]',
    
    // Navigation
    mainNavigation: '[data-testid="main-navigation"]',
    navigationItems: '[data-testid="nav-item"]',
    mobileMenuToggle: '[data-testid="mobile-menu-toggle"]',
    
    // PMBOK Statistics
    statsSection: '[data-testid="pmbok-stats"]',
    processCount: '[data-testid="process-count"]',
    knowledgeAreaCount: '[data-testid="knowledge-area-count"]',
    processGroupCount: '[data-testid="process-group-count"]',
    userProgressStat: '[data-testid="user-progress-stat"]',
    
    // Quick access cards
    quickAccessSection: '[data-testid="quick-access"]',
    matrixCard: '[data-testid="matrix-card"]',
    networkCard: '[data-testid="network-card"]',
    visualizationsCard: '[data-testid="visualizations-card"]',
    glossaryCard: '[data-testid="glossary-card"]',
    progressCard: '[data-testid="progress-card"]',
    examCard: '[data-testid="exam-card"]',
    
    // Features showcase
    featuresSection: '[data-testid="features-section"]',
    featureCards: '[data-testid="feature-card"]',
    
    // User dashboard preview (if authenticated)
    dashboardPreview: '[data-testid="dashboard-preview"]',
    recentActivity: '[data-testid="recent-activity"]',
    studyStreak: '[data-testid="study-streak"]',
    nextRecommendation: '[data-testid="next-recommendation"]',
    
    // Footer
    footer: '[data-testid="footer"]',
    footerLinks: '[data-testid="footer-link"]',
    socialLinks: '[data-testid="social-link"]',
    
    // Theme and settings
    themeToggle: '[data-testid="theme-toggle"]',
    languageSelector: '[data-testid="language-selector"]',
    settingsButton: '[data-testid="settings-button"]'
  }

  constructor(page: Page) {
    super(page)
  }

  /**
   * Navigate to home page with performance monitoring
   */
  async navigate(): Promise<HomePageMetrics> {
    const startTime = Date.now()
    
    await super.navigate('/', {
      networkIdle: true,
      customCondition: async () => {
        // Wait for key elements to be present
        const heroLoaded = await this.elementExists(this.selectors.heroSection)
        const statsLoaded = await this.elementExists(this.selectors.statsSection)
        const quickAccessLoaded = await this.elementExists(this.selectors.quickAccessSection)
        
        return heroLoaded && statsLoaded && quickAccessLoaded
      }
    })
    
    // Measure key performance metrics
    const loadTime = Date.now() - startTime
    const metrics = await this.measurePageMetrics()
    
    return {
      loadTime,
      interactivityTime: metrics.interactivityTime,
      visualStability: metrics.visualStability,
      processesLoaded: await this.getProcessCount(),
      navigationItems: await this.getNavigationItemCount()
    }
  }

  /**
   * Verify home page structure and content
   */
  async verifyPageStructure(): Promise<void> {
    // Hero section validation
    await this.waitForElement(this.selectors.heroSection)
    await this.waitForElement(this.selectors.mainTitle)
    await this.waitForElement(this.selectors.subtitle)
    
    // Navigation validation
    await this.waitForElement(this.selectors.mainNavigation)
    const navItems = await this.page.locator(this.selectors.navigationItems).count()
    if (navItems === 0) {
      throw new Error('Navigation items not found')
    }
    
    // Statistics section validation
    await this.waitForElement(this.selectors.statsSection)
    await this.waitForElement(this.selectors.processCount)
    await this.waitForElement(this.selectors.knowledgeAreaCount)
    
    // Quick access validation
    await this.waitForElement(this.selectors.quickAccessSection)
    const quickAccessCards = await this.page.locator(this.selectors.quickAccessSection + ' > *').count()
    if (quickAccessCards < 4) {
      throw new Error('Insufficient quick access cards')
    }
    
    // Footer validation
    await this.waitForElement(this.selectors.footer)
  }

  /**
   * Get PMBOK statistics from the home page
   */
  async getPMBOKStats(): Promise<PMBOKStats> {
    await this.waitForElement(this.selectors.statsSection)
    
    const processCountText = await this.getTextContent(this.selectors.processCount)
    const knowledgeAreaCountText = await this.getTextContent(this.selectors.knowledgeAreaCount)
    const processGroupCountText = await this.getTextContent(this.selectors.processGroupCount)
    
    // Extract numbers from text (e.g., "49 プロセス" -> 49)
    const totalProcesses = parseInt(processCountText.match(/\d+/)?.[0] || '0')
    const knowledgeAreas = parseInt(knowledgeAreaCountText.match(/\d+/)?.[0] || '0')
    const processGroups = parseInt(processGroupCountText.match(/\d+/)?.[0] || '0')
    
    let userProgress = 0
    if (await this.elementExists(this.selectors.userProgressStat)) {
      const progressText = await this.getTextContent(this.selectors.userProgressStat)
      userProgress = parseInt(progressText.match(/\d+/)?.[0] || '0')
    }
    
    return {
      totalProcesses,
      knowledgeAreas,
      processGroups,
      userProgress
    }
  }

  /**
   * Navigate to PMBOK Matrix view
   */
  async navigateToMatrix(): Promise<void> {
    await this.clickElement(this.selectors.matrixCard)
    await this.page.waitForURL('**/#/matrix')
  }

  /**
   * Navigate to Network Diagram view
   */
  async navigateToNetwork(): Promise<void> {
    await this.clickElement(this.selectors.networkCard)
    await this.page.waitForURL('**/#/network')
  }

  /**
   * Navigate to Visualizations Hub
   */
  async navigateToVisualizations(): Promise<void> {
    await this.clickElement(this.selectors.visualizationsCard)
    await this.page.waitForURL('**/#/visualizations')
  }

  /**
   * Navigate to Glossary
   */
  async navigateToGlossary(): Promise<void> {
    await this.clickElement(this.selectors.glossaryCard)
    await this.page.waitForURL('**/#/glossary')
  }

  /**
   * Navigate to Progress Dashboard (requires authentication)
   */
  async navigateToProgress(): Promise<void> {
    await this.clickElement(this.selectors.progressCard)
    // May redirect to login if not authenticated
    await this.page.waitForTimeout(1000)
  }

  /**
   * Navigate to Mock Exam (requires authentication)
   */
  async navigateToExam(): Promise<void> {
    await this.clickElement(this.selectors.examCard)
    // May redirect to login if not authenticated
    await this.page.waitForTimeout(1000)
  }

  /**
   * Test theme toggle functionality
   */
  async toggleTheme(): Promise<string> {
    const initialTheme = await this.getCurrentTheme()
    
    if (await this.elementExists(this.selectors.themeToggle)) {
      await this.clickElement(this.selectors.themeToggle)
      await this.page.waitForTimeout(500) // Allow theme transition
      
      const newTheme = await this.getCurrentTheme()
      if (newTheme === initialTheme) {
        throw new Error('Theme toggle failed - theme did not change')
      }
      
      return newTheme
    } else {
      throw new Error('Theme toggle not found')
    }
  }

  /**
   * Test mobile navigation menu
   */
  async testMobileNavigation(viewport: { width: number; height: number }): Promise<void> {
    // Set mobile viewport
    await this.page.setViewportSize(viewport)
    await this.page.waitForTimeout(500)
    
    // Check if mobile menu toggle is visible
    const mobileToggleExists = await this.elementExists(this.selectors.mobileMenuToggle)
    if (!mobileToggleExists) {
      throw new Error('Mobile menu toggle not found in mobile viewport')
    }
    
    // Open mobile menu
    await this.clickElement(this.selectors.mobileMenuToggle)
    await this.page.waitForTimeout(300)
    
    // Verify navigation items are accessible
    const navItems = await this.page.locator(this.selectors.navigationItems).count()
    if (navItems === 0) {
      throw new Error('Navigation items not accessible in mobile menu')
    }
    
    // Close mobile menu
    await this.clickElement(this.selectors.mobileMenuToggle)
  }

  /**
   * Test quick access cards interaction
   */
  async testQuickAccessCards(): Promise<{ [key: string]: boolean }> {
    const results = {
      matrix: false,
      network: false,
      visualizations: false,
      glossary: false,
      progress: false,
      exam: false
    }
    
    // Test matrix card
    if (await this.elementExists(this.selectors.matrixCard)) {
      await this.clickElement(this.selectors.matrixCard, { screenshot: true })
      await this.page.waitForTimeout(1000)
      results.matrix = this.page.url().includes('#/matrix')
      await this.page.goBack()
    }
    
    // Test network card
    if (await this.elementExists(this.selectors.networkCard)) {
      await this.clickElement(this.selectors.networkCard)
      await this.page.waitForTimeout(1000)
      results.network = this.page.url().includes('#/network')
      await this.page.goBack()
    }
    
    // Test visualizations card
    if (await this.elementExists(this.selectors.visualizationsCard)) {
      await this.clickElement(this.selectors.visualizationsCard)
      await this.page.waitForTimeout(1000)
      results.visualizations = this.page.url().includes('#/visualizations')
      await this.page.goBack()
    }
    
    // Test glossary card
    if (await this.elementExists(this.selectors.glossaryCard)) {
      await this.clickElement(this.selectors.glossaryCard)
      await this.page.waitForTimeout(1000)
      results.glossary = this.page.url().includes('#/glossary')
      await this.page.goBack()
    }
    
    return results
  }

  /**
   * Verify user dashboard preview (authenticated users)
   */
  async verifyUserDashboard(): Promise<{ hasPreview: boolean; hasActivity: boolean; hasStreak: boolean }> {
    const hasPreview = await this.elementExists(this.selectors.dashboardPreview, 2000)
    
    if (!hasPreview) {
      return { hasPreview: false, hasActivity: false, hasStreak: false }
    }
    
    const hasActivity = await this.elementExists(this.selectors.recentActivity, 1000)
    const hasStreak = await this.elementExists(this.selectors.studyStreak, 1000)
    
    return { hasPreview, hasActivity, hasStreak }
  }

  /**
   * Test page performance under load
   */
  async testPerformanceUnderLoad(): Promise<any> {
    const performanceMetrics = []
    
    // Simulate multiple rapid interactions
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now()
      
      // Quick navigation test
      await this.clickElement(this.selectors.matrixCard)
      await this.page.goBack()
      await this.waitForPageLoad()
      
      const interactionTime = Date.now() - startTime
      performanceMetrics.push({
        iteration: i + 1,
        interactionTime,
        timestamp: new Date().toISOString()
      })
      
      await this.page.waitForTimeout(100)
    }
    
    return {
      averageInteractionTime: performanceMetrics.reduce((sum, m) => sum + m.interactionTime, 0) / performanceMetrics.length,
      maxInteractionTime: Math.max(...performanceMetrics.map(m => m.interactionTime)),
      minInteractionTime: Math.min(...performanceMetrics.map(m => m.interactionTime)),
      metrics: performanceMetrics
    }
  }

  /**
   * Verify SEO and meta information
   */
  async verifySEOElements(): Promise<{ title: string; description: string; keywords: string }> {
    const title = await this.getTitle()
    
    const description = await this.page.getAttribute('meta[name="description"]', 'content') || ''
    const keywords = await this.page.getAttribute('meta[name="keywords"]', 'content') || ''
    
    return { title, description, keywords }
  }

  /**
   * Test keyboard navigation accessibility
   */
  async testKeyboardNavigation(): Promise<boolean> {
    try {
      // Focus on first interactive element
      await this.page.keyboard.press('Tab')
      await this.page.waitForTimeout(100)
      
      // Navigate through key elements
      const focusableElements = [
        this.selectors.ctaButton,
        this.selectors.matrixCard,
        this.selectors.networkCard,
        this.selectors.visualizationsCard,
        this.selectors.glossaryCard
      ]
      
      for (const element of focusableElements) {
        if (await this.elementExists(element)) {
          // Check if element can receive focus
          await this.page.locator(element).focus()
          const isFocused = await this.page.locator(element).evaluate(el => document.activeElement === el)
          
          if (!isFocused) {
            console.warn(`Element ${element} cannot be focused via keyboard`)
            return false
          }
        }
      }
      
      return true
    } catch (error) {
      console.error('Keyboard navigation test failed:', error)
      return false
    }
  }

  // Private helper methods
  private async getCurrentTheme(): Promise<string> {
    return await this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    })
  }

  private async getProcessCount(): Promise<number> {
    try {
      const text = await this.getTextContent(this.selectors.processCount)
      return parseInt(text.match(/\d+/)?.[0] || '0')
    } catch {
      return 0
    }
  }

  private async getNavigationItemCount(): Promise<number> {
    try {
      return await this.page.locator(this.selectors.navigationItems).count()
    } catch {
      return 0
    }
  }

  private async measurePageMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      return {
        interactivityTime: navigation.domInteractive - navigation.navigationStart,
        visualStability: performance.getEntriesByName('CLS')[0]?.value || 0
      }
    })
  }
}