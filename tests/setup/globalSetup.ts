import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { RedisMemoryServer } from 'redis-memory-server';
import { execSync } from 'child_process';
import { rm, mkdir } from 'fs/promises';
import { resolve } from 'path';

/**
 * 6人チーム並列テスト用グローバルセットアップ
 * - データベース分離
 * - Redis/キャッシュ管理
 * - 外部サービスモック
 * - テスト環境クリーンアップ
 */

let prisma: PrismaClient;
let redisServer: RedisMemoryServer;

export interface TestEnvironment {
  prisma: PrismaClient;
  redis: RedisMemoryServer;
  mockServices: MockServices;
  testDatabase: string;
}

export interface MockServices {
  stripe: any;
  email: any;
  notifications: any;
  fileStorage: any;
}

/**
 * グローバルセットアップ - 全体初期化
 */
export async function globalSetup(): Promise<TestEnvironment> {
  console.log('🚀 Setting up parallel test environment...');
  
  try {
    // 1. テスト用データベース準備
    const testDatabase = await setupTestDatabase();
    console.log(`✅ Test database ready: ${testDatabase}`);
    
    // 2. Redisテストサーバー起動
    redisServer = await RedisMemoryServer.create({
      instance: {
        port: 6380, // テスト用ポート
      }
    });
    console.log(`✅ Redis test server started: ${redisServer.getConnectionString()}`);
    
    // 3. Prismaクライアント初期化
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `postgresql://test:test@localhost:5433/${testDatabase}?schema=public`
        }
      }
    });
    
    await prisma.$connect();
    console.log('✅ Prisma connected to test database');
    
    // 4. データベースマイグレーション
    await runDatabaseMigrations(testDatabase);
    console.log('✅ Database migrations completed');
    
    // 5. テストデータシード
    await seedTestData();
    console.log('✅ Test data seeded');
    
    // 6. モックサービス初期化
    const mockServices = await initializeMockServices();
    console.log('✅ Mock services initialized');
    
    // 7. カバレッジディレクトリ準備
    await prepareCoverageDirectories();
    console.log('✅ Coverage directories prepared');
    
    const environment: TestEnvironment = {
      prisma,
      redis: redisServer,
      mockServices,
      testDatabase
    };
    
    console.log('🎉 Parallel test environment setup completed');
    
    return environment;
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

/**
 * テスト用データベース設定
 */
async function setupTestDatabase(): Promise<string> {
  const testDbName = `pmp_test_${Date.now()}_${process.pid}`;
  
  try {
    // PostgreSQLテストデータベース作成
    execSync(`createdb ${testDbName}`, { stdio: 'inherit' });
    
    // 環境変数設定
    process.env.DATABASE_URL = `postgresql://test:test@localhost:5433/${testDbName}?schema=public`;
    process.env.NODE_ENV = 'test';
    
    return testDbName;
    
  } catch (error) {
    console.error(`Failed to create test database ${testDbName}:`, error);
    throw error;
  }
}

/**
 * データベースマイグレーション実行
 */
async function runDatabaseMigrations(dbName: string): Promise<void> {
  try {
    // Prismaマイグレーション実行
    execSync('npx prisma migrate dev --name test-migration', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: `postgresql://test:test@localhost:5433/${dbName}?schema=public`
      }
    });
    
    // スキーマプッシュ
    execSync('npx prisma db push', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: `postgresql://test:test@localhost:5433/${dbName}?schema=public`
      }
    });
    
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
}

/**
 * テストデータシード
 */
async function seedTestData(): Promise<void> {
  try {
    // ユーザーテストデータ
    await prisma.user.createMany({
      data: [
        {
          id: 'test-user-1',
          email: 'test1@example.com',
          name: 'Test User 1',
          role: 'USER',
          subscription: 'PREMIUM'
        },
        {
          id: 'test-user-2', 
          email: 'test2@example.com',
          name: 'Test User 2',
          role: 'USER',
          subscription: 'FREE'
        },
        {
          id: 'test-admin-1',
          email: 'admin@example.com',
          name: 'Test Admin',
          role: 'ADMIN',
          subscription: 'PREMIUM'
        }
      ]
    });
    
    // 学習進捗テストデータ
    await prisma.learningProgress.createMany({
      data: [
        {
          userId: 'test-user-1',
          processId: 'pmbok-process-1',
          masteryLevel: 75,
          studyTime: 3600,
          lastStudied: new Date()
        },
        {
          userId: 'test-user-1',
          processId: 'pmbok-process-2', 
          masteryLevel: 85,
          studyTime: 2400,
          lastStudied: new Date()
        }
      ]
    });
    
    // サブスクリプションテストデータ  
    await prisma.subscription.createMany({
      data: [
        {
          userId: 'test-user-1',
          stripeCustomerId: 'cus_test_123',
          stripeSubscriptionId: 'sub_test_123',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    
  } catch (error) {
    console.error('Test data seeding failed:', error);
    throw error;
  }
}

/**
 * モックサービス初期化
 */
async function initializeMockServices(): Promise<MockServices> {
  const mockServices: MockServices = {
    // Stripeモック
    stripe: {
      customers: {
        create: vi.fn().mockResolvedValue({ id: 'cus_mock_123' }),
        retrieve: vi.fn().mockResolvedValue({ id: 'cus_mock_123', email: 'test@example.com' }),
        update: vi.fn().mockResolvedValue({ id: 'cus_mock_123' }),
        delete: vi.fn().mockResolvedValue({ id: 'cus_mock_123', deleted: true })
      },
      subscriptions: {
        create: vi.fn().mockResolvedValue({ id: 'sub_mock_123', status: 'active' }),
        retrieve: vi.fn().mockResolvedValue({ id: 'sub_mock_123', status: 'active' }),
        update: vi.fn().mockResolvedValue({ id: 'sub_mock_123', status: 'active' }),
        cancel: vi.fn().mockResolvedValue({ id: 'sub_mock_123', status: 'canceled' })
      },
      webhookEndpoints: {
        create: vi.fn().mockResolvedValue({ id: 'we_mock_123' })
      },
      invoices: {
        create: vi.fn().mockResolvedValue({ id: 'in_mock_123' }),
        pay: vi.fn().mockResolvedValue({ id: 'in_mock_123', status: 'paid' })
      }
    },
    
    // メールサービスモック
    email: {
      send: vi.fn().mockResolvedValue({ messageId: 'mock_email_123' }),
      sendTemplate: vi.fn().mockResolvedValue({ messageId: 'mock_template_123' }),
      sendBulk: vi.fn().mockResolvedValue({ 
        accepted: ['test1@example.com', 'test2@example.com'],
        rejected: []
      })
    },
    
    // プッシュ通知モック
    notifications: {
      send: vi.fn().mockResolvedValue({ success: true, messageId: 'mock_push_123' }),
      sendToTopic: vi.fn().mockResolvedValue({ success: true, messageId: 'mock_topic_123' }),
      subscribe: vi.fn().mockResolvedValue({ success: true }),
      unsubscribe: vi.fn().mockResolvedValue({ success: true })
    },
    
    // ファイルストレージモック
    fileStorage: {
      upload: vi.fn().mockResolvedValue({ url: 'https://mock-storage.com/file.pdf', id: 'file_123' }),
      delete: vi.fn().mockResolvedValue({ success: true }),
      getSignedUrl: vi.fn().mockResolvedValue('https://mock-storage.com/signed/file.pdf')
    }
  };
  
  // グローバルモック設定
  vi.mock('stripe', () => ({
    default: vi.fn().mockImplementation(() => mockServices.stripe)
  }));
  
  vi.mock('nodemailer', () => ({
    createTransport: vi.fn().mockReturnValue(mockServices.email)
  }));
  
  vi.mock('web-push', () => mockServices.notifications);
  
  return mockServices;
}

/**
 * カバレッジディレクトリ準備
 */
async function prepareCoverageDirectories(): Promise<void> {
  const coverageDir = resolve('./coverage');
  const testResultsDir = resolve('./test-results');
  
  try {
    // 既存ディレクトリクリーンアップ
    await rm(coverageDir, { recursive: true, force: true });
    await rm(testResultsDir, { recursive: true, force: true });
    
    // 新規ディレクトリ作成
    await mkdir(coverageDir, { recursive: true });
    await mkdir(testResultsDir, { recursive: true });
    
    // チーム別カバレッジディレクトリ
    await mkdir(resolve(coverageDir, 'auth-security'), { recursive: true });
    await mkdir(resolve(coverageDir, 'business-logic'), { recursive: true });
    await mkdir(resolve(coverageDir, 'integration-external'), { recursive: true });
    await mkdir(resolve(coverageDir, 'performance-infra'), { recursive: true });
    
  } catch (error) {
    console.error('Coverage directory setup failed:', error);
    throw error;
  }
}

/**
 * 各テスト前セットアップ
 */
beforeEach(async () => {
  // データベーストランザクション開始
  await prisma.$executeRaw`BEGIN`;
});

/**
 * 各テスト後クリーンアップ  
 */
afterEach(async () => {
  // データベーストランザクションロールバック
  await prisma.$executeRaw`ROLLBACK`;
  
  // モッククリア
  vi.clearAllMocks();
});

/**
 * グローバルクリーンアップ
 */
export async function globalTeardown(): Promise<void> {
  console.log('🧹 Cleaning up parallel test environment...');
  
  try {
    // Prisma接続クローズ
    if (prisma) {
      await prisma.$disconnect();
      console.log('✅ Prisma disconnected');
    }
    
    // Redis停止
    if (redisServer) {
      await redisServer.stop();
      console.log('✅ Redis test server stopped');
    }
    
    // テストデータベース削除
    if (process.env.DATABASE_URL) {
      const dbName = process.env.DATABASE_URL.split('/').pop()?.split('?')[0];
      if (dbName && dbName.startsWith('pmp_test_')) {
        try {
          execSync(`dropdb ${dbName}`, { stdio: 'inherit' });
          console.log(`✅ Test database ${dbName} dropped`);
        } catch (error) {
          console.warn(`⚠️  Could not drop test database ${dbName}:`, error);
        }
      }
    }
    
    console.log('🎉 Global teardown completed');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

// エクスポート
export { prisma, redisServer };