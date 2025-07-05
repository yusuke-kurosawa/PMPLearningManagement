import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, X, Info, ArrowRight } from 'lucide-react';

// PMBOK第6版のデータ構造
const pmbokData = {
  processGroups: [
    '立上げ', '計画', '実行', '監視・コントロール', '終結'
  ],
  knowledgeAreas: [
    '統合マネジメント',
    'スコープマネジメント',
    'スケジュールマネジメント',
    'コストマネジメント',
    '品質マネジメント',
    '資源マネジメント',
    'コミュニケーションマネジメント',
    'リスクマネジメント',
    '調達マネジメント',
    'ステークホルダーマネジメント'
  ],
  processes: {
    '統合マネジメント': {
      '立上げ': [{
        name: 'プロジェクト憲章の作成',
        inputs: ['ビジネス文書', '協定'],
        tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '会議'],
        outputs: ['プロジェクト憲章', '前提条件ログ']
      }],
      '計画': [{
        name: 'プロジェクトマネジメント計画書の作成',
        inputs: ['プロジェクト憲章', '他のプロセスからのアウトプット', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '会議'],
        outputs: ['プロジェクトマネジメント計画書']
      }],
      '実行': [{
        name: 'プロジェクト作業の指揮・マネジメント',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '承認済み変更要求', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'プロジェクトマネジメント情報システム', '会議'],
        outputs: ['成果物', '作業パフォーマンス・データ', '課題ログ', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
      }, {
        name: 'プロジェクト知識のマネジメント',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '成果物', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', '知識マネジメント', '情報マネジメント', '対人関係とチームに関するスキル'],
        outputs: ['教訓登録簿', 'プロジェクトマネジメント計画書更新版', '組織のプロセス資産更新版']
      }],
      '監視・コントロール': [{
        name: 'プロジェクト作業の監視・コントロール',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス情報', '協定', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '意思決定', '会議'],
        outputs: ['作業パフォーマンス報告書', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }, {
        name: '統合変更管理',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス報告書', '変更要求', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '意思決定', '会議'],
        outputs: ['承認済み変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '終結': [{
        name: 'プロジェクトやフェーズの終結',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '検収済み成果物', 'ビジネス文書', '協定', '調達文書', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '会議'],
        outputs: ['プロジェクト文書更新版', '最終成果物', '最終報告書', '組織のプロセス資産更新版']
      }]
    },
    'スコープマネジメント': {
      '計画': [{
        name: 'スコープマネジメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '会議'],
        outputs: ['スコープマネジメント計画書', '要求事項マネジメント計画書']
      }, {
        name: '要求事項の収集',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', 'ビジネス文書', '協定', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', 'データ分析', '意思決定', 'データ表現', '対人関係とチームに関するスキル', 'コンテキスト図', 'プロトタイプ'],
        outputs: ['要求事項文書', '要求事項トレーサビリティ・マトリックス']
      }, {
        name: 'スコープの定義',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '意思決定', '対人関係とチームに関するスキル', 'プロダクト分析'],
        outputs: ['プロジェクト・スコープ記述書', 'プロジェクト文書更新版']
      }, {
        name: 'WBSの作成',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', '分解'],
        outputs: ['スコープ・ベースライン', 'プロジェクト文書更新版']
      }],
      '監視・コントロール': [{
        name: 'スコープの妥当性確認',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '検証済み成果物', '作業パフォーマンス・データ'],
        tools: ['検査', '意思決定'],
        outputs: ['検収済み成果物', '作業パフォーマンス情報', '変更要求', 'プロジェクト文書更新版']
      }, {
        name: 'スコープのコントロール',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織のプロセス資産'],
        tools: ['データ分析'],
        outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }]
    },
    'スケジュールマネジメント': {
      '計画': [{
        name: 'スケジュールマネジメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '会議'],
        outputs: ['スケジュールマネジメント計画書']
      }, {
        name: 'アクティビティの定義',
        inputs: ['プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', '分解', 'ローリング・ウェーブ計画法', '会議'],
        outputs: ['アクティビティ・リスト', 'アクティビティ属性', 'マイルストーン・リスト', '変更要求', 'プロジェクトマネジメント計画書更新版']
      }, {
        name: 'アクティビティの順序設定',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['プレシデンス・ダイアグラム法', '依存関係の決定と統合', 'リードとラグ', 'プロジェクトマネジメント情報システム'],
        outputs: ['プロジェクト・スケジュール・ネットワーク図', 'プロジェクト文書更新版']
      }, {
        name: 'アクティビティ所要期間の見積り',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', '類推見積り', 'パラメトリック見積り', '三点見積り', 'ボトムアップ見積り', 'データ分析', '意思決定', '会議'],
        outputs: ['所要期間見積り', '見積りの根拠', 'プロジェクト文書更新版']
      }, {
        name: 'スケジュールの作成',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '協定', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['スケジュール・ネットワーク分析', 'クリティカル・パス法', '資源最適化', 'データ分析', 'リードとラグ', 'スケジュール短縮', 'プロジェクトマネジメント情報システム', 'アジャイル・リリース計画'],
        outputs: ['スケジュール・ベースライン', 'プロジェクト・スケジュール', 'スケジュール・データ', 'プロジェクト・カレンダー', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '監視・コントロール': [{
        name: 'スケジュールのコントロール',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織のプロセス資産'],
        tools: ['データ分析', 'クリティカル・パス法', 'プロジェクトマネジメント情報システム', '資源最適化', 'リードとラグ', 'スケジュール短縮'],
        outputs: ['作業パフォーマンス情報', 'スケジュール予測', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }]
    },
    'コストマネジメント': {
      '計画': [{
        name: 'コストマネジメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '会議'],
        outputs: ['コストマネジメント計画書']
      }, {
        name: 'コストの見積り',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', '類推見積り', 'パラメトリック見積り', 'ボトムアップ見積り', '三点見積り', 'データ分析', 'プロジェクトマネジメント情報システム', '意思決定'],
        outputs: ['コスト見積り', '見積りの根拠', 'プロジェクト文書更新版']
      }, {
        name: '予算の設定',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', 'ビジネス文書', '協定', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'コスト集約', 'データ分析', '過去の情報レビュー', '資金限度額の調整', '資金調達'],
        outputs: ['コスト・ベースライン', 'プロジェクト資金要求事項', 'プロジェクト文書更新版']
      }],
      '監視・コントロール': [{
        name: 'コストのコントロール',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', 'プロジェクト資金要求事項', '作業パフォーマンス・データ', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '完成時総コスト予測', 'プロジェクトマネジメント情報システム'],
        outputs: ['作業パフォーマンス情報', 'コスト予測', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }]
    },
    '品質マネジメント': {
      '計画': [{
        name: '品質マネジメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', 'データ分析', '意思決定', 'データ表現', 'テストと検査の計画', '会議'],
        outputs: ['品質マネジメント計画書', '品質測定指標', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '実行': [{
        name: '品質のマネジメント',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織のプロセス資産'],
        tools: ['データ収集', 'データ分析', '意思決定', 'データ表現', '監査', '問題解決', '品質改善手法'],
        outputs: ['品質報告書', 'テストと評価文書', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '監視・コントロール': [{
        name: '品質のコントロール',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '承認済み変更要求', '成果物', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['データ収集', 'データ分析', '検査', 'テスト/製品評価', 'データ表現', '会議'],
        outputs: ['品質コントロール測定結果', '検証済み成果物', '作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }]
    },
    '資源マネジメント': {
      '計画': [{
        name: '資源マネジメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ表現', '組織論', '会議'],
        outputs: ['資源マネジメント計画書', 'チーム憲章', 'プロジェクト文書更新版']
      }, {
        name: 'アクティビティ資源の見積り',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', '類推見積り', 'パラメトリック見積り', 'ボトムアップ見積り', 'データ分析', 'プロジェクトマネジメント情報システム', '会議'],
        outputs: ['資源要求事項', '見積りの根拠', '資源ブレークダウン・ストラクチャー', 'プロジェクト文書更新版']
      }],
      '実行': [{
        name: '資源の獲得',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['意思決定', '対人関係とチームに関するスキル', '事前割当て', '仮想チーム'],
        outputs: ['物的資源の割当て', 'プロジェクト・チーム任命', '資源カレンダー', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織体の環境要因更新版', '組織のプロセス資産更新版']
      }, {
        name: 'チームの育成',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['コロケーション', '仮想チーム', 'コミュニケーション技術', '対人関係とチームに関するスキル', '表彰と報酬', 'トレーニング', '個人とチームのアセスメント', '会議'],
        outputs: ['チーム・パフォーマンス評価', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織体の環境要因更新版', '組織のプロセス資産更新版']
      }, {
        name: 'チームのマネジメント',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス報告書', 'チーム・パフォーマンス評価', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['対人関係とチームに関するスキル', 'プロジェクトマネジメント情報システム'],
        outputs: ['変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織体の環境要因更新版']
      }],
      '監視・コントロール': [{
        name: '資源のコントロール',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '協定', '組織のプロセス資産'],
        tools: ['データ分析', '問題解決', '対人関係とチームに関するスキル', 'プロジェクトマネジメント情報システム'],
        outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }]
    },
    'コミュニケーションマネジメント': {
      '計画': [{
        name: 'コミュニケーションマネジメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'コミュニケーション要求事項分析', 'コミュニケーション技術', 'コミュニケーション・モデル', 'コミュニケーション方法', '対人関係とチームに関するスキル', 'データ表現', '会議'],
        outputs: ['コミュニケーションマネジメント計画書', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '実行': [{
        name: 'コミュニケーションのマネジメント',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス報告書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['コミュニケーション技術', 'コミュニケーション方法', 'コミュニケーション・スキル', 'プロジェクトマネジメント情報システム', 'プロジェクト報告', '対人関係とチームに関するスキル', '会議'],
        outputs: ['プロジェクト・コミュニケーション', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
      }],
      '監視・コントロール': [{
        name: 'コミュニケーションの監視',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'プロジェクトマネジメント情報システム', 'データ表現', '対人関係とチームに関するスキル', '会議'],
        outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }]
    },
    'リスクマネジメント': {
      '計画': [{
        name: 'リスクマネジメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ分析', '会議'],
        outputs: ['リスクマネジメント計画書']
      }, {
        name: 'リスクの特定',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '協定', '調達文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', 'データ分析', '対人関係とチームに関するスキル', 'プロンプト・リスト', '会議'],
        outputs: ['リスク登録簿', 'リスク報告書', 'プロジェクト文書更新版']
      }, {
        name: '定性的リスク分析',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', 'データ分析', '対人関係とチームに関するスキル', 'リスク・カテゴリー', 'データ表現', '会議'],
        outputs: ['プロジェクト文書更新版']
      }, {
        name: '定量的リスク分析',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '不確実性の表現', 'データ分析'],
        outputs: ['プロジェクト文書更新版']
      }, {
        name: 'リスク対応の計画',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '脅威への戦略', '好機への戦略', 'コンティンジェンシー対応戦略', '全体的なプロジェクト・リスクへの戦略', 'データ分析', '意思決定'],
        outputs: ['変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '実行': [{
        name: 'リスク対応の実行',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織のプロセス資産'],
        tools: ['専門家の判断', '対人関係とチームに関するスキル', 'プロジェクトマネジメント情報システム'],
        outputs: ['変更要求', 'プロジェクト文書更新版']
      }],
      '監視・コントロール': [{
        name: 'リスクの監視',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '作業パフォーマンス報告書'],
        tools: ['データ分析', '監査', '会議'],
        outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
      }]
    },
    '調達マネジメント': {
      '計画': [{
        name: '調達マネジメントの計画',
        inputs: ['プロジェクト憲章', 'ビジネス文書', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', 'データ分析', '調達元選定分析', '会議'],
        outputs: ['調達マネジメント計画書', '調達戦略', '入札文書', '調達作業範囲記述書', '調達元選定基準', '自製外製決定', '独立コスト見積り', '変更要求', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
      }],
      '実行': [{
        name: '調達の実行',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '調達文書', '納入者提案書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', '広告', '入札者会議', 'データ分析', '対人関係とチームに関するスキル'],
        outputs: ['選定された納入者', '協定', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
      }],
      '監視・コントロール': [{
        name: '調達のコントロール',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '協定', '調達文書', '承認済み変更要求', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'クレーム処理', 'データ分析', '検査', '監査'],
        outputs: ['完了した調達', '作業パフォーマンス情報', '調達文書更新版', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
      }]
    },
    'ステークホルダーマネジメント': {
      '立上げ': [{
        name: 'ステークホルダーの特定',
        inputs: ['プロジェクト憲章', 'ビジネス文書', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '協定', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', 'データ分析', 'データ表現', '会議'],
        outputs: ['ステークホルダー登録簿', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '計画': [{
        name: 'ステークホルダー・エンゲージメントの計画',
        inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '協定', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', 'データ分析', '意思決定', 'データ表現', '会議'],
        outputs: ['ステークホルダー・エンゲージメント計画書']
      }],
      '実行': [{
        name: 'ステークホルダー・エンゲージメントのマネジメント',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'コミュニケーション・スキル', '対人関係とチームに関するスキル', '基本ルール', '会議'],
        outputs: ['変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }],
      '監視・コントロール': [{
        name: 'ステークホルダー・エンゲージメントの監視',
        inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['データ分析', '意思決定', 'データ表現', 'コミュニケーション・スキル', '対人関係とチームに関するスキル', '会議'],
        outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
      }]
    }
  }
};

export default function PMBOKMatrix() {
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);

  // 検索フィルタリング
  const filteredProcesses = useMemo(() => {
    if (!searchTerm) return pmbokData.processes;
    
    const filtered = {};
    const term = searchTerm.toLowerCase();
    
    Object.entries(pmbokData.processes).forEach(([area, groups]) => {
      const filteredGroups = {};
      Object.entries(groups).forEach(([group, processes]) => {
        const filteredProcs = processes.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.inputs.some(i => i.toLowerCase().includes(term)) ||
          p.tools.some(t => t.toLowerCase().includes(term)) ||
          p.outputs.some(o => o.toLowerCase().includes(term))
        );
        if (filteredProcs.length > 0) {
          filteredGroups[group] = filteredProcs;
        }
      });
      if (Object.keys(filteredGroups).length > 0) {
        filtered[area] = filteredGroups;
      }
    });
    
    return filtered;
  }, [searchTerm]);

  // エリアの展開/折りたたみ
  const toggleArea = (area) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(area)) {
      newExpanded.delete(area);
    } else {
      newExpanded.add(area);
    }
    setExpandedAreas(newExpanded);
  };

  // プロセスの選択
  const selectProcess = (process, area, group) => {
    setSelectedProcess({ ...process, area, group });
  };

  // 関連プロセスの検索
  const findRelatedProcesses = (item, type) => {
    const related = [];
    
    Object.entries(pmbokData.processes).forEach(([area, groups]) => {
      Object.entries(groups).forEach(([group, processes]) => {
        processes.forEach(process => {
          if (type === 'output' && process.inputs.includes(item)) {
            related.push({ ...process, area, group, relation: 'input' });
          } else if (type === 'input' && process.outputs.includes(item)) {
            related.push({ ...process, area, group, relation: 'output' });
          }
        });
      });
    });
    
    return related;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* ヘッダーと検索 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          PMBOK第6版 プロセス群・知識エリア・ITTO統合マトリクス
        </h1>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="プロセス、インプット、ツール、アウトプットを検索..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* メインマトリクス */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-4 text-left font-semibold">知識エリア</th>
                  {pmbokData.processGroups.map(group => (
                    <th key={group} className="p-4 text-center font-semibold min-w-[150px]">
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pmbokData.knowledgeAreas.map(area => (
                  <React.Fragment key={area}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium bg-gray-100">
                        <button
                          onClick={() => toggleArea(area)}
                          className="flex items-center gap-2 text-left w-full hover:text-blue-600"
                        >
                          {expandedAreas.has(area) ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                          {area}
                        </button>
                      </td>
                      {pmbokData.processGroups.map(group => {
                        const processes = filteredProcesses[area]?.[group] || [];
                        return (
                          <td 
                            key={group} 
                            className="p-2 text-center border-l"
                            onMouseEnter={() => setHoveredCell(`${area}-${group}`)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {processes.length > 0 && (
                              <div className="flex flex-col gap-1">
                                {processes.map((process, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => selectProcess(process, area, group)}
                                    className={`
                                      px-3 py-2 text-xs rounded-md transition-all
                                      ${selectedProcess?.name === process.name 
                                        ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}
                                    `}
                                  >
                                    {process.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {expandedAreas.has(area) && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="bg-gray-50 p-4">
                            <table className="w-full">
                              <tbody>
                                {pmbokData.processGroups.map(group => {
                                  const processes = filteredProcesses[area]?.[group];
                                  if (!processes || processes.length === 0) return null;
                                  
                                  return processes.map((process, idx) => (
                                    <React.Fragment key={`${group}-${idx}`}>
                                      <tr className="border-t">
                                        <td className="py-2 px-4 font-medium text-sm bg-blue-50" colSpan={2}>
                                          {group} - {process.name}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 px-8 text-sm w-1/3 align-top">
                                          <div className="font-medium text-gray-700 mb-1">インプット:</div>
                                          <ul className="list-disc list-inside text-gray-600">
                                            {process.inputs.map((input, i) => (
                                              <li key={i} className="hover:text-blue-600 cursor-pointer">
                                                {input}
                                              </li>
                                            ))}
                                          </ul>
                                        </td>
                                        <td className="py-2 px-8 text-sm w-1/3 align-top">
                                          <div className="font-medium text-gray-700 mb-1">ツール・技法:</div>
                                          <ul className="list-disc list-inside text-gray-600">
                                            {process.tools.map((tool, i) => (
                                              <li key={i}>{tool}</li>
                                            ))}
                                          </ul>
                                        </td>
                                        <td className="py-2 px-8 text-sm w-1/3 align-top">
                                          <div className="font-medium text-gray-700 mb-1">アウトプット:</div>
                                          <ul className="list-disc list-inside text-gray-600">
                                            {process.outputs.map((output, i) => (
                                              <li key={i} className="hover:text-blue-600 cursor-pointer">
                                                {output}
                                              </li>
                                            ))}
                                          </ul>
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ));
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 詳細パネル */}
        {selectedProcess && (
          <div className="w-96 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">プロセス詳細</h2>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">{selectedProcess.area}</div>
              <div className="text-sm text-gray-600 mb-2">{selectedProcess.group}プロセス群</div>
              <h3 className="text-lg font-semibold text-gray-800">{selectedProcess.name}</h3>
            </div>

            <div className="space-y-4">
              {/* インプット */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  インプット
                </h4>
                <ul className="space-y-1">
                  {selectedProcess.inputs.map((input, idx) => {
                    const related = findRelatedProcesses(input, 'input');
                    return (
                      <li key={idx} className="text-sm text-gray-600 pl-4">
                        • {input}
                        {related.length > 0 && (
                          <div className="ml-4 mt-1 text-xs text-blue-600">
                            ← {related.map(r => `${r.name}`).join(', ')}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* ツール・技法 */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  ツール・技法
                </h4>
                <ul className="space-y-1">
                  {selectedProcess.tools.map((tool, idx) => (
                    <li key={idx} className="text-sm text-gray-600 pl-4">
                      • {tool}
                    </li>
                  ))}
                </ul>
              </div>

              {/* アウトプット */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  アウトプット
                </h4>
                <ul className="space-y-1">
                  {selectedProcess.outputs.map((output, idx) => {
                    const related = findRelatedProcesses(output, 'output');
                    return (
                      <li key={idx} className="text-sm text-gray-600 pl-4">
                        • {output}
                        {related.length > 0 && (
                          <div className="ml-4 mt-1 text-xs text-blue-600">
                            → {related.map(r => `${r.name}`).join(', ')}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* 関連性の説明 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">プロセスの関連性</h4>
              <p className="text-sm text-gray-600">
                このプロセスは{selectedProcess.area}の一部として、
                {selectedProcess.group}プロセス群で実行されます。
                インプットとアウトプットを通じて他のプロセスと連携し、
                プロジェクトの成功に貢献します。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 凡例 */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-2">使い方</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 知識エリア名をクリックして、ITTOの詳細を展開/折りたたみできます</li>
          <li>• プロセス名をクリックして、詳細と関連プロセスを確認できます</li>
          <li>• 検索ボックスで特定のプロセスやITTO要素を検索できます</li>
          <li>• 詳細パネルで、選択したプロセスの入出力関係が確認できます</li>
        </ul>
      </div>
    </div>
  );
}
