/**
 * OPM (Organization Project Management) Framework Data
 * 組織のプロジェクトマネジメント・フレームワークデータ
 *
 * PMBOKガイド第6版・第7版に基づく包括的なOPMデータセット
 */

export const opmFramework = {
  definition: {
    title: 'OPM価値実現システム',
    description:
      'プロジェクト、プログラム、ポートフォリオ、定常業務のマネジメントを調整し、組織の戦略を実行するためのフレームワーク',
    purpose: '組織戦略の効果的な実行と価値の最大化',
    scope: '組織全体のプロジェクト関連活動の統合管理',
  },

  hierarchy: {
    portfolio: {
      id: 'portfolio',
      name: 'ポートフォリオマネジメント',
      level: 1,
      definition:
        '戦略目標達成のために実施するプロジェクト、プログラム、サブポートフォリオ、定常業務の集合',
      primaryFocus: '事業戦略への準拠',
      keyCharacteristics: [
        '戦略的方向性の確保',
        '投資の最適化',
        'リスクとリターンのバランス',
        'リソースの効率的配分',
        'ガバナンスの確立',
      ],
      responsibilities: [
        '戦略と投資の整合性確保',
        'ポートフォリオの優先順位付け',
        'リソース配分の最適化',
        'パフォーマンス監視',
        'ガバナンス体制の構築',
      ],
      deliverables: [
        'ポートフォリオ戦略計画',
        '投資優先順位マトリックス',
        'リソース配分計画',
        'ガバナンス文書',
        'パフォーマンスレポート',
      ],
      metrics: [
        'ROI（投資利益率）',
        'NPV（正味現在価値）',
        '戦略目標達成率',
        'リソース活用率',
        'ポートフォリオバランス',
      ],
    },

    program: {
      id: 'program',
      name: 'プログラムマネジメント',
      level: 2,
      definition:
        '個別プロジェクトでは実現できないベネフィットを得るために関連する複数プロジェクトやその他の活動を調整して実施すること',
      primaryFocus: 'ベネフィット実現に必要な要素とその相互関係のコントロール',
      keyCharacteristics: [
        '相乗効果の創出',
        '統合されたベネフィット管理',
        'プロジェクト間の依存関係管理',
        '共通リソースの効率活用',
        '一貫したガバナンス',
      ],
      responsibilities: [
        'ベネフィット実現の監督',
        'プロジェクト間の調整',
        '依存関係の管理',
        '共有リソースの最適化',
        '統合されたリスク管理',
      ],
      deliverables: [
        'プログラム憲章',
        'ベネフィット実現計画',
        'プログラムロードマップ',
        '統合マスタースケジュール',
        'ベネフィット実現レポート',
      ],
      metrics: [
        'ベネフィット実現率',
        'プログラム効率性',
        '相乗効果指標',
        '統合スケジュール達成率',
        '共有リソース活用率',
      ],
    },

    project: {
      id: 'project',
      name: 'プロジェクトマネジメント',
      level: 3,
      definition: 'ポートフォリオやプログラムの一部となる取組み。組織の目的や目標を実現する',
      primaryFocus: '特定の成果物やサービスの創出',
      keyCharacteristics: [
        '一時的な取り組み',
        '独自の成果物創出',
        '段階的詳細化',
        '制約下での実行',
        'ステークホルダー管理',
      ],
      responsibilities: [
        'プロジェクト目標の達成',
        'スコープ、スケジュール、コストの管理',
        '品質保証',
        'リスク管理',
        'ステークホルダー満足',
      ],
      deliverables: [
        'プロジェクト憲章',
        'プロジェクト管理計画書',
        '成果物',
        'プロジェクトレポート',
        '終了文書',
      ],
      metrics: [
        'スケジュール達成率',
        '予算達成率',
        '品質指標',
        'ステークホルダー満足度',
        'リスク対応効果',
      ],
    },
  },

  relationships: {
    strategic_alignment: {
      description: '戦略的整合性',
      flow: ['組織戦略', 'ポートフォリオ戦略', 'プログラム目標', 'プロジェクト目標'],
      mechanisms: ['戦略的目標のカスケード', 'KPIの階層化', 'ガバナンス体制', 'レビューゲート'],
    },
    value_flow: {
      description: '価値の流れ',
      direction: 'bottom-up',
      flow: ['プロジェクト成果物', 'プログラムベネフィット', 'ポートフォリオ価値', '組織戦略実現'],
      enablers: ['ベネフィット管理', '価値測定', '実現化プロセス', '継続的改善'],
    },
    resource_allocation: {
      description: 'リソース配分',
      direction: 'top-down',
      flow: ['組織リソース', 'ポートフォリオ配分', 'プログラム割当', 'プロジェクト活用'],
      principles: ['戦略的優先順位', '効率的活用', '能力ベース配分', '動的再配分'],
    },
  },
}

export const organizationalStructureTypes = {
  functional: {
    id: 'functional',
    name: '機能型組織',
    description: '機能別部門が独立して運営される伝統的な組織構造',
    teamMemberLoyalty: {
      primary: '機能部門',
      description: 'メンバーは所属する機能部門に対して忠誠心を持つ',
    },
    teamMemberReporting: {
      reportsTo: '機能部門マネジャー',
      description: 'メンバーは機能部門のマネジャーに報告する',
    },
    pmRole: {
      existence: '限定的',
      description: 'PMの役割は存在しないか、非常に限定的',
      authority: 'なし',
      responsibility: 'コーディネーション程度',
    },
    teamMemberRole: {
      projectInvolvement: '兼任',
      description: 'プロジェクト作業は通常業務と兼任で実施',
      timeAllocation: '部分的',
    },
    pmAuthority: {
      level: 'なし',
      score: 0,
      description: '機能部門が権限を持ち、PMに権限はない',
      decisionMaking: '機能部門マネジャー',
    },
    advantages: ['専門性の深化', '効率的なリソース活用', '明確な報告ライン', '安定した組織運営'],
    disadvantages: [
      '部門間調整の困難',
      'プロジェクト優先度の低下',
      'イノベーションの阻害',
      '顧客対応の分散',
    ],
    bestSuitedFor: ['定型的な業務が中心', '専門性が重要', '安定した環境', '継続的な改善が主眼'],
  },

  matrix: {
    id: 'matrix',
    name: 'マトリックス型組織',
    description: '機能部門とプロジェクトの両方の報告ラインを持つハイブリッド構造',
    teamMemberLoyalty: {
      primary: '両方',
      description: '機能部門とプロジェクトの両方に対して忠誠心を分散',
    },
    teamMemberReporting: {
      reportsTo: '両方',
      description: '機能部門マネジャーとプロジェクトマネジャーの両方に報告',
    },
    pmRole: {
      existence: '専任',
      description: '専任PMが調整役として機能',
      authority: '中程度',
      responsibility: 'プロジェクト調整と管理',
    },
    teamMemberRole: {
      projectInvolvement: '兼任',
      description: 'プロジェクト作業と機能部門業務を兼任',
      timeAllocation: '分割',
    },
    pmAuthority: {
      level: '中',
      score: 3,
      description: '機能部門マネジャーと権限を分担',
      decisionMaking: '共同決定',
    },
    types: {
      weak: {
        name: '弱いマトリックス',
        pmAuthority: '低',
        functionalManagerAuthority: '高',
        description: '機能部門の影響力が強い',
      },
      balanced: {
        name: 'バランス型マトリックス',
        pmAuthority: '中',
        functionalManagerAuthority: '中',
        description: '権限のバランスが取れている',
      },
      strong: {
        name: '強いマトリックス',
        pmAuthority: '高',
        functionalManagerAuthority: '低',
        description: 'PMの影響力が強い',
      },
    },
    advantages: [
      '柔軟なリソース活用',
      '専門性とプロジェクト効率の両立',
      '情報共有の促進',
      'スキル開発機会の増加',
    ],
    disadvantages: ['複雑な報告関係', '権限の曖昧さ', 'コンフリクトの発生', '管理コストの増加'],
    bestSuitedFor: [
      '複数プロジェクトの並行実行',
      '専門スキルの共有が必要',
      '中規模から大規模組織',
      '変化への対応が重要',
    ],
  },

  projectized: {
    id: 'projectized',
    name: 'プロジェクト型組織',
    description: 'プロジェクトを中心とした組織構造で、PMが強い権限を持つ',
    teamMemberLoyalty: {
      primary: 'プロジェクト',
      description: 'メンバーは担当プロジェクトに対して忠誠心を持つ',
    },
    teamMemberReporting: {
      reportsTo: 'プロジェクトマネジャー',
      description: 'メンバーはプロジェクトマネジャーに直接報告',
    },
    pmRole: {
      existence: '専任',
      description: '専任PMとして完全に従事',
      authority: '高',
      responsibility: 'プロジェクト全体の責任',
    },
    teamMemberRole: {
      projectInvolvement: '専任',
      description: 'プロジェクトに専任で従事（推奨）',
      timeAllocation: 'フルタイム',
    },
    pmAuthority: {
      level: '高',
      score: 5,
      description: 'PMが強い権限を持ち、意思決定を主導',
      decisionMaking: 'プロジェクトマネジャー',
    },
    advantages: ['明確な責任と権限', '迅速な意思決定', '高いプロジェクト効率', '強いチーム結束'],
    disadvantages: [
      'リソースの重複',
      '専門性の分散',
      'プロジェクト終了後の配置問題',
      '組織全体の非効率',
    ],
    bestSuitedFor: [
      '大規模で重要なプロジェクト',
      '短期集中型の取り組み',
      '革新的なプロジェクト',
      '外部顧客向けプロジェクト',
    ],
  },
}

export const structureComparison = {
  comparisonMatrix: [
    {
      criteria: 'チーム・メンバーの忠誠心',
      functional: '機能部門',
      matrix: '両方',
      projectized: 'プロジェクト',
    },
    {
      criteria: 'チーム・メンバーの上司',
      functional: '機能部門マネジャー',
      matrix: '両方',
      projectized: 'プロジェクト・マネジャー',
    },
    {
      criteria: 'PMの役割',
      functional: 'まずPMにはならない',
      matrix: '専任PMの調整役',
      projectized: '専任PMとして従事',
    },
    {
      criteria: 'チーム・メンバーの役割',
      functional: 'プロジェクトを兼任',
      matrix: 'プロジェクトを兼任',
      projectized: 'プロジェクトを専任（が望ましい）',
    },
    {
      criteria: 'PMの権限',
      functional: 'なし（機能部門が権限を持つ）',
      matrix: '中（機能部門マネジャーと折半）',
      projectized: '高',
    },
  ],

  authorityScale: {
    functional: 0,
    weakMatrix: 1,
    balancedMatrix: 3,
    strongMatrix: 4,
    projectized: 5,
  },

  selectionCriteria: {
    projectComplexity: {
      low: 'functional',
      medium: 'matrix',
      high: 'projectized',
    },
    projectDuration: {
      short: 'matrix',
      medium: 'matrix',
      long: 'projectized',
    },
    resourceAvailability: {
      limited: 'functional',
      shared: 'matrix',
      dedicated: 'projectized',
    },
    strategicImportance: {
      routine: 'functional',
      important: 'matrix',
      critical: 'projectized',
    },
  },
}

export const opmBenefits = {
  organizational: [
    '戦略的整合性の向上',
    'リソース活用の最適化',
    '組織能力の向上',
    '変化への適応力強化',
  ],
  financial: ['投資収益率の改善', 'コスト効率の向上', 'リスク管理の強化', '価値実現の加速'],
  operational: ['プロセスの標準化', 'ベストプラクティスの共有', '品質の向上', '納期遵守の改善'],
  strategic: ['競争優位性の確立', 'イノベーションの促進', '市場対応力の向上', '持続可能な成長'],
}

export const implementationRoadmap = {
  phase1: {
    name: '基盤構築',
    duration: '3-6ヶ月',
    focus: 'ガバナンスとプロセスの確立',
    activities: [
      'PMOの設立',
      '標準プロセスの定義',
      'ツールとテンプレートの整備',
      '初期トレーニングの実施',
    ],
  },
  phase2: {
    name: '展開',
    duration: '6-12ヶ月',
    focus: '組織全体への適用拡大',
    activities: [
      'パイロットプロジェクトの実施',
      'フィードバック収集と改善',
      '組織変革管理',
      '継続的トレーニング',
    ],
  },
  phase3: {
    name: '成熟化',
    duration: '12-24ヶ月',
    focus: '継続的改善と最適化',
    activities: [
      'メトリクスによる効果測定',
      'ベストプラクティスの確立',
      '組織文化の定着',
      '価値実現の最大化',
    ],
  },
}

// データの統合エクスポート
export const opmCompleteData = {
  framework: opmFramework,
  organizationTypes: organizationalStructureTypes,
  comparison: structureComparison,
  benefits: opmBenefits,
  implementation: implementationRoadmap,
}

export default opmCompleteData
