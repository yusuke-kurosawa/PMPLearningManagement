# TypeScript移行ロードマップ

## 📋 プロジェクト概要

PMPLearningManagementプロジェクトの残りJavaScriptファイルをTypeScriptに完全移行するための詳細ロードマップ。

**現在の状況**: TypeScript化95%完了（srcディレクトリは完全移行済み）

---

## 🎯 移行対象ファイル分析

### 移行対象ファイル一覧

#### Phase 1: 高優先度（即座実行 - 1週間以内）

| ファイル | タイプ | 影響度 | 移行難易度 | 推定工数 |
|---------|--------|--------|------------|----------|
| `e2e/tests/accessibility.spec.js` | E2Eテスト | 高 | 低 | 1h |
| `e2e/tests/home.spec.js` | E2Eテスト | 高 | 低 | 1h |
| `e2e/tests/navigation.spec.js` | E2Eテスト | 高 | 低 | 1h |
| `public/sw.js` | Service Worker | 高 | 中 | 3h |
| **小計** | | | | **6h** |

#### Phase 2: 中優先度（2週間以内）

| ファイル | タイプ | 影響度 | 移行難易度 | 推定工数 |
|---------|--------|--------|------------|----------|
| `scripts/duplicate-detector.js` | ユーティリティ | 中 | 中 | 2h |
| `scripts/import-mock-exam.js` | データ処理 | 中 | 中 | 2h |
| `scripts/fix-all-eslint-issues.js` | 開発ツール | 中 | 中 | 2h |
| `test/test-translation.js` | テスト | 中 | 低 | 1h |
| **小計** | | | | **7h** |

#### Phase 3: 低優先度（3週間以内）

| ファイル | タイプ | 影響度 | 移行難易度 | 推定工数 |
|---------|--------|--------|------------|----------|
| `.claude/operations/monitoring/scripts/check.js` | 監視ツール | 低 | 低 | 1h |
| `.claude/operations/scripts/dashboard.js` | ダッシュボード | 低 | 低 | 1h |
| その他スクリプトファイル | ユーティリティ | 低 | 低 | 4h |
| **小計** | | | | **6h** |

#### Phase 4: 設定ファイル（4週間以内）

| ファイル | タイプ | 影響度 | 移行難易度 | 推定工数 |
|---------|--------|--------|------------|----------|
| `postcss.config.js` | 設定 | 低 | 低 | 0.5h |
| その他可能な設定ファイル | 設定 | 低 | 低 | 1h |
| **小計** | | | | **1.5h** |

**全体推定工数**: 20.5時間

---

## 🚀 実装戦略

### 移行方針

#### 1. ファイル変換プロセス

```bash
# 標準的な移行手順
1. ファイル拡張子変更 (.js → .ts/.tsx)
2. 型定義追加
3. any型除去
4. 厳密型チェック対応
5. テスト実行・検証
6. コミット
```

#### 2. E2Eテスト移行戦略

```typescript
// Before (JavaScript)
const { test, expect } = require('@playwright/test');

test('navigation test', async ({ page }) => {
  await page.goto('/');
  const title = page.locator('h1');
  await expect(title).toBeVisible();
});

// After (TypeScript)
import { test, expect, type Page } from '@playwright/test';

test('navigation test', async ({ page }: { page: Page }): Promise<void> => {
  await page.goto('/');
  const title = page.locator('h1');
  await expect(title).toBeVisible();
});
```

#### 3. Service Worker移行戦略

```typescript
// sw.ts - TypeScript版
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event: ExtendableEvent): void => {
  event.waitUntil(
    caches.open('v1').then((cache: Cache): Promise<void> => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css'
      ]);
    })
  );
});
```

---

## 🛠 自動化ツール実装

### 移行支援スクリプト

#### 1. 一括拡張子変更スクリプト

```typescript
// scripts/migrate-file-extensions.ts
import { promises as fs } from 'fs';
import path from 'path';

interface MigrationTarget {
  from: string;
  to: string;
  type: 'test' | 'script' | 'config';
}

const migrationTargets: MigrationTarget[] = [
  { from: 'e2e/tests/accessibility.spec.js', to: 'e2e/tests/accessibility.spec.ts', type: 'test' },
  { from: 'e2e/tests/home.spec.js', to: 'e2e/tests/home.spec.ts', type: 'test' },
  { from: 'e2e/tests/navigation.spec.js', to: 'e2e/tests/navigation.spec.ts', type: 'test' },
  { from: 'public/sw.js', to: 'public/sw.ts', type: 'script' },
];

async function migrateFiles(): Promise<void> {
  for (const target of migrationTargets) {
    try {
      await fs.rename(target.from, target.to);
      console.log(`✅ Migrated: ${target.from} → ${target.to}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${target.from}:`, error);
    }
  }
}

migrateFiles().catch(console.error);
```

#### 2. 型定義自動追加スクリプト

```typescript
// scripts/add-type-annotations.ts
import { promises as fs } from 'fs';
import { Project, SourceFile } from 'ts-morph';

interface TypeAnnotationRule {
  pattern: RegExp;
  replacement: string;
}

const annotationRules: TypeAnnotationRule[] = [
  {
    pattern: /function\s+(\w+)\s*\(/g,
    replacement: 'function $1(): void ('
  },
  {
    pattern: /const\s+(\w+)\s*=\s*\(/g,
    replacement: 'const $1 = ('
  }
];

async function addTypeAnnotations(filePath: string): Promise<void> {
  const project = new Project();
  const sourceFile: SourceFile = project.addSourceFileAtPath(filePath);
  
  // 自動型推論とannotation追加
  sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    .forEach(func => {
      if (!func.getReturnTypeNode()) {
        func.setReturnType('void');
      }
    });
  
  await sourceFile.save();
  console.log(`✅ Added type annotations to: ${filePath}`);
}
```

#### 3. 移行検証スクリプト

```typescript
// scripts/verify-migration.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MigrationCheck {
  name: string;
  command: string;
  expected: string;
}

const verificationChecks: MigrationCheck[] = [
  {
    name: 'TypeScript Compilation',
    command: 'npx tsc --noEmit',
    expected: 'no errors'
  },
  {
    name: 'ESLint TypeScript',
    command: 'npx eslint src --ext .ts,.tsx',
    expected: 'no errors'
  },
  {
    name: 'Tests Passing',
    command: 'npm run test:run',
    expected: 'all tests pass'
  }
];

async function verifyMigration(): Promise<void> {
  console.log('🔍 Verifying TypeScript migration...\n');
  
  for (const check of verificationChecks) {
    try {
      console.log(`Running: ${check.name}`);
      const { stdout, stderr } = await execAsync(check.command);
      
      if (stderr && !stderr.includes('warning')) {
        console.log(`❌ ${check.name} failed:`);
        console.log(stderr);
      } else {
        console.log(`✅ ${check.name} passed`);
      }
    } catch (error) {
      console.log(`❌ ${check.name} failed:`, error);
    }
    console.log('');
  }
}
```

---

## 📊 品質保証プロセス

### 移行前チェックリスト

#### ファイル単位チェック
- [ ] **依存関係確認**: インポート/エクスポート整合性
- [ ] **型定義存在**: 必要な型定義ファイル確認
- [ ] **テスト範囲**: 対象機能のテストカバレッジ
- [ ] **ドキュメント**: 関連ドキュメントの更新要否

#### 移行作業チェック
- [ ] **拡張子変更**: .js → .ts/.tsx適切な変更
- [ ] **型アノテーション**: 関数・変数への型定義追加
- [ ] **any型除去**: 明示的型定義への置換
- [ ] **インポート修正**: TypeScript式インポート文法
- [ ] **設定更新**: tsconfig.json, eslintrc更新

#### 移行後検証
- [ ] **コンパイル成功**: TypeScriptコンパイラエラーなし
- [ ] **Lint通過**: ESLint TypeScriptルール適合
- [ ] **テスト通過**: 既存テスト全て正常動作
- [ ] **機能確認**: 実際の機能動作確認
- [ ] **パフォーマンス**: ビルド時間・実行時間影響確認

---

## 🔧 Git Hooks強化実装

### pre-commit hook強化

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 TypeScript pre-commit validation..."

# JavaScript新規ファイル検出
NEW_JS_FILES=$(git diff --cached --name-status | grep -E "^A.*\.(js|jsx)$" || true)
if [ ! -z "$NEW_JS_FILES" ]; then
    echo "❌ ERROR: New JavaScript files detected!"
    echo "Files found:"
    echo "$NEW_JS_FILES"
    echo ""
    echo "🔧 Please use TypeScript (.ts/.tsx) instead:"
    echo "$NEW_JS_FILES" | sed 's/\.jsx\?$/.tsx/' | sed 's/^A\t/  /'
    exit 1
fi

# TypeScript型チェック
echo "📝 Running TypeScript type checking..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ ERROR: TypeScript type checking failed"
    echo "🔧 Please fix type errors before committing"
    exit 1
fi

# ESLint TypeScript
echo "🔍 Running ESLint on TypeScript files..."
STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
if [ ! -z "$STAGED_TS_FILES" ]; then
    npx eslint $STAGED_TS_FILES
    if [ $? -ne 0 ]; then
        echo "❌ ERROR: ESLint found issues in TypeScript files"
        echo "🔧 Please run 'npm run lint:fix' to auto-fix issues"
        exit 1
    fi
fi

echo "✅ All TypeScript validations passed!"
```

### commit-msg hook強化

```bash
#!/bin/bash
# .git/hooks/commit-msg

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

# TypeScript移行コミット検出
if echo "$COMMIT_MSG" | grep -qE "(migrate|typescript|\.ts|\.tsx)"; then
    echo "🎯 TypeScript migration commit detected"
    
    # 移行メトリクス収集
    TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
    JS_FILES=$(find . -name "*.js" -o -name "*.jsx" -not -path "./node_modules/*" -not -path "./dist/*" | wc -l)
    TOTAL_FILES=$((TS_FILES + JS_FILES))
    TS_PERCENTAGE=$((TS_FILES * 100 / TOTAL_FILES))
    
    echo "📊 Current TypeScript adoption: ${TS_PERCENTAGE}% (${TS_FILES}/${TOTAL_FILES} files)"
    
    if [ $TS_PERCENTAGE -eq 100 ]; then
        echo "🎉 Congratulations! 100% TypeScript adoption achieved!"
    fi
fi
```

---

## 📱 NPM Scripts拡張

### package.json追加スクリプト

```json
{
  "scripts": {
    "ts:migrate:check": "node scripts/check-js-files.js",
    "ts:migrate:e2e": "node scripts/migrate-e2e-tests.js",
    "ts:migrate:scripts": "node scripts/migrate-script-files.js",
    "ts:migrate:sw": "node scripts/migrate-service-worker.js",
    "ts:migrate:all": "npm run ts:migrate:e2e && npm run ts:migrate:scripts && npm run ts:migrate:sw",
    "ts:verify": "npm run typecheck && npm run lint && npm run test:run",
    "ts:status": "node scripts/typescript-status.js",
    "ts:report": "node scripts/generate-migration-report.js"
  }
}
```

---

## 🎯 段階別実装計画

### Week 1: Phase 1実装（高優先度）

#### Day 1-2: E2Eテスト移行
```bash
# 実行コマンド
npm run ts:migrate:e2e
npm run test:e2e
git add .
git commit -m "feat: E2EテストファイルのTypeScript移行完了 #[ISSUE_NUMBER]"
```

#### Day 3-4: Service Worker移行
```bash
# 実行コマンド
npm run ts:migrate:sw
npm run build
npm run test:run
git add .
git commit -m "feat: Service WorkerのTypeScript移行完了 #[ISSUE_NUMBER]"
```

#### Day 5: 検証・微調整
```bash
# 全体検証
npm run ts:verify
npm run ts:status
```

### Week 2: Phase 2実装（中優先度）

#### Day 8-10: スクリプトファイル移行
```bash
npm run ts:migrate:scripts
npm run ts:verify
git add .
git commit -m "feat: 開発スクリプトのTypeScript移行完了 #[ISSUE_NUMBER]"
```

#### Day 11-12: テストファイル移行
```bash
# 個別移行・検証
npm run test:run
```

### Week 3: Phase 3実装（低優先度）

#### 残りファイル移行・最終検証

### Week 4: 完了・ドキュメント更新

---

## 📈 成功指標・KPI

### 定量指標

#### TypeScript化率
- **目標**: 100%
- **現在**: 95%
- **測定方法**: `find src -name "*.ts" -o -name "*.tsx" | wc -l` / 全ファイル数

#### 型安全性スコア
- **any型使用率**: 0%目標
- **型エラー数**: 0件維持
- **ESLint TypeScript警告**: 0件

#### ビルド・テスト品質
- **TypeScriptコンパイル成功率**: 100%
- **テスト通過率**: 100%維持
- **ビルド時間**: 10%以内増加に抑制

### 定性指標

#### 開発体験向上
- [ ] IDE型補完完全動作
- [ ] 実行時エラー早期発見
- [ ] リファクタリング安全性向上
- [ ] コードレビュー効率化

#### チーム効率性
- [ ] 新メンバーオンボーディング短縮
- [ ] バグ発生率削減
- [ ] 開発速度向上
- [ ] コード品質一貫性

---

## 🚨 リスク管理・対策

### 識別済みリスク

#### 技術リスク
1. **型定義不整合**: 外部ライブラリ型定義不足
   - **対策**: @types/*パッケージ追加・カスタム型定義作成

2. **ビルドエラー**: 厳格型チェックによるビルド失敗
   - **対策**: 段階的厳格化・一時的any許可

3. **パフォーマンス影響**: TypeScriptコンパイル時間増加
   - **対策**: 増分コンパイル・並列処理最適化

#### プロジェクトリスク
1. **スケジュール遅延**: 予想以上の移行工数
   - **対策**: 優先順位明確化・Phase並行実行

2. **機能デグレード**: 移行過程での機能破損
   - **対策**: 十分なテスト・段階的検証

### 緊急時対応プラン

#### ロールバック戦略
```bash
# 緊急時：前コミットへのロールバック
git reset --hard HEAD~1

# 部分的ロールバック：特定ファイルのみ
git checkout HEAD~1 -- path/to/problematic/file.ts
```

#### 代替実装パス
- 問題ファイルの一時JavaScript保持
- 段階的型定義（any使用許可）
- 自動移行の手動実装への切り替え

---

## 📚 参考資料・テンプレート

### コード移行テンプレート

#### E2Eテストテンプレート
```typescript
import { test, expect, type Page, type BrowserContext } from '@playwright/test';

interface TestContext {
  page: Page;
  context: BrowserContext;
}

test.describe('Feature Name Tests', (): void => {
  test('should perform specific action', async ({ page }: TestContext): Promise<void> => {
    // テスト実装
  });
});
```

#### スクリプトテンプレート
```typescript
import { promises as fs } from 'fs';
import path from 'path';

interface ScriptOptions {
  input: string;
  output: string;
  verbose?: boolean;
}

async function main(options: ScriptOptions): Promise<void> {
  try {
    // メイン処理
    console.log('✅ Script completed successfully');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// CLI実行時
if (require.main === module) {
  const options: ScriptOptions = {
    input: process.argv[2] || '',
    output: process.argv[3] || ''
  };
  main(options);
}

export { main, type ScriptOptions };
```

### チェックリストテンプレート

#### 移行作業チェックリスト
```markdown
## ファイル移行チェックリスト: [ファイル名]

### 移行前
- [ ] 依存関係確認
- [ ] 現在の型使用状況調査
- [ ] 関連テスト実行

### 移行作業
- [ ] ファイル拡張子変更
- [ ] インポート文修正
- [ ] 型アノテーション追加
- [ ] any型除去
- [ ] ESLintエラー修正

### 移行後検証
- [ ] TypeScriptコンパイル成功
- [ ] ESLint通過
- [ ] 関連テスト通過
- [ ] 機能動作確認

### 完了
- [ ] コミット・プッシュ
- [ ] 進捗更新
```

---

**最終更新**: 2025-08-17  
**担当**: Claude Code (Agent Orchestrator)  
**レビュー**: プロジェクトチーム  
**次回レビュー**: 各Phase完了時