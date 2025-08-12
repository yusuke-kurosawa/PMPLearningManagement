# ESモジュール エラー修正提案

## 問題
現在、品質保証関連のスクリプトがESモジュール構文を使用していますが、package.jsonに`"type": "module"`が設定されていないため実行できません。

## 修正方法（2つの選択肢）

### 選択肢1: package.jsonを修正（推奨）

```json
// package.jsonに追加
{
  "type": "module",
  // 既存の設定...
}
```

**メリット**:
- スクリプトの変更不要
- 最新のES6+構文を維持
- 将来的な拡張性

**デメリット**:
- 既存のCommonJSコードへの影響を確認必要

### 選択肢2: スクリプトをCommonJSに変換

各スクリプトで以下の変更を実施:

```javascript
// 変更前（ESモジュール）
import fs from 'fs';
import path from 'path';

export default function validate() {
  // ...
}

// 変更後（CommonJS）
const fs = require('fs');
const path = require('path');

module.exports = function validate() {
  // ...
}
```

**メリット**:
- 既存システムへの影響なし
- 即座に動作可能

**デメリット**:
- 全37スクリプトの変更が必要
- ES6+の利点を失う

## 推奨アクション

1. **まずpackage.jsonに`"type": "module"`を追加してテスト**
2. 問題がある場合は、影響を受けるファイルを`.mjs`拡張子にリネーム
3. または、CommonJSを必要とするファイルを`.cjs`拡張子に変更

## 実行コマンド

### package.json修正後のテスト
```bash
# ESモジュール対応を追加
echo '{"type": "module"}' | jq -s '.[0] + .[1]' package.json - > package.tmp.json && mv package.tmp.json package.json

# テスト実行
npm run quality:pmbok
npm run quality:content
npm run quality:accessibility
```

### 問題が発生した場合のロールバック
```bash
git checkout package.json
```

## 影響を受けるファイル

1. scripts/validate-pmbok-content.js
2. scripts/check-content-quality.js
3. scripts/accessibility-checker.js
4. scripts/japanese-quality-checker.js
5. scripts/analyze-learning-effectiveness.js
6. scripts/generate-quality-dashboard.js
7. scripts/security-audit.js
8. scripts/code-security-scanner.js
9. scripts/optimize-dependencies.js
10. scripts/generate-security-dashboard.js
（他27ファイル）

## 次のステップ

1. 修正方法を選択
2. テスト環境で検証
3. 全スクリプトの動作確認
4. CIパイプラインでの動作確認
5. 本番環境へのデプロイ