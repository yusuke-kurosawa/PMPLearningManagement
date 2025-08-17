# TypeScript統一チーム運用ガイドライン

## 📋 概要

PMPLearningManagementプロジェクトでTypeScript100%統一を維持するためのチーム運用ガイドライン。コードレビュー、品質保証、新メンバーオンボーディングのための包括的なルールとプロセスを定義します。

---

## 🎯 基本原則

### TypeScript First原則
- **すべての新規ファイル**はTypeScriptで作成
- **JavaScriptファイルの作成を禁止**
- **型安全性を最優先**にした開発
- **any型の使用を厳格に制限**

### コードオーナーシップ
- 各開発者がTypeScript品質に責任を持つ
- チーム全体でTypeScript知識を共有
- 継続的な学習と改善を推進

---

## 👥 役割と責任

### 1. 開発者（Developer）

#### 必須スキル
- [ ] TypeScript基礎知識（型システム、ジェネリクス）
- [ ] React + TypeScript パターン理解
- [ ] ESLint TypeScriptルール理解
- [ ] プロジェクト固有の型定義理解

#### 日常業務での責任
- [ ] **型安全性の確保**: すべてのコードで適切な型定義
- [ ] **any型の回避**: unknown、具体的型の使用
- [ ] **コンパイルエラーの即座解決**: TypeScriptエラーの放置禁止
- [ ] **テストでの型検証**: 型安全性を含むテスト作成

#### コミット前チェック
```bash
# 必須実行コマンド
npm run typecheck    # TypeScript型チェック
npm run lint         # ESLint検査
npm run test:run     # テスト実行
```

### 2. コードレビュアー（Reviewer）

#### レビュー必須チェック項目

##### TypeScript品質
- [ ] **型定義完全性**: 全ての関数・変数に適切な型
- [ ] **any型使用**: any型が使用されていないか
- [ ] **型推論活用**: 過度な型アノテーションでないか
- [ ] **型ガード**: 実行時の型安全性確保

##### 具体的チェックポイント
```typescript
// ❌ 悪い例
function processData(data: any): any {
  return data.map(item => item.value);
}

// ✅ 良い例
interface DataItem {
  value: string;
  id: number;
}

function processData(data: DataItem[]): string[] {
  return data.map((item: DataItem): string => item.value);
}
```

##### React TypeScript特化チェック
- [ ] **Props型定義**: 全てのコンポーネントでインターフェース定義
- [ ] **Event Handler型**: 適切なイベント型使用
- [ ] **Ref型定義**: useRefでの適切な型指定
- [ ] **Custom Hook型**: カスタムフックの型安全性

```typescript
// ✅ React TypeScript 良い例
interface UserProfileProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => Promise<void>;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onEdit, 
  onDelete, 
  className 
}): JSX.Element => {
  const handleEditClick = useCallback((): void => {
    onEdit(user);
  }, [user, onEdit]);
  
  return (
    <div className={className}>
      {/* コンポーネント実装 */}
    </div>
  );
};
```

### 3. テックリード（Tech Lead）

#### 技術判断責任
- [ ] **型アーキテクチャ設計**: プロジェクト全体の型構造
- [ ] **複雑な型問題の解決**: 高度なTypeScript問題への対処
- [ ] **パフォーマンス監視**: TypeScript使用によるビルド時間影響
- [ ] **ツール選択・設定**: TypeScript関連ツールの導入判断

#### チーム支援責任
- [ ] **技術相談対応**: TypeScript実装相談への回答
- [ ] **ベストプラクティス策定**: プロジェクト固有のTypeScriptルール
- [ ] **教育コンテンツ作成**: 内部向けTypeScript資料作成
- [ ] **外部ライブラリ評価**: 型定義品質を含む技術選択

---

## 🔍 コードレビュープロセス

### 1. プルリクエスト作成時

#### 作成者チェックリスト
```markdown
## TypeScript品質チェック

### 基本要件
- [ ] TypeScriptコンパイルが成功する
- [ ] ESLint TypeScriptルールに準拠
- [ ] any型を使用していない
- [ ] 全ての関数に適切な戻り値型定義

### React特化（該当する場合）
- [ ] 全てのコンポーネントにProps型定義
- [ ] イベントハンドラに適切な型定義
- [ ] useStateやuseEffectで適切な型指定

### テスト
- [ ] 型安全性に関するテストが含まれる
- [ ] テストファイルもTypeScript化されている

### ドキュメント
- [ ] 複雑な型定義にはコメントを追加
- [ ] 型に関する設計決定をPRで説明
```

### 2. レビュアーガイド

#### レビュー手順
1. **自動チェック確認**: CI/CDでのTypeScript検査結果確認
2. **型定義レビュー**: 手動での型安全性確認
3. **実装パターンレビュー**: プロジェクト標準への準拠確認
4. **教育的フィードバック**: 改善提案とベストプラクティス共有

#### レビューコメントテンプレート

```markdown
## TypeScript改善提案

### 型安全性
- `any`型の使用を避け、具体的な型を定義してください
- 例: `unknown`型または具体的なインターフェースの使用

### パフォーマンス
- 型推論を活用して、冗長な型アノテーションを削減できます

### 可読性
- 複雑な型定義には説明コメントを追加してください

### リファクタリング提案
- 共通の型定義を`types/`ディレクトリに移動することを検討してください
```

### 3. レビュー承認基準

#### 必須条件
- [ ] TypeScriptコンパイルエラーなし
- [ ] ESLint TypeScript警告なし
- [ ] any型使用なし（正当な理由がある場合は要説明）
- [ ] 適切なテストカバレッジ

#### 推奨条件
- [ ] 型定義の再利用性
- [ ] パフォーマンスへの影響考慮
- [ ] 将来の拡張性を考慮した設計
- [ ] ドキュメント品質

---

## 🚀 新メンバーオンボーディング

### 1. 基礎学習プログラム（第1週）

#### Day 1-2: TypeScript基礎
- [ ] **TypeScript Handbook**熟読
- [ ] **基本型システム**理解（string, number, boolean, array, object）
- [ ] **ユニオン型・インターセクション型**
- [ ] **ジェネリクス**基礎概念

#### Day 3-4: React + TypeScript
- [ ] **React TypeScript Cheatsheet**学習
- [ ] **コンポーネントProps型定義**
- [ ] **Hooks型定義**（useState, useEffect, useCallback）
- [ ] **イベントハンドリング型定義**

#### Day 5: プロジェクト固有学習
- [ ] **プロジェクト型定義**理解（`src/types/`）
- [ ] **共通パターン**理解
- [ ] **ESLint設定**理解
- [ ] **開発環境セットアップ**

### 2. 実践課題（第2週）

#### 初級課題
```typescript
// 課題1: 基本的なコンポーネント作成
interface WelcomeMessageProps {
  userName: string;
  isLoggedIn: boolean;
  onLogin: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = // 実装

// 課題2: カスタムフック作成
function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T) => void] {
  // 実装
}
```

#### 中級課題
- 既存JavaScriptファイルのTypeScript移行
- 複雑な型定義の作成
- ジェネリクスを使った再利用可能な関数作成

### 3. メンター制度

#### メンター責任
- [ ] **週次1on1**: TypeScript学習進捗確認
- [ ] **コードレビュー支援**: 詳細なフィードバック提供
- [ ] **質問対応**: リアルタイムでの技術相談
- [ ] **キャリア支援**: TypeScript技術向上のアドバイス

#### メンティー責任
- [ ] **積極的質問**: 理解不足な点の早期相談
- [ ] **学習ログ**: 学習進捗の記録・共有
- [ ] **実践適用**: 学んだ内容の実際のコードへの適用
- [ ] **ナレッジ共有**: 学習内容のチーム共有

---

## 📊 品質測定・監視

### 1. 継続的品質指標

#### TypeScript化率指標
```bash
# 週次実行レポート
npm run ts:status

# 出力例
📊 TypeScript Adoption Report
TypeScript files: 287 (100%)
JavaScript files: 0 (0%)
Quality Score: 100/100
```

#### 型安全性指標
- **any型使用率**: 0%維持
- **TypeScript警告数**: 0件維持
- **型エラー解決時間**: 平均24時間以内
- **テスト型カバレッジ**: 90%以上

### 2. 週次品質レビュー

#### チェック項目
- [ ] TypeScript化率100%維持
- [ ] 新規any型導入なし
- [ ] 型エラー蓄積なし
- [ ] パフォーマンス影響確認

#### 改善アクション
1. **品質劣化検出時**: 即座の修正アクション
2. **教育機会**: チーム向けTypeScript改善セッション
3. **プロセス改善**: ワークフロー・ツール最適化
4. **ナレッジ蓄積**: 学習事例のドキュメント化

### 3. 月次技術振り返り

#### 振り返り項目
- [ ] **TypeScript導入効果**: バグ削減・開発効率向上
- [ ] **技術債務状況**: 型定義の改善要望箇所
- [ ] **チーム習熟度**: 個別スキルレベル確認
- [ ] **ツール最適化**: 開発環境改善提案

---

## 🛠 ツール・環境設定

### 1. IDE設定標準化

#### Visual Studio Code必須拡張
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

#### VS Code設定
```json
{
  "typescript.preferences.quoteStyle": "single",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.suggest.autoImports": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

### 2. Git Hooks設定

#### 設定コマンド
```bash
# TypeScript強制Git Hooks設定
npm run ts:setup-hooks
# または
node scripts/typescript-enforcement.js --setup
```

### 3. CI/CD統合

#### 必須チェック項目
- TypeScriptコンパイル成功
- ESLint TypeScript準拠
- テスト通過
- JavaScript新規ファイル検出

---

## 🚨 エスカレーション・問題解決

### 1. 技術的問題のエスカレーションパス

#### Level 1: 個人解決（2時間以内）
- ドキュメント・StackOverflow確認
- プロジェクト内コード参照
- 基本的なTypeScriptエラー対処

#### Level 2: チーム内相談（1日以内）
- Slackでの技術相談
- ペアプログラミング依頼
- 同僚への質問・レビュー依頼

#### Level 3: テックリード相談（2日以内）
- 複雑な型設計問題
- アーキテクチャレベルの判断
- 外部ライブラリ採用判断

#### Level 4: 外部専門家（1週間以内）
- TypeScript専門家への相談
- 公式コミュニティでの質問
- 技術アドバイザーへの相談

### 2. よくある問題・FAQ

#### Q: any型を使わざるを得ない場合は？
```typescript
// A: unknown型 + 型ガードを使用
function processUnknownData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  if (typeof data === 'object' && data !== null && 'toString' in data) {
    return String(data.toString()).toUpperCase();
  }
  throw new Error('Invalid data type');
}
```

#### Q: 外部ライブラリの型定義がない場合は？
```typescript
// A: モジュール宣言で対応
declare module 'legacy-library' {
  interface LibraryOptions {
    config: string;
  }
  
  export function initialize(options: LibraryOptions): void;
}
```

#### Q: 複雑な型定義の可読性向上は？
```typescript
// A: 段階的な型定義とコメント
// ユーザーデータの基本型
interface BaseUser {
  id: string;
  name: string;
}

// 認証情報を含むユーザー型
interface AuthenticatedUser extends BaseUser {
  token: string;
  permissions: Permission[];
}

// API レスポンス用のユーザー型
interface UserResponse {
  user: AuthenticatedUser;
  metadata: {
    lastLogin: Date;
    accountStatus: 'active' | 'inactive' | 'suspended';
  };
}
```

---

## 📚 学習リソース・参考資料

### 1. 公式ドキュメント
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)

### 2. プロジェクト内参考実装
- [`src/types/index.ts`](../src/types/index.ts) - 共通型定義
- [`src/hooks/useAuth.ts`](../src/hooks/useAuth.ts) - カスタムフック例
- [`src/services/authService.ts`](../src/services/authService.ts) - サービス層例

### 3. 内部学習資料
- [TypeScript Best Practices](./typescript-best-practices.md)
- [React TypeScript Patterns](./react-typescript-patterns.md)
- [Common Type Definitions](./common-type-definitions.md)

### 4. 外部コミュニティ
- [TypeScript Discord](https://discord.gg/typescript)
- [Reactiflux Discord](https://discord.gg/reactiflux)
- [Stack Overflow TypeScript Tag](https://stackoverflow.com/questions/tagged/typescript)

---

## 🎯 成功指標・KPI

### 短期目標（1ヶ月）
- [ ] チーム全員のTypeScript基礎習得
- [ ] TypeScript化率100%維持
- [ ] any型使用率0%達成
- [ ] CI/CD完全統合

### 中期目標（3ヶ月）
- [ ] 開発効率20%向上
- [ ] 型関連バグ95%削減
- [ ] コードレビュー時間30%短縮
- [ ] 新メンバーオンボーディング期間50%短縮

### 長期目標（6ヶ月）
- [ ] チーム全体のTypeScript上級習得
- [ ] 自動化された品質保証
- [ ] ゼロ型エラー開発環境
- [ ] TypeScript専門知識のプロジェクト外共有

---

**最終更新**: 2025-08-17  
**担当**: Claude Code (Agent Orchestrator)  
**承認**: テックリードチーム  
**次回レビュー**: 月次（毎月第1金曜日）