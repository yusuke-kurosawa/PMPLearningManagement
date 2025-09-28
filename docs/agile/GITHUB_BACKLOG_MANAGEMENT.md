# GitHub バックログ管理ガイド

_最終更新: 2025-09-28_

## 📋 概要

このガイドでは、GitHub Issues/Projectsを使用してプロダクト・バックログを効率的に管理する方法を説明します。

## 🎯 管理システムの全体像

```
┌─────────────────────────────────────────────────────────┐
│                   Product Backlog                       │
│            (PRODUCT_BACKLOG.md - 82 stories)           │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │Phase 1 │  │Phase 2 │  │Phase 3 │
   │ (15)   │  │ (27)   │  │ (28)   │
   └────┬───┘  └────┬───┘  └────┬───┘
        │           │            │
        └───────┬───┴────────────┘
                │
                ▼
    ┌───────────────────────────┐
    │   GitHub Project Board    │
    │   - Backlog               │
    │   - Sprint Backlog        │
    │   - In Progress           │
    │   - In Review             │
    │   - Done                  │
    └───────────────────────────┘
                │
                ▼
    ┌───────────────────────────┐
    │    GitHub Issues          │
    │  (User Stories + Tasks)   │
    └───────────────────────────┘
```

## 🚀 初期セットアップ

### 1. GitHub Projectの作成

#### ステップ1: Projectの作成

1. GitHubリポジトリのページに移動
2. 「Projects」タブをクリック
3. 「New project」をクリック
4. 「Board」テンプレートを選択
5. プロジェクト名を入力: `PMP Learning Management - Product Backlog`

#### ステップ2: カラムの設定

以下のカラムを作成（左から右の順序）:

| カラム名 | 説明 | 自動化 |
|---------|------|--------|
| 📋 Backlog | プロダクト・バックログ（優先順位順） | 新規Issueを自動追加 |
| 🎯 Sprint Backlog | 現在のスプリント用 | - |
| 🏃 In Progress | 実装中 | Status: In Progressで自動移動 |
| 👀 In Review | レビュー中 | PRオープン時に自動移動 |
| ✅ Done | 完了 | PRマージ時に自動移動 |

#### ステップ3: Viewsの設定

**View 1: Board View（デフォルト）**
- カンバンボード形式
- すべてのIssueを表示

**View 2: Priority View**
- テーブル形式
- 優先度（P0-P3）でソート
- フィルター: `label:user-story`

**View 3: Current Sprint**
- ボード形式
- フィルター: `milestone:Sprint-X`
- Sprint BacklogからDoneまで表示

**View 4: Roadmap**
- ロードマップ形式
- Phase別にグループ化
- タイムライン表示

### 2. ラベル体系の構築

#### 優先度ラベル

```yaml
- name: "priority: P0"
  color: "d73a4a"
  description: "Must Have - 最優先（リリースブロッカー）"

- name: "priority: P1"
  color: "fbca04"
  description: "Should Have - 重要"

- name: "priority: P2"
  color: "0e8a16"
  description: "Could Have - あれば良い"

- name: "priority: P3"
  color: "cccccc"
  description: "Won't Have - 今回は対象外"
```

#### タイプラベル

```yaml
- name: "type: user-story"
  color: "1d76db"
  description: "ユーザーストーリー"

- name: "type: technical-task"
  color: "5319e7"
  description: "技術的タスク"

- name: "type: bug"
  color: "d73a4a"
  description: "バグ修正"

- name: "type: spike"
  color: "d4c5f9"
  description: "調査・検証タスク"
```

#### カテゴリラベル

```yaml
- name: "category: frontend"
  color: "84b6eb"
  description: "フロントエンド関連"

- name: "category: backend"
  color: "c2e0c6"
  description: "バックエンド関連"

- name: "category: api"
  color: "bfdadc"
  description: "API関連"

- name: "category: database"
  color: "f9d0c4"
  description: "データベース関連"

- name: "category: ui-ux"
  color: "fef2c0"
  description: "UI/UX関連"

- name: "category: performance"
  color: "fbca04"
  description: "パフォーマンス最適化"

- name: "category: security"
  color: "d73a4a"
  description: "セキュリティ関連"

- name: "category: testing"
  color: "0e8a16"
  description: "テスト関連"

- name: "category: infrastructure"
  color: "5319e7"
  description: "インフラ関連"

- name: "category: content"
  color: "d4c5f9"
  description: "コンテンツ関連"
```

#### Phaseラベル

```yaml
- name: "phase: 1"
  color: "d73a4a"
  description: "Phase 1 (2-4週間)"

- name: "phase: 2"
  color: "fbca04"
  description: "Phase 2 (4-8週間)"

- name: "phase: 3"
  color: "0e8a16"
  description: "Phase 3 (8-12週間)"

- name: "phase: 4"
  color: "0075ca"
  description: "Phase 4 (12-16週間)"
```

#### ストーリーポイントラベル

```yaml
- name: "points: 1"
  color: "c5def5"
  description: "数時間"

- name: "points: 2"
  color: "c5def5"
  description: "半日"

- name: "points: 3"
  color: "c5def5"
  description: "1日"

- name: "points: 5"
  color: "bfd4f2"
  description: "2-3日"

- name: "points: 8"
  color: "9dc7ec"
  description: "3-5日"

- name: "points: 13"
  color: "7db9e8"
  description: "1週間"

- name: "points: 21"
  color: "5eade3"
  description: "1.5-2週間"

- name: "points: 34"
  color: "3f9fdb"
  description: "2-3週間（分割推奨）"
```

#### ステータスラベル

```yaml
- name: "status: backlog"
  color: "ededed"
  description: "バックログ"

- name: "status: ready"
  color: "0e8a16"
  description: "スプリント準備完了"

- name: "status: in-progress"
  color: "fbca04"
  description: "実装中"

- name: "status: in-review"
  color: "1d76db"
  description: "レビュー中"

- name: "status: blocked"
  color: "d73a4a"
  description: "ブロック中"

- name: "status: done"
  color: "0e8a16"
  description: "完了"
```

### 3. マイルストーンの設定

#### スプリントマイルストーンの作成

```yaml
Title: Sprint 1 - Performance & PWA Foundation
Due Date: 2025-10-12
Description: |
  Focus: パフォーマンス最適化とPWA基盤構築

  Goals:
  - バンドルサイズ最適化 (STORY-001)
  - PWAオフライン機能 (STORY-004)
  - GDPR完全対応 (STORY-007)

  Team Velocity: 55 points
  Sprint Duration: 2 weeks
```

#### Phaseマイルストーンの作成

```yaml
Title: Phase 1 - Foundation & Optimization
Due Date: 2025-10-26
Description: |
  Phase 1の主要目標:
  - パフォーマンス最適化
  - PWA完全対応
  - セキュリティ強化
  - テスト・モニタリング基盤

  Total Stories: 15
  Total Points: 247
```

### 4. 自動化ワークフローの設定

#### Project自動化（GitHub標準機能）

**1. 新しいIssueをBacklogに追加**

```yaml
Trigger: Issue opened
Condition: label contains "user-story" OR "technical-task"
Action: Add to Backlog column
```

**2. In ProgressへのIssue移動**

```yaml
Trigger: Issue assigned
Condition: status changed to "in-progress"
Action: Move to "In Progress" column
```

**3. In ReviewへのIssue移動**

```yaml
Trigger: Pull request opened
Condition: PR references issue
Action: Move to "In Review" column
```

**4. Doneへの自動移動**

```yaml
Trigger: Pull request merged
Condition: PR closes issue
Action: Move to "Done" column, close issue
```

#### GitHub Actions による高度な自動化

**.github/workflows/backlog-automation.yml:**

```yaml
name: 📊 Backlog Automation

on:
  issues:
    types: [opened, edited, labeled, unlabeled]
  pull_request:
    types: [opened, closed]

jobs:
  auto-label:
    runs-on: ubuntu-latest
    steps:
      - name: Add priority label based on title
        if: github.event.action == 'opened'
        uses: actions/github-script@v7
        with:
          script: |
            const title = context.payload.issue.title;
            let priority = 'priority: P2';

            if (title.includes('[P0]') || title.includes('URGENT')) {
              priority = 'priority: P0';
            } else if (title.includes('[P1]') || title.includes('HIGH')) {
              priority = 'priority: P1';
            }

            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              labels: [priority]
            });

  story-points-tracker:
    runs-on: ubuntu-latest
    steps:
      - name: Track story points in PR
        if: github.event.pull_request
        uses: actions/github-script@v7
        with:
          script: |
            const { data: issue } = await github.rest.issues.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number
            });

            const pointsLabel = issue.labels.find(l => l.name.startsWith('points:'));
            if (pointsLabel) {
              const points = parseInt(pointsLabel.name.split(':')[1].trim());
              console.log(`Story completed: ${points} points`);
              // ここでスプリントベロシティを追跡するロジックを追加
            }
```

## 📊 バックログ管理プロセス

### バックログリファインメント（週1回、1-2時間）

#### 目的
- 次スプリントの候補ストーリーを詳細化
- 受入基準の明確化
- 依存関係の特定
- 見積もりの実施

#### 参加者
- プロダクトオーナー
- スクラムマスター
- 開発チーム全員

#### アジェンダ

1. **前回のアクションアイテム確認**（5分）
2. **次スプリント候補の詳細化**（45分）
   - 上位5-10ストーリーを詳細化
   - 受入基準のレビュー
   - 質疑応答
3. **見積もりセッション**（30分）
   - プランニングポーカー
   - ストーリーポイント付与
4. **依存関係の確認**（10分）
5. **優先順位の再確認**（10分）

#### 実施手順

**1. 次スプリント候補の選定**

```bash
# GitHub CLIを使用
gh issue list \
  --label "priority:P0,status:backlog" \
  --limit 10 \
  --json number,title,labels,assignees
```

**2. ストーリーの詳細化**

各ストーリーについて:
- ビジネス価値の確認
- 受入基準の明確化
- 技術的実現可能性の確認
- テスト戦略の議論

**3. 見積もり**

プランニングポーカーの手順:
1. POがストーリーを説明
2. チームが質問
3. 各メンバーが見積もりカードを選択
4. 同時に公開
5. 差異が大きい場合、議論して再見積もり
6. 合意したポイントをラベルで付与

```bash
# ストーリーポイントの付与
gh issue edit 123 --add-label "points:8"
```

### スプリント計画（2週間ごと、2-4時間）

#### Part 1: スプリント目標の設定（1-2時間）

**入力:**
- プロダクト・バックログ（優先順位順）
- チームベロシティ（前スプリント実績）
- チーム稼働時間

**実施内容:**
1. POがスプリント目標を提案
2. チームがベロシティを確認
3. 上位ストーリーからスプリント・バックログに追加
4. 合計ポイントがベロシティに収まるまで

**スプリント目標の例:**
```
Sprint 3 Goal: パフォーマンス最適化とPWA基盤構築
- バンドルサイズを800KB以下に削減
- PWAオフライン機能の基本実装
- Lighthouse Performanceスコア90以上達成
```

**スプリント・バックログの構築:**

```bash
# Sprint 3 マイルストーンの作成
gh api repos/{owner}/{repo}/milestones \
  -f title="Sprint 3 - Performance & PWA" \
  -f due_on="2025-10-12T23:59:59Z" \
  -f description="Focus: Performance optimization and PWA foundation"

# ストーリーをスプリントに割り当て
gh issue edit 123 --milestone "Sprint 3"
gh issue edit 124 --milestone "Sprint 3"
gh issue edit 125 --milestone "Sprint 3"
```

#### Part 2: タスク分解（1-2時間）

各ストーリーを実装可能なタスクに分解:

**例: STORY-001 バンドルサイズ最適化**

```markdown
- [ ] TASK-001-1: 現在のバンドル分析レポート生成
- [ ] TASK-001-2: 大きな依存関係の特定と代替検討
- [ ] TASK-001-3: ツリーシェイキングの設定見直し
- [ ] TASK-001-4: 動的インポートへの変換
- [ ] TASK-001-5: バンドルサイズの検証とドキュメント更新
```

```bash
# タスクIssueの作成
gh issue create \
  --title "TASK-001-1: 現在のバンドル分析レポート生成" \
  --body "ストーリー #123 のサブタスク" \
  --label "type:technical-task,points:2" \
  --milestone "Sprint 3" \
  --assignee username
```

### デイリースクラム（毎日、15分）

#### 実施方法

各メンバーが以下を共有:
1. **昨日やったこと**
2. **今日やること**
3. **ブロッカー・課題**

#### GitHub Issuesでの追跡

```bash
# 自分の進行中タスクを確認
gh issue list \
  --assignee @me \
  --label "status:in-progress"

# ブロックされているIssueを確認
gh issue list \
  --label "status:blocked"
```

#### ブロッカーの処理

```bash
# ブロッカーラベルの追加
gh issue edit 123 \
  --add-label "status:blocked" \
  --remove-label "status:in-progress"

# ブロッカーの内容をコメント
gh issue comment 123 \
  --body "Blocked: API仕様の確定待ち。POに確認中。"
```

### スプリントレビュー（スプリント終了時、1-2時間）

#### 目的
- 完成したストーリーのデモ
- プロダクトオーナーによる受入テスト
- ステークホルダーへのフィードバック収集

#### アジェンダ

1. **スプリント目標のレビュー**（10分）
2. **完成ストーリーのデモ**（60分）
3. **受入テスト**（20分）
4. **フィードバック収集**（15分）
5. **次スプリントのプレビュー**（15分）

#### 完成ストーリーの確認

```bash
# Doneカラムのストーリー一覧
gh issue list \
  --milestone "Sprint 3" \
  --state closed \
  --label "type:user-story"
```

#### 受入基準の確認

各ストーリーの受入基準をチェックリストで確認:

```markdown
## 受入基準チェック (STORY-001)

- [x] バンドルサイズが800KB以下
- [x] 初期ロード時間が2秒以下
- [x] Lighthouse Performanceスコアが90以上
- [x] すべてのテストが通過
- [x] ドキュメントが更新されている
```

### スプリントレトロスペクティブ（スプリント終了時、1-1.5時間）

#### 目的
- プロセスの振り返り
- 改善アクションの特定
- チームのコラボレーション向上

#### フレームワーク: Start/Stop/Continue

**What should we START doing?**
```
- コードレビューの時間を確保する
- ペアプログラミングを実施する
```

**What should we STOP doing?**
```
- 大きすぎるPRを作成する
- 受入基準のないストーリーを開始する
```

**What should we CONTINUE doing?**
```
- デイリースクラムでのブロッカー共有
- 詳細なコミットメッセージ
```

#### アクションアイテムの記録

```bash
# レトロアクションのIssue作成
gh issue create \
  --title "[RETRO] Sprint 3: コードレビュー時間の確保" \
  --body "毎日午後3時にレビュー時間を設ける" \
  --label "type:process-improvement" \
  --milestone "Sprint 4"
```

## 📈 メトリクス・トラッキング

### ベロシティの追跡

**スプリントベロシティの計算:**

```bash
# 完了したストーリーポイントの集計
gh issue list \
  --milestone "Sprint 3" \
  --state closed \
  --json labels \
  --jq '.[] | .labels[] | select(.name | startswith("points:")) | .name'
```

**ベロシティチャート:**

```
Sprint 1: 34 points
Sprint 2: 42 points
Sprint 3: 47 points
Sprint 4: 55 points (計画)
```

### バーンダウンチャート

各スプリントの残りポイントを日々追跡:

```bash
# スプリント開始時の総ポイント: 55
# Day 1: 55 points remaining
# Day 3: 47 points remaining (-8)
# Day 5: 34 points remaining (-13)
# Day 7: 21 points remaining (-13)
# Day 10: 8 points remaining (-13)
# Day 14: 0 points remaining (-8)
```

### サイクルタイム

ストーリーが開始から完了までにかかる時間:

```bash
# Issueのタイムラインを確認
gh issue view 123 --json timelineItems
```

### リードタイム

ストーリーがBacklogに追加されてから完了までの時間:

```bash
# Issue作成日と完了日を比較
gh issue view 123 --json createdAt,closedAt
```

## 🔧 便利なスクリプト

### バックログサマリー生成

**scripts/backlog-summary.sh:**

```bash
#!/bin/bash

echo "📊 Product Backlog Summary"
echo "=========================="
echo ""

echo "Priority Breakdown:"
gh issue list --label "priority:P0" --json number | jq '. | length' | xargs -I {} echo "  P0 (Must Have): {} stories"
gh issue list --label "priority:P1" --json number | jq '. | length' | xargs -I {} echo "  P1 (Should Have): {} stories"
gh issue list --label "priority:P2" --json number | jq '. | length' | xargs -I {} echo "  P2 (Could Have): {} stories"

echo ""
echo "Story Points Distribution:"
for points in 1 2 3 5 8 13 21 34; do
  count=$(gh issue list --label "points:$points" --json number | jq '. | length')
  echo "  $points points: $count stories"
done

echo ""
echo "Current Sprint Progress:"
milestone=$(gh api repos/:owner/:repo/milestones --jq '.[0].title')
total=$(gh issue list --milestone "$milestone" --json number | jq '. | length')
closed=$(gh issue list --milestone "$milestone" --state closed --json number | jq '. | length')
echo "  Milestone: $milestone"
echo "  Total: $total stories"
echo "  Closed: $closed stories"
echo "  Remaining: $((total - closed)) stories"
```

### スプリント開始スクリプト

**scripts/start-sprint.sh:**

```bash
#!/bin/bash

SPRINT_NUM=$1
DUE_DATE=$2

echo "🚀 Starting Sprint $SPRINT_NUM"

# マイルストーンの作成
gh api repos/:owner/:repo/milestones \
  -f title="Sprint $SPRINT_NUM" \
  -f due_on="${DUE_DATE}T23:59:59Z" \
  -f description="Sprint $SPRINT_NUM planning"

echo "✅ Milestone created: Sprint $SPRINT_NUM"

# 上位Issueをスプリントに追加
gh issue list \
  --label "priority:P0,status:ready" \
  --limit 10 \
  --json number \
  --jq '.[].number' | while read issue_num; do
    gh issue edit $issue_num --milestone "Sprint $SPRINT_NUM"
    echo "  Added #$issue_num to Sprint $SPRINT_NUM"
  done

echo "✅ Sprint $SPRINT_NUM started!"
```

### スプリント終了スクリプト

**scripts/close-sprint.sh:**

```bash
#!/bin/bash

SPRINT_MILESTONE=$1

echo "🏁 Closing Sprint: $SPRINT_MILESTONE"

# 未完了Issueを次スプリントに移動
gh issue list \
  --milestone "$SPRINT_MILESTONE" \
  --state open \
  --json number \
  --jq '.[].number' | while read issue_num; do
    gh issue edit $issue_num \
      --remove-label "status:in-progress" \
      --add-label "status:backlog"
    echo "  Moved #$issue_num back to Backlog"
  done

# ベロシティの計算
closed_points=$(gh issue list \
  --milestone "$SPRINT_MILESTONE" \
  --state closed \
  --json labels \
  --jq '[.[] | .labels[] | select(.name | startswith("points:")) | .name | split(":")[1] | tonumber] | add')

echo "✅ Sprint completed with $closed_points points"

# マイルストーンをクローズ
gh api -X PATCH repos/:owner/:repo/milestones/$(gh api repos/:owner/:repo/milestones --jq ".[] | select(.title == \"$SPRINT_MILESTONE\") | .number") \
  -f state="closed"

echo "✅ Sprint $SPRINT_MILESTONE closed!"
```

## 🎯 ベストプラクティス

### 1. ストーリー作成のベストプラクティス

✅ **DO:**
- ビジネス価値を明確に記載
- 受入基準を具体的に定義
- 独立したストーリーを作成
- 1スプリントで完了可能なサイズに分割

❌ **DON'T:**
- 技術的詳細だけを記載
- 曖昧な受入基準
- 複数の機能を1ストーリーに
- 見積もり不可能な大きさ

### 2. バックログのグルーミング

✅ **DO:**
- 定期的にバックログをレビュー
- 上位15-20ストーリーを常に準備
- 古いストーリーを見直し・削除
- 優先順位を継続的に更新

❌ **DON'T:**
- バックログを放置
- すべてのストーリーを詳細化
- 古いストーリーを残し続ける
- 優先順位を固定

### 3. スプリント計画

✅ **DO:**
- チームのキャパシティを考慮
- ベロシティに基づく計画
- バッファを確保
- 明確なスプリント目標

❌ **DON'T:**
- オーバーコミット
- 未詳細化ストーリーを含める
- 目標のないスプリント
- チームの意見を無視

### 4. メトリクスの活用

✅ **DO:**
- ベロシティを追跡
- バーンダウンを可視化
- サイクルタイムを測定
- 改善アクションを記録

❌ **DON'T:**
- メトリクスを追跡しない
- データを振り返らない
- 改善しない
- メトリクスを評価に使用

## 📚 参考リソース

### 内部ドキュメント
- [プロダクト・バックログ](../../PRODUCT_BACKLOG.md)
- [スプリント計画ガイド](./SPRINT_PLANNING_GUIDE.md)
- [IDD実装ステータス](../IDD_IMPLEMENTATION_STATUS.md)

### 外部リソース
- [Scrum Guide](https://scrumguides.org/)
- [User Story Best Practices](https://www.mountaingoatsoftware.com/agile/user-stories)
- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

---

**次のステップ:**
1. GitHub Projectを作成
2. ラベルとマイルストーンをセットアップ
3. バックログからIssueを作成
4. 最初のスプリント計画会議を実施

質問があれば、プロダクトオーナーまたはスクラムマスターにお問い合わせください。