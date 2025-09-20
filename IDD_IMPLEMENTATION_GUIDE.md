# 🏗️ IDD (Interface Driven Development) 実装ガイド

**プロジェクト**: PMPLearningManagement  
**目標**: インターフェース駆動開発による高品質・高保守性アーキテクチャの実現

## 📋 概要

Interface Driven Development (IDD) は、インターフェースを中心とした設計手法により、テスタビリティ、保守性、拡張性を大幅に向上させる開発手法です。

### 🎯 IDD の主要原則

1. **インターフェース・ファースト設計**
   - すべてのコンポーネントをインターフェースから設計
   - 実装詳細への依存を排除
   - 契約駆動開発の実践

2. **依存性逆転の徹底**
   - 高レベルモジュールは低レベルモジュールに依存しない
   - すべての依存は抽象（インターフェース）に対して行う
   - 依存注入によるルーズカップリング

3. **テスタビリティの最大化**
   - すべてのコンポーネントが容易にモック可能
   - 単体テストの独立性確保
   - インターフェース契約テストの実装

## 🛠️ IDD自動生成ツール

### インストールと設定

```bash
# ツールの実行権限付与
chmod +x scripts/idd-scaffold-generator.ts

# 必要な依存関係をインストール
npm install -D @types/inquirer commander inquirer prettier zod
```

### 基本的な使用方法

```bash
# インタラクティブモード
npx ts-node scripts/idd-scaffold-generator.ts generate --interactive

# 設定ファイルから生成
npx ts-node scripts/idd-scaffold-generator.ts generate --config idd-config.json

# IDD準拠性チェック
npx ts-node scripts/idd-scaffold-generator.ts validate --path src/
```

### 設定例（idd-config.json）

```json
{
  "name": "LearningProgress",
  "domain": "learning",
  "componentType": "entity",
  "description": "User learning progress tracking",
  "properties": [
    {
      "name": "id",
      "type": "string",
      "optional": false,
      "description": "Unique identifier"
    },
    {
      "name": "userId",
      "type": "string",
      "optional": false,
      "description": "User identifier"
    },
    {
      "name": "courseId",
      "type": "string",
      "optional": false,
      "description": "Course identifier"
    },
    {
      "name": "completionPercentage",
      "type": "number",
      "optional": false,
      "description": "Progress completion percentage (0-100)"
    }
  ],
  "methods": [
    {
      "name": "updateProgress",
      "returnType": "Promise<void>",
      "parameters": [
        {
          "name": "percentage",
          "type": "number",
          "optional": false
        }
      ],
      "description": "Updates the learning progress"
    },
    {
      "name": "isCompleted",
      "returnType": "boolean",
      "parameters": [],
      "description": "Checks if learning is completed"
    }
  ],
  "generateMock": true,
  "generateTest": true,
  "generateValidation": true,
  "generateDocumentation": true
}
```

## 📂 プロジェクト構造

```
src/
├── interfaces/               # インターフェース定義
│   ├── core/                # 基底インターフェース
│   │   └── base.interfaces.ts
│   ├── domain/              # ドメインインターフェース
│   │   ├── learning.interfaces.ts
│   │   ├── assessment.interfaces.ts
│   │   ├── user.interfaces.ts
│   │   └── collaboration.interfaces.ts
│   └── infrastructure/      # インフラストラクチャインターフェース
│       ├── api.interfaces.ts
│       ├── database.interfaces.ts
│       └── external.interfaces.ts
├── implementations/         # 具象実装
│   ├── domain/
│   ├── infrastructure/
│   └── application/
├── mocks/                   # モック実装
│   ├── domain/
│   └── infrastructure/
├── validation/              # バリデーションスキーマ
│   └── domain/
├── tests/                   # テスト
│   ├── interfaces/          # インターフェース契約テスト
│   ├── implementations/     # 実装テスト
│   └── integration/         # 統合テスト
└── docs/                    # ドキュメント
    └── components/
```

## 🏛️ アーキテクチャレイヤー

### 1. プレゼンテーション層

```typescript
// React コンポーネントのProps インターフェース
export interface ILearningDashboardProps {
  userId: string;
  onProgressUpdate: (progress: ILearningProgress) => void;
  learningService: ILearningService; // 依存注入
}

// コンポーネント実装
export const LearningDashboard: React.FC<ILearningDashboardProps> = ({
  userId,
  onProgressUpdate,
  learningService
}) => {
  // インターフェースを通じてサービスを利用
  const progress = await learningService.getUserProgress(userId);
  // ...
};
```

### 2. アプリケーション層

```typescript
// ユースケースインターフェース
export interface IGetUserProgressUseCase {
  execute(request: IGetUserProgressRequest): Promise<IGetUserProgressResponse>;
}

// ユースケース実装
export class GetUserProgressUseCase implements IGetUserProgressUseCase {
  constructor(
    private readonly progressRepository: ILearningProgressRepository,
    private readonly logger: ILogger
  ) {}

  async execute(request: IGetUserProgressRequest): Promise<IGetUserProgressResponse> {
    this.logger.info('Getting user progress', { userId: request.userId });
    
    const progress = await this.progressRepository.findByUserId(request.userId);
    
    return {
      progress: progress?.toJSON() || null,
      success: true
    };
  }
}
```

### 3. ドメイン層

```typescript
// ドメインエンティティインターフェース
export interface ILearningProgress extends IAggregateRoot {
  readonly userId: string;
  readonly courseId: string;
  readonly completionPercentage: number;
  readonly lastAccessedAt: Date;
  
  updateProgress(percentage: number): void;
  markCompleted(): void;
  isCompleted(): boolean;
}

// ドメインエンティティ実装
export class LearningProgress implements ILearningProgress {
  public readonly domainEvents: IDomainEvent[] = [];
  
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly courseId: string,
    private _completionPercentage: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly version: number
  ) {}

  get completionPercentage(): number {
    return this._completionPercentage;
  }

  updateProgress(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    this._completionPercentage = percentage;
    
    // ドメインイベント発火
    this.addDomainEvent(new LearningProgressUpdatedEvent(
      this.id,
      this.userId,
      percentage
    ));
  }

  isCompleted(): boolean {
    return this._completionPercentage === 100;
  }
}
```

### 4. インフラストラクチャ層

```typescript
// リポジトリインターフェース
export interface ILearningProgressRepository extends IRepository<ILearningProgress> {
  findByUserId(userId: string): Promise<ILearningProgress[]>;
  findByCourseId(courseId: string): Promise<ILearningProgress[]>;
  findByUserIdAndCourseId(userId: string, courseId: string): Promise<ILearningProgress | null>;
}

// Supabase リポジトリ実装
export class SupabaseLearningProgressRepository implements ILearningProgressRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly logger: ILogger
  ) {}

  async findById(id: string): Promise<ILearningProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('learning_progress')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToEntity(data);
    } catch (error) {
      this.logger.error('Failed to find learning progress by id', error, { id });
      throw error;
    }
  }

  private mapToEntity(data: any): ILearningProgress {
    return new LearningProgress(
      data.id,
      data.user_id,
      data.course_id,
      data.completion_percentage,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.version
    );
  }
}
```

## 🧪 テスト戦略

### 1. インターフェース契約テスト

```typescript
// インターフェース契約を検証
describe('ILearningProgressRepository Contract', () => {
  let repository: ILearningProgressRepository;

  beforeEach(() => {
    repository = new MockLearningProgressRepository();
  });

  it('should implement findById method', async () => {
    expect(repository.findById).toBeDefined();
    expect(typeof repository.findById).toBe('function');
  });

  it('should return null for non-existent id', async () => {
    const result = await repository.findById('non-existent');
    expect(result).toBeNull();
  });

  it('should return entity for existing id', async () => {
    const mockEntity = createMockLearningProgress();
    repository.save(mockEntity);
    
    const result = await repository.findById(mockEntity.id);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(mockEntity.id);
  });
});
```

### 2. モック実装

```typescript
// モック実装の自動生成
export class MockLearningProgressRepository implements ILearningProgressRepository {
  private entities: Map<string, ILearningProgress> = new Map();

  async findById(id: string): Promise<ILearningProgress | null> {
    return this.entities.get(id) || null;
  }

  async findAll(): Promise<ILearningProgress[]> {
    return Array.from(this.entities.values());
  }

  async save(entity: ILearningProgress): Promise<ILearningProgress> {
    this.entities.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.entities.delete(id);
  }
}
```

### 3. 統合テスト

```typescript
// 実装とインターフェースの整合性確認
describe('LearningProgress Integration', () => {
  let useCase: IGetUserProgressUseCase;
  let repository: ILearningProgressRepository;

  beforeEach(async () => {
    repository = new MockLearningProgressRepository();
    useCase = new GetUserProgressUseCase(
      repository,
      new ConsoleLogger()
    );
  });

  it('should execute use case successfully', async () => {
    // テストデータ準備
    const mockProgress = createMockLearningProgress();
    await repository.save(mockProgress);

    // ユースケース実行
    const response = await useCase.execute({
      userId: mockProgress.userId
    });

    // 結果検証
    expect(response.success).toBe(true);
    expect(response.progress).toBeDefined();
  });
});
```

## 📊 バリデーション

### Zod スキーマ自動生成

```typescript
// インターフェースから自動生成されるバリデーションスキーマ
export const LearningProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  completionPercentage: z.number().min(0).max(100),
  lastAccessedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().positive()
});

export type LearningProgressType = z.infer<typeof LearningProgressSchema>;

export const validateLearningProgress = (data: unknown): LearningProgressType => {
  return LearningProgressSchema.parse(data);
};

export const isLearningProgressValid = (data: unknown): data is LearningProgressType => {
  return LearningProgressSchema.safeParse(data).success;
};
```

## 🔄 依存注入

### DIコンテナ設定

```typescript
// DIコンテナの設定
export class DIContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  register<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  resolve<T>(name: string): T {
    if (!this.services.has(name)) {
      const factory = this.factories.get(name);
      if (!factory) {
        throw new Error(`Service not registered: ${name}`);
      }
      this.services.set(name, factory());
    }
    return this.services.get(name);
  }
}

// サービス登録
const container = new DIContainer();

container.register<ILogger>('logger', () => new ConsoleLogger());
container.register<ICache>('cache', () => new RedisCache());
container.register<ILearningProgressRepository>('learningProgressRepository', () => 
  new SupabaseLearningProgressRepository(
    supabaseClient,
    container.resolve<ILogger>('logger')
  )
);
```

## 📈 メトリクスと監視

### IDD準拠率の測定

```typescript
// IDD準拠性チェッカー
export class IDDComplianceChecker {
  async checkCompliance(projectPath: string): Promise<IDDComplianceReport> {
    const results = {
      interfaceCount: 0,
      implementationCount: 0,
      mockCount: 0,
      testCount: 0,
      complianceScore: 0,
      violations: []
    };

    // インターフェース定義の確認
    const interfaces = await this.findInterfaces(projectPath);
    results.interfaceCount = interfaces.length;

    // 実装の確認
    const implementations = await this.findImplementations(projectPath);
    results.implementationCount = implementations.length;

    // モック実装の確認
    const mocks = await this.findMocks(projectPath);
    results.mockCount = mocks.length;

    // テストの確認
    const tests = await this.findTests(projectPath);
    results.testCount = tests.length;

    // コンプライアンススコア計算
    results.complianceScore = this.calculateComplianceScore(results);

    return results;
  }

  private calculateComplianceScore(results: any): number {
    let score = 100;
    
    // インターフェースがない実装があるか
    const interfacelessImplementations = results.implementationCount - results.interfaceCount;
    score -= interfacelessImplementations * 10;

    // モックがない実装があるか
    const mocklessInterfaces = results.interfaceCount - results.mockCount;
    score -= mocklessInterfaces * 5;

    // テストがない実装があるか
    const testlessImplementations = results.implementationCount - results.testCount;
    score -= testlessImplementations * 15;

    return Math.max(0, score);
  }
}
```

## 🚀 実装手順

### Step 1: 基本セットアップ

```bash
# 1. プロジェクト構造作成
mkdir -p src/{interfaces/{core,domain,infrastructure},implementations/{domain,infrastructure,application},mocks,validation,tests,docs}

# 2. 基底インターフェース配置
# base.interfaces.ts は既に作成済み

# 3. IDD生成ツール設置
# idd-scaffold-generator.ts は既に作成済み
```

### Step 2: ドメインインターフェース定義

```bash
# 学習ドメインインターフェース生成
npx ts-node scripts/idd-scaffold-generator.ts generate --interactive
# → name: LearningProgress
# → domain: learning
# → componentType: entity
```

### Step 3: 実装とテスト

```bash
# 実装ファイル作成（自動生成済み）
# テストファイル作成（自動生成済み）
# モックファイル作成（自動生成済み）

# テスト実行
npm test src/tests/interfaces/
npm test src/tests/implementations/
```

### Step 4: 継続的改善

```bash
# 週次IDD準拠性チェック
npx ts-node scripts/idd-scaffold-generator.ts validate --path src/

# 準拠率報告書生成
./scripts/generate-idd-report.sh
```

## 📖 ベストプラクティス

### 1. インターフェース設計原則

- **単一責任**: 1つのインターフェースは1つの責任のみ
- **インターフェース分離**: 大きなインターフェースは小さく分割
- **依存性逆転**: 常に抽象に依存、具象に依存しない
- **開放閉鎖**: 拡張に開放、修正に閉鎖

### 2. 命名規約

```typescript
// インターフェース: I + PascalCase
export interface IUserService { }

// 実装: PascalCase (Iプレフィックスなし)
export class UserService implements IUserService { }

// モック: Mock + PascalCase
export class MockUserService implements IUserService { }
```

### 3. エラーハンドリング

```typescript
// Result パターンの活用
export interface IResult<T, E = Error> {
  readonly isSuccess: boolean;
  readonly value?: T;
  readonly error?: E;
}

export class Result<T, E = Error> implements IResult<T, E> {
  static success<T>(value: T): Result<T> {
    return new Result(true, value);
  }

  static failure<E>(error: E): Result<never, E> {
    return new Result(false, undefined, error);
  }
}
```

## 🎯 成功指標

### 短期目標（3ヶ月）
- [x] 基底インターフェース定義完了
- [x] IDD自動生成ツール完成
- [ ] コアドメインの70%をIDD準拠
- [ ] モック実装100%カバレッジ

### 中期目標（6ヶ月）
- [ ] 全ドメインIDD準拠率90%以上
- [ ] インターフェース契約テスト100%実装
- [ ] 依存注入完全導入
- [ ] パフォーマンス改善20%達成

### 長期目標（12ヶ月）
- [ ] IDD準拠率95%以上維持
- [ ] プラグインアーキテクチャ実現
- [ ] 自動リファクタリング機能
- [ ] 他プロジェクトへの横展開

## 🔗 関連リソース

- [Base Interfaces Definition](src/interfaces/core/base.interfaces.ts)
- [IDD Scaffold Generator](scripts/idd-scaffold-generator.ts)
- [Architecture Documentation](docs/architecture/IDD-Architecture.md)
- [Testing Guidelines](docs/testing/IDD-Testing-Guide.md)

---

**最終更新**: 2025年1月10日  
**バージョン**: 1.0.0  
**作成者**: IDD Implementation Team