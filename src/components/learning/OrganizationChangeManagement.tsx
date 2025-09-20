import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  BarChart3,
  Compass,
  Shield,
  Heart,
  Brain,
  Zap,
  Settings,
  ArrowRight,
  FileText,
  Clock,
  Globe,
  MessageSquare,
  Award,
} from 'lucide-react'

interface OrganizationChangeManagementProps {
  className?: string
}

// ADKARモデルの段階定義
interface ADKARStage {
  id: string
  name: string
  nameJa: string
  description: string
  keyActions: string[]
  successIndicators: string[]
  barriers: string[]
  tools: string[]
}

// 組織文化要因
interface CultureFactor {
  id: string
  name: string
  description: string
  impact: 'high' | 'medium' | 'low'
  examples: string[]
  assessmentQuestions: string[]
}

// 変革支援行動
interface SupportingBehavior {
  category: string
  dos: string[]
  donts: string[]
}

// Brightline要素
interface BrightlineElement {
  id: string
  name: string
  description: string
  keyPractices: string[]
}

const OrganizationChangeManagement: React.FC<OrganizationChangeManagementProps> = ({
  className = '',
}) => {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [adkarProgress, setAdkarProgress] = useState<{ [key: string]: number }>({})
  const [cultureAssessment, setCultureAssessment] = useState<{ [key: string]: number }>({})
  const [selectedFramework, setSelectedFramework] = useState<string>('adkar')
  const [assessmentMode, setAssessmentMode] = useState(false)
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0)

  // ADKARモデルの定義
  const adkarStages: ADKARStage[] = [
    {
      id: 'awareness',
      name: 'Awareness',
      nameJa: '認識',
      description: '変革の必要性と緊急性への認識を高める段階',
      keyActions: [
        '変革の必要性を明確に伝える',
        'ビジネス上の理由を説明する',
        '現状維持のリスクを示す',
        'ステークホルダーとのコミュニケーション計画を作成する',
      ],
      successIndicators: [
        '変革の理由を理解している',
        '変革の緊急性を認識している',
        '組織への影響を把握している',
        '積極的にコミュニケーションに参加している',
      ],
      barriers: [
        '情報不足',
        'コミュニケーション不足',
        'リーダーシップの不明確さ',
        '過去の変革失敗経験',
      ],
      tools: ['ステークホルダー分析', 'コミュニケーション計画', 'FAQ作成', 'ロードショー実施'],
    },
    {
      id: 'desire',
      name: 'Desire',
      nameJa: '意欲',
      description: '変革への参加と支援への意欲を醸成する段階',
      keyActions: [
        '個人にとってのメリットを明示する',
        '変革への抵抗要因を理解し対処する',
        'リーダーの支援を得る',
        'インセンティブシステムを整備する',
      ],
      successIndicators: [
        '変革への積極的な参加意欲',
        '変革支援のための時間投資',
        '他者への積極的な影響',
        '抵抗要因の減少',
      ],
      barriers: ['個人的なデメリット', '変革への恐怖', '過去の悪い経験', '組織政治'],
      tools: ['WIIFM分析', '抵抗管理計画', 'スポンサーシップモデル', 'インセンティブ設計'],
    },
    {
      id: 'knowledge',
      name: 'Knowledge',
      nameJa: '知識',
      description: '変革を実行するために必要な知識とスキルを習得する段階',
      keyActions: [
        '必要なスキルギャップを特定する',
        '体系的な学習プログラムを設計する',
        '実践的なトレーニングを提供する',
        '継続的な学習支援を行う',
      ],
      successIndicators: [
        '必要な知識の習得',
        'スキル評価の合格',
        '実践での知識活用',
        '他者への知識共有',
      ],
      barriers: ['学習時間の不足', '適切な研修内容', '学習リソースの不足', '学習能力の個人差'],
      tools: ['スキルギャップ分析', '学習マップ', 'e-ラーニング', 'OJTプログラム'],
    },
    {
      id: 'ability',
      name: 'Ability',
      nameJa: '能力',
      description: '知識を実際の業務で活用できる能力を開発する段階',
      keyActions: [
        '実践的な練習機会を提供する',
        'コーチングとメンタリングを実施する',
        'パフォーマンス支援ツールを整備する',
        '段階的な実装を計画する',
      ],
      successIndicators: [
        '実際の業務での実践',
        'パフォーマンス目標の達成',
        '独立した作業遂行',
        '問題解決能力の発揮',
      ],
      barriers: [
        '実践機会の不足',
        'パフォーマンス支援の欠如',
        '心理的安全性の不足',
        'リソース制約',
      ],
      tools: [
        'パフォーマンス支援',
        'コーチングプログラム',
        'シミュレーション',
        'フィードバックシステム',
      ],
    },
    {
      id: 'reinforcement',
      name: 'Reinforcement',
      nameJa: '強化',
      description: '変革を定着させ、後戻りを防ぐ仕組みを構築する段階',
      keyActions: [
        '測定とモニタリングシステムを構築する',
        '成功を祝福し認識する仕組みを作る',
        '是正措置とサポートシステムを整備する',
        '持続可能な仕組みに組み込む',
      ],
      successIndicators: [
        '新しい行動の習慣化',
        'パフォーマンス指標の改善',
        '自発的な改善活動',
        '組織文化への定着',
      ],
      barriers: [
        '測定システムの不備',
        '適切な報酬の欠如',
        'リーダーシップの支援不足',
        '競合する優先事項',
      ],
      tools: ['KPI測定', '報酬・認識システム', '監査・レビュー', '持続可能性計画'],
    },
  ]

  // 組織文化要因
  const cultureFactors: CultureFactor[] = [
    {
      id: 'leadership',
      name: 'リーダーシップスタイル',
      description: 'リーダーシップのアプローチと意思決定スタイル',
      impact: 'high',
      examples: [
        '権威主義的 vs 参加型',
        'トップダウン vs ボトムアップ',
        '短期志向 vs 長期志向',
        'リスク回避 vs 挑戦志向',
      ],
      assessmentQuestions: [
        'リーダーは変革を積極的に支援していますか？',
        '意思決定プロセスは透明性がありますか？',
        'リーダーは現場の声を聞いていますか？',
        '長期的な視点で判断を行っていますか？',
      ],
    },
    {
      id: 'diversity',
      name: 'ダイバーシティ&インクルージョン',
      description: '多様性の受容と包摂的な環境の構築',
      impact: 'high',
      examples: [
        '多様な背景を持つ人材の活用',
        'インクルーシブな意思決定',
        '心理的安全性の確保',
        '公平な機会提供',
      ],
      assessmentQuestions: [
        '多様な意見が尊重されていますか？',
        '誰もが安心して発言できる環境ですか？',
        '公平な評価と機会提供がありますか？',
        '異なる視点が意思決定に活かされていますか？',
      ],
    },
    {
      id: 'risk-tolerance',
      name: 'リスク許容度',
      description: '不確実性とリスクに対する組織の姿勢',
      impact: 'high',
      examples: [
        '革新への積極性',
        '失敗に対する寛容性',
        '実験と学習の文化',
        '安定性 vs 変化への適応性',
      ],
      assessmentQuestions: [
        '新しい取り組みに対してオープンですか？',
        '失敗から学ぶ文化がありますか？',
        '計算されたリスクを取ることができますか？',
        '変化を機会として捉えていますか？',
      ],
    },
    {
      id: 'communication',
      name: 'コミュニケーション文化',
      description: '情報共有と対話の質とパターン',
      impact: 'high',
      examples: [
        'オープンな情報共有',
        '建設的なフィードバック',
        '階層を超えたコミュニケーション',
        '透明性と信頼関係',
      ],
      assessmentQuestions: [
        '情報は適切に共有されていますか？',
        '率直な対話ができる環境ですか？',
        'フィードバック文化が根付いていますか？',
        '信頼関係が構築されていますか？',
      ],
    },
    {
      id: 'learning',
      name: '学習・成長志向',
      description: '継続的学習と人材成長への組織の取り組み',
      impact: 'medium',
      examples: ['継続的な学習機会', '知識共有の促進', '成長への投資', 'イノベーション推進'],
      assessmentQuestions: [
        '学習機会が充実していますか？',
        '知識共有が奨励されていますか？',
        '成長への投資が行われていますか？',
        '新しいアイデアが歓迎されますか？',
      ],
    },
    {
      id: 'collaboration',
      name: 'コラボレーション',
      description: 'チームワークと協働への姿勢',
      impact: 'medium',
      examples: ['部門間協力', 'チームワーク重視', '共通目標への取り組み', '相互支援の文化'],
      assessmentQuestions: [
        '部門間の協力は良好ですか？',
        'チームワークが重視されていますか？',
        '共通目標に向けて連携していますか？',
        '相互支援の文化がありますか？',
      ],
    },
  ]

  // 変革支援行動
  const supportingBehaviors: SupportingBehavior[] = [
    {
      category: 'コミュニケーション',
      dos: [
        '明確で一貫したメッセージを伝える',
        '双方向のコミュニケーションを促進する',
        '定期的な進捗共有を行う',
        '質問や懸念に迅速に対応する',
        '成功事例を積極的に共有する',
      ],
      donts: [
        'あいまいな表現や専門用語の多用',
        '一方通行のコミュニケーション',
        '情報の隠蔽や遅延',
        '批判的な意見の無視',
        '過度な楽観論の押し付け',
      ],
    },
    {
      category: 'リーダーシップ',
      dos: [
        '変革への強いコミットメントを示す',
        '現場に出て直接対話する',
        '率先垂範で行動する',
        '適切なリソースとサポートを提供する',
        '成果を認識し称賛する',
      ],
      donts: [
        '口先だけのサポート',
        '現場の現実を無視した指示',
        '一貫性のない行動',
        '必要なリソースの出し惜しみ',
        '失敗に対する過度な処罰',
      ],
    },
    {
      category: 'プロセス管理',
      dos: [
        '段階的で現実的なマイルストーンを設定する',
        '早期の小さな成功を積み重ねる',
        '定期的な評価と軌道修正を行う',
        '変革チームとの連携を強化する',
        '持続可能な仕組みを構築する',
      ],
      donts: [
        '過度に野心的な目標設定',
        '完璧を求めすぎる',
        '計画の硬直的な実行',
        '変革チームの孤立',
        '短期的な成果のみに集中',
      ],
    },
    {
      category: '人材育成',
      dos: [
        '必要なスキルトレーニングを提供する',
        'コーチングとメンタリングを実施する',
        '心理的安全性を確保する',
        '個人の成長機会を創出する',
        'フィードバック文化を醸成する',
      ],
      donts: [
        '一律な研修プログラム',
        '学習機会の不平等な提供',
        '失敗を責める文化',
        '個人のニーズを無視した育成',
        '評価とフィードバックの不備',
      ],
    },
  ]

  // Brightline Transformation Compass要素
  const brightlineElements: BrightlineElement[] = [
    {
      id: 'purpose',
      name: '明確な目的 (Clear Purpose)',
      description: '変革の理由と目指すべき未来像を明確に定義する',
      keyPractices: [
        '変革の「なぜ」を明確に定義する',
        'ビジョンとミッションを整合させる',
        'ステークホルダーへの価値提案を明確化する',
        '成功の定義を具体的に設定する',
      ],
    },
    {
      id: 'leadership',
      name: '強力なリーダーシップ (Strong Leadership)',
      description: '変革をリードする強力なリーダーシップの確立',
      keyPractices: [
        'スポンサーとチャンピオンの特定',
        'リーダーシップ連合の形成',
        '一貫したメッセージとコミットメント',
        '現場での可視的なサポート',
      ],
    },
    {
      id: 'engagement',
      name: '積極的な関与 (Active Engagement)',
      description: 'ステークホルダーの積極的な参加と関与の促進',
      keyPractices: [
        'ステークホルダー分析と関与戦略',
        '参加型の計画とデザイン',
        '継続的なコミュニケーション',
        'フィードバックループの構築',
      ],
    },
    {
      id: 'capability',
      name: '能力構築 (Capability Building)',
      description: '変革を実行するために必要な能力の構築',
      keyPractices: [
        'スキルギャップの特定と対策',
        '段階的な能力開発プログラム',
        '実践的な学習機会の提供',
        'パフォーマンス支援システム',
      ],
    },
    {
      id: 'measurement',
      name: '測定と監視 (Measurement & Monitoring)',
      description: '進捗の測定と継続的な監視システムの構築',
      keyPractices: [
        'KPIと成功指標の設定',
        '定期的な進捗レビュー',
        'データ駆動型の意思決定',
        '軌道修正メカニズム',
      ],
    },
  ]

  // ADKARプログレス更新
  const updateAdkarProgress = (stageId: string, progress: number) => {
    setAdkarProgress((prev) => ({
      ...prev,
      [stageId]: progress,
    }))
  }

  // 文化評価スコア更新
  const updateCultureAssessment = (factorId: string, score: number) => {
    setCultureAssessment((prev) => ({
      ...prev,
      [factorId]: score,
    }))
  }

  // 文化評価開始
  const startCultureAssessment = () => {
    setAssessmentMode(true)
    setCurrentAssessmentIndex(0)
    setCultureAssessment({})
  }

  // 評価完了
  const completeAssessment = () => {
    setAssessmentMode(false)
    const averageScore =
      Object.values(cultureAssessment).reduce((a, b) => a + b, 0) /
      Object.values(cultureAssessment).length
    alert(
      `文化評価完了！\n総合スコア: ${averageScore.toFixed(1)}/5.0\n\n${averageScore >= 4 ? '変革に適した文化環境です' : averageScore >= 3 ? '文化的な準備が部分的に整っています' : '文化変革から始めることを推奨します'}`
    )
  }

  // 総合ADKAR進捗計算
  const calculateOverallAdkarProgress = () => {
    const stages = Object.keys(adkarProgress)
    if (stages.length === 0) {
      return 0
    }
    return stages.reduce((sum, stage) => sum + adkarProgress[stage], 0) / stages.length
  }

  // ADKARステージコンポーネント
  const ADKARStageCard: React.FC<{ stage: ADKARStage; progress: number }> = ({
    stage,
    progress,
  }) => (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div>
            <span className='text-lg font-bold text-blue-600'>{stage.name}</span>
            <span className='ml-2 text-lg font-bold text-gray-800'>({stage.nameJa})</span>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-blue-600'>{progress}%</div>
            <Progress value={progress} className='h-2 w-20' />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-gray-700'>{stage.description}</p>

        <div>
          <h4 className='mb-2 flex items-center font-semibold'>
            <Target className='mr-2 h-4 w-4' />
            主要アクション
          </h4>
          <ul className='space-y-1'>
            {stage.keyActions.map((action, index) => (
              <li key={index} className='flex items-start space-x-2'>
                <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                <span className='text-sm'>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className='mb-2 flex items-center font-semibold'>
            <BarChart3 className='mr-2 h-4 w-4' />
            成功指標
          </h4>
          <ul className='space-y-1'>
            {stage.successIndicators.map((indicator, index) => (
              <li key={index} className='flex items-start space-x-2'>
                <Award className='mt-0.5 h-4 w-4 text-blue-500' />
                <span className='text-sm'>{indicator}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className='mb-2 flex items-center font-semibold'>
            <AlertTriangle className='mr-2 h-4 w-4' />
            潜在的な障壁
          </h4>
          <ul className='space-y-1'>
            {stage.barriers.map((barrier, index) => (
              <li key={index} className='flex items-start space-x-2'>
                <AlertTriangle className='mt-0.5 h-4 w-4 text-red-500' />
                <span className='text-sm'>{barrier}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className='mb-2 flex items-center font-semibold'>
            <Settings className='mr-2 h-4 w-4' />
            推奨ツール
          </h4>
          <div className='flex flex-wrap gap-1'>
            {stage.tools.map((tool, index) => (
              <Badge key={index} variant='outline' className='text-xs'>
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        <div className='pt-4'>
          <label className='mb-2 block text-sm font-medium'>進捗設定:</label>
          <div className='flex space-x-2'>
            {[0, 25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                variant={progress === value ? 'default' : 'outline'}
                size='sm'
                onClick={() => updateAdkarProgress(stage.id, value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // 文化評価コンポーネント
  const CultureAssessmentCard: React.FC<{ factor: CultureFactor }> = ({ factor }) => {
    const score = cultureAssessment[factor.id] || 0

    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Users className='h-5 w-5' />
              <span>{factor.name}</span>
            </div>
            <Badge
              variant={
                factor.impact === 'high'
                  ? 'destructive'
                  : factor.impact === 'medium'
                    ? 'default'
                    : 'secondary'
              }
            >
              影響度: {factor.impact === 'high' ? '高' : factor.impact === 'medium' ? '中' : '低'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-gray-700'>{factor.description}</p>

          <div>
            <h4 className='mb-2 font-semibold'>具体例:</h4>
            <ul className='space-y-1'>
              {factor.examples.map((example, index) => (
                <li key={index} className='flex items-start space-x-2'>
                  <Lightbulb className='mt-0.5 h-4 w-4 text-yellow-500' />
                  <span className='text-sm'>{example}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className='mb-2 font-semibold'>評価項目:</h4>
            <div className='space-y-2'>
              {factor.assessmentQuestions.map((question, index) => (
                <div key={index} className='rounded bg-gray-50 p-2 text-sm'>
                  {question}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>現在のスコア: {score}/5</label>
            <div className='flex space-x-1'>
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant={score >= value ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => updateCultureAssessment(factor.id, value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <Progress value={score * 20} className='mt-2 w-full' />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className='space-y-4 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>組織文化と変更管理</h1>
        <p className='mx-auto max-w-4xl text-lg text-gray-600'>
          組織文化の理解と変更管理のフレームワークを学び、
          プロジェクトの成功に必要な組織変革のスキルを習得します。
        </p>
        <div className='flex justify-center space-x-2'>
          <Badge variant='outline'>ECO 3.4.1 組織文化</Badge>
          <Badge variant='outline'>ECO 3.4.2 変更管理</Badge>
          <Badge variant='outline'>ECO 3.4.3 コンプライアンス</Badge>
        </div>
      </div>

      {/* 概要カード */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <RefreshCw className='h-6 w-6' />
            <span>変更管理の重要性</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='space-y-2 text-center'>
              <div className='text-3xl font-bold text-red-600'>70%</div>
              <p className='text-sm text-gray-600'>変革プロジェクトの失敗率</p>
            </div>
            <div className='space-y-2 text-center'>
              <div className='text-3xl font-bold text-blue-600'>5倍</div>
              <p className='text-sm text-gray-600'>優れた変更管理の成功確率向上</p>
            </div>
            <div className='space-y-2 text-center'>
              <div className='text-3xl font-bold text-green-600'>143%</div>
              <p className='text-sm text-gray-600'>ROI改善効果</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タブナビゲーション */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>概要</TabsTrigger>
          <TabsTrigger value='adkar'>ADKARモデル</TabsTrigger>
          <TabsTrigger value='culture'>組織文化</TabsTrigger>
          <TabsTrigger value='behaviors'>支援行動</TabsTrigger>
          <TabsTrigger value='brightline'>Brightline</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Users className='h-5 w-5' />
                  <span>PMによる変更管理</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-gray-700'>
                  プロジェクトマネージャーは変革の推進者として、組織とチームの変化を効果的に管理する責任があります。
                </p>
                <ul className='space-y-2'>
                  <li className='flex items-start space-x-2'>
                    <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                    <span className='text-sm'>変化への準備状況の評価</span>
                  </li>
                  <li className='flex items-start space-x-2'>
                    <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                    <span className='text-sm'>抵抗の特定と対処</span>
                  </li>
                  <li className='flex items-start space-x-2'>
                    <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                    <span className='text-sm'>コミュニケーション戦略の策定</span>
                  </li>
                  <li className='flex items-start space-x-2'>
                    <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                    <span className='text-sm'>継続的な支援とフォローアップ</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Globe className='h-5 w-5' />
                  <span>組織文化の要素</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-gray-700'>
                  組織文化は見えない力として、プロジェクトの成功に大きな影響を与えます。
                </p>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='flex items-center space-x-2'>
                    <Heart className='h-4 w-4 text-red-500' />
                    <span className='text-sm'>価値観</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Brain className='h-4 w-4 text-blue-500' />
                    <span className='text-sm'>信念</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Users className='h-4 w-4 text-green-500' />
                    <span className='text-sm'>行動規範</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Settings className='h-4 w-4 text-purple-500' />
                    <span className='text-sm'>慣習</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Lightbulb className='h-4 w-4' />
            <AlertDescription>
              <strong>重要ポイント:</strong>
              組織変革の成功は技術的な要素だけでなく、人的要素（組織文化、個人の準備状況、リーダーシップ）に大きく依存します。
              効果的な変更管理は、これらの要素を統合的にアプローチすることが鍵となります。
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* ADKARモデルタブ */}
        <TabsContent value='adkar' className='space-y-6'>
          <div className='space-y-4 text-center'>
            <h2 className='text-2xl font-bold'>ADKARモデル</h2>
            <p className='mx-auto max-w-3xl text-gray-600'>
              個人レベルの変革を体系的に管理するフレームワーク。
              5つの段階を順次クリアすることで、持続的な変革を実現します。
            </p>
            <div className='flex justify-center'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-blue-600'>
                  {calculateOverallAdkarProgress().toFixed(0)}%
                </div>
                <div className='text-gray-600'>総合進捗</div>
                <Progress value={calculateOverallAdkarProgress()} className='mt-2 w-40' />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
            {adkarStages.map((stage) => (
              <ADKARStageCard
                key={stage.id}
                stage={stage}
                progress={adkarProgress[stage.id] || 0}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ADKAR実装のヒント</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <h4 className='mb-3 font-semibold text-green-600'>成功要因</h4>
                  <ul className='space-y-2'>
                    <li className='flex items-start space-x-2'>
                      <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                      <span className='text-sm'>各段階の順序を守る</span>
                    </li>
                    <li className='flex items-start space-x-2'>
                      <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                      <span className='text-sm'>個人別にカスタマイズ</span>
                    </li>
                    <li className='flex items-start space-x-2'>
                      <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                      <span className='text-sm'>継続的な測定と調整</span>
                    </li>
                    <li className='flex items-start space-x-2'>
                      <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                      <span className='text-sm'>マネージャーの積極的関与</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-3 font-semibold text-red-600'>よくある失敗</h4>
                  <ul className='space-y-2'>
                    <li className='flex items-start space-x-2'>
                      <AlertTriangle className='mt-0.5 h-4 w-4 text-red-500' />
                      <span className='text-sm'>段階をスキップする</span>
                    </li>
                    <li className='flex items-start space-x-2'>
                      <AlertTriangle className='mt-0.5 h-4 w-4 text-red-500' />
                      <span className='text-sm'>一律的なアプローチ</span>
                    </li>
                    <li className='flex items-start space-x-2'>
                      <AlertTriangle className='mt-0.5 h-4 w-4 text-red-500' />
                      <span className='text-sm'>測定の不備</span>
                    </li>
                    <li className='flex items-start space-x-2'>
                      <AlertTriangle className='mt-0.5 h-4 w-4 text-red-500' />
                      <span className='text-sm'>支援の不足</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 組織文化タブ */}
        <TabsContent value='culture' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold'>組織文化評価</h2>
              <p className='text-gray-600'>変革の準備状況を評価し、文化的な課題を特定します。</p>
            </div>
            <Button onClick={startCultureAssessment}>
              <BarChart3 className='mr-2 h-4 w-4' />
              文化評価を開始
            </Button>
          </div>

          {assessmentMode ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  文化評価進行中... ({currentAssessmentIndex + 1}/{cultureFactors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CultureAssessmentCard factor={cultureFactors[currentAssessmentIndex]} />
                <div className='mt-6 flex justify-between'>
                  <Button variant='outline' onClick={() => setAssessmentMode(false)}>
                    評価を中断
                  </Button>
                  <div className='space-x-2'>
                    {currentAssessmentIndex > 0 && (
                      <Button
                        variant='outline'
                        onClick={() => setCurrentAssessmentIndex(currentAssessmentIndex - 1)}
                      >
                        前へ
                      </Button>
                    )}
                    {currentAssessmentIndex < cultureFactors.length - 1 ? (
                      <Button
                        onClick={() => setCurrentAssessmentIndex(currentAssessmentIndex + 1)}
                        disabled={!cultureAssessment[cultureFactors[currentAssessmentIndex].id]}
                      >
                        次へ <ArrowRight className='ml-2 h-4 w-4' />
                      </Button>
                    ) : (
                      <Button
                        onClick={completeAssessment}
                        disabled={!cultureAssessment[cultureFactors[currentAssessmentIndex].id]}
                      >
                        評価完了
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {cultureFactors.map((factor) => (
                <CultureAssessmentCard key={factor.id} factor={factor} />
              ))}
            </div>
          )}

          {Object.keys(cultureAssessment).length > 0 && !assessmentMode && (
            <Card>
              <CardHeader>
                <CardTitle>評価結果サマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {cultureFactors.map((factor) => {
                    const score = cultureAssessment[factor.id]
                    if (!score) {
                      return null
                    }

                    return (
                      <div key={factor.id} className='flex items-center justify-between'>
                        <span className='font-medium'>{factor.name}</span>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm'>{score}/5</span>
                          <Progress value={score * 20} className='h-2 w-20' />
                        </div>
                      </div>
                    )
                  })}
                  <div className='border-t pt-4'>
                    <div className='flex items-center justify-between text-lg font-bold'>
                      <span>総合スコア</span>
                      <span className='text-blue-600'>
                        {(
                          Object.values(cultureAssessment).reduce((a, b) => a + b, 0) /
                          Object.values(cultureAssessment).length
                        ).toFixed(1)}
                        /5.0
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 支援行動タブ */}
        <TabsContent value='behaviors' className='space-y-6'>
          <div className='space-y-4 text-center'>
            <h2 className='text-2xl font-bold'>変革支援行動</h2>
            <p className='mx-auto max-w-3xl text-gray-600'>
              変革を成功に導くための具体的な行動指針とベストプラクティスを学びます。
            </p>
          </div>

          <div className='space-y-6'>
            {supportingBehaviors.map((behavior, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <MessageSquare className='h-5 w-5' />
                    <span>{behavior.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div>
                      <h4 className='mb-3 flex items-center font-semibold text-green-600'>
                        <CheckCircle className='mr-2 h-4 w-4' />
                        推奨行動 (Do's)
                      </h4>
                      <ul className='space-y-2'>
                        {behavior.dos.map((item, itemIndex) => (
                          <li key={itemIndex} className='flex items-start space-x-2'>
                            <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                            <span className='text-sm'>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className='mb-3 flex items-center font-semibold text-red-600'>
                        <AlertTriangle className='mr-2 h-4 w-4' />
                        避けるべき行動 (Don'ts)
                      </h4>
                      <ul className='space-y-2'>
                        {behavior.donts.map((item, itemIndex) => (
                          <li key={itemIndex} className='flex items-start space-x-2'>
                            <AlertTriangle className='mt-0.5 h-4 w-4 text-red-500' />
                            <span className='text-sm'>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Lightbulb className='h-4 w-4' />
            <AlertDescription>
              <strong>実践のヒント:</strong>
              これらの行動指針は組織の文化とコンテキストに合わせてカスタマイズしてください。
              また、定期的にチームと行動を振り返り、継続的な改善を図ることが重要です。
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Brightlineタブ */}
        <TabsContent value='brightline' className='space-y-6'>
          <div className='space-y-4 text-center'>
            <h2 className='text-2xl font-bold'>Brightline Transformation Compass</h2>
            <p className='mx-auto max-w-3xl text-gray-600'>
              組織変革を成功に導く5つの必須要素。 PMI Brightline
              Initiativeによる変革成功の実践的フレームワークです。
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {brightlineElements.map((element, index) => (
              <Card key={element.id} className='h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <div
                      className={`rounded-lg p-2 ${
                        index === 0
                          ? 'bg-blue-100'
                          : index === 1
                            ? 'bg-green-100'
                            : index === 2
                              ? 'bg-purple-100'
                              : index === 3
                                ? 'bg-orange-100'
                                : 'bg-red-100'
                      }`}
                    >
                      {index === 0 && <Target className='h-5 w-5 text-blue-600' />}
                      {index === 1 && <Users className='h-5 w-5 text-green-600' />}
                      {index === 2 && <MessageSquare className='h-5 w-5 text-purple-600' />}
                      {index === 3 && <Zap className='h-5 w-5 text-orange-600' />}
                      {index === 4 && <BarChart3 className='h-5 w-5 text-red-600' />}
                    </div>
                    <span>{element.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-gray-700'>{element.description}</p>

                  <div>
                    <h4 className='mb-3 flex items-center font-semibold'>
                      <Compass className='mr-2 h-4 w-4' />
                      主要な実践項目
                    </h4>
                    <ul className='space-y-2'>
                      {element.keyPractices.map((practice, practiceIndex) => (
                        <li key={practiceIndex} className='flex items-start space-x-2'>
                          <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                          <span className='text-sm'>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>統合実装アプローチ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div>
                  <h4 className='mb-3 font-semibold text-blue-600'>Phase 1: 基盤構築</h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• 明確な目的の定義</li>
                    <li>• 強力なリーダーシップの確立</li>
                    <li>• 初期ステークホルダーの関与</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-3 font-semibold text-green-600'>Phase 2: 実行展開</h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• 能力構築プログラムの実施</li>
                    <li>• 積極的な関与の拡大</li>
                    <li>• 測定システムの構築</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-3 font-semibold text-purple-600'>Phase 3: 定着化</h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• 継続的な監視と改善</li>
                    <li>• 成果の測定と報告</li>
                    <li>• 学習と知識の蓄積</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Compass className='h-4 w-4' />
            <AlertDescription>
              <strong>実装のポイント:</strong>
              5つの要素は相互に関連しており、すべてがバランスよく機能することで変革の成功確率が大幅に向上します。
              定期的にこれらの要素をチェックし、弱い部分を強化していくことが重要です。
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OrganizationChangeManagement
