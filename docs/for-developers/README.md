# 開発者向けドキュメント

🔧 PMPLearningManagement開発チーム向けの技術文書集です。

## 📋 目次

### 🎯 重要ドキュメント

- **[IDD実装状況](IDD_IMPLEMENTATION_STATUS.md)** - Issue-Driven Development準拠度99%達成の詳細
- **[TypeScript移行ロードマップ](TYPESCRIPT_MIGRATION_ROADMAP.md)** - 段階的TypeScript導入計画
- **[TypeScriptチームガイドライン](TYPESCRIPT_TEAM_GUIDELINES.md)** - コーディング規約と品質基準

### 📁 アーカイブ文書

#### 🏗️ [実装ドキュメント](archive/implementation/)
- 各機能の実装詳細とサマリー
- 認証、CI/CD、モバイル、テスト実装
- セキュリティ実装計画

#### 🏛️ [アーキテクチャ設計](archive/architecture/)
- システム全体設計
- データベース設計
- モジュラーアーキテクチャ設計
- UI設計仕様

#### 🧪 [テスト戦略](archive/testing/)
- テスト計画とテスト実装サマリー
- 品質保証プロセス

## 🚀 開発環境クイックスタート

### 1. 開発環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 依存関係インストール
npm install

# IDD環境セットアップ
npm run idd:setup
npm run idd:hooks:install
```

### 2. 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# 別ターミナルでテスト監視
npm run test:watch
```

### 3. IDD準拠開発フロー

```bash
# 1. Issue作成またはアサイン

# 2. フィーチャーブランチ作成
git checkout -b feature/issue-123

# 3. 開発・コミット（Issue番号必須）
git commit -m "feat: 新機能実装 #123"

# 4. Push & PR作成
git push -u origin feature/issue-123
```

## 🛠️ 技術スタック詳細

### フロントエンド
- **React 18.2** + **Vite 5**
- **TypeScript 5.3** (段階導入中)
- **Tailwind CSS 3** + **Radix UI**
- **D3.js 7** (視覚化)
- **Framer Motion 12** (アニメーション)

### テスト・品質
- **Vitest** + **Playwright**
- **ESLint** + **Prettier**
- **Stryker** (ミューテーションテスト)
- **fast-check** (プロパティベーステスト)

### 状態管理
- **Zustand** + **React Context**
- **@tanstack/react-query**
- **LocalStorage** → **IndexedDB** (移行中)

## 📊 品質基準

### コード品質
- **テストカバレッジ**: 80%以上維持
- **ESLint/Prettier**: 自動フォーマット必須
- **TypeScript**: 段階的導入（2025年Q1完了予定）

### パフォーマンス
- **Core Web Vitals**: 全指標グリーン維持
- **バンドルサイズ**: 1.5MB以下
- **初期ロード時間**: 3秒以下

### IDD準拠
- **Issue参照**: 全コミットでIssue番号必須
- **PR品質**: テスト必須、レビュー必須
- **ブランチ戦略**: feature/issue-XXX命名規則

## 🔍 開発時の注意点

### セキュリティ
- **シークレット管理**: .env.localを使用、コミット禁止
- **XSS対策**: React標準のエスケープ機能活用
- **CSRF対策**: Supabase認証で自動対応

### パフォーマンス
- **メモ化**: React.memo, useMemo, useCallback適切な使用
- **コード分割**: React.lazy + Suspense実装済み
- **画像最適化**: WebP形式推奨

### アクセシビリティ
- **ARIA属性**: Radix UIコンポーネント使用で自動対応
- **キーボードナビゲーション**: 全機能対応必須
- **カラーコントラスト**: WCAG AA準拠

## 🤝 コントリビューション

### Issue作成
- 適切なテンプレート使用
- 再現手順明記
- 期待動作と実際の動作を明記

### PR作成
- Issue番号含める
- テスト追加
- セルフレビュー実施
- CI/CD全通過確認

### レビュー基準
- 機能要件満足
- テストカバレッジ維持
- パフォーマンス影響なし
- セキュリティ問題なし

## 📞 サポート

- **技術質問**: GitHub Discussions
- **バグ報告**: GitHub Issues
- **緊急時**: プロジェクトSlackチャンネル

---

**最終更新**: 2025-08-17  
**管理者**: 開発チーム  
**IDD準拠度**: 99%