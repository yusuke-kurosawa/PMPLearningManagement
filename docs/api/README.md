# API Documentation

## 概要

PMP Learning Management System APIの包括的なドキュメントです。

## 📚 APIカテゴリ

### 認証API
- [認証エンドポイント](./authentication.md)
- [トークン管理](./token-management.md)
- [セッション管理](./session-management.md)

### 学習管理API
- [プログレスAPI](./progress-api.md)
- [コースAPI](./course-api.md)
- [テストAPI](./test-api.md)

### データ管理API
- [ユーザーデータAPI](./user-data-api.md)
- [レポートAPI](./report-api.md)
- [エクスポートAPI](./export-api.md)

## 🔧 クイックスタート

### APIキーの取得
```javascript
// Supabase Clientの初期化
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)
```

### 基本的なリクエスト
```javascript
// ユーザープログレスの取得
const { data, error } = await supabase
  .from('progress')
  .select('*')
  .eq('user_id', userId)
```

## 📊 レート制限

| エンドポイント | 制限 | ウィンドウ |
|----------|-----|----------|
| 認証 | 5回 | 1分 |
| データ取得 | 100回 | 1分 |
| データ更新 | 50回 | 1分 |

## 🔒 セキュリティ

- すべてのAPIリクエストはHTTPS経由
- JWTトークンによる認証
- Row Level Security (RLS) 実装

## 📖 関連ドキュメント

- [開発者ガイド](../developer-guide/README.md)
- [セキュリティポリシー](../../SECURITY.md)
- [アーキテクチャ概要](../architecture/README.md)