/**
 * Self-Healing Test Automation System
 * Uses AI-powered element detection and recovery strategies
 */

import { Page, Locator } from '@playwright/test'
import { ElementDetectionAI } from './ElementDetectionAI'
import { TestRecoveryStrategies } from './TestRecoveryStrategies'

export interface SelfHealingConfig {
  enableAIDetection: boolean
  enableVisualRecovery: boolean
  enableSemanticAnalysis: boolean
  maxRecoveryAttempts: number
  confidenceThreshold: number
  learningEnabled: boolean
}

export interface ElementLocator {
  selector: string
  alternativeSelectors: string[]
  semanticDescription: string
  visualSignature?: string
  role?: string
  label?: string
  confidence: number
}

export interface RecoveryResult {
  success: boolean
  newSelector: string
  confidence: number
  strategy: string
  attempts: number
  timeSpent: number
}

export class SelfHealingAutomation {
  private page: Page
  private config: SelfHealingConfig
  private elementAI: ElementDetectionAI
  private recoveryStrategies: TestRecoveryStrategies
  private elementRegistry: Map<string, ElementLocator>
  private failureHistory: Map<string, number>
  private successfulRecoveries: Map<string, RecoveryResult>

  constructor(page: Page, config: Partial<SelfHealingConfig> = {}) {
    this.page = page
    this.config = {
      enableAIDetection: true,
      enableVisualRecovery: true,
      enableSemanticAnalysis: true,
      maxRecoveryAttempts: 3,
      confidenceThreshold: 0.8,
      learningEnabled: true,
      ...config,
    }

    this.elementAI = new ElementDetectionAI(page)
    this.recoveryStrategies = new TestRecoveryStrategies(page)
    this.elementRegistry = new Map()
    this.failureHistory = new Map()
    this.successfulRecoveries = new Map()
  }

  async initialize(): Promise<void> {
    // Initialize AI models and training data
    await this.elementAI.initialize()
    await this.loadElementRegistry()
    await this.loadHistoricalData()
  }

  /**
   * Smart element locator with self-healing capabilities
   */
  async locateElement(identifier: string, fallbackSelector?: string): Promise<Locator | null> {
    const startTime = Date.now()
    let attempts = 0

    // Try registered selector first
    let elementLocator = this.elementRegistry.get(identifier)

    if (!elementLocator && fallbackSelector) {
      elementLocator = {
        selector: fallbackSelector,
        alternativeSelectors: [],
        semanticDescription: identifier,
        confidence: 0.5,
      }
    }

    if (!elementLocator) {
      // Use AI to detect element by description
      if (this.config.enableAIDetection) {
        elementLocator = await this.elementAI.detectElementByDescription(identifier)
      } else {
        return null
      }
    }

    while (attempts < this.config.maxRecoveryAttempts) {
      attempts++

      try {
        // Try primary selector
        const element = this.page.locator(elementLocator.selector)

        if (await this.isElementVisible(element)) {
          // Update success stats
          if (attempts > 1) {
            this.recordSuccessfulRecovery(identifier, {
              success: true,
              newSelector: elementLocator.selector,
              confidence: elementLocator.confidence,
              strategy: 'primary-selector',
              attempts,
              timeSpent: Date.now() - startTime,
            })
          }
          return element
        }
      } catch (error) {
        console.log(`Primary selector failed for ${identifier}:`, error.message)
      }

      // Try alternative selectors
      for (const altSelector of elementLocator.alternativeSelectors) {
        try {
          const element = this.page.locator(altSelector)
          if (await this.isElementVisible(element)) {
            // Update element registry with successful alternative
            await this.updateElementRegistry(identifier, altSelector)

            this.recordSuccessfulRecovery(identifier, {
              success: true,
              newSelector: altSelector,
              confidence: elementLocator.confidence,
              strategy: 'alternative-selector',
              attempts,
              timeSpent: Date.now() - startTime,
            })

            return element
          }
        } catch (error) {
          continue
        }
      }

      // Apply recovery strategies
      const recoveryResult = await this.applyRecoveryStrategies(identifier, elementLocator)

      if (recoveryResult.success) {
        // Update element registry with recovered selector
        await this.updateElementRegistry(identifier, recoveryResult.newSelector)

        this.recordSuccessfulRecovery(identifier, recoveryResult)

        return this.page.locator(recoveryResult.newSelector)
      }

      // Wait before next attempt
      await this.page.waitForTimeout(1000 * attempts)
    }

    // Record failure
    this.recordFailure(identifier)
    return null
  }

  /**
   * Apply various recovery strategies to find elements
   */
  private async applyRecoveryStrategies(
    identifier: string,
    elementLocator: ElementLocator
  ): Promise<RecoveryResult> {
    const startTime = Date.now()

    // Strategy 1: Semantic Analysis Recovery
    if (this.config.enableSemanticAnalysis) {
      const semanticResult = await this.recoveryStrategies.semanticAnalysisRecovery(
        elementLocator.semanticDescription
      )

      if (semanticResult.success) {
        return {
          ...semanticResult,
          strategy: 'semantic-analysis',
          timeSpent: Date.now() - startTime,
          attempts: 1,
        }
      }
    }

    // Strategy 2: Visual Pattern Recognition
    if (this.config.enableVisualRecovery && elementLocator.visualSignature) {
      const visualResult = await this.recoveryStrategies.visualPatternRecovery(
        elementLocator.visualSignature
      )

      if (visualResult.success) {
        return {
          ...visualResult,
          strategy: 'visual-pattern',
          timeSpent: Date.now() - startTime,
          attempts: 1,
        }
      }
    }

    // Strategy 3: Role-based Recovery
    if (elementLocator.role) {
      const roleResult = await this.recoveryStrategies.roleBasedRecovery(
        elementLocator.role,
        elementLocator.label
      )

      if (roleResult.success) {
        return {
          ...roleResult,
          strategy: 'role-based',
          timeSpent: Date.now() - startTime,
          attempts: 1,
        }
      }
    }

    // Strategy 4: Text Content Recovery
    const textResult = await this.recoveryStrategies.textContentRecovery(identifier)
    if (textResult.success) {
      return {
        ...textResult,
        strategy: 'text-content',
        timeSpent: Date.now() - startTime,
        attempts: 1,
      }
    }

    // Strategy 5: Layout-based Recovery
    const layoutResult = await this.recoveryStrategies.layoutBasedRecovery(elementLocator)
    if (layoutResult.success) {
      return {
        ...layoutResult,
        strategy: 'layout-based',
        timeSpent: Date.now() - startTime,
        attempts: 1,
      }
    }

    // Strategy 6: AI-powered Smart Detection
    if (this.config.enableAIDetection) {
      const aiResult = await this.elementAI.smartElementDetection({
        description: elementLocator.semanticDescription,
        role: elementLocator.role,
        visualSignature: elementLocator.visualSignature,
        previousSelectors: [elementLocator.selector, ...elementLocator.alternativeSelectors],
      })

      if (aiResult.confidence > this.config.confidenceThreshold) {
        return {
          success: true,
          newSelector: aiResult.selector,
          confidence: aiResult.confidence,
          strategy: 'ai-detection',
          attempts: 1,
          timeSpent: Date.now() - startTime,
        }
      }
    }

    return {
      success: false,
      newSelector: '',
      confidence: 0,
      strategy: 'none',
      attempts: 1,
      timeSpent: Date.now() - startTime,
    }
  }

  /**
   * Check if element is visible and interactable
   */
  private async isElementVisible(element: Locator): Promise<boolean> {
    try {
      await element.waitFor({ state: 'visible', timeout: 5000 })
      return await element.isVisible()
    } catch (error) {
      return false
    }
  }

  /**
   * Update element registry with successful selector
   */
  private async updateElementRegistry(identifier: string, newSelector: string): Promise<void> {
    let elementLocator = this.elementRegistry.get(identifier)

    if (!elementLocator) {
      elementLocator = {
        selector: newSelector,
        alternativeSelectors: [],
        semanticDescription: identifier,
        confidence: 0.8,
      }
    } else {
      // Move current selector to alternatives and update primary
      if (elementLocator.selector !== newSelector) {
        elementLocator.alternativeSelectors.unshift(elementLocator.selector)
        elementLocator.selector = newSelector
        elementLocator.confidence = Math.min(elementLocator.confidence + 0.1, 1.0)
      }
    }

    this.elementRegistry.set(identifier, elementLocator)

    // Save to persistent storage if learning is enabled
    if (this.config.learningEnabled) {
      await this.saveElementRegistry()
    }
  }

  /**
   * Register element for future self-healing
   */
  async registerElement(
    identifier: string,
    selector: string,
    options: {
      semanticDescription?: string
      role?: string
      label?: string
      alternativeSelectors?: string[]
    } = {}
  ): Promise<void> {
    const elementLocator: ElementLocator = {
      selector,
      alternativeSelectors: options.alternativeSelectors || [],
      semanticDescription: options.semanticDescription || identifier,
      role: options.role,
      label: options.label,
      confidence: 1.0,
    }

    // Capture visual signature if visual recovery is enabled
    if (this.config.enableVisualRecovery) {
      try {
        const element = this.page.locator(selector)
        if (await element.isVisible()) {
          elementLocator.visualSignature = await this.captureVisualSignature(element)
        }
      } catch (error) {
        console.log(`Could not capture visual signature for ${identifier}:`, error.message)
      }
    }

    this.elementRegistry.set(identifier, elementLocator)

    if (this.config.learningEnabled) {
      await this.saveElementRegistry()
    }
  }

  /**
   * Capture visual signature of element for pattern recognition
   */
  private async captureVisualSignature(element: Locator): Promise<string> {
    try {
      const boundingBox = await element.boundingBox()
      if (!boundingBox) {
        return ''
      }

      // Take screenshot of element area
      const screenshot = await this.page.screenshot({
        clip: boundingBox,
        type: 'png',
      })

      // Generate visual hash/signature
      return await this.elementAI.generateVisualSignature(screenshot)
    } catch (error) {
      return ''
    }
  }

  /**
   * Record successful recovery for learning
   */
  private recordSuccessfulRecovery(identifier: string, result: RecoveryResult): void {
    this.successfulRecoveries.set(identifier, result)

    // Reset failure count
    this.failureHistory.set(identifier, 0)
  }

  /**
   * Record element location failure
   */
  private recordFailure(identifier: string): void {
    const currentFailures = this.failureHistory.get(identifier) || 0
    this.failureHistory.set(identifier, currentFailures + 1)
  }

  /**
   * Get healing statistics
   */
  getHealingStatistics() {
    const totalRecoveries = this.successfulRecoveries.size
    const totalFailures = Array.from(this.failureHistory.values()).reduce(
      (sum, count) => sum + count,
      0
    )

    const strategyStats = new Map<string, number>()
    for (const recovery of this.successfulRecoveries.values()) {
      const current = strategyStats.get(recovery.strategy) || 0
      strategyStats.set(recovery.strategy, current + 1)
    }

    return {
      totalRecoveries,
      totalFailures,
      successRate: totalRecoveries / (totalRecoveries + totalFailures),
      strategyBreakdown: Object.fromEntries(strategyStats),
      averageRecoveryTime:
        Array.from(this.successfulRecoveries.values()).reduce((sum, r) => sum + r.timeSpent, 0) /
        totalRecoveries,
    }
  }

  /**
   * Load element registry from persistent storage
   */
  private async loadElementRegistry(): Promise<void> {
    try {
      // In real implementation, this would load from file or database
      const stored = localStorage.getItem('selfhealing-element-registry')
      if (stored) {
        const data = JSON.parse(stored)
        this.elementRegistry = new Map(Object.entries(data))
      }
    } catch (error) {
      console.log('Could not load element registry:', error.message)
    }
  }

  /**
   * Save element registry to persistent storage
   */
  private async saveElementRegistry(): Promise<void> {
    try {
      const data = Object.fromEntries(this.elementRegistry)
      localStorage.setItem('selfhealing-element-registry', JSON.stringify(data))
    } catch (error) {
      console.log('Could not save element registry:', error.message)
    }
  }

  /**
   * Load historical failure/success data
   */
  private async loadHistoricalData(): Promise<void> {
    try {
      // Load failure history
      const failureData = localStorage.getItem('selfhealing-failure-history')
      if (failureData) {
        this.failureHistory = new Map(Object.entries(JSON.parse(failureData)))
      }

      // Load successful recoveries
      const recoveryData = localStorage.getItem('selfhealing-recoveries')
      if (recoveryData) {
        this.successfulRecoveries = new Map(Object.entries(JSON.parse(recoveryData)))
      }
    } catch (error) {
      console.log('Could not load historical data:', error.message)
    }
  }

  /**
   * Cleanup and save data when test session ends
   */
  async cleanup(): Promise<void> {
    if (this.config.learningEnabled) {
      await this.saveElementRegistry()

      // Save historical data
      try {
        localStorage.setItem(
          'selfhealing-failure-history',
          JSON.stringify(Object.fromEntries(this.failureHistory))
        )

        localStorage.setItem(
          'selfhealing-recoveries',
          JSON.stringify(Object.fromEntries(this.successfulRecoveries))
        )
      } catch (error) {
        console.log('Could not save historical data:', error.message)
      }
    }
  }
}

// Example usage in tests:
/*
const selfHealing = new SelfHealingAutomation(page);
await selfHealing.initialize();

// Register critical elements
await selfHealing.registerElement('login-button', '[data-testid="login-btn"]', {
  semanticDescription: 'Login button for user authentication',
  role: 'button',
  label: 'Login',
  alternativeSelectors: ['#login-btn', '.login-button', 'button:has-text("Login")']
});

// Use self-healing locator
const loginButton = await selfHealing.locateElement('login-button');
if (loginButton) {
  await loginButton.click();
} else {
  throw new Error('Could not locate login button even with self-healing');
}
*/

export default SelfHealingAutomation
