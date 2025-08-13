# ESLint Standards & Code Quality Rules

このファイルはPMPLearningManagementプロジェクトのESLint標準とコード品質ルールを定義します。

## 🎯 コード品質目標

### エラー目標

- **致命的エラー**: 0個（必須）
- **警告**: 50個以下（推奨）
- **総問題数**: 100個以下（目標）

### 現在の状況

- **現在のエラー**: 26個 → 0個（目標）
- **現在の警告**: 619個 → 50個以下（目標）
- **総問題数**: 645個 → 100個以下（目標）

## 🔧 優先修正ルール

### 1. 致命的エラー（即修正必須）

```javascript
// ❌ 重複プロパティ
<div 
  onTouchEnd={handler1}
  onTouchEnd={handler2}  // エラー
>

// ✅ 統合処理
<div 
  onTouchEnd={(e) => {
    handler1(e);
    handler2(e);
  }}
>
```

```javascript
// ❌ 未知のプロパティ
<style jsx global>  // エラー

// ✅ 正しい記法
<style dangerouslySetInnerHTML={{
  __html: `/* CSS */`
}}>
```

```javascript
// ❌ エスケープされていない文字
You're all caught up!  // エラー

// ✅ エスケープ済み
You&apos;re all caught up!
```

### 2. case block エラー

```javascript
// ❌ 変数宣言がcase内にある
switch (type) {
  case 'test':
    const result = calculate();  // エラー
    break;
}

// ✅ ブロックで囲む
switch (type) {
  case 'test': {
    const result = calculate();
    break;
  }
}
```

## 📝 未使用変数ルール

### インポート関連

```javascript
// ❌ 未使用インポート
import { Calendar, Edit, Settings } from 'lucide-react'
// Calendar, Edit, Settings を使用していない

// ✅ 使用するもののみインポート
import { Clock, User } from 'lucide-react'

// ✅ 将来使用予定の場合
import { Calendar } from 'lucide-react' // TODO: Use for scheduling
```

### 変数・関数

```javascript
// ❌ 未使用変数
const [data, setData] = useState()
// data を使用していない

// ✅ アンダースコアプレフィックス
const [_data, setData] = useState()

// ✅ 実際に使用
const [data, setData] = useState()
console.log(data)
```

### 関数パラメータ

```javascript
// ❌ 未使用パラメータ
const handleClick = (event) => {
  // event を使用していない
}

// ✅ アンダースコアプレフィックス
const handleClick = (_event) => {
  // 明示的に未使用
}
```

## 🎨 TypeScript関連ルール

### any型の制限

```javascript
// ❌ any型の使用
const data: any = response.data

// ✅ 適切な型定義
interface ResponseData {
  id: string;
  name: string;
}
const data: ResponseData = response.data

// ✅ 不明な場合はunknown
const data: unknown = response.data
```

### コンソール出力制限

```javascript
// ❌ 本番コードでのconsole
console.log('Debug info')

// ✅ 開発環境のみ
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info')
}

// ✅ 適切なロガー使用
logger.debug('Debug info')
```

## 🚀 修正戦略

### Phase 1: 致命的エラー修正

1. 重複プロパティ修正
2. React関連エラー修正
3. TypeScript構文エラー修正

### Phase 2: 警告削減

1. 未使用変数処理（アンダースコア化）
2. 未使用インポート削除
3. any型を適切な型に変更

### Phase 3: 最適化

1. コード品質向上
2. パフォーマンス最適化
3. 保守性改善

## 🔄 継続的改善プロセス

### CI/CDでの品質チェック

```yaml
# ESLint実行標準
- name: ESLint Check
  run: |
    npm run lint -- --max-warnings 50
    npm run lint:fix
```

### 定期的なメンテナンス

- **日次**: 新規エラー防止
- **週次**: 警告数削減
- **月次**: ルール見直し

### 品質ゲート

1. **新規エラー**: 0個（必須）
2. **エラー増加**: 禁止
3. **警告増加**: 週次で削減

## 🎯 目標スケジュール

### 短期目標（1週間）

- 致命的エラー: 26個 → 0個
- 警告: 619個 → 400個以下

### 中期目標（1ヶ月）

- 警告: 400個 → 100個以下
- コード品質改善

### 長期目標（3ヶ月）

- 警告: 100個 → 50個以下
- ゼロ警告運用開始

---
作成者: Claude Code Agent Orchestration System
作成日: 2025-08-13
最終更新: 2025-08-13