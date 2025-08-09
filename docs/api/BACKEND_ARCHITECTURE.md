# PMPLearningManagement バックエンド機能設計書

## 目次
1. [システムアーキテクチャ](#1-システムアーキテクチャ)
2. [API設計](#2-api設計)
3. [データベース設計](#3-データベース設計)
4. [認証・認可設計](#4-認証認可設計)
5. [ビジネスロジック層](#5-ビジネスロジック層)
6. [決済システム設計](#6-決済システム設計)
7. [キャッシング戦略](#7-キャッシング戦略)
8. [ファイルストレージ](#8-ファイルストレージ)
9. [非同期処理](#9-非同期処理)
10. [外部API統合](#10-外部api統合)
11. [セキュリティ設計](#11-セキュリティ設計)
12. [パフォーマンス最適化](#12-パフォーマンス最適化)
13. [エラー処理とログ](#13-エラー処理とログ)
14. [テスト戦略](#14-テスト戦略)
15. [デプロイメント](#15-デプロイメント)

---

## 1. システムアーキテクチャ

### 1.1 全体構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js 14)                  │
├─────────────────────────────────────────────────────────────────┤
│                         tRPC Client Layer                       │
├─────────────────────────────────────────────────────────────────┤
│                       API Layer (tRPC + REST)                   │
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                      Business Logic Layer                       │
├─────────────────────────────────────────────────────────────────┤
│                       Data Access Layer                         │
├─────────────────────────┬───────────────────────────────────────┤
│     PostgreSQL          │           Redis Cache                 │
│   (Primary Database)    │        (Session/Cache)                │
└─────────────────────────┴───────────────────────────────────────┘
```

### 1.2 レイヤーアーキテクチャ

```typescript
// src/server/api/root.ts - tRPC Router構成
import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { progressRouter } from "./routers/progress";
import { paymentRouter } from "./routers/payment";
import { aiRouter } from "./routers/ai";
import { pmisRouter } from "./routers/pmis";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  progress: progressRouter,
  payment: paymentRouter,
  ai: aiRouter,
  pmis: pmisRouter,
});

export type AppRouter = typeof appRouter;
```

### 1.3 技術スタック詳細

| カテゴリ | 技術 | 用途 | 理由 |
|---------|------|------|------|
| **Frontend** | Next.js 14 | SSR/SSG | SEO最適化、パフォーマンス |
| **TypeScript** | TypeScript 5.x | 型安全性 | 開発効率、保守性 |
| **API** | tRPC | 型安全なAPI | エンドツーエンド型安全性 |
| **ORM** | Prisma | データベースORM | 型安全、マイグレーション |
| **Database** | PostgreSQL | メインDB | ACID準拠、JSON型サポート |
| **Cache** | Redis | キャッシュ/セッション | 高速アクセス、スケーラビリティ |
| **Auth** | NextAuth.js | 認証・認可 | OAuth統合、セキュリティ |
| **Payment** | Stripe | 決済処理 | 国際対応、セキュリティ |
| **Storage** | Vercel Blob | ファイル保存 | CDN統合、コスト効率 |
| **Queue** | Redis Queue | 非同期処理 | バックグラウンドジョブ |
| **Monitoring** | Sentry | エラー追跡 | 本番環境監視 |

### 1.4 モジュール構成

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # ダッシュボード
│   └── api/               # REST API endpoints
├── server/                # サーバーサイドロジック
│   ├── api/               # tRPC routers
│   ├── services/          # ビジネスロジック
│   ├── db/                # データベース設定
│   └── auth/              # 認証設定
├── lib/                   # 共通ユーティリティ
├── components/            # UIコンポーネント
├── types/                 # TypeScript型定義
└── prisma/                # データベーススキーマ
```

---

## 2. API設計

### 2.1 RESTful API設計原則

- **リソースベース**: `/api/v1/users/{id}`
- **HTTPメソッド**: GET, POST, PUT, PATCH, DELETE
- **ステータスコード**: 適切なHTTPステータス使用
- **バージョニング**: URLパスでのバージョン管理

### 2.2 tRPC実装詳細

```typescript
// src/server/api/routers/progress.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ProgressService } from "~/server/services/progressService";

export const progressRouter = createTRPCRouter({
  // 学習進捗取得
  getProgress: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        knowledgeArea: z.string().optional(),
        processGroup: z.string().optional(),
      })
    )
    .output(
      z.object({
        totalProgress: z.number(),
        knowledgeAreaProgress: z.array(
          z.object({
            area: z.string(),
            progress: z.number(),
            completedProcesses: z.number(),
            totalProcesses: z.number(),
          })
        ),
        recentActivity: z.array(
          z.object({
            processId: z.string(),
            completedAt: z.date(),
            studyTime: z.number(),
          })
        ),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ProgressService.getProgress(ctx.session.user.id, input);
    }),

  // 学習進捗更新
  updateProgress: protectedProcedure
    .input(
      z.object({
        processId: z.string(),
        completed: z.boolean(),
        studyTime: z.number(),
        mastery: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ProgressService.updateProgress(
        ctx.session.user.id,
        input
      );
    }),

  // 学習統計取得
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return await ProgressService.getStats(ctx.session.user.id);
  }),
});
```

### 2.3 エンドポイント一覧

| Router | Procedure | Method | 説明 |
|--------|-----------|---------|------|
| **auth** | signUp | POST | ユーザー登録 |
| **auth** | signIn | POST | ログイン |
| **auth** | signOut | POST | ログアウト |
| **user** | getProfile | GET | プロフィール取得 |
| **user** | updateProfile | PUT | プロフィール更新 |
| **progress** | getProgress | GET | 学習進捗取得 |
| **progress** | updateProgress | PUT | 進捗更新 |
| **progress** | getStats | GET | 学習統計 |
| **payment** | createSubscription | POST | サブスクリプション作成 |
| **payment** | getPlans | GET | 料金プラン取得 |
| **ai** | getStudyRecommendation | POST | AI学習提案 |
| **ai** | generateQuiz | POST | AI問題生成 |

### 2.4 エラーハンドリング

```typescript
// src/server/api/trpc.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export class ApiError extends TRPCError {
  constructor(code: "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR", message: string, cause?: unknown) {
    super({ code, message, cause });
  }
}

// カスタムエラーハンドラー
const errorFormatter: TRPCErrorFormatter<any> = ({ error, shape }) => {
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError: error.code === "BAD_REQUEST" && error.cause instanceof ZodError
        ? error.cause.flatten()
        : null,
      timestamp: new Date().toISOString(),
      traceId: generateTraceId(),
    },
  };
};
```

---

## 3. データベース設計

### 3.1 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    User ||--o{ UserProgress : has
    User ||--o{ Payment : makes
    User ||--o{ StudySession : creates
    User ||--o{ AIInteraction : uses
    User ||--o{ Project : owns
    
    UserProgress ||--o{ ProcessProgress : contains
    ProcessProgress }o--|| PMBOKProcess : tracks
    
    Payment ||--|| Subscription : for
    
    Project ||--o{ Task : contains
    Project ||--o{ ProjectMember : has
    User ||--o{ ProjectMember : belongs
    
    User {
        string id PK
        string email UK
        string name
        string avatar
        enum role
        json preferences
        datetime createdAt
        datetime updatedAt
    }
    
    UserProgress {
        string id PK
        string userId FK
        json overallStats
        datetime lastStudySession
        int totalStudyTime
        datetime createdAt
        datetime updatedAt
    }
    
    ProcessProgress {
        string id PK
        string userProgressId FK
        string processId
        boolean isCompleted
        int masteryLevel
        int studyTime
        datetime completedAt
        datetime lastReviewedAt
    }
    
    Payment {
        string id PK
        string userId FK
        string subscriptionId FK
        decimal amount
        string currency
        enum status
        string stripePaymentId
        datetime createdAt
    }
    
    Subscription {
        string id PK
        string userId FK
        enum planType
        datetime startsAt
        datetime endsAt
        enum status
        string stripeSubscriptionId
    }
```

### 3.2 Prismaスキーマ

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  role          UserRole  @default(USER)
  preferences   Json      @default("{}")
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  userProgress  UserProgress?
  payments      Payment[]
  studySessions StudySession[]
  aiInteractions AIInteraction[]
  projects      Project[]
  projectMembers ProjectMember[]
  subscriptions Subscription[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

model UserProgress {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  overallStats      Json      @default("{}")
  lastStudySession  DateTime?
  totalStudyTime    Int       @default(0) // minutes
  
  processProgress   ProcessProgress[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@map("user_progress")
}

model ProcessProgress {
  id                String        @id @default(cuid())
  userProgressId    String
  userProgress      UserProgress  @relation(fields: [userProgressId], references: [id], onDelete: Cascade)
  
  processId         String        // PMBOK Process ID
  isCompleted       Boolean       @default(false)
  masteryLevel      Int           @default(0) // 0-100
  studyTime         Int           @default(0) // minutes
  completedAt       DateTime?
  lastReviewedAt    DateTime?
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@unique([userProgressId, processId])
  @@map("process_progress")
}

model Subscription {
  id                    String              @id @default(cuid())
  userId                String
  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  planType              SubscriptionPlan
  status                SubscriptionStatus  @default(ACTIVE)
  startsAt              DateTime            @default(now())
  endsAt                DateTime?
  stripeSubscriptionId  String?             @unique
  
  payments              Payment[]
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@map("subscriptions")
}

model Payment {
  id                String            @id @default(cuid())
  userId            String
  user              User              @relation(fields: [userId], references: [id])
  subscriptionId    String?
  subscription      Subscription?     @relation(fields: [subscriptionId], references: [id])
  
  amount            Decimal           @db.Decimal(10, 2)
  currency          String            @default("jpy")
  status            PaymentStatus
  stripePaymentId   String?           @unique
  
  createdAt         DateTime          @default(now())
  
  @@map("payments")
}

// Enums
enum UserRole {
  USER
  ADMIN
  PREMIUM
}

enum SubscriptionPlan {
  FREE
  BASIC
  PREMIUM
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  EXPIRED
  PENDING
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  CANCELED
}
```

### 3.3 インデックス設計

```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_process_progress_user_progress_id ON process_progress(user_progress_id);
CREATE INDEX idx_process_progress_process_id ON process_progress(process_id);
CREATE INDEX idx_process_progress_completed ON process_progress(is_completed);
CREATE INDEX idx_process_progress_last_reviewed ON process_progress(last_reviewed_at);

-- 複合インデックス
CREATE INDEX idx_process_progress_user_completed ON process_progress(user_progress_id, is_completed);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
```

### 3.4 マイグレーション戦略

```typescript
// prisma/migrations/001_initial_setup.sql
-- 初期スキーマ作成

// データ移行スクリプト
// src/scripts/migrate-localStorage-data.ts
import { prisma } from "~/server/db";

export async function migrateLocalStorageData(userId: string, localData: any) {
  const transaction = await prisma.$transaction(async (tx) => {
    // ユーザー進捗データの移行
    const userProgress = await tx.userProgress.create({
      data: {
        userId,
        totalStudyTime: localData.totalStudyTime || 0,
        overallStats: localData.overallStats || {},
      },
    });

    // プロセス進捗の移行
    for (const [processId, progress] of Object.entries(localData.processProgress || {})) {
      await tx.processProgress.create({
        data: {
          userProgressId: userProgress.id,
          processId,
          isCompleted: progress.completed || false,
          masteryLevel: progress.mastery || 0,
          studyTime: progress.studyTime || 0,
          completedAt: progress.completedAt ? new Date(progress.completedAt) : null,
        },
      });
    }

    return userProgress;
  });

  return transaction;
}
```

---

## 4. 認証・認可設計

### 4.1 NextAuth.js実装

```typescript
// src/server/auth.ts
import NextAuth, { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "~/server/db"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
        role: token.role,
      },
    }),
    jwt: ({ user, token }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

### 4.2 ロールベースアクセス制御（RBAC）

```typescript
// src/server/api/trpc.ts
import { type Session } from "next-auth";

export const createTRPCContext = async (opts: CreateTRPCContextOptions) => {
  const session = await auth();
  
  return {
    session,
    db: prisma,
  };
};

// 権限チェック関数
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const premiumProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["PREMIUM", "ADMIN"].includes(ctx.session.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});
```

### 4.3 セッション管理

```typescript
// src/lib/session.ts
import { Redis } from "ioredis";
import { NextRequest } from "next/server";

const redis = new Redis(process.env.REDIS_URL!);

export class SessionManager {
  private static EXPIRY = 60 * 60 * 24 * 30; // 30 days

  static async createSession(userId: string, deviceInfo: any) {
    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      deviceInfo,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    await redis.setex(`session:${sessionId}`, this.EXPIRY, JSON.stringify(sessionData));
    return sessionId;
  }

  static async getSession(sessionId: string) {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  static async updateActivity(sessionId: string) {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      await redis.setex(`session:${sessionId}`, this.EXPIRY, JSON.stringify(session));
    }
  }

  static async revokeSession(sessionId: string) {
    await redis.del(`session:${sessionId}`);
  }
}
```

---

## 5. ビジネスロジック層

### 5.1 サービス層の設計

```typescript
// src/server/services/progressService.ts
import { prisma } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { PMBOK_PROCESSES } from "~/data/processData";

export class ProgressService {
  static async getProgress(userId: string, filters?: {
    knowledgeArea?: string;
    processGroup?: string;
  }) {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
      include: {
        processProgress: {
          where: {
            ...(filters?.knowledgeArea && { 
              processId: { 
                in: PMBOK_PROCESSES
                  .filter(p => p.knowledgeArea === filters.knowledgeArea)
                  .map(p => p.id)
              }
            }),
          },
        },
      },
    });

    if (!userProgress) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User progress not found",
      });
    }

    return this.calculateProgressStats(userProgress);
  }

  static async updateProgress(userId: string, update: {
    processId: string;
    completed: boolean;
    studyTime: number;
    mastery: number;
  }) {
    const userProgress = await this.ensureUserProgress(userId);
    
    const processProgress = await prisma.processProgress.upsert({
      where: {
        userProgressId_processId: {
          userProgressId: userProgress.id,
          processId: update.processId,
        },
      },
      update: {
        isCompleted: update.completed,
        masteryLevel: update.mastery,
        studyTime: { increment: update.studyTime },
        completedAt: update.completed ? new Date() : null,
        lastReviewedAt: new Date(),
      },
      create: {
        userProgressId: userProgress.id,
        processId: update.processId,
        isCompleted: update.completed,
        masteryLevel: update.mastery,
        studyTime: update.studyTime,
        completedAt: update.completed ? new Date() : null,
        lastReviewedAt: new Date(),
      },
    });

    // 全体進捗の更新
    await this.updateOverallProgress(userId);
    
    return processProgress;
  }

  private static async calculateProgressStats(userProgress: any) {
    const totalProcesses = PMBOK_PROCESSES.length;
    const completedProcesses = userProgress.processProgress.filter(p => p.isCompleted).length;
    const totalProgress = (completedProcesses / totalProcesses) * 100;

    // 知識エリア別進捗
    const knowledgeAreaProgress = Object.values(
      userProgress.processProgress.reduce((acc, progress) => {
        const process = PMBOK_PROCESSES.find(p => p.id === progress.processId);
        if (!process) return acc;

        const area = process.knowledgeArea;
        if (!acc[area]) {
          acc[area] = {
            area,
            completed: 0,
            total: PMBOK_PROCESSES.filter(p => p.knowledgeArea === area).length,
            studyTime: 0,
          };
        }

        if (progress.isCompleted) acc[area].completed++;
        acc[area].studyTime += progress.studyTime;

        return acc;
      }, {})
    ).map(area => ({
      ...area,
      progress: (area.completed / area.total) * 100,
    }));

    return {
      totalProgress,
      completedProcesses,
      totalProcesses,
      knowledgeAreaProgress,
      totalStudyTime: userProgress.totalStudyTime,
      recentActivity: userProgress.processProgress
        .filter(p => p.lastReviewedAt)
        .sort((a, b) => new Date(b.lastReviewedAt).getTime() - new Date(a.lastReviewedAt).getTime())
        .slice(0, 10),
    };
  }

  private static async ensureUserProgress(userId: string) {
    return await prisma.userProgress.upsert({
      where: { userId },
      update: { lastStudySession: new Date() },
      create: {
        userId,
        lastStudySession: new Date(),
        totalStudyTime: 0,
        overallStats: {},
      },
    });
  }

  private static async updateOverallProgress(userId: string) {
    const stats = await this.getProgress(userId);
    
    await prisma.userProgress.update({
      where: { userId },
      data: {
        totalStudyTime: { 
          increment: stats.recentActivity[0]?.studyTime || 0 
        },
        overallStats: {
          totalProgress: stats.totalProgress,
          completedProcesses: stats.completedProcesses,
          knowledgeAreaProgress: stats.knowledgeAreaProgress,
        },
      },
    });
  }
}
```

### 5.2 ドメインモデル

```typescript
// src/server/domain/models/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly role: UserRole,
    public readonly preferences: UserPreferences
  ) {}

  hasPermission(permission: Permission): boolean {
    return ROLE_PERMISSIONS[this.role].includes(permission);
  }

  canAccessPremiumFeatures(): boolean {
    return ["PREMIUM", "ADMIN"].includes(this.role);
  }
}

// src/server/domain/models/LearningProgress.ts
export class LearningProgress {
  constructor(
    public readonly userId: string,
    public readonly processes: Map<string, ProcessProgress>
  ) {}

  getOverallProgress(): number {
    const completed = Array.from(this.processes.values())
      .filter(p => p.isCompleted).length;
    return (completed / this.processes.size) * 100;
  }

  getKnowledgeAreaProgress(area: string): number {
    const areaProcesses = Array.from(this.processes.values())
      .filter(p => PMBOK_PROCESSES.find(pm => pm.id === p.processId)?.knowledgeArea === area);
    
    const completed = areaProcesses.filter(p => p.isCompleted).length;
    return areaProcesses.length > 0 ? (completed / areaProcesses.length) * 100 : 0;
  }

  getRecommendedStudy(): string[] {
    // スタディ推奨ロジック
    return Array.from(this.processes.values())
      .filter(p => !p.isCompleted && p.masteryLevel < 70)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 3)
      .map(p => p.processId);
  }
}
```

### 5.3 バリデーションルール

```typescript
// src/server/validation/schemas.ts
import { z } from "zod";

export const progressUpdateSchema = z.object({
  processId: z.string().min(1),
  completed: z.boolean(),
  studyTime: z.number().min(0).max(480), // 最大8時間
  mastery: z.number().min(0).max(100),
});

export const userProfileSchema = z.object({
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  preferences: z.object({
    language: z.enum(["ja", "en"]).default("ja"),
    theme: z.enum(["light", "dark", "auto"]).default("auto"),
    studyGoal: z.number().min(10).max(480).default(60), // minutes per day
    notifications: z.object({
      email: z.boolean().default(true),
      studyReminder: z.boolean().default(true),
    }),
  }),
});
```

---

## 6. 決済システム設計

### 6.1 Stripe統合

```typescript
// src/server/services/paymentService.ts
import Stripe from "stripe";
import { prisma } from "~/server/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export class PaymentService {
  static async createSubscription(userId: string, planType: SubscriptionPlan) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // Stripeカスタマー作成
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId },
    });

    // サブスクリプション作成
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: PLAN_PRICE_IDS[planType] }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    // DBに保存
    const dbSubscription = await prisma.subscription.create({
      data: {
        userId,
        planType,
        stripeSubscriptionId: subscription.id,
        status: "PENDING",
        startsAt: new Date(),
      },
    });

    return {
      subscriptionId: dbSubscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
    };
  }

  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "invoice.payment_succeeded":
        await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionCancel(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private static async handlePaymentSuccess(invoice: Stripe.Invoice) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (!subscription) return;

    await Promise.all([
      // 支払い記録
      prisma.payment.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          amount: new Decimal(invoice.amount_paid / 100),
          currency: invoice.currency,
          status: "SUCCEEDED",
          stripePaymentId: invoice.payment_intent as string,
        },
      }),
      // サブスクリプションステータス更新
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE" },
      }),
      // ユーザーロール更新
      prisma.user.update({
        where: { id: subscription.userId },
        data: { 
          role: subscription.planType === "PREMIUM" ? "PREMIUM" : "USER" 
        },
      }),
    ]);
  }
}

const PLAN_PRICE_IDS = {
  FREE: null,
  BASIC: process.env.STRIPE_BASIC_PRICE_ID!,
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!,
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};
```

### 6.2 サブスクリプション管理

```typescript
// src/server/api/routers/payment.ts
export const paymentRouter = createTRPCRouter({
  getPlans: publicProcedure.query(() => {
    return [
      {
        id: "FREE",
        name: "無料プラン",
        price: 0,
        features: ["基本的な学習機能", "進捗追跡", "49プロセス学習"],
        limitations: ["AI機能なし", "PMIS機能なし"],
      },
      {
        id: "BASIC",
        name: "ベーシック",
        price: 980,
        features: ["全ての無料機能", "AI学習アシスタント", "詳細分析"],
        stripePriceId: process.env.STRIPE_BASIC_PRICE_ID,
      },
      {
        id: "PREMIUM",
        name: "プレミアム",
        price: 1980,
        features: ["全てのベーシック機能", "PMIS機能", "無制限プロジェクト"],
        stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
      },
    ];
  }),

  createSubscription: protectedProcedure
    .input(z.object({ planType: z.enum(["BASIC", "PREMIUM"]) }))
    .mutation(async ({ ctx, input }) => {
      return await PaymentService.createSubscription(
        ctx.session.user.id, 
        input.planType
      );
    }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.subscription.findFirst({
      where: { 
        userId: ctx.session.user.id,
        status: "ACTIVE",
      },
      include: { payments: true },
    });
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: ctx.session.user.id, status: "ACTIVE" },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    
    return { success: true };
  }),
});
```

---

## 7. キャッシング戦略

### 7.1 Redisの活用

```typescript
// src/server/cache/redis.ts
import { Redis } from "ioredis";

class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache pattern invalidation error:`, error);
    }
  }
}

export const cache = new CacheManager();
```

### 7.2 キャッシュポリシー

```typescript
// src/server/services/cacheService.ts
export class CacheService {
  // ユーザー進捗データのキャッシュ（短期）
  static async getUserProgress(userId: string) {
    const cacheKey = `user:progress:${userId}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) return cached;
    
    const progress = await ProgressService.getProgress(userId);
    await cache.set(cacheKey, progress, 300); // 5分
    
    return progress;
  }

  // PMBOK プロセスデータのキャッシュ（長期）
  static async getPMBOKProcesses() {
    const cacheKey = "pmbok:processes:all";
    const cached = await cache.get(cacheKey);
    
    if (cached) return cached;
    
    const processes = PMBOK_PROCESSES;
    await cache.set(cacheKey, processes, 86400); // 24時間
    
    return processes;
  }

  // AI応答のキャッシュ（中期）
  static async getAIResponse(prompt: string, userId: string) {
    const cacheKey = `ai:response:${hashString(prompt)}:${userId}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) return cached;
    
    const response = await OpenAIService.generateResponse(prompt, userId);
    await cache.set(cacheKey, response, 3600); // 1時間
    
    return response;
  }

  // キャッシュ無効化
  static async invalidateUserCache(userId: string) {
    await cache.invalidatePattern(`user:*:${userId}`);
  }
}
```

### 7.3 レート制限

```typescript
// src/server/middleware/rateLimit.ts
export class RateLimiter {
  static async checkLimit(
    identifier: string, 
    limit: number, 
    window: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;

    // Sliding window log algorithm
    const pipeline = cache.redis.pipeline();
    
    // 古いエントリを削除
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // 現在のリクエストを追加
    pipeline.zadd(key, now, now);
    
    // 現在のリクエスト数をカウント
    pipeline.zcard(key);
    
    // TTL設定
    pipeline.expire(key, window);
    
    const results = await pipeline.exec();
    const currentRequests = results?.[2]?.[1] as number;
    
    const allowed = currentRequests <= limit;
    const remaining = Math.max(0, limit - currentRequests);
    const resetTime = now + window * 1000;
    
    return { allowed, remaining, resetTime };
  }
}

// tRPCミドルウェア
export const rateLimitMiddleware = (limit: number, window: number) => {
  return middleware(async ({ ctx, next, path }) => {
    const identifier = ctx.session?.user?.id || ctx.req.ip || "anonymous";
    const result = await RateLimiter.checkLimit(`${path}:${identifier}`, limit, window);
    
    if (!result.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
      });
    }
    
    return next();
  });
};
```

---

## 8. ファイルストレージ

### 8.1 アップロード処理

```typescript
// src/server/api/routers/upload.ts
import { put } from "@vercel/blob";

export const uploadRouter = createTRPCRouter({
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 署名付きURL生成
      const { url, downloadUrl } = await put(
        `avatars/${ctx.session.user.id}/${input.fileName}`,
        new Uint8Array(), // プレースホルダー
        {
          access: "public",
          contentType: input.contentType,
        }
      );

      return { uploadUrl: url, downloadUrl };
    }),

  uploadStudyMaterial: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        contentType: z.string(),
        size: z.number().max(10 * 1024 * 1024), // 10MB制限
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { url, downloadUrl } = await put(
        `materials/${ctx.session.user.id}/${Date.now()}-${input.fileName}`,
        new Uint8Array(),
        {
          access: "private",
          contentType: input.contentType,
        }
      );

      // DB記録
      await prisma.studyMaterial.create({
        data: {
          userId: ctx.session.user.id,
          fileName: input.fileName,
          fileUrl: downloadUrl,
          fileSize: input.size,
          contentType: input.contentType,
        },
      });

      return { uploadUrl: url, downloadUrl };
    }),
});
```

### 8.2 画像最適化

```typescript
// src/server/services/imageService.ts
import sharp from "sharp";

export class ImageService {
  static async optimizeImage(buffer: Buffer, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  }) {
    const { width = 800, height, quality = 80, format = "webp" } = options;

    return await sharp(buffer)
      .resize(width, height, { 
        fit: "inside", 
        withoutEnlargement: true 
      })
      .toFormat(format, { quality })
      .toBuffer();
  }

  static async generateThumbnail(buffer: Buffer, size: number = 150) {
    return await sharp(buffer)
      .resize(size, size, { fit: "cover" })
      .toFormat("webp", { quality: 70 })
      .toBuffer();
  }

  static async processAvatar(buffer: Buffer) {
    const optimized = await this.optimizeImage(buffer, {
      width: 400,
      height: 400,
      format: "webp",
      quality: 85,
    });

    const thumbnail = await this.generateThumbnail(buffer, 100);

    return { optimized, thumbnail };
  }
}
```

---

## 9. 非同期処理

### 9.1 ジョブキュー設計

```typescript
// src/server/queue/jobQueue.ts
import { Queue, Worker, Job } from "bullmq";
import { cache } from "../cache/redis";

interface JobData {
  userId: string;
  type: string;
  payload: any;
}

export class JobQueue {
  private static queues = new Map<string, Queue>();
  private static workers = new Map<string, Worker>();

  static getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: cache.redis,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  static createWorker(queueName: string, processor: (job: Job<JobData>) => Promise<any>) {
    const worker = new Worker(queueName, processor, {
      connection: cache.redis,
      concurrency: 5,
    });

    worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  static async addJob(queueName: string, data: JobData, options?: any) {
    const queue = this.getQueue(queueName);
    return await queue.add(data.type, data, options);
  }
}

// Email送信ジョブ
JobQueue.createWorker("email", async (job: Job<JobData>) => {
  const { userId, payload } = job.data;
  await EmailService.sendEmail(payload.to, payload.subject, payload.template, payload.data);
});

// AI処理ジョブ
JobQueue.createWorker("ai", async (job: Job<JobData>) => {
  const { userId, payload } = job.data;
  const response = await OpenAIService.generateResponse(payload.prompt, userId);
  
  // 結果をキャッシュに保存
  await cache.set(`ai:result:${job.id}`, response, 3600);
  
  return response;
});

// データ分析ジョブ
JobQueue.createWorker("analytics", async (job: Job<JobData>) => {
  const { userId, payload } = job.data;
  const analytics = await AnalyticsService.generateReport(userId, payload.period);
  
  // レポートをメール送信
  await JobQueue.addJob("email", {
    userId,
    type: "analytics_report",
    payload: {
      to: payload.email,
      subject: "学習分析レポート",
      template: "analytics_report",
      data: analytics,
    },
  });
});
```

### 9.2 バックグラウンドタスク

```typescript
// src/server/services/backgroundTasks.ts
export class BackgroundTasks {
  // 毎日の学習リマインダー
  static async scheduleStudyReminders() {
    const users = await prisma.user.findMany({
      where: {
        preferences: {
          path: ["notifications", "studyReminder"],
          equals: true,
        },
      },
    });

    for (const user of users) {
      await JobQueue.addJob("email", {
        userId: user.id,
        type: "study_reminder",
        payload: {
          to: user.email,
          subject: "今日の学習を始めましょう！",
          template: "study_reminder",
          data: { name: user.name },
        },
      }, {
        delay: this.calculateReminderDelay(user.preferences),
      });
    }
  }

  // 週次進捗レポート
  static async generateWeeklyReports() {
    const users = await prisma.user.findMany({
      where: { role: { in: ["PREMIUM", "BASIC"] } },
    });

    for (const user of users) {
      await JobQueue.addJob("analytics", {
        userId: user.id,
        type: "weekly_report",
        payload: {
          email: user.email,
          period: "week",
        },
      });
    }
  }

  // 非アクティブユーザーのクリーンアップ
  static async cleanupInactiveUsers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await prisma.user.findMany({
      where: {
        userProgress: {
          lastStudySession: { lt: thirtyDaysAgo },
        },
        role: "USER", // 無料ユーザーのみ
      },
    });

    for (const user of inactiveUsers) {
      await JobQueue.addJob("email", {
        userId: user.id,
        type: "reactivation",
        payload: {
          to: user.email,
          subject: "また一緒に学習を始めませんか？",
          template: "reactivation",
          data: { name: user.name },
        },
      });
    }
  }

  private static calculateReminderDelay(preferences: any): number {
    const studyTime = preferences.studyTime || "19:00";
    const [hours, minutes] = studyTime.split(":").map(Number);
    
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    return reminderTime.getTime() - now.getTime();
  }
}
```

---

## 10. 外部API統合

### 10.1 OpenAI API（AI機能）

```typescript
// src/server/services/openaiService.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export class OpenAIService {
  static async generateStudyRecommendation(userId: string, userProgress: any) {
    const prompt = this.buildRecommendationPrompt(userProgress);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "あなたはPMP試験対策の専門講師です。ユーザーの学習進捗に基づいて個別の学習提案を行います。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const recommendation = response.choices[0]?.message?.content;
    
    // 使用量追跡
    await this.trackTokenUsage(userId, response.usage);
    
    return {
      recommendation,
      timestamp: new Date(),
      tokensUsed: response.usage?.total_tokens,
    };
  }

  static async generateQuizQuestions(processId: string, difficulty: "easy" | "medium" | "hard") {
    const process = PMBOK_PROCESSES.find(p => p.id === processId);
    if (!process) throw new Error("Process not found");

    const prompt = `
PMBOK第6版の「${process.name}」プロセスについて、${difficulty}レベルの選択問題を3問生成してください。

要件:
- 各問題は4択形式
- 実際のPMP試験形式に準拠
- 正解の解説を含める
- ITTOの理解を確認する内容

JSON形式で回答:
{
  "questions": [
    {
      "question": "問題文",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "解説"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}");
  }

  private static buildRecommendationPrompt(userProgress: any): string {
    return `
ユーザーの学習進捗:
- 全体進捗: ${userProgress.totalProgress}%
- 完了プロセス数: ${userProgress.completedProcesses}/${userProgress.totalProcesses}
- 最近の学習履歴: ${JSON.stringify(userProgress.recentActivity.slice(0, 5))}

弱点のある知識エリア:
${userProgress.knowledgeAreaProgress
  .filter((area: any) => area.progress < 50)
  .map((area: any) => `- ${area.area}: ${area.progress}%`)
  .join('\n')}

以下の形式で学習提案を行ってください:
1. 優先的に学習すべき知識エリア
2. 具体的な学習アクション
3. 推定学習時間
4. モチベーション維持のためのアドバイス
`;
  }

  private static async trackTokenUsage(userId: string, usage: any) {
    await prisma.aiUsage.create({
      data: {
        userId,
        tokensUsed: usage?.total_tokens || 0,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        cost: this.calculateCost(usage),
      },
    });
  }

  private static calculateCost(usage: any): number {
    const COST_PER_1K_TOKENS = {
      prompt: 0.01,
      completion: 0.03,
    };
    
    const promptCost = (usage?.prompt_tokens || 0) * COST_PER_1K_TOKENS.prompt / 1000;
    const completionCost = (usage?.completion_tokens || 0) * COST_PER_1K_TOKENS.completion / 1000;
    
    return promptCost + completionCost;
  }
}
```

### 10.2 メールサービス（Resend）

```typescript
// src/server/services/emailService.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export class EmailService {
  static async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: any
  ) {
    const html = await this.renderTemplate(template, data);
    
    const result = await resend.emails.send({
      from: "PMP Learning <noreply@pmplaerning.com>",
      to,
      subject,
      html,
    });

    // 送信ログ記録
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template,
        status: result.error ? "FAILED" : "SENT",
        resendId: result.data?.id,
        error: result.error?.message,
      },
    });

    return result;
  }

  static async sendWelcomeEmail(user: any) {
    return await this.sendEmail(
      user.email,
      "PMP Learning へようこそ！",
      "welcome",
      { name: user.name || "さん" }
    );
  }

  static async sendStudyReminder(user: any, todayGoal: any) {
    return await this.sendEmail(
      user.email,
      "今日の学習目標をクリアしましょう！",
      "study_reminder",
      { 
        name: user.name || "さん",
        todayGoal,
        progressUrl: `${process.env.NEXTAUTH_URL}/progress`,
      }
    );
  }

  static async sendProgressReport(user: any, report: any) {
    return await this.sendEmail(
      user.email,
      "週間学習レポートをお届けします",
      "progress_report",
      {
        name: user.name || "さん",
        report,
      }
    );
  }

  private static async renderTemplate(template: string, data: any): string {
    const templates = {
      welcome: `
        <h1>PMP Learning へようこそ、${data.name}！</h1>
        <p>PMBOK第6版の学習を始めましょう。</p>
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard">学習を開始する</a></p>
      `,
      study_reminder: `
        <h1>今日の学習目標</h1>
        <p>${data.name}、今日も学習を続けましょう！</p>
        <p>目標: ${data.todayGoal.processCount}プロセスの学習</p>
        <p><a href="${data.progressUrl}">進捗を確認する</a></p>
      `,
      progress_report: `
        <h1>週間学習レポート</h1>
        <p>${data.name}の今週の学習実績をお届けします。</p>
        <ul>
          <li>学習時間: ${data.report.totalStudyTime}分</li>
          <li>完了プロセス: ${data.report.completedProcesses}個</li>
          <li>全体進捗: ${data.report.overallProgress}%</li>
        </ul>
      `,
    };

    return templates[template as keyof typeof templates] || "";
  }
}
```

---

## 11. セキュリティ設計

### 11.1 入力検証

```typescript
// src/server/middleware/validation.ts
import { z } from "zod";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export class ValidationService {
  // XSS対策
  static sanitizeHtml(input: string): string {
    return purify.sanitize(input, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
      ALLOWED_ATTR: [],
    });
  }

  // SQLインジェクション対策（Prismaは自動対応だが追加チェック）
  static sanitizeSqlInput(input: string): string {
    return input.replace(/['"\\;]/g, "");
  }

  // ファイル名の検証
  static validateFileName(fileName: string): boolean {
    const allowedPattern = /^[a-zA-Z0-9._-]+$/;
    const maxLength = 255;
    
    return (
      allowedPattern.test(fileName) &&
      fileName.length <= maxLength &&
      !fileName.startsWith(".") &&
      !["CON", "PRN", "AUX"].includes(fileName.toUpperCase())
    );
  }

  // パスワード強度チェック
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("パスワードは8文字以上である必要があります");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("大文字を含める必要があります");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("小文字を含める必要があります");
    }
    
    if (!/\d/.test(password)) {
      errors.push("数字を含める必要があります");
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("特殊文字を含める必要があります");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// tRPC入力検証ミドルウェア
export const validationMiddleware = middleware(async ({ input, next }) => {
  // 文字列入力のサニタイズ
  if (typeof input === "object" && input !== null) {
    const sanitizedInput = sanitizeObject(input);
    return next({ input: sanitizedInput });
  }
  
  return next();
});

function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return ValidationService.sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === "object" && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
```

### 11.2 CSRF対策

```typescript
// src/server/middleware/csrf.ts
import { createHash, randomBytes } from "crypto";

export class CSRFProtection {
  static generateToken(sessionId: string): string {
    const secret = process.env.CSRF_SECRET!;
    const randomValue = randomBytes(16).toString("hex");
    const timestamp = Date.now().toString();
    
    const payload = `${sessionId}-${randomValue}-${timestamp}`;
    const hash = createHash("sha256")
      .update(payload + secret)
      .digest("hex");
    
    return Buffer.from(`${payload}-${hash}`).toString("base64");
  }

  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, "base64").toString();
      const parts = decoded.split("-");
      
      if (parts.length !== 4) return false;
      
      const [tokenSessionId, randomValue, timestamp, hash] = parts;
      
      // セッションIDの検証
      if (tokenSessionId !== sessionId) return false;
      
      // タイムスタンプの検証（1時間以内）
      const tokenTime = parseInt(timestamp);
      if (Date.now() - tokenTime > 3600000) return false;
      
      // ハッシュの検証
      const secret = process.env.CSRF_SECRET!;
      const payload = `${tokenSessionId}-${randomValue}-${timestamp}`;
      const expectedHash = createHash("sha256")
        .update(payload + secret)
        .digest("hex");
      
      return hash === expectedHash;
    } catch {
      return false;
    }
  }
}
```

### 11.3 監査ログ

```typescript
// src/server/services/auditService.ts
export class AuditService {
  static async logAction(
    userId: string,
    action: string,
    resource: string,
    details?: any,
    ipAddress?: string
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent: details?.userAgent,
        timestamp: new Date(),
      },
    });
  }

  static async logSecurityEvent(
    event: "LOGIN_FAILED" | "RATE_LIMIT_EXCEEDED" | "SUSPICIOUS_ACTIVITY",
    userId?: string,
    details?: any,
    ipAddress?: string
  ) {
    await prisma.securityLog.create({
      data: {
        event,
        userId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        severity: this.getSeverity(event),
        timestamp: new Date(),
      },
    });

    // 重要度の高いイベントはアラート送信
    if (this.getSeverity(event) === "HIGH") {
      await this.sendSecurityAlert(event, details);
    }
  }

  private static getSeverity(event: string): "LOW" | "MEDIUM" | "HIGH" {
    const severityMap = {
      LOGIN_FAILED: "MEDIUM",
      RATE_LIMIT_EXCEEDED: "HIGH",
      SUSPICIOUS_ACTIVITY: "HIGH",
    };
    
    return severityMap[event as keyof typeof severityMap] || "LOW";
  }

  private static async sendSecurityAlert(event: string, details: any) {
    // 管理者にセキュリティアラートを送信
    await EmailService.sendEmail(
      process.env.ADMIN_EMAIL!,
      `セキュリティアラート: ${event}`,
      "security_alert",
      { event, details, timestamp: new Date() }
    );
  }
}
```

---

## 12. パフォーマンス最適化

### 12.1 クエリ最適化

```typescript
// src/server/services/optimizedQueries.ts
export class OptimizedQueries {
  // N+1問題を回避したユーザー進捗取得
  static async getUserProgressWithDetails(userId: string) {
    return await prisma.userProgress.findUnique({
      where: { userId },
      include: {
        processProgress: {
          include: {
            // 関連データを一度に取得
            user: {
              select: { name: true, email: true },
            },
          },
          orderBy: { lastReviewedAt: "desc" },
        },
        user: {
          include: {
            subscription: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });
  }

  // バッチ処理でのプロセス進捗更新
  static async batchUpdateProgress(updates: Array<{
    userProgressId: string;
    processId: string;
    data: any;
  }>) {
    const transaction = await prisma.$transaction(
      updates.map(update =>
        prisma.processProgress.upsert({
          where: {
            userProgressId_processId: {
              userProgressId: update.userProgressId,
              processId: update.processId,
            },
          },
          update: update.data,
          create: {
            userProgressId: update.userProgressId,
            processId: update.processId,
            ...update.data,
          },
        })
      )
    );

    return transaction;
  }

  // 効率的な統計計算
  static async calculateUserStats(userId: string) {
    const stats = await prisma.processProgress.aggregate({
      where: {
        userProgress: { userId },
      },
      _count: {
        _all: true,
        isCompleted: true,
      },
      _sum: {
        studyTime: true,
      },
      _avg: {
        masteryLevel: true,
      },
    });

    const knowledgeAreaStats = await prisma.$queryRaw`
      SELECT 
        process_data.knowledge_area,
        COUNT(*) as total_processes,
        COUNT(CASE WHEN pp.is_completed THEN 1 END) as completed_processes,
        AVG(pp.mastery_level) as avg_mastery
      FROM process_progress pp
      JOIN user_progress up ON pp.user_progress_id = up.id
      JOIN (VALUES ${Prisma.join(
        PMBOK_PROCESSES.map(p => 
          Prisma.sql`(${p.id}, ${p.knowledgeArea})`
        )
      )}) AS process_data(id, knowledge_area) 
        ON pp.process_id = process_data.id
      WHERE up.user_id = ${userId}
      GROUP BY process_data.knowledge_area
    `;

    return {
      overall: stats,
      knowledgeAreas: knowledgeAreaStats,
    };
  }
}
```

### 12.2 遅延ロード

```typescript
// src/server/api/routers/progress.ts - 遅延ロード対応
export const progressRouter = createTRPCRouter({
  getProgress: protectedProcedure
    .input(
      z.object({
        includeDetails: z.boolean().default(false),
        includeHistory: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const baseQuery = {
        where: { userId: ctx.session.user.id },
      };

      // 基本データ
      const progress = await prisma.userProgress.findUnique(baseQuery);
      
      if (!progress) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // 条件付きで詳細データを取得
      const result: any = { ...progress };

      if (input.includeDetails) {
        result.processProgress = await prisma.processProgress.findMany({
          where: { userProgressId: progress.id },
          take: input.limit,
          skip: input.offset,
          orderBy: { updatedAt: "desc" },
        });
      }

      if (input.includeHistory) {
        result.studySessions = await prisma.studySession.findMany({
          where: { userId: ctx.session.user.id },
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: "desc" },
        });
      }

      return result;
    }),

  // 無限スクロール対応
  getProgressHistory: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const items = await prisma.processProgress.findMany({
        where: {
          userProgress: { userId: ctx.session.user.id },
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updatedAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
```

### 12.3 バッチ処理

```typescript
// src/server/services/batchProcessor.ts
export class BatchProcessor {
  // バッチサイズでの処理
  static async processInBatches<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 100
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      // バッチ間で少し待機（レート制限対策）
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  // 並列バッチ処理
  static async processInParallelBatches<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const promises = batch.map(item => processor(item));
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error(`Failed to process item ${i + index}:`, result.reason);
        }
      });
    }
    
    return results;
  }

  // データベースバッチ更新
  static async batchUpdateUsers(updates: Array<{
    id: string;
    data: any;
  }>) {
    return await this.processInBatches(
      updates,
      async (batch) => {
        return await prisma.$transaction(
          batch.map(update =>
            prisma.user.update({
              where: { id: update.id },
              data: update.data,
            })
          )
        );
      },
      50 // 50件ずつ処理
    );
  }
}
```

---

## 13. エラー処理とログ

### 13.1 エラー分類

```typescript
// src/server/errors/customErrors.ts
export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
  
  constructor(message: string, public readonly context?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  readonly statusCode = 400;
  readonly isOperational = true;
}

export class AuthenticationError extends BaseError {
  readonly statusCode = 401;
  readonly isOperational = true;
}

export class AuthorizationError extends BaseError {
  readonly statusCode = 403;
  readonly isOperational = true;
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404;
  readonly isOperational = true;
}

export class BusinessLogicError extends BaseError {
  readonly statusCode = 422;
  readonly isOperational = true;
}

export class ExternalServiceError extends BaseError {
  readonly statusCode = 503;
  readonly isOperational = true;
}

export class DatabaseError extends BaseError {
  readonly statusCode = 500;
  readonly isOperational = false;
}
```

### 13.2 構造化ログ

```typescript
// src/server/services/loggerService.ts
import winston from "winston";

class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: "pmp-learning-backend",
        version: process.env.npm_package_version || "unknown",
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });

    // 本番環境では外部ログサービスに送信
    if (process.env.NODE_ENV === "production") {
      this.logger.add(
        new winston.transports.Http({
          host: process.env.LOG_ENDPOINT_HOST,
          port: process.env.LOG_ENDPOINT_PORT,
          path: "/logs",
        })
      );
    }
  }

  info(message: string, meta?: any) {
    this.logger.info(message, this.enrichMeta(meta));
  }

  error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, this.enrichMeta({
      ...meta,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    }));
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, this.enrichMeta(meta));
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, this.enrichMeta(meta));
  }

  // API呼び出しログ
  logApiCall(
    method: string,
    endpoint: string,
    userId: string | null,
    duration: number,
    statusCode: number,
    meta?: any
  ) {
    this.info("API Call", {
      type: "api_call",
      method,
      endpoint,
      userId,
      duration,
      statusCode,
      ...meta,
    });
  }

  // ビジネスイベントログ
  logBusinessEvent(
    event: string,
    userId: string,
    data?: any
  ) {
    this.info("Business Event", {
      type: "business_event",
      event,
      userId,
      data,
    });
  }

  // パフォーマンスログ
  logPerformance(
    operation: string,
    duration: number,
    meta?: any
  ) {
    this.info("Performance", {
      type: "performance",
      operation,
      duration,
      ...meta,
    });
  }

  private enrichMeta(meta: any = {}) {
    return {
      ...meta,
      timestamp: new Date().toISOString(),
      traceId: this.generateTraceId(),
    };
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

export const logger = new LoggerService();
```

### 13.3 エラー監視

```typescript
// src/server/middleware/errorHandler.ts
import * as Sentry from "@sentry/node";
import { logger } from "../services/loggerService";
import { BaseError } from "../errors/customErrors";

export class ErrorHandler {
  static initialize() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      });
    }
  }

  static handleError(error: Error, context?: any) {
    // ログ出力
    logger.error("Unhandled error", error, context);

    // Sentryに送信（本番環境のみ）
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, {
        tags: { component: "error_handler" },
        extra: context,
      });
    }

    // 運用エラーかどうかで処理を分岐
    if (error instanceof BaseError && error.isOperational) {
      return this.handleOperationalError(error);
    }

    return this.handleNonOperationalError(error);
  }

  private static handleOperationalError(error: BaseError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      isOperational: true,
    };
  }

  private static handleNonOperationalError(error: Error) {
    // 本番環境では詳細なエラー情報を隠す
    if (process.env.NODE_ENV === "production") {
      return {
        statusCode: 500,
        message: "Internal server error",
        isOperational: false,
      };
    }

    return {
      statusCode: 500,
      message: error.message,
      stack: error.stack,
      isOperational: false,
    };
  }
}

// tRPCエラーフォーマッター
export const errorFormatter: TRPCErrorFormatter<any> = ({ error, shape }) => {
  const handledError = ErrorHandler.handleError(error.cause || error);
  
  return {
    ...shape,
    data: {
      ...shape.data,
      statusCode: handledError.statusCode,
      isOperational: handledError.isOperational,
    },
  };
};
```

---

## 14. テスト戦略

### 14.1 ユニットテスト

```typescript
// __tests__/services/progressService.test.ts
import { ProgressService } from "../../src/server/services/progressService";
import { prisma } from "../../src/server/db";
import { PMBOK_PROCESSES } from "../../src/data/processData";

jest.mock("../../src/server/db", () => ({
  prisma: {
    userProgress: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    processProgress: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe("ProgressService", () => {
  const mockUserId = "user-123";
  const mockUserProgress = {
    id: "progress-123",
    userId: mockUserId,
    totalStudyTime: 120,
    processProgress: [
      {
        id: "pp-1",
        processId: "process-1",
        isCompleted: true,
        masteryLevel: 85,
        studyTime: 60,
        lastReviewedAt: new Date(),
      },
      {
        id: "pp-2",
        processId: "process-2",
        isCompleted: false,
        masteryLevel: 40,
        studyTime: 30,
        lastReviewedAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProgress", () => {
    it("ユーザーの学習進捗を正しく計算する", async () => {
      // Arrange
      (prisma.userProgress.findUnique as jest.Mock).mockResolvedValue(mockUserProgress);

      // Act
      const result = await ProgressService.getProgress(mockUserId);

      // Assert
      expect(result.totalProgress).toBeCloseTo(2 / PMBOK_PROCESSES.length * 100);
      expect(result.completedProcesses).toBe(1);
      expect(result.totalProcesses).toBe(PMBOK_PROCESSES.length);
      expect(prisma.userProgress.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: { processProgress: { where: {} } },
      });
    });

    it("存在しないユーザーの場合はエラーを投げる", async () => {
      // Arrange
      (prisma.userProgress.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(ProgressService.getProgress(mockUserId)).rejects.toThrow("User progress not found");
    });
  });

  describe("updateProgress", () => {
    it("プロセス進捗を正しく更新する", async () => {
      // Arrange
      const updateData = {
        processId: "process-1",
        completed: true,
        studyTime: 30,
        mastery: 90,
      };

      (prisma.userProgress.upsert as jest.Mock).mockResolvedValue(mockUserProgress);
      (prisma.processProgress.upsert as jest.Mock).mockResolvedValue({
        id: "pp-1",
        ...updateData,
      });

      // Act
      const result = await ProgressService.updateProgress(mockUserId, updateData);

      // Assert
      expect(prisma.processProgress.upsert).toHaveBeenCalledWith({
        where: {
          userProgressId_processId: {
            userProgressId: mockUserProgress.id,
            processId: updateData.processId,
          },
        },
        update: {
          isCompleted: updateData.completed,
          masteryLevel: updateData.mastery,
          studyTime: { increment: updateData.studyTime },
          completedAt: expect.any(Date),
          lastReviewedAt: expect.any(Date),
        },
        create: expect.objectContaining({
          userProgressId: mockUserProgress.id,
          processId: updateData.processId,
          isCompleted: updateData.completed,
        }),
      });
    });
  });
});
```

### 14.2 統合テスト

```typescript
// __tests__/api/progress.integration.test.ts
import { createTRPCMsw } from "msw-trpc";
import { setupServer } from "msw/node";
import { appRouter } from "../../src/server/api/root";
import type { AppRouter } from "../../src/server/api/root";

const trpcMsw = createTRPCMsw<AppRouter>();
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("/api/trpc/progress", () => {
  it("認証済みユーザーが進捗を取得できる", async () => {
    // Arrange
    server.use(
      trpcMsw.progress.getProgress.query((req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            totalProgress: 25.5,
            completedProcesses: 12,
            totalProcesses: 49,
            knowledgeAreaProgress: [],
            recentActivity: [],
          })
        );
      })
    );

    // Act
    const response = await fetch("/api/trpc/progress.getProgress", {
      method: "GET",
      headers: {
        "Authorization": "Bearer valid-token",
      },
    });

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.totalProgress).toBe(25.5);
  });

  it("未認証ユーザーは401エラーを受け取る", async () => {
    // Act
    const response = await fetch("/api/trpc/progress.getProgress", {
      method: "GET",
    });

    // Assert
    expect(response.status).toBe(401);
  });
});
```

### 14.3 E2Eテスト

```typescript
// __tests__/e2e/learning-flow.test.ts
import { test, expect } from "@playwright/test";

test.describe("学習フロー", () => {
  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await page.goto("/auth/signin");
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "testpassword123");
    await page.click('[data-testid="signin-button"]');
    
    // ダッシュボードに遷移することを確認
    await expect(page).toHaveURL("/dashboard");
  });

  test("ユーザーはプロセスを学習して進捗を更新できる", async ({ page }) => {
    // プロセス一覧に移動
    await page.click('[data-testid="processes-nav"]');
    
    // 最初のプロセスをクリック
    await page.click('[data-testid="process-card"]:first-child');
    
    // 学習開始
    await page.click('[data-testid="start-learning"]');
    
    // 学習内容を確認
    await expect(page.locator('[data-testid="process-content"]')).toBeVisible();
    
    // 完了ボタンをクリック
    await page.click('[data-testid="mark-complete"]');
    
    // 進捗が更新されることを確認
    await page.goto("/progress");
    const progressText = await page.textContent('[data-testid="overall-progress"]');
    expect(parseInt(progressText || "0")).toBeGreaterThan(0);
  });

  test("プレミアムユーザーはAI機能を使用できる", async ({ page }) => {
    // プレミアムユーザーでログイン（別のテストユーザー）
    await page.goto("/auth/signin");
    await page.fill('[data-testid="email"]', "premium@example.com");
    await page.fill('[data-testid="password"]', "testpassword123");
    await page.click('[data-testid="signin-button"]');

    // AI学習アシスタントに移動
    await page.goto("/ai-assistant");
    
    // 質問を入力
    await page.fill('[data-testid="ai-question"]', "PMBOKの統合管理について教えて");
    await page.click('[data-testid="ask-ai"]');
    
    // AI応答を確認
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-response"]')).toContainText("統合管理");
  });

  test("無料ユーザーはプレミアム機能にアクセスできない", async ({ page }) => {
    // AI機能にアクセスしようとする
    await page.goto("/ai-assistant");
    
    // アップグレードプロンプトが表示される
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
    await expect(page.locator('[data-testid="upgrade-button"]')).toBeVisible();
  });
});
```

### 14.4 パフォーマンステスト

```typescript
// __tests__/performance/load.test.ts
import { performance } from "perf_hooks";

describe("パフォーマンステスト", () => {
  test("進捗取得APIが100ms以内に応答する", async () => {
    const start = performance.now();
    
    const response = await fetch("/api/trpc/progress.getProgress", {
      headers: { "Authorization": "Bearer test-token" },
    });
    
    const end = performance.now();
    const duration = end - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(100);
  });

  test("大量データでの統計計算が5秒以内に完了する", async () => {
    // 1000個のプロセス進捗データを作成
    const largeProgressData = Array.from({ length: 1000 }, (_, i) => ({
      processId: `process-${i}`,
      isCompleted: Math.random() > 0.5,
      masteryLevel: Math.floor(Math.random() * 100),
      studyTime: Math.floor(Math.random() * 300),
    }));

    const start = performance.now();
    
    // 統計計算実行（モック）
    const stats = calculateProgressStats(largeProgressData);
    
    const end = performance.now();
    const duration = end - start;
    
    expect(stats).toBeDefined();
    expect(duration).toBeLessThan(5000);
  });
});

// 負荷テスト用スクリプト
// scripts/load-test.js
import { check } from "k6";
import http from "k6/http";

export let options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "5m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.1"],
  },
};

export default function () {
  const response = http.get("http://localhost:3000/api/trpc/progress.getProgress", {
    headers: { "Authorization": "Bearer test-token" },
  });
  
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
```

---

## 15. デプロイメント

### 15.1 CI/CDパイプライン

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "18"
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/testdb

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Build application
        run: npm run build

      - name: Run security audit
        run: npm audit --production

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx prisma migrate deploy

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          TEST_URL: ${{ steps.deploy.outputs.preview-url }}

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 15.2 環境変数管理

```typescript
// src/env.js - 環境変数検証
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    
    // Authentication
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    
    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    
    // Payment
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    
    // External APIs
    OPENAI_API_KEY: z.string().startsWith("sk-"),
    RESEND_API_KEY: z.string().min(1),
    
    // Monitoring
    SENTRY_DSN: z.string().url().optional(),
    
    // Security
    CSRF_SECRET: z.string().min(32),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  },
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    CSRF_SECRET: process.env.CSRF_SECRET,
    
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});
```

### 15.3 ヘルスチェック

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { cache } from "~/server/cache/redis";

export async function GET() {
  const checks = await Promise.allSettled([
    // Database health check
    checkDatabase(),
    
    // Redis health check
    checkRedis(),
    
    // External APIs health check
    checkExternalAPIs(),
  ]);

  const results = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    checks: {
      database: getCheckResult(checks[0]),
      redis: getCheckResult(checks[1]),
      external_apis: getCheckResult(checks[2]),
    },
  };

  const isHealthy = Object.values(results.checks).every(
    check => check.status === "ok"
  );

  return NextResponse.json(
    results,
    { status: isHealthy ? 200 : 503 }
  );
}

async function checkDatabase() {
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const duration = Date.now() - start;
  
  return {
    status: "ok",
    duration: `${duration}ms`,
    message: "Database connection successful",
  };
}

async function checkRedis() {
  const start = Date.now();
  await cache.redis.ping();
  const duration = Date.now() - start;
  
  return {
    status: "ok",
    duration: `${duration}ms`,
    message: "Redis connection successful",
  };
}

async function checkExternalAPIs() {
  const results = await Promise.allSettled([
    // Stripe API
    fetch("https://api.stripe.com/v1/account", {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    }),
    
    // OpenAI API
    fetch("https://api.openai.com/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
    }),
  ]);

  const allSuccessful = results.every(
    result => result.status === "fulfilled" && result.value.ok
  );

  return {
    status: allSuccessful ? "ok" : "degraded",
    message: allSuccessful 
      ? "All external APIs responding" 
      : "Some external APIs may be experiencing issues",
  };
}

function getCheckResult(promiseResult: PromiseSettledResult<any>) {
  if (promiseResult.status === "fulfilled") {
    return promiseResult.value;
  }
  
  return {
    status: "error",
    message: promiseResult.reason?.message || "Health check failed",
  };
}
```

### 15.4 グレースフルシャットダウン

```typescript
// src/server/gracefulShutdown.ts
import { logger } from "./services/loggerService";

class GracefulShutdown {
  private connections: Set<any> = new Set();
  private isShuttingDown = false;

  register(connection: any) {
    this.connections.add(connection);
  }

  unregister(connection: any) {
    this.connections.delete(connection);
  }

  async shutdown(signal: string) {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown`);

    // 新しいリクエストの受付を停止
    if (global.server) {
      global.server.close(() => {
        logger.info("HTTP server closed");
      });
    }

    // アクティブな接続の終了を待機
    const closePromises = Array.from(this.connections).map(
      connection => this.closeConnection(connection)
    );

    // 最大30秒待機
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Shutdown timeout")), 30000);
    });

    try {
      await Promise.race([
        Promise.all(closePromises),
        timeout,
      ]);
      
      logger.info("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("Forced shutdown due to timeout", error);
      process.exit(1);
    }
  }

  private async closeConnection(connection: any): Promise<void> {
    try {
      if (connection.close) {
        await connection.close();
      } else if (connection.end) {
        connection.end();
      }
    } catch (error) {
      logger.error("Error closing connection", error);
    }
  }
}

const gracefulShutdown = new GracefulShutdown();

// シグナルハンドラーの設定
process.on("SIGTERM", () => gracefulShutdown.shutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown.shutdown("SIGINT"));

export { gracefulShutdown };
```

---

## まとめ

本設計書では、PMPLearningManagementプロジェクトのNext.js 14への移行に向けた包括的なバックエンドアーキテクチャを提示しました。

### 主要な特徴

1. **型安全性の確保**: TypeScript + tRPCによるエンドツーエンド型安全性
2. **スケーラブルな設計**: モノリスからマイクロサービスへの将来的移行を考慮
3. **コスト効率**: 無料枠を最大活用したアーキテクチャ
4. **実装可能性**: 2-3名チームで3ヶ月での実装を想定
5. **保守性**: クリーンアーキテクチャによる持続可能な開発

### 技術選択の根拠

- **Next.js 14**: フルスタック開発、SEO最適化、Vercelとの親和性
- **tRPC**: 型安全なAPI開発、開発効率向上
- **Prisma**: 型安全なORM、マイグレーション管理
- **PostgreSQL**: ACID準拠、JSON型サポート、スケーラビリティ
- **Redis**: 高速キャッシング、セッション管理、ジョブキュー
- **NextAuth.js**: セキュアな認証、OAuth統合

### 実装ロードマップ

**Phase 1（1-3ヶ月）**: MVP機能
- 基本的な認証・認可
- 学習進捗管理
- 決済システム統合
- データ移行

**Phase 2（4-6ヶ月）**: 高度な機能
- AI学習アシスタント
- PMIS基本機能
- リアルタイム機能
- 外部API統合

この設計書に基づいて実装することで、堅牢でスケーラブル、かつ保守しやすいバックエンドシステムを構築できるでしょう。