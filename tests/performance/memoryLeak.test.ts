import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '@/tests/setup/globalSetup';
import { redis } from '@/lib/db';
import { faker } from '@faker-js/faker';

/**
 * メモリリーク検出・リソース管理テスト
 * 担当：インフラ・パフォーマンスチーム
 * 
 * テストカバレッジ：
 * - メモリリーク検出
 * - ガベージコレクション効果測定
 * - データベース接続リーク
 * - Redis接続管理
 * - イベントリスナーリーク
 */

describe('Memory Leak Detection and Resource Management', () => {
  let initialMemoryUsage: NodeJS.MemoryUsage;

  beforeEach(() => {
    // 初期メモリ使用量記録
    global.gc?.(); // ガベージコレクション強制実行（--expose-gc必要）
    initialMemoryUsage = process.memoryUsage();
  });

  afterEach(() => {
    // テスト後のクリーンアップ
    global.gc?.();
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory during repeated API calls', async () => {
      const iterations = 1000;
      const memorySnapshots: number[] = [];

      // 大量のAPIリクエストシミュレーション
      for (let i = 0; i < iterations; i++) {
        // ユーザー認証処理
        const mockRequest = {
          headers: { authorization: 'Bearer test-token' },
          body: { email: `user${i}@example.com` }
        };

        // リクエスト処理（模擬）
        await processAuthenticationRequest(mockRequest);

        // 100回毎にメモリ使用量を記録
        if (i % 100 === 0) {
          global.gc?.();
          const currentMemory = process.memoryUsage();
          memorySnapshots.push(currentMemory.heapUsed);
        }
      }

      // メモリ使用量の増加を分析
      const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0];
      const memoryGrowthRate = memoryGrowth / (iterations / 100);

      expect(memoryGrowthRate).toBeLessThan(1024 * 1024); // 100回毎に1MB未満の増加

      console.log(`APIリクエスト メモリ使用量:
        - 初期メモリ: ${formatBytes(memorySnapshots[0])}
        - 最終メモリ: ${formatBytes(memorySnapshots[memorySnapshots.length - 1])}
        - メモリ増加: ${formatBytes(memoryGrowth)}
        - 増加率: ${formatBytes(memoryGrowthRate)}/100リクエスト`);
    });

    it('should not leak memory during database operations', async () => {
      const iterations = 500;
      const memoryBefore = process.memoryUsage();

      // 大量のデータベース操作
      for (let i = 0; i < iterations; i++) {
        // 複雑なクエリ実行
        await performComplexDatabaseOperations(i);

        // オブジェクトの明示的解放
        if (i % 50 === 0) {
          global.gc?.();
        }
      }

      global.gc?.();
      const memoryAfter = process.memoryUsage();

      const heapGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;
      const heapGrowthPerOperation = heapGrowth / iterations;

      expect(heapGrowthPerOperation).toBeLessThan(1024); // 操作当たり1KB未満
      expect(heapGrowth).toBeLessThan(10 * 1024 * 1024); // 全体で10MB未満

      console.log(`データベース操作 メモリ使用量:
        - ヒープ増加: ${formatBytes(heapGrowth)}
        - 操作当たり: ${formatBytes(heapGrowthPerOperation)}
        - RSS増加: ${formatBytes(memoryAfter.rss - memoryBefore.rss)}`);
    });

    it('should not leak memory during Redis operations', async () => {
      const iterations = 1000;
      const cacheKeys: string[] = [];

      const memoryBefore = process.memoryUsage();

      // 大量のRedis操作
      for (let i = 0; i < iterations; i++) {
        const key = `memory-test-${i}`;
        cacheKeys.push(key);

        // データ設定
        await redis.setex(key, 300, JSON.stringify({
          id: i,
          data: faker.lorem.paragraphs(5), // 大きめのデータ
          timestamp: Date.now()
        }));

        // データ取得
        const cached = await redis.get(key);
        const parsed = cached ? JSON.parse(cached) : null;
        
        // 処理結果検証
        expect(parsed?.id).toBe(i);

        // 定期的にキーを削除（メモリ解放）
        if (i % 100 === 0 && i > 0) {
          const keysToDelete = cacheKeys.splice(0, 50);
          await redis.del(...keysToDelete);
          global.gc?.();
        }
      }

      // 残りのキーを削除
      if (cacheKeys.length > 0) {
        await redis.del(...cacheKeys);
      }

      global.gc?.();
      const memoryAfter = process.memoryUsage();

      const heapGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;

      expect(heapGrowth).toBeLessThan(5 * 1024 * 1024); // 5MB未満の増加

      console.log(`Redis操作 メモリ使用量:
        - ヒープ増加: ${formatBytes(heapGrowth)}
        - 操作数: ${iterations}
        - Redis接続: OK`);
    });

    it('should properly clean up event listeners', async () => {
      const EventEmitter = require('events');
      const iterations = 100;
      const emitters: EventEmitter[] = [];
      const listeners: Function[] = [];

      const memoryBefore = process.memoryUsage();

      // イベントエミッターとリスナーを大量作成
      for (let i = 0; i < iterations; i++) {
        const emitter = new EventEmitter();
        const listener = (data: any) => {
          // リスナー処理
          const processed = { ...data, processed: true, timestamp: Date.now() };
          return processed;
        };

        emitter.on('test-event', listener);
        emitters.push(emitter);
        listeners.push(listener);

        // イベント発火
        emitter.emit('test-event', { id: i, data: faker.lorem.words() });
      }

      const memoryWithListeners = process.memoryUsage();

      // リスナーの適切なクリーンアップ
      for (let i = 0; i < iterations; i++) {
        emitters[i].removeAllListeners('test-event');
        emitters[i] = null as any; // 参照削除
        listeners[i] = null as any; // 参照削除
      }

      // 配列クリア
      emitters.length = 0;
      listeners.length = 0;

      global.gc?.();
      const memoryAfterCleanup = process.memoryUsage();

      const memoryWithListenersGrowth = memoryWithListeners.heapUsed - memoryBefore.heapUsed;
      const memoryAfterCleanupGrowth = memoryAfterCleanup.heapUsed - memoryBefore.heapUsed;
      const cleanupEfficiency = (memoryWithListenersGrowth - memoryAfterCleanupGrowth) / memoryWithListenersGrowth;

      expect(cleanupEfficiency).toBeGreaterThan(0.8); // 80%以上のメモリ解放
      expect(memoryAfterCleanupGrowth).toBeLessThan(memoryWithListenersGrowth * 0.5);

      console.log(`イベントリスナー メモリ管理:
        - リスナー作成後: ${formatBytes(memoryWithListenersGrowth)}
        - クリーンアップ後: ${formatBytes(memoryAfterCleanupGrowth)}
        - 解放効率: ${(cleanupEfficiency * 100).toFixed(1)}%`);
    });

    it('should detect potential memory leaks in long-running processes', async () => {
      const testDuration = 10000; // 10秒間
      const sampleInterval = 1000; // 1秒毎
      const memorySnapshots: Array<{ timestamp: number; memory: NodeJS.MemoryUsage }> = [];

      const startTime = Date.now();
      let operationCount = 0;

      // 長時間実行処理のシミュレーション
      const longRunningProcess = setInterval(async () => {
        // 様々な操作を混合実行
        await performMixedOperations(operationCount);
        operationCount++;

        // メモリスナップショット取得
        const now = Date.now();
        if (now - startTime >= memorySnapshots.length * sampleInterval) {
          global.gc?.();
          memorySnapshots.push({
            timestamp: now - startTime,
            memory: process.memoryUsage()
          });
        }

        if (now - startTime >= testDuration) {
          clearInterval(longRunningProcess);
        }
      }, 100);

      // テスト完了まで待機
      await new Promise(resolve => setTimeout(resolve, testDuration + 1000));

      // メモリ使用量の推移分析
      const heapTrend = analyzeMemoryTrend(memorySnapshots.map(s => s.memory.heapUsed));
      const rssTrend = analyzeMemoryTrend(memorySnapshots.map(s => s.memory.rss));

      expect(heapTrend.slope).toBeLessThan(1024 * 1024 / (testDuration / 1000)); // 1MB/秒未満の増加
      expect(rssTrend.slope).toBeLessThan(2 * 1024 * 1024 / (testDuration / 1000)); // 2MB/秒未満の増加

      console.log(`長時間実行 メモリトレンド分析:
        - 実行時間: ${testDuration / 1000}秒
        - 操作回数: ${operationCount}
        - ヒープ増加率: ${formatBytes(heapTrend.slope)}/秒
        - RSS増加率: ${formatBytes(rssTrend.slope)}/秒
        - ヒープ相関係数: ${heapTrend.correlation.toFixed(3)}
        - RSS相関係数: ${rssTrend.correlation.toFixed(3)}`);

      // 強い正の相関（0.8以上）はメモリリークの可能性
      if (heapTrend.correlation > 0.8 && heapTrend.slope > 500 * 1024) {
        console.warn('⚠️ 潜在的なメモリリークが検出されました');
      }
    });
  });

  describe('Resource Management', () => {
    it('should properly manage database connections', async () => {
      const connectionTests = 50;
      const activeConnections: any[] = [];

      // 接続プールの状態確認
      const initialPoolStatus = await checkDatabaseConnectionPool();

      // 大量の同時接続をテスト
      for (let i = 0; i < connectionTests; i++) {
        const connectionPromise = performDatabaseOperation(i);
        activeConnections.push(connectionPromise);
      }

      // 全ての操作完了を待機
      await Promise.all(activeConnections);

      // 接続プール状態の再確認
      await new Promise(resolve => setTimeout(resolve, 1000)); // プール清算待ち
      const finalPoolStatus = await checkDatabaseConnectionPool();

      // 接続リークがないことを確認
      expect(finalPoolStatus.active).toBeLessThanOrEqual(initialPoolStatus.active + 2);
      expect(finalPoolStatus.idle).toBeGreaterThanOrEqual(initialPoolStatus.idle - 2);

      console.log(`データベース接続プール管理:
        - テスト前: アクティブ ${initialPoolStatus.active}, アイドル ${initialPoolStatus.idle}
        - テスト後: アクティブ ${finalPoolStatus.active}, アイドル ${finalPoolStatus.idle}
        - 同時接続数: ${connectionTests}
        - 接続リーク: なし`);
    });

    it('should handle Redis connection cleanup', async () => {
      const redisOperations = 100;
      const connectionsBefore = await getRedisConnectionCount();

      // 並行Redis操作
      const redisPromises = Array.from({ length: redisOperations }, async (_, index) => {
        const tempKey = `temp-connection-test-${index}`;
        
        try {
          await redis.setex(tempKey, 60, `test-data-${index}`);
          const result = await redis.get(tempKey);
          await redis.del(tempKey);
          
          return { success: true, result };
        } catch (error) {
          return { success: false, error };
        }
      });

      const results = await Promise.all(redisPromises);
      const successCount = results.filter(r => r.success).length;

      await new Promise(resolve => setTimeout(resolve, 1000)); // 接続清算待ち
      const connectionsAfter = await getRedisConnectionCount();

      expect(successCount).toBe(redisOperations);
      expect(connectionsAfter).toBeLessThanOrEqual(connectionsBefore + 5); // 最大5接続増加許容

      console.log(`Redis接続管理:
        - 操作前接続数: ${connectionsBefore}
        - 操作後接続数: ${connectionsAfter}
        - 成功操作数: ${successCount}/${redisOperations}
        - 接続増加: ${connectionsAfter - connectionsBefore}`);
    });

    it('should prevent file descriptor leaks', async () => {
      const fileOperations = 50;
      const fdBefore = await getOpenFileDescriptorCount();

      // ファイル操作（ログ書き込み、設定読み込み等）
      const filePromises = Array.from({ length: fileOperations }, async (_, index) => {
        const tempFilePath = `/tmp/fd-test-${index}-${Date.now()}.tmp`;
        
        try {
          const fs = require('fs').promises;
          
          // ファイル作成・書き込み
          await fs.writeFile(tempFilePath, `Test data ${index}`);
          
          // ファイル読み込み
          const data = await fs.readFile(tempFilePath, 'utf8');
          
          // ファイル削除
          await fs.unlink(tempFilePath);
          
          return { success: true, data };
        } catch (error) {
          return { success: false, error };
        }
      });

      const results = await Promise.all(filePromises);
      const successCount = results.filter(r => r.success).length;

      await new Promise(resolve => setTimeout(resolve, 500)); // ファイルハンドル解放待ち
      const fdAfter = await getOpenFileDescriptorCount();

      expect(successCount).toBe(fileOperations);
      expect(fdAfter).toBeLessThanOrEqual(fdBefore + 10); // 最大10FD増加許容

      console.log(`ファイルディスクリプタ管理:
        - 操作前FD数: ${fdBefore}
        - 操作後FD数: ${fdAfter}
        - 成功操作数: ${successCount}/${fileOperations}
        - FD増加: ${fdAfter - fdBefore}`);
    });

    it('should cleanup temporary resources', async () => {
      const tempResources: Array<{ type: string; id: string; cleanup: () => Promise<void> }> = [];
      
      // 一時リソースの作成
      for (let i = 0; i < 20; i++) {
        // 一時的なキャッシュエントリ
        const cacheKey = `temp-resource-${i}`;
        await redis.setex(cacheKey, 60, JSON.stringify({ data: faker.lorem.paragraphs() }));
        
        tempResources.push({
          type: 'cache',
          id: cacheKey,
          cleanup: async () => await redis.del(cacheKey)
        });

        // 一時的なデータベースレコード
        const tempRecord = await prisma.tempTestData.create({
          data: {
            id: `temp-${i}`,
            data: faker.lorem.words(),
            expiresAt: new Date(Date.now() + 60000)
          }
        });
        
        tempResources.push({
          type: 'database',
          id: tempRecord.id,
          cleanup: async () => await prisma.tempTestData.delete({ where: { id: tempRecord.id } })
        });
      }

      const beforeCleanup = {
        cacheKeys: await redis.keys('temp-resource-*'),
        dbRecords: await prisma.tempTestData.count()
      };

      // リソースクリーンアップ実行
      const cleanupPromises = tempResources.map(resource => resource.cleanup());
      await Promise.all(cleanupPromises);

      const afterCleanup = {
        cacheKeys: await redis.keys('temp-resource-*'),
        dbRecords: await prisma.tempTestData.count()
      };

      expect(beforeCleanup.cacheKeys.length).toBe(20);
      expect(afterCleanup.cacheKeys.length).toBe(0);
      expect(afterCleanup.dbRecords).toBeLessThan(beforeCleanup.dbRecords);

      console.log(`一時リソースクリーンアップ:
        - クリーンアップ前: キャッシュ ${beforeCleanup.cacheKeys.length}, DB ${beforeCleanup.dbRecords}
        - クリーンアップ後: キャッシュ ${afterCleanup.cacheKeys.length}, DB ${afterCleanup.dbRecords}
        - 削除成功: ${tempResources.length}リソース`);
    });
  });

  describe('Garbage Collection Optimization', () => {
    it('should benefit from garbage collection at appropriate intervals', async () => {
      const iterations = 1000;
      const gcInterval = 100;
      let memoryWithoutGC: number[] = [];
      let memoryWithGC: number[] = [];

      // GCなしでのメモリ使用量測定
      for (let i = 0; i < iterations; i++) {
        await createLargeObjects();
        
        if (i % gcInterval === 0) {
          memoryWithoutGC.push(process.memoryUsage().heapUsed);
        }
      }

      // GCありでのメモリ使用量測定
      for (let i = 0; i < iterations; i++) {
        await createLargeObjects();
        
        if (i % gcInterval === 0) {
          global.gc?.();
          memoryWithGC.push(process.memoryUsage().heapUsed);
        }
      }

      const avgMemoryWithoutGC = memoryWithoutGC.reduce((sum, mem) => sum + mem, 0) / memoryWithoutGC.length;
      const avgMemoryWithGC = memoryWithGC.reduce((sum, mem) => sum + mem, 0) / memoryWithGC.length;
      const gcEfficiency = (avgMemoryWithoutGC - avgMemoryWithGC) / avgMemoryWithoutGC;

      expect(gcEfficiency).toBeGreaterThan(0.2); // 20%以上のメモリ削減効果

      console.log(`ガベージコレクション効果:
        - GCなし平均メモリ: ${formatBytes(avgMemoryWithoutGC)}
        - GCあり平均メモリ: ${formatBytes(avgMemoryWithGC)}
        - GC効率: ${(gcEfficiency * 100).toFixed(1)}%
        - メモリ削減: ${formatBytes(avgMemoryWithoutGC - avgMemoryWithGC)}`);
    });
  });
});

// ヘルパー関数
async function processAuthenticationRequest(mockRequest: any): Promise<void> {
  // 認証処理のシミュレーション
  const userData = {
    email: mockRequest.body.email,
    token: mockRequest.headers.authorization,
    timestamp: Date.now(),
    sessionData: {
      preferences: faker.datatype.json(),
      permissions: Array.from({ length: 10 }, () => faker.lorem.word())
    }
  };
  
  // 処理後にオブジェクトを明示的にクリア
  (userData as any) = null;
}

async function performComplexDatabaseOperations(iteration: number): Promise<void> {
  // 複雑なデータベース操作
  const user = await prisma.user.create({
    data: {
      id: `db-leak-test-${iteration}`,
      email: `dbleak${iteration}@example.com`,
      name: faker.person.fullName(),
      role: 'USER'
    }
  });

  const progress = await prisma.learningProgress.createMany({
    data: Array.from({ length: 5 }, () => ({
      userId: user.id,
      processId: faker.string.uuid(),
      masteryLevel: faker.number.int({ min: 0, max: 100 }),
      studyTime: faker.number.int({ min: 300, max: 3600 }),
      lastStudied: new Date()
    }))
  });

  // データクリーンアップ
  await prisma.learningProgress.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function performMixedOperations(iteration: number): Promise<void> {
  // 混合操作の実行
  const operations = [
    async () => {
      const key = `mixed-op-${iteration}`;
      await redis.setex(key, 60, faker.lorem.paragraphs());
      await redis.get(key);
      await redis.del(key);
    },
    async () => {
      const user = await prisma.user.findFirst({ take: 1 });
      if (user) {
        await prisma.learningProgress.findMany({ 
          where: { userId: user.id }, 
          take: 5 
        });
      }
    },
    async () => {
      const largeArray = Array.from({ length: 1000 }, () => ({
        id: faker.string.uuid(),
        data: faker.lorem.paragraphs(3)
      }));
      
      // 配列処理後に明示的クリア
      largeArray.length = 0;
    }
  ];

  const randomOperation = operations[iteration % operations.length];
  await randomOperation();
}

async function createLargeObjects(): Promise<void> {
  // 大きなオブジェクトの作成（GCテスト用）
  const largeObject = {
    id: faker.string.uuid(),
    data: Array.from({ length: 1000 }, () => faker.lorem.paragraphs()),
    metadata: {
      created: new Date(),
      size: 'large',
      nested: {
        level1: Array.from({ length: 100 }, () => faker.lorem.words()),
        level2: Array.from({ length: 100 }, () => faker.lorem.sentences())
      }
    }
  };
  
  // オブジェクトの参照を削除
  (largeObject as any) = null;
}

function analyzeMemoryTrend(memoryValues: number[]): { slope: number; correlation: number } {
  const n = memoryValues.length;
  const timePoints = Array.from({ length: n }, (_, i) => i);
  
  // 線形回帰計算
  const sumX = timePoints.reduce((sum, x) => sum + x, 0);
  const sumY = memoryValues.reduce((sum, y) => sum + y, 0);
  const sumXY = timePoints.reduce((sum, x, i) => sum + x * memoryValues[i], 0);
  const sumXX = timePoints.reduce((sum, x) => sum + x * x, 0);
  const sumYY = memoryValues.reduce((sum, y) => sum + y * y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return { slope, correlation };
}

async function checkDatabaseConnectionPool(): Promise<{ active: number; idle: number }> {
  // Prismaの接続プール状態確認（実装例）
  const poolStatus = await prisma.$queryRaw`
    SELECT 
      COUNT(*) FILTER (WHERE state = 'active') as active,
      COUNT(*) FILTER (WHERE state = 'idle') as idle
    FROM pg_stat_activity 
    WHERE datname = current_database()
  ` as any[];

  return {
    active: parseInt(poolStatus[0]?.active || '0'),
    idle: parseInt(poolStatus[0]?.idle || '0')
  };
}

async function performDatabaseOperation(index: number): Promise<any> {
  // データベース操作実行
  return await prisma.user.findMany({
    take: 5,
    skip: index % 10,
    include: {
      learningProgress: {
        take: 3
      }
    }
  });
}

async function getRedisConnectionCount(): Promise<number> {
  // Redis接続数取得
  const info = await redis.info('clients');
  const clientsMatch = info.match(/connected_clients:(\d+)/);
  return clientsMatch ? parseInt(clientsMatch[1]) : 0;
}

async function getOpenFileDescriptorCount(): Promise<number> {
  // オープンファイルディスクリプタ数取得（Linux/macOS）
  try {
    const fs = require('fs').promises;
    const procFdDir = `/proc/${process.pid}/fd`;
    const fdList = await fs.readdir(procFdDir);
    return fdList.length;
  } catch (error) {
    // Windowsやアクセス不可の場合はプロセス情報から推定
    return (process as any)._getActiveHandles?.().length || 0;
  }
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(2)} ${sizes[i]}`;
}