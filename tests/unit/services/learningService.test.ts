import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import {
  LearningService,
  LearningStatsCalculator,
  studySessionSchema,
  learningGoalSchema,
  PMBOK_PROCESSES,
} from '@/server/services/learningService';
import { testDb, mockPrismaClient } from '../../utils/db';
import { createLearningProgress, createStudySession, createExamResult } from '../../factories/progressFactory';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: mockPrismaClient(),
}));

describe('LearningService', () => {
  beforeEach(() => {
    testDb.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LearningStatsCalculator', () => {
    describe('calculateCompletionRate', () => {
      test('should calculate completion rate correctly', () => {
        const completedProcesses = ['p1', 'p2', 'p3', 'p4', 'p5'];
        const rate = LearningStatsCalculator.calculateCompletionRate(completedProcesses);
        
        // 5 out of 49 processes = ~10%
        expect(rate).toBe(Math.round((5 / 49) * 100));
      });

      test('should handle empty completed processes', () => {
        const rate = LearningStatsCalculator.calculateCompletionRate([]);
        expect(rate).toBe(0);
      });

      test('should handle 100% completion', () => {
        const allProcesses = Array.from({ length: 49 }, (_, i) => `p${i + 1}`);
        const rate = LearningStatsCalculator.calculateCompletionRate(allProcesses);
        expect(rate).toBe(100);
      });
    });

    describe('calculateWeeklyHours', () => {
      test('should calculate weekly hours correctly', () => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const sessions = [
          createStudySession({ 
            duration: 3600, // 1 hour
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          }),
          createStudySession({ 
            duration: 1800, // 30 minutes
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          }),
          createStudySession({ 
            duration: 7200, // 2 hours (too old)
            createdAt: twoWeeksAgo,
          }),
        ];

        const weeklyHours = LearningStatsCalculator.calculateWeeklyHours(sessions);
        expect(weeklyHours).toBe(1.5); // 1.5 hours total
      });

      test('should handle sessions with null duration', () => {
        const sessions = [
          createStudySession({ duration: null, createdAt: new Date() }),
          createStudySession({ duration: 3600, createdAt: new Date() }),
        ];

        const weeklyHours = LearningStatsCalculator.calculateWeeklyHours(sessions);
        expect(weeklyHours).toBe(1); // Only count valid duration
      });
    });

    describe('calculateMonthlyHours', () => {
      test('should calculate monthly hours correctly', () => {
        const now = new Date();
        const sessions = [
          createStudySession({ 
            duration: 3600, 
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          }),
          createStudySession({ 
            duration: 1800,
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          }),
          createStudySession({ 
            duration: 7200,
            createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // Too old
          }),
        ];

        const monthlyHours = LearningStatsCalculator.calculateMonthlyHours(sessions);
        expect(monthlyHours).toBe(1.5); // 1.5 hours within 30 days
      });
    });

    describe('calculateKnowledgeAreaStats', () => {
      test('should calculate knowledge area statistics', () => {
        const sessions = [
          createStudySession({ 
            knowledgeArea: 'Integration',
            completed: true,
          }),
          createStudySession({ 
            knowledgeArea: 'Integration',
            completed: false,
          }),
          createStudySession({ 
            knowledgeArea: 'Scope',
            completed: true,
          }),
        ];

        const examResults = [
          createExamResult({
            knowledgeAreaScores: {
              Integration: 85,
              Scope: 75,
            },
          }),
        ];

        const stats = LearningStatsCalculator.calculateKnowledgeAreaStats(
          sessions,
          examResults
        );

        expect(stats.Integration.completed).toBe(1);
        expect(stats.Integration.averageScore).toBe(85);
        expect(stats.Scope.completed).toBe(1);
        expect(stats.Scope.averageScore).toBe(75);
      });

      test('should handle missing knowledge area scores', () => {
        const sessions = [
          createStudySession({ knowledgeArea: 'Integration', completed: true }),
        ];

        const examResults = [
          createExamResult({ knowledgeAreaScores: null }),
        ];

        const stats = LearningStatsCalculator.calculateKnowledgeAreaStats(
          sessions,
          examResults
        );

        expect(stats.Integration.averageScore).toBe(0);
      });
    });

    describe('calculateProcessGroupStats', () => {
      test('should calculate process group statistics', () => {
        const sessions = [
          createStudySession({ 
            processGroup: 'Initiating',
            completed: true,
          }),
          createStudySession({ 
            processGroup: 'Planning',
            completed: true,
          }),
        ];

        const examResults = [
          createExamResult({
            processGroupScores: {
              Initiating: 90,
              Planning: 80,
            },
          }),
        ];

        const stats = LearningStatsCalculator.calculateProcessGroupStats(
          sessions,
          examResults
        );

        expect(stats.Initiating.completed).toBe(1);
        expect(stats.Initiating.averageScore).toBe(90);
        expect(stats.Planning.completed).toBe(1);
        expect(stats.Planning.averageScore).toBe(80);
      });
    });
  });

  describe('getLearningProgress', () => {
    test('should return learning progress with statistics', async () => {
      const userId = 'user-123';
      const progress = createLearningProgress({
        userId,
        completedProcesses: ['p1', 'p2', 'p3'],
        totalStudyTime: 7200,
      });

      testDb.create('learningProgress', progress);

      const sessions = [
        createStudySession({ 
          userId,
          duration: 3600,
          knowledgeArea: 'Integration',
          completed: true,
        }),
      ];

      sessions.forEach(session => testDb.create('studySession', session));

      const examResults = [
        createExamResult({ userId, score: 85, passed: true }),
        createExamResult({ userId, score: 75, passed: true }),
      ];

      examResults.forEach(result => testDb.create('examResult', result));

      const result = await LearningService.getLearningProgress(userId);

      expect(result.id).toBe(progress.id);
      expect(result.stats.completionRate).toBe(Math.round((3 / 49) * 100));
      expect(result.stats.averageScore).toBe(80);
      expect(result.stats.totalExams).toBe(2);
      expect(result.stats.passedExams).toBe(2);
    });

    test('should create progress if not exists', async () => {
      const userId = 'new-user-123';

      const result = await LearningService.getLearningProgress(userId);

      expect(result.userId).toBe(userId);
      expect(result.totalStudyTime).toBe(0);
      expect(result.completedProcesses).toEqual([]);
      expect(result.stats.completionRate).toBe(0);
      expect(result.stats.totalExams).toBe(0);
    });

    test('should handle database errors', async () => {
      vi.mocked(testDb.findUnique).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        LearningService.getLearningProgress('user-123')
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('recordStudySession', () => {
    test('should record study session and update progress', async () => {
      const userId = 'user-123';
      const progress = createLearningProgress({
        userId,
        completedProcesses: ['p1'],
        totalStudyTime: 3600,
        currentStreak: 1,
      });

      testDb.create('learningProgress', progress);

      const sessionData = studySessionSchema.parse({
        processId: 'p2',
        processName: 'Define Scope',
        knowledgeArea: 'Scope',
        processGroup: 'Planning',
        duration: 1800, // 30 minutes
        completed: true,
      });

      const result = await LearningService.recordStudySession(userId, sessionData);

      expect(result.processId).toBe('p2');
      expect(result.duration).toBe(1800);
      expect(result.completed).toBe(true);

      // Verify progress was updated
      const updatedProgress = testDb.findUnique('learningProgress', { userId });
      expect(updatedProgress.totalStudyTime).toBe(5400); // 3600 + 1800
      expect(updatedProgress.completedProcesses).toContain('p2');
      expect(updatedProgress.currentStreak).toBe(2);
    });

    test('should not duplicate completed processes', async () => {
      const userId = 'user-123';
      const progress = createLearningProgress({
        userId,
        completedProcesses: ['p1'],
      });

      testDb.create('learningProgress', progress);

      const sessionData = studySessionSchema.parse({
        processId: 'p1', // Already completed
        processName: 'Develop Charter',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
        completed: true,
      });

      await LearningService.recordStudySession(userId, sessionData);

      const updatedProgress = testDb.findUnique('learningProgress', { userId });
      expect(updatedProgress.completedProcesses.filter((p: string) => p === 'p1')).toHaveLength(1);
    });

    test('should calculate streak correctly', async () => {
      const userId = 'user-123';
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const progress = createLearningProgress({
        userId,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: yesterday,
      });

      testDb.create('learningProgress', progress);

      const sessionData = studySessionSchema.parse({
        processId: 'p1',
        processName: 'Test Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
      });

      await LearningService.recordStudySession(userId, sessionData);

      const updatedProgress = testDb.findUnique('learningProgress', { userId });
      expect(updatedProgress.currentStreak).toBe(6);
      expect(updatedProgress.longestStreak).toBe(10); // No change
    });

    test('should reset streak for non-consecutive days', async () => {
      const userId = 'user-123';
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      
      const progress = createLearningProgress({
        userId,
        currentStreak: 5,
        lastActivityDate: threeDaysAgo,
      });

      testDb.create('learningProgress', progress);

      const sessionData = studySessionSchema.parse({
        processId: 'p1',
        processName: 'Test Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
      });

      await LearningService.recordStudySession(userId, sessionData);

      const updatedProgress = testDb.findUnique('learningProgress', { userId });
      expect(updatedProgress.currentStreak).toBe(1); // Reset
    });

    test('should handle missing progress record', async () => {
      const userId = 'user-without-progress';

      const sessionData = studySessionSchema.parse({
        processId: 'p1',
        processName: 'Test Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
      });

      await expect(
        LearningService.recordStudySession(userId, sessionData)
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: '学習進捗が見つかりません',
        })
      );
    });
  });

  describe('getStudyHistory', () => {
    test('should return study history with pagination', async () => {
      const userId = 'user-123';
      const sessions = Array.from({ length: 25 }, (_, i) => 
        createStudySession({
          userId,
          processId: `p${i + 1}`,
          duration: 1800,
        })
      );

      sessions.forEach(session => testDb.create('studySession', session));

      const result = await LearningService.getStudyHistory(userId, {
        limit: 10,
        offset: 0,
      });

      expect(result.sessions).toHaveLength(10);
      expect(result.totalSessions).toBe(25);
      expect(result.totalTime).toBe(25 * 1800);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.total).toBe(25);
    });

    test('should filter by knowledge area', async () => {
      const userId = 'user-123';
      const sessions = [
        createStudySession({ userId, knowledgeArea: 'Integration' }),
        createStudySession({ userId, knowledgeArea: 'Scope' }),
        createStudySession({ userId, knowledgeArea: 'Integration' }),
      ];

      sessions.forEach(session => testDb.create('studySession', session));

      const result = await LearningService.getStudyHistory(userId, {
        knowledgeArea: 'Integration',
      });

      expect(result.sessions).toHaveLength(2);
      result.sessions.forEach(session => {
        expect(session.knowledgeArea).toBe('Integration');
      });
    });

    test('should filter by date range', async () => {
      const userId = 'user-123';
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const sessions = [
        createStudySession({ 
          userId, 
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        }),
        createStudySession({ 
          userId, 
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        }),
        createStudySession({ 
          userId, 
          createdAt: twoWeeksAgo,
        }),
      ];

      sessions.forEach(session => testDb.create('studySession', session));

      const result = await LearningService.getStudyHistory(userId, {
        dateFrom: oneWeekAgo,
        dateTo: now,
      });

      expect(result.sessions).toHaveLength(2);
    });
  });

  describe('setLearningGoal', () => {
    test('should create learning goal', async () => {
      const userId = 'user-123';
      const goalData = learningGoalSchema.parse({
        type: 'daily_time',
        target: 60, // 60 minutes
        description: 'Study 1 hour daily',
      });

      const result = await LearningService.setLearningGoal(userId, goalData);

      expect(result.userId).toBe(userId);
      expect(result.type).toBe('daily_time');
      expect(result.target).toBe(60);
      expect(result.achieved).toBe(false);
    });

    test('should handle goal with deadline', async () => {
      const userId = 'user-123';
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const goalData = learningGoalSchema.parse({
        type: 'process_completion',
        target: 10,
        deadline,
        description: 'Complete 10 processes in 30 days',
      });

      const result = await LearningService.setLearningGoal(userId, goalData);

      expect(result.deadline).toEqual(deadline);
      expect(result.description).toBe('Complete 10 processes in 30 days');
    });
  });

  describe('getLearningGoals', () => {
    test('should return all goals', async () => {
      const userId = 'user-123';
      const goals = [
        { userId, type: 'daily_time', target: 60, achieved: false },
        { userId, type: 'process_completion', target: 5, achieved: true },
        { userId, type: 'exam_score', target: 80, achieved: false },
      ];

      goals.forEach(goal => testDb.create('learningGoal', goal));

      const result = await LearningService.getLearningGoals(userId);

      expect(result).toHaveLength(3);
    });

    test('should return only active goals', async () => {
      const userId = 'user-123';
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const goals = [
        { userId, achieved: false, deadline: future }, // Active
        { userId, achieved: true, deadline: future }, // Achieved (inactive)
        { userId, achieved: false, deadline: past }, // Expired (inactive)
        { userId, achieved: false, deadline: null }, // No deadline (active)
      ];

      goals.forEach(goal => testDb.create('learningGoal', goal));

      const result = await LearningService.getLearningGoals(userId, true);

      expect(result).toHaveLength(2); // Only active goals
    });
  });

  describe('getStudyRecommendations', () => {
    test('should return study recommendations', async () => {
      const userId = 'user-123';
      
      // Mock progress data
      vi.spyOn(LearningService, 'getLearningProgress').mockResolvedValue({
        userId,
        completedProcesses: ['process_1', 'process_2'],
        stats: {
          completionRate: 10,
          averageScore: 75,
          studyStreak: 5,
          weeklyHours: 7,
          monthlyHours: 28,
          totalExams: 3,
          passedExams: 2,
          knowledgeAreas: {
            Integration: { completed: 2, total: 5, averageScore: 85 },
            Scope: { completed: 1, total: 5, averageScore: 65 }, // Weak area
            Risk: { completed: 0, total: 5, averageScore: 60 }, // Weak area
          },
          processGroups: {
            Initiating: { completed: 1, total: 10, averageScore: 80 },
            Planning: { completed: 0, total: 10, averageScore: 70 }, // Priority area
            Executing: { completed: 1, total: 10, averageScore: 75 },
          },
        },
      } as any);

      const result = await LearningService.getStudyRecommendations(userId);

      expect(result.nextProcesses).toHaveLength(5);
      expect(result.nextProcesses).not.toContain('process_1');
      expect(result.nextProcesses).not.toContain('process_2');
      
      expect(result.weakAreas).toContain('Risk');
      expect(result.weakAreas).toContain('Scope');
      
      expect(result.priorityAreas).toContain('Planning');
      expect(result.suggestedDuration).toBeGreaterThan(1800); // At least 30 minutes
    });

    test('should handle minimum suggested duration', async () => {
      const userId = 'user-123';
      
      vi.spyOn(LearningService, 'getLearningProgress').mockResolvedValue({
        userId,
        completedProcesses: [],
        stats: {
          weeklyHours: 0.1, // Very low hours
          knowledgeAreas: {},
          processGroups: {},
        },
      } as any);

      const result = await LearningService.getStudyRecommendations(userId);

      expect(result.suggestedDuration).toBe(1800); // Minimum 30 minutes
    });
  });

  describe('resetProgress', () => {
    test('should reset all learning progress', async () => {
      const userId = 'user-123';
      
      // Setup existing data
      testDb.create('learningProgress', createLearningProgress({ userId }));
      testDb.create('studySession', createStudySession({ userId }));
      testDb.create('learningGoal', { userId, type: 'daily_time', target: 60 });

      await LearningService.resetProgress(userId);

      // Verify reset
      const progress = testDb.findUnique('learningProgress', { userId });
      expect(progress.totalStudyTime).toBe(0);
      expect(progress.completedProcesses).toEqual([]);
      expect(progress.currentStreak).toBe(0);

      const sessions = testDb.findMany('studySession', { userId });
      expect(sessions).toHaveLength(0);

      const goals = testDb.findMany('learningGoal', { userId });
      expect(goals).toHaveLength(0);
    });
  });

  describe('exportLearningData', () => {
    test('should export data as JSON', async () => {
      const userId = 'user-123';

      // Mock dependencies
      vi.spyOn(LearningService, 'getLearningProgress').mockResolvedValue({
        userId,
        totalStudyTime: 7200,
      } as any);

      vi.spyOn(LearningService, 'getStudyHistory').mockResolvedValue({
        sessions: [createStudySession({ userId })],
        totalTime: 3600,
        totalSessions: 1,
        pagination: { hasMore: false, total: 1 },
      });

      vi.spyOn(LearningService, 'getLearningGoals').mockResolvedValue([
        { userId, type: 'daily_time', target: 60 },
      ]);

      testDb.create('examResult', createExamResult({ userId }));

      const result = await LearningService.exportLearningData(userId, 'json');

      const parsed = JSON.parse(result);
      expect(parsed.progress.userId).toBe(userId);
      expect(parsed.sessions).toHaveLength(1);
      expect(parsed.goals).toHaveLength(1);
      expect(parsed.examResults).toHaveLength(1);
      expect(parsed.exportedAt).toBeDefined();
    });

    test('should export data as CSV', async () => {
      const userId = 'user-123';

      const mockSession = createStudySession({
        userId,
        processName: 'Test Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 3600,
        completed: true,
        notes: 'Test notes',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      });

      vi.spyOn(LearningService, 'getLearningProgress').mockResolvedValue({} as any);
      vi.spyOn(LearningService, 'getStudyHistory').mockResolvedValue({
        sessions: [mockSession],
        totalTime: 3600,
        totalSessions: 1,
        pagination: { hasMore: false, total: 1 },
      });
      vi.spyOn(LearningService, 'getLearningGoals').mockResolvedValue([]);

      const result = await LearningService.exportLearningData(userId, 'csv');

      expect(result).toContain('Date,Process,Knowledge Area');
      expect(result).toContain('2024-01-15,Test Process,Integration');
      expect(result).toContain('Initiating,60,Yes,Test notes');
    });
  });

  describe('Schema Validation', () => {
    test('should validate study session schema', () => {
      const validData = studySessionSchema.parse({
        processId: 'p1',
        processName: 'Develop Charter',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
        completed: true,
        notes: 'Good session',
      });

      expect(validData.processId).toBe('p1');
      expect(validData.duration).toBe(1800);

      // Invalid data
      expect(() => {
        studySessionSchema.parse({
          processId: '',
          processName: 'Test',
          knowledgeArea: 'Integration',
          processGroup: 'Initiating',
          duration: 8000, // Too long
        });
      }).toThrow();
    });

    test('should validate learning goal schema', () => {
      const validGoal = learningGoalSchema.parse({
        type: 'weekly_time',
        target: 420, // 7 hours
        deadline: new Date(),
        description: 'Study 7 hours per week',
      });

      expect(validGoal.type).toBe('weekly_time');
      expect(validGoal.target).toBe(420);

      // Invalid goal
      expect(() => {
        learningGoalSchema.parse({
          type: 'invalid_type',
          target: -1,
        });
      }).toThrow();
    });
  });

  describe('Constants', () => {
    test('should have correct PMBOK process constants', () => {
      expect(PMBOK_PROCESSES.knowledgeAreas).toHaveLength(10);
      expect(PMBOK_PROCESSES.processGroups).toHaveLength(5);
      expect(PMBOK_PROCESSES.totalProcesses).toBe(49);
      
      expect(PMBOK_PROCESSES.knowledgeAreas).toContain('Integration');
      expect(PMBOK_PROCESSES.knowledgeAreas).toContain('Risk');
      
      expect(PMBOK_PROCESSES.processGroups).toContain('Initiating');
      expect(PMBOK_PROCESSES.processGroups).toContain('Closing');
    });
  });
});