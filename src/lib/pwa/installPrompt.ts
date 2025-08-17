import { logger } from '../../services/logger'

// 型定義の追加
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
  getInstalledRelatedApps?: () => Promise<unknown[]>
}

/**
 * PWA Install Prompt Manager
 * Developer 6: PWA & Mobile Developer Implementation
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface InstallPromptConfig {
  showAfterVisits: number
  showAfterDays: number
  maxDismissals: number
  minEngagementTime: number // milliseconds
  supportedPlatforms: string[]
}

interface InstallPromptState {
  canInstall: boolean
  isInstalled: boolean
  isStandalone: boolean
  dismissalCount: number
  firstVisit: Date
  lastPromptShown: Date | null
  userEngagementTime: number
  visitCount: number
}

class PWAInstallPromptManager {
  private config: InstallPromptConfig
  private state: InstallPromptState
  private promptEvent: BeforeInstallPromptEvent | null = null
  private callbacks: {
    onPromptReady?: () => void
    onInstalled?: () => void
    onDismissed?: () => void
    onStateChange?: (state: InstallPromptState) => void
  } = {}
  private engagementStartTime: number = 0
  private storageKey = 'pwa-install-prompt-state'

  constructor(config: Partial<InstallPromptConfig> = {}) {
    this.config = {
      showAfterVisits: 3,
      showAfterDays: 1,
      maxDismissals: 3,
      minEngagementTime: 30000, // 30 seconds
      supportedPlatforms: ['Android', 'Windows'],
      ...config,
    }

    this.state = this.loadState()
    this.initialize()
  }

  private initialize(): void {
    this.checkInstallationStatus()
    this.setupEventListeners()
    this.trackEngagement()
    this.updateVisitCount()
  }

  private checkInstallationStatus(): void {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as NavigatorWithStandalone).standalone ||
      document.referrer.includes('android-app://')

    const isInstalled =
      isStandalone ||
      (window.navigator as NavigatorWithStandalone)
        .getInstalledRelatedApps?.()
        .then((apps: unknown[]) => apps.length > 0)

    this.updateState({
      isStandalone,
      isInstalled: Boolean(isInstalled),
    })
  }

  private setupEventListeners(): void {
    // Listen for install prompt event
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this))

    // Listen for app installation
    window.addEventListener('appinstalled', this.handleAppInstalled.bind(this))

    // Listen for visibility changes to track engagement
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

    // Listen for user interactions to measure engagement
    ;['click', 'scroll', 'keydown'].forEach((eventType) => {
      document.addEventListener(eventType, this.trackUserInteraction.bind(this), { passive: true })
    })

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.updateState({ isStandalone: e.matches })
    })
  }

  private handleBeforeInstallPrompt(event: BeforeInstallPromptEvent): void {
    // Prevent the default install prompt
    event.preventDefault()

    this.promptEvent = event
    this.updateState({ canInstall: true })

    if (process.env.NODE_ENV === 'development') {
      logger.debug('PWA Install Prompt: Ready to show install prompt')
    }
    this.callbacks.onPromptReady?.()
  }

  private handleAppInstalled(): void {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('PWA Install Prompt: App installed successfully')
    }

    this.promptEvent = null
    this.updateState({
      isInstalled: true,
      canInstall: false,
      dismissalCount: 0,
    })

    this.callbacks.onInstalled?.()
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stopEngagementTracking()
    } else {
      this.startEngagementTracking()
    }
  }

  private trackUserInteraction(): void {
    // Reset engagement timer on user interaction
    this.startEngagementTracking()
  }

  private startEngagementTracking(): void {
    this.engagementStartTime = Date.now()
  }

  private stopEngagementTracking(): void {
    if (this.engagementStartTime > 0) {
      const sessionTime = Date.now() - this.engagementStartTime
      this.updateState({
        userEngagementTime: this.state.userEngagementTime + sessionTime,
      })
      this.engagementStartTime = 0
    }
  }

  private trackEngagement(): void {
    this.startEngagementTracking()

    // Save engagement time periodically
    setInterval(() => {
      if (this.engagementStartTime > 0) {
        this.stopEngagementTracking()
        this.startEngagementTracking()
        this.saveState()
      }
    }, 10000) // Every 10 seconds
  }

  private updateVisitCount(): void {
    const today = new Date().toDateString()
    const lastVisit = localStorage.getItem('pwa-last-visit')

    if (lastVisit !== today) {
      this.updateState({ visitCount: this.state.visitCount + 1 })
      localStorage.setItem('pwa-last-visit', today)
    }
  }

  private updateState(updates: Partial<InstallPromptState>): void {
    this.state = { ...this.state, ...updates }
    this.saveState()
    this.callbacks.onStateChange?.(this.state)
  }

  private loadState(): InstallPromptState {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          firstVisit: new Date(parsed.firstVisit),
          lastPromptShown: parsed.lastPromptShown ? new Date(parsed.lastPromptShown) : null,
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA Install Prompt: Failed to load state:', error)
      }
    }

    // Default state
    return {
      canInstall: false,
      isInstalled: false,
      isStandalone: false,
      dismissalCount: 0,
      firstVisit: new Date(),
      lastPromptShown: null,
      userEngagementTime: 0,
      visitCount: 1,
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA Install Prompt: Failed to save state:', error)
      }
    }
  }

  // Public Methods

  public canShowPrompt(): boolean {
    if (!this.state.canInstall || this.state.isInstalled) {
      return false
    }

    // Check dismissal limit
    if (this.state.dismissalCount >= this.config.maxDismissals) {
      return false
    }

    // Check visit count requirement
    if (this.state.visitCount < this.config.showAfterVisits) {
      return false
    }

    // Check time since first visit
    const daysSinceFirstVisit =
      (Date.now() - this.state.firstVisit.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceFirstVisit < this.config.showAfterDays) {
      return false
    }

    // Check engagement time
    if (this.state.userEngagementTime < this.config.minEngagementTime) {
      return false
    }

    // Check time since last prompt (cooldown period)
    if (this.state.lastPromptShown) {
      const hoursSinceLastPrompt =
        (Date.now() - this.state.lastPromptShown.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastPrompt < 24) {
        // 24 hour cooldown
        return false
      }
    }

    return true
  }

  public async showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.promptEvent) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('PWA Install Prompt: No install prompt event available')
      }
      return 'unavailable'
    }

    if (!this.canShowPrompt()) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('PWA Install Prompt: Conditions not met to show prompt')
      }
      return 'unavailable'
    }

    try {
      // Show the install prompt
      await this.promptEvent.prompt()

      // Update state
      this.updateState({ lastPromptShown: new Date() })

      // Wait for user choice
      const userChoice = await this.promptEvent.userChoice

      if (process.env.NODE_ENV === 'development') {
        logger.debug('PWA Install Prompt: User choice:', userChoice.outcome)
      }

      if (userChoice.outcome === 'dismissed') {
        this.updateState({
          dismissalCount: this.state.dismissalCount + 1,
        })
        this.callbacks.onDismissed?.()
      }

      // Clear the prompt event as it can only be used once
      this.promptEvent = null
      this.updateState({ canInstall: false })

      return userChoice.outcome
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA Install Prompt: Failed to show prompt:', error)
      }
      return 'unavailable'
    }
  }

  public dismissPrompt(): void {
    this.updateState({
      dismissalCount: this.state.dismissalCount + 1,
      lastPromptShown: new Date(),
    })
    this.callbacks.onDismissed?.()
  }

  public resetDismissals(): void {
    this.updateState({ dismissalCount: 0 })
  }

  public getInstallationScore(): number {
    // Calculate a score from 0-100 based on user behavior
    let score = 0

    // Engagement time (0-40 points)
    const engagementRatio = Math.min(1, this.state.userEngagementTime / (5 * 60 * 1000)) // 5 minutes max
    score += engagementRatio * 40

    // Visit frequency (0-30 points)
    const visitRatio = Math.min(1, this.state.visitCount / 10) // 10 visits max
    score += visitRatio * 30

    // Days since first visit (0-20 points)
    const daysSinceFirstVisit =
      (Date.now() - this.state.firstVisit.getTime()) / (1000 * 60 * 60 * 24)
    const daysRatio = Math.min(1, daysSinceFirstVisit / 7) // 7 days max
    score += daysRatio * 20

    // Penalty for dismissals (0-10 points penalty)
    score -= this.state.dismissalCount * 10

    return Math.max(0, Math.min(100, score))
  }

  public getState(): InstallPromptState {
    return { ...this.state }
  }

  public getConfig(): InstallPromptConfig {
    return { ...this.config }
  }

  public onPromptReady(callback: () => void): void {
    this.callbacks.onPromptReady = callback
  }

  public onInstalled(callback: () => void): void {
    this.callbacks.onInstalled = callback
  }

  public onDismissed(callback: () => void): void {
    this.callbacks.onDismissed = callback
  }

  public onStateChange(callback: (state: InstallPromptState) => void): void {
    this.callbacks.onStateChange = callback
  }

  public destroy(): void {
    // Stop engagement tracking
    this.stopEngagementTracking()

    // Remove event listeners
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this))
    window.removeEventListener('appinstalled', this.handleAppInstalled.bind(this))
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    ;['click', 'scroll', 'keydown'].forEach((eventType) => {
      document.removeEventListener(eventType, this.trackUserInteraction.bind(this))
    })

    // Save final state
    this.saveState()

    // Clear callbacks
    this.callbacks = {}
  }
}

// Singleton instance
let installPromptManager: PWAInstallPromptManager | null = null

export const __getInstallPromptManager = (
  config?: Partial<InstallPromptConfig>
): PWAInstallPromptManager => {
  if (!installPromptManager) {
    installPromptManager = new PWAInstallPromptManager(config)
  }
  return installPromptManager
}

export type { InstallPromptConfig, InstallPromptState, BeforeInstallPromptEvent }
export { PWAInstallPromptManager }
