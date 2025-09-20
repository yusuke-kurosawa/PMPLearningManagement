/**
 * PMI タレント・トライアングル データ構造
 * Project Management Institute (PMI) のタレント・トライアングルモデルに基づく
 * 3つの主要なスキル領域を定義
 */

export interface TalentTriangleSkill {
  id: string
  name: string
  description: string
  importance: string
  keyAreas: string[]
  developmentTips: string[]
  examples: string[]
  assessment: {
    questions: string[]
    levels: {
      level: string
      description: string
      indicators: string[]
    }[]
  }
}

export interface TalentTriangleCategory {
  id: string
  name: string
  englishName: string
  description: string
  coreMessage: string
  percentage: number // 推奨される注力の割合
  skills: TalentTriangleSkill[]
  color: string
  icon: string
}

export const talentTriangleData: TalentTriangleCategory[] = [
  {
    id: 'technical-skills',
    name: '働き方',
    englishName: 'Ways of Working',
    description: 'プロジェクトマネジメントの技術的スキルと知識',
    coreMessage: 'プロジェクトを成功に導くための基本的な知識とツール',
    percentage: 33,
    color: '#3B82F6',
    icon: 'Settings',
    skills: [
      {
        id: 'project-management-fundamentals',
        name: 'プロジェクトマネジメントの基礎',
        description: 'PMBOKガイドに基づく基本的なプロジェクトマネジメント知識',
        importance: 'プロジェクト成功の土台となる必須スキル',
        keyAreas: [
          'スコープマネジメント',
          'スケジュールマネジメント',
          'コストマネジメント',
          '品質マネジメント',
          'リスクマネジメント',
          '調達マネジメント',
          'ステークホルダーマネジメント',
          '統合マネジメント',
        ],
        developmentTips: [
          'PMBOKガイドを系統的に学習する',
          '実際のプロジェクトで知識を適用する',
          'PMP認定資格の取得を目指す',
          '他のプロジェクトマネージャーと知識を共有する',
        ],
        examples: [
          'WBS（作業分解構造）の作成',
          'ガントチャートによるスケジュール管理',
          'リスク登録簿の作成と更新',
          'ステークホルダー分析の実施',
        ],
        assessment: {
          questions: [
            'PMBOKガイドの10の知識エリアを説明できますか？',
            'プロジェクトライフサイクルを理解していますか？',
            'リスク管理プロセスを実行できますか？',
            'ステークホルダーとの効果的なコミュニケーションができますか？',
          ],
          levels: [
            {
              level: '初級',
              description: '基本的な概念を理解している',
              indicators: [
                'PMBOKガイドの主要概念を説明できる',
                '簡単なプロジェクト計画を作成できる',
                '基本的なツールを使用できる',
              ],
            },
            {
              level: '中級',
              description: '実践的な適用ができる',
              indicators: [
                '複雑なプロジェクトを管理できる',
                '適切なツールと技法を選択できる',
                'プロジェクトの課題に対処できる',
              ],
            },
            {
              level: '上級',
              description: '戦略的な視点で活用できる',
              indicators: [
                '組織全体のプロジェクトを調整できる',
                '新しい手法を開発・改善できる',
                '他者を指導・育成できる',
              ],
            },
          ],
        },
      },
      {
        id: 'agile-approaches',
        name: 'アジャイル・アプローチ',
        description: '適応型（アジャイル）プロジェクトマネジメント手法',
        importance: '変化の激しい環境でのプロジェクト成功に必要',
        keyAreas: [
          'スクラムフレームワーク',
          'カンバン手法',
          'リーンスタートアップ',
          'デザイン思考',
          '継続的改善',
          'インクリメンタル開発',
        ],
        developmentTips: [
          'スクラムマスター認定の取得',
          'アジャイルプロジェクトでの実践経験',
          'アジャイルコーチングスキルの習得',
          'チームでのふりかえりの促進',
        ],
        examples: [
          'スプリント計画とレビューの実施',
          'デイリースタンドアップの運営',
          'ユーザーストーリーの作成',
          'ベロシティ測定と改善',
        ],
        assessment: {
          questions: [
            'アジャイル宣言の価値観を説明できますか？',
            'スクラムのイベントと役割を理解していますか？',
            'カンバンボードを効果的に運用できますか？',
            '継続的改善の文化を醸成できますか？',
          ],
          levels: [
            {
              level: '初級',
              description: 'アジャイルの基本概念を理解',
              indicators: [
                'アジャイル宣言を説明できる',
                '基本的なスクラムイベントに参加できる',
                'ユーザーストーリーを理解できる',
              ],
            },
            {
              level: '中級',
              description: 'アジャイル手法を実践できる',
              indicators: [
                'スクラムイベントを運営できる',
                'アジャイル見積もりができる',
                'チームの自己組織化を支援できる',
              ],
            },
            {
              level: '上級',
              description: 'アジャイル変革をリードできる',
              indicators: [
                '組織のアジャイル変革を推進できる',
                'スケーリングフレームワークを適用できる',
                'アジャイルコーチングができる',
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'power-skills',
    name: 'パワースキル',
    englishName: 'Power Skills',
    description: '対人関係とチーム管理における重要なスキル',
    coreMessage: '人との関わりを通じてプロジェクトを成功に導く力',
    percentage: 33,
    color: '#10B981',
    icon: 'Users',
    skills: [
      {
        id: 'leadership',
        name: 'リーダーシップ',
        description: 'チームを指導し、目標達成に向けて導く能力',
        importance: 'プロジェクト成功の鍵となる人間力',
        keyAreas: [
          'ビジョン設定と共有',
          'チームの動機付け',
          '意思決定',
          '変革推進',
          '信頼関係構築',
          'エンパワーメント',
        ],
        developmentTips: [
          '異なるリーダーシップスタイルを学ぶ',
          'メンタリングやコーチングスキルを習得',
          'フィードバックを積極的に求める',
          '自己認識を高める',
        ],
        examples: [
          'プロジェクトビジョンの策定と共有',
          'チームメンバーの個別指導',
          '困難な状況での意思決定',
          'チーム間の対立解決',
        ],
        assessment: {
          questions: [
            '明確なビジョンを設定し、チームに共有できますか？',
            'チームメンバーのモチベーションを高められますか？',
            '困難な状況で適切な意思決定ができますか？',
            'チームの信頼を得ることができますか？',
          ],
          levels: [
            {
              level: '初級',
              description: '基本的なリーダーシップを理解',
              indicators: [
                'リーダーシップの基本概念を理解している',
                '小規模チームをリードできる',
                '基本的な指示出しができる',
              ],
            },
            {
              level: '中級',
              description: '効果的なリーダーシップを発揮',
              indicators: [
                'チームの方向性を明確に示せる',
                'メンバーのモチベーションを管理できる',
                '複雑な状況で適切な判断ができる',
              ],
            },
            {
              level: '上級',
              description: '変革的リーダーシップを発揮',
              indicators: [
                '組織変革をリードできる',
                '他のリーダーを育成できる',
                '戦略的思考でビジョンを創造できる',
              ],
            },
          ],
        },
      },
      {
        id: 'communication',
        name: 'コミュニケーション',
        description: '効果的な情報共有とステークホルダーとの関係構築',
        importance: 'プロジェクト成功に不可欠な情報伝達力',
        keyAreas: [
          'アクティブリスニング',
          'プレゼンテーション',
          '交渉スキル',
          '文書作成',
          '非言語コミュニケーション',
          '異文化コミュニケーション',
        ],
        developmentTips: [
          'プレゼンテーション研修の受講',
          '交渉術の学習と実践',
          '文書作成スキルの向上',
          '異文化理解の促進',
        ],
        examples: [
          'ステークホルダーへの進捗報告',
          'チーム会議のファシリテーション',
          '要件定義のインタビュー',
          '契約交渉',
        ],
        assessment: {
          questions: [
            '相手の立場に立って話を聞けますか？',
            '複雑な内容を分かりやすく説明できますか？',
            '効果的な交渉ができますか？',
            '書面でのコミュニケーションは適切ですか？',
          ],
          levels: [
            {
              level: '初級',
              description: '基本的なコミュニケーションができる',
              indicators: [
                '相手の話を理解できる',
                '基本的な報告ができる',
                '簡単な文書を作成できる',
              ],
            },
            {
              level: '中級',
              description: '効果的なコミュニケーションができる',
              indicators: [
                '複雑な内容を分かりやすく伝えられる',
                'プレゼンテーションができる',
                '建設的な議論をリードできる',
              ],
            },
            {
              level: '上級',
              description: '戦略的コミュニケーションができる',
              indicators: [
                '組織全体の合意形成ができる',
                '影響力のあるメッセージを作成できる',
                '複雑な交渉を成功させられる',
              ],
            },
          ],
        },
      },
      {
        id: 'team-management',
        name: 'チームマネジメント',
        description: 'チームの結束力と生産性を最大化する能力',
        importance: 'チームパフォーマンス向上の核心',
        keyAreas: [
          'チーム形成',
          'パフォーマンス管理',
          '対立解決',
          'チームビルディング',
          'ダイバーシティ管理',
          '人材育成',
        ],
        developmentTips: [
          'チームダイナミクスの理解',
          'コンフリクト解決技法の習得',
          'ダイバーシティ＆インクルージョンの推進',
          'パフォーマンス評価手法の学習',
        ],
        examples: [
          '新メンバーのオンボーディング',
          'チーム内対立の調停',
          'パフォーマンス改善計画の作成',
          '多様性のあるチーム運営',
        ],
        assessment: {
          questions: [
            'チームの結束力を高められますか？',
            'メンバー間の対立を解決できますか？',
            '個人のパフォーマンスを向上させられますか？',
            '多様性のあるチームを管理できますか？',
          ],
          levels: [
            {
              level: '初級',
              description: 'チーム運営の基本を理解',
              indicators: [
                'チーム形成の段階を理解している',
                '基本的なチーム活動を運営できる',
                'メンバーとの関係を構築できる',
              ],
            },
            {
              level: '中級',
              description: '効果的なチーム運営ができる',
              indicators: [
                'チームの生産性を向上させられる',
                '対立を建設的に解決できる',
                'メンバーの成長を支援できる',
              ],
            },
            {
              level: '上級',
              description: '高性能チームを構築できる',
              indicators: [
                '自己組織化チームを育成できる',
                '組織文化の変革をリードできる',
                '次世代リーダーを育成できる',
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'business-acumen',
    name: 'ビジネス感覚',
    englishName: 'Business Acumen',
    description: '組織戦略とビジネス価値創造への理解',
    coreMessage: 'プロジェクトを組織の戦略的価値に結び付ける洞察力',
    percentage: 34,
    color: '#F59E0B',
    icon: 'TrendingUp',
    skills: [
      {
        id: 'strategic-thinking',
        name: '戦略的思考',
        description: '長期的視野で組織の方向性を理解し、プロジェクトを戦略に整合させる能力',
        importance: 'プロジェクトの組織価値を最大化する思考力',
        keyAreas: [
          '戦略分析',
          '市場理解',
          '競合分析',
          'ビジネスモデル設計',
          'イノベーション推進',
          'リスク評価',
        ],
        developmentTips: [
          'ビジネス書籍の定期的な読書',
          '他業界のケーススタディ分析',
          '経営層との対話機会の創出',
          'MBA等のビジネス教育プログラム参加',
        ],
        examples: [
          'SWOT分析によるプロジェクト評価',
          '市場動向を踏まえた要件定義',
          '競合他社分析に基づく戦略提案',
          'ROI（投資収益率）の計算と提示',
        ],
        assessment: {
          questions: [
            '組織の戦略を理解し、プロジェクトに反映できますか？',
            '市場動向がプロジェクトに与える影響を分析できますか？',
            '長期的な視点でプロジェクトの価値を評価できますか？',
            '戦略的な意思決定に貢献できますか？',
          ],
          levels: [
            {
              level: '初級',
              description: '基本的な戦略理解',
              indicators: [
                '組織の戦略を理解している',
                'プロジェクトの目的を説明できる',
                '基本的なビジネス指標を理解している',
              ],
            },
            {
              level: '中級',
              description: '戦略とプロジェクトの整合',
              indicators: [
                'プロジェクトを戦略に整合させられる',
                '市場分析を行い戦略に反映できる',
                'ビジネス価値を定量化できる',
              ],
            },
            {
              level: '上級',
              description: '戦略策定への貢献',
              indicators: [
                '組織戦略の策定に参画できる',
                '新たなビジネス機会を創出できる',
                '戦略的イニシアチブをリードできる',
              ],
            },
          ],
        },
      },
      {
        id: 'financial-literacy',
        name: '財務リテラシー',
        description: '財務指標の理解とプロジェクトの経済的影響の評価',
        importance: 'プロジェクトの経済的価値を測定・管理する能力',
        keyAreas: [
          '予算管理',
          'コスト分析',
          '投資評価',
          'キャッシュフロー管理',
          '財務諸表理解',
          'リスク・リターン分析',
        ],
        developmentTips: [
          '財務会計の基礎知識習得',
          'プロジェクト会計の学習',
          '財務分析ツールの習得',
          'CFOや財務部門との連携強化',
        ],
        examples: [
          'プロジェクト予算の作成と管理',
          'NPV（正味現在価値）の計算',
          'コスト・ベネフィット分析',
          '予算vs実績分析',
        ],
        assessment: {
          questions: [
            'プロジェクト予算を適切に管理できますか？',
            'ROI、NPV等の財務指標を計算できますか？',
            'コスト削減の機会を特定できますか？',
            '財務リスクを評価・管理できますか？',
          ],
          levels: [
            {
              level: '初級',
              description: '基本的な財務知識',
              indicators: [
                '基本的な財務用語を理解している',
                '簡単な予算管理ができる',
                '基本的なコスト計算ができる',
              ],
            },
            {
              level: '中級',
              description: '財務分析の実践',
              indicators: ['詳細な財務分析ができる', '投資評価を行える', '財務リスクを評価できる'],
            },
            {
              level: '上級',
              description: '戦略的財務管理',
              indicators: [
                '複雑な財務モデルを構築できる',
                '財務戦略の策定に貢献できる',
                '投資判断をリードできる',
              ],
            },
          ],
        },
      },
      {
        id: 'customer-focus',
        name: '顧客志向',
        description: '顧客ニーズの理解と顧客価値の最大化',
        importance: 'プロジェクト成果の市場価値を確保する視点',
        keyAreas: [
          '顧客分析',
          '市場調査',
          'ユーザーエクスペリエンス',
          '価値提案設計',
          '顧客関係管理',
          'フィードバック活用',
        ],
        developmentTips: [
          '顧客インタビュー技法の習得',
          'デザイン思考の学習',
          '市場調査手法の理解',
          'カスタマージャーニーマッピング',
        ],
        examples: [
          '顧客要件の詳細な聞き取り',
          'ユーザビリティテストの実施',
          '顧客満足度調査の分析',
          'カスタマージャーニーの作成',
        ],
        assessment: {
          questions: [
            '顧客の真のニーズを理解できますか？',
            '顧客価値を最大化する提案ができますか？',
            '顧客フィードバックを効果的に活用できますか？',
            '顧客満足度を向上させられますか？',
          ],
          levels: [
            {
              level: '初級',
              description: '基本的な顧客理解',
              indicators: [
                '顧客の基本ニーズを理解している',
                '顧客との基本的なコミュニケーションができる',
                '顧客フィードバックを収集できる',
              ],
            },
            {
              level: '中級',
              description: '顧客価値の創造',
              indicators: [
                '顧客の潜在ニーズを発見できる',
                '価値提案を設計できる',
                '顧客満足度を改善できる',
              ],
            },
            {
              level: '上級',
              description: '顧客中心のイノベーション',
              indicators: [
                '顧客と共創でソリューションを開発できる',
                '市場をリードする価値を創造できる',
                '顧客エコシステムを設計できる',
              ],
            },
          ],
        },
      },
    ],
  },
]

/**
 * タレント・トライアングルの評価結果
 */
export interface TalentTriangleAssessment {
  userId: string
  assessmentDate: Date
  overallScore: number
  categories: {
    categoryId: string
    score: number
    skills: {
      skillId: string
      level: string
      score: number
      strengthAreas: string[]
      developmentAreas: string[]
    }[]
  }[]
  developmentPlan: {
    priority: 'high' | 'medium' | 'low'
    area: string
    actions: string[]
    timeline: string
  }[]
}

/**
 * バランス分析のためのヘルパー関数
 */
export const analyzeTalentTriangleBalance = (assessment: TalentTriangleAssessment) => {
  const scores = assessment.categories.map((cat) => cat.score)
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const balance = 1 - (maxScore - minScore) / 100

  return {
    balance,
    isBalanced: balance > 0.8,
    strongestArea: assessment.categories.find((cat) => cat.score === maxScore)?.categoryId,
    weakestArea: assessment.categories.find((cat) => cat.score === minScore)?.categoryId,
    recommendations: generateBalanceRecommendations(assessment),
  }
}

const generateBalanceRecommendations = (assessment: TalentTriangleAssessment): string[] => {
  const recommendations: string[] = []
  const scores = assessment.categories.map((cat) => ({ id: cat.categoryId, score: cat.score }))

  // 各エリアのスコアに基づく推奨事項
  scores.forEach(({ id, score }) => {
    if (score < 60) {
      const category = talentTriangleData.find((cat) => cat.id === id)
      if (category) {
        recommendations.push(
          `${category.name}の強化が必要です。基礎的なスキル開発から始めましょう。`
        )
      }
    }
  })

  // バランスの改善提案
  const maxScore = Math.max(...scores.map((s) => s.score))
  const minScore = Math.min(...scores.map((s) => s.score))

  if (maxScore - minScore > 30) {
    recommendations.push('3つのスキル領域のバランスを取ることを重視してください。')
  }

  return recommendations
}

export default talentTriangleData
