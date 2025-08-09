# システムINPUTドキュメント

このディレクトリには、PMPLearningManagementシステムへのインプットとなる各種ドキュメントを格納します。

## ディレクトリ構造

```
docs/input/
├── pmbok/          # PMBOK関連の参照ドキュメント
├── templates/      # データ入力用テンプレート
├── references/     # 外部参照資料
└── samples/        # サンプルデータ
```

## 各ディレクトリの用途

### pmbok/
PMBOK第6版・第7版に関する参照ドキュメントを格納
- プロセス定義
- ITTO詳細情報
- 知識エリア説明
- プロセス群の説明

### templates/
データ入力用のテンプレートファイルを格納
- プロセス情報入力テンプレート（Excel/CSV）
- 用語集入力テンプレート
- ITTO関係性定義テンプレート

### references/
外部参照資料を格納
- PMI公式ドキュメント
- PMP試験ガイド
- 業界標準資料

### samples/
サンプルデータファイルを格納
- サンプルプロセスデータ
- サンプル用語集
- テストデータ

## ファイル形式

以下のファイル形式をサポート：
- `.md` - Markdownドキュメント
- `.json` - 構造化データ
- `.csv` - 表形式データ
- `.xlsx` - Excelファイル（テンプレート用）
- `.pdf` - 参照ドキュメント（読み取り専用）

## 命名規則

ファイル名は以下の規則に従ってください：
- 日本語ファイル名OK（ただし英数字推奨）
- スペースの代わりにアンダースコア（_）を使用
- バージョン番号を含める場合は `_v1.0` の形式
- 日付を含める場合は `_20240105` の形式（YYYYMMDD）

例：
- `PMBOK6_processes_v1.0.json`
- `用語集テンプレート_20240105.xlsx`
- `process_itto_mapping.csv`

## データ入力ガイドライン

### JSONフォーマット例

```json
{
  "processId": "1.1",
  "processName": {
    "ja": "プロジェクト憲章の作成",
    "en": "Develop Project Charter"
  },
  "knowledgeArea": "integration",
  "processGroup": "initiating",
  "inputs": [
    {
      "ja": "ビジネス文書",
      "en": "Business Documents"
    }
  ],
  "tools": [
    {
      "ja": "専門家の判断",
      "en": "Expert Judgment"
    }
  ],
  "outputs": [
    {
      "ja": "プロジェクト憲章",
      "en": "Project Charter"
    }
  ]
}
```

### CSVフォーマット例

```csv
ProcessID,ProcessNameJA,ProcessNameEN,KnowledgeArea,ProcessGroup
1.1,プロジェクト憲章の作成,Develop Project Charter,integration,initiating
```

## 注意事項

1. **著作権**: PMI公式ドキュメントなど著作権のある資料は含めないでください
2. **機密情報**: 企業固有の情報や機密情報は含めないでください
3. **バージョン管理**: 重要なドキュメントは適切にバージョン管理してください
4. **文字コード**: すべてのテキストファイルはUTF-8エンコーディングを使用してください

## 更新履歴

- 2024-01-05: 初版作成