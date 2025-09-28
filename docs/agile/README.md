# アジャイル開発ドキュメント

_最終更新: 2025-09-28_

## 📚 概要

このディレクトリには、PMPLearningManagementプロジェクトのアジャイル開発プロセスに関するドキュメントが含まれています。

## 📖 ドキュメント一覧

### 1. プロダクト・バックログ管理

#### [PRODUCT_BACKLOG.md](../../PRODUCT_BACKLOG.md) (1,707行)
**プロダクト・バックログの完全定義**

**内容:**
- 82のユーザーストーリー（完全な受入基準付き）
- MoSCoW分析による優先順位付け（P0-P2）
- 4つのPhaseに分類（Phase 1-4）
- ストーリーポイント見積もり
- 依存関係マッピング
- ビジネス価値の明確化

**対象読者:**
- プロダクトオーナー
- スクラムマスター
- 開発チーム
- ステークホルダー

**Phase別サマリー:**
| Phase | ストーリー数 | 主要テーマ | 目標期間 |
|-------|-------------|-----------|----------|
| Phase 1 | 15 | パフォーマンス・PWA・セキュリティ | 2-4週間 |
| Phase 2 | 27 | バックエンド統合・API | 4-8週間 |
| Phase 3 | 28 | AI機能・コラボレーション | 8-12週間 |
| Phase 4 | 12 | 高度機能・最適化 | 12-16週間 |

---

### 2. GitHub バックログ管理

#### [GITHUB_BACKLOG_MANAGEMENT.md](./GITHUB_BACKLOG_MANAGEMENT.md) (868行)
**GitHub Issues/Projectsを使用したバックログ管理の完全ガイド**

**内容:**
- GitHub Projectの初期セットアップ手順
- 包括的なラベル体系（40+ラベル）
- マイルストーン設定ガイド
- 自動化ワークフローの実装
- バックログリファインメントプロセス
- スプリント計画プロセス
- デイリースクラム運用
- スプリントレビュー・レトロスペクティブ
- メトリクス・トラッキング（ベロシティ、バーンダウン）
- 便利なCLIスクリプト集

**対象読者:**
- スクラムマスター（主要）
- プロダクトオーナー
- 開発チーム
- DevOpsエンジニア

**主要セクション:**
1. 初期セットアップ（Project作成、ラベル、マイルストーン）
2. バックログ管理プロセス（リファインメント、計画、レビュー）
3. メトリクス・トラッキング（ベロシティ、サイクルタイム）
4. 自動化スクリプト（バックログサマリー、スプリント管理）

---

### 3. スプリント計画ガイド

#### [SPRINT_PLANNING_GUIDE.md](./SPRINT_PLANNING_GUIDE.md) (802行)
**効果的なスプリント計画会議の実施ガイド**

**内容:**
- スプリント計画の2部構成（WHAT/HOW）
- スプリント目標設定の手法
- チームキャパシティ計算
- ストーリー選定プロセス
- タスク分解の原則とテクニック
- 技術的設計の議論
- 依存関係の特定
- ベストプラクティスとアンチパターン
- チェックリストとテンプレート

**対象読者:**
- スクラムマスター（ファシリテーター）
- 開発チーム全員
- プロダクトオーナー

**主要セクション:**
1. Part 1: WHAT（スプリント目標、ストーリー選定）
2. Part 2: HOW（タスク分解、技術設計）
3. スプリント計画の成果物
4. ベストプラクティス

**タイムボックス:**
- 2週間スプリント: 4時間
- Part 1 (WHAT): 1.5-2時間
- Break: 15分
- Part 2 (HOW): 1.5-2時間

---

## 🎯 クイックスタートガイド

### 初めてアジャイル開発を始める場合

#### ステップ1: プロダクト・バックログの理解
```bash
# プロダクト・バックログを確認
cat PRODUCT_BACKLOG.md

# Phase 1の最優先ストーリー（15個）を確認
grep -A 20 "Phase 1: 最優先実装" PRODUCT_BACKLOG.md
```

#### ステップ2: GitHub環境のセットアップ
```bash
# GITHUB_BACKLOG_MANAGEMENT.mdに従って:
# 1. GitHub Projectを作成
# 2. ラベルをセットアップ
# 3. マイルストーンを作成
# 4. 自動化を設定
```

**所要時間:** 2-3時間

#### ステップ3: 最初のスプリント計画
```bash
# SPRINT_PLANNING_GUIDE.mdに従って:
# 1. チームでスプリント計画会議を開催（4時間）
# 2. スプリント目標を設定
# 3. ストーリーを選定
# 4. タスクに分解
```

**所要時間:** 4時間（会議）+ 1時間（セットアップ）

#### ステップ4: スプリント開始
```bash
# デイリースクラムを毎日実施（15分）
# タスクをGitHub Projectで管理
# 進捗をバーンダウンチャートで追跡
```

---

## 🔄 典型的なワークフロー

### 週次サイクル

```
Monday    Tuesday   Wednesday Thursday  Friday
──────────────────────────────────────────────
Daily     Daily     Daily     Daily     Daily
Scrum     Scrum     Scrum     Scrum     Scrum
(15min)   (15min)   (15min)   (15min)   (15min)
│         │         │         │         │
│         │         Backlog   │         │
│         │         Refine    │         │
│         │         (1-2h)    │         │
│         │         │         │         │
Development & Collaboration
└─────────────────────────────────────────┘
```

### 2週間スプリントサイクル

```
Week 1                      Week 2
────────────────────────────────────────────
Day 1: Sprint Planning     Day 8: Mid-sprint
       (4 hours)                  Check-in
│                          │
Days 2-7: Development      Days 9-13: Development
          Daily Scrums              Daily Scrums
│                          │
                           Day 14: Sprint Review
                                   (1-2 hours)
                                   Sprint Retro
                                   (1-1.5 hours)
```

---

## 📊 重要なメトリクス

### トラッキングすべき指標

#### 1. ベロシティ
```
過去4スプリントの平均完了ストーリーポイント
目標: 安定したベロシティの維持
```

#### 2. バーンダウン
```
スプリント中の残りポイント推移
目標: 理想線に沿った進捗
```

#### 3. サイクルタイム
```
ストーリーが開始から完了までにかかる時間
目標: 短縮と安定化
```

#### 4. 完了率
```
計画したストーリーのうち完了した割合
目標: 85%以上
```

### メトリクスの確認方法

```bash
# ベロシティの確認
gh issue list --milestone "Sprint 3" --state closed --json labels

# 進行中のストーリー確認
gh issue list --milestone "Sprint 3" --label "status:in-progress"

# 完了率の計算
# 完了 / 計画 × 100
```

---

## 🛠 ツールとテンプレート

### GitHub Issue テンプレート

#### 1. ユーザーストーリー
**場所:** `.github/ISSUE_TEMPLATE/07_user_story.yml`

**使用方法:**
```bash
# GitHub UIから
Issues → New Issue → User Story テンプレート

# または GitHub CLI
gh issue create --template user_story.yml
```

**含まれる項目:**
- ユーザーストーリー（As a/I want to/So that）
- 受入基準（Given/When/Then）
- 優先度（P0-P3）
- ストーリーポイント
- ビジネス価値
- Definition of Done

#### 2. 技術的タスク
**場所:** `.github/ISSUE_TEMPLATE/08_technical_task.yml`

**使用方法:**
```bash
# GitHub UIから
Issues → New Issue → Technical Task テンプレート

# または GitHub CLI
gh issue create --template technical_task.yml
```

**含まれる項目:**
- タスク概要
- 技術的背景
- 完了条件
- 工数見積もり
- 実装計画
- テスト戦略

### スクリプト集

#### バックログサマリー生成
```bash
# 場所: scripts/backlog-summary.sh
./scripts/backlog-summary.sh

# 出力例:
# Priority Breakdown:
#   P0: 42 stories
#   P1: 28 stories
#   P2: 12 stories
```

#### スプリント開始
```bash
# 場所: scripts/start-sprint.sh
./scripts/start-sprint.sh 3 "2025-10-12"

# 実行内容:
# - Sprint 3マイルストーン作成
# - 上位Issueをスプリントに追加
```

#### スプリント終了
```bash
# 場所: scripts/close-sprint.sh
./scripts/close-sprint.sh "Sprint 3"

# 実行内容:
# - 未完了Issueをバックログに戻す
# - ベロシティ計算
# - マイルストーンクローズ
```

---

## 📋 チェックリスト

### プロジェクト開始時

- [ ] プロダクト・バックログを確認・理解
- [ ] GitHub Projectを作成
- [ ] ラベル体系をセットアップ
- [ ] Issueテンプレートを確認
- [ ] 最初のスプリント計画会議をスケジュール
- [ ] チームにアジャイルプロセスを説明

### スプリント開始時

- [ ] スプリント計画会議を実施（4時間）
- [ ] スプリント目標を文書化
- [ ] ストーリーをマイルストーンに追加
- [ ] タスクに分解
- [ ] GitHub Projectを更新
- [ ] デイリースクラムをスケジュール

### スプリント中（毎日）

- [ ] デイリースクラムを実施（15分）
- [ ] タスクの進捗を更新
- [ ] ブロッカーを特定・解決
- [ ] バーンダウンを確認
- [ ] コードレビューを実施

### スプリント終了時

- [ ] スプリントレビューを実施（1-2時間）
- [ ] 完成したストーリーをデモ
- [ ] プロダクトオーナーが受入テスト
- [ ] スプリントレトロスペクティブを実施（1-1.5時間）
- [ ] 改善アクションアイテムを記録
- [ ] ベロシティを計算・記録

---

## 🎓 学習リソース

### 推奨読書順序

1. **初心者向け:**
   - [PRODUCT_BACKLOG.md](../../PRODUCT_BACKLOG.md) の概要セクション
   - [SPRINT_PLANNING_GUIDE.md](./SPRINT_PLANNING_GUIDE.md) のクイックスタート

2. **中級者向け:**
   - [GITHUB_BACKLOG_MANAGEMENT.md](./GITHUB_BACKLOG_MANAGEMENT.md) の全セクション
   - [SPRINT_PLANNING_GUIDE.md](./SPRINT_PLANNING_GUIDE.md) のベストプラクティス

3. **上級者向け:**
   - メトリクス・トラッキングの詳細
   - 自動化スクリプトのカスタマイズ
   - 高度なGitHub Actions統合

### 外部リソース

#### Scrum基礎
- [The Scrum Guide](https://scrumguides.org/) - Scrumの公式ガイド
- [Scrum.org Learning Path](https://www.scrum.org/learning-series) - 学習パス

#### ユーザーストーリー
- [User Stories Applied](https://www.mountaingoatsoftware.com/books/user-stories-applied) - Mike Cohn著
- [INVEST in Good Stories](https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/) - Bill Wake

#### 見積もり
- [Planning Poker](https://www.mountaingoatsoftware.com/agile/planning-poker) - 見積もり手法
- [Agile Estimating and Planning](https://www.mountaingoatsoftware.com/books/agile-estimating-and-planning) - Mike Cohn著

---

## 🤝 貢献とフィードバック

### ドキュメントの改善

このアジャイルドキュメントは継続的に改善されます。

**フィードバック方法:**
1. GitHub Issueを作成
2. プルリクエストを提出
3. スクラムマスターに直接連絡

**改善提案の例:**
- プロセスの簡素化
- 新しいベストプラクティス
- ツールの追加
- テンプレートの改善

---

## 📞 サポート

### 質問・相談先

**プロダクトオーナー関連:**
- バックログの優先順位
- ビジネス価値の判断
- 受入基準の明確化

**スクラムマスター関連:**
- プロセスの実施方法
- ファシリテーション支援
- ツールの使用方法

**技術的質問:**
- GitHub Issues/Projectsの設定
- 自動化スクリプト
- メトリクス計算

---

## 📈 今後の拡張予定

### 計画中のドキュメント

1. **DEFINITION_OF_DONE.md**
   - プロジェクト全体のDoD
   - ストーリータイプ別DoD

2. **VELOCITY_TRACKING.md**
   - 詳細なベロシティ分析
   - 予測モデル

3. **RETROSPECTIVE_GUIDE.md**
   - レトロスペクティブ手法集
   - アクションアイテム管理

4. **ESTIMATION_GUIDE.md**
   - プランニングポーカー詳細
   - 見積もり精度向上テクニック

---

## 📅 更新履歴

| 日付 | 変更内容 | 担当者 |
|------|---------|--------|
| 2025-09-28 | 初版作成（PRODUCT_BACKLOG、管理ガイド2本） | Claude |
| 2025-09-28 | Issueテンプレート追加（ユーザーストーリー、技術タスク） | Claude |

---

**次のアクション:**
1. [PRODUCT_BACKLOG.md](../../PRODUCT_BACKLOG.md)を確認
2. [GITHUB_BACKLOG_MANAGEMENT.md](./GITHUB_BACKLOG_MANAGEMENT.md)に従ってセットアップ
3. [SPRINT_PLANNING_GUIDE.md](./SPRINT_PLANNING_GUIDE.md)で最初のスプリント計画

質問があれば、スクラムマスターまたはプロダクトオーナーにお問い合わせください。