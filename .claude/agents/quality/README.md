# 🛡️ Quality エージェントカテゴリ

> **重要**: このディレクトリは品質保証とセキュリティに特化したClaude Codeエージェントを管理します。

## 📋 概要

Qualityカテゴリは、テスト戦略、テスト自動化、セキュリティ監査を担当する品質保証専門エージェント群です。高品質で安全なソフトウェアの実現を支援します。

## 🤖 配置エージェント

### qa-expert.md
**品質保証専門エージェント**

#### 専門領域
- テスト戦略策定
- 品質メトリクス管理
- テストケース設計
- 欠陥管理
- 品質レポート作成

#### テスト技術
- **テスト手法**: 単体テスト、統合テスト、E2Eテスト
- **品質基準**: コードカバレッジ、欠陥密度、MTBF
- **テスト設計**: 境界値分析、同値分割、状態遷移
- **リスクベーステスト**: リスク評価、優先順位付け
- **パフォーマンステスト**: 負荷テスト、ストレステスト

#### 主要タスク
```bash
# テスト戦略策定
@agent-qa-expert テスト戦略を策定してください

# 品質分析
@agent-qa-expert コード品質を分析してレポートを作成してください

# テストケース設計
@agent-qa-expert 包括的なテストケースを設計してください

# リグレッションテスト
@agent-qa-expert リグレッションテストを実施してください
```

### test-automator.md
**テスト自動化専門エージェント**

#### 専門領域
- テスト自動化フレームワーク構築
- CI/CDテスト統合
- E2Eテスト実装
- テストデータ管理
- テスト実行最適化

#### 技術スタック
- **単体テスト**: Jest, Vitest, Mocha
- **E2Eテスト**: Playwright, Cypress, Selenium
- **API テスト**: Postman, REST Assured
- **パフォーマンステスト**: K6, JMeter
- **モバイルテスト**: Appium, Detox

#### 主要タスク
```bash
# テスト自動化実装
@agent-test-automator E2Eテストを自動化してください

# CI/CD統合
@agent-test-automator GitHub Actionsにテストを統合してください

# テストカバレッジ向上
@agent-test-automator テストカバレッジを80%以上に向上させてください

# パフォーマンステスト
@agent-test-automator パフォーマンステストを実装してください
```

#### テストコード例
```typescript
// E2Eテスト例 (Playwright)
import { test, expect } from '@playwright/test';

test('ユーザーログインフロー', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('ダッシュボード');
});
```

### security-auditor.md
**セキュリティ監査専門エージェント**

#### 専門領域
- セキュリティ脆弱性診断
- ペネトレーションテスト
- コードセキュリティレビュー
- コンプライアンス監査
- セキュリティポリシー策定

#### セキュリティ領域
- **OWASP Top 10**: XSS, SQLi, CSRF対策
- **認証・認可**: JWT, OAuth 2.0, MFA
- **データ保護**: 暗号化、ハッシュ化、マスキング
- **ネットワークセキュリティ**: HTTPS, CSP, CORS
- **依存関係管理**: 脆弱性スキャン、パッチ管理

#### 主要タスク
```bash
# セキュリティ監査
@agent-security-auditor セキュリティ監査を実施してください

# 脆弱性診断
@agent-security-auditor 脆弱性スキャンを実行してください

# ペネトレーションテスト
@agent-security-auditor ペネトレーションテストを実施してください

# コンプライアンスチェック
@agent-security-auditor GDPR/PCI-DSS準拠をチェックしてください
```

#### セキュリティチェック例
```yaml
# セキュリティチェックリスト
security_checks:
  - input_validation: ✓
  - sql_injection_prevention: ✓
  - xss_protection: ✓
  - csrf_protection: ✓
  - secure_headers: ✓
  - encryption_at_rest: ✓
  - encryption_in_transit: ✓
  - access_control: ✓
  - audit_logging: ✓
  - dependency_scanning: ✓
```

## 🎯 使用シナリオ

### 完全品質保証フロー
```bash
# 1. テスト戦略策定
@agent-qa-expert プロジェクトのテスト戦略を策定してください

# 2. テスト自動化実装
@agent-test-automator テストフレームワークを構築してください

# 3. セキュリティ監査
@agent-security-auditor セキュリティ監査を実施してください

# 4. 継続的テスト
@agent-test-automator CI/CDパイプラインにテストを統合してください
```

### リリース前検証
```bash
# 1. 回帰テスト
@agent-test-automator 全回帰テストを実行してください

# 2. パフォーマンステスト
@agent-qa-expert パフォーマンステストを実施してください

# 3. セキュリティ最終チェック
@agent-security-auditor 最終セキュリティチェックを実施してください

# 4. 品質承認
@agent-qa-expert リリース品質を承認してください
```

## 📊 評価メトリクス

### 品質指標
| メトリクス | 目標値 | 現在値 |
|-----------|--------|--------|
| コードカバレッジ | >80% | 78% |
| 欠陥密度 | <0.5/KLOC | 0.45/KLOC |
| テスト自動化率 | >90% | 88% |
| セキュリティスコア | A | B+ |

### テスト実行メトリクス
- **テスト実行時間**: 平均15分
- **テスト成功率**: 98.5%
- **欠陥検出率**: 85%
- **False Positive率**: <5%

## 🔧 品質管理設定

### テスト設定
```json
{
  "testing": {
    "unit_test_framework": "Vitest",
    "e2e_framework": "Playwright",
    "coverage_threshold": 80,
    "parallel_execution": true,
    "test_environments": ["chrome", "firefox", "safari"]
  }
}
```

### セキュリティ設定
```yaml
security:
  scanning_tools:
    - SAST: SonarQube
    - DAST: OWASP ZAP
    - Dependencies: Snyk
  compliance:
    - GDPR: enabled
    - PCI-DSS: enabled
    - SOC2: in_progress
```

## 🔗 他カテゴリとの連携

### Development連携
```bash
# 開発後のテスト
@agent-fullstack-developer 実装完了
→ @agent-qa-expert テスト実施
```

### Infrastructure連携
```bash
# デプロイ前検証
@agent-test-automator テスト完了
→ @agent-devops-engineer デプロイ承認
```

### Management連携
```bash
# 品質レポート
@agent-qa-expert 品質レポート作成
→ @agent-project-manager ステークホルダー報告
```

## 🎮 ベストプラクティス

### ✅ 推奨事項

1. **シフトレフトテスト**
   - 早期テスト実施
   - 開発段階での品質確保
   - 継続的テスト

2. **テスト自動化**
   - 回帰テストの自動化
   - CI/CD統合
   - テストデータ管理

3. **セキュリティファースト**
   - セキュアコーディング
   - 定期的な監査
   - 脆弱性の早期発見

### ❌ 避けるべきこと

1. **テストの省略**
   - 手動テストのみ依存
   - カバレッジ不足
   - セキュリティテスト無視

2. **品質の妥協**
   - 既知の欠陥放置
   - テスト結果無視
   - セキュリティ警告無視

## 📈 継続的改善

### 月次目標
- テストカバレッジ5%向上
- 欠陥密度10%削減
- テスト実行時間20%短縮
- セキュリティスコア向上

### 品質成熟度向上
- Level 1: 基本テスト実施
- Level 2: テスト自動化導入
- Level 3: CI/CD統合完了
- Level 4: AI駆動テスト
- Level 5: 完全自動品質保証

---

**最終更新**: 2025-08-15  
**カテゴリ責任者**: @agent-qa-expert  
**対象プロジェクト**: PMPLearningManagement
