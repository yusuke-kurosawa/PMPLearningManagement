/**
 * Service Worker Type Definitions
 * Extends built-in TypeScript definitions for Service Worker API
 */

interface ServiceWorkerRegistration {
  scope: string
  updateViaCache: 'all' | 'imports' | 'none'
  active: ServiceWorker | null
  installing: ServiceWorker | null
  waiting: ServiceWorker | null

  // Event handlers
  onupdatefound: ((this: ServiceWorkerRegistration, ev: Event) => void) | null

  // Methods
  getNotifications(filter?: GetNotificationOptions): Promise<Notification[]>
  showNotification(title: string, options?: NotificationOptions): Promise<void>
  update(): Promise<void>
  unregister(): Promise<boolean>

  // Push Manager
  pushManager: PushManager

  // Navigation Preload Manager
  navigationPreload?: NavigationPreloadManager

  // Background Sync
  sync?: SyncManager

  // Periodic Background Sync
  periodicSync?: PeriodicSyncManager

  // Payment Handler
  paymentManager?: PaymentManager

  // Content Index
  index?: ContentIndex
}

interface SyncManager {
  getTags(): Promise<string[]>
  register(tag: string): Promise<void>
}

interface PeriodicSyncManager {
  getTags(): Promise<string[]>
  register(tag: string, options?: { minInterval: number }): Promise<void>
  unregister(tag: string): Promise<void>
}

interface PaymentManager {
  userHint?: string
  instruments: PaymentInstruments
}

interface PaymentInstruments {
  delete(instrumentKey: string): Promise<boolean>
  get(instrumentKey: string): Promise<PaymentInstrument | undefined>
  keys(): Promise<string[]>
  has(instrumentKey: string): Promise<boolean>
  set(instrumentKey: string, details: PaymentInstrument): Promise<void>
  clear(): Promise<void>
}

interface PaymentInstrument {
  name: string
  icons: ImageObject[]
  method: string
  capabilities?: object
}

interface ImageObject {
  src: string
  sizes?: string
  type?: string
}

interface ContentIndex {
  add(entries: ContentIndexEntry): Promise<void>
  delete(id: string): Promise<void>
  getAll(): Promise<ContentIndexEntry[]>
}

interface ContentIndexEntry {
  id: string
  title: string
  description: string
  category: 'homepage' | 'article' | 'video' | 'audio' | ''
  icons?: ImageObject[]
  url: string
}

interface NavigationPreloadManager {
  enable(): Promise<void>
  disable(): Promise<void>
  setHeaderValue(value: string): Promise<void>
  getState(): Promise<NavigationPreloadState>
}

interface NavigationPreloadState {
  enabled: boolean
  headerValue: string
}

interface GetNotificationOptions {
  tag?: string
}

// Extend Window interface for Service Worker properties
interface _Window {
  ServiceWorkerRegistration?: {
    prototype: ServiceWorkerRegistration
    new (): ServiceWorkerRegistration
  }
}

// Extend Navigator interface
interface _Navigator {
  serviceWorker?: ServiceWorkerContainer
}

interface ServiceWorkerContainer {
  controller: ServiceWorker | null
  ready: Promise<ServiceWorkerRegistration>

  getRegistration(scope?: string): Promise<ServiceWorkerRegistration | undefined>
  getRegistrations(): Promise<ServiceWorkerRegistration[]>
  register(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>

  oncontrollerchange: ((this: ServiceWorkerContainer, ev: Event) => void) | null
  onmessage: ((this: ServiceWorkerContainer, ev: MessageEvent) => void) | null
  onmessageerror: ((this: ServiceWorkerContainer, ev: MessageEvent) => void) | null
}

interface RegistrationOptions {
  scope?: string
  type?: 'classic' | 'module'
  updateViaCache?: 'all' | 'imports' | 'none'
}

// Export types for use in other files
export type {
  ServiceWorkerRegistration,
  SyncManager,
  PeriodicSyncManager,
  PaymentManager,
  PaymentInstruments,
  PaymentInstrument,
  ContentIndex,
  ContentIndexEntry,
  NavigationPreloadManager,
  NavigationPreloadState,
  GetNotificationOptions,
  ServiceWorkerContainer,
  RegistrationOptions,
}
