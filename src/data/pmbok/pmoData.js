/**
 * PMO（プロジェクト管理オフィス）とACoE（アジャイル・センター・オブ・エクセレンス）の完全データセット
 * PMBOK第7版に準拠したPMOタイプとその特性を定義
 */

// TypeScript型定義の参照（実際のインポートはJavaScript実行時には不要）
// import { PMOType, PMOControlLevel } from '../schemas/pmbok/pmoTypes.js'

// 型定義に相当するenum値をJavaScriptで再定義
const PMOType = {
  SUPPORTIVE: 'supportive',
  CONTROLLING: 'controlling',
  DIRECTIVE: 'directive',
  ACOE: 'acoe',
}

const PMOControlLevel = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
}

/**
 * 支援型PMO（Supportive PMO）の定義
 */
const supportivePMO = {
  type: PMOType.SUPPORTIVE,
  name: 'Supportive PMO',
  japanName: '支援型PMO',
  description:
    'プロジェクトマネジメントの支援機能を提供し、ベストプラクティス、テンプレート、レッスン・ラーンドを共有する。プロジェクトに対する管理権限は最小限で、プロジェクト・マネジャーの自律性を尊重する。',
  controlLevel: PMOControlLevel.LOW,

  characteristics: {
    managementStyle: '助言型・コンサルティング型',
    autonomyLevel: '高い（プロジェクト・マネジャーの裁量を重視）',
    supportLevel: '要求に応じた支援提供',
    standardizationLevel: '推奨レベル（強制ではない）',
  },

  responsibilities: [
    {
      id: 'sp_001',
      title: 'ベストプラクティスの開発と共有',
      description:
        '組織全体で使用可能なプロジェクトマネジメントのベストプラクティスを開発し、ナレッジベースとして維持管理する',
      category: 'methodology',
      priority: 'high',
    },
    {
      id: 'sp_002',
      title: 'テンプレートとツールの提供',
      description:
        'プロジェクト憲章、WBS、リスク登録簿などの標準的なテンプレートとツールを開発・提供する',
      category: 'support',
      priority: 'high',
    },
    {
      id: 'sp_003',
      title: 'コーチングとメンタリング',
      description:
        'プロジェクト・マネジャーに対する個別指導、スキル向上支援、問題解決のサポートを提供する',
      category: 'coaching',
      priority: 'high',
    },
    {
      id: 'sp_004',
      title: 'トレーニングプログラムの提供',
      description:
        'プロジェクトマネジメント手法、ツール使用法、ソフトスキルに関するトレーニングを企画・実施する',
      category: 'training',
      priority: 'medium',
    },
    {
      id: 'sp_005',
      title: 'レッスン・ラーンドの収集と活用',
      description:
        'プロジェクトから得られた教訓を体系的に収集し、将来のプロジェクトで活用できる形で整理・共有する',
      category: 'methodology',
      priority: 'medium',
    },
  ],

  bestPractices: [
    {
      id: 'bp_sp_001',
      title: 'オンデマンド支援体制の構築',
      description: 'プロジェクト・マネジャーが必要な時に迅速に支援を受けられる体制を整備する',
      implementation: [
        'ヘルプデスク機能の設置',
        '専門家プールの維持',
        'Q&Aデータベースの構築',
        '24時間以内の回答保証',
      ],
      benefits: ['プロジェクト・マネジャーの自主性維持', '迅速な問題解決', '組織全体の知識向上'],
      challenges: ['支援要求の変動への対応', '専門知識の幅広いカバー', 'リソース配分の最適化'],
      applicableContexts: [
        '成熟したプロジェクト組織',
        '経験豊富なPM が多い環境',
        '多様なプロジェクトタイプ',
      ],
    },
    {
      id: 'bp_sp_002',
      title: 'コミュニティ・オブ・プラクティスの運営',
      description:
        'プロジェクト・マネジャー同士の知識共有と相互学習を促進するコミュニティを運営する',
      implementation: [
        '定期的な勉強会の開催',
        'オンラインフォーラムの提供',
        'ケーススタディ共有会',
        'メンタリングプログラム',
      ],
      benefits: ['実践的な知識の共有', 'ネットワーク構築', '組織文化の醸成'],
      challenges: ['参加意欲の維持', '時間確保の困難', '知識の標準化'],
      applicableContexts: [
        '学習志向の組織文化',
        '地理的に分散したチーム',
        '知識集約型プロジェクト',
      ],
    },
  ],

  advantages: [
    'プロジェクト・マネジャーの自律性と創造性を維持',
    '低いコストで運営可能',
    '組織の変化に柔軟に対応',
    'プロジェクト固有の要求に適応しやすい',
    '実装が比較的容易',
  ],

  disadvantages: [
    '標準化の進展が遅い',
    'プロジェクト間の一貫性確保が困難',
    '品質のばらつきが発生しやすい',
    'ガバナンスが弱い',
    '組織全体の可視性が低い',
  ],

  applicableScenarios: [
    '組織のプロジェクトマネジメント成熟度が高い',
    'プロジェクト・マネジャーが経験豊富',
    'プロジェクトの多様性が高い',
    '創新性とスピードが重視される',
    '組織文化が自律性を重視している',
  ],

  successFactors: [
    '高品質な支援サービスの提供',
    'プロジェクト・マネジャーとの信頼関係構築',
    '実用的で価値のあるツール・テンプレートの開発',
    '組織のニーズに応じた柔軟なサービス提供',
    '継続的な改善とイノベーション',
  ],

  keyMetrics: [
    {
      id: 'metric_sp_001',
      name: 'PMO サービス利用率',
      description: 'PMOが提供するサービス・ツールの利用頻度',
      category: 'performance',
      measurementMethod: '月次利用回数 / 総プロジェクト数',
      targetValue: '80%以上',
      frequency: 'monthly',
    },
    {
      id: 'metric_sp_002',
      name: 'PM満足度スコア',
      description: 'PMOサービスに対するプロジェクト・マネジャーの満足度',
      category: 'satisfaction',
      measurementMethod: '四半期ごとの満足度調査',
      targetValue: '4.0/5.0以上',
      frequency: 'quarterly',
    },
    {
      id: 'metric_sp_003',
      name: 'ベストプラクティス採用率',
      description: 'PMOが推奨するベストプラクティスの採用率',
      category: 'quality',
      measurementMethod: 'プロジェクト監査による確認',
      targetValue: '70%以上',
      frequency: 'quarterly',
    },
  ],

  tools: [
    {
      id: 'tool_sp_001',
      name: 'プロジェクト憲章テンプレート',
      description: '標準的なプロジェクト憲章の作成テンプレート',
      type: 'template',
      category: 'initiation',
      usageScenario: ['新規プロジェクト立ち上げ', 'ステークホルダー合意形成'],
    },
    {
      id: 'tool_sp_002',
      name: 'リスク管理フレームワーク',
      description: 'リスクの特定、分析、対応計画の包括的フレームワーク',
      type: 'framework',
      category: 'risk_management',
      usageScenario: ['リスク計画', '定期的なリスク評価'],
    },
    {
      id: 'tool_sp_003',
      name: 'レッスン・ラーンド収集テンプレート',
      description: 'プロジェクト終了時の教訓収集用標準テンプレート',
      type: 'template',
      category: 'closure',
      usageScenario: ['プロジェクト終了', '中間振り返り'],
    },
  ],

  organizationalImpact: {
    cultural: ['学習文化の促進', '知識共有の習慣化', '自律性と責任感の向上'],
    structural: ['最小限の組織変更', '既存の報告構造を維持', '柔軟なサポート体制'],
    operational: ['プロセスの標準化（推奨レベル）', '品質向上の緩やかな促進', '効率化の間接的支援'],
  },

  implementationGuidelines: {
    prerequisites: [
      '経営陣のサポート確保',
      '適切な専門知識を持つスタッフの確保',
      '基本的なPMツール・インフラの整備',
    ],
    phases: [
      'フェーズ1: PMOチーム編成とサービス設計（2-3ヶ月）',
      'フェーズ2: 基本ツール・テンプレートの開発（3-4ヶ月）',
      'フェーズ3: パイロットサービス提供開始（2-3ヶ月）',
      'フェーズ4: 全面展開と継続改善（継続）',
    ],
    timeline: '6-12ヶ月',
    resources: [
      'PMOマネジャー（1名）',
      'シニアPM/コンサルタント（2-3名）',
      'アドミニストレーター（1名）',
    ],
    risks: ['サービス利用率の低迷', 'PM からの抵抗', 'リソース不足', 'サービス品質の不安定'],
    mitigationStrategies: [
      '積極的なマーケティングとコミュニケーション',
      'PM のニーズに基づくサービス設計',
      '段階的な展開によるリソース配分調整',
      '継続的なフィードバック収集と改善',
    ],
  },
}

/**
 * コントロール型PMO（Controlling PMO）の定義
 */
const controllingPMO = {
  type: PMOType.CONTROLLING,
  name: 'Controlling PMO',
  japanName: 'コントロール型PMO',
  description:
    'プロジェクトマネジメント標準、方針、手続き、テンプレートの順守状況を監視し、一定レベルの統制を行う。支援機能に加えて監査・監視機能を持つ。',
  controlLevel: PMOControlLevel.MODERATE,

  characteristics: {
    managementStyle: '監視型・ガバナンス重視型',
    autonomyLevel: '中程度（標準への準拠を要求）',
    supportLevel: '支援と監視の両立',
    standardizationLevel: '必須レベル（準拠義務あり）',
  },

  responsibilities: [
    {
      id: 'cp_001',
      title: 'PMO標準・方針の策定と維持',
      description:
        '組織全体で使用するプロジェクトマネジメント標準、方針、手続きを策定し、定期的に更新・維持する',
      category: 'governance',
      priority: 'high',
    },
    {
      id: 'cp_002',
      title: 'プロジェクト監査の実施',
      description:
        'プロジェクトが定められた標準や手続きに準拠しているかを定期的に監査し、改善指導を行う',
      category: 'governance',
      priority: 'high',
    },
    {
      id: 'cp_003',
      title: 'プロジェクト状況の監視と報告',
      description: '全プロジェクトの進捗、リスク、課題を監視し、経営陣に定期的に報告する',
      category: 'governance',
      priority: 'high',
    },
    {
      id: 'cp_004',
      title: 'ゲートレビューの実施',
      description:
        'プロジェクトの主要マイルストーンで品質ゲートレビューを実施し、次段階への進行可否を判断する',
      category: 'governance',
      priority: 'high',
    },
    {
      id: 'cp_005',
      title: 'プロジェクト・ポートフォリオの管理',
      description:
        '組織のプロジェクト・ポートフォリオ全体を監視し、優先順位付けと資源配分を支援する',
      category: 'coordination',
      priority: 'medium',
    },
  ],

  bestPractices: [
    {
      id: 'bp_cp_001',
      title: 'リスクベース監査アプローチ',
      description: 'プロジェクトのリスクレベルに応じて監査頻度と深度を調整する',
      implementation: [
        'リスク評価マトリクスの作成',
        '高リスクプロジェクトの頻繁な監査',
        'リスクに応じた監査チェックリスト',
        '是正措置の追跡システム',
      ],
      benefits: ['効率的な監査リソース活用', '高リスクプロジェクトの早期発見', '的確な支援提供'],
      challenges: ['リスク評価の客観性確保', '監査負荷の適正化', 'PM との良好な関係維持'],
      applicableContexts: [
        '多数のプロジェクトを抱える組織',
        'リスク許容度が低い業界',
        '規制要件が厳しい環境',
      ],
    },
    {
      id: 'bp_cp_002',
      title: 'ダッシュボードによる可視化',
      description: 'プロジェクト状況をリアルタイムで可視化するダッシュボードを構築する',
      implementation: [
        'KPI ダッシュボードの開発',
        '自動データ収集システム',
        'アラート機能の実装',
        '役職別ビューのカスタマイズ',
      ],
      benefits: ['リアルタイムな状況把握', '意思決定の迅速化', '透明性の向上'],
      challenges: ['データ品質の確保', 'システム開発・維持コスト', '情報過多への対応'],
      applicableContexts: [
        'デジタル化が進んだ組織',
        '地理的に分散したプロジェクト',
        'データドリブンな意思決定文化',
      ],
    },
  ],

  advantages: [
    'プロジェクト品質の安定化',
    '組織全体の可視性向上',
    'リスクの早期発見・対処',
    '標準化による効率向上',
    '経営陣への適切な情報提供',
  ],

  disadvantages: [
    'PM の自律性が制限される',
    '監査・監視コストが高い',
    '官僚的になりがち',
    '創新性を阻害する可能性',
    'PM との関係が対立的になるリスク',
  ],

  applicableScenarios: [
    '組織のPM成熟度が中程度',
    '品質と一貫性が重要視される',
    'リスク管理が重要な業界',
    '複数の大規模プロジェクトが並行',
    '規制要件への準拠が必要',
  ],

  successFactors: [
    '明確で実用的な標準・手続きの策定',
    'PM との協力的関係の構築',
    '効率的な監査プロセスの確立',
    '価値あるフィードバックの提供',
    '継続的改善の文化醸成',
  ],

  keyMetrics: [
    {
      id: 'metric_cp_001',
      name: 'プロジェクト標準準拠率',
      description: 'PMO標準に準拠しているプロジェクトの割合',
      category: 'quality',
      measurementMethod: '監査結果による準拠プロジェクト数 / 総プロジェクト数',
      targetValue: '90%以上',
      frequency: 'quarterly',
    },
    {
      id: 'metric_cp_002',
      name: 'プロジェクト成功率',
      description: 'スコープ・スケジュール・予算内で完了したプロジェクトの割合',
      category: 'performance',
      measurementMethod: '成功プロジェクト数 / 完了プロジェクト数',
      targetValue: '85%以上',
      frequency: 'quarterly',
    },
    {
      id: 'metric_cp_003',
      name: '監査指摘事項解決率',
      description: '監査で指摘された事項の期限内解決率',
      category: 'efficiency',
      measurementMethod: '期限内解決事項数 / 総指摘事項数',
      targetValue: '95%以上',
      frequency: 'monthly',
    },
  ],

  tools: [
    {
      id: 'tool_cp_001',
      name: 'プロジェクト監査チェックリスト',
      description: '標準的な監査項目を網羅したチェックリスト',
      type: 'checklist',
      category: 'governance',
      usageScenario: ['定期監査', 'ゲートレビュー'],
    },
    {
      id: 'tool_cp_002',
      name: 'プロジェクト・ダッシュボード',
      description: 'リアルタイムなプロジェクト状況監視ツール',
      type: 'tool',
      category: 'monitoring',
      usageScenario: ['日常監視', '経営報告'],
    },
    {
      id: 'tool_cp_003',
      name: 'ガバナンス・フレームワーク',
      description: 'プロジェクトガバナンスの包括的フレームワーク',
      type: 'framework',
      category: 'governance',
      usageScenario: ['標準策定', 'PM教育'],
    },
  ],

  organizationalImpact: {
    cultural: ['品質意識の向上', '標準化への理解促進', '透明性の重視'],
    structural: ['明確な報告ライン確立', 'ガバナンス体制の強化', '監査機能の制度化'],
    operational: ['プロセスの標準化推進', '品質管理の向上', '効率化の組織的推進'],
  },

  implementationGuidelines: {
    prerequisites: [
      '経営陣の強いコミット',
      'PM への十分な説明と合意形成',
      'ガバナンス体制の設計',
      '監査スキルを持つ人材確保',
    ],
    phases: [
      'フェーズ1: ガバナンス体制設計（3-4ヶ月）',
      'フェーズ2: 標準・手続きの策定（4-6ヶ月）',
      'フェーズ3: 監視システム構築（3-4ヶ月）',
      'フェーズ4: 全面展開と継続改善（継続）',
    ],
    timeline: '12-18ヶ月',
    resources: [
      'PMOディレクター（1名）',
      'PMOマネジャー（2-3名）',
      '監査スペシャリスト（2-3名）',
      'BI/データアナリスト（1名）',
    ],
    risks: ['PM からの抵抗', '過度な官僚化', '監査負荷の過大', 'システム構築の遅延'],
    mitigationStrategies: [
      '段階的導入とパイロット実施',
      '実用性重視の標準策定',
      'PM へのメリット明示',
      '継続的なコミュニケーション',
    ],
  },
}

/**
 * 指令型PMO（Directive PMO）の定義
 */
const directivePMO = {
  type: PMOType.DIRECTIVE,
  name: 'Directive PMO',
  japanName: '指令型PMO',
  description:
    'プロジェクトを直接管理し、資源配分、プロジェクト間調整、統一的な管理を行う。最も高い管理権限を持ち、組織のプロジェクト戦略を実行する。',
  controlLevel: PMOControlLevel.HIGH,

  characteristics: {
    managementStyle: '指揮命令型・中央集権型',
    autonomyLevel: '低い（PMO が直接管理）',
    supportLevel: '包括的な管理とサポート',
    standardizationLevel: '強制レベル（厳格な準拠義務）',
  },

  responsibilities: [
    {
      id: 'dp_001',
      title: 'プロジェクト・マネジャーの任命と管理',
      description:
        'プロジェクト・マネジャーの選任、評価、育成、異動を直接管理し、組織のPM リソースを統括する',
      category: 'governance',
      priority: 'high',
    },
    {
      id: 'dp_002',
      title: '共有資源の管理と配分',
      description: '組織の人的・物的資源をプロジェクト間で最適に配分し、リソース競合を調整する',
      category: 'coordination',
      priority: 'high',
    },
    {
      id: 'dp_003',
      title: 'プロジェクト間のコミュニケーション調整',
      description: '関連するプロジェクト間の依存関係を管理し、コミュニケーションと調整を促進する',
      category: 'coordination',
      priority: 'high',
    },
    {
      id: 'dp_004',
      title: 'ポートフォリオ戦略の実行',
      description: '組織の戦略に基づいてプロジェクト・ポートフォリオを管理し、価値最大化を図る',
      category: 'governance',
      priority: 'high',
    },
    {
      id: 'dp_005',
      title: 'プロジェクト成果の統合管理',
      description: '個別プロジェクトの成果を統合し、組織全体の目標達成に向けて調整する',
      category: 'coordination',
      priority: 'high',
    },
  ],

  bestPractices: [
    {
      id: 'bp_dp_001',
      title: 'リソース・プール管理',
      description:
        '組織の専門スキルを持つ人材をプールとして管理し、プロジェクト需要に応じて配分する',
      implementation: [
        'スキル・インベントリの構築',
        'リソース需給予測システム',
        '柔軟な配置転換制度',
        'クロストレーニング・プログラム',
      ],
      benefits: ['リソース活用の最適化', 'スキル不足の解消', 'プロジェクト間の知識移転'],
      challenges: ['個人のキャリア希望との調整', 'リソース争奪の調停', 'スキル評価の客観性'],
      applicableContexts: ['大規模組織', 'マトリクス組織構造', '高度な専門スキルが必要'],
    },
    {
      id: 'bp_dp_002',
      title: 'プログラム管理アプローチ',
      description: '関連するプロジェクトをプログラムとして統合管理し、シナジー効果を最大化する',
      implementation: [
        'プログラム構造の設計',
        '依存関係マップの作成',
        '統合スケジュール管理',
        'ベネフィット実現管理',
      ],
      benefits: ['プロジェクト間シナジー', 'リスクの統合管理', '戦略目標の確実な達成'],
      challenges: ['複雑性の管理', '変更影響の波及', 'ステークホルダー調整'],
      applicableContexts: [
        '戦略的変革プロジェクト',
        '複数部門にまたがる取組み',
        '長期的な価値実現が目標',
      ],
    },
  ],

  advantages: [
    '組織資源の最適活用',
    '戦略的目標の確実な実行',
    'プロジェクト間シナジーの実現',
    '統一された品質とアプローチ',
    '強力なガバナンスとコントロール',
  ],

  disadvantages: [
    'PM の自律性とモチベーション低下',
    '高いPMO運営コスト',
    '官僚的で非効率になるリスク',
    '創新性とスピードの阻害',
    '組織的な抵抗が強い',
  ],

  applicableScenarios: [
    '大規模で複雑なプロジェクト群',
    '戦略的変革が重要な局面',
    '資源制約が厳しい環境',
    'リスク許容度が非常に低い',
    '組織のPM成熟度が低い',
  ],

  successFactors: [
    '経営陣の強力なサポート',
    '優秀なPMO スタッフの確保',
    '効率的なプロセスと仕組み',
    'PM との信頼関係構築',
    '価値創造への明確なフォーカス',
  ],

  keyMetrics: [
    {
      id: 'metric_dp_001',
      name: 'ポートフォリオROI',
      description: 'プロジェクト・ポートフォリオ全体の投資収益率',
      category: 'value',
      measurementMethod: '(総ベネフィット - 総投資) / 総投資',
      targetValue: '15%以上',
      frequency: 'quarterly',
    },
    {
      id: 'metric_dp_002',
      name: 'リソース稼働率',
      description: 'PMO管理下のリソースの有効活用率',
      category: 'efficiency',
      measurementMethod: '実稼働時間 / 総利用可能時間',
      targetValue: '85%以上',
      frequency: 'monthly',
    },
    {
      id: 'metric_dp_003',
      name: '戦略目標達成率',
      description: 'プロジェクトを通じた戦略目標の達成率',
      category: 'performance',
      measurementMethod: '達成した戦略目標数 / 総戦略目標数',
      targetValue: '90%以上',
      frequency: 'annually',
    },
  ],

  tools: [
    {
      id: 'tool_dp_001',
      name: 'ポートフォリオ管理システム',
      description: 'プロジェクト・ポートフォリオの統合管理ツール',
      type: 'tool',
      category: 'portfolio_management',
      usageScenario: ['戦略計画', 'リソース配分'],
    },
    {
      id: 'tool_dp_002',
      name: 'リソース最適化アルゴリズム',
      description: 'リソース配分の最適化を支援するアルゴリズム',
      type: 'tool',
      category: 'resource_management',
      usageScenario: ['リソース計画', '配置最適化'],
    },
    {
      id: 'tool_dp_003',
      name: '統合プロジェクト・ダッシュボード',
      description: 'PMO視点での包括的なプロジェクト監視ツール',
      type: 'tool',
      category: 'monitoring',
      usageScenario: ['経営報告', '意思決定支援'],
    },
  ],

  organizationalImpact: {
    cultural: ['中央集権的文化の強化', '効率性と統制の重視', '戦略実行への集中'],
    structural: ['強力なPMO組織の確立', 'マトリクス組織の強化', '明確な権限と責任体系'],
    operational: ['プロセスの完全標準化', '厳格な品質管理', '効率性の大幅向上'],
  },

  implementationGuidelines: {
    prerequisites: [
      'CEO レベルの強力なスポンサーシップ',
      '組織全体の合意と理解',
      '高度なPMO スキルを持つリーダー',
      '包括的なPMツールとシステム',
    ],
    phases: [
      'フェーズ1: 戦略・体制設計（4-6ヶ月）',
      'フェーズ2: システム・プロセス構築（6-9ヶ月）',
      'フェーズ3: パイロット実装（3-6ヶ月）',
      'フェーズ4: 全面展開（6-12ヶ月）',
    ],
    timeline: '18-24ヶ月',
    resources: [
      'PMOディレクター（1名）',
      'ポートフォリオマネジャー（2-3名）',
      'プログラムマネジャー（3-5名）',
      'リソースマネジャー（2-3名）',
      'PMO アナリスト（3-4名）',
    ],
    risks: [
      '組織的な強い抵抗',
      '実装の複雑性とコスト',
      'PM のモチベーション低下',
      '過度な中央集権化',
    ],
    mitigationStrategies: [
      '段階的で慎重な導入',
      'PM へのキャリアパス提示',
      '成果の早期実現と共有',
      '継続的な組織文化の醸成',
    ],
  },
}

/**
 * アジャイル・センター・オブ・エクセレンス（ACoE）の定義
 */
const agileCoE = {
  type: PMOType.ACOE,
  name: 'Agile Center of Excellence (ACoE)',
  japanName: 'アジャイル・センター・オブ・エクセレンス（ACoE）/ 価値実現オフィス（VDO）',
  description:
    'アジャイルのマインドセット、スキル、能力を組織全体に育成し、チームの自律性を支援しながら価値実現を最大化する。従来のPMOとは異なり、管理よりも支援とコーチングに重点を置く。',
  controlLevel: PMOControlLevel.LOW,

  characteristics: {
    managementStyle: 'コーチング型・エンパワーメント型',
    autonomyLevel: '非常に高い（チームの自己組織化を重視）',
    supportLevel: 'アジャイル変革に特化した支援',
    standardizationLevel: 'プラクティスレベル（原則重視、柔軟な適用）',
  },

  responsibilities: [
    {
      id: 'acoe_001',
      title: 'アジャイル・チームのコーチング',
      description:
        'スクラムマスター、プロダクトオーナー、開発チームに対するアジャイル実践のコーチングを提供する',
      category: 'coaching',
      priority: 'high',
    },
    {
      id: 'acoe_002',
      title: 'アジャイル・マインドセットの育成',
      description: '組織全体にアジャイルの価値観、原則、マインドセットを浸透させるための活動を行う',
      category: 'training',
      priority: 'high',
    },
    {
      id: 'acoe_003',
      title: 'スポンサーとプロダクトオーナーのメンタリング',
      description:
        'エグゼクティブスポンサーやプロダクトオーナーにアジャイル環境での効果的なリーダーシップを指導する',
      category: 'coaching',
      priority: 'high',
    },
    {
      id: 'acoe_004',
      title: '価値実現の支援と測定',
      description:
        'プロジェクトやプロダクトが生み出すビジネス価値の実現を支援し、継続的に測定・改善する',
      category: 'support',
      priority: 'high',
    },
    {
      id: 'acoe_005',
      title: 'アジャイル実践の改善促進',
      description: '組織のアジャイル実践を継続的に評価し、改善のための提案と支援を行う',
      category: 'methodology',
      priority: 'medium',
    },
  ],

  bestPractices: [
    {
      id: 'bp_acoe_001',
      title: 'エンベデッド・コーチング',
      description: 'チームに直接参加してリアルタイムでコーチングを提供する',
      implementation: [
        'チームでの日常的な作業参加',
        'スプリント・イベントでのファシリテーション',
        'リアルタイムなフィードバック提供',
        '個別メンタリング・セッション',
      ],
      benefits: ['実践的なスキル習得', '即座な問題解決', 'チーム文化の醸成'],
      challenges: ['コーチングリソースの確保', 'チームへの受け入れ', '依存関係の管理'],
      applicableContexts: ['アジャイル導入初期', '高度な変革が必要', 'チームスキルが不足'],
    },
    {
      id: 'bp_acoe_002',
      title: 'コミュニティ・オブ・プラクティス運営',
      description: 'アジャイル実践者のコミュニティを形成し、知識共有と相互学習を促進する',
      implementation: [
        'ギルド・チャプターの組織',
        '定期的な振り返り会',
        'ベストプラクティスの共有',
        'イノベーション・タイムの設定',
      ],
      benefits: ['組織学習の加速', 'イノベーションの促進', '文化変革の推進'],
      challenges: ['参加意欲の維持', '時間確保の困難', '成果の可視化'],
      applicableContexts: ['大規模アジャイル変革', '複数チームの協調', '継続的改善文化'],
    },
  ],

  advantages: [
    'チームの自律性と創造性の最大化',
    '迅速な価値提供の実現',
    '変化への適応力向上',
    '従業員エンゲージメントの向上',
    'イノベーション文化の醸成',
  ],

  disadvantages: [
    'ガバナンスが弱くなりがち',
    '一貫性の確保が困難',
    '伝統的な管理者からの抵抗',
    '成果測定の複雑さ',
    '組織全体の変革時間が長い',
  ],

  applicableScenarios: [
    'アジャイル変革を推進中',
    '不確実性の高い環境',
    'イノベーションが重要',
    '顧客価値の迅速な提供が必要',
    '従来のプロジェクト管理が機能しない',
  ],

  successFactors: [
    '経営陣のアジャイル理解とサポート',
    '優秀なアジャイル・コーチの確保',
    'チームの自律性への信頼',
    '価値重視の組織文化',
    '継続的学習と改善の仕組み',
  ],

  keyMetrics: [
    {
      id: 'metric_acoe_001',
      name: 'チーム・ベロシティ',
      description: 'アジャイル・チームの開発速度の改善率',
      category: 'performance',
      measurementMethod: '現在のベロシティ / ベースラインベロシティ',
      targetValue: '20%改善以上',
      frequency: 'monthly',
    },
    {
      id: 'metric_acoe_002',
      name: '価値実現までの時間',
      description: 'アイデアから価値提供までのリードタイム',
      category: 'value',
      measurementMethod: '価値実現日 - アイデア着想日の平均',
      targetValue: '30%短縮以上',
      frequency: 'quarterly',
    },
    {
      id: 'metric_acoe_003',
      name: 'チーム成熟度スコア',
      description: 'アジャイル実践に関するチームの成熟度',
      category: 'quality',
      measurementMethod: 'アジャイル成熟度評価フレームワーク',
      targetValue: 'レベル4（管理された）以上',
      frequency: 'quarterly',
    },
  ],

  tools: [
    {
      id: 'tool_acoe_001',
      name: 'アジャイル成熟度評価ツール',
      description: 'チームとプロダクトのアジャイル成熟度を評価するツール',
      type: 'tool',
      category: 'assessment',
      usageScenario: ['チーム評価', '改善計画策定'],
    },
    {
      id: 'tool_acoe_002',
      name: '価値ストリームマッピング・テンプレート',
      description: '価値の流れを可視化し、ムダを特定するテンプレート',
      type: 'template',
      category: 'value_stream',
      usageScenario: ['プロセス改善', '価値最適化'],
    },
    {
      id: 'tool_acoe_003',
      name: 'チーム・ヘルスチェック・キット',
      description: 'チームの健全性を定期的にチェックするツールセット',
      type: 'tool',
      category: 'team_health',
      usageScenario: ['定期振り返り', '課題特定'],
    },
  ],

  organizationalImpact: {
    cultural: ['アジャイル・マインドセットの浸透', '実験と学習の文化', '顧客価値中心の思考'],
    structural: ['フラットな組織構造', 'クロスファンクショナル・チーム', '権限の現場への委譲'],
    operational: ['短いフィードバック・ループ', '継続的デリバリー', 'データドリブンな意思決定'],
  },

  implementationGuidelines: {
    prerequisites: [
      'アジャイル変革への組織コミット',
      '経験豊富なアジャイル・コーチ',
      'パイロット・チームの選定',
      '基本的なアジャイル・ツール環境',
    ],
    phases: [
      'フェーズ1: ACoE設立とパイロット開始（3-4ヶ月）',
      'フェーズ2: コーチング・プログラム展開（6-9ヶ月）',
      'フェーズ3: 組織全体への拡大（9-12ヶ月）',
      'フェーズ4: 継続的改善と文化定着（継続）',
    ],
    timeline: '12-18ヶ月',
    resources: [
      'ACoE リード（1名）',
      'シニア・アジャイル・コーチ（3-4名）',
      'プロダクト・コーチ（2-3名）',
      'チェンジ・マネジメント・スペシャリスト（1-2名）',
    ],
    risks: [
      '伝統的管理層からの抵抗',
      'アジャイル理解の不足',
      '短期的な生産性低下',
      '文化変革の遅れ',
    ],
    mitigationStrategies: [
      'エグゼクティブ・レベルの教育',
      'スモール・ウィンの創出と共有',
      '段階的なスケーリング',
      '継続的なコミュニケーション',
    ],
  },
}

/**
 * ACoE特有の機能・能力
 */
const acoeCapabilities = {
  agileFrameworks: [
    'Scrum',
    'Kanban',
    'Scaled Agile Framework (SAFe)',
    'Large-Scale Scrum (LeSS)',
    'Disciplined Agile Delivery (DAD)',
    'Spotify Model',
  ],

  coachingAreas: [
    'チーム・ダイナミクス',
    'プロダクト・マネジメント',
    'テクニカル・プラクティス',
    'アジャイル・リーダーシップ',
    '組織設計',
    'ステークホルダー・エンゲージメント',
  ],

  trainingPrograms: [
    'アジャイル基礎トレーニング',
    'スクラムマスター認定コース',
    'プロダクトオーナー・ワークショップ',
    'アジャイル・リーダーシップ・プログラム',
    'テクニカル・アジリティ・ブートキャンプ',
  ],

  communityBuilding: [
    'アジャイル・ギルドの運営',
    'イノベーション・チャレンジ',
    'ナレッジ・シェアリング・セッション',
    'アジャイル・カンファレンス開催',
    'メンタリング・プログラム',
  ],

  transformationSupport: [
    'アジャイル・アセスメント',
    '変革ロードマップ策定',
    'パイロット・プロジェクト支援',
    '組織構造の再設計',
    'ツール・インフラ構築',
  ],

  valueRealizationMethods: [
    'OKR（Objectives and Key Results）',
    'リーン・スタートアップ',
    'Design Thinking',
    'Business Model Canvas',
    'Impact Mapping',
    'Real Options',
  ],
}

/**
 * PMOタイプ比較マトリクス
 */
const pmoComparisonMatrix = [
  {
    criteria: '管理レベル',
    supportive: '最小限（推奨レベル）',
    controlling: '中程度（監視レベル）',
    directive: '最大限（指揮レベル）',
    acoe: '最小限（支援レベル）',
  },
  {
    criteria: 'PM自律性',
    supportive: '非常に高い',
    controlling: '中程度',
    directive: '低い',
    acoe: '非常に高い',
  },
  {
    criteria: '標準化レベル',
    supportive: '推奨（任意）',
    controlling: '必須（監査あり）',
    directive: '強制（厳格）',
    acoe: 'プラクティス（原則重視）',
  },
  {
    criteria: '組織への影響',
    supportive: '最小限',
    controlling: '中程度',
    directive: '大きい',
    acoe: '変革的',
  },
  {
    criteria: 'コスト',
    supportive: '低い',
    controlling: '中程度',
    directive: '高い',
    acoe: '中程度',
  },
  {
    criteria: '実装期間',
    supportive: '短期（6-12ヶ月）',
    controlling: '中期（12-18ヶ月）',
    directive: '長期（18-24ヶ月）',
    acoe: '中期（12-18ヶ月）',
  },
  {
    criteria: '適用組織',
    supportive: '成熟組織',
    controlling: '中程度成熟度',
    directive: '大規模・複雑',
    acoe: 'アジャイル志向',
  },
]

/**
 * PMO成熟度モデル
 */
const pmoMaturityLevels = [
  {
    level: 1,
    name: '初期レベル（Initial）',
    description: 'プロジェクトマネジメントは場当たり的で、成功は個人の能力に依存',
    characteristics: [
      '非公式なプロジェクト管理',
      '標準プロセスの不在',
      '成功は偶然に依存',
      '高いプロジェクト失敗率',
    ],
    capabilities: ['基本的なプロジェクト実行', '個人的な経験に基づく管理'],
    nextLevelRequirements: ['基本的なPM標準の策定', 'PMOの設立検討', 'PM教育の開始'],
  },
  {
    level: 2,
    name: '反復可能レベル（Repeatable）',
    description: '基本的なプロジェクト管理プロセスが確立され、成功プロジェクトの再現が可能',
    characteristics: [
      '基本的なPMプロセス',
      'プロジェクト計画の標準化',
      '進捗監視の仕組み',
      '支援型PMOの存在',
    ],
    capabilities: ['標準的なプロジェクト計画', '基本的な監視・制御', 'テンプレート・ツールの活用'],
    nextLevelRequirements: ['プロセスの文書化', '監査機能の追加', 'PM能力の向上'],
  },
  {
    level: 3,
    name: '定義レベル（Defined）',
    description: '組織標準のプロジェクト管理プロセスが定義され、一貫して適用される',
    characteristics: [
      '標準PMプロセス',
      '品質基準の確立',
      'コントロール型PMO',
      '監査・評価システム',
    ],
    capabilities: ['統合プロジェクト管理', '品質保証システム', 'リスク管理の標準化'],
    nextLevelRequirements: ['メトリクス収集の開始', 'プロセス改善の制度化', '組織的な学習機能'],
  },
  {
    level: 4,
    name: '管理レベル（Managed）',
    description: 'プロジェクトパフォーマンスが測定され、データに基づく管理が行われる',
    characteristics: [
      '定量的プロセス管理',
      'パフォーマンス測定',
      '指令型PMOの機能',
      'ポートフォリオ管理',
    ],
    capabilities: ['データドリブンな意思決定', 'リソース最適化', '予測可能なプロジェクト成果'],
    nextLevelRequirements: ['継続的改善の文化', 'イノベーション促進', 'アジャイル能力の獲得'],
  },
  {
    level: 5,
    name: '最適化レベル（Optimizing）',
    description: '継続的な改善により、プロジェクト管理能力が常に最適化される',
    characteristics: [
      '継続的プロセス改善',
      'イノベーションの推進',
      'ACoE的な機能',
      '価値実現の最大化',
    ],
    capabilities: ['自己適応する組織', '価値中心の思考', '変化への俊敏な対応'],
    nextLevelRequirements: ['継続的な卓越性の追求', '業界リーダーシップ', '新たなパラダイムの創造'],
  },
]

/**
 * PMOと他の組織機能との関係
 */
const organizationalRelationships = [
  {
    entity: 'CEO/経営陣',
    relationshipType: 'reports_to',
    description: 'PMOは経営戦略の実行を支援し、定期的に成果を報告する',
    interactions: [
      '戦略的方向性の確認',
      'ポートフォリオレビュー',
      '投資意思決定支援',
      'リスクエスカレーション',
    ],
  },
  {
    entity: '事業部門',
    relationshipType: 'supports',
    description: '各事業部門のプロジェクト実行を支援し、成果実現を促進する',
    interactions: [
      'プロジェクト計画支援',
      'リソース調整',
      'ベストプラクティス共有',
      '能力開発支援',
    ],
  },
  {
    entity: 'IT部門',
    relationshipType: 'collaborates_with',
    description: 'PMツール・システムの開発・運用で協力し、技術的支援を受ける',
    interactions: ['PMツール開発', 'データ統合', 'システム運用支援', '技術標準策定'],
  },
  {
    entity: '人事部門',
    relationshipType: 'collaborates_with',
    description: 'PM人材の採用・育成・評価で協力し、組織能力を向上させる',
    interactions: ['PM採用支援', '能力評価基準策定', 'キャリア開発計画', '研修プログラム企画'],
  },
  {
    entity: '品質保証部門',
    relationshipType: 'collaborates_with',
    description: 'プロジェクト品質基準の策定と監査で協力する',
    interactions: ['品質基準策定', '監査計画立案', '品質改善活動', 'プロセス改善'],
  },
  {
    entity: 'リスク管理部門',
    relationshipType: 'collaborates_with',
    description: 'プロジェクトリスクの評価・管理で協力し、組織リスクを軽減する',
    interactions: ['リスク評価手法', 'リスク監視システム', 'エスカレーション手順', 'リスク報告'],
  },
]

/**
 * PMOデータの統合
 */
export const pmoData = {
  pmoTypes: [supportivePMO, controllingPMO, directivePMO, agileCoE],
  acoeCapabilities,
  comparisonMatrix: pmoComparisonMatrix,
  maturityModel: pmoMaturityLevels,
  organizationalRelationships,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2025-09-20',
    source: 'PMBOK第7版、アジャイル実践ガイド',
    compliance: ['PMBOK 7th Edition', 'Agile Practice Guide', 'SAFe Framework'],
  },
}

/**
 * PMOタイプ選択支援関数
 */
export function recommendPMOType(assessment) {
  const { organizationSize, projectComplexity, organizationalMaturity, industryType } = assessment

  // 推奨ロジック
  if (organizationalMaturity === 'initial' || organizationalMaturity === 'developing') {
    return {
      recommendedPMOType: PMOType.SUPPORTIVE,
      reasoning: [
        '組織成熟度が低いため、まず支援機能から開始',
        'PM の自律性を維持しながら能力向上を図る',
        '段階的なアプローチが適切',
      ],
      implementationRoadmap: [
        '1. 支援型PMO設立（6-12ヶ月）',
        '2. 基本的なPMプロセス確立',
        '3. 成熟度向上後にコントロール型へ移行検討',
      ],
    }
  }

  if (projectComplexity === 'high' && organizationSize === 'large') {
    return {
      recommendedPMOType: PMOType.DIRECTIVE,
      reasoning: [
        '大規模で複雑なプロジェクト群の統制が必要',
        'リソース調整と戦略実行が重要',
        '強力なガバナンスが求められる',
      ],
      implementationRoadmap: [
        '1. 戦略・体制設計（4-6ヶ月）',
        '2. システム・プロセス構築（6-9ヶ月）',
        '3. 段階的展開と定着（12-18ヶ月）',
      ],
    }
  }

  if (industryType.includes('テクノロジー') || industryType.includes('ソフトウェア')) {
    return {
      recommendedPMOType: PMOType.ACOE,
      reasoning: [
        '変化の激しい環境での俊敏性が重要',
        '価値実現の速度が競争優位の源泉',
        'イノベーション文化の醸成が必要',
      ],
      implementationRoadmap: [
        '1. ACoE設立とパイロット開始（3-4ヶ月）',
        '2. アジャイル能力の組織展開（6-9ヶ月）',
        '3. 文化変革の定着（12-18ヶ月）',
      ],
    }
  }

  // デフォルト（中間的な選択）
  return {
    recommendedPMOType: PMOType.CONTROLLING,
    reasoning: ['標準化と自律性のバランスが適切', '段階的な管理強化が可能', '多くの組織に適用可能'],
    implementationRoadmap: [
      '1. ガバナンス体制設計（3-4ヶ月）',
      '2. 標準・監視システム構築（6-9ヶ月）',
      '3. 全面展開と継続改善（12-18ヶ月）',
    ],
  }
}

/**
 * PMOデータの取得関数
 */
export function getAllPMOTypes() {
  return pmoData.pmoTypes
}

export function getPMOTypeById(type) {
  return pmoData.pmoTypes.find((pmo) => pmo.type === type)
}

export function getPMOComparison() {
  return pmoData.comparisonMatrix
}

export function getPMOMaturityModel() {
  return pmoData.maturityModel
}

export function getACoECapabilities() {
  return pmoData.acoeCapabilities
}

export default pmoData
