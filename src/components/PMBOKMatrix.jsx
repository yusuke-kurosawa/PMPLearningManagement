import React, { useState, useMemo, useCallback, memo } from 'react';
import { ChevronDown, ChevronRight, Search, X, Loader2, Info, CheckCircle2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { glossaryTerms } from '../data/pmpGlossary';
import GlossaryDialog from './GlossaryDialog';
import LearningModal from './LearningModal';
import { useProgress } from '../services/progressService';
import { generateProcessId } from '../utils/processUtils';

const PMBOKMatrix = memo(() => {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const [loading, setLoading] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState(null);
  const [learningModalOpen, setLearningModalOpen] = useState(false);
  const [selectedLearningProcess, setSelectedLearningProcess] = useState(null);

  const processGroups = [
    '立上げ',
    '計画',
    '実行',
    '監視・コントロール',
    '終結'
  ];

  // モバイル用の短縮名
  const processGroupsShort = {
    '立上げ': '立上げ',
    '計画': '計画',
    '実行': '実行',
    '監視・コントロール': '監視',
    '終結': '終結'
  };

  // 用語集の用語マッピングを作成
  const termMapping = useMemo(() => {
    const mapping = {};
    glossaryTerms.forEach(term => {
      // 日本語名でマッピング
      if (term.japanese) {
        mapping[term.japanese] = term;
      }
      // 英語名でもマッピング
      mapping[term.term] = term;
    });
    return mapping;
  }, []);

  // テキスト内の用語をリンクに変換する関数
  const renderTextWithLinks = useCallback((text) => {
    // 用語集の用語を長い順にソート（より具体的な用語を先にマッチさせるため）
    const sortedTerms = Object.keys(termMapping).sort((a, b) => b.length - a.length);
    
    let result = [];
    let remainingText = text;
    let lastIndex = 0;
    
    // 各用語をチェック
    for (const term of sortedTerms) {
      const index = remainingText.indexOf(term);
      if (index !== -1) {
        // マッチした場合
        if (index > 0) {
          result.push(remainingText.substring(0, index));
        }
        
        const termData = termMapping[term];
        result.push(
          <button
            key={`${term}-${lastIndex}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGlossaryTerm(termData);
            }}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 underline font-medium group"
          >
            {term}
            <Info className="w-3 h-3 ml-0.5 opacity-60 group-hover:opacity-100" />
          </button>
        );
        
        remainingText = remainingText.substring(index + term.length);
        lastIndex += index + term.length;
      }
    }
    
    // 残りのテキストを追加
    if (remainingText) {
      result.push(remainingText);
    }
    
    return result.length > 0 ? result : text;
  }, [termMapping]);

  const knowledgeAreas = [
    { id: 'integration', name: 'プロジェクト統合マネジメント', processes: 7 },
    { id: 'scope', name: 'プロジェクト・スコープ・マネジメント', processes: 6 },
    { id: 'schedule', name: 'プロジェクト・スケジュール・マネジメント', processes: 6 },
    { id: 'cost', name: 'プロジェクト・コスト・マネジメント', processes: 4 },
    { id: 'quality', name: 'プロジェクト品質マネジメント', processes: 3 },
    { id: 'resource', name: 'プロジェクト資源マネジメント', processes: 6 },
    { id: 'communications', name: 'プロジェクト・コミュニケーション・マネジメント', processes: 3 },
    { id: 'risk', name: 'プロジェクト・リスク・マネジメント', processes: 7 },
    { id: 'procurement', name: 'プロジェクト調達マネジメント', processes: 3 },
    { id: 'stakeholder', name: 'プロジェクト・ステークホルダー・マネジメント', processes: 4 }
  ];

  const processes = {
    integration: {
      '立上げ': ['プロジェクト憲章の作成'],
      '計画': ['プロジェクトマネジメント計画書の作成'],
      '実行': ['プロジェクト作業の指揮・マネジメント', 'プロジェクト知識のマネジメント'],
      '監視・コントロール': ['プロジェクト作業の監視・コントロール', '統合変更管理'],
      '終結': ['プロジェクトやフェーズの終結']
    },
    scope: {
      '計画': ['スコープ・マネジメントの計画', '要求事項の収集', 'スコープの定義', 'WBSの作成'],
      '監視・コントロール': ['スコープの妥当性確認', 'スコープのコントロール']
    },
    schedule: {
      '計画': ['スケジュール・マネジメントの計画', 'アクティビティの定義', 'アクティビティの順序設定', 'アクティビティの所要期間見積り', 'スケジュールの作成'],
      '監視・コントロール': ['スケジュールのコントロール']
    },
    cost: {
      '計画': ['コスト・マネジメントの計画', 'コストの見積り', '予算の設定'],
      '監視・コントロール': ['コストのコントロール']
    },
    quality: {
      '計画': ['品質マネジメントの計画'],
      '実行': ['品質のマネジメント'],
      '監視・コントロール': ['品質のコントロール']
    },
    resource: {
      '計画': ['資源マネジメントの計画', 'アクティビティ資源の見積り'],
      '実行': ['資源の獲得', 'チームの育成', 'チームのマネジメント'],
      '監視・コントロール': ['資源のコントロール']
    },
    communications: {
      '計画': ['コミュニケーション・マネジメントの計画'],
      '実行': ['コミュニケーションのマネジメント'],
      '監視・コントロール': ['コミュニケーションの監視']
    },
    risk: {
      '計画': ['リスク・マネジメントの計画', 'リスクの特定', '定性的リスク分析', '定量的リスク分析', 'リスク対応の計画'],
      '実行': ['リスク対応策の実行'],
      '監視・コントロール': ['リスクの監視']
    },
    procurement: {
      '計画': ['調達マネジメントの計画'],
      '実行': ['調達の実行'],
      '監視・コントロール': ['調達のコントロール']
    },
    stakeholder: {
      '立上げ': ['ステークホルダーの特定'],
      '計画': ['ステークホルダー・エンゲージメントの計画'],
      '実行': ['ステークホルダー・エンゲージメントのマネジメント'],
      '監視・コントロール': ['ステークホルダー・エンゲージメントの監視']
    }
  };

  const processDetails = {
    'プロジェクト憲章の作成': {
      inputs: ['ビジネス文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '会議'],
      outputs: ['プロジェクト憲章', '前提条件ログ']
    },
    'プロジェクトマネジメント計画書の作成': {
      inputs: ['プロジェクト憲章', '他のプロセスからのアウトプット', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '会議'],
      outputs: ['プロジェクトマネジメント計画書']
    },
    'プロジェクト作業の指揮・マネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '承認済み変更要求', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'プロジェクトマネジメント情報システム', '会議'],
      outputs: ['成果物', '作業パフォーマンス・データ', '課題ログ', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
    },
    'プロジェクト知識のマネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '成果物', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '知識マネジメント', '情報マネジメント', '対人関係とチームに関するスキル'],
      outputs: ['教訓登録簿', 'プロジェクトマネジメント計画書更新版', '組織のプロセス資産更新版']
    },
    'プロジェクト作業の監視・コントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス情報', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '意思決定', '会議'],
      outputs: ['作業パフォーマンス報告書', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    '統合変更管理': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス報告書', '変更要求', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '変更管理ツール', 'データ分析', '意思決定', '会議'],
      outputs: ['承認済み変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    'プロジェクトやフェーズの終結': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '受入済み成果物', 'ビジネス文書', '合意書', '調達文書', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '会議'],
      outputs: ['プロジェクト文書更新版', '最終プロダクト、サービス、所産の引渡し', '最終報告書', '組織のプロセス資産更新版']
    },
    // スコープ・マネジメント
    'スコープ・マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '会議'],
      outputs: ['スコープ・マネジメント計画書', '要求事項マネジメント計画書']
    },
    '要求事項の収集': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', 'ビジネス文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', 'データ分析', '意思決定', 'データ表現', '対人関係とチームに関するスキル', 'コンテキスト図', 'プロトタイプ'],
      outputs: ['要求事項文書', '要求事項トレーサビリティ・マトリックス']
    },
    'スコープの定義': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '意思決定', '対人関係とチームに関するスキル', 'プロダクト分析'],
      outputs: ['プロジェクト・スコープ記述書', 'プロジェクト文書更新版']
    },
    'WBSの作成': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '分解'],
      outputs: ['スコープ・ベースライン', 'プロジェクト文書更新版']
    },
    'スコープの妥当性確認': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '検証済み成果物', '作業パフォーマンス・データ'],
      tools: ['検査', '意思決定'],
      outputs: ['受入済み成果物', '作業パフォーマンス情報', '変更要求', 'プロジェクト文書更新版']
    },
    'スコープのコントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織のプロセス資産'],
      tools: ['データ分析'],
      outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    // スケジュール・マネジメント
    'スケジュール・マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '会議'],
      outputs: ['スケジュール・マネジメント計画書']
    },
    'アクティビティの定義': {
      inputs: ['プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '分解', '段階的詳細化', '会議'],
      outputs: ['アクティビティ・リスト', 'アクティビティ属性', 'マイルストーン・リスト', '変更要求', 'プロジェクトマネジメント計画書更新版']
    },
    'アクティビティの順序設定': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['プレシデンス・ダイアグラム法', '依存関係の決定と統合', 'リード・ラグ', 'プロジェクトマネジメント情報システム'],
      outputs: ['プロジェクト・スケジュール・ネットワーク図', 'プロジェクト文書更新版']
    },
    'アクティビティ所要期間の見積り': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '類推見積り', 'パラメトリック見積り', '三点見積り', 'ボトムアップ見積り', 'データ分析', '意思決定', '会議'],
      outputs: ['所要期間見積り', '見積りの根拠', 'プロジェクト文書更新版']
    },
    'スケジュールの作成': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['スケジュール・ネットワーク分析', 'クリティカル・パス法', '資源最適化', 'データ分析', 'リード・ラグ', 'スケジュール短縮', 'プロジェクトマネジメント情報システム', 'アジャイル・リリース計画'],
      outputs: ['スケジュール・ベースライン', 'プロジェクト・スケジュール', 'スケジュール・データ', 'プロジェクト・カレンダー', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    'スケジュールのコントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織のプロセス資産'],
      tools: ['データ分析', 'クリティカル・パス法', 'プロジェクトマネジメント情報システム', '資源最適化', 'リード・ラグ', 'スケジュール短縮'],
      outputs: ['作業パフォーマンス情報', 'スケジュール予測', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    // ステークホルダー・マネジメント
    'ステークホルダーの特定': {
      inputs: ['プロジェクト憲章', 'ビジネス文書', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', 'データ分析', 'データ表現', '会議'],
      outputs: ['ステークホルダー登録簿', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    'ステークホルダー・エンゲージメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', 'データ分析', 'データ表現', '意思決定', '会議'],
      outputs: ['ステークホルダー・エンゲージメント計画書']
    },
    'ステークホルダー・エンゲージメントのマネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'コミュニケーション・スキル', '対人関係とチームに関するスキル', '基本ルール', '会議'],
      outputs: ['変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    'ステークホルダー・エンゲージメントの監視': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['データ分析', '意思決定', 'データ表現', 'コミュニケーション・スキル', '対人関係とチームに関するスキル', '会議'],
      outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    // コスト・マネジメント
    'コスト・マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '会議'],
      outputs: ['コスト・マネジメント計画書']
    },
    'コストの見積り': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '類推見積り', 'パラメトリック見積り', 'ボトムアップ見積り', '三点見積り', 'データ分析', 'プロジェクトマネジメント情報システム', '意思決定'],
      outputs: ['コスト見積り', '見積りの根拠', 'プロジェクト文書更新版']
    },
    '予算の設定': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', 'ビジネス文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'コスト集計', 'データ分析', '過去の情報のレビュー', '資金限度額の調整', '財務'],
      outputs: ['コスト・ベースライン', 'プロジェクト資金要求事項', 'プロジェクト文書更新版']
    },
    'コストのコントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', 'プロジェクト資金要求事項', '作業パフォーマンス・データ', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '完成時総コスト予測', 'プロジェクトマネジメント情報システム'],
      outputs: ['作業パフォーマンス情報', 'コスト予測', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    // 品質マネジメント
    '品質マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', 'データ分析', '意思決定', 'データ表現', 'テストおよび検査の計画', '会議'],
      outputs: ['品質マネジメント計画書', '品質測定指標', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    '品質のマネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織のプロセス資産'],
      tools: ['データ収集', '製品の分析とテスト', 'データ表現', '問題解決', '品質改善手法'],
      outputs: ['品質報告書', 'テストおよび評価文書', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    '品質のコントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '承認済み変更要求', '成果物', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['データ収集', '検査', 'テスト・製品評価', 'データ分析', '会議', 'データ表現'],
      outputs: ['品質管理測定結果', '検証済み成果物', '作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    // 資源マネジメント
    '資源マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ表現', '組織論', '会議'],
      outputs: ['資源マネジメント計画書', 'チーム憲章', 'プロジェクト文書更新版']
    },
    'アクティビティ資源の見積り': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'ボトムアップ見積り', '類推見積り', 'パラメトリック見積り', 'データ分析', 'プロジェクトマネジメント情報システム', '会議'],
      outputs: ['資源要求事項', '見積りの根拠', '資源ブレークダウン・ストラクチャー', 'プロジェクト文書更新版']
    },
    '資源の獲得': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['意思決定', '対人関係とチームに関するスキル', '事前割当て', 'バーチャル・チーム'],
      outputs: ['物的資源割当て', 'プロジェクト・チーム任命', '資源カレンダー', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織体の環境要因更新版', '組織のプロセス資産更新版']
    },
    'チームの育成': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['コロケーション', 'バーチャル・チーム', 'コミュニケーション技術', '対人関係とチームに関するスキル', '表彰と報奨', 'トレーニング', '個人とチームのアセスメント', '会議'],
      outputs: ['チーム・パフォーマンス評価', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織体の環境要因更新版', '組織のプロセス資産更新版']
    },
    'チームのマネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス報告書', 'チーム・パフォーマンス評価', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['対人関係とチームに関するスキル', 'プロジェクトマネジメント情報システム'],
      outputs: ['変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織体の環境要因更新版']
    },
    '資源のコントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '合意書', '組織のプロセス資産'],
      tools: ['データ分析', '問題解決', '対人関係とチームに関するスキル', 'プロジェクトマネジメント情報システム'],
      outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    // コミュニケーション・マネジメント
    'コミュニケーション・マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'コミュニケーション要求事項分析', 'コミュニケーション技術', 'コミュニケーション・モデル', 'コミュニケーション方法', '対人関係とチームに関するスキル', 'データ表現', '会議'],
      outputs: ['コミュニケーション・マネジメント計画書', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    'コミュニケーションのマネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス報告書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['コミュニケーション技術', 'コミュニケーション方法', 'コミュニケーション・スキル', 'プロジェクトマネジメント情報システム', 'プロジェクト報告', '対人関係とチームに関するスキル', '会議'],
      outputs: ['プロジェクト・コミュニケーション', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
    },
    'コミュニケーションの監視': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'プロジェクトマネジメント情報システム', 'データ表現', '対人関係とチームに関するスキル', '会議'],
      outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    // リスク・マネジメント
    'リスク・マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '会議'],
      outputs: ['リスク・マネジメント計画書']
    },
    'リスクの特定': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '合意書', '調達文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', 'データ分析', '対人関係とチームに関するスキル', 'プロンプト・リスト', '会議'],
      outputs: ['リスク登録簿', 'リスク報告書', 'プロジェクト文書更新版']
    },
    '定性的リスク分析': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', 'データ分析', '対人関係とチームに関するスキル', 'リスク・カテゴリー化', 'データ表現', '会議'],
      outputs: ['プロジェクト文書更新版']
    },
    '定量的リスク分析': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', 'リスクの不確実性の表現', 'データ分析'],
      outputs: ['プロジェクト文書更新版']
    },
    'リスク対応の計画': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '脅威への戦略', '好機への戦略', 'コンティンジェンシー対応戦略', '全体的プロジェクト・リスクへの戦略', 'データ分析', '意思決定'],
      outputs: ['変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    'リスク対応策の実行': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '組織のプロセス資産'],
      tools: ['専門家の判断', '対人関係とチームに関するスキル', 'プロジェクトマネジメント情報システム'],
      outputs: ['変更要求', 'プロジェクト文書更新版']
    },
    'リスクの監視': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス・データ', '作業パフォーマンス報告書'],
      tools: ['データ分析', '監査', '会議'],
      outputs: ['作業パフォーマンス情報', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
    },
    // 調達マネジメント
    '調達マネジメントの計画': {
      inputs: ['プロジェクト憲章', 'ビジネス文書', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '市場調査', 'データ収集', 'データ分析', 'ソース選定分析', '会議'],
      outputs: ['調達マネジメント計画書', '調達戦略', '入札文書', '調達作業範囲記述書', 'ソース選定基準', '内外製分析', '独立見積り', '変更要求', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
    },
    '調達の実行': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '調達文書', '納入者からのプロポーザル', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '広告', '入札者会議', 'データ分析', '対人関係とチームに関するスキル'],
      outputs: ['選定された納入者', '合意書', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
    },
    '調達のコントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '合意書', '調達文書', '承認済み変更要求', '作業パフォーマンス・データ', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'クレーム処理', 'データ分析', '検査', '監査'],
      outputs: ['完了した調達', '作業パフォーマンス情報', '調達文書更新版', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
    }
  };

  const toggleArea = useCallback((areaId) => {
    setLoading(true);
    setTimeout(() => {
      const newExpanded = new Set(expandedAreas);
      if (newExpanded.has(areaId)) {
        newExpanded.delete(areaId);
      } else {
        newExpanded.add(areaId);
      }
      setExpandedAreas(newExpanded);
      setLoading(false);
    }, 100);
  }, [expandedAreas]);

  const handleProcessClick = useCallback((process) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedProcess(process);
      setLoading(false);
    }, 100);
  }, []);

  const filteredProcesses = useMemo(() => {
    if (!searchQuery) return processes;
    
    const filtered = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(processes).forEach(([area, groups]) => {
      const filteredGroups = {};
      Object.entries(groups).forEach(([group, processList]) => {
        const filteredList = processList.filter(process => 
          process.toLowerCase().includes(query)
        );
        if (filteredList.length > 0) {
          filteredGroups[group] = filteredList;
        }
      });
      if (Object.keys(filteredGroups).length > 0) {
        filtered[area] = filteredGroups;
      }
    });
    
    return filtered;
  }, [searchQuery]);

  const getProcessCount = (areaId) => {
    const areaProcesses = filteredProcesses[areaId];
    if (!areaProcesses) return 0;
    return Object.values(areaProcesses).reduce((sum, group) => sum + group.length, 0);
  };

  const getAreaProgress = (areaId) => {
    const areaProcesses = processes[areaId];
    if (!areaProcesses || !progress?.processes) return { completed: 0, total: 0, percentage: 0 };
    
    let completed = 0;
    let total = 0;
    
    Object.entries(areaProcesses).forEach(([group, processList]) => {
      processList.forEach((process, index) => {
        const processId = generateProcessId(areaId, group, index);
        if (progress.processes[processId]?.completed) {
          completed++;
        }
        total++;
      });
    });
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            PMBOK 第6版 - プロセス・マトリックス (49プロセス)
          </h1>
          
          <div className="relative">
            <input
              type="text"
              placeholder="プロセスを検索..."
              className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 pr-10 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[550px] sm:min-w-[700px] md:min-w-[900px]">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-1 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight sm:tracking-wider w-32 sm:w-48 md:w-60">
                  <div className="truncate">知識エリア</div>
                </th>
                {processGroups.map(group => (
                  <th key={group} className="px-0.5 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-[9px] sm:text-xs font-medium text-gray-500 uppercase tracking-tighter">
                    <div className="hidden sm:block">{group}</div>
                    <div className="sm:hidden">{processGroupsShort[group]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {knowledgeAreas.map(area => {
                const isExpanded = expandedAreas.has(area.id);
                const processCount = getProcessCount(area.id);
                const hasFilteredProcesses = processCount > 0;
                const areaProgress = getAreaProgress(area.id);

                if (!hasFilteredProcesses && searchQuery) return null;

                return (
                  <React.Fragment key={area.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-1 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4">
                        <button
                          onClick={() => toggleArea(area.id)}
                          className="flex items-center space-x-1 text-left w-full"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 animate-spin flex-shrink-0" />
                          ) : isExpanded ? (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 text-[11px] sm:text-sm md:text-base block truncate">
                                <span className="sm:hidden">{area.name.replace('プロジェクト・', '').replace('プロジェクト', '').replace('マネジメント', '')}</span>
                                <span className="hidden sm:inline">{area.name}</span>
                              </span>
                              {areaProgress.percentage > 0 && (
                                <span className={`text-[10px] sm:text-xs font-medium ml-2 ${
                                  areaProgress.percentage === 100 ? 'text-green-600' :
                                  areaProgress.percentage >= 50 ? 'text-blue-600' :
                                  'text-gray-600'
                                }`}>
                                  {areaProgress.percentage}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] sm:text-xs text-gray-500">({processCount})</span>
                              {areaProgress.completed > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full transition-all duration-500 ${
                                        areaProgress.percentage === 100 ? 'bg-green-600' :
                                        areaProgress.percentage >= 50 ? 'bg-blue-600' :
                                        'bg-gray-400'
                                      }`}
                                      style={{ width: `${areaProgress.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-gray-500">
                                    {areaProgress.completed}/{areaProgress.total}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </td>
                      {processGroups.map(group => {
                        const groupProcesses = filteredProcesses[area.id]?.[group] || [];
                        return (
                          <td key={group} className="px-0.5 sm:px-2 md:px-4 py-3 sm:py-4 text-center">
                            {groupProcesses.length > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-800 text-[10px] sm:text-xs md:text-sm font-semibold">
                                {groupProcesses.length}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && filteredProcesses[area.id] && (
                      <tr>
                        <td colSpan={6} className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {processGroups.map(group => {
                              const groupProcesses = filteredProcesses[area.id][group];
                              if (!groupProcesses || groupProcesses.length === 0) return null;
                              
                              return (
                                <div key={group} className="space-y-1.5 sm:space-y-2">
                                  <h4 className="font-semibold text-gray-700 text-xs sm:text-sm sticky top-0 bg-gray-50 py-1">
                                    {group}
                                  </h4>
                                  {groupProcesses.map((process, index) => {
                                    const processId = generateProcessId(area.id, group, index);
                                    const processProgress = progress?.processes?.[processId];
                                    const isCompleted = processProgress?.completed || false;
                                    const understanding = processProgress?.understanding || 0;
                                    
                                    return (
                                      <div key={process} className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleProcessClick(process)}
                                          disabled={loading}
                                          className={`flex-1 text-left px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                            selectedProcess === process
                                              ? 'bg-blue-100 border-blue-400 font-semibold'
                                              : isCompleted
                                              ? 'bg-green-50 hover:bg-green-100 border-green-300'
                                              : 'bg-white hover:bg-blue-50 hover:border-blue-300'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1">
                                              {isCompleted && <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />}
                                              {process}
                                            </span>
                                            {understanding > 0 && (
                                              <span className="text-[10px] text-gray-500 ml-2">{understanding}%</span>
                                            )}
                                          </div>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedLearningProcess({
                                              id: processId,
                                              name: process,
                                              knowledgeArea: area.name,
                                              processGroup: group,
                                              ...processDetails[process]
                                            });
                                            setLearningModalOpen(true);
                                          }}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          title="学習する"
                                        >
                                          <BookOpen className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* ITTO詳細表示 */}
                          {selectedProcess && processDetails[selectedProcess] && (() => {
                            // 選択されたプロセスが現在の知識エリアに属しているかチェック
                            const currentAreaProcesses = processes[area.id];
                            if (!currentAreaProcesses) return false;
                            
                            const isInCurrentArea = Object.values(currentAreaProcesses).some(
                              groupProcesses => groupProcesses && groupProcesses.includes(selectedProcess)
                            );
                            
                            return isInCurrentArea;
                          })() && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-sm sm:text-base font-bold text-gray-800">{selectedProcess}</h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProcess(null);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2 flex items-center">
                                    <ChevronRight className="w-4 h-4 mr-1" />
                                    インプット
                                  </h4>
                                  <ul className="space-y-1">
                                    {processDetails[selectedProcess].inputs.map((input, idx) => (
                                      <li key={idx} className="text-xs sm:text-sm text-gray-700 flex items-start">
                                        <span className="text-blue-600 mr-1">•</span>
                                        <span>{renderTextWithLinks(input)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-green-50 rounded-lg p-3">
                                  <h4 className="text-xs sm:text-sm font-semibold text-green-800 mb-2 flex items-center">
                                    <ChevronRight className="w-4 h-4 mr-1" />
                                    ツールと技法
                                  </h4>
                                  <ul className="space-y-1">
                                    {processDetails[selectedProcess].tools.map((tool, idx) => (
                                      <li key={idx} className="text-xs sm:text-sm text-gray-700 flex items-start">
                                        <span className="text-green-600 mr-1">•</span>
                                        <span>{renderTextWithLinks(tool)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-amber-50 rounded-lg p-3">
                                  <h4 className="text-xs sm:text-sm font-semibold text-amber-800 mb-2 flex items-center">
                                    <ChevronRight className="w-4 h-4 mr-1" />
                                    アウトプット
                                  </h4>
                                  <ul className="space-y-1">
                                    {processDetails[selectedProcess].outputs.map((output, idx) => (
                                      <li key={idx} className="text-xs sm:text-sm text-gray-700 flex items-start">
                                        <span className="text-amber-600 mr-1">•</span>
                                        <span>{renderTextWithLinks(output)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 用語集ダイアログ */}
      {selectedGlossaryTerm && (
        <GlossaryDialog
          term={selectedGlossaryTerm}
          onClose={() => setSelectedGlossaryTerm(null)}
          onNavigateToGlossary={(termId) => {
            navigate('/glossary', { state: { selectedTermId: termId } });
          }}
        />
      )}

      {/* 学習モーダル */}
      <LearningModal
        isOpen={learningModalOpen}
        onClose={() => {
          setLearningModalOpen(false);
          setSelectedLearningProcess(null);
        }}
        process={selectedLearningProcess}
        processId={selectedLearningProcess?.id}
        knowledgeArea={selectedLearningProcess?.knowledgeArea}
        processGroup={selectedLearningProcess?.processGroup}
      />
    </div>
  );
});

PMBOKMatrix.displayName = 'PMBOKMatrix';

export default PMBOKMatrix;