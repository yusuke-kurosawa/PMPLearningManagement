# 🚀 DevOps クイックリファレンスシステム

DevOpsコマンド、API、ベストプラクティスのための包括的でインタラクティブなクイックリファレンスシステム。

## 📚 概要

クイックリファレンスシステムは以下への即座のアクセスを提供します：

- **500以上のDevOpsコマンド** をカテゴリ別に整理
- **APIドキュメント** と例、認証情報付き
- **アーキテクチャパターン** とシステム設計
- **トラブルシューティングガイド** と解決方法
- **セキュリティベストプラクティス** とスキャンツール
- **監視とメトリクス** の設定
- **データベース操作** と最適化

## 🎯 機能

### インタラクティブコマンドファインダー

- **ファジー検索** 全リファレンス横断
- **カテゴリブラウジング** 整理された探索
- **コマンド実行** CLIから直接
- **クリップボード統合** 素早いコピー
- **お気に入りと履歴** 追跡

### Webインターフェース

- **美しいUI** ダークモードサポート
- **リアルタイム検索** ハイライト付き
- **コマンドパレット** (Cmd+K)
- **PDF/HTML出力** チートシート
- **モバイルレスポンシブ** デザイン

### 自動更新

- **コードベースと同期** 変更点
- **コマンド検証** 動作確認
- **package.jsonスクリプトから更新**
- **GitHub Actions** 統合
- **リンク切れ検出**

## 🚀 クイックスタート

### CLI使用方法

```bash
# インタラクティブモード
npm run quickref

# 直接検索
npm run quickref:search "docker build"

# カテゴリ別ブラウズ
npm run quickref:browse

# リファレンス更新
npm run quickref:update
```

### Webインターフェース

```bash
# Webインターフェースを開く
npm run quickref:web

# または直接開く
open .claude/quick-ref/web/index.html
```

## 📁 構造

```
.claude/quick-ref/
├── README.md                 # このファイル
├── commands.md              # CLIコマンドリファレンス
├── file-locations.md        # プロジェクトファイル構造
├── architecture.md          # システムアーキテクチャ
├── apis.md                  # APIドキュメント
├── troubleshooting.md       # よくある問題と解決方法
├── workflows.md             # CI/CDワークフロー
├── environment.md           # 環境変数
├── security.md              # セキュリティプラクティス
├── monitoring.md            # 監視とログ記録
├── database.md              # データベース操作
├── finder/                  # インタラクティブCLIツール
│   ├── cli.js              # メインCLIアプリケーション
│   ├── search.js           # 検索機能
│   └── package.json        # CLI依存関係
├── web/                     # Webインターフェース
│   ├── index.html          # メインHTML
│   ├── styles.css          # スタイリング
│   └── search.js           # 検索ロジック
└── scripts/                 # 自動化スクリプト
    ├── update-refs.js      # 自動リファレンス更新
    ├── validate-refs.js    # コマンド検証
    └── generate-cheatsheet.js # PDF生成
```

## 🔧 リファレンスファイル

### commands.md

- 開発、テスト、デプロイメントコマンド
- Docker、Kubernetes操作
- Gitワークフロー
- NPMスクリプト
- トラブルシューティングコマンド

### apis.md

- REST APIエンドポイント
- 認証フロー
- WebSocket接続
- リクエスト/レスポンス例
- レート制限とセキュリティ

### architecture.md

- システム設計パターン
- コンポーネントアーキテクチャ
- データフロー図
- インフラストラクチャセットアップ
- スケーラビリティ戦略

### troubleshooting.md

- よくあるエラーと解決方法
- パフォーマンス問題
- デバッグ技術
- 緊急時手順
- ヘルスチェック

### workflows.md

- GitHub Actionsパイプライン
- CI/CD設定
- デプロイメント戦略
- 自動テスト
- リリース管理

### environment.md

- 環境変数
- 設定管理
- 秘密情報処理
- フィーチャーフラグ
- ビルド設定

### security.md

- OWASP Top 10 防止策
- 認証と認可
- セキュリティスキャンツール
- インシデント対応
- ベストプラクティス

### monitoring.md

- ログ記録戦略
- メトリクス収集
- アラート設定
- ダッシュボードセットアップ
- パフォーマンス監視

### database.md

- Prisma操作
- クエリ最適化
- マイグレーション戦略
- バックアップとリカバリ
- パフォーマンスチューニング

## 🛠️ NPMスクリプト

```json
{
  "quickref": "インタラクティブコマンドファインダー",
  "quickref:search": "コマンド検索",
  "quickref:browse": "カテゴリ別ブラウズ",
  "quickref:update": "コードベースからリファレンス更新",
  "quickref:validate": "全コマンド検証",
  "quickref:cheatsheet": "PDFチートシート生成",
  "quickref:status": "システムステータス表示",
  "quickref:web": "Webインターフェースを開く",
  "quickref:install": "CLI依存関係インストール"
}
```

## 🎨 カスタマイゼーション

### 新しいコマンドの追加

関連する`.md`ファイルを編集し、この形式でコマンドを追加：

````markdown
### コマンドの説明

\```bash

# コマンドを説明するコメント

actual-command --with-flags

# 期待される出力またはメモ

\```
````

### カスタムカテゴリの作成

1. `.claude/quick-ref/`に新しい`.md`ファイルを作成
2. 既存の形式に従う
3. `npm run quickref:update`を実行してインデックス化

### Webインターフェースのテーマ設定

`.claude/quick-ref/web/styles.css`を編集：

- 色用のCSS変数
- ダークモードサポート付き
- レスポンシブブレークポイント

## 🔄 自動更新システム

システムは以下によりリファレンスを自動更新：

1. **package.jsonスキャン** 新しいスクリプト用
2. **GitHub Actionsワークフロー解析**
3. **ディレクトリ構造変更分析**
4. **既存コマンド検証** 動作確認
5. **ドキュメント内リンク切れチェック**

更新実行：

```bash
npm run quickref:update
```

## 📊 メトリクスと分析

使用状況追跡とシステム改善：

- 最も検索されるコマンド
- 人気カテゴリ
- 検索失敗（ドキュメント追加用）
- コマンド実行成功率
- ユーザーフィードバック統合

## 🤝 コントリビューション

### ドキュメント追加

1. 適切な`.md`ファイルを選択
2. 説明付きコマンドを追加
3. 例と期待される出力を含める
4. コマンドの動作テスト
5. 検証実行：`npm run quickref:validate`

### 検索改善

検索アルゴリズムの使用：

- ファジーマッチング
- タグベースフィルタリング
- カテゴリ重み付け
- 関連性スコアリング

`.claude/quick-ref/finder/search.js`を編集して改善

### Webインターフェース強化

1. モダンでレスポンシブなデザイン
2. アクセシビリティ（WCAG 2.1 AA）
3. パフォーマンス（遅延読み込み）
4. プログレッシブエンハンスメント

## 🐛 トラブルシューティング

### CLIが動作しない

```bash
# 依存関係インストール
cd .claude/quick-ref/finder
npm install

# Nodeバージョン確認（18+必須）
node --version
```

### Webインターフェース問題

- ブラウザキャッシュクリア
- コンソールエラー確認
- JavaScript有効化確認
- 別ブラウザで試行

### 更新失敗

```bash
# 手動検証
npm run quickref:validate

# 権限確認
ls -la .claude/quick-ref/

# リセットして再試行
git checkout -- .claude/quick-ref/
npm run quickref:update
```

## 📈 ロードマップ

### 計画機能

- [ ] AI駆動コマンド提案
- [ ] ビデオチュートリアル統合
- [ ] チーム共有とコラボレーション
- [ ] コマンド履歴同期
- [ ] VS Code拡張機能
- [ ] Slack/Discordボット
- [ ] モバイルアプリ
- [ ] オフラインモード

### パフォーマンス目標

- 検索応答 < 50ms
- Web読み込み時間 < 1s
- CLI起動 < 100ms
- 更新プロセス < 30s

## 📄 ライセンス

MITライセンス - 詳細はLICENSEファイルを参照

## 👥 クレジット

PMP Learning Teamが❤️を込めて構築

### 使用技術

- CLIツール用Node.js
- WebインターフェースバニラJS
- ドキュメント用Markdown
- 自動化用GitHub Actions

---

**最終更新**: `npm run quickref:update`によるリアルタイム  
**バージョン**: 1.0.0  
**ステータス**: 本番環境対応 ✅
