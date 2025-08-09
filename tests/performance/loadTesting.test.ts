import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/tests/setup/globalSetup';
import { redis } from '@/lib/db';
import { faker } from '@faker-js/faker';

/**
 * パフォーマンス・負荷テスト
 * 担当：インフラ・パフォーマンスチーム（1名）
 * 
 * テストカバレッジ：
 * - API レスポンス時間テスト
 * - 並行処理負荷テスト
 * - データベースクエリ最適化
 * - キャッシュ効率性テスト
 * - メモリリーク検出
 */

describe('Performance Testing - API Response Times', () => {
  beforeEach(async () => {
    // パフォーマンステスト用大量データ準備
    await setupPerformanceTestData();
  });

  describe('API Endpoint Performance', () => {
    it('should handle user authentication under 100ms', async () => {
      const testUser = {
        email: 'perf-test@example.com',
        password: 'TestPassword123!'
      };

      // 認証API負荷テスト
      const authTimes: number[] = [];
      const concurrentRequests = 50;

      const authPromises = Array.from({ length: concurrentRequests }, async () => {
        const startTime = Date.now();
        
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        authTimes.push(responseTime);
        
        return response;
      });

      const responses = await Promise.all(authPromises);

      // レスポンス時間検証
      const averageTime = authTimes.reduce((sum, time) => sum + time, 0) / authTimes.length;
      const p95Time = authTimes.sort((a, b) => a - b)[Math.floor(authTimes.length * 0.95)];
      const p99Time = authTimes.sort((a, b) => a - b)[Math.floor(authTimes.length * 0.99)];

      expect(averageTime).toBeLessThan(100); // 平均100ms未満
      expect(p95Time).toBeLessThan(200); // P95 200ms未満
      expect(p99Time).toBeLessThan(500); // P99 500ms未満

      // すべてのリクエストが成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      console.log(`認証API パフォーマンス統計:
        - 平均レスポンス時間: ${averageTime.toFixed(2)}ms
        - P95レスポンス時間: ${p95Time}ms  
        - P99レスポンス時間: ${p99Time}ms
        - 並行リクエスト数: ${concurrentRequests}`);
    });

    it('should handle learning progress queries efficiently', async () => {
      const testUserId = 'perf-test-user';
      
      // 大量の学習進捗データ作成
      await prisma.learningProgress.createMany({
        data: Array.from({ length: 1000 }, () => ({
          userId: testUserId,
          processId: faker.string.uuid(),
          masteryLevel: faker.number.int({ min: 0, max: 100 }),
          studyTime: faker.number.int({ min: 300, max: 7200 }),
          lastStudied: faker.date.recent({ days: 30 })
        }))
      });

      const queryTimes: number[] = [];
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const progress = await prisma.learningProgress.findMany({
          where: { userId: testUserId },
          include: {
            process: true,
            user: true
          },
          orderBy: { lastStudied: 'desc' },
          take: 50 // ページネーション
        });
        
        const endTime = Date.now();
        queryTimes.push(endTime - startTime);
        
        expect(progress.length).toBeLessThanOrEqual(50);
      }

      const averageQueryTime = queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length;
      const maxQueryTime = Math.max(...queryTimes);

      expect(averageQueryTime).toBeLessThan(50); // 平均50ms未満
      expect(maxQueryTime).toBeLessThan(200); // 最大200ms未満

      console.log(`学習進捗クエリ パフォーマンス:
        - 平均クエリ時間: ${averageQueryTime.toFixed(2)}ms
        - 最大クエリ時間: ${maxQueryTime}ms
        - データ件数: 1000件
        - ページサイズ: 50件`);
    });

    it('should handle recommendation engine under load', async () => {
      const testUsers = await Promise.all(
        Array.from({ length: 10 }, async () => {
          return await prisma.user.create({
            data: {
              id: faker.string.uuid(),
              email: faker.internet.email(),
              name: faker.person.fullName(),
              role: 'PREMIUM_USER'
            }
          });
        })
      );

      const recommendationTimes: number[] = [];
      const concurrentUsers = 20;

      const recommendationPromises = Array.from({ length: concurrentUsers }, async (_, index) => {
        const userId = testUsers[index % testUsers.length].id;
        const startTime = Date.now();
        
        const response = await fetch(`/api/recommendations/${userId}`, {
          headers: { 'Authorization': 'Bearer valid-token' }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        recommendationTimes.push(responseTime);
        
        const recommendations = await response.json();
        expect(recommendations.length).toBeGreaterThan(0);
        
        return recommendations;
      });

      await Promise.all(recommendationPromises);

      const averageTime = recommendationTimes.reduce((sum, time) => sum + time, 0) / recommendationTimes.length;
      const p95Time = recommendationTimes.sort((a, b) => a - b)[Math.floor(recommendationTimes.length * 0.95)];

      expect(averageTime).toBeLessThan(500); // 平均500ms未満（AIアルゴリズムのため許容値高め）
      expect(p95Time).toBeLessThan(1000); // P95 1秒未満

      console.log(`推奨エンジン パフォーマンス:
        - 平均レスポンス時間: ${averageTime.toFixed(2)}ms
        - P95レスポンス時間: ${p95Time}ms
        - 並行ユーザー数: ${concurrentUsers}`);
    });

    it('should handle exam data queries with complex joins efficiently', async () => {
      // 複雑なJOINクエリのパフォーマンステスト
      const examQueryTimes: number[] = [];
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const examResults = await prisma.$queryRaw`
          SELECT 
            e.id,
            e.title,
            e.duration,
            AVG(er.score) as average_score,
            COUNT(er.id) as total_attempts,
            COUNT(CASE WHEN er.passed = true THEN 1 END) as passed_attempts,
            ka.name as knowledge_area_name
          FROM "Exam" e
          LEFT JOIN "ExamResult" er ON e.id = er.exam_id
          LEFT JOIN "ExamQuestion" eq ON e.id = eq.exam_id
          LEFT JOIN "KnowledgeArea" ka ON eq.knowledge_area_id = ka.id
          WHERE e.is_active = true
          GROUP BY e.id, e.title, e.duration, ka.name
          ORDER BY average_score DESC
          LIMIT 20
        `;
        
        const endTime = Date.now();
        examQueryTimes.push(endTime - startTime);
        
        expect(examResults).toBeInstanceOf(Array);
      }

      const averageQueryTime = examQueryTimes.reduce((sum, time) => sum + time, 0) / examQueryTimes.length;
      const maxQueryTime = Math.max(...examQueryTimes);

      expect(averageQueryTime).toBeLessThan(100); // 平均100ms未満
      expect(maxQueryTime).toBeLessThan(300); // 最大300ms未満

      console.log(`複雑JOIN クエリ パフォーマンス:
        - 平均クエリ時間: ${averageQueryTime.toFixed(2)}ms
        - 最大クエリ時間: ${maxQueryTime}ms
        - 実行回数: ${iterations}回`);
    });
  });

  describe('Concurrent User Load Testing', () => {
    it('should handle 1000 concurrent users', async () => {
      const concurrentUsers = 1000;
      const userSessions: Array<{ userId: string; sessionId: string }> = [];
      
      // 並行ユーザーセッション作成
      const sessionPromises = Array.from({ length: concurrentUsers }, async (_, index) => {
        const userId = `load-test-user-${index}`;
        const sessionId = faker.string.uuid();
        
        userSessions.push({ userId, sessionId });
        
        // セッション作成リクエスト
        return fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, sessionId })
        });
      });

      const startTime = Date.now();
      const responses = await Promise.all(sessionPromises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / concurrentUsers;

      // 成功率検証
      const successfulResponses = responses.filter(res => res.status === 200 || res.status === 201);
      const successRate = successfulResponses.length / concurrentUsers;

      expect(successRate).toBeGreaterThan(0.95); // 95%以上成功
      expect(avgTimePerRequest).toBeLessThan(100); // リクエスト当たり100ms未満
      expect(totalTime).toBeLessThan(10000); // 全体で10秒未満

      console.log(`並行ユーザー負荷テスト結果:
        - 並行ユーザー数: ${concurrentUsers}
        - 成功率: ${(successRate * 100).toFixed(2)}%
        - 平均レスポンス時間: ${avgTimePerRequest.toFixed(2)}ms
        - 総実行時間: ${totalTime}ms`);
    });

    it('should handle concurrent exam taking without data corruption', async () => {
      const examId = 'concurrent-exam-test';
      const concurrentExamTakers = 100;
      
      // 試験データ作成
      await prisma.exam.create({
        data: {
          id: examId,
          title: 'Concurrent Load Test Exam',
          duration: 180,
          totalQuestions: 50,
          passingScore: 70
        }
      });

      const examAttempts: Promise<any>[] = [];
      const attemptResults: Array<{ userId: string; score: number; success: boolean }> = [];

      // 並行試験受験
      for (let i = 0; i < concurrentExamTakers; i++) {
        const userId = `concurrent-user-${i}`;
        const examAttempt = async () => {
          try {
            const startTime = Date.now();
            
            const response = await fetch(`/api/exams/${examId}/attempt`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer user-token-${i}`
              },
              body: JSON.stringify({
                userId,
                answers: Array.from({ length: 50 }, () => faker.number.int({ min: 0, max: 3 }))
              })
            });
            
            const result = await response.json();
            const endTime = Date.now();
            
            attemptResults.push({
              userId,
              score: result.score || 0,
              success: response.status === 200
            });
            
            return { userId, responseTime: endTime - startTime, result };
            
          } catch (error) {
            attemptResults.push({
              userId,
              score: 0,
              success: false
            });
            throw error;
          }
        };
        
        examAttempts.push(examAttempt());
      }

      const results = await Promise.allSettled(examAttempts);
      
      // データ整合性検証
      const successfulAttempts = attemptResults.filter(r => r.success);
      const uniqueUserIds = new Set(successfulAttempts.map(r => r.userId));
      
      expect(successfulAttempts.length).toBeGreaterThan(concurrentExamTakers * 0.95); // 95%以上成功
      expect(uniqueUserIds.size).toBe(successfulAttempts.length); // 重複なし
      
      // データベース整合性確認
      const storedResults = await prisma.examResult.findMany({
        where: { examId }
      });
      
      expect(storedResults.length).toBe(successfulAttempts.length);
      
      console.log(`並行試験受験テスト結果:
        - 並行受験者数: ${concurrentExamTakers}
        - 成功数: ${successfulAttempts.length}
        - データベース記録数: ${storedResults.length}
        - データ整合性: OK`);
    });

    it('should handle burst traffic patterns', async () => {
      const burstSizes = [10, 50, 100, 200, 500];
      const burstResults: Array<{ size: number; avgTime: number; successRate: number }> = [];

      for (const burstSize of burstSizes) {
        const burstRequests = Array.from({ length: burstSize }, async () => {
          const startTime = Date.now();
          
          const response = await fetch('/api/health', {
            method: 'GET'
          });
          
          const endTime = Date.now();
          
          return {
            responseTime: endTime - startTime,
            success: response.status === 200
          };
        });

        const burstStartTime = Date.now();
        const responses = await Promise.all(burstRequests);
        const burstEndTime = Date.now();

        const avgTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
        const successCount = responses.filter(r => r.success).length;
        const successRate = successCount / burstSize;
        const burstDuration = burstEndTime - burstStartTime;

        burstResults.push({
          size: burstSize,
          avgTime,
          successRate
        });

        expect(successRate).toBeGreaterThan(0.98); // 98%以上成功
        expect(avgTime).toBeLessThan(200); // 平均200ms未満
        expect(burstDuration).toBeLessThan(5000); // バースト全体で5秒未満

        console.log(`バーストトラフィック ${burstSize}リクエスト:
          - 成功率: ${(successRate * 100).toFixed(2)}%
          - 平均レスポンス時間: ${avgTime.toFixed(2)}ms
          - バースト実行時間: ${burstDuration}ms`);

        // バースト間の休憩
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // バーストサイズが増加してもパフォーマンスが大幅に劣化しない
      const performanceDegradation = burstResults[burstResults.length - 1].avgTime / burstResults[0].avgTime;
      expect(performanceDegradation).toBeLessThan(3); // 3倍以上の劣化はNG
    });
  });

  describe('Database Performance Optimization', () => {
    it('should execute database queries with proper indexing', async () => {
      // インデックス効果の検証
      const largeDataSize = 10000;
      
      // 大量データ作成（インデックス対象フィールド）
      await prisma.learningProgress.createMany({
        data: Array.from({ length: largeDataSize }, () => ({
          userId: faker.string.uuid(),
          processId: faker.string.uuid(),
          masteryLevel: faker.number.int({ min: 0, max: 100 }),
          studyTime: faker.number.int({ min: 300, max: 7200 }),
          lastStudied: faker.date.recent({ days: 90 })
        }))
      });

      // インデックス使用クエリ
      const indexedQueryTime = await measureQueryTime(async () => {
        return prisma.learningProgress.findMany({
          where: {
            userId: 'specific-user-id', // userIdにインデックス
            lastStudied: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 直近7日間
            }
          },
          orderBy: { lastStudied: 'desc' }
        });
      });

      // フルテーブルスキャンクエリ（比較用）
      const fullScanQueryTime = await measureQueryTime(async () => {
        return prisma.learningProgress.findMany({
          where: {
            masteryLevel: { gte: 80 } // インデックスなしフィールド
          },
          orderBy: { studyTime: 'desc' }
        });
      });

      expect(indexedQueryTime).toBeLessThan(100); // インデックス使用は100ms未満
      expect(indexedQueryTime).toBeLessThan(fullScanQueryTime * 0.1); // フルスキャンの10%未満

      console.log(`データベースインデックス効果:
        - インデックス使用クエリ: ${indexedQueryTime}ms
        - フルスキャンクエリ: ${fullScanQueryTime}ms
        - パフォーマンス向上率: ${((fullScanQueryTime / indexedQueryTime) * 100).toFixed(0)}%`);
    });

    it('should handle complex aggregation queries efficiently', async () => {
      const aggregationQueryTime = await measureQueryTime(async () => {
        return prisma.learningProgress.groupBy({
          by: ['processId'],
          _avg: {
            masteryLevel: true,
            studyTime: true
          },
          _count: {
            userId: true
          },
          having: {
            userId: {
              _count: {
                gt: 5 // 5人以上のユーザーが学習したプロセス
              }
            }
          },
          orderBy: {
            _avg: {
              masteryLevel: 'desc'
            }
          }
        });
      });

      expect(aggregationQueryTime).toBeLessThan(500); // 集計クエリは500ms未満

      console.log(`集計クエリ パフォーマンス: ${aggregationQueryTime}ms`);
    });

    it('should optimize bulk insert operations', async () => {
      const bulkInsertSizes = [100, 500, 1000, 2000];
      
      for (const size of bulkInsertSizes) {
        const bulkData = Array.from({ length: size }, () => ({
          userId: faker.string.uuid(),
          processId: faker.string.uuid(),
          masteryLevel: faker.number.int({ min: 0, max: 100 }),
          studyTime: faker.number.int({ min: 300, max: 7200 }),
          lastStudied: new Date()
        }));

        const bulkInsertTime = await measureQueryTime(async () => {
          return prisma.learningProgress.createMany({
            data: bulkData,
            skipDuplicates: true
          });
        });

        const avgTimePerRecord = bulkInsertTime / size;

        expect(avgTimePerRecord).toBeLessThan(5); // レコード当たり5ms未満
        expect(bulkInsertTime).toBeLessThan(10000); // 全体で10秒未満

        console.log(`バルクインサート ${size}件:
          - 総実行時間: ${bulkInsertTime}ms
          - レコード当たり: ${avgTimePerRecord.toFixed(2)}ms`);
      }
    });

    it('should handle database connection pooling efficiently', async () => {
      const concurrentQueries = 50;
      const connectionPoolTest = Array.from({ length: concurrentQueries }, async (_, index) => {
        const queryStartTime = Date.now();
        
        // 異なるタイプのクエリを混合実行
        const queryType = index % 4;
        let result;
        
        switch (queryType) {
          case 0:
            result = await prisma.user.findMany({ take: 10 });
            break;
          case 1:
            result = await prisma.learningProgress.count();
            break;
          case 2:
            result = await prisma.exam.findMany({ 
              include: { questions: true },
              take: 5
            });
            break;
          case 3:
            result = await prisma.subscription.findMany({ take: 10 });
            break;
        }
        
        const queryEndTime = Date.now();
        
        return {
          queryType,
          responseTime: queryEndTime - queryStartTime,
          success: result !== null
        };
      });

      const startTime = Date.now();
      const results = await Promise.all(connectionPoolTest);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      const successCount = results.filter(r => r.success).length;

      expect(successCount).toBe(concurrentQueries); // 全クエリ成功
      expect(avgResponseTime).toBeLessThan(200); // 平均200ms未満
      expect(totalTime).toBeLessThan(5000); // 全体で5秒未満

      console.log(`接続プール テスト結果:
        - 並行クエリ数: ${concurrentQueries}
        - 成功率: ${(successCount / concurrentQueries * 100).toFixed(2)}%
        - 平均レスポンス時間: ${avgResponseTime.toFixed(2)}ms
        - 総実行時間: ${totalTime}ms`);
    });
  });

  describe('Caching Performance', () => {
    it('should improve response times with Redis caching', async () => {
      const cacheKey = 'test-user-progress';
      const testData = {
        userId: 'cache-test-user',
        progress: Array.from({ length: 100 }, () => ({
          processId: faker.string.uuid(),
          masteryLevel: faker.number.int({ min: 0, max: 100 })
        }))
      };

      // キャッシュなし（初回）
      const uncachedTime = await measureQueryTime(async () => {
        const progress = await prisma.learningProgress.findMany({
          where: { userId: testData.userId },
          include: { process: true }
        });
        
        // Redisにキャッシュ
        await redis.setex(cacheKey, 300, JSON.stringify(progress));
        return progress;
      });

      // キャッシュあり（2回目以降）
      const cachedTime = await measureQueryTime(async () => {
        const cached = await redis.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
      });

      expect(cachedTime).toBeLessThan(uncachedTime * 0.1); // キャッシュは10%未満の時間
      expect(cachedTime).toBeLessThan(10); // キャッシュアクセスは10ms未満

      console.log(`キャッシュ効果:
        - キャッシュなし: ${uncachedTime}ms
        - キャッシュあり: ${cachedTime}ms
        - 高速化率: ${(uncachedTime / cachedTime).toFixed(0)}倍`);
    });

    it('should handle cache invalidation properly', async () => {
      const userProgressKey = 'user-progress-cache-test';
      const userId = 'cache-invalidation-user';

      // 初期データとキャッシュ
      const initialData = { userId, score: 75 };
      await redis.setex(userProgressKey, 300, JSON.stringify(initialData));

      // キャッシュ確認
      const cachedData = JSON.parse(await redis.get(userProgressKey) || '{}');
      expect(cachedData.score).toBe(75);

      // データ更新（キャッシュ無効化が必要）
      await prisma.learningProgress.upsert({
        where: { 
          userId_processId: {
            userId,
            processId: 'test-process'
          }
        },
        create: {
          userId,
          processId: 'test-process',
          masteryLevel: 85,
          studyTime: 3600,
          lastStudied: new Date()
        },
        update: {
          masteryLevel: 85,
          studyTime: 3600,
          lastStudied: new Date()
        }
      });

      // キャッシュ無効化
      await redis.del(userProgressKey);

      // 新しいデータでキャッシュ再構築
      const updatedData = { userId, score: 85 };
      await redis.setex(userProgressKey, 300, JSON.stringify(updatedData));

      const newCachedData = JSON.parse(await redis.get(userProgressKey) || '{}');
      expect(newCachedData.score).toBe(85);
    });

    it('should handle cache warming for frequently accessed data', async () => {
      const popularContentIds = ['content-1', 'content-2', 'content-3', 'content-4', 'content-5'];
      
      // キャッシュウォーミング
      const warmingStartTime = Date.now();
      const warmingPromises = popularContentIds.map(async (contentId) => {
        const content = await prisma.learningContent.findUnique({
          where: { id: contentId },
          include: {
            ratings: true,
            progress: true
          }
        });
        
        await redis.setex(`content:${contentId}`, 600, JSON.stringify(content));
        return content;
      });
      
      await Promise.all(warmingPromises);
      const warmingTime = Date.now() - warmingStartTime;

      // ウォーミング後のアクセス速度テスト
      const accessTimes: number[] = [];
      
      for (const contentId of popularContentIds) {
        const accessStartTime = Date.now();
        const cached = await redis.get(`content:${contentId}`);
        const content = cached ? JSON.parse(cached) : null;
        const accessTime = Date.now() - accessStartTime;
        
        accessTimes.push(accessTime);
        expect(content).toBeTruthy();
      }

      const avgAccessTime = accessTimes.reduce((sum, time) => sum + time, 0) / accessTimes.length;
      
      expect(avgAccessTime).toBeLessThan(5); // キャッシュアクセス5ms未満
      expect(warmingTime).toBeLessThan(1000); // ウォーミング1秒未満

      console.log(`キャッシュウォーミング結果:
        - ウォーミング時間: ${warmingTime}ms
        - 平均アクセス時間: ${avgAccessTime.toFixed(2)}ms
        - キャッシュアイテム数: ${popularContentIds.length}`);
    });

    it('should maintain cache consistency under concurrent updates', async () => {
      const cacheKey = 'concurrent-cache-test';
      const concurrentUpdates = 20;
      
      // 並行更新処理
      const updatePromises = Array.from({ length: concurrentUpdates }, async (_, index) => {
        const updateData = {
          id: index,
          value: faker.number.int({ min: 1, max: 1000 }),
          timestamp: Date.now()
        };
        
        // データベース更新
        await prisma.cacheTestData.upsert({
          where: { id: index },
          create: updateData,
          update: { value: updateData.value, timestamp: updateData.timestamp }
        });
        
        // キャッシュ更新（楽観的ロック）
        const lockKey = `${cacheKey}:lock:${index}`;
        const lockAcquired = await redis.set(lockKey, '1', 'PX', 100, 'NX');
        
        if (lockAcquired) {
          await redis.setex(`${cacheKey}:${index}`, 300, JSON.stringify(updateData));
          await redis.del(lockKey);
        }
        
        return updateData;
      });

      const updateResults = await Promise.all(updatePromises);
      
      // キャッシュとデータベースの整合性確認
      for (const result of updateResults) {
        const cachedData = JSON.parse(await redis.get(`${cacheKey}:${result.id}`) || '{}');
        const dbData = await prisma.cacheTestData.findUnique({
          where: { id: result.id }
        });
        
        expect(cachedData.value).toBe(dbData?.value);
        expect(cachedData.timestamp).toBe(dbData?.timestamp);
      }

      console.log(`並行キャッシュ更新テスト:
        - 並行更新数: ${concurrentUpdates}
        - データ整合性: OK`);
    });
  });
});

// ヘルパー関数
async function setupPerformanceTestData() {
  // テスト用ユーザー作成
  await prisma.user.createMany({
    data: Array.from({ length: 100 }, () => ({
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: faker.helpers.arrayElement(['FREE_USER', 'PREMIUM_USER']),
      subscription: faker.helpers.arrayElement(['FREE', 'PREMIUM'])
    })),
    skipDuplicates: true
  });

  // テスト用学習コンテンツ作成
  await prisma.learningContent.createMany({
    data: Array.from({ length: 200 }, () => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['VIDEO', 'ARTICLE', 'QUIZ']),
      difficulty: faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
      estimatedTime: faker.number.int({ min: 300, max: 3600 }),
      processId: faker.string.uuid()
    })),
    skipDuplicates: true
  });
}

async function measureQueryTime<T>(queryFn: () => Promise<T>): Promise<number> {
  const startTime = Date.now();
  await queryFn();
  return Date.now() - startTime;
}