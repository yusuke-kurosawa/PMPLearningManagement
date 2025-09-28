# スプリント計画ガイド

_最終更新: 2025-09-28_

## 📋 概要

このガイドでは、効果的なスプリント計画会議の実施方法と、スプリント・バックログの抽出・管理方法を説明します。

## 🎯 スプリント計画の目的

スプリント計画会議は、次のスプリントで何を実現するかをチームで合意するための重要なイベントです。

**主な成果物:**
1. **スプリント目標** - スプリントで達成したいこと
2. **スプリント・バックログ** - 実装するストーリーとタスクのリスト
3. **完了の定義の確認** - 何をもって完了とするかの共通理解

## ⏰ スプリント計画のタイムボックス

| スプリント期間 | 計画会議の時間 |
|---------------|---------------|
| 1週間 | 2時間 |
| 2週間 | 4時間 |
| 3週間 | 6時間 |
| 4週間 | 8時間 |

**推奨:** 2週間スプリント + 4時間計画会議

## 👥 参加者

### 必須参加者
- **プロダクトオーナー** - ビジネス価値の説明、優先順位の決定
- **スクラムマスター** - ファシリテーション、プロセス支援
- **開発チーム全員** - 見積もり、タスク分解、コミットメント

### オプション参加者
- ステークホルダー（Part 1のみ）
- ドメインエキスパート（質問対応）

## 📅 スプリント計画の2部構成

```
┌─────────────────────────────────────────────────────────┐
│              Sprint Planning Meeting                    │
│                    (4 hours)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Part 1: WHAT (1.5-2 hours)                           │
│  ┌─────────────────────────────────────┐              │
│  │ - Sprint Goal setting               │              │
│  │ - Story selection                   │              │
│  │ - Acceptance criteria review        │              │
│  │ - Capacity planning                 │              │
│  └─────────────────────────────────────┘              │
│                                                         │
│  Break (15 minutes)                                    │
│                                                         │
│  Part 2: HOW (1.5-2 hours)                            │
│  ┌─────────────────────────────────────┐              │
│  │ - Task breakdown                    │              │
│  │ - Technical design discussion       │              │
│  │ - Dependency identification         │              │
│  │ - Assignment (optional)             │              │
│  └─────────────────────────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Part 1: WHAT - スプリント目標とストーリー選定

### 準備（計画会議の前）

#### プロダクトオーナーの準備

1. **バックログの優先順位付け完了**
   ```bash
   # 優先順位順にストーリーをリスト
   gh issue list \
     --label "type:user-story,status:ready" \
     --state open \
     --json number,title,labels \
     --jq 'sort_by(.labels[] | select(.name | startswith("priority:")) | .name)'
   ```

2. **受入基準の明確化**
   - すべてのストーリーに具体的な受入基準
   - ビジネス価値の明記
   - 依存関係の特定

3. **ステークホルダーの期待値確認**
   - 次スプリントでの期待
   - ビジネス目標との整合性

#### 開発チームの準備

1. **前スプリントのベロシティ確認**
   ```bash
   # 前スプリントの完了ポイント
   gh issue list \
     --milestone "Sprint 2" \
     --state closed \
     --json labels \
     --jq '[.[] | .labels[] | select(.name | startswith("points:")) | .name | split(":")[1] | tonumber] | add'
   ```

2. **チーム稼働時間の確認**
   - 休暇・休日
   - 他プロジェクトへのコミットメント
   - トレーニング・ミーティング時間

3. **技術的負債の確認**
   - 解決が必要な技術的課題
   - 前スプリントからの積み残し

### Step 1: スプリント目標の設定（30分）

#### スプリント目標の要素

良いスプリント目標:
- **具体的**: 何を達成するか明確
- **測定可能**: 達成したか判断できる
- **達成可能**: チームのキャパシティ内
- **ビジネス価値**: なぜ重要かが明確
- **時間制約**: スプリント期間内

#### スプリント目標の例

**例1: Phase 1開始時**
```
Sprint 3 Goal: パフォーマンス最適化とPWA基盤構築

達成基準:
✓ バンドルサイズを1.3MB → 800KB以下に削減
✓ PWAオフライン機能の基本実装完了
✓ Lighthouse Performanceスコア88 → 90以上
✓ エラー監視システム（Sentry）統合完了

ビジネス価値:
- ユーザー体験向上（高速化）
- オフライン学習の実現
- 本番環境の安定性向上
```

**例2: バックエンド統合**
```
Sprint 5 Goal: バックエンドAPI基盤の構築

達成基準:
✓ tRPC API基盤完成
✓ Prisma ORMとPostgreSQL統合
✓ 認証エンドポイント実装
✓ 学習進捗API実装

ビジネス価値:
- データ永続化の実現
- マルチデバイス同期の準備
- スケーラブルなアーキテクチャ
```

#### スプリント目標の設定プロセス

1. **POが目標を提案**
   ```
   「次のスプリントでは、パフォーマンス最適化に集中し、
   ユーザー体験を大幅に向上させたいと考えています。」
   ```

2. **チームでディスカッション**
   - 技術的実現可能性
   - リスクの確認
   - 依存関係の検討

3. **目標の合意**
   - チーム全員が理解
   - 達成可能性に納得
   - コミットメント

### Step 2: チームキャパシティの計算（15分）

#### 稼働時間の計算

**例: 2週間スプリント、3人チーム**

| メンバー | 稼働日数 | 1日の時間 | スプリント合計 | 備考 |
|---------|---------|----------|--------------|------|
| Alice | 10日 | 6時間 | 60時間 | フルタイム |
| Bob | 8日 | 6時間 | 48時間 | 2日休暇 |
| Carol | 10日 | 4時間 | 40時間 | 他PJ兼務 |
| **合計** | - | - | **148時間** | - |

#### フォーカスファクター（実効率）

実際の開発時間 = 稼働時間 × フォーカスファクター

**フォーカスファクターの目安:**
- 新しいチーム: 0.6 (60%)
- 経験あるチーム: 0.7-0.8 (70-80%)
- 成熟したチーム: 0.8-0.9 (80-90%)

**実効時間の計算:**
```
148時間 × 0.7 = 103.6時間
```

#### キャパシティベースのストーリーポイント

**前提:**
- 前スプリントのベロシティ: 55ポイント
- 前スプリントの実効時間: 120時間
- 1ポイントあたりの時間: 120 / 55 ≈ 2.2時間

**今スプリントの目標ポイント:**
```
103.6時間 / 2.2時間 ≈ 47ポイント
```

**バッファを考慮:**
```
47ポイント × 0.9 = 42ポイント（安全目標）
```

### Step 3: ストーリーの選定（45分）

#### ストーリー選定のプロセス

1. **上位ストーリーから順に検討**
   ```bash
   # 優先順位順にストーリーをリスト
   gh issue list \
     --label "priority:P0,status:ready" \
     --json number,title,labels \
     --jq '.[] | {number, title, points: (.labels[] | select(.name | startswith("points:")) | .name)}'
   ```

2. **各ストーリーについて:**
   - POがストーリーを説明（5分）
   - チームが質問（5分）
   - 受入基準のレビュー
   - スプリント目標との整合性確認

3. **ポイント合計を確認**
   - 目標キャパシティに達するまで追加
   - 42ポイント目標の例:

   ```
   STORY-001: バンドルサイズ最適化 (13ポイント) → 累計: 13
   STORY-002: 遅延ローディング拡張 (8ポイント) → 累計: 21
   STORY-004: オフライン学習機能 (21ポイント) → 累計: 42
   ```

4. **スプリット判断**
   - ストーリーが大きすぎる場合は分割
   - 例: STORY-004 (21ポイント) を2つに:
     ```
     STORY-004A: Service Worker拡張 (13ポイント)
     STORY-004B: オフラインデータ同期 (8ポイント)
     ```

#### ストーリー選定の判断基準

✅ **選定すべきストーリー:**
- スプリント目標に直接貢献
- すべての依存関係が解決済み
- 受入基準が明確
- チームが理解している
- 1スプリントで完了可能

❌ **選定すべきでないストーリー:**
- 受入基準が曖昧
- 依存関係が未解決
- 技術的な不確実性が高い
- スプリント目標と無関係

### Step 4: スプリント・バックログの確定（15分）

#### マイルストーンへの追加

```bash
# Sprint 3マイルストーンの作成
gh api repos/{owner}/{repo}/milestones \
  -f title="Sprint 3 - Performance & PWA" \
  -f due_on="2025-10-12T23:59:59Z" \
  -f description="Goal: パフォーマンス最適化とPWA基盤構築"

# 選定したストーリーをマイルストーンに追加
gh issue edit 123 --milestone "Sprint 3"
gh issue edit 124 --milestone "Sprint 3"
gh issue edit 125 --milestone "Sprint 3"
```

#### スプリント・バックログのスナップショット

**Sprint 3 Backlog:**

| Story ID | タイトル | ポイント | 担当 |
|---------|---------|---------|------|
| STORY-001 | バンドルサイズ最適化 | 13 | TBD |
| STORY-002 | 遅延ローディング拡張 | 8 | TBD |
| STORY-004A | Service Worker拡張 | 13 | TBD |
| STORY-014 | エラー監視システム | 8 | TBD |
| **合計** | - | **42** | - |

## 🔧 Part 2: HOW - タスク分解と実装計画

### Break（15分）

Part 1とPart 2の間に休憩を取り、チームをリフレッシュさせます。

### Step 5: タスク分解（60分）

#### タスク分解の原則

**SMART タスク:**
- **Specific**: 具体的な作業内容
- **Measurable**: 完了が判断できる
- **Assignable**: 1人に割り当て可能
- **Realistic**: 1-2日で完了可能
- **Time-bound**: 明確な完了時間

#### タスク分解の例

**STORY-001: バンドルサイズ最適化（13ポイント）**

チームでホワイトボード（またはMiro）を使ってタスクを洗い出し:

```markdown
## Technical Approach

### Phase 1: Analysis
- [ ] TASK-001-1: 現在のバンドル構成分析 (3h)
  - webpack-bundle-analyzer実行
  - 大きな依存関係の特定
  - 分析レポート作成

### Phase 2: Dependencies Optimization
- [ ] TASK-001-2: moment.js → day.js置き換え (4h)
  - day.js導入
  - すべてのmoment.js使用箇所を変更
  - テスト更新

- [ ] TASK-001-3: lodash tree-shaking設定 (2h)
  - lodash-esに変更
  - 個別インポートに変更
  - テスト実行

### Phase 3: Code Splitting
- [ ] TASK-001-4: ルートベースコード分割 (6h)
  - 各ルートコンポーネントを動的インポート化
  - Suspense境界の設定
  - ローディング状態の実装

### Phase 4: Configuration
- [ ] TASK-001-5: Vite設定最適化 (2h)
  - ツリーシェイキング設定
  - チャンク分割戦略
  - 圧縮設定

### Phase 5: Verification
- [ ] TASK-001-6: バンドルサイズ検証 (2h)
  - ビルド実行
  - サイズ測定
  - Lighthouse実行
  - ドキュメント更新

Total: ~19時間 (13ポイント × 1.5時間/ポイント)
```

#### タスクIssueの作成

```bash
# 親ストーリー
gh issue create \
  --title "STORY-001: バンドルサイズ最適化" \
  --body-file story-001.md \
  --label "type:user-story,priority:P0,points:13" \
  --milestone "Sprint 3"

# サブタスク1
gh issue create \
  --title "TASK-001-1: 現在のバンドル構成分析" \
  --body "親ストーリー: #123" \
  --label "type:technical-task,points:2" \
  --milestone "Sprint 3"

# サブタスク2
gh issue create \
  --title "TASK-001-2: moment.js → day.js置き換え" \
  --body "親ストーリー: #123\n依存: #124" \
  --label "type:technical-task,points:3" \
  --milestone "Sprint 3"

# ... 以降同様
```

#### タスクボードの構成

```
Sprint 3 Board

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ To Do       │ In Progress │ In Review   │ Done        │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ TASK-001-1  │             │             │             │
│ TASK-001-2  │             │             │             │
│ TASK-001-3  │             │             │             │
│ TASK-001-4  │             │             │             │
│ TASK-001-5  │             │             │             │
│ TASK-001-6  │             │             │             │
│             │             │             │             │
│ TASK-002-1  │             │             │             │
│ TASK-002-2  │             │             │             │
│ ...         │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Step 6: 技術的設計の議論（30分）

#### 主要な技術的決定

各ストーリーについて、重要な技術的決定を議論:

**STORY-001の例:**

1. **バンドル分析ツール**
   - 決定: webpack-bundle-analyzer
   - 理由: Viteと統合可能、視覚的

2. **日付ライブラリ**
   - 決定: day.js
   - 理由: moment.jsと互換API、2KB vs 288KB

3. **コード分割戦略**
   - 決定: ルートベース + コンポーネントベース
   - 理由: 初期ロード最適化

4. **テスト戦略**
   - ユニットテスト: 既存テスト更新
   - E2Eテスト: ローディング状態の検証
   - パフォーマンステスト: Lighthouse CI

#### アーキテクチャ決定記録（ADR）

重要な決定は記録:

```markdown
# ADR-015: day.jsへの移行

## Status
Accepted

## Context
moment.jsがバンドルサイズの30%（288KB）を占めている。
パフォーマンス目標達成のため、軽量な代替が必要。

## Decision
day.jsに移行する。

## Consequences
### Positive
- バンドルサイズ286KB削減
- API互換性が高く移行容易
- プラグイン機構で必要な機能のみ追加可能

### Negative
- すべてのmoment.js使用箇所を変更必要
- 一部プラグインが必要
- チームの学習コスト

## Implementation
- TASK-001-2で実装
- 段階的に置き換え
- テストで互換性確認
```

### Step 7: 依存関係の特定（15分）

#### 依存関係マップの作成

```
STORY-001 (バンドルサイズ最適化)
  │
  ├─→ STORY-002 (遅延ローディング拡張)
  │     └─→ TASK-002-1 (ルートベース実装)
  │           ← 依存: TASK-001-4完了後
  │
  └─→ STORY-004A (Service Worker拡張)
        └─→ TASK-004-2 (キャッシュ戦略)
              ← 依存: TASK-001-6完了後（最適化後のサイズ確定）
```

#### ブロッカーの事前解決

**特定されたブロッカー:**
1. API仕様が未確定 → POに確認依頼
2. デザインモックアップ待ち → デザイナーに依頼
3. テスト環境の準備 → DevOpsチームに依頼

```bash
# ブロッカーチケットの作成
gh issue create \
  --title "[BLOCKER] API仕様の確定" \
  --body "STORY-001の実装に必要" \
  --label "type:blocker,priority:P0" \
  --assignee product-owner
```

### Step 8: タスクのアサイン（オプション、15分）

#### 自己組織化アプローチ

**推奨:** スプリント中にチームメンバーが自発的にタスクを取る

**代替:** 計画会議で大まかなアサイン
- スキルセットに基づく
- 学習機会の提供
- 負荷の均等化

#### ペアプログラミング計画

複雑なタスクはペアで実施:

```
TASK-001-4 (コード分割)
  Pair: Alice (経験豊富) + Bob (学習中)

TASK-004-3 (Service Worker)
  Pair: Carol (エキスパート) + Alice (知識共有)
```

## 📊 スプリント計画の成果物

### 1. スプリント目標ドキュメント

**docs/sprints/sprint-3-goal.md:**

```markdown
# Sprint 3 Goal

## Sprint Period
2025-09-28 → 2025-10-12 (2 weeks)

## Goal Statement
パフォーマンス最適化とPWA基盤構築により、
ユーザー体験を大幅に向上させる。

## Success Criteria
- [x] バンドルサイズ: 1.3MB → 800KB以下
- [ ] 初期ロード: 2.8秒 → 2.0秒以下
- [ ] Lighthouse Performance: 88 → 90以上
- [ ] PWAオフライン基本機能完成
- [ ] エラー監視システム稼働

## Selected Stories (42 points)
1. STORY-001: バンドルサイズ最適化 (13pt)
2. STORY-002: 遅延ローディング拡張 (8pt)
3. STORY-004A: Service Worker拡張 (13pt)
4. STORY-014: エラー監視システム (8pt)

## Team Capacity
- Total hours: 148h
- Focus factor: 0.7
- Effective hours: 103.6h
- Target velocity: 42 points

## Risks & Mitigations
- Risk: バンドル分析に想定以上の時間
  - Mitigation: TASK-001-1を優先実施、早期判断

- Risk: Service Worker複雑度
  - Mitigation: ペアプログラミング、外部エキスパート相談

## Definition of Done
- すべての受入基準を満たす
- コードレビュー完了
- テスト実装・通過
- ドキュメント更新
- Lighthouse検証完了
```

### 2. タスクボード

GitHub Projectsに以下の構成:

```
Sprint 3 - Performance & PWA

Columns:
- Sprint Backlog (4 stories, 42 points)
- To Do (26 tasks)
- In Progress (0 tasks)
- In Review (0 tasks)
- Done (0 tasks)

Filters:
- View 1: All tasks
- View 2: By Story (grouped)
- View 3: By Assignee
```

### 3. バーンダウンチャート（予定）

```
Day 0: 42 points remaining
Day 2: 38 points (理想: 39)
Day 4: 32 points (理想: 36)
Day 6: 26 points (理想: 33)
Day 8: 18 points (理想: 30)
Day 10: 10 points (理想: 27)
Day 12: 5 points (理想: 24)
Day 14: 0 points (理想: 21)
```

## 🎯 スプリント計画のベストプラクティス

### DO ✅

1. **準備を怠らない**
   - POは受入基準を明確に
   - チームは前スプリントを振り返る
   - 技術的課題を事前調査

2. **全員参加**
   - 全チームメンバーが出席
   - 積極的に質問・意見を述べる
   - 合意形成を重視

3. **現実的な計画**
   - ベロシティに基づく
   - バッファを確保
   - 依存関係を考慮

4. **明確な目標**
   - スプリント目標が明確
   - ビジネス価値が理解される
   - 測定可能な基準

5. **タイムボックス厳守**
   - 時間内に完了
   - 議論が発散したら後回し
   - 決定を先延ばししない

### DON'T ❌

1. **準備不足で開始**
   - 受入基準が曖昧
   - ストーリーが未詳細化
   - 優先順位が不明確

2. **オーバーコミット**
   - ベロシティを無視
   - バッファなし
   - 楽観的すぎる見積もり

3. **技術的議論に終始**
   - 実装詳細の議論が長すぎる
   - ビジネス価値を忘れる
   - 完璧主義

4. **一部のメンバーのみが話す**
   - 開発者の声を無視
   - POが一方的に決定
   - 合意なしに進める

5. **曖昧な終わり方**
   - スプリント目標が不明確
   - コミットメントがない
   - 次のアクションが不明

## 📋 チェックリスト

### 会議前チェックリスト

**プロダクトオーナー:**
- [ ] バックログの優先順位付け完了
- [ ] 上位15-20ストーリーの受入基準明確化
- [ ] ビジネス価値の説明準備
- [ ] ステークホルダーの期待値確認

**開発チーム:**
- [ ] 前スプリントのベロシティ確認
- [ ] チーム稼働時間の確認
- [ ] 技術的課題・依存関係の洗い出し
- [ ] 必要なツール・環境の準備

**スクラムマスター:**
- [ ] 会議室/オンラインミーティング準備
- [ ] タイマー準備
- [ ] ホワイトボード/Miroなど準備
- [ ] 前回のアクションアイテム確認

### 会議後チェックリスト

- [ ] スプリント目標が文書化されている
- [ ] すべてのストーリーがマイルストーンに追加
- [ ] タスク分解が完了している
- [ ] 依存関係が明確になっている
- [ ] ブロッカーが特定され、対応計画がある
- [ ] チーム全員がコミットメントしている
- [ ] GitHub Projectが更新されている

## 🔧 便利なツールとテンプレート

### スプリント計画会議アジェンダテンプレート

```markdown
# Sprint 3 Planning Agenda

Date: 2025-09-28
Duration: 4 hours (10:00-14:00)
Location: Conference Room A / Zoom

## Attendees
- Product Owner: [Name]
- Scrum Master: [Name]
- Dev Team: [Names]

## Agenda

### Part 1: WHAT (10:00-12:00)

1. Previous Sprint Review (10:00-10:15)
   - Velocity: X points
   - Completed: Y stories
   - Lessons learned

2. Sprint Goal Setting (10:15-10:45)
   - PO proposes goal
   - Team discusses feasibility
   - Agreement on goal

3. Capacity Planning (10:45-11:00)
   - Team availability
   - Focus factor
   - Target velocity

4. Story Selection (11:00-12:00)
   - Review top stories
   - Q&A on acceptance criteria
   - Select stories for sprint

### Break (12:00-12:15)

### Part 2: HOW (12:15-14:00)

5. Task Breakdown (12:15-13:15)
   - Decompose each story
   - Create task issues

6. Technical Design (13:15-13:45)
   - Key technical decisions
   - Architecture considerations

7. Dependencies & Blockers (13:45-14:00)
   - Identify dependencies
   - Plan for blockers

## Decisions to Make
- [ ] Sprint goal
- [ ] Stories for sprint
- [ ] Task breakdown
- [ ] Key technical approaches

## Follow-up Actions
- [ ] Update GitHub Project
- [ ] Create sprint goal document
- [ ] Notify stakeholders
- [ ] Schedule Daily Scrums
```

### ベロシティトラッカースプレッドシート

```
Sprint | Planned | Completed | Velocity | Completion Rate
-------|---------|-----------|----------|----------------
1      | 34      | 30        | 30       | 88%
2      | 42      | 42        | 42       | 100%
3      | 42      | ?         | ?        | ?

Average Velocity: 36 points
Trend: Increasing
```

## 📚 参考リソース

### 内部ドキュメント
- [プロダクト・バックログ](../../PRODUCT_BACKLOG.md)
- [GitHub バックログ管理ガイド](./GITHUB_BACKLOG_MANAGEMENT.md)
- [定義of Done](./DEFINITION_OF_DONE.md)

### 外部リソース
- [Scrum Guide - Sprint Planning](https://scrumguides.org/scrum-guide.html#sprint-planning)
- [Planning Poker Best Practices](https://www.mountaingoatsoftware.com/agile/planning-poker)
- [User Story Splitting](https://www.humanizingwork.com/the-humanizing-work-guide-to-splitting-user-stories/)

---

**次のステップ:**
1. 最初のスプリント計画会議をスケジュール
2. プロダクトオーナーがバックログを準備
3. 開発チームが前提条件を確認
4. スクラムマスターが会議をファシリテート

質問があれば、スクラムマスターにお問い合わせください。