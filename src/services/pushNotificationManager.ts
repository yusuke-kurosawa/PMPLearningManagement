/**
 * Push Notification Manager
 * Advanced PWA notification system with intelligent study reminders
 */

interface NotificationData {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  url?: string
  actions?: NotificationAction[]
  data?: Record<string, any>
  timestamp?: number
}

interface StudyReminder {
  type: 'daily' | 'weekly' | 'exam-prep' | 'flashcard-review' | 'progress-check'
  title: string
  message: string
  time: string // HH:MM format
  days: number[] // 0-6, Sunday to Saturday
  enabled: boolean
  lastSent?: Date
}

interface NotificationSettings {
  enabled: boolean
  studyReminders: boolean
  progressUpdates: boolean
  examAlerts: boolean
  achievementNotifications: boolean
  offlineSync: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
  }
  frequency: 'high' | 'medium' | 'low'
}

interface NotificationSchedule {
  id: string
  type: string
  scheduledTime: Date
  reminder: StudyReminder
  sent: boolean
}

class PushNotificationManager {
  private isSupported: boolean = false
  private permission: NotificationPermission = 'default'
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  private settings: NotificationSettings = {
    enabled: false,
    studyReminders: true,
    progressUpdates: true,
    examAlerts: true,
    achievementNotifications: true,
    offlineSync: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
    },
    frequency: 'medium',
  }

  private studyReminders: StudyReminder[] = [
    {
      type: 'daily',
      title: 'Daily Study Time',
      message: "Ready to continue your PMP journey? Let's study for 30 minutes!",
      time: '19:00',
      days: [1, 2, 3, 4, 5], // Monday to Friday
      enabled: true,
    },
    {
      type: 'weekly',
      title: 'Weekly Progress Check',
      message: 'Time to review your weekly progress and plan ahead!',
      time: '10:00',
      days: [0], // Sunday
      enabled: true,
    },
    {
      type: 'flashcard-review',
      title: 'Flashcard Review',
      message: 'Quick flashcard session to reinforce your knowledge!',
      time: '12:00',
      days: [1, 3, 5], // Mon, Wed, Fri
      enabled: true,
    },
  ]

  private scheduledNotifications: Map<string, NotificationSchedule> = new Map()
  private notificationQueue: NotificationData[] = []

  constructor() {
    this.initializeNotificationSystem()
    this.loadSettings()
    this.setupServiceWorkerListeners()
    this.scheduleReminders()
  }

  /**
   * Initialize notification system
   */
  private async initializeNotificationSystem(): Promise<void> {
    // Check for notification support
    this.isSupported =
      'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

    if (!this.isSupported) {
      console.warn('[PushNotificationManager] Push notifications not supported')
      return
    }

    // Get current permission
    this.permission = Notification.permission

    // Get service worker registration
    try {
      this.registration = await navigator.serviceWorker.ready
      console.log('[PushNotificationManager] Service worker ready')
    } catch (error) {
      console.error('[PushNotificationManager] Service worker not available:', error)
    }

    // Get existing subscription
    if (this.registration) {
      try {
        this.subscription = await this.registration.pushManager.getSubscription()
        if (this.subscription) {
          console.log('[PushNotificationManager] Existing push subscription found')
        }
      } catch (error) {
        console.error('[PushNotificationManager] Failed to get existing subscription:', error)
      }
    }
  }

  /**
   * Setup service worker message listeners
   */
  private setupServiceWorkerListeners(): void {
    if (!this.isSupported || !navigator.serviceWorker) {
      return
    }

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data

      switch (type) {
        case 'NOTIFICATION_CLICK':
          this.handleNotificationClick(data)
          break
        case 'NOTIFICATION_CLOSE':
          this.handleNotificationClose(data)
          break
        case 'BACKGROUND_SYNC':
          this.handleBackgroundSync(data)
          break
      }
    })
  }

  /**
   * Load settings from storage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('notification-settings')
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) }
      }

      const storedReminders = localStorage.getItem('study-reminders')
      if (storedReminders) {
        this.studyReminders = JSON.parse(storedReminders)
      }
    } catch (error) {
      console.error('[PushNotificationManager] Failed to load settings:', error)
    }
  }

  /**
   * Save settings to storage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('notification-settings', JSON.stringify(this.settings))
      localStorage.setItem('study-reminders', JSON.stringify(this.studyReminders))
    } catch (error) {
      console.error('[PushNotificationManager] Failed to save settings:', error)
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported')
    }

    try {
      this.permission = await Notification.requestPermission()

      if (this.permission === 'granted') {
        this.settings.enabled = true
        this.saveSettings()
        await this.subscribeToPush()
        this.scheduleReminders()
        console.log('[PushNotificationManager] Permission granted')
        return true
      } else {
        console.log('[PushNotificationManager] Permission denied')
        return false
      }
    } catch (error) {
      console.error('[PushNotificationManager] Permission request failed:', error)
      return false
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPush(): Promise<void> {
    if (!this.registration || this.subscription) {
      return
    }

    try {
      // Convert VAPID key (you would get this from your backend)
      const vapidPublicKey =
        process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80YiTRgJ_KQIXQ...' // Truncated for example

      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey)

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription)

      console.log('[PushNotificationManager] Successfully subscribed to push')
    } catch (error) {
      console.error('[PushNotificationManager] Failed to subscribe to push:', error)
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // In a real app, you would send this to your backend
    console.log('[PushNotificationManager] Would send subscription to server:', subscription)

    // For now, store locally
    try {
      localStorage.setItem('push-subscription', JSON.stringify(subscription.toJSON()))
    } catch (error) {
      console.error('[PushNotificationManager] Failed to store subscription:', error)
    }
  }

  /**
   * Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Schedule study reminders
   */
  private scheduleReminders(): void {
    if (!this.settings.enabled || !this.settings.studyReminders) {
      return
    }

    // Clear existing schedules
    this.scheduledNotifications.clear()

    this.studyReminders
      .filter((reminder) => reminder.enabled)
      .forEach((reminder) => {
        this.scheduleReminder(reminder)
      })

    // Set up daily check for sending notifications
    setInterval(() => {
      this.checkAndSendScheduledNotifications()
    }, 60000) // Check every minute
  }

  /**
   * Schedule individual reminder
   */
  private scheduleReminder(reminder: StudyReminder): void {
    reminder.days.forEach((day) => {
      const now = new Date()
      const scheduledTime = new Date()

      // Set to next occurrence of this day and time
      const daysUntilNext = (day - now.getDay() + 7) % 7
      scheduledTime.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext))

      const [hours, minutes] = reminder.time.split(':').map(Number)
      scheduledTime.setHours(hours, minutes, 0, 0)

      // If it's today and the time has passed, schedule for next week
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 7)
      }

      const scheduleId = `${reminder.type}-${day}-${reminder.time}`

      this.scheduledNotifications.set(scheduleId, {
        id: scheduleId,
        type: reminder.type,
        scheduledTime,
        reminder,
        sent: false,
      })
    })
  }

  /**
   * Check and send scheduled notifications
   */
  private checkAndSendScheduledNotifications(): void {
    const now = new Date()

    this.scheduledNotifications.forEach((schedule, id) => {
      if (!schedule.sent && schedule.scheduledTime <= now) {
        // Check quiet hours
        if (this.isInQuietHours(now)) {
          console.log('[PushNotificationManager] Skipping notification due to quiet hours')
          return
        }

        // Check if already sent recently
        if (
          schedule.reminder.lastSent &&
          now.getTime() - schedule.reminder.lastSent.getTime() < 2 * 60 * 60 * 1000
        ) {
          // 2 hours
          return
        }

        this.sendStudyReminder(schedule.reminder)

        // Mark as sent and update last sent time
        schedule.sent = true
        schedule.reminder.lastSent = now

        // Schedule next occurrence
        const nextTime = new Date(schedule.scheduledTime)
        nextTime.setDate(nextTime.getDate() + 7) // Next week

        this.scheduledNotifications.set(id, {
          ...schedule,
          scheduledTime: nextTime,
          sent: false,
        })
      }
    })
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(time: Date): boolean {
    if (!this.settings.quietHours.enabled) {
      return false
    }

    const currentHour = time.getHours()
    const currentMinute = time.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const [startHour, startMinute] = this.settings.quietHours.start.split(':').map(Number)
    const [endHour, endMinute] = this.settings.quietHours.end.split(':').map(Number)

    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    if (startTime <= endTime) {
      // Same day range (e.g., 14:00 to 18:00)
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Overnight range (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  /**
   * Send study reminder
   */
  private async sendStudyReminder(reminder: StudyReminder): Promise<void> {
    const notificationData: NotificationData = {
      id: `reminder-${Date.now()}`,
      title: reminder.title,
      body: reminder.message,
      icon: '/PMPLearningManagement/icons/icon-192x192.png',
      badge: '/PMPLearningManagement/icons/icon-72x72.png',
      tag: reminder.type,
      url: '/PMPLearningManagement/#/study',
      actions: [
        {
          action: 'study-now',
          title: 'Study Now',
          icon: '/PMPLearningManagement/icons/study-icon.png',
        },
        {
          action: 'remind-later',
          title: 'Remind Later',
          icon: '/PMPLearningManagement/icons/remind-icon.png',
        },
      ],
      data: {
        type: reminder.type,
        reminderTime: reminder.time,
        timestamp: Date.now(),
      },
    }

    await this.sendNotification(notificationData)
  }

  /**
   * Send notification
   */
  private async sendNotification(data: NotificationData): Promise<void> {
    if (!this.settings.enabled || this.permission !== 'granted') {
      return
    }

    try {
      if (this.registration && this.subscription) {
        // Send via service worker for background notifications
        await this.registration.showNotification(data.title, {
          body: data.body,
          icon: data.icon,
          badge: data.badge,
          image: data.image,
          tag: data.tag,
          renotify: true,
          requireInteraction: false,
          vibrate: [200, 100, 200],
          data: data.data,
          actions: data.actions,
        })
      } else {
        // Fallback to direct notification
        const notification = new Notification(data.title, {
          body: data.body,
          icon: data.icon,
          tag: data.tag,
          data: data.data,
        })

        notification.onclick = () => {
          window.focus()
          if (data.url) {
            window.location.href = data.url
          }
          notification.close()
        }
      }

      console.log('[PushNotificationManager] Notification sent:', data.title)
    } catch (error) {
      console.error('[PushNotificationManager] Failed to send notification:', error)
    }
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(data: any): void {
    console.log('[PushNotificationManager] Notification clicked:', data)

    // Track interaction
    this.trackNotificationInteraction('click', data)
  }

  /**
   * Handle notification close
   */
  private handleNotificationClose(data: any): void {
    console.log('[PushNotificationManager] Notification closed:', data)

    // Track interaction
    this.trackNotificationInteraction('close', data)
  }

  /**
   * Handle background sync
   */
  private handleBackgroundSync(data: any): void {
    console.log('[PushNotificationManager] Background sync:', data)

    if (this.settings.offlineSync) {
      // Process offline notifications
      this.processOfflineNotifications()
    }
  }

  /**
   * Process offline notification queue
   */
  private processOfflineNotifications(): void {
    if (this.notificationQueue.length === 0) {
      return
    }

    console.log(
      `[PushNotificationManager] Processing ${this.notificationQueue.length} queued notifications`
    )

    this.notificationQueue.forEach(async (data) => {
      await this.sendNotification(data)
    })

    this.notificationQueue = []
  }

  /**
   * Track notification interaction
   */
  private trackNotificationInteraction(type: 'click' | 'close', data: any): void {
    try {
      const interaction = {
        type,
        notificationId: data.id || 'unknown',
        timestamp: Date.now(),
        data,
      }

      const stored = localStorage.getItem('notification-interactions') || '[]'
      const interactions = JSON.parse(stored)
      interactions.push(interaction)

      // Keep only last 100 interactions
      if (interactions.length > 100) {
        interactions.splice(0, interactions.length - 100)
      }

      localStorage.setItem('notification-interactions', JSON.stringify(interactions))
    } catch (error) {
      console.error('[PushNotificationManager] Failed to track interaction:', error)
    }
  }

  // Public API

  /**
   * Get notification support status
   */
  isNotificationSupported(): boolean {
    return this.isSupported
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()

    // Reschedule reminders if study reminders setting changed
    if ('studyReminders' in newSettings) {
      this.scheduleReminders()
    }
  }

  /**
   * Get study reminders
   */
  getStudyReminders(): StudyReminder[] {
    return [...this.studyReminders]
  }

  /**
   * Update study reminders
   */
  updateStudyReminders(reminders: StudyReminder[]): void {
    this.studyReminders = reminders
    this.saveSettings()
    this.scheduleReminders()
  }

  /**
   * Send immediate notification
   */
  async sendImmediateNotification(data: NotificationData): Promise<void> {
    if (!navigator.onLine && this.settings.enabled) {
      // Queue for later if offline
      this.notificationQueue.push(data)
      return
    }

    await this.sendNotification(data)
  }

  /**
   * Send progress notification
   */
  async sendProgressNotification(progress: {
    completed: number
    total: number
    milestone?: string
  }): Promise<void> {
    if (!this.settings.progressUpdates) {
      return
    }

    const percentage = Math.round((progress.completed / progress.total) * 100)

    const data: NotificationData = {
      id: `progress-${Date.now()}`,
      title: progress.milestone ? `Milestone Achieved!` : `Study Progress Update`,
      body: progress.milestone || `You've completed ${percentage}% of your study plan. Keep going!`,
      icon: '/PMPLearningManagement/icons/icon-192x192.png',
      tag: 'progress-update',
      url: '/PMPLearningManagement/#/progress',
      data: {
        type: 'progress',
        completed: progress.completed,
        total: progress.total,
        percentage,
      },
    }

    await this.sendImmediateNotification(data)
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(achievement: {
    title: string
    description: string
  }): Promise<void> {
    if (!this.settings.achievementNotifications) {
      return
    }

    const data: NotificationData = {
      id: `achievement-${Date.now()}`,
      title: `🎉 ${achievement.title}`,
      body: achievement.description,
      icon: '/PMPLearningManagement/icons/achievement-icon.png',
      tag: 'achievement',
      url: '/PMPLearningManagement/#/achievements',
      data: {
        type: 'achievement',
        achievement,
      },
    }

    await this.sendImmediateNotification(data)
  }

  /**
   * Send exam alert
   */
  async sendExamAlert(examInfo: { date: Date; daysLeft: number }): Promise<void> {
    if (!this.settings.examAlerts) {
      return
    }

    const data: NotificationData = {
      id: `exam-alert-${Date.now()}`,
      title: `PMP Exam Reminder`,
      body: `Your exam is in ${examInfo.daysLeft} days. Time to intensify your preparation!`,
      icon: '/PMPLearningManagement/icons/exam-icon.png',
      tag: 'exam-alert',
      url: '/PMPLearningManagement/#/exam-prep',
      data: {
        type: 'exam-alert',
        examDate: examInfo.date.toISOString(),
        daysLeft: examInfo.daysLeft,
      },
    }

    await this.sendImmediateNotification(data)
  }

  /**
   * Test notification system
   */
  async sendTestNotification(): Promise<void> {
    const data: NotificationData = {
      id: `test-${Date.now()}`,
      title: 'Test Notification',
      body: 'This is a test notification from PMP Learning Management!',
      icon: '/PMPLearningManagement/icons/icon-192x192.png',
      tag: 'test',
      data: {
        type: 'test',
        timestamp: Date.now(),
      },
    }

    await this.sendImmediateNotification(data)
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): {
    totalSent: number
    clickRate: number
    lastSent?: Date
    mostEngagingType: string
  } {
    try {
      const interactions = JSON.parse(localStorage.getItem('notification-interactions') || '[]')

      const clicks = interactions.filter((i: any) => i.type === 'click')
      const total = interactions.length

      const typeStats = interactions.reduce((acc: any, interaction: any) => {
        const type = interaction.data?.type || 'unknown'
        acc[type] = (acc[type] || 0) + (interaction.type === 'click' ? 1 : 0)
        return acc
      }, {})

      const mostEngagingType =
        Object.entries(typeStats).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] ||
        'none'

      const lastSent = this.studyReminders
        .map((r) => r.lastSent)
        .filter(Boolean)
        .sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))[0]

      return {
        totalSent: total,
        clickRate: total > 0 ? clicks.length / total : 0,
        lastSent,
        mostEngagingType,
      }
    } catch (error) {
      console.error('[PushNotificationManager] Failed to get stats:', error)
      return {
        totalSent: 0,
        clickRate: 0,
        mostEngagingType: 'none',
      }
    }
  }

  /**
   * Unsubscribe from notifications
   */
  async unsubscribe(): Promise<void> {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe()
        this.subscription = null
        this.settings.enabled = false
        this.saveSettings()

        // Clear scheduled notifications
        this.scheduledNotifications.clear()

        console.log('[PushNotificationManager] Unsubscribed from notifications')
      } catch (error) {
        console.error('[PushNotificationManager] Failed to unsubscribe:', error)
      }
    }
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    // Clear all scheduled notifications
    this.scheduledNotifications.clear()
    this.notificationQueue = []

    console.log('[PushNotificationManager] Destroyed')
  }
}

// Create singleton instance
export const pushNotificationManager = new PushNotificationManager()
export default pushNotificationManager
