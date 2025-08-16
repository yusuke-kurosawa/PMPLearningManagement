# 📋 DevOps/Automation 統合移行計画書

**作成日**: 2025-08-15  
**目的**: `.claude/devops/` と `.claude/automation/` の重複解消と統合  
**影響範囲**: 高（ディレクトリ構造、スクリプト、ドキュメント）

## 🎯 統合の目的と効果

### 現在の問題点

1. **役割の重複**: CI/CD、GitHub Actions、監視機能が両ディレクトリに分散
2. **管理の複雑化**: 同じ機能が複数箇所に存在し、メンテナンスが困難
3. **混乱の原因**: どちらのディレクトリを使うべきか不明確

### 期待される効果

- ✅ 単一の真実の源（Single Source of Truth）の確立
- ✅ メンテナンス性の向上（管理箇所の削減）
- ✅ 役割の明確化（責任範囲の明確な定義）
- ✅ 開発効率の向上（ファイル探索時間の削減）

## 📁 新しいディレクトリ構造

```
.claude/
├── operations/                    # 🆕 統合運用管理ディレクトリ
│   ├── README.md                 # 統合運用ガイド
│   │
│   ├── ci-cd/                    # CI/CDパイプライン管理
│   │   ├── github-actions/       # GitHub Actions設定
│   │   │   ├── workflows/        # ワークフロー定義
│   │   │   ├── composite/        # コンポジットアクション
│   │   │   └── templates/        # テンプレート
│   │   ├── scripts/              # CI/CDスクリプト
│   │   │   ├── build.sh          # ビルドスクリプト
│   │   │   ├── test.sh           # テストスクリプト
│   │   │   └── deploy.sh         # デプロイスクリプト
│   │   └── pipelines/            # パイプライン定義
│   │
│   ├── automation/               # 開発自動化
│   │   ├── hooks/               # Git Hooks
│   │   │   ├── pre-commit       # コミット前チェック
│   │   │   ├── commit-msg       # メッセージ検証
│   │   │   └── pre-push         # プッシュ前チェック
│   │   ├── scripts/             # 自動化スクリプト
│   │   │   ├── daily/           # 日次タスク
│   │   │   ├── weekly/          # 週次タスク
│   │   │   └── adhoc/           # 随時実行
│   │   └── cron/                # 定期実行設定
│   │
│   ├── monitoring/              # 監視・可観測性
│   │   ├── alerts/              # アラート定義
│   │   ├── dashboards/          # ダッシュボード
│   │   ├── metrics/             # メトリクス定義
│   │   └── logs/                # ログ設定
│   │
│   ├── deployment/              # デプロイメント管理
│   │   ├── environments/        # 環境別設定
│   │   ├── configurations/     # アプリ設定
│   │   └── secrets/             # シークレット管理
│   │
│   └── infrastructure/          # インフラストラクチャ
│       ├── terraform/           # IaC定義
│       ├── docker/              # コンテナ設定
│       └── kubernetes/          # K8s設定
```

## 🔄 移行ステップ

### Phase 1: 準備（実行前）

- [ ] 1. 現在のディレクトリ構造のバックアップ作成
- [ ] 2. 影響を受けるスクリプトとファイルのリストアップ
- [ ] 3. チームへの通知と合意形成

### Phase 2: ディレクトリ作成

```bash
# 新しい統合ディレクトリの作成
mkdir -p .claude/operations/{ci-cd,automation,monitoring,deployment,infrastructure}
mkdir -p .claude/operations/ci-cd/{github-actions,scripts,pipelines}
mkdir -p .claude/operations/automation/{hooks,scripts,cron}
mkdir -p .claude/operations/monitoring/{alerts,dashboards,metrics,logs}
mkdir -p .claude/operations/deployment/{environments,configurations,secrets}
mkdir -p .claude/operations/infrastructure/{terraform,docker,kubernetes}
```

### Phase 3: ファイル移行

#### 3.1 DevOpsからの移行

```bash
# CI/CD関連
mv .claude/devops/ci-cd/github-actions/* .claude/operations/ci-cd/github-actions/
mv .claude/devops/ci-cd/scripts/* .claude/operations/ci-cd/scripts/
mv .claude/devops/ci-cd/templates/* .claude/operations/ci-cd/github-actions/templates/

# 監視関連
mv .claude/devops/monitoring/* .claude/operations/monitoring/

# デプロイメント関連
mv .claude/devops/deployment/* .claude/operations/deployment/

# インフラ関連
mv .claude/devops/infrastructure/* .claude/operations/infrastructure/
```

#### 3.2 Automationからの移行

```bash
# Git Hooks
mv .claude/automation/hooks/* .claude/operations/automation/hooks/

# 自動化スクリプト
mv .claude/automation/scripts/* .claude/operations/automation/scripts/

# Cron設定
mv .claude/automation/cron/* .claude/operations/automation/cron/

# GitHub Actions関連（統合）
mv .claude/automation/workflows/templates/* .claude/operations/ci-cd/github-actions/templates/
mv .claude/automation/workflows/composite/* .claude/operations/ci-cd/github-actions/composite/
```

### Phase 4: ドキュメント更新

#### 4.1 `.claude/README.md` の更新箇所

**削除する行**:

```markdown
21: ├── 📂 automation/ # 自動化設定・スクリプト
22: │ ├── hooks/ # Git Hooks設定
23: │ ├── workflows/ # GitHub Actions統合
24: │ └── scripts/ # 自動化実行スクリプト

36: ├── 📂 devops/ # DevOps設定・ガイドライン
37: │ ├── ci-cd/ # CI/CDパイプライン設定
38: │ ├── monitoring/ # 監視・アラート設定
39: │ └── deployment/ # デプロイメント設定
```

**追加する内容**:

```markdown
├── 📂 operations/ # 統合運用管理（DevOps + Automation）
│ ├── ci-cd/ # CI/CDパイプライン
│ ├── automation/ # 開発自動化
│ ├── monitoring/ # 監視・可観測性
│ ├── deployment/ # デプロイメント
│ └── infrastructure/ # インフラストラクチャ
```

#### 4.2 新しい統合README作成

```bash
# .claude/operations/README.md を作成
```

### Phase 5: NPMスクリプト更新

#### 変更が必要なスクリプト

**package.json の更新**:

```json
{
  "scripts": {
    // 旧スクリプト（削除）
    "devops:dashboard": "node scripts/devops-dashboard.js",
    "devops:fix-eslint": "node scripts/fix-eslint-errors.js",
    "devops:full-check": "npm run lint && npm run test && npm run security:audit",

    // 新スクリプト（追加）
    "ops:dashboard": "node .claude/operations/scripts/dashboard.js",
    "ops:ci-cd": "bash .claude/operations/ci-cd/scripts/run.sh",
    "ops:deploy": "bash .claude/operations/deployment/scripts/deploy.sh",
    "ops:monitor": "node .claude/operations/monitoring/scripts/check.js",

    // 自動化スクリプト（更新）
    "automation:hooks": "bash .claude/operations/automation/hooks/install.sh",
    "automation:daily": "bash .claude/operations/automation/scripts/daily/run.sh",
    "automation:weekly": "bash .claude/operations/automation/scripts/weekly/run.sh"
  }
}
```

### Phase 6: 参照更新

#### 更新が必要なファイル

1. **CLAUDE.md**
   - DevOps/Automationディレクトリへの参照を更新
2. **GitHub Actionsワークフロー**
   - パス参照の更新が必要な場合

3. **スクリプトファイル**
   - 相対パスの更新

## 📊 影響分析

### 影響を受けるコンポーネント

| コンポーネント     | 影響度 | 対応方法                 |
| ------------------ | ------ | ------------------------ |
| Git Hooks          | 高     | パスの更新とテスト       |
| GitHub Actions     | 中     | ワークフロー内のパス更新 |
| NPMスクリプト      | 高     | package.json更新         |
| ドキュメント       | 中     | 参照パスの更新           |
| 開発者ワークフロー | 低     | README更新で対応         |

### リスクと対策

| リスク             | 可能性 | 影響 | 対策                         |
| ------------------ | ------ | ---- | ---------------------------- |
| Git Hooks動作不良  | 中     | 高   | 事前テスト環境で検証         |
| CI/CD失敗          | 低     | 高   | 段階的移行とロールバック準備 |
| ドキュメント不整合 | 高     | 低   | 自動検証スクリプト作成       |
| パス参照エラー     | 中     | 中   | grepで全参照箇所を事前確認   |

## 🔙 ロールバック計画

### ロールバック手順

1. **即座のロールバック（5分以内）**

   ```bash
   # バックアップから復元
   rm -rf .claude/operations
   mv .claude/backup/devops .claude/
   mv .claude/backup/automation .claude/
   git checkout -- package.json .claude/README.md
   ```

2. **部分的ロールバック**
   - 特定の機能のみ元に戻す
   - シンボリックリンクで一時的に対応

### バックアップ作成

```bash
# 実行前に必ず実施
mkdir -p .claude/backup
cp -r .claude/devops .claude/backup/
cp -r .claude/automation .claude/backup/
cp package.json package.json.backup
cp .claude/README.md .claude/README.md.backup
```

## ✅ チェックリスト

### 移行前

- [ ] バックアップ作成完了
- [ ] 影響範囲の確認完了
- [ ] チームへの通知完了
- [ ] テスト環境での検証完了

### 移行中

- [ ] Phase 1: 準備完了
- [ ] Phase 2: ディレクトリ作成完了
- [ ] Phase 3: ファイル移行完了
- [ ] Phase 4: ドキュメント更新完了
- [ ] Phase 5: NPMスクリプト更新完了
- [ ] Phase 6: 参照更新完了

### 移行後

- [ ] Git Hooks動作確認
- [ ] GitHub Actions動作確認
- [ ] NPMスクリプト動作確認
- [ ] ドキュメント整合性確認
- [ ] チームへの完了通知

## 📅 推定作業時間

| フェーズ | 作業内容          | 推定時間    |
| -------- | ----------------- | ----------- |
| Phase 1  | 準備              | 15分        |
| Phase 2  | ディレクトリ作成  | 5分         |
| Phase 3  | ファイル移行      | 10分        |
| Phase 4  | ドキュメント更新  | 20分        |
| Phase 5  | NPMスクリプト更新 | 15分        |
| Phase 6  | 参照更新          | 15分        |
| テスト   | 動作確認          | 20分        |
| **合計** |                   | **約100分** |

## 🚀 実行コマンド

統合を実行する準備ができたら、以下のコマンドを順次実行します：

```bash
# 1. バックアップ作成
bash .claude/scripts/backup-before-migration.sh

# 2. 統合実行
bash .claude/scripts/execute-migration.sh

# 3. 検証
bash .claude/scripts/verify-migration.sh

# 4. クリーンアップ（成功後）
bash .claude/scripts/cleanup-after-migration.sh
```

## 📝 注意事項

1. **実行タイミング**: 開発活動が少ない時間帯を選択
2. **通知**: チーム全体に事前通知を実施
3. **バックアップ**: 必ず実行前にバックアップを作成
4. **段階的実行**: 急がず、各フェーズを確認しながら実行
5. **ドキュメント**: 移行後、新しい構造についてチームに説明

---

**承認者**: ******\_\_\_******  
**実行予定日時**: ******\_\_\_******  
**実行者**: ******\_\_\_******
