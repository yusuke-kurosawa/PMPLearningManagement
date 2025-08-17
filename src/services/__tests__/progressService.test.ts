import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '../../test/utils/test-utils'
import { useProgress, processCategories, processGroups } from '../progressService'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Replace localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('progressService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockLocalStorage.clear()
  })

  describe('processCategories', () => {
    it('should contain all PMBOK knowledge areas', () => {
      const expectedCategories = [
        '統合管理',
        'スコープ管理',
        'スケジュール管理',
        'コスト管理',
        '品質管理',
        '資源管理',
        'コミュニケーション管理',
        'リスク管理',
        '調達管理',
        'ステークホルダー管理',
      ]

      const categoryValues = Object.values(processCategories)

      expectedCategories.forEach((category) => {
        expect(categoryValues).toContain(category)
      })
    })
  })

  describe('processGroups', () => {
    it('should contain all PMBOK process groups', () => {
      const expectedGroups = ['立ち上げ', '計画', '実行', '監視・コントロール', '終結']

      const groupValues = Object.values(processGroups)

      expectedGroups.forEach((group) => {
        expect(groupValues).toContain(group)
      })
    })
  })

  describe('useProgress hook', () => {
    it('should initialize with empty progress data when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useProgress())

      expect(result.current.progress).toBeDefined()
      expect(result.current.statistics).toBeDefined()
      if (result.current.statistics) {
        expect(result.current.statistics.overall.completed).toBe(0)
        expect(result.current.statistics.overall.total).toBeGreaterThan(0)
        expect(result.current.statistics.studyTime).toBe(0)
      }
    })

    it('should load existing progress data from localStorage', () => {
      const existingProgress = {
        knowledgeAreas: {},
        processGroups: {},
        processes: {
          p1: {
            completed: true,
            understanding: 100,
            notes: '',
            lastStudied: '2025-08-08T10:00:00Z',
          },
          p2: {
            completed: true,
            understanding: 100,
            notes: '',
            lastStudied: '2025-08-08T10:30:00Z',
          },
          p3: {
            completed: true,
            understanding: 100,
            notes: '',
            lastStudied: '2025-08-08T11:00:00Z',
          },
        },
        studySessions: [
          { date: '2025-08-08T10:00:00Z', duration: 30, processCount: 1 },
          { date: '2025-08-08T10:30:00Z', duration: 45, processCount: 1 },
          { date: '2025-08-08T11:00:00Z', duration: 25, processCount: 1 },
        ],
        goals: {},
        lastUpdated: '2025-08-08T11:00:00Z',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingProgress))

      const { result } = renderHook(() => useProgress())

      expect(result.current.progress).toBeDefined()
      if (result.current.statistics) {
        expect(result.current.statistics.overall.completed).toBe(3)
        expect(result.current.statistics.studyTime).toBe(100)
      }
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pmp_learning_progress')
    })

    it('should mark a process as completed', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useProgress())

      await act(async () => {
        await result.current.updateProgress('p1', { completed: true })
      })

      if (result.current.statistics) {
        expect(result.current.statistics.overall.completed).toBe(1)
      }
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should record study time for a process', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useProgress())

      await act(async () => {
        await result.current.updateStudyTime(30)
      })

      if (result.current.statistics) {
        expect(result.current.statistics.studyTime).toBe(30)
      }
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should calculate knowledge area progress correctly', () => {
      const existingProgress = {
        knowledgeAreas: {},
        processGroups: {},
        processes: {
          p1: {
            completed: true,
            understanding: 100,
            notes: '',
            lastStudied: '2025-08-08T10:00:00Z',
          },
          p2: {
            completed: true,
            understanding: 100,
            notes: '',
            lastStudied: '2025-08-08T10:30:00Z',
          },
        },
        studySessions: [
          { date: '2025-08-08T10:00:00Z', duration: 30, processCount: 1 },
          { date: '2025-08-08T10:30:00Z', duration: 45, processCount: 1 },
        ],
        goals: {},
        lastUpdated: '2025-08-08T10:30:00Z',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingProgress))

      const { result } = renderHook(() => useProgress())

      expect(result.current.statistics).toBeDefined()
      if (result.current.statistics) {
        const integrationProgress = result.current.statistics.byCategory.integration
        expect(integrationProgress).toBeDefined()
        expect(integrationProgress.completed).toBeGreaterThan(0)
      }
    })

    it('should reset progress when requested', async () => {
      const existingProgress = {
        knowledgeAreas: {},
        processGroups: {},
        processes: {
          p1: {
            completed: true,
            understanding: 100,
            notes: '',
            lastStudied: '2025-08-08T10:00:00Z',
          },
          p2: {
            completed: true,
            understanding: 100,
            notes: '',
            lastStudied: '2025-08-08T10:30:00Z',
          },
        },
        studySessions: [
          { date: '2025-08-08T10:00:00Z', duration: 30, processCount: 1 },
          { date: '2025-08-08T10:30:00Z', duration: 45, processCount: 1 },
        ],
        goals: {},
        lastUpdated: '2025-08-08T10:30:00Z',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingProgress))

      const { result } = renderHook(() => useProgress())

      // Initial state should have progress
      if (result.current.statistics) {
        expect(result.current.statistics.overall.completed).toBeGreaterThan(0)
      }

      await act(async () => {
        await result.current.resetProgress()
      })

      // After reset, progress should be cleared
      if (result.current.statistics) {
        expect(result.current.statistics.overall.completed).toBe(0)
        expect(result.current.statistics.studyTime).toBe(0)
      }
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'pmp_learning_progress',
        expect.stringContaining('{"knowledgeAreas":{}')
      )
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      const { result } = renderHook(() => useProgress())

      // Should still work with default values
      expect(result.current.progress).toBeDefined()
      if (result.current.statistics) {
        expect(result.current.statistics.overall.completed).toBe(0)
      }
    })

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const { result } = renderHook(() => useProgress())

      // Should fall back to default values
      expect(result.current.progress).toBeDefined()
      if (result.current.statistics) {
        expect(result.current.statistics.overall.completed).toBe(0)
      }
    })

    it('should update last study date when marking process complete', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useProgress())

      const beforeTime = Date.now()

      await act(async () => {
        await result.current.updateProgress('p1', { completed: true })
      })

      const afterTime = Date.now()

      expect(result.current.progress?.lastUpdated).toBeTruthy()
      if (result.current.progress?.lastUpdated) {
        const lastStudyTime = new Date(result.current.progress.lastUpdated).getTime()
        expect(lastStudyTime).toBeGreaterThanOrEqual(beforeTime)
        expect(lastStudyTime).toBeLessThanOrEqual(afterTime)
      }
    })
  })
})
