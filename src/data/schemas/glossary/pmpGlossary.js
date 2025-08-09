// PMP用語集データ
export const glossaryCategories = [
  { id: 'general', name: '一般', color: 'bg-gray-500' },
  { id: 'scope', name: 'スコープ', color: 'bg-blue-500' },
  { id: 'schedule', name: 'スケジュール', color: 'bg-cyan-500' },
  { id: 'cost', name: 'コスト', color: 'bg-green-500' },
  { id: 'quality', name: '品質', color: 'bg-yellow-500' },
  { id: 'resource', name: '資源', color: 'bg-orange-500' },
  { id: 'communication', name: 'コミュニケーション', color: 'bg-pink-500' },
  { id: 'risk', name: 'リスク', color: 'bg-red-500' },
  { id: 'procurement', name: '調達', color: 'bg-purple-500' },
  { id: 'stakeholder', name: 'ステークホルダー', color: 'bg-indigo-500' },
  { id: 'integration', name: '統合', color: 'bg-violet-500' },
  { id: 'agile', name: 'アジャイル', color: 'bg-teal-500' }
];

export const glossaryTerms = [
  // 一般用語
  {
    id: 1,
    term: 'Project',
    japanese: 'プロジェクト',
    description: '独自のプロダクト、サービス、所産を創造するために実施する、有期性のある業務',
    categories: ['general'],
    relatedTerms: ['Program', 'Portfolio']
  },
  {
    id: 2,
    term: 'Project Management',
    japanese: 'プロジェクトマネジメント',
    description: 'プロジェクトの要求事項を満たすために、知識、スキル、ツール、および技法をプロジェクト活動へ適用すること',
    categories: ['general'],
    relatedTerms: ['PMBOK', 'Project Manager']
  },
  {
    id: 3,
    term: 'PMBOK',
    japanese: 'プロジェクトマネジメント知識体系',
    description: 'Project Management Body of Knowledgeの略。PMIが定めたプロジェクトマネジメントの標準的な知識体系',
    categories: ['general'],
    relatedTerms: ['PMI', 'Process Group']
  },
  
  // スコープ関連
  {
    id: 4,
    term: 'Scope',
    japanese: 'スコープ',
    description: 'プロジェクトで提供されるプロダクト、サービス、所産の総和、およびそれらを提供するために必要な作業',
    categories: ['scope'],
    relatedTerms: ['Product Scope', 'Project Scope']
  },
  {
    id: 5,
    term: 'WBS (Work Breakdown Structure)',
    japanese: '作業分解構造',
    description: 'プロジェクトチームが実行する作業を成果物指向で階層的に分解したもの',
    categories: ['scope'],
    relatedTerms: ['WBS Dictionary', 'Work Package']
  },
  {
    id: 6,
    term: 'Scope Creep',
    japanese: 'スコープ・クリープ',
    description: '承認されていないプロジェクト・スコープの拡大',
    categories: ['scope', 'risk'],
    relatedTerms: ['Gold Plating', 'Change Control']
  },
  
  // スケジュール関連
  {
    id: 7,
    term: 'Critical Path',
    japanese: 'クリティカル・パス',
    description: 'プロジェクト内で最長のアクティビティ順序経路。プロジェクトの最短完了期間を決定する',
    categories: ['schedule'],
    relatedTerms: ['Float', 'Critical Path Method']
  },
  {
    id: 8,
    term: 'Float',
    japanese: 'フロート',
    description: 'アクティビティを遅らせることができる時間の長さ。プロジェクトの完了日に影響を与えない範囲',
    categories: ['schedule'],
    relatedTerms: ['Free Float', 'Total Float']
  },
  {
    id: 9,
    term: 'Milestone',
    japanese: 'マイルストーン',
    description: 'プロジェクトやフェーズ内の重要な時点やイベント',
    categories: ['schedule'],
    relatedTerms: ['Schedule', 'Baseline']
  },
  
  // コスト関連
  {
    id: 10,
    term: 'Earned Value (EV)',
    japanese: 'アーンド・バリュー',
    description: '実施済み作業の価値を承認済み予算で表したもの',
    categories: ['cost'],
    relatedTerms: ['PV', 'AC', 'EVM']
  },
  {
    id: 11,
    term: 'Cost Performance Index (CPI)',
    japanese: 'コスト効率指数',
    description: 'アーンド・バリュー（EV）を実コスト（AC）で割った値。コスト効率の尺度',
    categories: ['cost'],
    relatedTerms: ['SPI', 'EVM', 'Cost Variance']
  },
  {
    id: 12,
    term: 'Budget at Completion (BAC)',
    japanese: '完成時総予算',
    description: 'プロジェクト全体の承認済み予算の総額',
    categories: ['cost'],
    relatedTerms: ['EAC', 'ETC', 'Variance']
  },
  
  // 品質関連
  {
    id: 13,
    term: 'Quality Assurance',
    japanese: '品質保証',
    description: '品質要求事項と品質管理測定結果の使用に焦点を当てて、適切な品質標準と運用上の定義が使用されているという確信を与えるプロセス',
    categories: ['quality'],
    relatedTerms: ['Quality Control', 'Quality Management']
  },
  {
    id: 14,
    term: 'Quality Control',
    japanese: '品質管理',
    description: 'プロジェクトの成果物やプロセスをモニタリングして記録し、パフォーマンスを評価して必要な変更を推奨するプロセス',
    categories: ['quality'],
    relatedTerms: ['Quality Assurance', 'Inspection']
  },
  {
    id: 15,
    term: 'Cost of Quality (COQ)',
    japanese: '品質コスト',
    description: 'プロダクトまたはサービスのライフサイクルにわたって品質に投資するすべてのコスト',
    categories: ['quality', 'cost'],
    relatedTerms: ['Prevention Cost', 'Appraisal Cost']
  },
  
  // リスク関連
  {
    id: 16,
    term: 'Risk',
    japanese: 'リスク',
    description: '発生した場合にプロジェクト目標にプラスまたはマイナスの影響を与える不確実な事象または状態',
    categories: ['risk'],
    relatedTerms: ['Threat', 'Opportunity', 'Risk Register']
  },
  {
    id: 17,
    term: 'Risk Register',
    japanese: 'リスク登録簿',
    description: '特定されたリスクの詳細とリスク対応計画を記録した文書',
    categories: ['risk'],
    relatedTerms: ['Risk', 'Risk Response']
  },
  {
    id: 18,
    term: 'Risk Mitigation',
    japanese: 'リスク軽減',
    description: 'リスクの発生確率や影響度を受容可能なしきい値まで低減するリスク対応戦略',
    categories: ['risk'],
    relatedTerms: ['Risk Avoidance', 'Risk Transfer']
  },
  
  // ステークホルダー関連
  {
    id: 19,
    term: 'Stakeholder',
    japanese: 'ステークホルダー',
    description: 'プロジェクトに影響を与えるか、プロジェクトから影響を受ける個人、グループ、組織',
    categories: ['stakeholder'],
    relatedTerms: ['Sponsor', 'Customer', 'Team']
  },
  {
    id: 20,
    term: 'Stakeholder Register',
    japanese: 'ステークホルダー登録簿',
    description: 'プロジェクト・ステークホルダーに関する情報を文書化したもの',
    categories: ['stakeholder'],
    relatedTerms: ['Stakeholder Analysis', 'Power/Interest Grid']
  },
  
  // アジャイル関連
  {
    id: 21,
    term: 'Sprint',
    japanese: 'スプリント',
    description: 'スクラムにおける固定期間の反復。通常2〜4週間',
    categories: ['agile'],
    relatedTerms: ['Iteration', 'Scrum', 'Sprint Planning']
  },
  {
    id: 22,
    term: 'Product Backlog',
    japanese: 'プロダクト・バックログ',
    description: '優先順位付けされた機能、要求事項、改善項目のリスト',
    categories: ['agile'],
    relatedTerms: ['Sprint Backlog', 'User Story']
  },
  {
    id: 23,
    term: 'Velocity',
    japanese: 'ベロシティ',
    description: 'チームが1スプリントで完了できる作業量の尺度',
    categories: ['agile', 'schedule'],
    relatedTerms: ['Burndown Chart', 'Story Points']
  },
  
  // 統合管理関連
  {
    id: 24,
    term: 'Project Charter',
    japanese: 'プロジェクト憲章',
    description: 'プロジェクトの存在を正式に承認し、プロジェクト・マネジャーに権限を与える文書',
    categories: ['integration'],
    relatedTerms: ['Project Management Plan', 'Business Case']
  },
  {
    id: 25,
    term: 'Change Control Board (CCB)',
    japanese: '変更管理委員会',
    description: 'プロジェクトへの変更要求をレビューし、承認、却下、延期を決定する正式なグループ',
    categories: ['integration'],
    relatedTerms: ['Change Request', 'Change Control']
  },
  {
    id: 26,
    term: 'Lessons Learned',
    japanese: '教訓',
    description: 'プロジェクトで得られた知識。将来のプロジェクトの改善に活用される',
    categories: ['integration', 'quality'],
    relatedTerms: ['Knowledge Management', 'OPA']
  },
  
  // 調達関連
  {
    id: 27,
    term: 'Statement of Work (SOW)',
    japanese: '作業範囲記述書',
    description: '調達するプロダクト、サービス、所産の詳細な説明',
    categories: ['procurement'],
    relatedTerms: ['Contract', 'RFP']
  },
  {
    id: 28,
    term: 'Request for Proposal (RFP)',
    japanese: '提案依頼書',
    description: '納入候補者に提案書の提出を求める調達文書',
    categories: ['procurement'],
    relatedTerms: ['RFQ', 'RFI', 'Bid']
  },
  
  // コミュニケーション関連
  {
    id: 29,
    term: 'Communication Management Plan',
    japanese: 'コミュニケーション・マネジメント計画書',
    description: 'プロジェクトのコミュニケーション要求事項とそれを満たす方法を記述した文書',
    categories: ['communication'],
    relatedTerms: ['Stakeholder', 'Information Distribution']
  },
  {
    id: 30,
    term: 'Pull Communication',
    japanese: 'プル型コミュニケーション',
    description: '受信者が情報にアクセスする必要があるコミュニケーション方法',
    categories: ['communication'],
    relatedTerms: ['Push Communication', 'Interactive Communication']
  },

  // ITTO関連用語
  {
    id: 31,
    term: 'Project Charter',
    japanese: 'プロジェクト憲章',
    description: 'プロジェクトの存在を正式に承認し、プロジェクト・マネジャーに組織の資源をプロジェクト活動に投入する権限を与える文書',
    categories: ['general', 'integration'],
    relatedTerms: ['Project Management Plan', 'Business Case']
  },
  {
    id: 32,
    term: 'Work Performance Data',
    japanese: '作業パフォーマンス・データ',
    description: 'プロジェクト作業を実行する中で観察・収集される生の観察結果と測定値',
    categories: ['general', 'integration'],
    relatedTerms: ['Work Performance Information', 'Work Performance Reports']
  },
  {
    id: 33,
    term: 'Work Performance Information',
    japanese: '作業パフォーマンス情報',
    description: '様々なコントロール・プロセスから収集・統合された作業パフォーマンス・データ',
    categories: ['general', 'integration'],
    relatedTerms: ['Work Performance Data', 'Work Performance Reports']
  },
  {
    id: 34,
    term: 'Work Performance Reports',
    japanese: '作業パフォーマンス報告書',
    description: '意思決定、問題提起、行動、認識を促すために配布される作業パフォーマンス情報の物理的または電子的表現',
    categories: ['general', 'integration'],
    relatedTerms: ['Work Performance Data', 'Work Performance Information']
  },
  {
    id: 35,
    term: 'Change Request',
    japanese: '変更要求',
    description: 'ベースラインとなった文書、成果物、プロジェクト計画書を修正するための正式な提案',
    categories: ['general', 'integration'],
    relatedTerms: ['Change Control', 'Approved Change Request']
  },
  {
    id: 36,
    term: 'Organizational Process Assets',
    japanese: '組織のプロセス資産',
    description: 'プロジェクトを実行する組織が保有し、プロジェクトに影響を与える可能性のある計画、プロセス、方針、手続き、知識ベース',
    categories: ['general'],
    relatedTerms: ['Enterprise Environmental Factors']
  },
  {
    id: 37,
    term: 'Enterprise Environmental Factors',
    japanese: '組織体の環境要因',
    description: 'プロジェクトに影響を与える可能性があるが、プロジェクト・チームの管理下にない内部または外部の条件',
    categories: ['general'],
    relatedTerms: ['Organizational Process Assets']
  },
  {
    id: 38,
    term: 'Expert Judgment',
    japanese: '専門家の判断',
    description: '専門教育、知識、スキル、経験、トレーニングを基に提供される判断',
    categories: ['general'],
    relatedTerms: []
  },
  {
    id: 39,
    term: 'Meetings',
    japanese: '会議',
    description: 'ステークホルダーが集まり、プロジェクトに関する議論や意思決定を行う場',
    categories: ['general', 'communication'],
    relatedTerms: []
  },
  {
    id: 40,
    term: 'Data Analysis',
    japanese: 'データ分析',
    description: 'データを収集、評価、解釈して情報を得るためのプロセス',
    categories: ['general'],
    relatedTerms: ['Data Gathering', 'Data Representation']
  },
  {
    id: 41,
    term: 'Business Documents',
    japanese: 'ビジネス文書',
    description: 'ビジネスケースやベネフィット・マネジメント計画書など、プロジェクトの根拠となる文書',
    categories: ['general', 'integration'],
    relatedTerms: ['Business Case', 'Benefits Management Plan']
  },
  {
    id: 42,
    term: 'Agreements',
    japanese: '合意書',
    description: '契約、覚書、サービスレベル合意書など、当事者間の意図を定義する文書',
    categories: ['general', 'procurement'],
    relatedTerms: ['Contract', 'SLA']
  },
  {
    id: 43,
    term: 'Project Management Plan',
    japanese: 'プロジェクトマネジメント計画書',
    description: 'プロジェクトの実行、監視・コントロール、終結の方法を記述した文書',
    categories: ['general', 'integration'],
    relatedTerms: ['Baseline', 'Subsidiary Plans']
  },
  {
    id: 44,
    term: 'Project Documents',
    japanese: 'プロジェクト文書',
    description: 'プロジェクト計画書の一部ではないが、プロジェクトの管理に使用される文書',
    categories: ['general'],
    relatedTerms: ['Issue Log', 'Risk Register', 'Stakeholder Register']
  },
  {
    id: 45,
    term: 'Deliverables',
    japanese: '成果物',
    description: 'プロジェクトやプロジェクトのフェーズを完了するために作成される、独自で検証可能なプロダクト、所産、サービス提供能力',
    categories: ['general'],
    relatedTerms: ['Work Package', 'Milestone']
  }
];

// 検索用のインデックスを作成
export const searchIndex = glossaryTerms.reduce((acc, term) => {
  const searchText = `${term.term} ${term.japanese} ${term.description}`.toLowerCase();
  acc[term.id] = searchText;
  return acc;
}, {});