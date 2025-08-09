import { describe, it, expect, beforeEach, vi } from 'vitest';
import { progressAnalyticsService } from '@/server/services/progress/progressAnalyticsService';
import { learningRecommendationService } from '@/server/services/learning/recommendationService';
import { prisma } from '@/tests/setup/globalSetup';
import { faker } from '@faker-js/faker';

/**
 * 学習進捗分析・推奨システムテスト
 * 担当：ビジネスロジックチーム（2名）
 * 
 * テストカバレッジ：
 * - 学習進捗計算ロジック
 * - 統計分析機能
 * - 推奨アルゴリズム
 * - パフォーマンス分析
 * - 学習パス生成
 */

describe('Progress Analytics - Learning Progress Calculation', () => {
  let testUser: any;
  let testProcesses: any[];

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: 'PREMIUM_USER',
        subscription: 'PREMIUM'
      }
    });

    testProcesses = await prisma.pmbokProcess.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        id: `process-${i + 1}`,
        name: `Process ${i + 1}`,
        knowledgeArea: faker.helpers.arrayElement([
          'INTEGRATION', 'SCOPE', 'SCHEDULE', 'COST', 'QUALITY',
          'RESOURCE', 'COMMUNICATION', 'RISK', 'PROCUREMENT', 'STAKEHOLDER'
        ]),
        processGroup: faker.helpers.arrayElement([
          'INITIATING', 'PLANNING', 'EXECUTING', 'MONITORING', 'CLOSING'
        ]),
        complexity: faker.number.int({ min: 1, max: 5 })
      }))
    });
  });

  describe('Basic Progress Calculation', () => {
    it('should calculate overall learning progress correctly', async () => {
      // 学習進捗データ作成
      const progressData = [
        { processId: 'process-1', masteryLevel: 85, studyTime: 3600 },
        { processId: 'process-2', masteryLevel: 75, studyTime: 2400 },
        { processId: 'process-3', masteryLevel: 90, studyTime: 1800 },
        { processId: 'process-4', masteryLevel: 60, studyTime: 1200 },
        { processId: 'process-5', masteryLevel: 70, studyTime: 3000 }
      ];

      await prisma.learningProgress.createMany({
        data: progressData.map(p => ({
          userId: testUser.id,
          processId: p.processId,
          masteryLevel: p.masteryLevel,
          studyTime: p.studyTime,
          lastStudied: new Date()
        }))
      });

      const analytics = await progressAnalyticsService.calculateOverallProgress(testUser.id);

      expect(analytics.overallMastery).toBe(76); // (85+75+90+60+70)/5
      expect(analytics.totalStudyTime).toBe(12000); // 3600+2400+1800+1200+3000
      expect(analytics.processesStudied).toBe(5);
      expect(analytics.completionRate).toBe(50); // 5/10 processes
    });

    it('should calculate knowledge area progress breakdown', async () => {
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 75, studyTime: 2400, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-3', masteryLevel: 90, studyTime: 1800, lastStudied: new Date() }
        ]
      });

      const breakdown = await progressAnalyticsService.getKnowledgeAreaBreakdown(testUser.id);

      expect(breakdown).toHaveProperty('INTEGRATION');
      expect(breakdown).toHaveProperty('SCOPE');
      expect(breakdown).toHaveProperty('SCHEDULE');
      
      Object.values(breakdown).forEach((area: any) => {
        expect(area).toHaveProperty('averageMastery');
        expect(area).toHaveProperty('totalStudyTime');
        expect(area).toHaveProperty('processCount');
      });
    });

    it('should handle empty progress data gracefully', async () => {
      const analytics = await progressAnalyticsService.calculateOverallProgress(testUser.id);

      expect(analytics.overallMastery).toBe(0);
      expect(analytics.totalStudyTime).toBe(0);
      expect(analytics.processesStudied).toBe(0);
      expect(analytics.completionRate).toBe(0);
    });

    it('should calculate weighted progress based on process complexity', async () => {
      // 高複雑度プロセスほど重要度が高い
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 80, studyTime: 1800, lastStudied: new Date() }, // complexity: 1
          { userId: testUser.id, processId: 'process-2', masteryLevel: 80, studyTime: 1800, lastStudied: new Date() }  // complexity: 5
        ]
      });

      const simpleWeighted = await progressAnalyticsService.calculateWeightedProgress(testUser.id, false);
      const complexWeighted = await progressAnalyticsService.calculateWeightedProgress(testUser.id, true);

      expect(complexWeighted.weightedMastery).not.toBe(simpleWeighted.weightedMastery);
      expect(complexWeighted.weightedMastery).toBeGreaterThan(0);
    });

    it('should track learning velocity and trends', async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // 時系列の学習記録
      await prisma.studySession.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', duration: 1800, masteryGain: 10, startTime: twoWeeksAgo },
          { userId: testUser.id, processId: 'process-2', duration: 2400, masteryGain: 15, startTime: oneWeekAgo },
          { userId: testUser.id, processId: 'process-3', duration: 1200, masteryGain: 12, startTime: now }
        ]
      });

      const velocity = await progressAnalyticsService.calculateLearningVelocity(testUser.id, 14); // 14日間

      expect(velocity.averageSessionDuration).toBe(1800); // (1800+2400+1200)/3
      expect(velocity.averageMasteryGainPerSession).toBe(12.33);
      expect(velocity.sessionsPerWeek).toBeGreaterThan(0);
      expect(velocity.trend).toMatch(/^(INCREASING|STABLE|DECREASING)$/);
    });

    it('should identify learning patterns and preferences', async () => {
      // 異なる時間帯と学習タイプでセッション作成
      const sessions = [
        { hour: 9, type: 'VIDEO', masteryGain: 15 },
        { hour: 9, type: 'VIDEO', masteryGain: 18 },
        { hour: 14, type: 'FLASHCARD', masteryGain: 12 },
        { hour: 20, type: 'PRACTICE', masteryGain: 20 },
        { hour: 20, type: 'PRACTICE', masteryGain: 22 }
      ];

      await Promise.all(sessions.map(async (session, index) => {
        const sessionTime = new Date();
        sessionTime.setHours(session.hour);
        
        return prisma.studySession.create({
          data: {
            userId: testUser.id,
            processId: `process-${index + 1}`,
            duration: 1800,
            masteryGain: session.masteryGain,
            learningType: session.type,
            startTime: sessionTime
          }
        });
      }));

      const patterns = await progressAnalyticsService.analyzeLearningPatterns(testUser.id);

      expect(patterns.preferredTimes).toContain(9);  // Morning
      expect(patterns.preferredTimes).toContain(20); // Evening
      expect(patterns.mostEffectiveLearningType).toBe('PRACTICE'); // Highest mastery gain
      expect(patterns.peakPerformanceHour).toBe(20);
    });
  });

  describe('Advanced Analytics', () => {
    it('should predict completion timeline', async () => {
      // 過去の学習データから将来を予測
      const historicalData = Array.from({ length: 30 }, (_, i) => ({
        userId: testUser.id,
        processId: `process-${(i % 10) + 1}`,
        duration: faker.number.int({ min: 900, max: 3600 }),
        masteryGain: faker.number.int({ min: 5, max: 20 }),
        startTime: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000)
      }));

      await prisma.studySession.createMany({ data: historicalData });

      const prediction = await progressAnalyticsService.predictCompletionTimeline(testUser.id);

      expect(prediction.estimatedCompletionDate).toBeInstanceOf(Date);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.remainingStudyTime).toBeGreaterThan(0);
      expect(prediction.recommendedWeeklyHours).toBeGreaterThan(0);
    });

    it('should identify learning bottlenecks', async () => {
      // 特定のプロセスで停滞している状況を作成
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 1800, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 45, studyTime: 4800, lastStudied: new Date() }, // 停滞
          { userId: testUser.id, processId: 'process-3', masteryLevel: 90, studyTime: 1200, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-4', masteryLevel: 40, studyTime: 5400, lastStudied: new Date() }  // 停滞
        ]
      });

      const bottlenecks = await progressAnalyticsService.identifyBottlenecks(testUser.id);

      expect(bottlenecks).toHaveLength(2);
      expect(bottlenecks.map(b => b.processId)).toContain('process-2');
      expect(bottlenecks.map(b => b.processId)).toContain('process-4');
      
      bottlenecks.forEach(bottleneck => {
        expect(bottleneck.masteryLevel).toBeLessThan(50);
        expect(bottleneck.studyTimeToMasteryRatio).toBeGreaterThan(100);
        expect(bottleneck.recommendedActions).toBeInstanceOf(Array);
      });
    });

    it('should generate personalized insights', async () => {
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 75, studyTime: 2400, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-3', masteryLevel: 95, studyTime: 1800, lastStudied: new Date() }
        ]
      });

      await prisma.studySession.createMany({
        data: Array.from({ length: 20 }, (_, i) => ({
          userId: testUser.id,
          processId: `process-${(i % 3) + 1}`,
          duration: faker.number.int({ min: 900, max: 3600 }),
          masteryGain: faker.number.int({ min: 5, max: 20 }),
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        }))
      });

      const insights = await progressAnalyticsService.generatePersonalizedInsights(testUser.id);

      expect(insights.strengths).toBeInstanceOf(Array);
      expect(insights.improvementAreas).toBeInstanceOf(Array);
      expect(insights.learningStyleAnalysis).toHaveProperty('primaryStyle');
      expect(insights.motivationalFactors).toBeInstanceOf(Array);
      expect(insights.nextSteps).toBeInstanceOf(Array);
      
      insights.nextSteps.forEach(step => {
        expect(step).toHaveProperty('action');
        expect(step).toHaveProperty('priority');
        expect(step).toHaveProperty('estimatedImpact');
      });
    });

    it('should perform comparative analysis against peer group', async () => {
      // 同レベルのユーザー群を作成
      const peerUsers = await Promise.all(
        Array.from({ length: 5 }, async () => {
          const peer = await prisma.user.create({
            data: {
              id: faker.string.uuid(),
              email: faker.internet.email(),
              name: faker.person.fullName(),
              role: 'PREMIUM_USER',
              subscription: 'PREMIUM'
            }
          });
          
          // ピアの学習進捗
          await prisma.learningProgress.createMany({
            data: [
              { userId: peer.id, processId: 'process-1', masteryLevel: faker.number.int({ min: 60, max: 90 }), studyTime: faker.number.int({ min: 1800, max: 4800 }), lastStudied: new Date() },
              { userId: peer.id, processId: 'process-2', masteryLevel: faker.number.int({ min: 60, max: 90 }), studyTime: faker.number.int({ min: 1800, max: 4800 }), lastStudied: new Date() }
            ]
          });
          
          return peer;
        })
      );

      // テストユーザーの進捗
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 75, studyTime: 2400, lastStudied: new Date() }
        ]
      });

      const comparison = await progressAnalyticsService.compareWithPeers(testUser.id);

      expect(comparison.percentileRank).toBeGreaterThanOrEqual(0);
      expect(comparison.percentileRank).toBeLessThanOrEqual(100);
      expect(comparison.strengthsVsPeers).toBeInstanceOf(Array);
      expect(comparison.gapsVsPeers).toBeInstanceOf(Array);
      expect(comparison.peerGroupSize).toBeGreaterThan(0);
    });

    it('should calculate ROI of learning time investment', async () => {
      const sessions = await prisma.studySession.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          userId: testUser.id,
          processId: `process-${(i % 3) + 1}`,
          duration: 1800, // 30分
          masteryGain: faker.number.int({ min: 8, max: 15 }),
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        }))
      });

      const roi = await progressAnalyticsService.calculateLearningROI(testUser.id);

      expect(roi.masteryPerHour).toBeGreaterThan(0);
      expect(roi.efficiencyScore).toBeGreaterThanOrEqual(0);
      expect(roi.efficiencyScore).toBeLessThanOrEqual(100);
      expect(roi.timeWellSpent).toBeGreaterThanOrEqual(0);
      expect(roi.timeWellSpent).toBeLessThanOrEqual(100);
      expect(roi.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle extreme mastery values', async () => {
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 0, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 100, studyTime: 1800, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-3', masteryLevel: -5, studyTime: 2400, lastStudied: new Date() }, // 異常値
          { userId: testUser.id, processId: 'process-4', masteryLevel: 150, studyTime: 1200, lastStudied: new Date() } // 異常値
        ]
      });

      const analytics = await progressAnalyticsService.calculateOverallProgress(testUser.id);
      
      // 異常値が正規化されている
      expect(analytics.overallMastery).toBeGreaterThanOrEqual(0);
      expect(analytics.overallMastery).toBeLessThanOrEqual(100);
    });

    it('should handle zero and negative study times', async () => {
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 0, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 75, studyTime: -100, lastStudied: new Date() }
        ]
      });

      const analytics = await progressAnalyticsService.calculateOverallProgress(testUser.id);
      
      expect(analytics.totalStudyTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle large datasets efficiently', async () => {
      // 大量のデータでパフォーマンステスト
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        userId: testUser.id,
        processId: `process-${(i % 49) + 1}`, // 49 PMBOK processes
        masteryLevel: faker.number.int({ min: 10, max: 100 }),
        studyTime: faker.number.int({ min: 300, max: 7200 }),
        lastStudied: faker.date.recent({ days: 30 })
      }));

      await prisma.learningProgress.createMany({ data: largeDataset });

      const startTime = Date.now();
      const analytics = await progressAnalyticsService.calculateOverallProgress(testUser.id);
      const executionTime = Date.now() - startTime;

      expect(executionTime).toBeLessThan(1000); // 1秒以内
      expect(analytics).toHaveProperty('overallMastery');
      expect(analytics).toHaveProperty('totalStudyTime');
    });

    it('should handle concurrent progress calculations', async () => {
      await prisma.learningProgress.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          userId: testUser.id,
          processId: `process-${i + 1}`,
          masteryLevel: faker.number.int({ min: 50, max: 100 }),
          studyTime: faker.number.int({ min: 1800, max: 7200 }),
          lastStudied: new Date()
        }))
      });

      // 並行処理テスト
      const promises = Array.from({ length: 10 }, () => 
        progressAnalyticsService.calculateOverallProgress(testUser.id)
      );

      const results = await Promise.all(promises);
      
      // 全ての結果が同一である
      results.forEach(result => {
        expect(result.overallMastery).toBe(results[0].overallMastery);
        expect(result.totalStudyTime).toBe(results[0].totalStudyTime);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent user gracefully', async () => {
      const nonExistentUserId = faker.string.uuid();
      
      const analytics = await progressAnalyticsService.calculateOverallProgress(nonExistentUserId);
      
      expect(analytics.overallMastery).toBe(0);
      expect(analytics.totalStudyTime).toBe(0);
      expect(analytics.processesStudied).toBe(0);
    });

    it('should handle database connection errors', async () => {
      // データベース接続エラーをシミュレート
      const originalQuery = prisma.learningProgress.findMany;
      prisma.learningProgress.findMany = vi.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(progressAnalyticsService.calculateOverallProgress(testUser.id))
        .rejects.toThrow('Database connection failed');

      prisma.learningProgress.findMany = originalQuery;
    });

    it('should handle invalid input parameters', async () => {
      const invalidInputs = [
        null,
        undefined,
        '',
        123,
        {},
        []
      ];

      for (const invalidInput of invalidInputs) {
        await expect(progressAnalyticsService.calculateOverallProgress(invalidInput as any))
          .rejects.toThrow('Invalid user ID');
      }
    });

    it('should handle corrupted progress data', async () => {
      // データベースに直接無効なデータを挿入
      await prisma.$executeRaw`
        INSERT INTO "LearningProgress" ("userId", "processId", "masteryLevel", "studyTime", "lastStudied")
        VALUES (${testUser.id}, 'invalid-process', NULL, NULL, NULL)
      `;

      // エラーハンドリングされて、有効なデータのみが処理される
      const analytics = await progressAnalyticsService.calculateOverallProgress(testUser.id);
      
      expect(analytics).toHaveProperty('overallMastery');
      expect(analytics.overallMastery).toBeGreaterThanOrEqual(0);
    });
  });
});