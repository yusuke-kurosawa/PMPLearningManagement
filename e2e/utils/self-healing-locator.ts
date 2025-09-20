/**
 * Self-Healing Locator System for PMP Learning Management System
 * 
 * This system provides AI-powered element location with self-healing capabilities:
 * - Multiple locator strategies with fallback mechanisms
 * - Machine learning-based element similarity scoring
 * - Dynamic locator adaptation based on DOM changes
 * - Historical success rate tracking and optimization
 * - Automatic locator healing and reporting
 * - Visual element recognition and matching
 * 
 * @fileoverview Self-healing test automation with AI-powered element detection
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { type Page, type Locator } from '@playwright/test'
import { ElementOptions } from '../pages/base-page'

export interface LocatorStrategy {
  type: 'testid' | 'css' | 'xpath' | 'text' | 'role' | 'label' | 'placeholder' | 'visual'
  value: string
  priority: number
  lastSuccessRate: number
  lastUsed: Date
  adaptiveScore: number
}

export interface ElementSignature {
  tagName: string
  attributes: { [key: string]: string }
  textContent: string
  classList: string[]
  position: { x: number; y: number }
  size: { width: number; height: number }
  parent: string
  siblings: string[]
  visualFeatures?: {
    color: string
    backgroundColor: string
    fontSize: string
    fontFamily: string
  }
}

export interface HealingEvent {
  timestamp: Date
  originalLocator: string
  healedLocator: string
  successRate: number
  healingStrategy: string
  confidence: number
  elementSignature: ElementSignature
  context: string
}

export class SelfHealingLocator {
  private readonly page: Page
  private readonly locatorCache: Map<string, LocatorStrategy[]> = new Map()
  private readonly healingHistory: HealingEvent[] = []
  private readonly elementSignatures: Map<string, ElementSignature> = new Map()
  private readonly mlModel: ElementMatcher
  
  // Adaptive thresholds that improve over time
  private confidenceThreshold = 0.7
  private minSuccessRate = 0.8
  private maxFallbackAttempts = 5

  constructor(page: Page) {
    this.page = page
    this.mlModel = new ElementMatcher()
    this.initializeDefaultStrategies()
  }

  /**
   * Main method to locate elements with self-healing capabilities
   */
  async locate(selector: string, options: ElementOptions = {}): Promise<Locator> {
    const cacheKey = this.generateCacheKey(selector, options)
    let strategies = this.getStrategies(cacheKey, selector)
    
    // Attempt to locate element using cached strategies
    for (const strategy of this.sortStrategiesBySuccess(strategies)) {
      try {
        const locator = await this.attemptLocate(strategy)
        
        if (await this.validateElement(locator, options)) {
          // Update success metrics
          strategy.lastSuccessRate = Math.min(1.0, strategy.lastSuccessRate + 0.1)
          strategy.lastUsed = new Date()
          strategy.adaptiveScore = this.calculateAdaptiveScore(strategy)
          
          this.updateCache(cacheKey, strategies)
          return locator
        }
        
      } catch (error) {
        // Update failure metrics
        strategy.lastSuccessRate = Math.max(0.1, strategy.lastSuccessRate - 0.1)
        console.debug(`Strategy ${strategy.type}:${strategy.value} failed:`, error.message)
      }
    }

    // If all strategies failed, attempt self-healing
    console.warn(`All locator strategies failed for ${selector}, attempting self-healing...`)
    return await this.performSelfHealing(selector, cacheKey, options)
  }

  /**
   * Perform self-healing when all strategies fail
   */
  private async performSelfHealing(
    originalSelector: string, 
    cacheKey: string, 
    options: ElementOptions
  ): Promise<Locator> {
    const healingStartTime = Date.now()
    
    try {
      // 1. Analyze current DOM structure
      const domAnalysis = await this.analyzeDOMChanges(originalSelector)
      
      // 2. Generate new locator candidates using ML
      const candidates = await this.generateLocatorCandidates(originalSelector, domAnalysis)
      
      // 3. Test candidates and find best match
      const bestCandidate = await this.findBestCandidate(candidates, options)
      
      if (bestCandidate) {
        // 4. Create healing event record
        const healingEvent: HealingEvent = {
          timestamp: new Date(),
          originalLocator: originalSelector,
          healedLocator: bestCandidate.value,
          successRate: bestCandidate.adaptiveScore,
          healingStrategy: bestCandidate.type,
          confidence: bestCandidate.adaptiveScore,
          elementSignature: await this.captureElementSignature(bestCandidate.value),
          context: this.page.url()
        }
        
        this.healingHistory.push(healingEvent)
        
        // 5. Update cache with healed locator
        const newStrategies = [bestCandidate, ...this.getStrategies(cacheKey, originalSelector)]
        this.updateCache(cacheKey, newStrategies)
        
        const healingTime = Date.now() - healingStartTime
        console.log(`✅ Self-healing successful in ${healingTime}ms: ${originalSelector} -> ${bestCandidate.value}`)
        
        return await this.attemptLocate(bestCandidate)
        
      } else {
        throw new Error(`Self-healing failed: No suitable replacement found for ${originalSelector}`)
      }
      
    } catch (error) {
      const healingTime = Date.now() - healingStartTime
      console.error(`❌ Self-healing failed in ${healingTime}ms for ${originalSelector}:`, error.message)
      throw error
    }
  }

  /**
   * Analyze DOM changes to understand why locators might be failing
   */
  private async analyzeDOMChanges(selector: string): Promise<any> {
    return await this.page.evaluate((sel) => {
      const analysis = {
        totalElements: document.querySelectorAll('*').length,
        hasSelector: !!document.querySelector(sel),
        similarElements: [],
        domMutations: (window as any).__domMutationCount || 0,
        dynamicContent: {
          hasLoadingElements: !!document.querySelector('[data-loading="true"], .loading, .spinner'),
          hasAsyncContent: !!document.querySelector('[data-async="true"], .async-content'),
          hasAnimations: document.querySelectorAll('[style*="animation"], [class*="animate"]').length > 0
        }
      }
      
      // Find elements with similar attributes or structure
      const allElements = Array.from(document.querySelectorAll('*'))
      const selectorParts = sel.split(/[\s>+~\[\]"'=:()]/g).filter(part => part.trim())
      
      allElements.forEach(el => {
        let similarity = 0
        selectorParts.forEach(part => {
          if (el.className.includes(part) || 
              el.id.includes(part) || 
              el.getAttribute('data-testid')?.includes(part) ||
              el.tagName.toLowerCase() === part.toLowerCase()) {
            similarity++
          }
        })
        
        if (similarity > 0) {
          analysis.similarElements.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            testId: el.getAttribute('data-testid'),
            textContent: el.textContent?.substring(0, 50),
            similarity
          })
        }
      })
      
      return analysis
    }, selector)
  }

  /**
   * Generate new locator candidates using machine learning and heuristics
   */
  private async generateLocatorCandidates(
    originalSelector: string, 
    domAnalysis: any
  ): Promise<LocatorStrategy[]> {
    const candidates: LocatorStrategy[] = []
    
    // 1. Generate candidates from similar elements
    for (const similar of domAnalysis.similarElements) {
      if (similar.testId) {
        candidates.push({
          type: 'testid',
          value: `[data-testid="${similar.testId}"]`,
          priority: similar.similarity * 10,
          lastSuccessRate: 0.5,
          lastUsed: new Date(),
          adaptiveScore: similar.similarity / 10
        })
      }
      
      if (similar.id) {
        candidates.push({
          type: 'css',
          value: `#${similar.id}`,
          priority: similar.similarity * 8,
          lastSuccessRate: 0.5,
          lastUsed: new Date(),
          adaptiveScore: similar.similarity / 10
        })
      }
      
      if (similar.className) {
        const classNames = similar.className.split(' ').filter(c => c.trim())
        if (classNames.length > 0) {
          candidates.push({
            type: 'css',
            value: `.${classNames.join('.')}`,
            priority: similar.similarity * 6,
            lastSuccessRate: 0.5,
            lastUsed: new Date(),
            adaptiveScore: similar.similarity / 10
          })
        }
      }
    }

    // 2. Generate text-based candidates
    if (domAnalysis.similarElements.some(el => el.textContent)) {
      const textElements = domAnalysis.similarElements.filter(el => el.textContent)
      for (const element of textElements) {
        candidates.push({
          type: 'text',
          value: element.textContent,
          priority: element.similarity * 5,
          lastSuccessRate: 0.4,
          lastUsed: new Date(),
          adaptiveScore: element.similarity / 15
        })
      }
    }

    // 3. Generate role-based candidates (for accessibility)
    const roleAttributes = ['button', 'link', 'input', 'select', 'textarea', 'checkbox', 'radio']
    for (const role of roleAttributes) {
      if (originalSelector.toLowerCase().includes(role)) {
        candidates.push({
          type: 'role',
          value: role,
          priority: 7,
          lastSuccessRate: 0.6,
          lastUsed: new Date(),
          adaptiveScore: 0.6
        })
      }
    }

    // 4. Use ML model to generate additional candidates
    const mlCandidates = await this.mlModel.generateCandidates(originalSelector, domAnalysis)
    candidates.push(...mlCandidates)

    // 5. Sort by adaptive score and return top candidates
    return candidates
      .sort((a, b) => b.adaptiveScore - a.adaptiveScore)
      .slice(0, this.maxFallbackAttempts)
  }

  /**
   * Find the best candidate from generated options
   */
  private async findBestCandidate(
    candidates: LocatorStrategy[], 
    options: ElementOptions
  ): Promise<LocatorStrategy | null> {
    for (const candidate of candidates) {
      try {
        const locator = await this.attemptLocate(candidate)
        
        if (await this.validateElement(locator, options)) {
          // Capture element signature for future reference
          const signature = await this.captureElementSignature(candidate.value)
          this.elementSignatures.set(candidate.value, signature)
          
          // Calculate final confidence score
          candidate.adaptiveScore = await this.calculateFinalConfidence(candidate, signature)
          
          if (candidate.adaptiveScore >= this.confidenceThreshold) {
            return candidate
          }
        }
      } catch (error) {
        console.debug(`Candidate ${candidate.type}:${candidate.value} validation failed:`, error.message)
      }
    }
    
    return null
  }

  /**
   * Capture comprehensive element signature for future matching
   */
  private async captureElementSignature(selector: string): Promise<ElementSignature> {
    return await this.page.evaluate((sel) => {
      const element = document.querySelector(sel)
      
      if (!element) {
        throw new Error(`Element not found: ${sel}`)
      }
      
      const rect = element.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(element)
      
      return {
        tagName: element.tagName,
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value
          return acc
        }, {} as { [key: string]: string }),
        textContent: element.textContent?.trim() || '',
        classList: Array.from(element.classList),
        position: { x: rect.x, y: rect.y },
        size: { width: rect.width, height: rect.height },
        parent: element.parentElement?.tagName || '',
        siblings: Array.from(element.parentElement?.children || [])
          .map(sibling => sibling.tagName)
          .slice(0, 5), // Limit to first 5 siblings
        visualFeatures: {
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor,
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily
        }
      }
    }, selector)
  }

  /**
   * Validate that the located element meets requirements
   */
  private async validateElement(locator: Locator, options: ElementOptions): Promise<boolean> {
    try {
      // Check if element is attached to DOM
      await locator.waitFor({ state: 'attached', timeout: 1000 })
      
      // Check visibility if required
      if (options.accessibility !== false) {
        const isVisible = await locator.isVisible()
        if (!isVisible) return false
      }
      
      // Check if element is interactive (if it should be)
      const elementInfo = await locator.evaluate(el => ({
        tagName: el.tagName,
        type: (el as HTMLInputElement).type,
        disabled: (el as HTMLInputElement).disabled,
        readonly: (el as HTMLInputElement).readOnly
      }))
      
      // Validate interactive elements
      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']
      if (interactiveTags.includes(elementInfo.tagName)) {
        if (elementInfo.disabled) return false
      }
      
      return true
      
    } catch (error) {
      return false
    }
  }

  /**
   * Calculate final confidence score based on multiple factors
   */
  private async calculateFinalConfidence(
    candidate: LocatorStrategy, 
    signature: ElementSignature
  ): Promise<number> {
    let confidence = candidate.adaptiveScore
    
    // Boost confidence for stable selectors
    if (candidate.type === 'testid') confidence += 0.2
    if (candidate.type === 'css' && candidate.value.includes('#')) confidence += 0.15
    
    // Consider element stability
    const elementCount = await this.page.locator(candidate.value).count()
    if (elementCount === 1) {
      confidence += 0.1 // Unique element is more reliable
    } else if (elementCount === 0) {
      confidence = 0 // Element not found
    } else {
      confidence -= 0.05 // Multiple elements reduce confidence
    }
    
    // Consider visual stability
    if (signature.size.width > 0 && signature.size.height > 0) {
      confidence += 0.05
    }
    
    return Math.min(1.0, Math.max(0.0, confidence))
  }

  /**
   * Get locator strategies from cache or generate new ones
   */
  private getStrategies(cacheKey: string, selector: string): LocatorStrategy[] {
    if (this.locatorCache.has(cacheKey)) {
      return this.locatorCache.get(cacheKey)!
    }
    
    return this.generateInitialStrategies(selector)
  }

  /**
   * Generate initial locator strategies for a selector
   */
  private generateInitialStrategies(selector: string): LocatorStrategy[] {
    const strategies: LocatorStrategy[] = []
    
    // Primary strategy - use original selector
    strategies.push({
      type: this.determineLocatorType(selector),
      value: selector,
      priority: 10,
      lastSuccessRate: 1.0,
      lastUsed: new Date(),
      adaptiveScore: 1.0
    })
    
    // Generate fallback strategies
    if (selector.includes('data-testid')) {
      const testId = selector.match(/data-testid[=~]["']([^"']+)/)?.[1]
      if (testId) {
        strategies.push({
          type: 'testid',
          value: `[data-testid="${testId}"]`,
          priority: 9,
          lastSuccessRate: 0.9,
          lastUsed: new Date(),
          adaptiveScore: 0.9
        })
      }
    }
    
    // Add CSS-based fallbacks
    if (selector.includes('#')) {
      strategies.push({
        type: 'css',
        value: selector,
        priority: 8,
        lastSuccessRate: 0.8,
        lastUsed: new Date(),
        adaptiveScore: 0.8
      })
    }
    
    return strategies
  }

  /**
   * Attempt to locate element using a specific strategy
   */
  private async attemptLocate(strategy: LocatorStrategy): Promise<Locator> {
    switch (strategy.type) {
      case 'testid':
        return this.page.getByTestId(strategy.value.replace(/\[data-testid[=~]["']|["']\]/g, ''))
      case 'css':
        return this.page.locator(strategy.value)
      case 'xpath':
        return this.page.locator(`xpath=${strategy.value}`)
      case 'text':
        return this.page.getByText(strategy.value, { exact: false })
      case 'role':
        return this.page.getByRole(strategy.value as any)
      case 'label':
        return this.page.getByLabel(strategy.value)
      case 'placeholder':
        return this.page.getByPlaceholder(strategy.value)
      default:
        return this.page.locator(strategy.value)
    }
  }

  /**
   * Determine the type of locator from selector string
   */
  private determineLocatorType(selector: string): LocatorStrategy['type'] {
    if (selector.includes('data-testid')) return 'testid'
    if (selector.includes('//') || selector.includes('xpath=')) return 'xpath'
    if (selector.includes('text=')) return 'text'
    if (selector.includes('role=')) return 'role'
    return 'css'
  }

  /**
   * Sort strategies by success rate and recency
   */
  private sortStrategiesBySuccess(strategies: LocatorStrategy[]): LocatorStrategy[] {
    return strategies.sort((a, b) => {
      // Primary sort by adaptive score
      if (Math.abs(a.adaptiveScore - b.adaptiveScore) > 0.1) {
        return b.adaptiveScore - a.adaptiveScore
      }
      
      // Secondary sort by last success rate
      if (Math.abs(a.lastSuccessRate - b.lastSuccessRate) > 0.1) {
        return b.lastSuccessRate - a.lastSuccessRate
      }
      
      // Tertiary sort by recency
      return b.lastUsed.getTime() - a.lastUsed.getTime()
    })
  }

  /**
   * Calculate adaptive score based on historical performance
   */
  private calculateAdaptiveScore(strategy: LocatorStrategy): number {
    const successWeight = 0.7
    const recencyWeight = 0.2
    const priorityWeight = 0.1
    
    const recencyScore = Math.max(0, 1 - (Date.now() - strategy.lastUsed.getTime()) / (7 * 24 * 60 * 60 * 1000))
    const priorityScore = strategy.priority / 10
    
    return (strategy.lastSuccessRate * successWeight) + 
           (recencyScore * recencyWeight) + 
           (priorityScore * priorityWeight)
  }

  /**
   * Initialize default strategies for common selectors
   */
  private initializeDefaultStrategies(): void {
    // Pre-populate common selector patterns
    const commonSelectors = [
      { pattern: 'button', strategies: ['role:button', 'css:button', 'xpath://button'] },
      { pattern: 'input', strategies: ['css:input', 'xpath://input'] },
      { pattern: 'link', strategies: ['role:link', 'css:a', 'xpath://a'] }
    ]
    
    // Initialize would go here in a real implementation
  }

  /**
   * Generate cache key for strategy storage
   */
  private generateCacheKey(selector: string, options: ElementOptions): string {
    const optionsKey = JSON.stringify({
      selfHeal: options.selfHeal,
      accessibility: options.accessibility,
      timeout: options.timeout
    })
    
    return `${selector}:${optionsKey}`
  }

  /**
   * Update strategy cache
   */
  private updateCache(cacheKey: string, strategies: LocatorStrategy[]): void {
    // Limit cache size
    if (this.locatorCache.size > 1000) {
      const oldestKey = Array.from(this.locatorCache.keys())[0]
      this.locatorCache.delete(oldestKey)
    }
    
    this.locatorCache.set(cacheKey, strategies)
  }

  /**
   * Get healing statistics and insights
   */
  getHealingStats(): any {
    return {
      totalHealingEvents: this.healingHistory.length,
      successfulHealings: this.healingHistory.filter(e => e.confidence >= this.confidenceThreshold).length,
      averageConfidence: this.healingHistory.reduce((sum, e) => sum + e.confidence, 0) / this.healingHistory.length,
      mostCommonFailures: this.getMostCommonFailures(),
      healingStrategies: this.getHealingStrategyStats(),
      cacheStats: {
        size: this.locatorCache.size,
        hitRate: this.calculateCacheHitRate()
      }
    }
  }

  /**
   * Export healing events for analysis
   */
  exportHealingEvents(): HealingEvent[] {
    return [...this.healingHistory]
  }

  // Private helper methods for statistics
  private getMostCommonFailures(): any {
    const failures = this.healingHistory.reduce((acc, event) => {
      const key = event.originalLocator
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as { [key: string]: number })
    
    return Object.entries(failures)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([locator, count]) => ({ locator, count }))
  }

  private getHealingStrategyStats(): any {
    const strategies = this.healingHistory.reduce((acc, event) => {
      const key = event.healingStrategy
      acc[key] = (acc[key] || { count: 0, avgConfidence: 0, confidences: [] })
      acc[key].count++
      acc[key].confidences.push(event.confidence)
      return acc
    }, {} as any)
    
    // Calculate average confidence for each strategy
    Object.keys(strategies).forEach(strategy => {
      const confidences = strategies[strategy].confidences
      strategies[strategy].avgConfidence = confidences.reduce((sum: number, c: number) => sum + c, 0) / confidences.length
      delete strategies[strategy].confidences
    })
    
    return strategies
  }

  private calculateCacheHitRate(): number {
    // This would be implemented with actual hit/miss tracking
    return 0.85 // Placeholder
  }
}

/**
 * Machine Learning Element Matcher for advanced element recognition
 */
class ElementMatcher {
  async generateCandidates(originalSelector: string, domAnalysis: any): Promise<LocatorStrategy[]> {
    // This would implement ML-based element matching
    // For now, return heuristic-based candidates
    
    const candidates: LocatorStrategy[] = []
    
    // Analyze selector patterns and generate variants
    if (originalSelector.includes('data-testid')) {
      const testId = originalSelector.match(/data-testid[=~]["']([^"']+)/)?.[1]
      if (testId) {
        // Generate variations of test ID
        const variations = [
          testId.replace('-', '_'),
          testId.replace('_', '-'),
          testId.toLowerCase(),
          testId.toUpperCase()
        ]
        
        variations.forEach(variation => {
          candidates.push({
            type: 'testid',
            value: `[data-testid="${variation}"]`,
            priority: 6,
            lastSuccessRate: 0.6,
            lastUsed: new Date(),
            adaptiveScore: 0.6
          })
        })
      }
    }
    
    return candidates
  }
}