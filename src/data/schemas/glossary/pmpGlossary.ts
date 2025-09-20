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
  { id: 'agile', name: 'アジャイル', color: 'bg-teal-500' },
  { id: 'organization', name: '組織', color: 'bg-amber-500' },
]

export const glossaryTerms = [
  // 一般用語
  {
    id: 1,
    term: 'Project',
    japanese: 'プロジェクト',
    description: '独自のプロダクト、サービス、所産を創造するために実施する、有期性のある業務',
    categories: ['general'],
    relatedTerms: ['Program', 'Portfolio'],
  },
  {
    id: 2,
    term: 'Project Management',
    japanese: 'プロジェクトマネジメント',
    description:
      'プロジェクトの要求事項を満たすために、知識、スキル、ツール、および技法をプロジェクト活動へ適用すること',
    categories: ['general'],
    relatedTerms: ['PMBOK', 'Project Manager'],
  },
  {
    id: 3,
    term: 'PMBOK',
    japanese: 'プロジェクトマネジメント知識体系',
    description:
      'Project Management Body of Knowledgeの略。PMIが定めたプロジェクトマネジメントの標準的な知識体系',
    categories: ['general'],
    relatedTerms: ['PMI', 'Process Group'],
  },

  // スコープ関連
  {
    id: 4,
    term: 'Scope',
    japanese: 'スコープ',
    description:
      'プロジェクトで提供されるプロダクト、サービス、所産の総和、およびそれらを提供するために必要な作業',
    categories: ['scope'],
    relatedTerms: ['Product Scope', 'Project Scope'],
  },
  {
    id: 5,
    term: 'WBS (Work Breakdown Structure)',
    japanese: '作業分解構造',
    description: 'プロジェクトチームが実行する作業を成果物指向で階層的に分解したもの',
    categories: ['scope'],
    relatedTerms: ['WBS Dictionary', 'Work Package'],
  },
  {
    id: 6,
    term: 'Scope Creep',
    japanese: 'スコープ・クリープ',
    description: '承認されていないプロジェクト・スコープの拡大',
    categories: ['scope', 'risk'],
    relatedTerms: ['Gold Plating', 'Change Control'],
  },

  // スケジュール関連
  {
    id: 7,
    term: 'Critical Path',
    japanese: 'クリティカル・パス',
    description:
      'プロジェクト内で最長のアクティビティ順序経路。プロジェクトの最短完了期間を決定する',
    categories: ['schedule'],
    relatedTerms: ['Float', 'Critical Path Method'],
  },
  {
    id: 8,
    term: 'Float',
    japanese: 'フロート',
    description:
      'アクティビティを遅らせることができる時間の長さ。プロジェクトの完了日に影響を与えない範囲',
    categories: ['schedule'],
    relatedTerms: ['Free Float', 'Total Float'],
  },
  {
    id: 9,
    term: 'Milestone',
    japanese: 'マイルストーン',
    description: 'プロジェクトやフェーズ内の重要な時点やイベント',
    categories: ['schedule'],
    relatedTerms: ['Schedule', 'Baseline'],
  },

  // コスト関連
  {
    id: 10,
    term: 'Earned Value (EV)',
    japanese: 'アーンド・バリュー',
    description: '実施済み作業の価値を承認済み予算で表したもの',
    categories: ['cost'],
    relatedTerms: ['PV', 'AC', 'EVM'],
  },
  {
    id: 11,
    term: 'Cost Performance Index (CPI)',
    japanese: 'コスト効率指数',
    description: 'アーンド・バリュー（EV）を実コスト（AC）で割った値。コスト効率の尺度',
    categories: ['cost'],
    relatedTerms: ['SPI', 'EVM', 'Cost Variance'],
  },
  {
    id: 12,
    term: 'Budget at Completion (BAC)',
    japanese: '完成時総予算',
    description: 'プロジェクト全体の承認済み予算の総額',
    categories: ['cost'],
    relatedTerms: ['EAC', 'ETC', 'Variance'],
  },

  // 品質関連
  {
    id: 13,
    term: 'Quality Assurance',
    japanese: '品質保証',
    description:
      '品質要求事項と品質管理測定結果の使用に焦点を当てて、適切な品質標準と運用上の定義が使用されているという確信を与えるプロセス',
    categories: ['quality'],
    relatedTerms: ['Quality Control', 'Quality Management'],
  },
  {
    id: 14,
    term: 'Quality Control',
    japanese: '品質管理',
    description:
      'プロジェクトの成果物やプロセスをモニタリングして記録し、パフォーマンスを評価して必要な変更を推奨するプロセス',
    categories: ['quality'],
    relatedTerms: ['Quality Assurance', 'Inspection'],
  },
  {
    id: 15,
    term: 'Cost of Quality (COQ)',
    japanese: '品質コスト',
    description: 'プロダクトまたはサービスのライフサイクルにわたって品質に投資するすべてのコスト',
    categories: ['quality', 'cost'],
    relatedTerms: ['Prevention Cost', 'Appraisal Cost'],
  },

  // リスク関連
  {
    id: 16,
    term: 'Risk',
    japanese: 'リスク',
    description:
      '発生した場合にプロジェクト目標にプラスまたはマイナスの影響を与える不確実な事象または状態',
    categories: ['risk'],
    relatedTerms: ['Threat', 'Opportunity', 'Risk Register'],
  },
  {
    id: 17,
    term: 'Risk Register',
    japanese: 'リスク登録簿',
    description: '特定されたリスクの詳細とリスク対応計画を記録した文書',
    categories: ['risk'],
    relatedTerms: ['Risk', 'Risk Response'],
  },
  {
    id: 18,
    term: 'Risk Mitigation',
    japanese: 'リスク軽減',
    description: 'リスクの発生確率や影響度を受容可能なしきい値まで低減するリスク対応戦略',
    categories: ['risk'],
    relatedTerms: ['Risk Avoidance', 'Risk Transfer'],
  },

  // ステークホルダー関連
  {
    id: 19,
    term: 'Stakeholder',
    japanese: 'ステークホルダー',
    description: 'プロジェクトに影響を与えるか、プロジェクトから影響を受ける個人、グループ、組織',
    categories: ['stakeholder'],
    relatedTerms: ['Sponsor', 'Customer', 'Team'],
  },
  {
    id: 20,
    term: 'Stakeholder Register',
    japanese: 'ステークホルダー登録簿',
    description: 'プロジェクト・ステークホルダーに関する情報を文書化したもの',
    categories: ['stakeholder'],
    relatedTerms: ['Stakeholder Analysis', 'Power/Interest Grid'],
  },

  // アジャイル関連
  {
    id: 21,
    term: 'Sprint',
    japanese: 'スプリント',
    description: 'スクラムにおける固定期間の反復。通常2〜4週間',
    categories: ['agile'],
    relatedTerms: ['Iteration', 'Scrum', 'Sprint Planning'],
  },
  {
    id: 22,
    term: 'Product Backlog',
    japanese: 'プロダクト・バックログ',
    description: '優先順位付けされた機能、要求事項、改善項目のリスト',
    categories: ['agile'],
    relatedTerms: ['Sprint Backlog', 'User Story'],
  },
  {
    id: 23,
    term: 'Velocity',
    japanese: 'ベロシティ',
    description: 'チームが1スプリントで完了できる作業量の尺度',
    categories: ['agile', 'schedule'],
    relatedTerms: ['Burndown Chart', 'Story Points'],
  },

  // 統合管理関連
  {
    id: 24,
    term: 'Project Charter',
    japanese: 'プロジェクト憲章',
    description: 'プロジェクトの存在を正式に承認し、プロジェクト・マネジャーに権限を与える文書',
    categories: ['integration'],
    relatedTerms: ['Project Management Plan', 'Business Case'],
  },
  {
    id: 25,
    term: 'Change Control Board (CCB)',
    japanese: '変更管理委員会',
    description: 'プロジェクトへの変更要求をレビューし、承認、却下、延期を決定する正式なグループ',
    categories: ['integration'],
    relatedTerms: ['Change Request', 'Change Control'],
  },
  {
    id: 26,
    term: 'Lessons Learned',
    japanese: '教訓',
    description: 'プロジェクトで得られた知識。将来のプロジェクトの改善に活用される',
    categories: ['integration', 'quality'],
    relatedTerms: ['Knowledge Management', 'OPA'],
  },

  // 調達関連
  {
    id: 27,
    term: 'Statement of Work (SOW)',
    japanese: '作業範囲記述書',
    description: '調達するプロダクト、サービス、所産の詳細な説明',
    categories: ['procurement'],
    relatedTerms: ['Contract', 'RFP'],
  },
  {
    id: 28,
    term: 'Request for Proposal (RFP)',
    japanese: '提案依頼書',
    description: '納入候補者に提案書の提出を求める調達文書',
    categories: ['procurement'],
    relatedTerms: ['RFQ', 'RFI', 'Bid'],
  },

  // コミュニケーション関連
  {
    id: 29,
    term: 'Communication Management Plan',
    japanese: 'コミュニケーション・マネジメント計画書',
    description: 'プロジェクトのコミュニケーション要求事項とそれを満たす方法を記述した文書',
    categories: ['communication'],
    relatedTerms: ['Stakeholder', 'Information Distribution'],
  },
  {
    id: 30,
    term: 'Pull Communication',
    japanese: 'プル型コミュニケーション',
    description: '受信者が情報にアクセスする必要があるコミュニケーション方法',
    categories: ['communication'],
    relatedTerms: ['Push Communication', 'Interactive Communication'],
  },

  // ITTO関連用語
  {
    id: 31,
    term: 'Project Charter',
    japanese: 'プロジェクト憲章',
    description:
      'プロジェクトの存在を正式に承認し、プロジェクト・マネジャーに組織の資源をプロジェクト活動に投入する権限を与える文書',
    categories: ['general', 'integration'],
    relatedTerms: ['Project Management Plan', 'Business Case'],
  },
  {
    id: 32,
    term: 'Work Performance Data',
    japanese: '作業パフォーマンス・データ',
    description: 'プロジェクト作業を実行する中で観察・収集される生の観察結果と測定値',
    categories: ['general', 'integration'],
    relatedTerms: ['Work Performance Information', 'Work Performance Reports'],
  },
  {
    id: 33,
    term: 'Work Performance Information',
    japanese: '作業パフォーマンス情報',
    description: '様々なコントロール・プロセスから収集・統合された作業パフォーマンス・データ',
    categories: ['general', 'integration'],
    relatedTerms: ['Work Performance Data', 'Work Performance Reports'],
  },
  {
    id: 34,
    term: 'Work Performance Reports',
    japanese: '作業パフォーマンス報告書',
    description:
      '意思決定、問題提起、行動、認識を促すために配布される作業パフォーマンス情報の物理的または電子的表現',
    categories: ['general', 'integration'],
    relatedTerms: ['Work Performance Data', 'Work Performance Information'],
  },
  {
    id: 35,
    term: 'Change Request',
    japanese: '変更要求',
    description: 'ベースラインとなった文書、成果物、プロジェクト計画書を修正するための正式な提案',
    categories: ['general', 'integration'],
    relatedTerms: ['Change Control', 'Approved Change Request'],
  },
  {
    id: 36,
    term: 'Organizational Process Assets',
    japanese: '組織のプロセス資産',
    description:
      'プロジェクトを実行する組織が保有し、プロジェクトに影響を与える可能性のある計画、プロセス、方針、手続き、知識ベース',
    categories: ['general'],
    relatedTerms: ['Enterprise Environmental Factors'],
  },
  {
    id: 37,
    term: 'Enterprise Environmental Factors',
    japanese: '組織体の環境要因',
    description:
      'プロジェクトに影響を与える可能性があるが、プロジェクト・チームの管理下にない内部または外部の条件',
    categories: ['general'],
    relatedTerms: ['Organizational Process Assets'],
  },
  {
    id: 38,
    term: 'Expert Judgment',
    japanese: '専門家の判断',
    description: '専門教育、知識、スキル、経験、トレーニングを基に提供される判断',
    categories: ['general'],
    relatedTerms: [],
  },
  {
    id: 39,
    term: 'Meetings',
    japanese: '会議',
    description: 'ステークホルダーが集まり、プロジェクトに関する議論や意思決定を行う場',
    categories: ['general', 'communication'],
    relatedTerms: [],
  },
  {
    id: 40,
    term: 'Data Analysis',
    japanese: 'データ分析',
    description: 'データを収集、評価、解釈して情報を得るためのプロセス',
    categories: ['general'],
    relatedTerms: ['Data Gathering', 'Data Representation'],
  },
  {
    id: 41,
    term: 'Business Documents',
    japanese: 'ビジネス文書',
    description:
      'ビジネスケースやベネフィット・マネジメント計画書など、プロジェクトの根拠となる文書',
    categories: ['general', 'integration'],
    relatedTerms: ['Business Case', 'Benefits Management Plan'],
  },
  {
    id: 42,
    term: 'Agreements',
    japanese: '合意書',
    description: '契約、覚書、サービスレベル合意書など、当事者間の意図を定義する文書',
    categories: ['general', 'procurement'],
    relatedTerms: ['Contract', 'SLA'],
  },
  {
    id: 43,
    term: 'Project Management Plan',
    japanese: 'プロジェクトマネジメント計画書',
    description: 'プロジェクトの実行、監視・コントロール、終結の方法を記述した文書',
    categories: ['general', 'integration'],
    relatedTerms: ['Baseline', 'Subsidiary Plans'],
  },
  {
    id: 44,
    term: 'Project Documents',
    japanese: 'プロジェクト文書',
    description: 'プロジェクト計画書の一部ではないが、プロジェクトの管理に使用される文書',
    categories: ['general'],
    relatedTerms: ['Issue Log', 'Risk Register', 'Stakeholder Register'],
  },
  {
    id: 45,
    term: 'Deliverables',
    japanese: '成果物',
    description:
      'プロジェクトやプロジェクトのフェーズを完了するために作成される、独自で検証可能なプロダクト、所産、サービス提供能力',
    categories: ['general'],
    relatedTerms: ['Work Package', 'Milestone'],
  },

  // PMO関連用語
  {
    id: 46,
    term: 'PMO (Project Management Office)',
    japanese: 'プロジェクト・マネジメント・オフィス',
    description:
      'プロジェクトの管理を標準化し、資源、方法論、ツール、技術を共有することにより、プロジェクト実行を促進する組織構造',
    categories: ['organization', 'general'],
    relatedTerms: ['Supportive PMO', 'Controlling PMO', 'Directive PMO', 'PMO Governance'],
  },
  {
    id: 47,
    term: 'Supportive PMO',
    japanese: '支援型PMO',
    description:
      'ベストプラクティス、テンプレート、トレーニングを提供し、プロジェクト・マネジャーを支援するPMOタイプ',
    categories: ['organization'],
    relatedTerms: ['PMO (Project Management Office)', 'Controlling PMO', 'Directive PMO'],
  },
  {
    id: 48,
    term: 'Controlling PMO',
    japanese: 'コントロール型PMO',
    description: 'プロジェクト監査を通じて標準準拠を監視し、一定レベルの管理を提供するPMOタイプ',
    categories: ['organization'],
    relatedTerms: [
      'PMO (Project Management Office)',
      'Supportive PMO',
      'Directive PMO',
      'PMO Governance',
    ],
  },
  {
    id: 49,
    term: 'Directive PMO',
    japanese: '指令型PMO',
    description: 'プロジェクトを直接管理し、共有資源を割り当てるPMOタイプ',
    categories: ['organization'],
    relatedTerms: ['PMO (Project Management Office)', 'Supportive PMO', 'Controlling PMO'],
  },
  {
    id: 50,
    term: 'ACoE (Agile Center of Excellence)',
    japanese: 'アジャイル・センター・オブ・エクセレンス',
    description:
      'アジャイルのマインドセット、スキル、能力を組織全体に育成し、チームを支援する組織構造',
    categories: ['agile', 'organization'],
    relatedTerms: [
      'VDO (Value Delivery Office)',
      'PMO (Project Management Office)',
      'Sprint',
      'Velocity',
    ],
  },
  {
    id: 51,
    term: 'VDO (Value Delivery Office)',
    japanese: '価値実現オフィス',
    description:
      'ビジネス価値の実現に焦点を当て、プロジェクトや製品の価値創出を支援する組織構造。ACoEの別名',
    categories: ['agile', 'organization'],
    relatedTerms: [
      'ACoE (Agile Center of Excellence)',
      'PMO (Project Management Office)',
      'Business Case',
    ],
  },
  {
    id: 52,
    term: 'PMO Governance',
    japanese: 'PMOガバナンス',
    description: 'PMOによって実施される、プロジェクトポートフォリオの監督と標準化のプロセス',
    categories: ['organization', 'integration'],
    relatedTerms: [
      'PMO (Project Management Office)',
      'Controlling PMO',
      'Change Control Board (CCB)',
    ],
  },
  {
    id: 53,
    term: 'PMO Maturity Model',
    japanese: 'PMO成熟度モデル',
    description: 'PMOの能力と効果を評価し、継続的改善を導くためのフレームワーク',
    categories: ['organization', 'quality'],
    relatedTerms: ['PMO (Project Management Office)', 'Quality Assurance', 'Lessons Learned'],
  },

  // アジャイル関連用語（拡張）
  {
    id: 54,
    term: 'Agile Manifesto',
    japanese: 'アジャイル・マニフェスト',
    description:
      '2001年に発表されたソフトウェア開発の価値観と原則を記した宣言。4つの価値（個人と対話、動くソフトウェア、顧客との協調、変化への対応）と12の原則から構成される',
    categories: ['agile'],
    relatedTerms: ['Scrum', 'Sprint', 'User Story', 'Agile Coach'],
  },
  {
    id: 55,
    term: 'Scrum',
    japanese: 'スクラム',
    description:
      '複雑なプロダクト開発のためのアジャイルフレームワーク。スプリント、ロール（プロダクトオーナー、スクラムマスター、開発チーム）、イベント、アーティファクトで構成される',
    categories: ['agile'],
    relatedTerms: [
      'Sprint',
      'Product Backlog',
      'Sprint Backlog',
      'Daily Scrum',
      'Sprint Retrospective',
    ],
  },
  {
    id: 56,
    term: 'User Story',
    japanese: 'ユーザーストーリー',
    description:
      'エンドユーザーの視点から書かれた機能要求の簡潔な記述。「～として、～したい、なぜなら～」の形式で表現されることが多い',
    categories: ['agile'],
    relatedTerms: ['Product Backlog', 'Acceptance Criteria', 'Story Points', 'Epic'],
  },
  {
    id: 57,
    term: 'Sprint Backlog',
    japanese: 'スプリント・バックログ',
    description:
      'スプリント中に完了する作業項目のリスト。プロダクトバックログから選択されたアイテムと、それらを成果物に変換するための計画',
    categories: ['agile'],
    relatedTerms: ['Product Backlog', 'Sprint', 'Sprint Planning', 'Daily Scrum'],
  },
  {
    id: 58,
    term: 'Daily Scrum',
    japanese: 'デイリースクラム',
    description:
      '毎日同じ時間・場所で行う15分のチーム同期ミーティング。昨日の作業、今日の計画、障害について共有',
    categories: ['agile'],
    relatedTerms: ['Sprint', 'Scrum Master', 'Sprint Retrospective', 'Sprint Review'],
  },
  {
    id: 59,
    term: 'Sprint Retrospective',
    japanese: 'スプリント・レトロスペクティブ',
    description:
      'スプリント終了時に行うチームの振り返り会議。プロセスと協力体制を検査し、次のスプリントでの改善計画を作成',
    categories: ['agile'],
    relatedTerms: ['Sprint', 'Sprint Review', 'Continuous Improvement', 'Lessons Learned'],
  },
  {
    id: 60,
    term: 'Kanban',
    japanese: 'カンバン',
    description:
      'ワークフローを可視化し、仕掛かり作業（WIP）を制限し、フローを最大化するアジャイル手法。日本のトヨタ生産方式に由来',
    categories: ['agile'],
    relatedTerms: ['WIP Limit', 'Kanban Board', 'Lead Time', 'Cycle Time'],
  },
  {
    id: 61,
    term: 'Product Owner',
    japanese: 'プロダクトオーナー',
    description:
      'スクラムチームにおいて、プロダクトの価値を最大化する責任を持つ役割。プロダクトバックログの管理と優先順位付けを行う',
    categories: ['agile'],
    relatedTerms: ['Product Backlog', 'Scrum', 'Sprint Planning', 'Stakeholder'],
  },
  {
    id: 62,
    term: 'Scrum Master',
    japanese: 'スクラムマスター',
    description:
      'スクラムチームがスクラムフレームワークを理解し実践できるよう支援するサーバント・リーダー。障害の除去とプロセス改善を促進',
    categories: ['agile'],
    relatedTerms: ['Scrum', 'Daily Scrum', 'Sprint Retrospective', 'Servant Leadership'],
  },
  {
    id: 63,
    term: 'Story Points',
    japanese: 'ストーリーポイント',
    description:
      'ユーザーストーリーの複雑性、労力、リスクを表す相対的な見積もり単位。フィボナッチ数列（1,2,3,5,8,13...）がよく使われる',
    categories: ['agile'],
    relatedTerms: ['User Story', 'Velocity', 'Planning Poker', 'Sprint Planning'],
  },
  {
    id: 64,
    term: 'Epic',
    japanese: 'エピック',
    description:
      '複数のスプリントにまたがる大きなユーザーストーリー。より小さなユーザーストーリーに分解される',
    categories: ['agile'],
    relatedTerms: ['User Story', 'Product Backlog', 'Feature', 'Theme'],
  },
  {
    id: 65,
    term: 'Burndown Chart',
    japanese: 'バーンダウンチャート',
    description: 'スプリント内で残っている作業量を時系列で示すグラフ。進捗の可視化と予測に使用',
    categories: ['agile'],
    relatedTerms: ['Sprint', 'Velocity', 'Burnup Chart', 'Sprint Backlog'],
  },
  {
    id: 66,
    term: 'Definition of Done',
    japanese: '完了の定義',
    description:
      'プロダクトインクリメントが「完了」とみなされるために満たすべき条件のチェックリスト',
    categories: ['agile', 'quality'],
    relatedTerms: ['Acceptance Criteria', 'Sprint Review', 'Quality Assurance'],
  },
  {
    id: 67,
    term: 'Sprint Planning',
    japanese: 'スプリント計画',
    description:
      'スプリントの開始時に行う計画会議。スプリントゴールの設定とスプリントバックログの作成を行う',
    categories: ['agile'],
    relatedTerms: ['Sprint', 'Sprint Backlog', 'Product Backlog', 'Sprint Goal'],
  },
  {
    id: 68,
    term: 'Sprint Review',
    japanese: 'スプリントレビュー',
    description:
      'スプリント終了時に行うインクリメントの検査会議。ステークホルダーに成果をデモし、フィードバックを収集',
    categories: ['agile'],
    relatedTerms: ['Sprint', 'Product Increment', 'Sprint Retrospective', 'Stakeholder'],
  },
  {
    id: 69,
    term: 'Product Increment',
    japanese: 'プロダクト・インクリメント',
    description:
      'スプリント中に完成したすべてのプロダクトバックログアイテムの総和。利用可能な状態である必要がある',
    categories: ['agile'],
    relatedTerms: ['Sprint', 'Definition of Done', 'Sprint Review', 'Product Backlog'],
  },
  {
    id: 70,
    term: 'WIP Limit',
    japanese: 'WIP制限',
    description:
      '仕掛かり作業（Work In Progress）の最大数を制限すること。カンバンにおいて流れを最適化するための手法',
    categories: ['agile'],
    relatedTerms: ['Kanban', 'Kanban Board', 'Flow', 'Cycle Time'],
  },
  {
    id: 71,
    term: 'Planning Poker',
    japanese: 'プランニングポーカー',
    description:
      'チーム全員が参加する見積もり手法。各メンバーがカードを使って同時に見積もりを提示し、合意形成を行う',
    categories: ['agile'],
    relatedTerms: ['Story Points', 'User Story', 'Sprint Planning', 'Relative Estimation'],
  },
  {
    id: 72,
    term: 'Agile Coach',
    japanese: 'アジャイルコーチ',
    description: '組織やチームがアジャイルの価値観、原則、実践を採用し改善するのを支援する専門家',
    categories: ['agile', 'organization'],
    relatedTerms: [
      'Scrum Master',
      'ACoE (Agile Center of Excellence)',
      'Agile Manifesto',
      'Servant Leadership',
    ],
  },
  {
    id: 73,
    term: 'Sprint Goal',
    japanese: 'スプリントゴール',
    description: 'スプリントで達成すべき目的。チームに柔軟性を与えながら方向性を示す',
    categories: ['agile'],
    relatedTerms: ['Sprint Planning', 'Sprint Backlog', 'Product Owner', 'Sprint Review'],
  },
  {
    id: 74,
    term: 'Acceptance Criteria',
    japanese: '受入基準',
    description: 'ユーザーストーリーが完了とみなされるために満たすべき条件のリスト',
    categories: ['agile', 'quality'],
    relatedTerms: ['User Story', 'Definition of Done', 'Sprint Review', 'Quality Control'],
  },
  {
    id: 75,
    term: 'Servant Leadership',
    japanese: 'サーバント・リーダーシップ',
    description:
      'チームメンバーの成長と成功を支援することを第一とするリーダーシップスタイル。スクラムマスターの基本姿勢',
    categories: ['agile', 'organization'],
    relatedTerms: ['Scrum Master', 'Agile Coach', 'Self-Organizing Team'],
  },
  {
    id: 76,
    term: 'Self-Organizing Team',
    japanese: '自己組織化チーム',
    description:
      '外部からの指示なしに、作業の進め方を自ら決定し管理するチーム。アジャイルの基本原則の一つ',
    categories: ['agile', 'organization'],
    relatedTerms: ['Scrum', 'Agile Manifesto', 'Cross-Functional Team', 'Servant Leadership'],
  },
  {
    id: 77,
    term: 'Cross-Functional Team',
    japanese: 'クロスファンクショナル・チーム',
    description: 'プロダクトを完成させるために必要なすべてのスキルを持つメンバーで構成されるチーム',
    categories: ['agile', 'organization'],
    relatedTerms: ['Self-Organizing Team', 'Scrum', 'T-shaped Skills'],
  },
  {
    id: 78,
    term: 'Continuous Integration',
    japanese: '継続的インテグレーション',
    description: 'コードの変更を頻繁にメインブランチに統合し、自動テストを実行する開発プラクティス',
    categories: ['agile', 'quality'],
    relatedTerms: ['Continuous Delivery', 'DevOps', 'Test Automation'],
  },
  {
    id: 79,
    term: 'Continuous Delivery',
    japanese: '継続的デリバリー',
    description: 'ソフトウェアを短いサイクルで本番環境にリリース可能な状態に保つプラクティス',
    categories: ['agile', 'quality'],
    relatedTerms: ['Continuous Integration', 'DevOps', 'Continuous Deployment'],
  },
  {
    id: 80,
    term: 'Minimum Viable Product (MVP)',
    japanese: '実用最小限の製品',
    description: '顧客に価値を提供し、フィードバックを得るために必要な最小限の機能を持つ製品',
    categories: ['agile'],
    relatedTerms: ['Product Increment', 'User Story', 'Lean Startup', 'Product Owner'],
  },

  // OPM関連用語
  {
    id: 81,
    term: 'OPM (Organizational Project Management)',
    japanese: '組織のプロジェクトマネジメント',
    description:
      'プロジェクト、プログラム、ポートフォリオ、定常業務のマネジメントを調整し、組織の戦略を実行するためのフレームワーク',
    categories: ['organization'],
    relatedTerms: [
      'Portfolio Management',
      'Program Management',
      'PMO (Project Management Office)',
      'Value Delivery System',
    ],
  },
  {
    id: 82,
    term: 'Portfolio Management',
    japanese: 'ポートフォリオマネジメント',
    description:
      '戦略目標達成のために実施するプロジェクト、プログラム、サブポートフォリオ、定常業務の集合を管理すること。事業戦略に準じる',
    categories: ['organization'],
    relatedTerms: [
      'OPM (Organizational Project Management)',
      'Program Management',
      'Project',
      'Value Delivery System',
    ],
  },
  {
    id: 83,
    term: 'Program Management',
    japanese: 'プログラムマネジメント',
    description:
      '個別プロジェクトでは実現できないベネフィットを得るために関連する複数プロジェクトやその他の活動を調整して実施すること',
    categories: ['organization'],
    relatedTerms: [
      'OPM (Organizational Project Management)',
      'Portfolio Management',
      'Project Management',
      'Benefits Management Plan',
    ],
  },
  {
    id: 84,
    term: 'Value Delivery System',
    japanese: '価値実現システム',
    description:
      'ポートフォリオ、プログラム、プロジェクトを通じて組織に価値を提供する統合的なフレームワーク',
    categories: ['organization'],
    relatedTerms: [
      'OPM (Organizational Project Management)',
      'Portfolio Management',
      'VDO (Value Delivery Office)',
      'Business Case',
    ],
  },
  {
    id: 85,
    term: 'Functional Organization',
    japanese: '機能型組織',
    description: '専門分野ごとに部門が分かれ、各部門が独立して運営される組織構造。PMの権限は限定的',
    categories: ['organization'],
    relatedTerms: [
      'Matrix Organization',
      'Projectized Organization',
      'Project Manager',
      'Organizational Process Assets',
    ],
  },
  {
    id: 86,
    term: 'Matrix Organization',
    japanese: 'マトリックス型組織',
    description:
      '機能部門とプロジェクトチームの両方に報告ラインを持つ組織構造。PMと機能部門マネジャーが権限を共有',
    categories: ['organization'],
    relatedTerms: [
      'Functional Organization',
      'Projectized Organization',
      'Strong Matrix',
      'Weak Matrix',
      'Balanced Matrix',
    ],
  },
  {
    id: 87,
    term: 'Projectized Organization',
    japanese: 'プロジェクト型組織',
    description: 'プロジェクトを中心に組織が構成され、PMが高い権限を持つ組織構造',
    categories: ['organization'],
    relatedTerms: [
      'Functional Organization',
      'Matrix Organization',
      'Project Manager',
      'Project Charter',
    ],
  },
  {
    id: 88,
    term: 'OBS (Organizational Breakdown Structure)',
    japanese: '組織ブレークダウン構造',
    description: 'プロジェクトの組織構造を階層的に表現した図。責任の所在を明確化',
    categories: ['organization', 'resource'],
    relatedTerms: [
      'WBS (Work Breakdown Structure)',
      'RAM (Responsibility Assignment Matrix)',
      'RACI Chart',
      'Resource Management',
    ],
  },
  {
    id: 89,
    term: 'Strong Matrix',
    japanese: '強いマトリックス',
    description: 'プロジェクトマネジャーが機能部門マネジャーより強い権限を持つマトリックス型組織',
    categories: ['organization'],
    relatedTerms: ['Matrix Organization', 'Weak Matrix', 'Balanced Matrix', 'Project Manager'],
  },
  {
    id: 90,
    term: 'Weak Matrix',
    japanese: '弱いマトリックス',
    description: '機能部門マネジャーがプロジェクトマネジャーより強い権限を持つマトリックス型組織',
    categories: ['organization'],
    relatedTerms: [
      'Matrix Organization',
      'Strong Matrix',
      'Balanced Matrix',
      'Functional Organization',
    ],
  },
  {
    id: 91,
    term: 'Balanced Matrix',
    japanese: 'バランス型マトリックス',
    description: 'プロジェクトマネジャーと機能部門マネジャーが同等の権限を持つマトリックス型組織',
    categories: ['organization'],
    relatedTerms: ['Matrix Organization', 'Strong Matrix', 'Weak Matrix', 'Project Manager'],
  },
  {
    id: 92,
    term: 'RAM (Responsibility Assignment Matrix)',
    japanese: '責任分担マトリックス',
    description: 'プロジェクトの作業パッケージまたは活動を、実行する個人またはチームと関連付けた表',
    categories: ['organization', 'resource'],
    relatedTerms: [
      'RACI Chart',
      'OBS (Organizational Breakdown Structure)',
      'WBS (Work Breakdown Structure)',
      'Resource Management',
    ],
  },
  {
    id: 93,
    term: 'RACI Chart',
    japanese: 'RACI図',
    description:
      '責任分担マトリックスの一種。Responsible(実行責任)、Accountable(説明責任)、Consulted(相談)、Informed(通知)の4つの役割を明確化',
    categories: ['organization', 'resource'],
    relatedTerms: [
      'RAM (Responsibility Assignment Matrix)',
      'OBS (Organizational Breakdown Structure)',
      'Stakeholder Register',
    ],
  },
]

// 検索用のインデックスを作成
export const __searchIndex = glossaryTerms.reduce((acc, term) => {
  const searchText = `${term.term} ${term.japanese} ${term.description}`.toLowerCase()
  acc[term.id] = searchText
  return acc
}, {})
