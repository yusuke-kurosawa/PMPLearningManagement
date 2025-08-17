/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */
// 12のプロジェクトマネジメント原則
export const pmbok7Principles = [
  {
    id: 'stewardship',
    name: 'スチュワードシップ (Stewardship)',
    description: '誠実で、思いやりがあり、責任感のあるスチュワードであること',
    details:
      'プロジェクトマネジャーは、組織の価値と倫理を守り、プロジェクトの成果物、資源、環境に対して責任を持って行動する必要があります。',
    keyActions: [
      '倫理的な意思決定',
      '持続可能性への配慮',
      'ステークホルダーへの説明責任',
      '資源の効率的な使用',
    ],
  },
  {
    id: 'team',
    name: 'チーム (Team)',
    description: '協力的なプロジェクトチーム環境を構築すること',
    details:
      'チームメンバーの多様性を尊重し、共通の目標に向けて協力し、個々の強みを活かすチーム文化を醸成します。',
    keyActions: [
      'チームの目的と価値の共有',
      '心理的安全性の確保',
      '多様性とインクルージョンの促進',
      'チーム学習の推進',
    ],
  },
  {
    id: 'stakeholders',
    name: 'ステークホルダー (Stakeholders)',
    description: 'ステークホルダーと効果的に関わること',
    details:
      'プロジェクトの成功には、すべてのステークホルダーとの継続的な関与と期待値の調整が不可欠です。',
    keyActions: [
      'ステークホルダーの特定と分析',
      '継続的なコミュニケーション',
      '期待値管理',
      '関係性の構築と維持',
    ],
  },
  {
    id: 'value',
    name: '価値 (Value)',
    description: '価値に焦点を当てること',
    details: 'プロジェクトの全活動は、ステークホルダーに価値を提供することに向けられるべきです。',
    keyActions: [
      '価値の定義と測定',
      '継続的な価値の提供',
      '成果とアウトカムの重視',
      '価値実現の最適化',
    ],
  },
  {
    id: 'systemsThinking',
    name: 'システム思考 (Systems Thinking)',
    description: 'システムの相互作用を認識し、評価し、対応すること',
    details: 'プロジェクトを取り巻く環境全体を俯瞰し、相互依存関係を理解して意思決定を行います。',
    keyActions: [
      '全体最適の追求',
      '相互依存関係の理解',
      'フィードバックループの活用',
      '創発的な行動への対応',
    ],
  },
  {
    id: 'leadership',
    name: 'リーダーシップ (Leadership)',
    description: 'リーダーシップ行動を示すこと',
    details:
      'プロジェクトマネジャーは、ビジョンを示し、チームを導き、変化を促進するリーダーシップを発揮します。',
    keyActions: ['ビジョンの共有', 'モチベーションの向上', '障害の除去', 'エンパワーメント'],
  },
  {
    id: 'tailoring',
    name: 'テーラリング (Tailoring)',
    description: 'コンテキストに基づいてアプローチをテーラリングすること',
    details:
      'プロジェクトの特性に応じて、最適なアプローチ、方法論、プラクティスを選択・調整します。',
    keyActions: ['コンテキストの分析', '適切な手法の選択', '継続的な調整', '学習と改善'],
  },
  {
    id: 'quality',
    name: '品質 (Quality)',
    description: 'プロセスと成果物に品質を組み込むこと',
    details: '品質は後から追加するものではなく、最初から組み込まれるべきものです。',
    keyActions: ['品質基準の定義', '継続的な品質保証', '予防的アプローチ', '顧客満足の追求'],
  },
  {
    id: 'complexity',
    name: '複雑性 (Complexity)',
    description: '複雑性をナビゲートすること',
    details: 'プロジェクトの複雑性を認識し、適応的なアプローチで対応します。',
    keyActions: ['複雑性の要因の特定', '適応的な対応', '創発への対処', '不確実性の管理'],
  },
  {
    id: 'risk',
    name: 'リスク (Risk)',
    description: 'リスク対応を最適化すること',
    details: 'リスクと機会の両方に注目し、プロアクティブに管理します。',
    keyActions: [
      'リスクと機会の特定',
      'リスク選好度の理解',
      'プロアクティブな対応',
      '継続的なモニタリング',
    ],
  },
  {
    id: 'adaptability',
    name: '適応性と回復力 (Adaptability and Resilience)',
    description: '適応性と回復力を受け入れること',
    details: '変化に柔軟に対応し、困難から素早く回復する能力を構築します。',
    keyActions: ['変化への迅速な対応', '学習文化の醸成', '回復力の構築', '継続的改善'],
  },
  {
    id: 'change',
    name: '変革 (Change)',
    description: '望ましい将来の状態を達成するために変革を可能にすること',
    details: '変革を通じて組織とステークホルダーに価値を提供します。',
    keyActions: ['変革ビジョンの策定', '抵抗への対処', '段階的な実装', '成果の持続化'],
  },
]

// 8つのパフォーマンスドメイン
export const pmbok7PerformanceDomains = [
  {
    id: 'stakeholder',
    name: 'ステークホルダー・パフォーマンス・ドメイン',
    description: 'ステークホルダーとの効果的な関係構築と維持',
    focusAreas: [
      'ステークホルダーの特定と分析',
      'ステークホルダー・エンゲージメント',
      'ステークホルダーとのコミュニケーション',
      'ステークホルダーの期待値管理',
    ],
    outcomes: ['生産的な作業関係', 'ステークホルダーの合意', 'プロジェクトへの有益な貢献'],
    interactions: ['team', 'planning', 'uncertainty'],
  },
  {
    id: 'team',
    name: 'チーム・パフォーマンス・ドメイン',
    description: '高パフォーマンスなプロジェクトチームの構築と管理',
    focusAreas: [
      'チーム文化',
      'ハイパフォーミング・チーム',
      'リーダーシップ・スキル',
      'チームの多様性とインクルージョン',
    ],
    outcomes: ['共有されたオーナーシップ', '高パフォーマンスチーム', 'リーダーシップの実証'],
    interactions: ['stakeholder', 'development', 'delivery'],
  },
  {
    id: 'development',
    name: '開発アプローチとライフサイクル・パフォーマンス・ドメイン',
    description: '適切な開発アプローチとライフサイクルの選択と実装',
    focusAreas: [
      '開発アプローチの選択',
      'ライフサイクルとフェーズ',
      'ケイデンスとプロジェクト・ライフサイクル',
      '開発アプローチの調整',
    ],
    outcomes: ['適切な開発アプローチ', 'プロジェクトライフサイクル', '価値の継続的な提供'],
    interactions: ['planning', 'delivery', 'uncertainty'],
  },
  {
    id: 'planning',
    name: '計画パフォーマンス・ドメイン',
    description: '効果的なプロジェクト計画の策定と維持',
    focusAreas: [
      '計画の変数',
      '見積もり',
      'スケジュール',
      '予算',
      '価値の提供',
      '情報とコミュニケーション',
    ],
    outcomes: ['プロジェクトの進行方法', '全体的な理解', '進化する情報への対応'],
    interactions: ['development', 'work', 'measurement'],
  },
  {
    id: 'work',
    name: 'プロジェクト作業パフォーマンス・ドメイン',
    description: 'プロジェクト作業の効率的な管理と実行',
    focusAreas: ['作業の管理', '物理的資源の維持', '調達', '学習の監視', '変更への適応'],
    outcomes: [
      '効率的な作業プロセス',
      '適切な物理的資源',
      '管理された調達',
      '学習と改善',
      '変更への適応',
    ],
    interactions: ['planning', 'delivery', 'team'],
  },
  {
    id: 'delivery',
    name: 'デリバリー・パフォーマンス・ドメイン',
    description: '価値の提供と成果の実現',
    focusAreas: ['価値の提供', '成果物', '品質', 'コスト', '変更'],
    outcomes: ['プロジェクトの成果物', '要求事項の充足', '価値の実現'],
    interactions: ['development', 'work', 'measurement'],
  },
  {
    id: 'measurement',
    name: '測定パフォーマンス・ドメイン',
    description: 'プロジェクトのパフォーマンス測定と評価',
    focusAreas: ['測定の確立', '測定内容', '予測', 'パフォーマンスの評価', '改善'],
    outcomes: ['信頼できる情報', 'タイムリーな意思決定', '適切な行動と介入'],
    interactions: ['planning', 'delivery', 'uncertainty'],
  },
  {
    id: 'uncertainty',
    name: '不確実性パフォーマンス・ドメイン',
    description: '不確実性とリスクの効果的な管理',
    focusAreas: ['不確実性', '曖昧性', '複雑性', '変動性', 'リスク'],
    outcomes: ['脅威の影響最小化', '機会の最大化', 'リスク管理', '不確実性への対処'],
    interactions: ['all'],
  },
]

// 第6版と第7版のマッピング
export const pmbok6to7Mapping = {
  knowledgeAreas: {
    統合管理: ['planning', 'delivery', 'measurement'],
    スコープ管理: ['planning', 'delivery'],
    スケジュール管理: ['planning', 'work'],
    コスト管理: ['planning', 'delivery'],
    品質管理: ['delivery', 'measurement'],
    資源管理: ['team', 'work'],
    コミュニケーション管理: ['stakeholder', 'team'],
    リスク管理: ['uncertainty'],
    調達管理: ['work', 'stakeholder'],
    ステークホルダー管理: ['stakeholder'],
  },
  processGroups: {
    立上げ: ['stakeholder', 'team', 'development'],
    計画: ['planning', 'development'],
    実行: ['work', 'delivery', 'team'],
    '監視・コントロール': ['measurement', 'uncertainty'],
    終結: ['delivery', 'stakeholder'],
  },
}

// 学習パス推奨
export const learningPaths = {
  beginner: {
    name: '初心者向け',
    description: 'PMBOK第7版の基本概念から学習',
    steps: [
      { type: 'principle', ids: ['value', 'stakeholders', 'team'] },
      { type: 'domain', ids: ['stakeholder', 'team', 'planning'] },
      { type: 'principle', ids: ['leadership', 'quality'] },
      { type: 'domain', ids: ['development', 'delivery'] },
    ],
  },
  intermediate: {
    name: '中級者向け',
    description: '複雑性と不確実性への対応を重視',
    steps: [
      { type: 'principle', ids: ['complexity', 'risk', 'adaptability'] },
      { type: 'domain', ids: ['uncertainty', 'measurement'] },
      { type: 'principle', ids: ['systemsThinking', 'tailoring'] },
      { type: 'domain', ids: ['work', 'delivery'] },
    ],
  },
  advanced: {
    name: '上級者向け',
    description: '組織変革とスチュワードシップ',
    steps: [
      { type: 'principle', ids: ['stewardship', 'change'] },
      { type: 'domain', ids: ['all'] },
      { type: 'integration', description: '第6版との統合理解' },
    ],
  },
}

// バージョン情報
export const pmbokVersionInfo = {
  version6: {
    id: 'v6',
    name: 'PMBOK第6版',
    year: 2017,
    approach: 'プロセスベース',
    structure: {
      knowledgeAreas: 10,
      processes: 49,
      processGroups: 5,
    },
    focus: 'プロセスとITTO（インプット、ツールと技法、アウトプット）',
  },
  version7: {
    id: 'v7',
    name: 'PMBOK第7版',
    year: 2021,
    approach: 'プリンシプルベース',
    structure: {
      principles: 12,
      performanceDomains: 8,
    },
    focus: '価値の提供と成果の実現',
  },
}

// 移行ガイド
export const migrationGuide = {
  keyChanges: [
    {
      title: 'アプローチの変更',
      from: 'プロセス中心のアプローチ',
      to: 'プリンシプルベースのアプローチ',
      impact: '柔軟性と適応性の向上',
    },
    {
      title: '構造の変更',
      from: '知識エリアとプロセス群',
      to: '原則とパフォーマンスドメイン',
      impact: '成果重視の管理',
    },
    {
      title: '開発アプローチ',
      from: '予測型中心',
      to: '予測型、アジャイル、ハイブリッド',
      impact: 'プロジェクトに最適なアプローチの選択',
    },
  ],
  transitionSteps: [
    '現在の知識の棚卸し',
    '原則の理解と内面化',
    'パフォーマンスドメインの学習',
    '実践での適用',
    '継続的な学習と改善',
  ],
}
