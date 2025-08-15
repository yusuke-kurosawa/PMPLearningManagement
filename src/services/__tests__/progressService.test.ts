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
      expect(result.current.progress.completedProcesses).toBe(0)
      expect(result.current.progress.totalProcesses).toBeGreaterThan(0)
      expect(result.current.progress.studyTime).toBe(0)
    })

    it('should load existing progress data from localStorage', () => {
      const existingProgress = {
        completedProcesses: ['4.1', '4.2', '5.1'],
        processProgress: {
          4.1: { completed: true, studyTime: 30, lastStudied: '2025-08-08T10:00:00Z' },
          4.2: { completed: true, studyTime: 45, lastStudied: '2025-08-08T10:30:00Z' },
          5.1: { completed: true, studyTime: 25, lastStudied: '2025-08-08T11:00:00Z' },
        },
        totalStudyTime: 100,
        lastStudyDate: '2025-08-08T11:00:00Z',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingProgress))

      const { result } = renderHook(() => useProgress())

      expect(result.current.progress.completedProcesses).toBe(3)
      expect(result.current.progress.studyTime).toBe(100)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pmp_learning_progress')
    })

    it('should mark a process as completed', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useProgress())

      act(() => {
        result.current.markProcessComplete('4.1')
      })

      expect(result.current.progress.completedProcesses).toBe(1)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should record study time for a process', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useProgress())

      act(() => {
        result.current.recordStudyTime('4.1', 30)
      })

      expect(result.current.progress.studyTime).toBe(30)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should calculate knowledge area progress correctly', () => {
      const existingProgress = {
        completedProcesses: ['4.1', '4.2'], // 2 Integration Management processes
        processProgress: {
          4.1: { completed: true, studyTime: 30, lastStudied: '2025-08-08T10:00:00Z' },
          4.2: { completed: true, studyTime: 45, lastStudied: '2025-08-08T10:30:00Z' },
        },
        totalStudyTime: 75,
        lastStudyDate: '2025-08-08T10:30:00Z',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingProgress))

      const { result } = renderHook(() => useProgress())

      const integrationProgress =
        result.current.progress.knowledgeAreaProgress['Integration Management']
      expect(integrationProgress).toBeDefined()
      expect(integrationProgress.completed).toBeGreaterThan(0)
    })

    it('should reset progress when requested', () => {
      const existingProgress = {
        completedProcesses: ['4.1', '4.2'],
        processProgress: {
          4.1: { completed: true, studyTime: 30, lastStudied: '2025-08-08T10:00:00Z' },
          4.2: { completed: true, studyTime: 45, lastStudied: '2025-08-08T10:30:00Z' },
        },
        totalStudyTime: 75,
        lastStudyDate: '2025-08-08T10:30:00Z',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingProgress))

      const { result } = renderHook(() => useProgress())

      // Initial state should have progress
      expect(result.current.progress.completedProcesses).toBeGreaterThan(0)

      act(() => {
        result.current.resetProgress()
      })

      // After reset, progress should be cleared
      expect(result.current.progress.completedProcesses).toBe(0)
      expect(result.current.progress.studyTime).toBe(0)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'pmp_learning_progress',
        expect.stringContaining('{"completedProcesses":[]')
      )
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      const { result } = renderHook(() => useProgress())

      // Should still work with default values
      expect(result.current.progress).toBeDefined()
      expect(result.current.progress.completedProcesses).toBe(0)
    })

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const { result } = renderHook(() => useProgress())

      // Should fall back to default values
      expect(result.current.progress).toBeDefined()
      expect(result.current.progress.completedProcesses).toBe(0)
    })

    it('should update last study date when marking process complete', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useProgress())

      const beforeTime = Date.now()

      act(() => {
        result.current.markProcessComplete('4.1')
      })

      const afterTime = Date.now()

      expect(result.current.progress.lastStudyDate).toBeTruthy()
      const lastStudyTime = new Date(result.current.progress.lastStudyDate).getTime()
      expect(lastStudyTime).toBeGreaterThanOrEqual(beforeTime)
      expect(lastStudyTime).toBeLessThanOrEqual(afterTime)
    })
  })
})
